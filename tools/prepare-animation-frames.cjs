/* Technical atlas unpacking: connected alpha silhouettes, never equal-width cuts.
   Each delivered PNG contains one pose only. Original art is never overwritten. */
const fs=require('fs'),path=require('path'),sharp=require('sharp');
async function isolate(file,count=4){
 const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});const {width:W,height:H}=info;
 const labels=new Int32Array(W*H),queue=new Int32Array(W*H),parts=[];let label=0;
 for(let p=0;p<W*H;p++){if(labels[p]||data[p*4+3]<=8)continue;label++;let start=0,end=1;queue[0]=p;labels[p]=label;const c={id:label,area:0,left:W,right:0,top:H,bottom:0,sx:0,sy:0};
  while(start<end){const q=queue[start++],x=q%W,y=Math.floor(q/W);c.area++;c.sx+=x;c.sy+=y;c.left=Math.min(c.left,x);c.right=Math.max(c.right,x);c.top=Math.min(c.top,y);c.bottom=Math.max(c.bottom,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy;if(xx<0||xx>=W||yy<0||yy>=H)continue;const n=yy*W+xx;if(!labels[n]&&data[n*4+3]>8){labels[n]=label;queue[end++]=n;}}
  }c.cx=c.sx/c.area;c.cy=c.sy/c.area;parts.push(c);
 }
 const bodies=parts.toSorted((a,b)=>b.area-a.area).slice(0,count).sort((a,b)=>a.cx-b.cx);
 if(bodies.length!==count||bodies.some((c,i)=>i&&c.cx-bodies[i-1].cx<W*.10)||bodies.some(c=>c.area<bodies[0].area*.16))throw Error('Ambiguous poses; manual inspection required: '+file);
 const assignment=new Int32Array(label+1);assignment.fill(-1);bodies.forEach((c,i)=>assignment[c.id]=i);
 for(const c of parts){if(assignment[c.id]>=0||c.area<8)continue;let best=0,score=Infinity;for(let i=0;i<bodies.length;i++){const b=bodies[i],dx=Math.max(b.left-c.cx,0,c.cx-b.right),dy=Math.max(b.top-c.cy,0,c.cy-b.bottom),s=dx*dx+dy*dy+.02*(b.cx-c.cx)**2;if(s<score){best=i;score=s;}}assignment[c.id]=best;}
 const frames=bodies.map(()=>({left:W,top:H,right:0,bottom:0,parts:[]}));for(const c of parts){const i=assignment[c.id];if(i<0)continue;const f=frames[i];f.left=Math.min(f.left,c.left);f.top=Math.min(f.top,c.top);f.right=Math.max(f.right,c.right);f.bottom=Math.max(f.bottom,c.bottom);f.parts.push(c.id);}
 const scale=Math.min(1,416/Math.max(...frames.map(f=>f.right-f.left+1)),416/Math.max(...frames.map(f=>f.bottom-f.top+1)));
 const output=[];for(let i=0;i<count;i++){const f=frames[i],w=f.right-f.left+1,h=f.bottom-f.top+1,raw=Buffer.alloc(w*h*4);
  for(let y=f.top;y<=f.bottom;y++)for(let x=f.left;x<=f.right;x++){const src=y*W+x;if(assignment[labels[src]]!==i)continue;data.copy(raw,((y-f.top)*w+x-f.left)*4,src*4,src*4+4);}
  const rw=Math.round(w*scale),rh=Math.round(h*scale),sprite=await sharp(raw,{raw:{width:w,height:h,channels:4}}).resize(rw,rh,{kernel:'nearest'}).png().toBuffer();
  const png=await sharp({create:{width:480,height:480,channels:4,background:'#0000'}}).composite([{input:sprite,left:Math.floor((480-rw)/2),top:448-rh}]).png().toBuffer();output.push({png,sourceBounds:f});
 }return {output,W,H,bodies,scale};
}
async function deliver(id,file){const r=await isolate(file),dir=path.resolve('assets/animation-frames/v4.4',id);fs.mkdirSync(dir,{recursive:true});for(let i=0;i<4;i++)fs.writeFileSync(path.join(dir,i+'.png'),r.output[i].png);return {id,frames:r.output.map((_,i)=>'assets/animation-frames/v4.4/'+id+'/'+i+'.png'),bounds:r.output.map(x=>x.sourceBounds),sourceSize:[r.W,r.H],scale:r.scale};}
module.exports={isolate,deliver};
if(require.main===module)deliver(process.argv[2],process.argv[3]).then(x=>console.log(JSON.stringify(x))).catch(e=>{console.error(e);process.exitCode=1});
