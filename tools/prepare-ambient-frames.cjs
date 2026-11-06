/* Technical unpacking of generated art: one transparent PNG per pose.
   Registration points were inspected on the 2048px-wide source previews. */
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {isolate}=require('./prepare-animation-frames.cjs');
const reference={
 raven:[[304,359],[818,359],[1331,359],[1843,359]],
 eagle:[[293,382],[806,382],[1302,382],[1828,382]],
 owl:[[298,359],[807,359],[1318,359],[1833,359]],
 stag:[[245,487],[755,487],[1267,487],[1780,487]],
 caravan:[[245,450],[757,450],[1269,450],[1781,450]]
};
async function build(input='tmp/ambient-441'){
 const manifest={},audit=[];
 for(const [id,points]of Object.entries(reference)){
  const file=path.join(input,id+'.png'),r=await isolate(file),dir='assets/battle-scenes/visitors/v4.4.1/'+id;
  fs.mkdirSync(dir,{recursive:true});const anchors=[],frames=[];
  for(let i=0;i<4;i++){
   const f=r.output[i],b=f.sourceBounds,w=Math.round((b.right-b.left+1)*r.scale),h=Math.round((b.bottom-b.top+1)*r.scale),[x,y]=points[i].map(n=>n*r.W/2048);
   anchors.push([(Math.floor((480-w)/2)+(x-b.left)*r.scale)/480,(448-h+(y-b.top)*r.scale)/480].map(n=>+n.toFixed(6)));
   frames.push(dir+'/'+i+'.png');fs.writeFileSync(frames[i],f.png);
  }
  manifest[id]={frames,width:Math.max(...r.output.map(f=>(f.sourceBounds.right-f.sourceBounds.left+1)*r.scale)),anchors};
  audit.push({id,source:path.basename(file),sourceHash:crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),sourceSize:[r.W,r.H],scale:r.scale,bounds:r.output.map(f=>f.sourceBounds),...manifest[id]});
 }
 fs.writeFileSync('data/ambient-frames.js','/* Local, individually isolated four-pose scenery sprites. */\nwindow.RPG_AMBIENT_FRAMES = '+JSON.stringify(manifest,null,2)+';\n');
 fs.mkdirSync('docs/qa-ambient-visitors',{recursive:true});fs.writeFileSync('docs/qa-ambient-visitors/frames.json',JSON.stringify(audit,null,2));console.log('AMBIENT_FRAMES',audit.map(a=>({id:a.id,size:a.sourceSize,width:a.width})));
}
if(require.main===module)build(process.argv[2]).catch(e=>{console.error(e);process.exitCode=1});
module.exports={build};
