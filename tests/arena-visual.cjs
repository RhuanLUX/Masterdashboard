/* Browser QA of the actual Pixi renderer; isolated fixtures, no user storage. */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const phase = process.argv[2] || 'after';
const root = path.resolve(__dirname, '..');
const out = process.env.ARENA_QA_OUTPUT ? path.resolve(root,process.env.ARENA_QA_OUTPUT) : path.join(root, 'docs', 'qa-v3.2.1', phase);
const url = 'http://127.0.0.1:43992';
async function run() {
  fs.mkdirSync(out, { recursive: true });
  const server = spawn(process.execPath, ['js/offline-server.mjs', '43992'], { cwd: root, windowsHide: true });
  let browser;
  try {
    await new Promise((resolve,reject)=>{ server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',code=>reject(Error('server exited '+code))); });
    browser=await chromium.launch({ executablePath: process.env.ARENA_QA_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
    const page=await browser.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    const results=[];
    for(const [width,height] of [[1920,1080],[1366,768],[1280,800]]){
      await page.setViewportSize({width,height});
      await page.goto(url+'/tests/arena-visual.html');
      // Resolve relative sprite paths exactly as in the real root-level application.
      await page.evaluate(()=>{const base=document.createElement('base');base.href='/';document.head.prepend(base)});
      for(const [a,b] of [[4,1],[4,4],[4,8],[10,10],...(phase==='after'?[[4,16]]:[])]){
        const count=await page.evaluate(([a,b])=>qaMount(a,b),[a,b]);
        await page.waitForTimeout(200);
        const bounds=await page.evaluate(()=>qaScene.audit?.()||null);
        await page.screenshot({path:path.join(out,`${width}x${height}-${a}v${b}.png`),fullPage:true});
        results.push({width,height,a,b,count,bounds});
        if(count!==a+b)throw Error('Missing participants');
        if(bounds?.issues?.length)throw Error(JSON.stringify(bounds.issues));
        if(phase==='after')await page.evaluate(()=>{
          for(const a of qaScene.actors.values()){
            for(let frame=0;frame<a.frames.length;frame++){
              a.sprite.gotoAndStop(frame);
              const f=a.frames[frame],offset=(f.footY-a.sprite.anchor.y*a.sprite.texture.height)*a.baseScale;
              if(Math.abs(offset)>.01)throw Error('Foot anchor mismatch '+a.p.id+' frame '+frame);
            }a.sprite.gotoAndStop(0);
          }
        });
      }
    }
    for(const kind of ['melee','ranged','magic','heal','fail','critical']){
      await page.evaluate(kind=>RPGBattlePixi.flash(qaScene,'a0','e0',kind,kind),kind);
      await page.waitForTimeout(260);
      if(phase==='after'&&kind==='magic')await page.screenshot({path:path.join(out,'action-magic.png')});
      await page.waitForTimeout(500);
      if(phase==='after')await page.evaluate(()=>{if(qaScene.layers.effects.children.length)throw Error('Temporary effects remain');for(const a of qaScene.actors.values()){if(a.wrap.x!==a.homeX||a.sprite.currentFrame!==0)throw Error('Action failed to return to idle')}});
    }
    let integrated=null,performance=null;
    if(phase==='after'){
      await page.evaluate(()=>{if(qaScene.layers.effects.children.length)throw Error('Temporary effects remain');for(const a of qaScene.actors.values()){if(a.wrap.x!==a.homeX||a.sprite.currentFrame!==0)throw Error('Action failed to return to idle')}});
      await page.setViewportSize({width:1920,height:1080});await page.waitForTimeout(250);
      if((await page.evaluate(()=>qaScene.audit())).issues.length)throw Error('Resize caused clipping');
      performance=await page.evaluate(()=>new Promise(resolve=>{const samples=[];const ticker=qaScene.app.ticker;function step(t){samples.push(t.deltaMS);if(samples.length===90){ticker.remove(step);samples.shift();samples.sort((a,b)=>a-b);resolve({tickerMaxFPS:ticker.maxFPS,medianFrameMs:samples[Math.floor(samples.length/2)],p95FrameMs:samples[Math.floor(samples.length*.95)],effects:qaScene.layers.effects.children.length})}}ticker.add(step)}));
      // Full application, isolated browser storage. Capture live master and player scenes.
      await page.goto(url+'/');await page.waitForFunction(()=>window.RPGMasterHost?.getState()?.characters);
      await page.evaluate(()=>{
        const mount=RPGBattlePixi.mount;RPGBattlePixi.mount=async(...args)=>{const scene=await mount(...args);window.liveScene=scene;return scene;};
        const s=RPGMasterHost.getState(),c=RPGV3.createCombat(s,{title:'QA — Emboscada na estrada'});
        for(const id of ['elenya','calion','nando','anao'])RPGV3.addParticipant(c,{sourceType:'character',sourceId:id,name:s.characters[id].name});
        for(const id of ['goblin-lanceiro','goblin-arqueiro','goblin-espadachim','uruk-hai-batedor'])RPGV3.addParticipant(c,{sourceType:'creature',sourceId:id,name:id});
        c.summary='PRIVATE_QA_SENTINEL';c.participants[0].details='PRIVATE_QA_SENTINEL';
      });
      if(await page.locator('[data-enter-adventure]').count())await page.locator('[data-enter-adventure]').click();
      await page.locator('#v3-master-button').click();await page.locator('[data-v3-page="combat"]').first().click();
      await page.waitForFunction(()=>window.liveScene?.actors.size===8&&!liveScene.destroyed);
      if(phase==='after'){
        if(await page.locator('[data-arena-rollbox]').isVisible())throw Error('Closed dice panel is visible');
        await page.locator('[data-arena-roll]').click();
        if(!await page.locator('[data-arena-rollbox]').isVisible())throw Error('Dice panel did not open');
        await page.locator('[data-arena-roll-close]').click();
        if(await page.locator('[data-arena-rollbox]').isVisible())throw Error('Dice panel did not close');
      }
      for(const [width,height] of [[1920,1080],[1366,768],[1280,800]]){
        await page.setViewportSize({width,height});await page.waitForTimeout(200);
        const dimensions=await page.evaluate(()=>{
          const view=document.querySelector('.v3-host'),shell=document.querySelector('#battle-arena-shell');
          view.scrollTop+=shell.getBoundingClientRect().top-view.getBoundingClientRect().top-10;
          return {viewport:innerWidth,viewWidth:view.clientWidth,scrollWidth:view.scrollWidth,shellWidth:shell.getBoundingClientRect().width};
        });
        console.log('APP_LAYOUT',width,height,dimensions);
        if(dimensions.viewWidth>width||dimensions.shellWidth>width)throw Error('Arena exceeds viewport');
        await page.waitForTimeout(250);
        await page.screenshot({path:path.join(out,`app-master-${width}x${height}.png`)});
        if((await page.evaluate(()=>liveScene.audit())).issues.length)throw Error('Integrated layout failed');
      }
      const context=page.context();
      await context.addInitScript(()=>{window.publicMessages=[];const Original=BroadcastChannel;window.BroadcastChannel=class extends Original{constructor(...args){super(...args);this.addEventListener('message',e=>window.publicMessages.push(e.data));}};});
      const popupWait=page.waitForEvent('popup');await page.locator('[data-arena-present]').click();const popup=await popupWait;
      popup.on('pageerror',e=>errors.push(e.message));
      await popup.waitForFunction(()=>document.querySelector('canvas')&&window.publicMessages?.some(m=>m.scene?.participants?.length===4));
      await popup.waitForTimeout(500);
      await popup.screenshot({path:path.join(out,'app-players-hidden.png')});
      await page.locator('[data-arena-reveal]').click();
      await popup.waitForFunction(()=>window.publicMessages?.some(m=>m.scene?.participants?.length===5));
      await popup.waitForTimeout(250);await popup.evaluate(()=>window.qaPublicCanvas=document.querySelector('canvas'));
      await page.locator('[data-arena-type]').selectOption('magic');await page.locator('[data-arena-damage]').fill('0');
      await page.locator('[data-arena-confirm]').click();
      await popup.waitForFunction(()=>window.publicMessages?.some(m=>m.effect?.kind==='magic'));
      await popup.waitForTimeout(1000);await popup.screenshot({path:path.join(out,'app-players-revealed.png')});
      if(!await popup.evaluate(()=>window.qaPublicCanvas===document.querySelector('canvas')))throw Error('Public canvas recreated for an action');
      const messages=await popup.evaluate(()=>window.publicMessages);
      if(JSON.stringify(messages).includes('PRIVATE_QA_SENTINEL')||messages.some(m=>m.scene?.participants?.some(p=>'hpCurrent'in p||'ac'in p||'details'in p)))throw Error('Private state leaked');
      integrated={publicCounts:[...new Set(messages.filter(m=>m.scene).map(m=>m.scene.participants.length))],effectSynchronized:messages.some(m=>m.effect?.kind==='magic'),canvasReused:true,privateDataAbsent:true};
      await popup.close();
    }
    const report={phase,results,performance,integrated,errors};fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
    if(errors.length)throw Error(errors.join('\n'));
    console.log(JSON.stringify({phase,cases:results.length,errors}));
  } finally { await browser?.close(); server.kill(); }
}
run().catch(e=>{console.error(e);process.exitCode=1});
