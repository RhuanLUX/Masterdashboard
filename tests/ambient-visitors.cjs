const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const c={window:{}};vm.createContext(c);vm.runInContext(fs.readFileSync('js/battle-ambience.js','utf8'),c);
const api=c.window.RPGBattleAmbience,report={};
for(const id of Object.keys(api.pools)){
 const config={id,seed:193482,epoch:0},types=new Set(),directions=new Set(),starts=[],slots=new Set();let maxVisible=0,active=0;
 for(let t=0;t<3*3600*1000;t+=125){const a=api.sample(config,t),b=api.sample({...config},t);assert.equal(JSON.stringify(a),JSON.stringify(b),'master/TV determinism');assert.equal(api.sample(config,t,true).length,0);
  maxVisible=Math.max(maxVisible,a.length);if(a.length)active++;
  for(const v of a){types.add(v.type);directions.add(v.direction);assert(v.frame>=0&&v.frame<4);assert(v.alpha>=0&&v.alpha<=1);assert(v.x>=-85&&v.x<=725);assert(v.y>20&&v.y<145);assert(v.size>0&&v.size<90);if(!slots.has(v.slot)){slots.add(v.slot);starts.push(t);}}
 }
 for(const type of new Set(api.pools[id]))assert(types.has(type),id+': '+type);
 assert.equal(directions.size,2);assert(maxVisible<=5);assert(active/(3*3600*8)<.5,'must remain occasional');
 assert(new Set(starts.slice(1).map((t,i)=>t-starts[i])).size>15,'intervals must vary');
 report[id]={types:[...types],events:slots.size,maxVisible,activeFraction:active/(3*3600*8),differentIntervals:new Set(starts.slice(1).map((t,i)=>t-starts[i])).size};
}
fs.mkdirSync('docs/qa-ambient-visitors',{recursive:true});fs.writeFileSync('docs/qa-ambient-visitors/schedule.json',JSON.stringify(report,null,2));console.log('AMBIENT_SCHEDULE_PASS',JSON.stringify(report));
