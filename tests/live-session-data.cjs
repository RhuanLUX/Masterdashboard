const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os');
const {validateBackup}=require('../js/platform-data.js'),{CampaignStore}=require('../desktop/store.cjs');
(async()=>{
 const workspace={enabled:true,adventureId:'a5',pins:[{id:'creature:goblin',title:'Goblin',kind:'Criaturas',target:{type:'creature',id:'goblin'}}],reading:{a5:42}};
 const state={app:{liveWorkspace:workspace},characters:Object.fromEntries(['elenya','calion','nando','anao'].map(id=>[id,{id,name:id,combat:{},info:{},attributes:[],skills:[],powers:[],inventory:[],background:[],notes:[]}]))},backup={schemaVersion:5,state,images:[]};
 validateBackup(backup);const old=structuredClone(backup);delete old.state.app.liveWorkspace;validateBackup(old);
 for(const value of [null,[],{pins:[null]},{reading:{a5:-1}},{reading:{a5:'5'}},{enabled:'yes'},{pins:Array(13).fill(workspace.pins[0])}]){const invalid=structuredClone(backup);invalid.state.app.liveWorkspace=value;assert.throws(()=>validateBackup(invalid))}
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'rpg-live-backup-')),store=new CampaignStore(dir);await store.save(backup);assert.deepEqual((await store.load()).state.app.liveWorkspace,workspace);
 const changed=structuredClone(backup);changed.state.app.liveWorkspace.pins=[];await store.save(changed,{forceBackup:true});const recovery=await store.readRecovery((await store.list())[0].id);assert.deepEqual(recovery.state.app.liveWorkspace,workspace);await store.save(recovery);assert.deepEqual((await store.load()).state.app.liveWorkspace,workspace);
 console.log('LIVE_DATA_PASS: optional metadata; invalid state rejected; references and reading locations roundtrip through backup and recovery.');
})().catch(e=>{console.error(e);process.exitCode=1});
