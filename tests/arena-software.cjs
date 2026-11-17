/* Regression for Mac Intel runners that use Pixi's software Canvas renderer. */
const { chromium } = require('playwright');
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const url = 'http://127.0.0.1:43986';
(async () => {
  const server = spawn(process.execPath, ['js/offline-server.mjs', '43986'], { cwd: root, windowsHide: true });
  let browser;
  try {
    await new Promise((resolve, reject) => { server.stdout.once('data', resolve); server.once('error', reject); });
    browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.stack));
    await page.goto(url + '/tests/arena-visual.html');
    await page.evaluate(() => {
      const base = document.createElement('base'); base.href = '/'; document.head.prepend(base);
      const init = PIXI.Application.prototype.init;
      PIXI.Application.prototype.init = function (options) { return init.call(this, { ...options, preference: 'canvas' }); };
    });
    const scenes = [];
    for (const id of ['mordor', 'fangorn', 'rivendell', 'road', 'hrim']) {
      const result = await page.evaluate(async id => {
        window.qaScene?.destroy();
        window.qaScene = await RPGBattlePixi.mount(document.querySelector('#qa'), qaParticipants(4, 4), { environment: { id, seed: 19, epoch: 0 } });
        RPGBattlePixi.flash(qaScene, 'a1', 'e0', 'magic', '', { spell: 'hurricane' });
        return { id, meshPipe: !!qaScene.app.renderer.renderPipes.mesh, background: qaScene.layers.distant.children[0].constructor.name, issues: qaScene.audit().issues };
      }, id);
      await page.waitForTimeout(1300);
      assert.equal(result.meshPipe, false);
      assert.deepEqual(result.issues, []);
      scenes.push(result);
    }
    assert.deepEqual(errors, []);
    fs.mkdirSync('docs/qa-installers', { recursive: true });
    fs.writeFileSync('docs/qa-installers/software-renderer.json', JSON.stringify({ scenes, errors }, null, 2));
    console.log('ARENA_SOFTWARE_PASS', scenes.length, 'scenes with hurricane');
  } finally { await browser?.close(); server.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
