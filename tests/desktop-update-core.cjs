'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { UpdateService, selectRuntime, verifyManifest, readState, writeState, archivePath, FEED } = require('../desktop/update-core.cjs');

(async () => {
  const directory = path.resolve('test-results/update-core-' + crypto.randomUUID());
  const keys = crypto.generateKeyPairSync('ed25519');
  const bytes = Buffer.from('signed application fixture');
  const gzip = zlib.gzipSync(bytes);
  const sha256 = buffer => crypto.createHash('sha256').update(buffer).digest('hex');
  const payload = { schema: 1, version: '4.5.1', minRuntime: 1, electronMajor: 45,
    url: 'https://github.com/RhuanLUX/Masterdashboard/releases/download/desktop-v4.5.1/RPG-Master-4.5.1-update.asar.gz',
    size: gzip.length, archiveSize: bytes.length, sha256: sha256(gzip), archiveSha256: sha256(bytes) };
  const sign = value => { const b = Buffer.from(JSON.stringify(value)); return { payload: b.toString('base64'), signature: crypto.sign(null, b, keys.privateKey).toString('base64') }; };
  const envelope = sign(payload);
  const options = { directory, publicKey: keys.publicKey, currentVersion: '4.5.0', electronMajor: 45 };
  const runtimeOptions = { directory, publicKey: keys.publicKey, bundledRoot: 'BUNDLED', bundledVersion: '4.5.0', electronMajor: 45 };
  let downloads = 0;
  const fetchImpl = async url => { if (url === FEED) return new Response(JSON.stringify(envelope)); downloads++; return new Response(gzip); };
  const service = new UpdateService({ ...options, fetchImpl });
  assert.equal((await service.check(true)).phase, 'ready');
  assert.deepEqual(fs.readFileSync(archivePath(directory, payload.version)), bytes);
  assert.equal((await service.check(true)).phase, 'ready'); assert.equal(downloads, 1);
  assert.equal(readState(directory).pending.payload, envelope.payload);
  const selected = selectRuntime(runtimeOptions); assert.equal(selected.version, '4.5.1'); assert(readState(directory).trial);
  selected.markHealthy(); assert.equal(readState(directory).trial, false);
  assert.equal(selectRuntime(runtimeOptions).version, '4.5.1');
  // Verify the package again on every launch, even after its first healthy boot.
  fs.appendFileSync(archivePath(directory, payload.version), 'corruption');
  assert.equal(selectRuntime(runtimeOptions).root, 'BUNDLED');
  fs.writeFileSync(archivePath(directory, payload.version), bytes);
  writeState(directory, { automatic: true, pending: envelope });
  selectRuntime(runtimeOptions); // Candidate did not confirm readiness before exiting.
  const fallback = selectRuntime(runtimeOptions); assert.equal(fallback.root, 'BUNDLED'); assert(fallback.restored);
  assert.equal(readState(directory).failedVersion, '4.5.1');
  assert.equal((await service.check(true)).phase, 'error');
  assert.throws(() => verifyManifest({ ...envelope, signature: Buffer.alloc(64).toString('base64') }, keys.publicKey));
  assert.throws(() => verifyManifest(sign({ ...payload, url: 'https://other.example/update.gz' }), keys.publicKey));
  assert.throws(() => verifyManifest(sign({ ...payload, version: '../escape' }), keys.publicKey));
  writeState(directory, { automatic: true });
  for (const corrupt of [gzip.subarray(0, 12), Buffer.concat([gzip, Buffer.alloc(20)])]) {
    const broken = new UpdateService({ ...options, fetchImpl: async url => new Response(url === FEED ? JSON.stringify(envelope) : corrupt) });
    assert.equal((await broken.check(true)).phase, 'error'); assert.equal(readState(directory).pending, undefined);
  }
  const noNetwork = new UpdateService({ ...options, fetchImpl: async () => { throw Error('offline'); } });
  assert.equal((await noNetwork.check(true)).phase, 'offline');
  const runtime = sign({ ...payload, minRuntime: 2 });
  const requiresInstaller = new UpdateService({ ...options, fetchImpl: async () => new Response(JSON.stringify(runtime)) });
  assert.equal((await requiresInstaller.check(true)).phase, 'installer');
  let checks = 0;
  const concurrent = new UpdateService({ ...options, fetchImpl: async url => { checks++; await new Promise(r => setTimeout(r, 10)); return fetchImpl(url); } });
  await Promise.all([concurrent.check(true), concurrent.check(true)]); assert.equal(checks, 2);
  concurrent.setAutomatic(false); assert.equal((await concurrent.check()).automatic, false);
  const updatedInstaller = selectRuntime({ ...runtimeOptions, bundledVersion: '4.6.0' }); assert.equal(updatedInstaller.version, '4.6.0');
  console.log('DESKTOP_UPDATE_CORE_PASS signature, origin, integrity, interrupted download, staging, activation, rollback, retry, concurrent checks, offline, preferences, runtime upgrade');
})().catch(error => { console.error(error); process.exitCode = 1; });
