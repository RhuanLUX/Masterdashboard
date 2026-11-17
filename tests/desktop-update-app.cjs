'use strict';
const { _electron: electron } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const http = require('node:http');
const assert = require('node:assert/strict');
const asar = require(require.resolve('@electron/asar', { paths: [path.dirname(require.resolve('electron-builder/package.json'))] }));
const { readState, writeState, archivePath } = require('../desktop/update-core.cjs');

(async () => {
  const root = path.resolve(__dirname, '..');
  const temp = path.join(root, 'test-results', 'update-app-' + crypto.randomUUID());
  const profile = path.join(temp, 'profile');
  const host = path.join(temp, 'host');
  const directory = path.join(profile, 'updates');
  const manifestPath = path.join(root, 'dist/rpg-update.json');
  const envelope = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const manifest = JSON.parse(Buffer.from(envelope.payload, 'base64').toString('utf8'));
  const archive = path.join(root, 'dist/RPG-Master-' + manifest.version + '-update.asar');
  const compressed = archive + '.gz';
  asar.extractAll(archive, host);
  const pkg = JSON.parse(fs.readFileSync(path.join(host, 'package.json'), 'utf8'));
  pkg.version = '4.4.9';
  fs.writeFileSync(path.join(host, 'package.json'), JSON.stringify(pkg));
  let app;
  const server = http.createServer((request, response) => {
    const file = request.url === '/manifest' ? manifestPath : compressed;
    response.setHeader('Content-Length', fs.statSync(file).size);
    fs.createReadStream(file).pipe(response);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const errors = [];
  async function open() {
    app = await electron.launch({ args: [host, '--rpg-profile=' + profile, '--disable-gpu-sandbox'] });
    const page = await app.firstWindow();
    page.on('pageerror', error => errors.push(error.message));
    await page.waitForSelector('[data-enter-adventure]', { timeout: 60000 });
    await page.locator('[data-enter-adventure]').click();
    await page.evaluate(() => RPGMasterHost.setView('settings'));
    await page.waitForSelector('[data-desktop-updates]');
    await page.waitForTimeout(500);
    return page;
  }
  try {
    let page = await open();
    assert.equal((await page.evaluate(() => RPGDesktop.updateStatus())).currentVersion, '4.4.9');
    await page.evaluate(() => { RPGMasterHost.getState().characters.elenya.notes = ['Campanha preservada durante atualização']; RPGMasterHost.persist(); return RPGStorage.flush(); });
    // Download through the production service, with an offline fixture transport only.
    const downloaded = await app.evaluate(async ({}, origin) => {
      const { updates } = global.RPG_APP_CONTEXT;
      updates.enabled = true;
      updates.fetchImpl = url => fetch(origin + (url.endsWith('rpg-update.json') ? '/manifest' : '/package'));
      return updates.check(true);
    }, origin);
    assert.equal(downloaded.phase, 'ready');
    await page.waitForSelector('[data-update-restart]:not([hidden])');
    await page.screenshot({ path: path.join(temp, 'update-ready.png') });
    await app.close(); app = null;
    page = await open();
    assert.equal((await page.evaluate(() => RPGDesktop.updateStatus())).currentVersion, manifest.version);
    assert.equal(await app.evaluate(() => global.RPG_APP_CONTEXT.root.endsWith('.asar')), true);
    assert.equal(await page.evaluate(() => RPGMasterHost.getState().characters.elenya.notes[0]), 'Campanha preservada durante atualização');
    assert.equal(readState(directory).trial, false);
    // Renderer, arena and public TV are served from the verified external ASAR.
    await page.evaluate(() => { const s=RPGMasterHost.getState(), c=RPGV3.createCombat(s,{title:'Atualização verificada'}); RPGV3.addParticipant(c,{sourceType:'character',sourceId:'calion',team:'left'}); RPGV3.addParticipant(c,{sourceType:'creature',sourceId:'goblin-arqueiro',team:'right'}); RPGBattle.ensure(s); RPGMasterHost.persist(); RPGMasterUI.open('combat'); });
    await page.waitForSelector('[data-pixi-arena] canvas', { timeout: 60000 });
    const popup = app.waitForEvent('window'); await page.locator('[data-arena-present]').click();
    const tv = await popup; await tv.waitForSelector('canvas', { timeout: 60000 });
    assert.equal(await tv.evaluate(() => typeof RPGDesktop), 'undefined'); await tv.close();
    await app.close(); app = null;
    page = await open(); assert.equal((await page.evaluate(() => RPGDesktop.updateStatus())).currentVersion, manifest.version);
    await app.close(); app = null;
    // Invalid archive must fall back before requiring any of its code.
    fs.appendFileSync(archivePath(directory, manifest.version), 'invalid');
    page = await open(); assert.equal((await page.evaluate(() => RPGDesktop.updateStatus())).currentVersion, '4.4.9');
    assert.equal(await page.evaluate(() => RPGMasterHost.getState().characters.elenya.notes[0]), 'Campanha preservada durante atualização');
    await app.close(); app = null;
    // A boot that did not report healthy also reverts on the following launch.
    fs.copyFileSync(archive, archivePath(directory, manifest.version));
    writeState(directory, { automatic: true, current: envelope, trial: true });
    page = await open(); assert.equal((await page.evaluate(() => RPGDesktop.updateStatus())).currentVersion, '4.4.9');
    assert.equal(readState(directory).failedVersion, manifest.version);
    assert.deepEqual(errors, []);
    fs.mkdirSync(path.join(root, 'docs/qa-installers'), { recursive: true });
    fs.copyFileSync(path.join(temp, 'update-ready.png'), path.join(root, 'docs/qa-installers/update-ready.png'));
    fs.writeFileSync(path.join(root, 'docs/qa-installers/update-app.json'), JSON.stringify({ downloadVerified:true, installedVersion:manifest.version, externalAsar:true, persistenceAfterUpdate:true, arenaAndTV:true, healthyRestart:true, corruptArchiveRollback:true, failedBootRollback:true, errors }, null, 2));
    console.log('DESKTOP_UPDATE_APP_PASS verified download, actual ASAR boot, campaign persistence, arena, TV, restart and rollback');
  } finally { await app?.close(); await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
