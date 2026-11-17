'use strict';

// Electron presents *.asar as virtual directories. Integrity checks need the physical bytes.
const fs = (() => {
  try { return require('original-fs'); }
  catch (_) { return require('node:fs'); }
})();
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { Readable, Transform } = require('node:stream');
const { pipeline } = require('node:stream/promises');
const RELEASES = 'https://github.com/RhuanLUX/Masterdashboard/releases';
const FEED = RELEASES + '/latest/download/rpg-update.json';
const RUNTIME = 1;
const MAX_ARCHIVE = 1024 * 1024 * 1024;

function compareVersions(left, right) {
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (a[i] !== b[i]) return Math.sign(a[i] - b[i]);
  }
  return 0;
}

function verifyManifest(envelope, publicKey) {
  if (typeof envelope?.payload !== 'string' || envelope.payload.length > 24000 || typeof envelope.signature !== 'string') {
    throw Error('Manifesto de atualização inválido.');
  }
  const bytes = Buffer.from(envelope.payload, 'base64');
  if (!crypto.verify(null, bytes, publicKey, Buffer.from(envelope.signature, 'base64'))) {
    throw Error('Assinatura da atualização inválida.');
  }
  const value = JSON.parse(bytes.toString('utf8'));
  if (value.schema !== 1 || !/^\d{1,4}\.\d{1,4}\.\d{1,4}$/.test(value.version)) throw Error('Versão inválida.');
  const expected = RELEASES + '/download/desktop-v' + value.version + '/RPG-Master-' + value.version + '-update.asar.gz';
  if (value.url !== expected || !Number.isInteger(value.minRuntime) || value.minRuntime < 1) throw Error('Origem de atualização inválida.');
  for (const field of ['size', 'archiveSize']) {
    if (!Number.isInteger(value[field]) || value[field] < 1 || value[field] > MAX_ARCHIVE) throw Error('Tamanho de atualização inválido.');
  }
  for (const field of ['sha256', 'archiveSha256']) {
    if (!/^[a-f0-9]{64}$/.test(value[field])) throw Error('Hash de atualização inválido.');
  }
  if (!Number.isInteger(value.electronMajor)) throw Error('Runtime inválido.');
  return value;
}

function readState(directory) {
  try { return JSON.parse(fs.readFileSync(path.join(directory, 'state.json'), 'utf8')); }
  catch (error) {
    if (error.code !== 'ENOENT') return { automatic: true, recovery: true };
    return { automatic: true };
  }
}

function writeState(directory, state) {
  fs.mkdirSync(directory, { recursive: true });
  const file = path.join(directory, 'state.json');
  const temporary = file + '.tmp';
  const handle = fs.openSync(temporary, 'w');
  try { fs.writeFileSync(handle, JSON.stringify(state)); fs.fsyncSync(handle); }
  finally { fs.closeSync(handle); }
  fs.renameSync(temporary, file);
}

function archivePath(directory, version) {
  return path.join(directory, 'versions', version, 'app.asar');
}

function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    fs.createReadStream(file).on('data', chunk => hash.update(chunk)).on('error', reject).on('end', () => resolve(hash.digest('hex')));
  });
}

function compatible(manifest, electronMajor) {
  return manifest.minRuntime <= RUNTIME && manifest.electronMajor === electronMajor;
}

// Run synchronously before Electron's ready event and before loading any downloaded code.
function selectRuntime({ directory, bundledRoot, bundledVersion, publicKey, electronMajor }) {
  const state = readState(directory);
  let restored = false;
  const inspect = envelope => {
    const manifest = verifyManifest(envelope, publicKey);
    if (!compatible(manifest, electronMajor) || compareVersions(manifest.version, bundledVersion) <= 0) return null;
    const archive = archivePath(directory, manifest.version);
    if (fs.statSync(archive).size !== manifest.archiveSize) throw Error('Arquivo de atualização incompleto.');
    // ASAR is still an ordinary file here. It becomes executable only after verification.
    const hash = crypto.createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
    if (hash !== manifest.archiveSha256) throw Error('Integridade da atualização inválida.');
    return { root: archive, version: manifest.version };
  };
  if (state.trial && state.current) {
    try { state.failedVersion = verifyManifest(state.current, publicKey).version; } catch (_) {}
    state.current = state.previous || null;
    state.previous = null;
    state.trial = false;
    restored = true;
  }
  if (state.pending) {
    try {
      const candidate = inspect(state.pending);
      if (candidate && candidate.version !== state.failedVersion) {
        const campaign = path.join(directory, '..', 'campaign', 'campaign.json');
        if (fs.existsSync(campaign)) {
          const backups = path.join(directory, '..', 'campaign', 'backups');
          fs.mkdirSync(backups, { recursive: true });
          fs.copyFileSync(campaign, path.join(backups, Date.now() + '-' + crypto.randomUUID() + '.json'), fs.constants.COPYFILE_EXCL);
        }
        state.previous = state.current || null;
        state.current = state.pending;
        state.trial = true;
      }
    } catch (_) { restored = true; }
    state.pending = null;
  }
  let selected = { root: bundledRoot, version: bundledVersion };
  if (state.current) {
    try { selected = inspect(state.current) || selected; }
    catch (_) {
      restored = true;
      state.current = state.previous || null;
      state.previous = null;
      state.trial = false;
      try { if (state.current) selected = inspect(state.current) || selected; }
      catch (_) { state.current = null; }
    }
  }
  writeState(directory, state);
  return {
    ...selected, restored,
    markHealthy() {
      const latest = readState(directory);
      latest.trial = false;
      writeState(directory, latest);
    }
  };
}

