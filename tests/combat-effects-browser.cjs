/* Real Pixi FX and UI/public regression; isolated browser data, localhost only. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-effects-2026-10-28'),url='http://127.0.0.1:43996';
async function run(){
 fs.mkdirSync(out,{recursive:true});const server=spawn(process.execPath,['js/offline-server.mjs','43996'],{cwd:root,windowsHide:true});let browser;
 try{
  await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j)});
  browser=await chromium.launch({executablePath:process.env.ARENA_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext(),page=await context.newPage(),errors=[],checks=[],external=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith(url)||u.startsWith('data:')||u.startsWith('blob:'))return route.continue();external.push(u);return route.abort()});
  await context.addInitScript(()=>{Object.defineProperty(window,'RPGBattlePixi',{configurable:true,set(api){const mount=api.mount;api.mount=async(...args)=>{window.fxScene=await mount(...args);return fxScene};Object.defineProperty(window,'RPGBattlePixi',{value:api,configurable:true})}});const BC=BroadcastChannel;window.fxMessages=[];window.BroadcastChannel=class extends BC{constructor(...a){super(...a);this.addEventListener('message',e=>fxMessages.push(e.data))}}});
  for(const [width,height]of [[1920,1080],[1366,768],[1280,800]]){
   await page.setViewportSize({width,height});await page.goto(url+'/tests/arena-visual.html');
   await page.evaluate(async()=>{const base=document.createElement('base');base.href='/';document.head.prepend(base);await qaMount(4,4)});await page.waitForTimeout(250);
   for(const spell of ['arrow','fire','ice','lightning','missiles'])for(const reverse of [false,true]){
    await page.evaluate(({spell,reverse})=>{window.fxHandle=RPGBattlePixi.flash(fxScene,reverse?'e0':'a0',reverse?'a0':'e0',spell==='arrow'?'ranged':'magic','',{spell});},{spell,reverse});
    await page.waitForTimeout(500);
    const mid=await page.evaluate(()=>({effects:fxScene.layers.effects.children.length,acting:[...fxScene.actors.values()].filter(a=>a.acting).length,bounds:fxScene.audit().issues}));
    assert(mid.effects>0&&mid.acting===2);assert.deepEqual(mid.bounds,[]);
    if(width===1366&&!reverse)await page.screenshot({path:path.join(out,spell+'-flight.png')});
    await page.waitForTimeout(350);
    if(width===1366&&!reverse)await page.screenshot({path:path.join(out,spell+'-impact.png')});
    await page.waitForTimeout(500);
    assert(await page.evaluate(()=>fxScene.layers.effects.children.length===0&&fxScene.tweens.size===0&&[...fxScene.actors.values()].every(a=>!a.acting&&a.wrap.x===a.homeX&&a.direction===RPGBattleCatalog.defaultFacing(a.p))));
    checks.push({width,height,spell,reverse,cleanup:true});
   }
  }
  // Repeated replacement, manual cancel, reduced motion and disposal.
  await page.evaluate(()=>{for(let i=0;i<6;i++)RPGBattlePixi.flash(fxScene,'a0','e0','magic','',{spell:'fire'});});
  await page.waitForTimeout(1300);assert(await page.evaluate(()=>fxScene.layers.effects.children.length===0&&fxScene.tweens.size===0));
  await page.evaluate(()=>RPGBattlePixi.flash(fxScene,'a0','e0','ranged').cancel());
  assert(await page.evaluate(()=>fxScene.layers.effects.children.length===0&&!fxScene.actors.get('a0').acting));
  await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>RPGBattlePixi.flash(fxScene,'a0','e0','magic','',{spell:'lightning'}));
  assert(await page.evaluate(()=>fxScene.layers.effects.children.length===0));await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(url);await page.locator('[data-enter-adventure]').click();
  await page.evaluate(()=>{const s=RPGMasterHost.getState(),c=RPGV3.createCombat(s,{title:'QA — Magias elementais'});for(const id of ['calion','elenya'])RPGV3.addParticipant(c,{sourceType:'character',sourceId:id,name:id,team:id==='calion'?'left':'right',hpMax:20,hpCurrent:20});RPGMasterHost.persist()});
  await page.locator('#v3-master-button').click();await page.locator('[data-v3-page="combat"]').first().click();await page.waitForFunction(()=>window.fxScene?.actors.size===2&&!fxScene.destroyed);
  const publicWait=page.waitForEvent('popup');await page.locator('[data-arena-present]').click();const popup=await publicWait;popup.on('pageerror',e=>errors.push(e.message));await popup.waitForFunction(()=>window.fxScene?.actors.size===2);
  assert(!(await page.locator('[data-arena-spell]').isVisible()));await page.locator('[data-arena-type]').selectOption('magic');
  for(const spell of ['fire','ice','lightning','missiles']){
   await page.locator('[data-arena-spell]').selectOption(spell);await page.locator('[data-arena-confirm]').click();
   await popup.waitForFunction(spell=>fxMessages.some(m=>m.effect?.spell===spell&&m.effect?.kind==='magic'),spell);
   await page.waitForTimeout(1450);assert.equal(await page.locator('[data-arena-spell]').inputValue(),spell);
  }
  await page.locator('[data-arena-outcome]').selectOption('fail');await page.locator('[data-arena-confirm]').click();
  await popup.waitForFunction(()=>fxMessages.some(m=>m.effect?.outcome==='fail'&&m.effect?.spell==='missiles'));await page.waitForTimeout(1450);
  await page.locator('[data-arena-spell]').selectOption('ice');await page.locator('[data-arena-confirm]').click();await page.waitForTimeout(400);
  await page.screenshot({path:path.join(out,'master-spell-control.png'),fullPage:true});await popup.screenshot({path:path.join(out,'players-spell.png')});
  await page.locator('[data-arena-skip]').click();await page.waitForTimeout(300);assert(await page.locator('[data-arena-confirm]').isEnabled());
  assert(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants.every(p=>p.hpCurrent===20)));
  const messages=await popup.evaluate(()=>fxMessages);assert(!JSON.stringify(messages).includes('hpCurrent'));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({checks,UI:true,publicSync:true,noPrivateHP:true,noHpChange:true,skip:true,reducedMotion:true,repeatedActions:true,offline:true,errors},null,2));
  console.log(JSON.stringify({cases:checks.length,UI:true,publicSync:true,errors}));
 }finally{await browser?.close();server.kill();}
}
run().catch(e=>{console.error(e);process.exitCode=1});
