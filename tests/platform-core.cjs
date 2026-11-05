const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {CampaignStore}=require('../desktop/store.cjs'),{validateBackup}=require('../js/platform-data.js');
global.window=global;require('../data/roster-data.js');require('../js/character-sheets.js');
function fixture(){return {schemaVersion:4,app:{},characters:Object.fromEntries(FANGORN_ROSTER.characters.map(x=>[x.id,{id:x.id,name:x.displayName,info:{race:'—'},combat:{hpCurrent:'—',hpMax:'—',ac:'—'},attributes:[],skills:[],powers:[],inventory:[],background:x.source.sourceParagraphs||[],notes:[]}]))}}
(async()=>{
 const state=fixture();state.characters.elenya.combat.hpCurrent='8';state.characters.elenya.info.race='Raça do mestre';state.characters.calion.powers=[['Magia do mestre']];state.characters.calion.background=['História editada'];
 RPGSheets.migrate(state);assert.equal(state.characters.elenya.combat.hpCurrent,'8');assert.equal(state.characters.elenya.combat.hpMax,'14');assert.equal(state.characters.elenya.info.race,'Raça do mestre');assert.deepEqual(state.characters.calion.powers,[['Magia do mestre']]);assert.deepEqual(state.characters.calion.background,['História editada']);assert.equal(state.characters.calion.combat.ac,'13');assert.equal(state.characters.elenya.inventory.length,2);assert.equal(state.characters.anao.resources.length,5);
 const migrated=JSON.stringify(state);RPGSheets.migrate(state);assert.equal(JSON.stringify(state),migrated);
 const backup={schemaVersion:5,state,images:[]};validateBackup(backup);for(const change of [x=>delete x.state.characters.anao,x=>x.state.characters.calion.attributes=null,x=>x.state.v2={adventures:{}},x=>x.images=[{id:'unsafe',data:'https://example.com/image.png'}],x=>x.state.schemaVersion=999]){const x=structuredClone(backup);change(x);assert.throws(()=>validateBackup(x))}
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'rpg-platform-core-')),store=new CampaignStore(dir);assert.equal(await store.load(),null);await store.save(backup);
 const next=structuredClone(backup);next.state.characters.elenya.name='Elenya modificada';await store.save(next,{forceBackup:true});assert.equal((await store.load()).state.characters.elenya.name,'Elenya modificada');const list=await store.list();assert.equal(list.length,1);assert.equal((await store.readRecovery(list[0].id)).state.characters.elenya.name,'Elenya');
 await Promise.all(Array.from({length:6},(_,i)=>{const x=structuredClone(backup);x.state.app.order=i;return store.save(x)}));assert.equal((await store.load()).state.app.order,5);
 const before=await fs.readFile(store.file,'utf8');assert.throws(()=>store.save({}));assert.equal(await fs.readFile(store.file,'utf8'),before);await fs.writeFile(store.file,'{broken');const recovered=await store.load();assert(recovered.recovered);assert.equal(recovered.state.characters.elenya.name,'Elenya');assert.rejects(()=>store.readRecovery('../campaign.json'));
 await store.save(recovered);assert.equal((await store.load()).state.characters.elenya.name,'Elenya');
 console.log('PLATFORM_CORE_PASS: migrations preserve edits; idempotence; backup validation; atomic disk writes; serialized saves; recovery from corrupt file.');
 // Leave this isolated temporary evidence in the OS temp directory; never touch campaign data.
})().catch(e=>{console.error(e);process.exitCode=1});
