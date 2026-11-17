'use strict';

const { app } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const { selectRuntime, UpdateService } = require('./update-core.cjs');

const qaProfile = process.argv.find(argument => argument.startsWith('--rpg-profile='));
if (qaProfile) app.setPath('userData', path.resolve(qaProfile.slice(14)));

// Acquire the lock before examining trial state. A second click must not roll back a running update.
if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  const bundledRoot = path.resolve(__dirname, '..');
  const bundledVersion = require('../package.json').version;
  const publicKey = fs.readFileSync(path.join(__dirname, 'update-public.pem'), 'utf8');
  const directory = path.join(app.getPath('userData'), 'updates');
  const electronMajor = Number(process.versions.electron.split('.')[0]);
  const runtime = selectRuntime({ directory, bundledRoot, bundledVersion, publicKey, electronMajor });
  const updates = new UpdateService({ directory, publicKey, currentVersion: runtime.version, electronMajor, enabled: app.isPackaged && !qaProfile });
  global.RPG_APP_CONTEXT = Object.freeze({ ...runtime, updates, bundledVersion });
  require(path.join(runtime.root, 'desktop/main.cjs'));
}
