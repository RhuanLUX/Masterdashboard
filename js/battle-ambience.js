/* Occasional scenery visitors. Pure seeded schedule shared by master and TV. */
(function(global){
  'use strict';
  const pools={mordor:['dragon','raven','raven'],fangorn:['owl','stag','raven','stag'],rivendell:['eagle','owl'],road:['caravan','stag','raven'],hrim:['eagle','dragon','raven']};
  const specifications={
    dragon:{width:50,duration:15000,air:true},raven:{width:19,duration:13000,air:true},
    eagle:{width:36,duration:17000,air:true},owl:{width:28,duration:15000,air:true},
    stag:{width:38,duration:19000},caravan:{width:56,duration:20000}
  };
  function random(seed,slot,salt){let x=(seed^Math.imul(slot,0x9e3779b1)^Math.imul(salt,0x85ebca6b))>>>0;x=Math.imul(x^(x>>>16),0x21f0aaad);x=Math.imul(x^(x>>>15),0x735a2d97);return ((x^(x>>>15))>>>0)/4294967296;}
  function plan(config,now){
    const id=Object.hasOwn(pools,config.id)?config.id:'mordor',seed=Number(config.seed)>>>0,time=Math.max(0,now-Number(config.epoch||0)),slot=Math.floor(time/45000),r=salt=>random(seed,slot,salt);
    if(r(1)<.16)return null;
    const type=pools[id][Math.floor(r(2)*pools[id].length)],spec=specifications[type],duration=spec.duration*(.86+r(3)*.20),delay=3000+r(4)*18000;
    return {id,type,slot,start:slot*45000+delay,duration,elapsed:time-slot*45000-delay,direction:r(5)<.5?1:-1,size:spec.width*(.90+r(6)*.20),count:type==='raven'?3+Math.floor(r(7)*3):type==='eagle'&&r(7)<.28?2:1,phase:r(8)*Math.PI*2,frameMs:90+r(9)*42,air:!!spec.air};
  }
  function sample(config,now,reduced=false){
    if(reduced)return [];
    const p=plan(config,now);if(!p)return [];const visible=[];
    for(let i=0;i<p.count;i++){
      const lag=p.type==='eagle'?i*1100:i*(290+(i%2)*170),u=(p.elapsed-lag)/p.duration;if(u<0||u>1)continue;
      const travel=p.direction===1?u:1-u,air=p.air;
      let x=-85+travel*810,y=air?49+Math.sin(p.phase)*7+Math.sin(u*Math.PI*2+p.phase)*7+(i%3-1)*5:(p.id==='road'?139:141);
      if(p.type==='caravan'){x=264+travel*246;y=111;}
      if(p.type==='stag')y+=Math.sin(u*Math.PI)*2;
      if(p.type==='eagle')y+=i*9;
      const fade=Math.min(1,u*9,(1-u)*9),size=p.size*(1-i*.055);
      visible.push({type:p.type,x,y,size,direction:p.direction,frame:Math.floor((p.elapsed+i*57)/p.frameMs)%4,alpha:fade*(p.type==='dragon'?.66:air?.78:.88),air,member:i,slot:p.slot});
    }
    return visible;
  }
  function mount(layer,W,H,config){
    const P=global.PIXI,root=new P.Container(),sprites=[],textures={},assets=global.RPG_AMBIENT_FRAMES||{};let disposed=false,last=[];
    root.label='ambient-visitors';root.eventMode='none';root.interactiveChildren=false;layer.addChild(root);
    for(let i=0;i<5;i++){const sprite=new P.Sprite();sprite.eventMode='none';sprite.visible=false;root.addChild(sprite);sprites.push(sprite);}
    const ids=[...new Set(pools[config.id]||pools.mordor)];
    const ready=Promise.all(ids.map(async id=>{
      const a=id==='dragon'?{frames:[0,1,2,1].map(i=>'assets/themes/dragon-flight/fly-'+i+'.png'),width:128,anchors:Array.from({length:4},()=>[.5,.5])}:assets[id];
      if(!a)throw Error('Ambient art missing: '+id);
      const frames=await Promise.all(a.frames.map(path=>P.Assets.load(path)));for(const t of frames)t.source.scaleMode='nearest';if(!disposed)textures[id]={...a,textures:frames};
    }));
    function tick(now,reduced=false){
      if(disposed)return;last=sample(config,now,reduced);root.visible=last.length>0;
      for(let i=0;i<sprites.length;i++){
        const sprite=sprites[i],v=last[i],a=v&&textures[v.type];sprite.visible=!!a;if(!a)continue;
        sprite.texture=a.textures[v.frame];sprite.anchor.set(...a.anchors[v.frame]);
        const scale=v.size/a.width*(H/360);sprite.scale.set(v.direction*scale,scale);sprite.position.set(v.x*W/640,v.y*H/360);sprite.alpha=v.alpha;
        sprite.tint=v.type==='dragon'?(config.id==='mordor'?0x606473:0x758c9b):config.id==='mordor'?0xb2b0b9:config.id==='hrim'?0xd1dce4:0xffffff;
      }
    }
    return {ready,tick,get visitors(){return last;},destroy(){disposed=true;root.destroy({children:true});}};
  }
  global.RPGBattleAmbience=Object.freeze({pools,plan,sample,mount});
})(window);
