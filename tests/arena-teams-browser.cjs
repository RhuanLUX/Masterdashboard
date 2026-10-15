/* V3.2.3 actual browser renderer + operational team UAT, isolated storage. */
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-v3.2.3/teams'),url='http://127.0.0.1:43994';
async function run(){
 fs.mkdirSync(out,{recursive:true});const server=spawn(process.execPath,['js/offline-server.mjs','43994'],{cwd:root,windowsHide:true});let browser;
 try{
  await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j)});
  browser=await chromium.launch({executablePath:process.env.ARENA_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  const context=await browser.newContext({viewport:{width:1366,height:768}}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await context.addInitScript(()=>{Object.defineProperty(window,'RPGBattlePixi',{configurable:true,set(api){const mount=api.mount;api.mount=async(...args)=>{const scene=await mount(...args);window.qaScene=scene;return scene};Object.defineProperty(window,'RPGBattlePixi',{value:api,writable:true,configurable:true})}});const BC=BroadcastChannel;window.qaMessages=[];window.BroadcastChannel=class extends BC{constructor(...a){super(...a);this.addEventListener('message',e=>qaMessages.push(e.data))}}});
  await page.goto(url+'/tests/arena-visual.html');await page.evaluate(()=>{const base=document.createElement('base');base.href='/';document.head.prepend(base)});
  const keys=await page.evaluate(()=>Object.keys(RPGBattleCatalog.sprites)),art=[];
  // All 33 mapped visuals, including future narrative bases, facing both ways.
  for(const key of keys){
   for(const team of ['left','right']){
    await page.evaluate(async({key,team})=>{window.qaScene?.destroy();const [sourceType,sourceId]=key.split(':');window.qaScene=await RPGBattlePixi.mount(document.querySelector('#qa'),[
      {id:'tested',sourceType,sourceId,name:sourceId,team,hpCurrent:5},
      {id:'target',sourceType:'character',sourceId:'elenya',name:'Alvo',team:team==='left'?'right':'left',hpCurrent:5}
    ]);}, {key,team});
    await page.waitForTimeout(250); // initial ResizeObserver layout must settle before sampling idle
    const idle0=await page.evaluate(()=>{const a=qaScene.actors.get('tested');return a.sprite.rotation+a.sprite.scale.y});
    await page.waitForTimeout(180);
    const initial=await page.evaluate(()=>{const a=qaScene.actors.get('tested');return {key:a.visual.key,kind:a.visual.kind,fallback:a.visual.fallback,dir:a.direction,scale:a.sprite.scale.x,native:a.visual.nativeFacing,unmirrored:a.name.scale.x>0&&a.wrap.scale.x>0,issues:qaScene.audit().issues,idle:a.sprite.rotation+a.sprite.scale.y}});
    assert.equal(initial.kind,'sheet');assert(!initial.fallback);assert.equal(initial.dir,team==='left'?'right':'left');assert(initial.unmirrored);assert.deepEqual(initial.issues,[]);assert.notEqual(initial.idle,idle0);
    await page.evaluate(()=>RPGBattlePixi.flash(qaScene,'tested','target','melee','Impacto'));
    await page.waitForTimeout(400);
    const action=await page.evaluate(()=>{const a=qaScene.actors.get('tested'),b=qaScene.actors.get('target');return {active:a.acting,direction:a.direction,want:b.homeX>a.homeX?'right':'left',damage:b.sprite.tint!==0xffffff,moved:a.wrap.x!==a.homeX||a.sprite.currentFrame>0||a.sprite.rotation!==0}});
    assert(action.active&&action.damage&&action.moved);assert.equal(action.direction,action.want);
    await page.waitForTimeout(420);
    await page.evaluate(()=>{const a=qaScene.actors.get('tested');if(a.acting||a.wrap.x!==a.homeX||a.direction!==RPGBattleCatalog.defaultFacing(a.p))throw Error('Failed action reset');a.p.hpCurrent=0;qaScene.updateParticipants([...qaScene.actors.values()].map(a=>a.p));if(a.sprite.alpha>=1)throw Error('No incapacitated visual');});
    art.push({key,team,idle:true,attack:true,damage:true,incapacitated:true,unmirrored:true});
   }
  }
  const layouts=[];
  for(const [width,height] of [[1920,1080],[1366,768],[1280,800]]){
   await page.setViewportSize({width,height});
   for(const [a,b] of [[1,0],[1,1],[4,4],[6,2],[2,8],[1,10],[10,10]]){
    const bounds=await page.evaluate(async({a,b,keys})=>{qaScene.destroy();const ps=Array.from({length:a+b},(_,i)=>{const [sourceType,sourceId]=keys[i%keys.length].split(':');return {id:'p'+i,name:sourceId,sourceId,sourceType,team:i<a?'left':'right'}});window.qaScene=await RPGBattlePixi.mount(document.querySelector('#qa'),ps);document.querySelector('#scenario').textContent=`${a} esquerda × ${b} direita`;qaScene.app.render();return qaScene.audit()},{a,b,keys});
    assert.deepEqual(bounds.issues,[]);assert.equal(bounds.entries.length,a+b);layouts.push({width,height,a,b,bounds});
    await page.screenshot({path:path.join(out,`${width}x${height}-${a}v${b}.png`)});
   }
  }
  // Operational UI, real transfer and same-team attack, public sync and actual backup.
  await page.goto(url);await page.waitForSelector('[data-enter-adventure]');await page.locator('[data-enter-adventure]').click();
  await page.evaluate(()=>{const s=RPGMasterHost.getState(),c=RPGV3.createCombat(s,{title:'QA — Equipes livres'});for(const [sourceType,sourceId,team]of [['character','elenya','left'],['visual','barbarvore','left'],['creature','goblin-arqueiro','right'],['creature','vigia-hrim','right']]){const src=RPGBattleCatalog.source(s,sourceType,sourceId);RPGV3.addParticipant(c,{...src,sourceType,sourceId,team,hpMax:40,hpCurrent:19,initiative:12,conditions:[{id:'test',name:'Vigiando'}],resources:{test:3}})}RPGBattle.ensure(s);RPGV3.beginCombat(c);c.turnIndex=1;RPGMasterHost.persist()});
  await page.locator('#v3-master-button').click();await page.locator('[data-v3-page="combat"]').first().click();await page.waitForFunction(()=>window.qaScene?.actors.size===4&&!qaScene.destroyed);
  const popupWait=page.waitForEvent('popup');await page.locator('[data-arena-present]').click();const popup=await popupWait;popup.on('pageerror',e=>errors.push(e.message));await popup.waitForFunction(()=>window.qaScene?.actors.size===1);
  await page.locator('[data-arena-details]').click();assert(await page.locator('.participant-manager').isVisible());
  const ids=await page.evaluate(()=>Object.fromEntries(RPGV3.currentCombat(RPGMasterHost.getState()).participants.map(p=>[p.sourceId,p.id])));
  const before=await page.evaluate(()=>{const c=RPGV3.currentCombat(RPGMasterHost.getState());window.savedCanvas=qaScene.app.canvas;return {participants:JSON.parse(JSON.stringify(c.participants)),turnId:RPGV3.activeParticipant(c).id}});
  for(const id of [ids.elenya,ids.barbarvore,ids['goblin-arqueiro']])await page.locator(`[data-arena-transfer="${id}"]`).click();
  const after=await page.evaluate(()=>{const c=RPGV3.currentCombat(RPGMasterHost.getState());return {participants:c.participants,turnId:RPGV3.activeParticipant(c).id,sameCanvas:savedCanvas===qaScene.app.canvas,issues:qaScene.audit().issues}});
  assert(after.sameCanvas);assert.deepEqual(after.issues,[]);assert.equal(after.turnId,before.turnId);
  for(let i=0;i<4;i++)for(const k of Object.keys(before.participants[i]).filter(k=>!['team','facing'].includes(k)))assert.deepEqual(after.participants[i][k],before.participants[i][k],k);
  await popup.waitForFunction(()=>qaScene.actors.size===1&&[...qaScene.actors.values()][0].p.team==='right');
  await page.locator('[data-arena-target]').selectOption(ids.barbarvore);await page.locator('[data-arena-reveal]').click();
  await popup.waitForFunction(()=>qaScene.actors.size===2);await popup.evaluate(()=>window.beforeMoveCanvas=qaScene.app.canvas);
  await page.locator(`[data-arena-transfer="${ids.barbarvore}"]`).click();
  await popup.waitForFunction(id=>qaScene.actors.get(id)?.p.team==='left',ids.barbarvore);assert(await popup.evaluate(()=>beforeMoveCanvas===qaScene.app.canvas));
  // Same-team target is legal: Elenya and Vigia both right, face actual positions.
  await page.locator('[data-arena-actor]').selectOption(ids.elenya);await page.locator('[data-arena-target]').selectOption(ids['vigia-hrim']);
  await page.locator('[data-arena-confirm]').click();await page.waitForTimeout(150);
  assert(await page.evaluate(()=>{const c=RPGV3.currentCombat(RPGMasterHost.getState()),a=qaScene.actors.get(c.participants[0].id),b=qaScene.actors.get(c.participants[3].id);return a.acting&&a.direction===(b.homeX===a.homeX?RPGBattleCatalog.defaultFacing(a.p):b.homeX>a.homeX?'right':'left')}));
  await page.waitForTimeout(1000);
  // Search + choose team + quantity through one manager, no parallel inclusion rules.
  await page.locator('[data-roster-search]').fill('goblin');assert.equal(await page.locator('[data-v3-creature] option').count(),3);
  await page.locator('[data-v3-creature]').selectOption('creature:goblin-lanceiro');await page.locator('[data-roster-team]').selectOption('left');await page.locator('[data-roster-quantity]').fill('2');await page.locator('[data-roster-quantity]').blur();await page.locator('[data-v3-creature-add]').click();
  await page.waitForFunction(()=>qaScene.actors.size===6&&!qaScene.destroyed);assert.equal(await page.locator('[data-team-rows="left"] [data-participant-row]').count(),4);
  for(const [width,height] of [[1920,1080],[1366,768],[1280,800]]){await page.setViewportSize({width,height});await page.locator('.participant-manager').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,`manager-${width}x${height}.png`)});assert.equal(await page.locator('.participant-manager').evaluate(el=>el.scrollWidth<=el.clientWidth+2),true);}
  await page.locator('[data-arena-details]').click();await page.locator('#battle-arena-shell').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'mixed-master.png')});
  await popup.bringToFront();await popup.evaluate(()=>qaScene.app.render());await popup.screenshot({path:path.join(out,'mixed-public.png')});await page.bringToFront();
  const saved=await page.evaluate(()=>JSON.parse(JSON.stringify(RPGV3.currentCombat(RPGMasterHost.getState()).participants)));
  await page.waitForFunction(()=>document.querySelector('#save-state').textContent==='Salvo localmente');await page.reload();await page.waitForSelector('[data-enter-adventure]');assert.deepEqual(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants),saved);
  const dw=page.waitForEvent('download');await page.evaluate(()=>RPGMasterHost.exportBackup());const d=await dw,backup=fs.readFileSync(await d.path(),'utf8');
  await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants=[]);page.on('dialog',d=>d.accept());await page.evaluate(json=>RPGMasterHost.importBackup({target:{files:[new File([json],'qa.json',{type:'application/json'})],value:''}}),backup);assert.deepEqual(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants),saved);
  const messages=await popup.evaluate(()=>qaMessages);for(const m of messages)for(const p of m.scene?.participants||[])for(const field of ['hpCurrent','hpMax','ac','notes','details','resources','conditions'])assert(!(field in p));
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({art,layouts,transfer:true,sameTeamAttack:true,quantity:true,search:true,reload:true,backup:true,publicPrivacy:true,publicCanvasReused:true,errors},null,2));console.log(JSON.stringify({artChecks:art.length,layouts:layouts.length,errors}));
 }finally{await browser?.close();server.kill()}
}
run().catch(e=>{console.error(e);process.exitCode=1});
