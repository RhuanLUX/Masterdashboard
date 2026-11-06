/* Real Pixi renderer + actual master/TV windows, isolated storage and offline requests. */
const {chromium}=require('playwright'),fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{spawn}=require('child_process'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-ambient-visitors'),url='http://127.0.0.1:43987';
const save=async(page,name,canvas=false)=>sharp(await (canvas?page.locator('canvas'):page).screenshot()).webp({quality:86}).toFile(path.join(out,name+'.webp'));
(async()=>{fs.mkdirSync(out,{recursive:true});const server=spawn(process.execPath,['js/offline-server.mjs','43987'],{cwd:root,windowsHide:true});let browser;
try{
 await new Promise((r,j)=>{server.stdout.once('data',r);server.once('error',j)});
 browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 const context=await browser.newContext({viewport:{width:1366,height:768}}),errors=[],external=[],failed=[],report={};
 await context.route('**/*',r=>{const u=r.request().url();if(u.startsWith(url)||/^(data:|blob:)/.test(u))return r.continue();external.push(u);return r.abort()});
 context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)failed.push(r.url()+':'+r.status())})});
 await context.addInitScript(()=>{
  window.qaEffects=[];window.qaMessages=[];
  Object.defineProperty(window,'RPGBattlePixi',{configurable:true,set(api){const mount=api.mount,flash=api.flash;api.mount=async(...args)=>{window.qaScene=await mount(...args);return qaScene};api.flash=(...args)=>{qaEffects.push({kind:args[3],spell:args[5]?.spell});return flash(...args)};Object.defineProperty(window,'RPGBattlePixi',{value:api,configurable:true})}});
  const BC=BroadcastChannel;window.BroadcastChannel=class extends BC{constructor(...args){super(...args);this.addEventListener('message',e=>qaMessages.push(e.data))}};
 });
 const page=await context.newPage();await page.goto(url+'/tests/arena-visual.html');
 await page.evaluate(()=>{const b=document.createElement('base');b.href='/';document.head.prepend(b)});
 // Choose a deterministic mid-flight moment rather than waiting minutes for chance events.
 const when=async(p,type,direction=1)=>p.evaluate(({type,direction})=>{for(let t=0;t<10800000;t+=200){const v=RPGBattleAmbience.sample(qaScene.environment,t);if(v[0]?.type===type&&v[0].direction===direction&&v[0].x>290&&v[0].x<350&&v[0].alpha>.5)return t;}throw Error('No visitor '+type)},{type,direction});
 const freeze=async(p,time)=>p.evaluate(async time=>{qaScene.app.ticker.stop();await qaScene.scenery.ready;qaScene.scenery.tick(time);qaScene.app.render();return qaScene.scenery.visitors},time);
 report.visitors=[];
 for(const [id,type]of [['mordor','raven'],['hrim','dragon'],['rivendell','eagle'],['fangorn','owl'],['fangorn','stag'],['road','caravan']]){
  await page.evaluate(async id=>{window.qaScene?.destroy();window.qaScene=await RPGBattlePixi.mount(document.querySelector('#qa'),qaParticipants(4,4),{environment:{id,seed:193482,epoch:0}})},id);
  for(const direction of [1,-1]){
   const time=await when(page,type,direction),visitors=await freeze(page,time);
   const status=await page.evaluate(()=>{const r=qaScene.layers.middle.children.find(n=>n.label==='ambient-visitors');return {mode:r.eventMode,interactive:r.interactiveChildren,sprites:r.children.filter(s=>s.visible).map(s=>({scaleX:s.scale.x,scaleY:s.scale.y,width:s.texture.width,height:s.texture.height})),issues:qaScene.audit().issues}});
   assert.equal(status.mode,'none');assert.equal(status.interactive,false);assert.deepEqual(status.issues,[]);
   assert.equal(status.sprites.length,visitors.length);for(const s of status.sprites){assert.equal(Math.abs(s.scaleX),s.scaleY);assert.equal(Math.sign(s.scaleX),direction);if(type!=='dragon'){assert.equal(s.width,480);assert.equal(s.height,480)}}
   if(direction===1)await save(page,id+'-'+type,true);
   const poses=new Set();for(let i=0;i<12;i++){const frames=await freeze(page,time+i*40);for(const v of frames)poses.add(v.frame)}assert.equal(poses.size,4);
   report.visitors.push({id,type,direction,frames:poses.size,visible:visitors.length});
  }
 }
 // Align all four frames on the same registration point for human inspection.
 const contact=await page.evaluate(async()=>{
  qaScene.app.ticker.stop();const app=new PIXI.Application();await app.init({width:1000,height:850,background:0x18252c,antialias:false,resolution:1});
  let row=0;for(const id of ['raven','eagle','owl','stag','caravan']){const a=RPG_AMBIENT_FRAMES[id];for(let f=0;f<4;f++){const s=new PIXI.Sprite(await PIXI.Assets.load(a.frames[f]));s.anchor.set(...a.anchors[f]);s.scale.set(100/a.width);s.position.set(150+f*220,95+row*160);app.stage.addChild(s)}row++}app.render();
  const result=app.canvas.toDataURL();app.destroy(true,{children:true,texture:false,textureSource:false});return result;
 });await sharp(Buffer.from(contact.split(',')[1],'base64')).webp({quality:90}).toFile(path.join(out,'frames-registered.webp'));
 if(process.env.RPG_AMBIENT_FRAMES_ONLY){console.log('AMBIENT_CONTACT_PASS');return;}
 // Cleanup and reduced motion, including re-enabling without remounting.
 await page.evaluate(async()=>{qaScene.destroy();window.qaScene=await RPGBattlePixi.mount(document.querySelector('#qa'),qaParticipants(10,10),{environment:{id:'mordor',seed:193482,epoch:0}})});
 const flockTime=await when(page,'raven');await freeze(page,flockTime);
 assert.equal(await page.evaluate(t=>{qaScene.scenery.tick(t,true);return qaScene.scenery.visitors.length},flockTime),0);
 assert((await freeze(page,flockTime)).length>0);report.reducedMotion=true;
 report.cleanup=await page.evaluate(async()=>{for(let i=0;i<25;i++){qaScene.setEnvironment({id:['mordor','fangorn','rivendell','road','hrim'][i%5],seed:193482,epoch:0});await qaScene.scenery.ready;}return {roots:qaScene.app.stage.children.length,visitors:qaScene.layers.middle.children.filter(n=>n.label==='ambient-visitors').length,actors:qaScene.actors.size}});
 assert.equal(report.cleanup.roots,7);assert.equal(report.cleanup.visitors,1);assert.equal(report.cleanup.actors,20);
 // Full application, genuine popup. No user data is touched.
 await page.goto(url);await page.locator('[data-enter-adventure]').click();
 await page.evaluate(()=>{const s=RPGMasterHost.getState(),c=RPGV3.createCombat(s,{title:'QA • Visitantes do cenário'});for(const id of ['elenya','calion','nando','anao'])RPGV3.addParticipant(c,{sourceType:'character',sourceId:id,team:'left'});RPGV3.addParticipant(c,{sourceType:'creature',sourceId:'goblin-arqueiro',team:'right',hpMax:100,hpCurrent:100});c.summary='SEGREDO_PRIVADO';RPGBattle.ensure(s);RPGV3.beginCombat(c);RPGMasterHost.persist();RPGMasterUI.open('combat')});
 await page.waitForFunction(()=>document.querySelector('#battle-arena-shell')?.dataset.arenaReady==='true');
 const popup=page.waitForEvent('popup');await page.locator('[data-arena-present]').click();const tv=await popup;await tv.waitForFunction(()=>window.qaScene?.actors.size===5);
 report.synchronization=[];
 for(const [id,type]of [['mordor','raven'],['fangorn','stag'],['rivendell','eagle'],['road','caravan'],['hrim','dragon']]){
  await page.locator('[data-arena-environment]').selectOption(id);await tv.waitForFunction(id=>qaScene.environment.id===id,id);
  assert.deepEqual(await tv.evaluate(()=>qaScene.environment),await page.evaluate(()=>qaScene.environment));
  const time=await when(page,type),master=await freeze(page,time),publicView=await freeze(tv,time);assert.deepEqual(publicView,master);
  // Compare actual Sprite transforms, normalized to the two different canvas sizes.
  const transform=async p=>p.evaluate(()=>qaScene.layers.middle.children.find(n=>n.label==='ambient-visitors').children.filter(s=>s.visible).map(s=>({x:Math.round(s.x/qaScene.app.screen.width*640),y:Math.round(s.y/qaScene.app.screen.height*360),anchor:[s.anchor.x,s.anchor.y],alpha:s.alpha,source:s.texture.source.label})));
  assert.deepEqual(await transform(tv),await transform(page));report.synchronization.push({id,type,visitors:master.length});
 }
 assert.equal(await tv.locator('select,input,aside,header,textarea').count(),0);for(const secret of ['SEGREDO_PRIVADO','hpCurrent','hpMax','arenaSelection'])assert(!JSON.stringify(await tv.evaluate(()=>qaMessages)).includes(secret));report.privacy=true;
 // Cast while an eagle passes: actual controls must still work, HP and actor retained.
 await page.locator('[data-arena-environment]').selectOption('rivendell');await tv.waitForFunction(()=>qaScene.environment.id==='rivendell');
 const castTime=await when(page,'eagle');for(const p of [page,tv])await p.evaluate(t=>{const original=qaScene.scenery.tick;qaScene.scenery.tick=(_,r)=>original(t,r);qaScene.app.ticker.start()},castTime);
 const ids=await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants.map(p=>p.id));
 await page.locator('[data-arena-actor]').selectOption(ids[1]);await page.locator('[data-arena-target]').selectOption(ids[4]);await page.locator('[data-arena-type]').selectOption('magic');await page.locator('[data-arena-spell]').selectOption('hurricane');await page.locator('[data-arena-damage]').fill('7');await page.locator('[data-arena-confirm]').click();
 await tv.waitForFunction(()=>qaEffects.some(e=>e.spell==='hurricane'));await page.waitForFunction(()=>!document.querySelector('[data-arena-confirm]').disabled);assert.equal(await page.locator('[data-arena-actor]').inputValue(),ids[1]);assert.equal(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants[4].hpCurrent),93);report.attackDuringVisitor=true;
 report.viewports=[];for(const [width,height]of [[1920,1080],[1366,768],[1280,800]]){
  await page.setViewportSize({width,height});await tv.setViewportSize({width,height});await page.waitForTimeout(150);
  await page.evaluate(()=>document.querySelector('.arena-head').scrollIntoView({block:'start'}));await freeze(page,castTime);await freeze(tv,castTime);
  assert.deepEqual(await tv.evaluate(()=>qaScene.audit().issues),[]);await save(page,'master-'+width);await save(tv,'tv-'+width);report.viewports.push({width,height});
 }
 // Timing budget: 20 participants, flock and hurricane together.
 const perf=await context.newPage();await perf.goto(url+'/tests/arena-visual.html');await perf.evaluate(()=>{const b=document.createElement('base');b.href='/';document.head.prepend(b)});
 report.performance=await perf.evaluate(async()=>{window.qaScene=await RPGBattlePixi.mount(document.querySelector('#qa'),qaParticipants(10,10),{environment:{id:'mordor',seed:193482,epoch:0}});let t;for(t=0;t<1e6;t+=100)if(RPGBattleAmbience.sample(qaScene.environment,t).length===5)break;const original=qaScene.scenery.tick;qaScene.scenery.tick=()=>original(t++);const times=[];let prev;RPGBattlePixi.flash(qaScene,'a1','e0','magic','',{spell:'hurricane'});await new Promise(resolve=>{function tick(){const now=performance.now();if(prev!==undefined)times.push(now-prev);prev=now;if(times.length>=150){qaScene.app.ticker.remove(tick);resolve()}}qaScene.app.ticker.add(tick)});times.sort((a,b)=>a-b);return {samples:times.length,medianMs:times[75],p95Ms:times[142],over50ms:times.filter(t=>t>50).length,participants:qaScene.actors.size,visitors:qaScene.scenery.visitors.length}});
 assert.equal(report.performance.visitors,5);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(failed,[]);
 fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({...report,errors,external,failed},null,2));console.log('AMBIENT_BROWSER_PASS',JSON.stringify(report));
}finally{await browser?.close();server.kill()}})().catch(e=>{console.error(e);process.exitCode=1});
