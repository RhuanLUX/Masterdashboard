'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const zlib = require('node:zlib');
const { pipeline } = require('node:stream/promises');
const { execFileSync } = require('node:child_process');
const asar = require(require.resolve('@electron/asar', { paths: [path.dirname(require.resolve('electron-builder/package.json'))] }));
const { verifyManifest, RUNTIME } = require('../desktop/update-core.cjs');

async function packageUpdate() {
  const root = path.resolve(__dirname, '..');
  const pkg = require('../package.json');
  const version = pkg.version;
  const output = path.join(root, 'dist');
  const staging = path.join(root, 'test-results', 'update-package-' + crypto.randomUUID());
  fs.mkdirSync(staging, { recursive: true });
  // The application is entirely local JavaScript and assets. No native dependencies are included.
  const files = pkg.build.files.filter(file => !file.includes('*'));
  const directories = pkg.build.files.filter(file => file.endsWith('/**/*')).map(file => file.slice(0, -5));
  for (const entry of [...files, ...directories]) {
    const target = path.join(staging, entry);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.cpSync(path.join(root, entry), target, { recursive: true, dereference: true });
  }
  fs.mkdirSync(output, { recursive: true });
  const archive = path.join(output, 'RPG-Master-' + version + '-update.asar');
  const compressed = archive + '.gz';
  try {
    await asar.createPackage(staging, archive);
    await pipeline(fs.createReadStream(archive), zlib.createGzip({ level: 6 }), fs.createWriteStream(compressed));
    const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
    const manifest = {
      schema: 1, version, minRuntime: RUNTIME,
      sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
      electronMajor: Number(pkg.devDependencies.electron.split('.')[0]),
      url: 'https://github.com/RhuanLUX/Masterdashboard/releases/download/desktop-v' + version + '/' + path.basename(compressed),
      size: fs.statSync(compressed).size, sha256: hash(compressed),
      archiveSize: fs.statSync(archive).size, archiveSha256: hash(archive),
      publishedAt: new Date().toISOString()
    };
    const key = process.env.RPG_UPDATE_SIGNING_KEY || fs.readFileSync(path.join(root, '.release-private/update-private.pem'), 'utf8');
    const bytes = Buffer.from(JSON.stringify(manifest));
    const envelope = { payload: bytes.toString('base64'), signature: crypto.sign(null, bytes, key).toString('base64') };
    verifyManifest(envelope, fs.readFileSync(path.join(root, 'desktop/update-public.pem'), 'utf8'));
    fs.writeFileSync(path.join(output, 'rpg-update.json'), JSON.stringify(envelope, null, 2));
    console.log('SIGNED_UPDATE_READY', version, Math.round(manifest.size / 1024 / 1024) + ' MB');
  } finally {
    // UUID staging is always a child of this workspace's test-results.
    fs.rmSync(staging, { recursive: true, force: true });
  }
}

if (require.main === module) packageUpdate().catch(error => { console.error(error.message); process.exitCode = 1; });
module.exports = { packageUpdate };
