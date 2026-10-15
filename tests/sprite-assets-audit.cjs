/* Real asset inspection; contact sheet is QA evidence, never a game asset. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
global.window=global;require('../data/campaign-codex.js');require('../js/battle-catalog.js');
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa-v3.2.3');
async function run(){
 fs.mkdirSync(out,{recursive:true});const entries=Object.entries(RPGBattleCatalog.sprites),rows=[],tiles=[];
 for(let i=0;i<entries.length;i++){
  const [key,v]=entries[i],file=path.join(root,v.asset),meta=await sharp(file).metadata();
  assert(meta.hasAlpha,key+' alpha');const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let transparent=0,opaque=0;for(let p=3;p<data.length;p+=4){if(data[p]===0)transparent++;if(data[p]>96)opaque++}
  assert(transparent>info.width*info.height*.10,key+' transparent margin');assert(opaque>100,key+' nonempty');
  const columns=v.columns||4,w=Math.floor(meta.width/columns),frame=v.frame||0;
  const sprite=await sharp(file).extract({left:w*frame,top:0,width:w,height:meta.height}).resize(180,190,{fit:'inside',kernel:'nearest'}).toBuffer();
  const sm=await sharp(sprite).metadata(),left=(i%6)*210,top=Math.floor(i/6)*230;
  tiles.push({input:sprite,left:left+Math.floor((210-sm.width)/2),top:top+Math.floor((195-sm.height)/2)});
  tiles.push({input:Buffer.from(`<svg width="210" height="30"><text x="105" y="17" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#ead4a6">${key}</text></svg>`),left,top:top+198});
  rows.push({key,path:v.asset,columns,nativeFacing:v.nativeFacing||'right',width:meta.width,height:meta.height,transparentPixels:transparent,opaquePixels:opaque});
 }
 await sharp({create:{width:1260,height:Math.ceil(entries.length/6)*230,channels:4,background:'#14212c'}}).composite(tiles).png().toFile(path.join(out,'sprite-contact-sheet.png'));
 fs.writeFileSync(path.join(out,'assets.json'),JSON.stringify(rows,null,2));console.log(JSON.stringify({sprites:rows.length,transparent:true,contactSheet:'docs/qa-v3.2.3/sprite-contact-sheet.png'}));
}
run().catch(e=>{console.error(e);process.exitCode=1});
