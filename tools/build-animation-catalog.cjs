/* Publish only complete, individually extracted four-frame animations. */
const fs=require('fs'),path=require('path'),sharp=require('sharp');
const jobs=JSON.parse(fs.readFileSync('tools/animation-jobs-v4.4.json','utf8'));
const original=['elenya','calion','nando','anao','uruk-hai-batedor','espectro-sombras'].map((id,i)=>({id,key:(i<4?'character:':'creature:')+id,name:id}));
(async()=>{
 const manifest={},complete=[],pending=[];
 for(const j of [...original,...jobs]){
  const frames=Array.from({length:4},(_,i)=>`assets/animation-frames/v4.4/${j.id}/${i}.png`);
  if(!frames.every(f=>fs.existsSync(f))){pending.push(j.id);continue;}
  for(const f of frames){const m=await sharp(f).metadata();if(m.width!==480||m.height!==480||!m.hasAlpha)throw Error('Bad frame '+f);}
  manifest[j.key]={frames,nativeFacing:j.id==='uruk-hai-batedor'?'left':'right'};
  if(j.id==='uruk-hai-batedor')manifest[j.key].frameFacings=['left','right','right','left'];
  complete.push(j);
 }
 fs.writeFileSync('data/combat-animations.js','/* Individual, foot-aligned PNG poses: ready, wind-up, strike, recovery. */\nwindow.RPG_BATTLE_ANIMATIONS=Object.freeze('+JSON.stringify(manifest,null,2)+');\n');
 const out='docs/qa-animation-magic';fs.mkdirSync(out,{recursive:true});
 for(let i=0;i<complete.length;i+=8){const group=complete.slice(i,i+8),pieces=[];
  for(let row=0;row<group.length;row++){const j=group[row],title=Buffer.from(`<svg width="800" height="24"><text x="8" y="17" fill="#ead7a0" font-family="Arial" font-size="14">${j.id}</text></svg>`);pieces.push({input:title,left:0,top:row*224});
   for(let k=0;k<4;k++)pieces.push({input:await sharp(manifest[j.key].frames[k]).resize(200,200,{kernel:'nearest'}).png().toBuffer(),left:k*200,top:row*224+24});
  }
  await sharp({create:{width:800,height:group.length*224,channels:3,background:'#11202a'}}).composite(pieces).png().toFile(path.join(out,'frames-'+String(i).padStart(2,'0')+'.png'));
 }
 console.log(JSON.stringify({complete:complete.length,pending}));
})().catch(e=>{console.error(e);process.exitCode=1});
