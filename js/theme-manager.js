/* RPG Master — camada global de ambientação, sem dependências externas. */
(()=>{'use strict';
const validThemes=new Set(['normal','winter','horror']);
class ThemeManager{
  constructor(){this.active='normal';this.root=null;this.canvas=null;this.ctx=null;this.particles=[];this.frame=0;this.last=0;this.paused=false;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;this.resize=this.resize.bind(this);this.tick=this.tick.bind(this);this.visibility=this.visibility.bind(this)}
  initialize(){if(this.root)return;this.root=document.createElement('div');this.root.id='theme-effects';this.root.className='theme-effects';this.root.setAttribute('aria-hidden','true');this.root.innerHTML='<canvas class="theme-snow"></canvas><div class="theme-horror"><div class="theme-fog theme-fog-a"></div><div class="theme-fog theme-fog-b"></div><div class="theme-bat theme-bat-a"><i></i></div><div class="theme-bat theme-bat-b"><i></i></div><div class="theme-bat theme-bat-c"><i></i></div><div class="theme-pumpkin"><span></span></div></div>';document.body.append(this.root);this.canvas=this.root.querySelector('.theme-snow');this.ctx=this.canvas.getContext('2d');addEventListener('resize',this.resize,{passive:true});document.addEventListener('visibilitychange',this.visibility);this.resize()}
  activate(name){name=validThemes.has(name)?name:'normal';this.initialize();if(this.active===name){this.root.dataset.theme=name;document.documentElement.dataset.rpgTheme=name;return}this.deactivate();this.active=name;this.root.dataset.theme=name;document.documentElement.dataset.rpgTheme=name;if(name==='winter')this.startWinter()}
  deactivate(){this.stopWinter();if(this.root)this.root.dataset.theme='normal';document.documentElement.dataset.rpgTheme='normal'}
  pause(){this.paused=true;this.stopFrame()}
  resume(){this.paused=false;if(this.active==='winter'&&!this.reduced)this.startFrame()}
  destroy(){this.stopWinter();removeEventListener('resize',this.resize);document.removeEventListener('visibilitychange',this.visibility);this.root?.remove();this.root=this.canvas=this.ctx=null}
  visibility(){document.hidden?this.pause():this.resume()}
  resize(){if(!this.canvas)return;let ratio=Math.min(devicePixelRatio||1,1.5),w=innerWidth,h=innerHeight;this.canvas.width=Math.max(1,Math.floor(w*ratio));this.canvas.height=Math.max(1,Math.floor(h*ratio));this.canvas.style.width=w+'px';this.canvas.style.height=h+'px';this.ctx.setTransform(ratio,0,0,ratio,0,0);this.width=w;this.height=h;if(this.active==='winter')this.seed()}
  seed(){if(this.reduced){this.particles=[];return}let slow=(navigator.hardwareConcurrency||4)<=4,count=Math.max(28,Math.min(slow?42:68,Math.round((this.width*this.height)/26000)));this.particles=Array.from({length:count},()=>this.flake(true))}
  flake(initial=false){let depth=.55+Math.random()*.85;return{x:Math.random()*this.width,y:initial?Math.random()*this.height:-12,r:(.8+Math.random()*2.4)*depth,speed:(17+Math.random()*35)*depth,drift:-10+Math.random()*20,amp:4+Math.random()*16,phase:Math.random()*Math.PI*2,phaseSpeed:.45+Math.random()*.9,alpha:.18+Math.random()*.38,color:Math.random()<.3?'#cae7ff':'#f4fbff'}}
  startWinter(){this.seed();if(!this.reduced&&!document.hidden)this.startFrame()}
  stopWinter(){this.stopFrame();if(this.ctx&&this.canvas)this.ctx.clearRect(0,0,this.width||0,this.height||0);this.particles=[]}
  startFrame(){if(!this.frame)this.frame=requestAnimationFrame(this.tick)}
  stopFrame(){if(this.frame)cancelAnimationFrame(this.frame);this.frame=0;this.last=0}
  tick(time){this.frame=0;if(this.paused||this.active!=='winter'||this.reduced)return;let dt=this.last?Math.min(.05,(time-this.last)/1000):.016;this.last=time;let c=this.ctx;c.clearRect(0,0,this.width,this.height);for(let p of this.particles){p.phase+=p.phaseSpeed*dt;p.y+=p.speed*dt;p.x+=p.drift*dt+Math.sin(p.phase)*p.amp*dt;if(p.y>this.height+14||p.x<-18||p.x>this.width+18)Object.assign(p,this.flake(false));c.beginPath();c.fillStyle=p.color;c.globalAlpha=p.alpha;c.arc(p.x,p.y,p.r,0,Math.PI*2);c.fill()}c.globalAlpha=1;this.frame=requestAnimationFrame(this.tick)}
}
window.RPGThemeManager=new ThemeManager();
})();
