/* Normalize delivery dimensions only; never regenerate or redraw the artwork. */
const sharp=require('sharp'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const jobs=require('./arena-miniature-subjects.json'),dir=path.resolve(__dirname,'../assets/pixel-sprites/v4.3');
(async()=>{
 const report=[];fs.mkdirSync('docs/qa-arena-enrichment',{recursive:true});
 for(const [id,reference,subject]of jobs){
  const file=path.join(dir,id+'.png'),input=fs.readFileSync(file),meta=await sharp(input).metadata();
  if(!meta.hasAlpha)throw Error('Missing alpha '+id);
  const normalized=await sharp(input).resize(480,480,{fit:'inside',withoutEnlargement:true,kernel:'nearest'}).png().toBuffer();
  const {data,info}=await sharp(normalized).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let left=info.width,right=0,top=info.height,bottom=0,clear=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const a=data[(y*info.width+x)*4+3];if(a<9)clear++;else{left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}}
  if(clear/data.length*4<.15||left<2||top<2||right>info.width-3||bottom>info.height-3)throw Error('Alpha or clipping issue '+id);
  fs.writeFileSync(file,normalized);report.push({id,asset:'assets/pixel-sprites/v4.3/'+id+'.png',reference:'assets/library-expansion/'+reference+'.webp',subject,width:info.width,height:info.height,bounds:{left,right,top,bottom},transparentFraction:clear/(info.width*info.height),sha256:crypto.createHash('sha256').update(normalized).digest('hex')});
 }
 fs.writeFileSync('docs/qa-arena-enrichment/asset-audit.json',JSON.stringify(report,null,2));
 for(let start=0;start<jobs.length;start+=14){const cells=await Promise.all(jobs.slice(start,start+14).map(async([id],j)=>{
   const art=await sharp(path.join(dir,id+'.png')).resize(140,145,{fit:'contain',background:'#18212b'}).png().toBuffer();
   const label=Buffer.from(`<svg width="140" height="20"><text x="5" y="14" fill="#edcf94" font-family="Arial" font-size="10">${id.slice(4)}</text></svg>`);
   return [{input:art,left:j%7*140,top:Math.floor(j/7)*170},{input:label,left:j%7*140,top:Math.floor(j/7)*170+145}];
 }));await sharp({create:{width:980,height:340,channels:4,background:'#18212b'}}).composite(cells.flat()).png().toFile(`docs/qa-arena-enrichment/miniatures-${start}.png`);}
 console.log('42 unique transparent miniatures normalized to maximum 480px.');
})().catch(e=>{console.error(e);process.exitCode=1});