class UpdateService {
  constructor({ directory, publicKey, currentVersion, electronMajor, enabled = true, notify = () => {}, fetchImpl = fetch }) {
    Object.assign(this, { directory, publicKey, currentVersion, electronMajor, enabled, notify, fetchImpl });
    this.job = null;
    this.status = { phase: 'idle', currentVersion, automatic: readState(directory).automatic !== false, releasePage: RELEASES + '/latest' };
  }

  announce(patch) {
    this.status = { ...this.status, ...patch };
    this.notify(this.status);
    return this.status;
  }

  setAutomatic(value) {
    const state = readState(this.directory);
    state.automatic = value === true;
    writeState(this.directory, state);
    return this.announce({ automatic: state.automatic });
  }

  check(manual = false) {
    if (!this.enabled) return Promise.resolve(this.announce({ phase: 'development' }));
    if (!manual && !this.status.automatic) return Promise.resolve(this.status);
    if (this.job) return this.job;
    this.job = this.performCheck().catch(error => this.announce({ phase: 'error', message: error.message })).finally(() => { this.job = null; });
    return this.job;
  }

  async performCheck() {
    this.announce({ phase: 'checking', message: '', progress: 0 });
    let response;
    try { response = await this.fetchImpl(FEED, { signal: AbortSignal.timeout(20000), headers: { 'Cache-Control': 'no-cache' } }); }
    catch (_) { return this.announce({ phase: 'offline', message: 'Sem conexão com o servidor de atualizações. Tente novamente mais tarde.' }); }
    if (!response.ok) return this.announce({ phase: 'offline', message: 'Atualizações temporariamente indisponíveis. Tente novamente mais tarde.' });
    // Bound the signed metadata response before parsing.
    const parts = []; let bytes = 0;
    for await (const part of response.body) {
      bytes += part.length;
      if (bytes > 32768) throw Error('Manifesto de atualização excedeu o limite.');
      parts.push(part);
    }
    const envelope = JSON.parse(Buffer.concat(parts).toString('utf8'));
    const manifest = verifyManifest(envelope, this.publicKey);
    const state = readState(this.directory);
    if (compareVersions(manifest.version, this.currentVersion) <= 0) return this.announce({ phase: 'current' });
    if (state.failedVersion === manifest.version) throw Error('Esta versão falhou ao iniciar. A versão anterior foi restaurada. Aguarde uma correção.');
    if (!compatible(manifest, this.electronMajor)) return this.announce({ phase: 'installer', nextVersion: manifest.version });
    if (state.pending) {
      try {
        const pending = verifyManifest(state.pending, this.publicKey);
        if (pending.version === manifest.version && await hashFile(archivePath(this.directory, pending.version)) === pending.archiveSha256) {
          return this.announce({ phase: 'ready', nextVersion: manifest.version, progress: 100 });
        }
      } catch (_) { /* An incomplete staged file is safe to download again. */ }
    }
    return this.download(envelope, manifest);
  }

  async download(envelope, manifest) {
    this.announce({ phase: 'downloading', nextVersion: manifest.version, progress: 0 });
    const directory = path.dirname(archivePath(this.directory, manifest.version));
    await fs.promises.mkdir(directory, { recursive: true });
    const compressed = path.join(directory, 'download.gz.tmp');
    const unpacked = path.join(directory, 'app.tmp');
    const final = path.join(directory, 'app.asar');
    try {
      const response = await this.fetchImpl(manifest.url, { signal: AbortSignal.timeout(15 * 60000) });
      if (!response.ok || !response.body) throw Error('Não foi possível baixar a atualização.');
      let received = 0, progress = -1;
      const meter = new Transform({ transform: (chunk, encoding, callback) => {
        received += chunk.length;
        if (received > manifest.size) return callback(Error('Download excedeu o tamanho assinado.'));
        const next = Math.floor(received / manifest.size * 90);
        if (next !== progress) { progress = next; this.announce({ progress }); }
        callback(null, chunk);
      } });
      await pipeline(Readable.fromWeb(response.body), meter, fs.createWriteStream(compressed));
      if (received !== manifest.size || await hashFile(compressed) !== manifest.sha256) throw Error('Download incompleto ou corrompido.');
      let size = 0;
      const limit = new Transform({ transform(chunk, encoding, callback) {
        size += chunk.length;
        callback(size > manifest.archiveSize ? Error('Arquivo excedeu o tamanho assinado.') : null, chunk);
      } });
      await pipeline(fs.createReadStream(compressed), zlib.createGunzip(), limit, fs.createWriteStream(unpacked));
      if (size !== manifest.archiveSize || await hashFile(unpacked) !== manifest.archiveSha256) throw Error('Arquivo de atualização corrompido.');
      await fs.promises.rename(unpacked, final);
      const state = readState(this.directory);
      state.pending = envelope;
      writeState(this.directory, state);
      return this.announce({ phase: 'ready', progress: 100 });
    } finally {
      await fs.promises.rm(compressed, { force: true });
      await fs.promises.rm(unpacked, { force: true });
    }
  }
}

module.exports = { UpdateService, selectRuntime, verifyManifest, compareVersions, readState, writeState, archivePath, RUNTIME, FEED };
