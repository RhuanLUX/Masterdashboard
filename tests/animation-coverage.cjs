const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),sharp=require('sharp'),crypto=require('crypto');
const context={window:{}};vm.createContext(context);
for(const file of ['data/campaign-codex.js','data/combat-animations.js','js/battle-catalog.js','js/battle-magic.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
(async()=>{
 const registry=context.window.RPG_BATTLE_ANIMATIONS,catalog=context.window.RPGBattleCatalog,rows=[];
 assert.equal(Object.keys(registry).length,75);assert.deepEqual(Object.keys(registry).sort(),Object.keys(catalog.sprites).sort());
 for(const [key,entry]of Object.entries(registry)){
  assert.equal(entry.frames.length,4);assert.equal(new Set(entry.frames).size,4);const hashes=[];
  for(const file of entry.frames){const bytes=fs.readFileSync(file);hashes.push(crypto.createHash('sha256').update(bytes).digest('hex'));
   const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,480);assert.equal(info.height,480);
   let left=480,top=480,right=0,bottom=0,filled=0;
   for(let i=0;i<480*480;i++)if(data[i*4+3]>8){const x=i%480,y=Math.floor(i/480);filled++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}
   assert(left>=30&&right<450&&top>=30&&bottom<450,key+' safety padding');assert(filled>500&&filled<480*480*.7,key+' alpha silhouette');
   rows.push({key,file,left,top,right,bottom});
  }
  assert.equal(new Set(hashes).size,4,key+' must articulate four distinct poses');
  const [sourceType,sourceId]=key.split(':'),v=catalog.visualFor({sourceType,sourceId});assert.equal(v.kind,'frames');assert.equal(v.fallback,false);
 }
 const magic=context.window.RPGBattleMagic;assert.equal(Object.keys(magic.names).length,13);
 for(const spell of Object.keys(magic.names)){const t=magic.timing('magic',spell);assert(t.impactDelay<t.duration&&t.impactDelay>0)}
 fs.mkdirSync('docs/qa-animation-magic',{recursive:true});fs.writeFileSync('docs/qa-animation-magic/frame-audit.json',JSON.stringify(rows,null,2));console.log('ANIMATION_COVERAGE_PASS: 75 identities, 300 separate non-duplicate frames, transparent safety padding, 13 visual spells.');
})().catch(e=>{console.error(e);process.exitCode=1});
