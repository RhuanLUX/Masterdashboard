const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
global.window=global;
require('../data/campaign-codex.js');const original=JSON.parse(JSON.stringify(RPG_MASTER_CAMPAIGN_CODEX));
require('../data/library-expansion.js');require('../js/battle-catalog.js');require('../js/v3-core.js');require('../js/battle-core.js');
const p=RPG_LIBRARY_EXPANSION,state={characters:{},v2:{creatures:[],visualLibrary:[]}};global.RPGMasterHost={getState:()=>state};
assert.equal(p.entities.length,42);assert.equal(p.entities.filter(x=>x.kind==='npc').length,24);assert.equal(p.entities.filter(x=>x.kind==='monster').length,18);
assert.equal(p.classes.length,12);assert.equal(p.classes.flatMap(c=>c.subclasses).length,48);assert.equal(p.spells.length,36);
assert.equal(new Set(p.entities.map(x=>x.id)).size,42);assert.equal(new Set(p.entities.map(x=>x.image)).size,42);
const hashes=new Set();for(const x of p.entities){
  assert(x.source&&x.system&&x.description&&x.attack&&x.damage&&x.special&&x.actions&&x.resources&&x.saves&&x.skills&&x.senses&&x.languages&&x.resistances&&x.reactions&&x.equipment,x.id);
  assert(Number.isInteger(x.hp)&&x.hp>0&&x.ac>0,x.id);assert.equal(Object.keys(x.attributes).length,6);
  for(const n of Object.values(x.attributes))assert(Number.isInteger(n)&&n>=1&&n<=30,x.id);
  assert(!(x.level&&x.cr!=null));for(const id of x.spellIds)assert(p.spells.some(s=>s.id===id),`${x.id}: ${id}`);
  const image=fs.readFileSync(path.join(__dirname,'..',x.image));hashes.add(crypto.createHash('sha256').update(image).digest('hex'));
  const source=RPGBattleCatalog.source(state,'creature',x.id);assert.equal(source.hpMax,x.hp);assert.equal(source.ac,x.ac);assert.equal(source.image,x.image);
  assert.equal(RPG_MASTER_CAMPAIGN_CODEX.visualEntries.filter(v=>v.id===x.id).length,1,'imagem integrada na galeria '+x.id);
  const combat=RPGV3.createCombat(state,{title:x.name}),participant=RPGV3.addParticipant(combat,{sourceType:'creature',sourceId:x.id,team:'right'});
  assert.equal(participant.name,x.name);assert.equal(participant.hpMax,x.hp);assert.equal(participant.hpCurrent,x.hp);assert.equal(participant.damage,x.damage);assert.equal(participant.team,'right');
  const visual=RPGBattleCatalog.visualFor(participant,state);
  assert.equal(visual.asset,'assets/pixel-sprites/v4.3/'+x.id+'.png');assert.equal(visual.kind,'sheet');assert.equal(visual.fallback,false);
}
assert.equal(hashes.size,42,'cada entidade nova tem sua própria ilustração');
for(const c of p.classes){assert(fs.existsSync(path.join(__dirname,'..',c.image)));assert(c.subclasses.every(x=>x.feature.length>70));assert.equal(c.subclassLevel,3)}
for(const s of p.spells){assert(s.circle>=0&&s.circle<=3&&s.effect&&s.casting&&s.range&&s.duration&&s.components&&s.cost&&s.note);assert(s.classes.every(id=>p.classes.some(c=>c.id===id)));}
// Canonical supplied-book samples, independent of builder formulas (printed pp. 347, 352, 354, 359).
for(const [id,hp,ac,cr] of [['gato',2,12,'0'],['diabrete',21,13,'1'],['pseudodragao',10,14,'1/4'],['lobo',11,12,'1/4']]){const x=p.entities.find(x=>x.id==='exp-'+id);assert.deepEqual([x.hp,x.ac,x.cr],[hp,ac,cr])}
for(const kind of ['creatures','visualEntries'])for(const x of original[kind])assert.deepEqual(RPG_MASTER_CAMPAIGN_CODEX[kind].find(y=>y.id===x.id),x,'original preservado '+x.id);
const keys=RPGBattleCatalog.roster(state).map(x=>x.key);assert.equal(new Set(keys).size,keys.length);for(const x of p.entities)assert.equal(keys.filter(k=>k==='creature:'+x.id).length,1);
// Duplicated editable identities keep the original miniature on master AND public TV.
state.v2.creatures.push({...p.entities[0],id:'custom-brann',name:'Renomeado',miniatureKey:'creature:exp-berserker'});
const copied={sourceType:'creature',sourceId:'custom-brann',team:'left'};
const copiedVisual=RPGBattleCatalog.visualFor(copied,state);assert.equal(copiedVisual.asset,'assets/pixel-sprites/v4.3/exp-berserker.png');assert(!copiedVisual.fallback);
assert.deepEqual(RPGBattleCatalog.visualFor({...copied,arenaVisual:copiedVisual}),copiedVisual);
assert.equal(RPGBattleCatalog.visualFor({...copied,sourceId:'unrelated',arenaVisual:copiedVisual}).kind,'missing');
const validate=require('../js/platform-data.js').validateBackup;
const fixture={schemaVersion:5,state:{schemaVersion:5,app:{},characters:Object.fromEntries(['elenya','calion','nando','anao'].map(id=>[id,{id,name:id,info:{},combat:{},attributes:[],skills:[],powers:[],inventory:[],background:[],notes:[]} ])),v2:{spellLibrary:[structuredClone(p.spells[0])],ui:{compendium:{favorites:['entity:exp-berserker']}}}},images:[]};
assert.doesNotThrow(()=>validate(fixture));
for(const mutation of [x=>x.state.v2.spellLibrary={},x=>x.state.v2.spellLibrary[0].classes='mago',x=>x.state.v2.spellLibrary[0].circle=-1,x=>x.state.v2.spellLibrary[0].effect={},x=>x.state.v2.ui.compendium.favorites={},x=>x.state.v2.spellLibrary.push({...x.state.v2.spellLibrary[0]})]){const bad=structuredClone(fixture);mutation(bad);assert.throws(()=>validate(bad));}
assert.match(RPGBattleCatalog.source(state,'creature','exp-evocadora').details,/Mísseis Arcanos/);
assert.equal(RPGBattleCatalog.roster(state).find(x=>x.sourceId==='exp-berserker').group,'NPCs e entidades');
console.log('LIBRARY_EXPANSION_PASS: 42 fichas; 54 artes; 12 classes/48 subclasses; 36 magias; 42 vínculos de combate; sementes originais intactas.');
