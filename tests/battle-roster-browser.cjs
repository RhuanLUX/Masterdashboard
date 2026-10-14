/* V3.2.2: actual selector -> canonical combatant -> Pixi visual -> public window. */
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-v3.2.2'),url='http://127.0.0.1:43993';
const assert=require('node:assert/strict');
async function run(){
  fs.mkdirSync(out,{recursive:true});
  const server=spawn(process.execPath,['js/offline-server.mjs','43993'],{cwd:root,windowsHide:true});let browser;
  try{
    await new Promise((resolve,reject)=>{server.stdout.once('data',resolve);server.once('error',reject);server.once('exit',n=>reject(Error('Server exited '+n)))});
    browser=await chromium.launch({executablePath:process.env.ARENA_QA_BROWSER||'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
    const context=await browser.newContext({viewport:{width:1366,height:768}}),errors=[];
    await context.addInitScript(()=>{
      Object.defineProperty(window,'RPGBattlePixi',{configurable:true,set(api){const mount=api.mount;api.mount=async(...args)=>{const scene=await mount(...args);window.qaScene=scene;return scene};Object.defineProperty(window,'RPGBattlePixi',{value:api,writable:true,configurable:true})}});
      const Channel=BroadcastChannel;window.qaPublicMessages=[];window.BroadcastChannel=class extends Channel{constructor(...args){super(...args);this.addEventListener('message',e=>window.qaPublicMessages.push(e.data))}};
    });
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
    const prompts=[];let acceptRestore=false;page.on('dialog',async dialog=>{prompts.push(dialog.message());if(dialog.type()==='prompt')await dialog.accept(dialog.message().includes('PV')?'23':'14');else if(dialog.type()==='confirm'&&acceptRestore)await dialog.accept();else await dialog.dismiss()});
    await page.goto(url);await page.waitForFunction(()=>window.RPGMasterHost?.getState()?.characters);
    await page.evaluate(()=>RPGV3.createCombat(RPGMasterHost.getState(),{title:'QA V3.2.2 — identidades'}));
    if(await page.locator('[data-enter-adventure]').count())await page.locator('[data-enter-adventure]').click();
    await page.locator('#v3-master-button').click();await page.locator('[data-v3-page="combat"]').first().click();
    await page.waitForFunction(()=>window.qaScene&&!qaScene.destroyed);
    const roster=await page.evaluate(()=>RPGBattleCatalog.roster(RPGMasterHost.getState()).map(x=>({...x,visual:RPGBattleCatalog.visualFor(x,RPGMasterHost.getState())})));
    assert.equal(await page.locator('[data-v3-creature] option').count(),roster.length);
    assert(await page.locator('[data-v3-creature] optgroup').count()>=4);
    // Open actual public window; keep it for sequential identity changes.
    const popupWait=page.waitForEvent('popup');await page.locator('[data-arena-present]').click();const popup=await popupWait;
    popup.on('pageerror',e=>errors.push(e.message));await popup.waitForFunction(()=>window.qaScene);
    const results=[];
    const repeated=['creature:vigia-hrim','creature:goblin-arqueiro','creature:uruk-hai-capitao','visual:barbarvore','creature:vigia-hrim','creature:espectro-sombras'];
    for(const key of [...roster.map(x=>x.key),...repeated]){
      const expected=roster.find(x=>x.key===key),beforePrompts=prompts.length;
      await page.locator('[data-v3-creature]').selectOption(key);
      await page.locator('[data-v3-creature-add]').click();
      await page.waitForFunction(key=>window.qaScene&&!qaScene.destroyed&&qaScene.actors.size===1&&[...qaScene.actors.values()][0].visual.key===key,key);
      const actual=await page.evaluate(()=>{
        const c=RPGV3.currentCombat(RPGMasterHost.getState()),p=c.participants[0],a=qaScene.actors.get(p.id);
        return {participant:p,visual:a.visual,frames:a.frames.length,label:a.name.text,bounds:qaScene.audit()};
      });
      assert.equal(actual.participant.sourceType,expected.sourceType);assert.equal(actual.participant.sourceId,expected.sourceId);
      assert.equal(actual.participant.name,expected.name);assert.equal(actual.visual.asset,expected.visual.asset);assert.equal(actual.visual.kind,expected.visual.kind);
      assert.equal(actual.participant.hpMax,expected.hpMax>0?expected.hpMax:23);assert.equal(String(actual.participant.ac),String(expected.ac===''||expected.ac==null?14:expected.ac));
      assert.deepEqual(actual.participant.attributes,expected.attributes);assert.deepEqual(actual.participant.attacks,expected.attacks);
      assert.equal(actual.participant.image,expected.image);assert.equal(actual.participant.details,expected.details);assert.deepEqual(actual.bounds.issues,[]);
      if(!(expected.hpMax>0))assert(prompts.length>beforePrompts,'Missing stats must request master values');
      if(expected.sourceType!=='character')await page.locator('[data-arena-reveal]').click();
      await popup.waitForFunction(key=>window.qaScene&&!qaScene.destroyed&&qaScene.actors.size===1&&[...qaScene.actors.values()][0].visual.key===key,key);
      const shown=await popup.evaluate(()=>{const a=[...qaScene.actors.values()][0];return {name:a.p.name,visual:a.visual,bounds:qaScene.audit()}});
      assert.equal(shown.name,expected.name);assert.deepEqual(shown.visual,actual.visual);assert.deepEqual(shown.bounds.issues,[]);
      results.push({key,name:expected.name,asset:actual.visual.asset,kind:actual.visual.kind,frame:actual.visual.frame,master:true,public:true,stats:true});
      if(['creature:vigia-hrim','creature:uruk-hai-capitao','visual:barbarvore'].includes(key)){
        await popup.bringToFront();await popup.evaluate(()=>qaScene.app.render());
        await popup.screenshot({path:path.join(out,expected.sourceId+'-public.png')});
      }
      await page.locator('[data-arena-details]').click();await page.locator('[data-v3-remove-p]').click();
      await page.waitForFunction(()=>window.qaScene&&!qaScene.destroyed&&qaScene.actors.size===0);
    }
    const messages=await popup.evaluate(()=>qaPublicMessages);
    for(const m of messages)for(const p of m.scene?.participants||[])for(const key of ['hpMax','hpCurrent','ac','details','notes','attributes','attacks'])assert(!(key in p),'Private field '+key);
    // A broken asset must not hide the participant or replace the rest of the scene.
    await page.evaluate(async()=>{
      const host=document.createElement('div');host.style.cssText='width:600px;height:400px';document.body.append(host);
      const probe=await RPGBattlePixi.mount(host,[{id:'missing',sourceType:'custom',sourceId:'qa-broken',name:'Arte ausente',image:'assets/qa-intentionally-missing.png'},{id:'known',sourceType:'character',sourceId:'elenya',name:'Elenya'}]);
      if(probe.actors.size!==2||probe.actors.get('missing').visual.kind!=='missing'||probe.actors.get('known').visual.kind!=='sheet')throw Error('Missing asset recovery failed');
      probe.destroy();host.remove();
    });
    // Mixed encounter, including fixed goblin variants, captain and both missing-sprite cases.
    for(const key of ['character:elenya','character:calion','character:nando','character:anao','creature:vigia-hrim','creature:uruk-hai-capitao','visual:barbarvore','creature:goblin-lanceiro','creature:goblin-arqueiro','creature:goblin-espadachim','creature:espectro-sombras']){
      await page.locator('[data-v3-creature]').selectOption(key);await page.locator('[data-v3-creature-add]').click();
      await page.waitForFunction(key=>window.qaScene&&!qaScene.destroyed&&[...qaScene.actors.values()].some(a=>a.visual.key===key),key);
    }
    await page.bringToFront();await page.evaluate(()=>{window.scrollTo(0,0);const view=document.querySelector('.v3-host'),shell=document.querySelector('#battle-arena-shell');view.scrollLeft=0;view.scrollTop+=shell.getBoundingClientRect().top-view.getBoundingClientRect().top-10;qaScene.app.render()});
    await page.screenshot({path:path.join(out,'mixed-roster-master.png')});
    assert.deepEqual(await page.evaluate(()=>qaScene.audit().issues),[]);
    // Reload preserves stable identities, source selection and snapshots in persisted encounter.
    const saved=await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants.map(p=>({id:p.id,sourceId:p.sourceId,sourceType:p.sourceType,hp:p.hpCurrent})));
    // Await the app's existing 250ms debounced persistence before closing/reloading it.
    await page.waitForFunction(saved=>{
      const s=JSON.parse(localStorage.getItem('fangorn-rpg-state')||'null');
      const c=s?.v3?.combats.find(x=>x.id===s.v3.activeCombatId);
      return c?.participants.map(p=>p.id).join('|')===saved.map(p=>p.id).join('|')&&document.querySelector('#save-state')?.textContent==='Salvo localmente';
    },saved);
    await page.reload();await page.waitForSelector('[data-enter-adventure]');
    assert.deepEqual(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants.map(p=>({id:p.id,sourceId:p.sourceId,sourceType:p.sourceType,hp:p.hpCurrent}))),saved);
    const downloadWait=page.waitForEvent('download');await page.evaluate(()=>RPGMasterHost.exportBackup());
    const download=await downloadWait,backup=fs.readFileSync(await download.path(),'utf8');
    assert.equal(JSON.parse(backup).state.v3.combats[0].participants.length,saved.length);
    await page.evaluate(()=>{const c=RPGV3.currentCombat(RPGMasterHost.getState());RPGV3.removeParticipant(c,c.participants[0].id)});
    acceptRestore=true;
    await page.evaluate(json=>RPGMasterHost.importBackup({target:{files:[new File([json],'qa-backup.json',{type:'application/json'})],value:''}}),backup);
    assert.deepEqual(await page.evaluate(()=>RPGV3.currentCombat(RPGMasterHost.getState()).participants.map(p=>({id:p.id,sourceId:p.sourceId,sourceType:p.sourceType,hp:p.hpCurrent}))),saved);
    assert.deepEqual(errors,[]);
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({roster,results,repeatedSelectionPass:true,missingAssetRecoveryPass:true,reloadPass:true,backupRoundTripPass:true,privateDataAbsent:true,errors},null,2));
    console.log(JSON.stringify({entities:roster.length,selectionChecks:results.length,errors}));
  }finally{await browser?.close();server.kill()}
}
run().catch(e=>{console.error(e);process.exitCode=1});
