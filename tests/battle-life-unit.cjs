const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const context={window:{RPGBattleCatalog:{incapacitated:p=>p.hpCurrent===0||p.incapacitated}}};
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../data/battle-dialogue.js'),'utf8'),context);
vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../js/battle-life.js'),'utf8'),context);
const create=context.window.RPGBattleLife.createDirector;
const make=()=>({id:'encounter',status:'active',participants:[{id:'hero',sourceType:'character',hpCurrent:100},{id:'orc',sourceType:'creature',type:'Orc',hpCurrent:100},{id:'dead',sourceType:'character',hpCurrent:0}]});
let seed=7;const random=()=>((seed=(seed*16807)%2147483647)/2147483647);
const events=[],director=create({random,emit:l=>events.push(l)}),c=make();const before=JSON.stringify(c);
for(let t=0;t<=600000;t+=500)director.tick(c,t);
assert(events.length>=28&&events.length<=64);assert.deepEqual(new Set(events.map(e=>e.speakerId)),new Set(['hero','orc']));
const gaps=events.slice(1).map((e,i)=>e.at-events[i].at);assert(gaps.every(g=>g>=28000/3&&g<=65000/3+500));assert(new Set(gaps).size>3);
for(let i=1;i<events.length;i++){assert.notEqual(events[i].speakerId,events[i-1].speakerId);assert.notEqual(events[i].text,events[i-1].text)}
const {dialogueMemory,...rules}=c;assert.equal(JSON.stringify(rules),before);assert(!events.some(e=>e.speakerId==='dead'));assert.equal(new Set(events.map(e=>e.text)).size,events.length);assert.equal(dialogueMemory.used.length,events.length);
const hits=[],d=create({random:()=>0,emit:l=>hits.push(l)}),fight=make();d.tick(fight,0);fight.participants[0].hpCurrent=90;d.tick(fight,1000);d.tick(fight,2000);assert.equal(hits.length,0);d.tick(fight,2500);assert.equal(hits[0].tone,'fear');assert.equal(hits[0].speakerId,'hero');
for(let t=3000;t<8000;t+=500){fight.participants[0].hpCurrent--;d.tick(fight,t)}assert.equal(hits.length,1);
fight.participants[1].hpCurrent=90;d.tick(fight,8000);fight.participants[1].hpCurrent=0;d.tick(fight,9300);assert.equal(hits.length,1,'fallen speaker must not speak');
fight.status='ended';d.tick(fight,90000);assert.equal(hits.length,1);d.tick(null,100000);fight.status='active';d.tick(fight,200000);assert.equal(hits.length,1,'return must not replay overdue lines');
fight.status='setup';d.tick(fight,500000);assert.equal(hits.length,1);
console.log(JSON.stringify({tenMinutes:events.length,randomIntervals:gaps,noDeadSpeakers:true,damageCooldown:true,endedAndSetupSilent:true,rulesUnchanged:true}));
