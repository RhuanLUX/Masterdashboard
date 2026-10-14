/* Stable identity, local overrides and intentional fallbacks; no browser/storage. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
global.window=global;require('../data/campaign-codex.js');require('../js/battle-catalog.js');
const C=RPGBattleCatalog;
const state={characters:Object.fromEntries(['elenya','calion','nando','anao'].map(id=>[id,{name:id,combat:{hpMax:20,hpCurrent:0,ac:15},background:[]}])),v2:{creatures:[],visualLibrary:[]}};
const roster=C.roster(state),keys=roster.map(x=>x.key);
assert.equal(keys.length,new Set(keys).size);
for(const key of ['character:elenya','character:calion','character:nando','character:anao','creature:goblin-lanceiro','creature:goblin-arqueiro','creature:goblin-espadachim','creature:uruk-hai-batedor','creature:uruk-hai-capitao','creature:espectro-sombras','creature:vigia-hrim','visual:barbarvore'])assert(keys.includes(key),key);
for(const entry of roster){
  const visual=C.visualFor(entry,state);
  assert.equal(visual.key,entry.key);
  if(visual.asset)assert(fs.existsSync(path.join(__dirname,'..',visual.asset)),visual.asset);
  if(visual.fallback)assert(visual.reason);
}
assert.equal(C.source(state,'character','elenya').hpCurrent,0);
require('../js/v3-core.js');require('../js/battle-core.js');global.RPGMasterHost={getState:()=>state};
const encounter=RPGV3.createCombat(state,{title:'Dados canônicos'});
assert.equal(RPGV3.addParticipant(encounter,{sourceType:'character',sourceId:'elenya'}).hpCurrent,0);
for(const [id,frame]of [['goblin-lanceiro',0],['goblin-arqueiro',1],['goblin-espadachim',2]])assert.equal(C.visualFor({sourceType:'creature',sourceId:id},state).frame,frame);
for(const id of ['vigia-hrim','uruk-hai-capitao']){
  const entry=roster.find(x=>x.key==='creature:'+id),visual=C.visualFor(entry,state);
  assert.equal(visual.kind,'portrait');assert.equal(visual.asset,entry.image);assert(!visual.asset.includes('goblins-roster'));
}
assert.equal(C.visualFor({sourceType:'visual',sourceId:'barbarvore'},state).asset,'assets/generated/codex/legends/barbarvore.jpg');
assert.equal(C.visualFor({sourceType:'visual',sourceId:'orc-inverno'},state).kind,'missing');
assert.equal(C.visualFor({sourceType:'creature',sourceId:'not-registered',name:'Goblin Lanceiro'},state).kind,'missing');
assert.equal(C.visualFor({sourceType:'visual',sourceId:'goblin-lanceiro',name:'Goblin Lanceiro'},state).kind,'missing');
assert.equal(C.visualFor({sourceType:'creature',sourceId:'custom',image:'assets/generated/creatures/vigia-de-hrim.png'},state).kind,'missing');
assert.equal(C.visualFor({sourceType:'visual',sourceId:'custom',image:'assets/fangorn_atmosphere_crop.jpg'},state).kind,'missing');
assert.equal(C.visualFor({sourceType:'creature',sourceId:'vigia-hrim',image:'WRONG-PREVIOUS-IMAGE'},state).asset,'assets/generated/creatures/vigia-de-hrim.png');
const original=C.creatures(state).find(x=>x.id==='vigia-hrim');
state.v2.visualLibrary.push({id:'vigia-hrim',name:'Vigia renomeado na biblioteca',image:original.image});
assert.equal(C.source(state,'creature','vigia-hrim').name,'Vigia renomeado na biblioteca');
state.v2.creatures.push({...original,name:'Vigia editado',hp:91,ac:19});
assert.equal(C.source(state,'creature','vigia-hrim').name,'Vigia editado');assert.equal(C.source(state,'creature','vigia-hrim').hpMax,91);
assert.equal(C.roster(state).filter(x=>x.sourceId==='vigia-hrim').length,1);
state.v2.creatures[0].archived=true;assert(!C.roster(state).some(x=>x.sourceId==='vigia-hrim'));
state.v2.visualLibrary.push({id:'custom-guard',name:'Guarda local',category:'NPC',image:'assets/generated/codex/npcs/guarda-minas-tirith.jpg'});
assert(C.roster(state).some(x=>x.key==='visual:custom-guard'));
state.v2.visualLibrary.push({id:'landscape',name:'Montanhas',category:'Cenário',image:'a.jpg'});
assert(!C.roster(state).some(x=>x.sourceId==='landscape'));
state.v2.visualLibrary.push({id:'pai-elenya',name:'Artesão combatente',category:'NPC',combatEligible:true});
assert(C.roster(state).some(x=>x.sourceId==='pai-elenya'));
assert.equal(C.source(state,'visual','barbarvore').hpMax,null); // no invented rules
console.log(`BATTLE_CATALOG_PASS entities=${roster.length} explicitFallbacks=${roster.filter(x=>C.visualFor(x,{...state,v2:{}}).fallback).length}`);
