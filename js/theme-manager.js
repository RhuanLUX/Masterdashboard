/* RPG Master — camada global de ambientação, sem dependências externas. */
(()=>{'use strict';
const validThemes=new Set(['normal','winter','horror']);
const random=(min,max)=>min+Math.random()*(max-min);
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

class ThemeManager{
  constructor(){
    this.active='normal';this.root=null;this.canvas=null;this.ctx=null;this.particles=[];
    this.frame=0;this.last=0;this.paused=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.batLayer=null;this.batTimer=0;this.batSpawnTimers=[];this.activeBats=new Set();
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
      if(name==='winter')this.startWinter();if(name==='horror')this.startHorror();return;
    }
    this.deactivate();this.active=name;this.root.dataset.theme=name;document.documentElement.dataset.rpgTheme=name;
    if(name==='winter')this.startWinter();if(name==='horror')this.startHorror();
  }
  deactivate(){this.stopWinter();this.stopHorror();if(this.root)this.root.dataset.theme='normal';document.documentElement.dataset.rpgTheme='normal'}
  pause(){this.paused=true;this.stopFrame();this.stopBatTimer();this.activeBats.forEach(bat=>bat.animation?.pause())}
  resume(){this.paused=false;this.activeBats.forEach(bat=>bat.animation?.play());if(this.active==='winter'&&!this.reduced)this.startFrame();if(this.active==='horror')this.startHorror()}
  destroy(){this.stopWinter();this.stopHorror();removeEventListener('resize',this.resize);document.removeEventListener('visibilitychange',this.visibility);this.root?.remove();this.root=this.canvas=this.ctx=this.batLayer=null}
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
      for(let index=0;index<group;index++){const timer=setTimeout(()=>this.spawnBat(index,group),index*random(105,310));this.batSpawnTimers.push(timer)}
      const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
      this.scheduleBatWave(random(540,1320)/factor);
    },delay);
  }
  spawnBat(index,group){
    const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
    if(this.active!=='horror'||this.paused||document.hidden||this.reduced||!this.batLayer||this.activeBats.size>=Math.round(14*factor))return;
    const close=Math.random()<.19,fromLeft=Math.random()<.56,wide=this.width||innerWidth,tall=this.height||innerHeight;
    const scale=close?random(1.7,3.25):random(.5,1.4),duration=random(3300,7200),startX=fromLeft?-72*scale:wide+72*scale,endX=fromLeft?wide+72*scale:-72*scale;
    const startY=clamp(random(tall*.07,tall*.86)+(group>1?(index-(group-1)/2)*random(22,58):0),28,tall-28);
    const endY=clamp(startY+random(-tall*.34,tall*.34),22,tall-20),curveX=wide*.5+random(-wide*.22,wide*.22),curveY=clamp((startY+endY)/2+random(-tall*.29,tall*.29),18,tall-18);
    const baseAngle=fromLeft?random(-14,13):random(166,194),midAngle=baseAngle+random(-28,28),endAngle=baseAngle+random(-12,12);
    const node=document.createElement('div');node.className=`theme-bat${close?' theme-bat-close':''}`;node.style.setProperty('--bat-opacity',String(close?random(.7,.94):random(.34,.72)));node.style.setProperty('--wing-speed',`${random(.28,.57)}s`);node.style.zIndex=close?'5':String(2+Math.floor(Math.random()*2));this.batLayer.append(node);
    const transform=(x,y,angle,amount)=>`translate3d(${x}px,${y}px,0) rotate(${angle}deg) scale(${amount})`;
    const opacity=Number(node.style.getPropertyValue('--bat-opacity'));
    const animation=node.animate([
      {transform:transform(startX,startY,baseAngle,scale*.78),opacity:0,offset:0},
      {transform:transform(startX+(curveX-startX)*.42,startY+(curveY-startY)*.42,midAngle,scale),opacity,offset:.18},
      {transform:transform(curveX,curveY,midAngle+random(-17,17),scale*random(.88,1.1)),opacity,offset:.54},
      {transform:transform(endX,endY,endAngle,scale*.82),opacity:0,offset:1}
    ],{duration,easing:'cubic-bezier(.36,.06,.68,.94)',fill:'forwards'});
    const bat={node,animation};this.activeBats.add(bat);animation.onfinish=()=>{node.remove();this.activeBats.delete(bat)};
  }
}
/* Intensidade V3: conserva o tema ativo e limita a carga visual em máquinas modestas. */
const baseSeed=ThemeManager.prototype.seed;
ThemeManager.prototype.setIntensity=function(value){
  this.intensity=['soft','normal','intense'].includes(value)?value:'normal';
  document.documentElement.dataset.themeIntensity=this.intensity;
  if(this.active==='winter')this.seed();
};
ThemeManager.prototype.seed=function(){
  baseSeed.call(this);
  const factor=this.intensity==='soft'?.58:this.intensity==='intense'?1.55:1;
  if(this.particles?.length)this.particles=this.particles.slice(0,Math.max(18,Math.min(92,Math.round(this.particles.length*factor))));
};
window.RPGThemeManager=new ThemeManager();
})();
