const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),ctx={window:{RPGBattleCatalog:{incapacitated:p=>p.hpCurrent===0||p.incapacitated}}};
for(const file of ['data/battle-dialogue.js','js/battle-life.js'])vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),ctx);
const {RPGDialogueBank:bank,RPGBattleLife:life}=ctx.window,report={pools:[],simulations:[]},texts=new Set(),keys=new Set();
for(const voice of bank.voices)for(const type of bank.contexts){const pool=bank.pool(voice,type);assert(pool.length>=1801,voice+':'+type+' too small');for(const e of pool){assert(!texts.has(e.text),'duplicate text: '+e.text);assert(!keys.has(e.key));assert(e.text.length<=110,'bubble truncation: '+e.text);texts.add(e.text);keys.add(e.key)}report.pools.push({voice,type,count:pool.length})}
const seeded=n=>()=>((n=(n*16807)%2147483647)/2147483647);
const participant=voice=>({id:'speaker',sourceType:voice==='hero'?'character':'creature',team:voice==='hero'?'left':'right',type:voice==='beast'?'Dragão':'Humanoide',hpCurrent:1000000});
// Worst-case 3h for each individual pool, including 6s event cadence. Recreate
// the director from serialized data halfway through to verify persisted exclusion.
for(const voice of bank.voices)for(const type of bank.contexts){
 let combat={id:voice+type,status:type==='inspire'?'active':'setup',participants:[participant(voice)]},events=[],random=()=>0;
 let director=life.createDirector({random,emit:e=>events.push(e)});director.tick(combat,0);
 for(let t=500;t<=10800000;t+=500){
  if(type==='attack'&&t%6000===500)director.action(combat,{actorId:'speaker',kind:'melee'},t);
  if(type==='received'&&t%6000===500)combat.participants[0].hpCurrent--;
  director.tick(combat,t);
  if(t===5400000){combat=JSON.parse(JSON.stringify(combat));director=life.createDirector({random,emit:e=>events.push(e)});director.tick(combat,t);}
 }
 assert(events.length>(type==='inspire'?1100:1750),`${voice}/${type}: ${events.length}`);assert(events.every(e=>e.context===type));assert.equal(new Set(events.map(e=>e.text)).size,events.length);assert.equal(combat.dialogueMemory.used.length,events.length);
 report.simulations.push({voice,type,hours:3,count:events.length,repeats:0,reload:true});
}
// Mixed heroes/foes, all contexts, combat switches and copies.
const events=[],rng=seeded(73);let combat={id:'mixed',status:'active',participants:[{...participant('hero'),id:'hero'},{...participant('foe'),id:'foe'}]},d=life.createDirector({random:rng,emit:e=>events.push(e)});d.tick(combat,0);
for(let t=500;t<=10800000;t+=500){if(t%8000===500){const swap=t%16000===500,actorId=swap?'hero':'foe',targetId=swap?'foe':'hero';combat.participants.find(p=>p.id===targetId).hpCurrent--;d.action(combat,{actorId,targetId,kind:'magic',damage:1},t)}d.tick(combat,t)}
assert.equal(new Set(events.map(e=>e.text)).size,events.length);assert.deepEqual(new Set(events.map(e=>e.context)),new Set(['received','attack','inspire']));assert(events.every((e,i)=>!i||e.at-events[i-1].at>=6000));
const before=new Set(events.map(e=>e.text));d.tick(null,10801000);d.tick(combat,10802000);d.tick(combat,10900000);assert(!before.has(events.at(-1).text),'switch resumed repeats');
const copied=JSON.parse(JSON.stringify(combat));copied.id='copy';d.tick(copied,11000000);d.tick(copied,11030000);assert.equal(copied.dialogueMemory.used.length,1,'copy inherited used phrases');assert.equal(copied.dialogueMemory.owner,'copy');
const starts=new Set();for(let i=0;i<30;i++){const c={id:'new'+i,status:'active',participants:[participant('hero')]};let first;const nd=life.createDirector({random:seeded(9123+i*3001),emit:e=>first=e.text});nd.tick(c,0);nd.tick(c,30000);starts.add(first)}assert(starts.size>25,'fixed first phrase');
// Declared miss/heal cannot create an attack reaction. No numeric/private state
// is ever embedded in an outgoing speech descriptor.
const silent=[],idle={id:'idle',status:'setup',participants:[participant('hero')]},sd=life.createDirector({random:()=>0,emit:e=>silent.push(e)});sd.tick(idle,0);sd.action(idle,{actorId:'speaker',kind:'heal'},500);sd.tick(idle,2000);sd.action(idle,{actorId:'speaker',kind:'magic',outcome:'fail'},3000);sd.tick(idle,5000);assert.equal(silent.length,0);
assert.equal(bank.voice({...participant('beast'),team:'left'}),'beast','allied beast should not speak as human');
report.total=texts.size;report.mixed={hours:3,count:events.length-2,repeats:0,contexts:['received','attack','inspire']};report.randomNewStarts=starts.size;report.duplicateFresh=true;report.resumeAndReload=true;
const out=path.join(root,'docs/qa-dialogue-v2');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'simulation.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
