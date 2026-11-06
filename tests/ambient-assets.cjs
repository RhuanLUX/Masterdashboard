const fs=require('fs'),vm=require('vm'),crypto=require('crypto'),assert=require('node:assert/strict'),sharp=require('sharp');
(async()=>{const c={window:{}};vm.runInNewContext(fs.readFileSync('data/ambient-frames.js','utf8'),c);const manifest=c.window.RPG_AMBIENT_FRAMES,report=[];
 for(const [id,a]of Object.entries(manifest)){
  assert.equal(a.frames.length,4);assert.equal(a.anchors.length,4);const unique=new Set();
  for(let frame=0;frame<4;frame++){
   const file=a.frames[frame],bytes=fs.readFileSync(file),hash=crypto.createHash('sha256').update(bytes).digest('hex');unique.add(hash);
   const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.equal(info.width,480);assert.equal(info.height,480);
   let opaque=0,left=480,right=0,top=480,bottom=0;
   for(let y=0;y<480;y++)for(let x=0;x<480;x++)if(data[(y*480+x)*4+3]>8){opaque++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y)}
   assert(opaque>5000&&opaque<480*480*.7,id+' alpha');assert(left>=24&&right<456&&top>=24&&bottom<456,id+' safety gutter');
   assert(a.anchors[frame].every(n=>Number.isFinite(n)&&n>0&&n<1.02),id+' registration');
   report.push({id,frame,file,hash,opaque,bounds:{left,right,top,bottom},anchor:a.anchors[frame]});
  }assert.equal(unique.size,4,id+' distinct poses');
 }
 assert.equal(report.length,20);fs.writeFileSync('docs/qa-ambient-visitors/assets.json',JSON.stringify(report,null,2));console.log('AMBIENT_ASSETS_PASS',report.length);
})().catch(e=>{console.error(e);process.exitCode=1});
