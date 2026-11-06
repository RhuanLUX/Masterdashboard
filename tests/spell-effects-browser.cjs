/* Render every visual spell, both ways, on the real offline Pixi stage. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{spawn}=require('child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-animation-magic'),url='http://127.0.0.1:43988';
(async()=>{fs.mkdirSync(out,{recursive:true});const server=spawn(process.execPath,['js/offline-server.mjs','43988'],{cwd:root,windowsHide:true});let browser;
try{
 await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j)});
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:768}}),errors=[],external=[];
 await context.route('**/*',r=>{if(r.request().url().startsWith(url)||/^(data:|blob:)/.test(r.request().url()))return r.continue();external.push(r.request().url());return r.abort()});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.goto(url+'/tests/arena-visual.html');
 await page.evaluate(()=>{const b=document.createElement('base');b.href='/';document.head.prepend(b)});await page.evaluate(()=>qaMount(4,4));
 await page.locator('canvas').screenshot({path:path.join(out,'mordor.png')});
 const spells=await page.evaluate(()=>Object.keys(RPGBattleMagic.names)),report=[];
 for(const spell of [...spells,'heal','arrow'])for(const reverse of [false,true]){
  const timing=await page.evaluate(({spell,reverse})=>{const kind=spell==='heal'?'heal':spell==='arrow'?'ranged':'magic',actor=reverse?'e0':'a1',target=reverse?'a1':'e0';window.qaHandle=RPGBattlePixi.flash(qaScene,actor,target,kind,'',{spell,outcome:'normal'});return RPGBattleMagic.timing(kind,spell)},{spell,reverse});
  await page.waitForTimeout(timing.duration*.43);
  const fx=await page.evaluate(()=>qaScene.layers.effects.children.map(g=>({label:g.label,w:g.getBounds().width,h:g.getBounds().height})));
  assert(fx.some(g=>g.w>0&&g.h>0),spell);assert.deepEqual(await page.evaluate(()=>qaScene.audit().issues),[]);
  if(!reverse)await page.locator('canvas').screenshot({path:path.join(out,'spell-'+spell+'.png')});
  await page.waitForTimeout(timing.duration+100);assert.equal(await page.evaluate(()=>qaScene.layers.effects.children.length),0,spell+' cleanup');
  assert.equal(await page.evaluate(()=>qaScene.tweens.size),0);report.push({spell,reverse,...timing,fx});
 }
 // Elenya's four full poses: individual files, no atlas window to bleed a neighbour.
 for(let i=0;i<4;i++){await page.evaluate(i=>{const a=qaScene.actors.get('a0');a.acting=true;a.sprite.gotoAndStop(i);qaScene.app.render()},i);await page.locator('canvas').screenshot({path:path.join(out,'elenya-pose-'+i+'.png')});}
 // Skip must clear a new long effect immediately, without leaving the attacker posed.
 await page.evaluate(()=>{const h=RPGBattlePixi.flash(qaScene,'a1','e0','magic','',{spell:'hurricane'});h.cancel()});
 assert.equal(await page.evaluate(()=>qaScene.layers.effects.children.length),0);assert.equal(await page.evaluate(()=>qaScene.actors.get('a1').sprite.currentFrame),0);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);fs.writeFileSync(path.join(out,'spells.json'),JSON.stringify({report,errors,external,skip:true},null,2));console.log('SPELL_EFFECTS_PASS',report.length);
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
