/* RPG Master — camada global de ambientação, sem dependências externas. */
(()=>{'use strict';
const themeLabels=Object.freeze({normal:'Normal',winter:'Natal / Inverno',horror:'Terror / Halloween',medieval:'Castelo Medieval',dragon:'Reino dos Dragões',elven:'Bosque Élfico'});
window.RPGThemeLabels=themeLabels;
const validThemes=new Set(Object.keys(themeLabels));
const atmosphereThemes=new Set(['medieval','dragon','elven']);
const crest='<svg viewBox="0 0 100 160"><path d="M8 0H92V119L50 154 8 119Z" fill="#531d2c" stroke="#b99a5f" stroke-width="2"/><path d="M17 0V114L50 141 83 114V0M28 48H72V91L50 109 28 91Z" fill="none" stroke="#b99a5f"/><path d="M35 80V58H43V66H57V58H65V80M32 80H68V94H32ZM46 94V83H54V94" fill="#c3a873"/></svg>';
const random=(min,max)=>min+Math.random()*(max-min);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
// Original vector silhouette: separate mirrored structure from wing animation.
// No bitmap download, emoji or external artwork; crisp at every depth.
const batArt=`<svg viewBox="-50 -30 100 60" aria-hidden="true" focusable="false">
 <defs><linearGradient id="bat-membrane" x2="0.2" y2="1"><stop stop-color="#292331"/><stop offset="1" stop-color="#0b0b12"/></linearGradient></defs>
 <g class="bat-wing bat-wing-left"><path d="M-3,-3 Q-14,-17 -25,-15 Q-33,-18 -46,-24 Q-43,-8 -36,5 Q-31,-6 -25,0 Q-22,4 -21,11 Q-16,3 -12,8 L-4,14 Z" fill="url(#bat-membrane)" stroke="#716477" stroke-opacity=".4" stroke-width=".6"/>
 <path d="M-5,1 Q-21,-9 -45,-23 M-5,2 Q-21,-9 -36,4 M-5,3 Q-17,-6 -21,10" fill="none" stroke="#9a839f" stroke-opacity=".17" stroke-width=".7"/></g>
 <g transform="scale(-1 1)"><g class="bat-wing bat-wing-right"><path d="M-3,-3 Q-14,-17 -25,-15 Q-33,-18 -46,-24 Q-43,-8 -36,5 Q-31,-6 -25,0 Q-22,4 -21,11 Q-16,3 -12,8 L-4,14 Z" fill="url(#bat-membrane)" stroke="#716477" stroke-opacity=".4" stroke-width=".6"/>
 <path d="M-5,1 Q-21,-9 -45,-23 M-5,2 Q-21,-9 -36,4 M-5,3 Q-17,-6 -21,10" fill="none" stroke="#9a839f" stroke-opacity=".17" stroke-width=".7"/></g></g>
 <path d="M-4,7 L0,20 L4,7" fill="#0b0b12"/>
 <ellipse cy="3" rx="4.7" ry="10" fill="#111019"/>
 <path d="M-4,-5 L-5,-15 L-1,-10 Q0,-11 1,-10 L5,-15 L4,-5 Q0,0 -4,-5" fill="#17131e" stroke="#716477" stroke-opacity=".35" stroke-width=".5"/>
 <path d="M-1,0 Q-2,6 0,11" fill="none" stroke="#6f596f" stroke-opacity=".24" stroke-width="1"/>
</svg>`;

class ThemeManager{
  constructor(){
    this.active='normal';this.root=null;this.canvas=null;this.ctx=null;this.particles=[];
    this.frame=0;this.last=0;this.paused=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.batLayer=null;this.batTimer=0;this.batSpawnTimers=[];this.activeBats=new Set();this.atmosphere=null;this.dragons=new Set();this.dragonTimers=new Set();
    this.resize=this.resize.bind(this);this.tick=this.tick.bind(this);this.visibility=this.visibility.bind(this);
  }
  initialize(){
    if(this.root)return;
    this.root=document.createElement('div');this.root.id='theme-effects';this.root.className='theme-effects';this.root.setAttribute('aria-hidden','true');
    this.root.innerHTML='<canvas class="theme-snow"></canvas><div class="theme-horror"><div class="theme-fog theme-fog-a"></div><div class="theme-fog theme-fog-b"></div><div class="theme-bat-layer"></div><div class="theme-pumpkin"><span></span></div></div>';
    document.body.append(this.root);this.canvas=this.root.querySelector('.theme-snow');this.ctx=this.canvas.getContext('2d');this.batLayer=this.root.querySelector('.theme-bat-layer');
    addEventListener('resize',this.resize,{passive:true});document.addEventListener('visibilitychange',this.visibility);this.resize();
  }
  activate(name){
    name=validThemes.has(name)?name:'normal';this.initialize();
    if(this.active===name){
      this.root.dataset.theme=name;document.documentElement.dataset.rpgTheme=name;
      if(name==='winter')this.startWinter();if(name==='horror')this.startHorror();if(atmosphereThemes.has(name))this.startAtmosphere();return;
    }
    this.deactivate();this.active=name;this.root.dataset.theme=name;document.documentElement.dataset.rpgTheme=name;
    if(name==='winter')this.startWinter();if(name==='horror')this.startHorror();if(atmosphereThemes.has(name))this.startAtmosphere();
  }
  deactivate(){this.stopWinter();this.stopHorror();this.stopAtmosphere();if(this.root)this.root.dataset.theme='normal';document.documentElement.dataset.rpgTheme='normal'}
  pause(){this.paused=true;this.root?.classList.add('effects-paused');this.stopFrame();this.stopBatTimer();this.dragons.forEach(d=>d.animation?.pause());this.activeBats.forEach(bat=>bat.node.getAnimations({subtree:true}).forEach(a=>a.pause()))}
  resume(){this.paused=false;this.root?.classList.remove('effects-paused');this.dragons.forEach(d=>d.animation?.play());this.activeBats.forEach(bat=>bat.node.getAnimations({subtree:true}).forEach(a=>a.play()));if(this.active==='winter'&&!this.reduced)this.startFrame();if(this.active==='horror')this.startHorror()}
  destroy(){this.stopWinter();this.stopHorror();this.stopAtmosphere();removeEventListener('resize',this.resize);document.removeEventListener('visibilitychange',this.visibility);this.root?.remove();this.root=this.canvas=this.ctx=this.batLayer=null}
  stopAtmosphere(){this.dragonTimers.forEach(clearTimeout);this.dragonTimers.clear();this.dragons.forEach(d=>d.animation?.cancel());this.dragons.clear();this.atmosphere?.remove();this.atmosphere=null}
  startAtmosphere(){
    if(this.atmosphere)return;
    const node=document.createElement('div');node.className='theme-atmosphere atmosphere-'+this.active;this.atmosphere=node;this.root.append(node);
    if(this.active==='medieval')node.innerHTML=`<div class="theme-standard left">${crest}</div><div class="theme-standard right">${crest}</div><div class="theme-torch left"></div><div class="theme-torch right"></div>`;
    if(this.active==='dragon')node.innerHTML='<div class="theme-ember-haze"></div>';
    if(this.active==='elven')node.innerHTML='<div class="theme-moon"></div><div class="theme-branch left">❧</div><div class="theme-branch right">❧</div>';
    if(this.reduced)return;
    if(this.active==='dragon'){const dragons=this.intensity==='soft'?2:this.intensity==='intense'?5:3;for(let i=0;i<dragons;i++)this.spawnDragon(node,i,true)}
    const count=this.intensity==='soft'?10:this.intensity==='intense'?30:18;
    for(let i=0;i<count;i++){const p=document.createElement('i');p.className='ambience-mote';p.style.cssText=`--x:${random(2,98)}vw;--y:${random(12,95)}vh;--drift:${random(-65,65)}px;--duration:${random(7,18)}s;--delay:${random(-20,0)}s;--size:${random(2,4)}px`;node.append(p);}
  }
  spawnDragon(layer,index,initial=false){
    if(this.active!=='dragon'||!layer.isConnected||this.reduced)return;
    const node=document.createElement('div');node.className='theme-dragon-flight';
    const direction=Math.random()<.5?1:-1,width=random(index===0?160:85,index===0?235:150);
    node.style.cssText=`width:${width}px;--direction:${direction};--flap:${random(.65,.95)}s;--wing-delay:${random(-2,0)}s;`;
    node.innerHTML='<div class="dragon-body"><span class="dragon-sprite"></span></div>';layer.append(node);
    const startX=direction===1?-width:innerWidth+width,endX=direction===1?innerWidth+width:-width;
    const startY=random(90,innerHeight*.63),endY=clamp(startY+random(-150,150),70,innerHeight*.7),curve=random(-100,100),duration=random(18000,29000);
    const frames=Array.from({length:49},(_,i)=>{const t=i/48,x=startX+(endX-startX)*t,y=startY+(endY-startY)*t+Math.sin(t*Math.PI)*curve+Math.sin(t*4*Math.PI)*8;
      return {offset:t,transform:`translate3d(${x}px,${y}px,0) rotate(${Math.cos(t*Math.PI)*direction*5}deg)`,opacity:t<.08?t/.08*.42:t>.9?(1-t)/.1*.42:.42}});
    const animation=node.animate(frames,{duration,fill:'both',easing:'linear'}),dragon={node,animation};this.dragons.add(dragon);
    if(initial)animation.currentTime=duration*(.12+(index%5)*.15);if(this.paused||document.hidden)animation.pause();
    animation.onfinish=()=>{this.dragons.delete(dragon);node.remove();if(!layer.isConnected)return;const timer=setTimeout(()=>{this.dragonTimers.delete(timer);this.spawnDragon(layer,index)},random(1200,4500));this.dragonTimers.add(timer)};
  }
  visibility(){document.hidden?this.pause():this.resume()}
  resize(){
    if(!this.canvas)return;let ratio=Math.min(devicePixelRatio||1,1.5),w=innerWidth,h=innerHeight;
    this.canvas.width=Math.max(1,Math.floor(w*ratio));this.canvas.height=Math.max(1,Math.floor(h*ratio));this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';
    this.ctx.setTransform(ratio,0,0,ratio,0,0);this.width=w;this.height=h;if(this.active==='winter')this.seed();
  }
  seed(){if(this.reduced){this.particles=[];return}let slow=(navigator.hardwareConcurrency||4)<=4,count=Math.max(28,Math.min(slow?42:68,Math.round((this.width*this.height)/26000)));this.particles=Array.from({length:count},()=>this.flake(true))}
  flake(initial=false){let depth=.55+Math.random()*.85;return{x:Math.random()*this.width,y:initial?Math.random()*this.height:-12,r:(.8+Math.random()*2.4)*depth,speed:(17+Math.random()*35)*depth,drift:-10+Math.random()*20,amp:4+Math.random()*16,phase:Math.random()*Math.PI*2,phaseSpeed:.45+Math.random()*.9,alpha:.18+Math.random()*.38,color:Math.random()<.3?'#cae7ff':'#f4fbff'}}
  startWinter(){this.seed();if(!this.reduced&&!document.hidden)this.startFrame()}
  stopWinter(){this.stopFrame();if(this.ctx&&this.canvas)this.ctx.clearRect(0,0,this.width||0,this.height||0);this.particles=[]}
  startFrame(){if(!this.frame)this.frame=requestAnimationFrame(this.tick)}
  stopFrame(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
  tick(time){
    this.frame=0;if(this.paused||this.active!=='winter'||this.reduced)return;
    let dt=this.last?Math.min(.05,(time-this.last)/1000):.016;this.last=time;let c=this.ctx;c.clearRect(0,0,this.width,this.height);
    for(let p of this.particles){p.phase+=p.phaseSpeed*dt;p.y+=p.speed*dt;p.x+=p.drift*dt+Math.sin(p.phase)*p.amp*dt;if(p.y>this.height+14||p.x<-18||p.x>this.width+18)Object.assign(p,this.flake(false));c.beginPath();c.fillStyle=p.color;c.globalAlpha=p.alpha;c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill()}
    c.globalAlpha=1;this.frame=requestAnimationFrame(this.tick);
  }
  startHorror(){if(this.reduced||document.hidden||this.paused||this.batTimer)return;this.scheduleBatWave(160+Math.random()*280)}
  stopBatTimer(){if(this.batTimer)clearTimeout(this.batTimer);this.batTimer=0;this.batSpawnTimers.splice(0).forEach(clearTimeout)}
  stopHorror(){this.stopBatTimer();this.activeBats.forEach(bat=>{bat.animation?.cancel();bat.node.remove()});this.activeBats.clear()}
  scheduleBatWave(delay){
    this.batTimer=setTimeout(()=>{
      this.batTimer=0;if(this.active!=='horror'||this.paused||document.hidden||this.reduced)return;
      const group=Math.random()<.38?2+Math.floor(Math.random()*3):1;
      for(let index=0;index<group;index++){const timer=setTimeout(()=>{this.batSpawnTimers=this.batSpawnTimers.filter(id=>id!==timer);this.spawnBat(index,group)},index*random(105,310));this.batSpawnTimers.push(timer)}
      const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
      this.scheduleBatWave(random(540,1320)/factor);
    },delay);
  }
  spawnBat(index,group){
    const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
    if(this.active!=='horror'||this.paused||document.hidden||this.reduced||!this.batLayer||this.activeBats.size>=Math.round(14*factor))return;
    const close=Math.random()<.19,fromLeft=Math.random()<.56,wide=this.width||innerWidth,tall=this.height||innerHeight;
    const scale=close?random(1.15,1.85):random(.38,.92),duration=random(3300,7200),startX=fromLeft?-72*scale:wide+72*scale,endX=fromLeft?wide+72*scale:-72*scale;
    const startY=clamp(random(tall*.07,tall*.86)+(group>1?(index-(group-1)/2)*random(22,58):0),28,tall-28);
    const endY=clamp(startY+random(-tall*.34,tall*.34),22,tall-20),curveX=wide*.5+random(-wide*.22,wide*.22),curveY=clamp((startY+endY)/2+random(-tall*.29,tall*.29),18,tall-18);
    const node=document.createElement('div');node.className=`theme-bat${close?' theme-bat-close':''}`;node.innerHTML=batArt;
    // Unique SVG paint server per instance (no duplicate document IDs).
    const paintId='bat-'+Math.random().toString(36).slice(2);node.innerHTML=node.innerHTML.replaceAll('bat-membrane',paintId);
    node.style.setProperty('--bat-opacity',String(close?random(.78,.94):random(.4,.75)));node.style.setProperty('--wing-speed',`${random(.29,.43)}s`);node.style.setProperty('--wing-delay',`${-random(0,1)}s`);node.style.zIndex=close?'5':String(2+Math.floor(Math.random()*2));this.batLayer.append(node);
    const transform=(x,y,angle,amount)=>`translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale(${amount})`;
    const opacity=Number(node.style.getPropertyValue('--bat-opacity'));
    const phase=random(0,Math.PI*2),sway=random(5,16),keyframes=[];
    for(let i=0;i<=32;i++){
      const t=i/32,u=1-t,x=u*u*startX+2*u*t*curveX+t*t*endX;
      const y=u*u*startY+2*u*t*curveY+t*t*endY+Math.sin(t*Math.PI*4+phase)*sway*Math.sin(t*Math.PI);
      const vx=2*u*(curveX-startX)+2*t*(endX-curveX),vy=2*u*(curveY-startY)+2*t*(endY-curveY);
      const bank=clamp(Math.atan2(vy,Math.abs(vx))*180/Math.PI*(fromLeft?1:-1),-28,28)+Math.sin(t*Math.PI*3+phase)*5;
      keyframes.push({offset:t,transform:transform(x,y,bank,scale*(.88+.12*Math.sin(t*Math.PI))),opacity:opacity*Math.min(1,t*9,(1-t)*9)});
    }
    const animation=node.animate(keyframes,{duration,easing:'linear',fill:'forwards'});
    const bat={node,animation};this.activeBats.add(bat);animation.onfinish=()=>{node.remove();this.activeBats.delete(bat)};
  }
}
/* Intensidade V3: conserva o tema ativo e limita a carga visual em máquinas modestas. */
const baseSeed=ThemeManager.prototype.seed;
ThemeManager.prototype.setIntensity=function(value){
  const previous=this.intensity;
  this.intensity=['soft','normal','intense'].includes(value)?value:'normal';
  document.documentElement.dataset.themeIntensity=this.intensity;
  if(this.active==='winter')this.seed();
  if(previous!==this.intensity&&atmosphereThemes.has(this.active)){this.stopAtmosphere();this.startAtmosphere();}
};
ThemeManager.prototype.seed=function(){
  baseSeed.call(this);
  const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
  if(this.particles?.length)this.particles=this.particles.slice(0,Math.max(18,Math.min(92,Math.round(this.particles.length*factor))));
};
window.RPGThemeManager=new ThemeManager();
})();
