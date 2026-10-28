/* Arena V3.2.1 — composição visual local, sem regras ou mutações de combate. */
(function (global) {
  'use strict';
  const cache = new Map();
  const catalog = () => global.RPGBattleCatalog;
  const isEnemy = p => catalog().isEnemy(p);
  const visualFor = p => catalog().visualFor(p,global.RPGMasterHost?.getState?.());
  const assetFor = p => visualFor(p).asset;
  const P = () => global.PIXI;

  // Measure each frame's actual silhouette and foot line, not the transparent cell.
  // This is runtime geometry: original art files remain untouched.
  function measureFrame(data, stride, x0, width, height) {
    let left = width, right = 0, top = height, bottom = 0;
    const rows = new Uint32Array(height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const a = data[(y * stride + x0 + x) * 4 + 3];
      if (a > 8) { left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y); }
      if (a > 96) rows[y]++;
    }
    if (left > right) return { left: 0, right: width, top: 0, bottom: height, footX: width / 2, footY: height };
    let footY = bottom; const threshold = Math.max(3, Math.max(...rows) * .035);
    while (footY > top && rows[footY] < threshold) footY--;
    let sum = 0, count = 0;
    const footBand = Math.max(3, Math.round((footY - top) * .05));
    for (let y = Math.max(top, footY - footBand); y <= footY; y++) for (let x = left; x <= right; x++) {
      if (data[(y * stride + x0 + x) * 4 + 3] > 96) { sum += x; count++; }
    }
    return { left, right: right + 1, top, bottom: bottom + 1, footX: count ? sum / count : (left + right) / 2, footY: footY + 1 };
  }
  async function framesFor(visual) {
    const path=visual.asset,cacheKey=`${visual.kind}:${path}:${visual.columns}`;
    if (!cache.has(cacheKey)) {
      const promise = (async () => {
        let base;
        if(visual.kind==='missing'){
          const neutral=document.createElement('canvas');neutral.width=96;neutral.height=128;
          const ctx=neutral.getContext('2d');ctx.fillStyle='#13212a';ctx.fillRect(1,1,94,126);ctx.strokeStyle='#a08a62';ctx.strokeRect(2,2,92,124);
          ctx.fillStyle='#d3c19b';ctx.font='40px Georgia';ctx.textAlign='center';ctx.fillText('?',48,80);base=P().Texture.from(neutral);
        }else base = await P().Assets.load(path);
        base.source.scaleMode = 'nearest';
        if(visual.kind!=='sheet'){
          const width=base.width,height=base.height;
          const texture=new (P().Texture)({source:base.source,frame:new (P().Rectangle)(0,0,width,height),defaultAnchor:{x:.5,y:1}});
          return [{texture,left:0,right:width,top:0,bottom:height,footX:width/2,footY:height}];
        }
        const width = Math.floor(base.width / visual.columns), height = base.height;
        const canvas = document.createElement('canvas'); canvas.width = base.width; canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(base.source.resource, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, height).data;
        return Array.from({ length: visual.columns }, (_, index) => {
          const bounds = measureFrame(pixels, canvas.width, index * width, width, height);
          const texture = new (P().Texture)({ source: base.source, frame: new (P().Rectangle)(index * width, 0, width, height), defaultAnchor: { x: bounds.footX / width, y: bounds.footY / height } });
          return { texture, ...bounds };
        });
      })();
      cache.set(cacheKey, promise); promise.catch(() => cache.delete(cacheKey));
    }
    return cache.get(cacheKey);
  }
  function envelope(frames) {
    return frames.reduce((b, f) => ({ left: Math.min(b.left, f.left - f.footX), right: Math.max(b.right, f.right - f.footX), top: Math.min(b.top, f.top - f.footY), bottom: Math.max(b.bottom, f.bottom - f.footY) }), { left: 0, right: 0, top: 0, bottom: 0 });
  }
  function text(value, size = 11, color = '#c2c8bd') {
    return new (P().Text)({ text: value, style: { fontFamily: 'Georgia', fontSize: size, fill: color, align: 'center', stroke: { color: '#080f16', width: 2 } }, resolution: 2 });
  }
  // Original code-drawn pixel landscape. Static layers cost no per-frame effects.
  function backdrop(layers, W, H) {
    const sx = W / 640, sy = H / 360;
    const make = name => {
      const g = new (P().Graphics)();
      // Keep the distant skyline in the upper third and reserve the foreground for combat.
      if(name==='surface'){g.scale.set(sx,sy*229/167);g.y=sy*(131-193*229/167);}
      else g.scale.set(sx,sy*.68);
      layers[name].addChild(g);return g;
    };
    const sky = make('distant');
    ['#090f1d','#101928','#182333','#202c3a','#28313b','#30383e'].forEach((c, i) => sky.rect(0, i * 32, 640, 33).fill(c));
    for (let i = 0; i < 29; i++) sky.rect((i * 113 + 31) % 640, (i * 37 + 19) % 92, 1, 1).fill({ color: '#adc3cb', alpha: .22 });
    const mountains = make('distant');
    mountains.poly([0,146,36,123,51,126,93,63,116,96,130,95,174,136,206,102,254,151,297,119,346,153,387,108,407,115,450,62,479,97,492,92,541,145,587,104,640,137,640,211,0,211]).fill('#1b2936');
    mountains.poly([0,173,48,149,78,166,126,118,151,145,176,140,218,174,265,149,299,171,337,158,385,181,424,133,456,152,487,146,527,179,581,151,640,166,640,215,0,215]).fill('#22303a');
    mountains.poly([84,80,93,63,106,82,98,79,94,86]).fill('#35414b');
    mountains.poly([437,80,450,62,466,80,455,76,448,83]).fill('#35414b');
    // Low-contrast ridge facets and ledges keep the distant terrain readable as pixel art.
    mountains.poly([93,64,101,91,94,104,110,133,99,124,88,91,79,105]).fill('#263540');
    mountains.poly([450,63,457,91,449,103,467,136,450,121,439,96]).fill('#263540');
    mountains.poly([126,119,136,146,160,165,145,161,130,147,116,153]).fill('#2c3940');
    mountains.poly([424,134,436,160,455,176,430,167,419,151,407,161]).fill('#2a383f');
    for(let i=0;i<16;i++)mountains.rect(22+i*39,172+(i*7)%17,12+i%5,2).fill({color:'#425052',alpha:.13});
    const tower = make('middle');
    tower.poly([305,188,308,129,311,129,311,102,314,102,314,75,311,67,313,51,317,65,322,69,327,65,331,51,333,67,330,75,330,102,333,102,333,129,336,129,339,188]).fill('#101a24');
    tower.rect(314,104,3,73).fill('#1d2931').rect(329,117,2,65).fill('#1d2931');
    tower.poly([291,188,294,163,299,163,299,153,303,153,303,162,307,162,309,188]).fill('#14202a');
    tower.poly([335,188,337,162,341,162,341,153,345,153,345,163,350,163,353,188]).fill('#14202a');
    for(let y=117;y<181;y+=10)tower.rect(312,y,19,1).fill('#263039');
    for (let i = 0; i < 6; i++) tower.rect(319,89+i*14,2,4).fill(i%2?'#33302a':'#49402d');
    tower.ellipse(322,59,14,5).fill({color:'#d66b2e',alpha:.08}).ellipse(322,59,9,3).fill({color:'#f49c43',alpha:.22});
    tower.poly([316,59,320,57,324,57,328,59,324,61,320,61]).fill('#b97336').rect(321,57,2,5).fill('#1d1514');
    const ruins = make('middle');
    for (const [x,y,w,h] of [[46,161,13,42],[64,176,24,28],[563,154,14,48],[585,175,29,28]]) {
      ruins.rect(x,y,w,h).fill('#15242c').rect(x,y,w,3).fill('#304048');
      for(let row=0;row<h;row+=9)ruins.rect(x,y+row,w,1).fill('#1d2d34');
    }
    ruins.poly([36,203,45,187,58,197,79,191,102,204]).fill('#26352f');
    ruins.poly([550,203,566,192,581,198,596,187,621,204]).fill('#26352f');
    ruins.rect(569,151,31,5).fill('#26363c').rect(591,157,7,35).fill('#17262d');
    ruins.poly([87,202,89,188,98,181,108,185,112,202]).fill('#1e2e31');
    const ground = make('surface');
    ground.poly([0,193,640,193,640,360,0,360]).fill('#25302e');
    ground.rect(0,193,640,9).fill('#2d3938').rect(0,217,640,143).fill('#202c2b').rect(0,282,640,78).fill('#1b2527');
    ground.poly([298,195,342,195,411,360,229,360]).fill('#28302d');
    for(let i=0;i<105;i++){
      const x=(i*83+17)%640,y=204+(i*47)%151;
      ground.rect(x,y,2+(i%5),1+(i%2)).fill(i%3?'#303a32':'#142123');
    }
    for(let i=0;i<7;i++)ground.poly([265-i*4,222+i*19,375+i*4,222+i*19,377+i*4,224+i*19,263-i*4,224+i*19]).fill({color:'#3e4035',alpha:.32});
    for(const [x,y] of [[7,244],[16,289],[4,339],[620,234],[628,281],[618,335]]){
      ground.poly([x,y+4,x+5,y,x+12,y+1,x+17,y+6,x+14,y+9,x,y+9]).fill('#162023');
      ground.poly([x,y+4,x+5,y,x+12,y+1,x+9,y+4]).fill('#3b4038');
      ground.moveTo(x+20,y+5).lineTo(x+18,y-1).moveTo(x+21,y+6).lineTo(x+24,y+1).stroke({color:'#364137',width:1});
    }
    const atmosphere = make('middle');
    atmosphere.rect(0,178,640,10).fill({color:'#9db2b2',alpha:.025}).rect(0,190,640,6).fill({color:'#9db2b2',alpha:.04});
  }
  function grid(count, width, height, aspect) {
    if(!count)return {cols:1,rows:1,fit:height};
    let best;
    for(let cols=1;cols<=Math.min(5,count);cols++){
      const rows=Math.ceil(count/cols),cw=width/cols,ch=height/rows;
      const fit=Math.min((cw-14)/aspect,ch-27);
      if(!best||fit>best.fit)best={cols,rows,cw,ch,fit};
    }
    return best;
  }
  function compactName(p) {
    const known={elenya:'Elenya',calion:'Calion',nando:'Nando',anao:'Caolho'};
    const suffix=p.name.match(/\s\d+$/)?.[0]||'';
    if(known[p.sourceId])return known[p.sourceId]+suffix;
    return p.name.length>15?p.name.slice(0,12).trim()+'…'+suffix:p.name;
  }
  function setFacing(a,direction){
    a.direction=direction;
    const native=a.visual.frameFacings?.[a.sprite.currentFrame]||a.visual.nativeFacing||'right';
    a.facing=direction===native?1:-1;
    a.sprite.scale.x=a.facing*Math.abs(a.baseScale||a.sprite.scale.x||1);
  }
  function resting(a){
    const down=catalog().incapacitated(a.p);
    a.sprite.alpha=down?.65:1;a.sprite.tint=down?0x9b9eac:0xffffff;
    a.sprite.rotation=0;
  }
  async function mount(container, participants, options = {}) {
    if (!P()) throw new Error('PixiJS não carregou.');
    container.replaceChildren();
    const app = new (P().Application)();
    await app.init({ width: Math.max(1,container.clientWidth), height: Math.max(1,container.clientHeight), backgroundAlpha: 0, antialias: false, autoDensity: true, resolution: Math.min(global.devicePixelRatio || 1, 2) });
    app.ticker.maxFPS=60;
    app.canvas.className='pixi-arena-canvas';app.canvas.setAttribute('aria-label','Arena de batalha: equipe esquerda e equipe direita');container.append(app.canvas);
    const layers={};
    for(const key of ['distant','middle','surface','shadows','characters','effects','indicators']){layers[key]=new (P().Container)();app.stage.addChild(layers[key]);}
    layers.characters.sortableChildren=true;
    const scene={app,actors:new Map(),container,public:!!options.public,layers,destroyed:false,selected:{actorId:options.actorId,targetId:options.targetId},tweens:new Set()};
    try {
      await Promise.all(participants.map(async p=>{
        let visual=visualFor(p),atlas;
        try{atlas=await framesFor(visual);}catch(error){visual={...visual,kind:'missing',asset:'',columns:1,frame:null,fallback:true,reason:'Falha ao carregar a arte desta entidade; marcador neutro (?).'};atlas=await framesFor(visual);}
        const fixed=visual.frame,frames=fixed==null?atlas:[atlas[fixed]],measured=envelope(frames);
        const direction=catalog().defaultFacing(p),facing=direction===(visual.nativeFacing||'right')?1:-1;
        // Reserve both orientations so same-team attacks cannot clip a wide weapon.
        const half=Math.max(-measured.left,measured.right);
        const extent={...measured,left:-half,right:half};
        const wrap=new (P().Container)(),sprite=new (P().AnimatedSprite)(frames.map(f=>f.texture));
        sprite.updateAnchor=true;sprite.gotoAndStop(0);sprite.anchor.copyFrom(frames[0].texture.defaultAnchor);
        wrap.addChild(sprite);layers.characters.addChild(wrap);
        const name=text(compactName(p)+(visual.fallback?(visual.kind==='portrait'?' [R]':' [?]'):''));name.anchor.set(.5,0);layers.indicators.addChild(name);
        const shadow=new (P().Graphics)(),marker=new (P().Graphics)();layers.shadows.addChild(shadow);layers.indicators.addChild(marker);
        const actor={p,wrap,sprite,frames,extent,name,shadow,marker,visual,facing,direction,side:isEnemy(p)?-1:1,homeX:0,homeY:0};
        resting(actor);scene.actors.set(p.id,actor);
      }));
    } catch(error){app.destroy(true,{children:true,texture:false,textureSource:false});throw error;}
    app.canvas.title=[...scene.actors.values()].filter(a=>a.visual.fallback).map(a=>`${a.p.name}: ${a.visual.reason}`).join('\n');
    function paintSelection(){
      for(const [id,a] of scene.actors){a.marker.clear();const active=id===scene.selected.actorId,target=id===scene.selected.targetId;
        a.name.style.fill=active?'#e4c478':target?'#e2a28e':'#b9c4bd';
        if(active||target){const color=active?'#cfb36c':'#bb7866';a.marker.moveTo(a.homeX-7,a.homeY+9).lineTo(a.homeX+7,a.homeY+9).stroke({color,width:2});}
      }
    }
    function layout(){
      if(scene.destroyed)return;
      const W=Math.max(1,container.clientWidth),H=Math.max(1,container.clientHeight);app.renderer.resize(W,H);
      for(const key of ['distant','middle','surface'])layers[key].removeChildren().forEach(x=>x.destroy());
      backdrop(layers,W,H);
      const groups=[participants.filter(p=>!isEnemy(p)),participants.filter(isEnemy)];
      const fieldTop=H*.40,fieldHeight=H*.56,sideWidth=W*.38;
      const aspect=Math.max(.65,...[...scene.actors.values()].map(a=>(a.extent.right-a.extent.left)/Math.max(1,a.extent.bottom-a.extent.top)));
      const plans=groups.map(g=>grid(g.length,sideWidth,fieldHeight,aspect));
      const commonHeight=Math.max(12,Math.min(H*.28,...plans.filter((_,i)=>groups[i].length).map(p=>p.fit)));
      groups.forEach((group,side)=>{
        const plan=plans[side];
        group.forEach((p,index)=>{
          const a=scene.actors.get(p.id),row=Math.floor(index/plan.cols),col=index%plan.cols;
          a.cancelAction?.();a.side=side?-1:1;setFacing(a,catalog().defaultFacing(p));resting(a);
          const inRow=Math.min(plan.cols,group.length-row*plan.cols),offset=(plan.cols-inRow)/2;
          const cellX=W*(side?.58:.04)+(col+offset)*plan.cw,cellY=fieldTop+row*plan.ch;
          const perspective=plan.rows===1?1:.91+.09*row/(plan.rows-1);
          const extent=a.extent,scale=commonHeight*perspective/Math.max(1,extent.bottom-extent.top);
          // Center the entire action envelope inside its slot; anchor itself stays on the feet.
          a.homeX=cellX+plan.cw/2-(extent.left+extent.right)*scale/2;
          a.homeY=cellY+plan.ch-22-extent.bottom*scale;
          a.wrap.position.set(a.homeX,a.homeY);a.wrap.zIndex=a.homeY;a.sprite.scale.set(a.facing*scale,scale);a.baseScale=scale;
          a.shadow.clear().ellipse(a.homeX,a.homeY+1,Math.min(plan.cw*.22,commonHeight*.24),Math.max(2,commonHeight*.035)).fill({color:'#020709',alpha:.50});
          a.name.position.set(cellX+plan.cw/2,a.homeY+12);a.name.style.fontSize=Math.max(9,Math.min(12,plan.cw/8));
          if(a.visual.fallback){
            const tag=a.visual.kind==='portrait'?' [R]':' [?]';let label=compactName(p);a.name.text=label+tag;
            while(label.length>3&&a.name.width>plan.cw-8){label=label.slice(0,-1);a.name.text=label+'…'+tag;}
          }
          a.bounds={left:a.homeX+extent.left*scale,right:a.homeX+extent.right*scale,top:a.homeY+extent.top*scale,bottom:a.homeY+extent.bottom*scale};
        });
      });paintSelection();
    }
    scene.select=(actorId,targetId)=>{scene.selected={actorId,targetId};paintSelection();};
    // Re-layout known instances without another image load or combatant reconstruction.
    scene.updateParticipants=next=>{
      if(next.length!==scene.actors.size||next.some(p=>!scene.actors.has(p.id)||catalog().keyOf(p)!==catalog().keyOf(scene.actors.get(p.id).p)))return false;
      participants=next;for(const p of next){const a=scene.actors.get(p.id);a.p=p;a.name.text=compactName(p);}
      layout();return true;
    };
    scene.audit=()=>{
      const entries=[...scene.actors].map(([id,a])=>({id,...a.bounds,footY:a.homeY,scale:a.baseScale,side:a.side})),issues=[];
      for(let i=0;i<entries.length;i++){const a=entries[i];if(a.left<0||a.right>app.screen.width||a.top<0||a.bottom>app.screen.height)issues.push('clipped:'+a.id);
        if(a.side===1&&a.right>app.screen.width*.43||a.side===-1&&a.left<app.screen.width*.57)issues.push('center:'+a.id);
        for(let j=i+1;j<entries.length;j++){const b=entries[j];if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)issues.push('overlap:'+a.id+':'+b.id);}
      }return {width:app.screen.width,height:app.screen.height,entries,issues};
    };
    const observer=new ResizeObserver(()=>layout());observer.observe(container);layout();
    // Idle is a tiny anchored breathing movement; action frames no longer loop at rest.
    let elapsed=0;
    const idle=ticker=>{elapsed+=ticker.deltaMS;if(global.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;let i=0;for(const a of scene.actors.values()){
      const phase=elapsed/1100+i++;
      if(!a.acting&&!catalog().incapacitated(a.p)){
        if(a.frames.length>1)a.sprite.scale.y=a.baseScale*(1+Math.sin(phase)*.006);
        else a.sprite.rotation=Math.sin(phase)*.004; // Rigid, foot-pivot sway: no stretching the new bases.
      }
    }};
    app.ticker.add(idle);
    scene.destroy=()=>{if(scene.destroyed)return;scene.destroyed=true;observer.disconnect();scene.tweens.forEach(cancel=>cancel());app.destroy(true,{children:true,texture:false,textureSource:false});};
    return scene;
  }
  function tween(scene,duration,update,done){let elapsed=0;const cancel=()=>{scene.app.ticker.remove(tick);scene.tweens.delete(cancel);};const tick=ticker=>{elapsed+=ticker.deltaMS;update(Math.min(1,elapsed/duration));if(elapsed>=duration){cancel();done?.();}};scene.tweens.add(cancel);scene.app.ticker.add(tick);return cancel;}
  // Local, bounded vector/particle effects. No external assets, timers or physics changes.
  const spellNames={fire:'Fogo',ice:'Gelo',lightning:'Eletricidade',missiles:'Mísseis mágicos'};
  function projectileEffect(scene,actor,target,kind,spell,outcome,tween){
    const fx=new (P().Graphics)();fx.label='combat-fx:'+ (kind==='ranged'?'arrow':spell);
    fx.eventMode='none';scene.layers.effects.addChild(fx);
    const x1=actor.homeX,y1=actor.homeY-(actor.homeY-actor.bounds.top)*.6;
    const x2=target.homeX,y2=target.homeY-(target.homeY-target.bounds.top)*.55;
    const dx=x2-x1,dy=y2-y1,scale=Math.max(.65,Math.min(1.2,scene.app.screen.height/500));
    const palette={fire:[0xff6c25,0xffcd60,0xfff2b0],ice:[0x479fcf,0x9cecff,0xf0ffff],lightning:[0x7277f5,0x9ee5ff,0xffffff],missiles:[0x7846d8,0xd5a0ff,0xffe7ff]};
    const colors=palette[spell]||palette.fire,clamp=n=>Math.max(0,Math.min(1,n));
    const point=(u,curve=0)=>({x:x1+dx*u,y:y1+dy*u-Math.sin(u*Math.PI)*curve*scale});
    const ring=(x,y,r,c,a,w=2)=>fx.circle(x,y,Math.max(.1,r*scale)).stroke({color:c,alpha:clamp(a),width:w*scale});
    const dot=(x,y,r,c,a)=>fx.circle(x,y,Math.max(.1,r*scale)).fill({color:c,alpha:clamp(a)});
    const line=(points,c,a,w)=>{fx.moveTo(points[0].x,points[0].y);points.slice(1).forEach(p=>fx.lineTo(p.x,p.y));fx.stroke({color:c,alpha:clamp(a),width:w*scale});};
    const shard=(x,y,r,angle,c,a)=>{
      const ux=Math.cos(angle),uy=Math.sin(angle),vx=-uy,vy=ux;
      fx.poly([x+ux*r*scale,y+uy*r*scale,x+vx*r*.27*scale,y+vy*r*.27*scale,x-ux*r*.65*scale,y-uy*r*.65*scale,x-vx*r*.27*scale,y-vy*r*.27*scale]).fill({color:c,alpha:clamp(a)});
    };
    const impact=(p,c)=>{if(outcome==='fail')return;const fade=1-p;
      ring(x2,y2,8+p*30,c[0],fade*.7);dot(x2,y2,12*(1-p),c[2],fade*.7);
      for(let i=0;i<16;i++){const a=i*2.399,r=(8+p*(22+(i%4)*8))*scale,x=x2+Math.cos(a)*r,y=y2+Math.sin(a)*r*.75;
        if(spell==='ice')shard(x,y,3+fade*4,a,c[i%3],fade);else dot(x,y,1+fade*2,c[i%3],fade);}
    };
    const destroy=()=>{if(!fx.destroyed)fx.destroy();};
    const stop=tween(scene,1100,t=>{
      fx.clear();fx.alpha=outcome==='fail'?.65:1;
      const charge=clamp(t/.22),travel=clamp((t-.2)/.5),burst=clamp((t-.72)/.28);
      if(kind==='ranged'){
        if(t<.2){ring(x1,y1,4+charge*5,0xc9b78a,(1-charge)*.6);return;}
        const p=point(travel,24),angle=Math.atan2(dy-Math.cos(travel*Math.PI)*24*scale*Math.PI,dx),ux=Math.cos(angle),uy=Math.sin(angle),vx=-uy,vy=ux;
        const offset=(along,across=0)=>({x:p.x+(ux*along+vx*across)*scale,y:p.y+(uy*along+vy*across)*scale});
        if(t<.76){
          line([offset(-45),offset(-20)],0xc8c6af,.18,2);
          line([offset(-24),offset(7)],0x493020,1,4);line([offset(-24),offset(7)],0xd8b975,1,2);
          const tip=offset(14),a=offset(3,5),b=offset(3,-5);fx.poly([tip.x,tip.y,a.x,a.y,b.x,b.y]).fill(0xd9e5df);
          for(const side of [-1,1]){const tail=offset(-24),feather=offset(-30,side*6),join=offset(-15);fx.poly([tail.x,tail.y,feather.x,feather.y,join.x,join.y]).fill(0xc3b99b);}
        }else if(outcome!=='fail'){for(let i=0;i<7;i++){const a=i*2.4;line([{x:x2+Math.cos(a)*burst*8,y:y2+Math.sin(a)*burst*8},{x:x2+Math.cos(a)*(8+burst*18),y:y2+Math.sin(a)*(8+burst*18)}],0xe5d6a1,1-burst,1);}}
        return;
      }
      if(t<.26){
        ring(x1,y1,8+charge*13,colors[0],(1-charge*.6)*.7);ring(x1,y1,5+charge*8,colors[1],.7);
        dot(x1,y1,charge*7,colors[2],.85);
        for(let i=0;i<6;i++){const a=i*Math.PI/3+t*8,r=(28-charge*20)*scale;dot(x1+Math.cos(a)*r,y1+Math.sin(a)*r,2,colors[1],charge);}
      }
      if(t>=.2&&t<.74){
        if(spell==='lightning'){
          const end=clamp(travel*3),points=[{x:x1,y:y1}],segments=18;
          for(let i=1;i<=segments;i++){const u=i/segments*end,off=i===segments?0:Math.sin(i*17+Math.floor(t*20)*7)*(8+Math.sin(i*4)*6)*scale;points.push({x:x1+dx*u,y:y1+dy*u+off});}
          line(points,colors[0],.18,14);line(points,colors[1],.8,4);line(points,colors[2],1,1.4);
          for(const i of [5,10,14]){const p=points[i],q=points[Math.min(18,i+3)];line([p,{x:p.x+(q.x-p.x)*.7,y:p.y-18*scale},{x:q.x,y:q.y-27*scale}],colors[1],.65,1);}
          dot(x1,y1,8,colors[2],.8);dot(x1+dx*end,y1+dy*end,10,colors[1],.6);
        }else if(spell==='missiles'){
          for(let i=0;i<3;i++){
            const u=clamp((t-.2-i*.045)/.43),curve=(i-1)*65;
            if(t<.2+i*.045)continue;
            for(let j=10;j>=0;j--){const q=point(clamp(u-j*.014),curve);dot(q.x,q.y,2+(1-j/11)*4,colors[j%2],(1-j/11)*.65);}
            const p=point(u,curve);dot(p.x,p.y,9,colors[0],.2);dot(p.x,p.y,4,colors[2],1);
          }
        }else{
          const p=point(travel,spell==='fire'?18:0),angle=Math.atan2(dy,dx);
          for(let i=16;i>=0;i--){const u=clamp(travel-i*.012),q=point(u,spell==='fire'?18:0),fade=1-i/18;
            const jitter=Math.sin(i*8+t*30)*5*scale;
            if(spell==='fire')shard(q.x,q.y+jitter,2+fade*8,angle,colors[i%2],fade*.65);
            else shard(q.x,q.y+jitter,2+fade*5,angle,colors[i%3],fade*.6);
          }
          if(spell==='fire'){
            const ux=Math.cos(angle),uy=Math.sin(angle),vx=-uy,vy=ux;
            const flame=(length,width,c)=>{const points=[[10,0],[2,-width],[-length*.45,-width*.6],[-length,Math.sin(t*47)*3],[-length*.55,width*.4],[-length*.8,width],[0,width]];
              fx.poly(points.flatMap(([a,b])=>[p.x+(ux*a+vx*b)*scale,p.y+(uy*a+vy*b)*scale])).fill(c);};
            dot(p.x,p.y,18,colors[0],.16);flame(40,11,0xdd4224);flame(29,8,colors[0]);flame(18,5,colors[1]);dot(p.x+ux*3,p.y+uy*3,3,colors[2],1);
          }
          else{shard(p.x,p.y,20,angle,colors[0],1);shard(p.x+2,p.y-2,16,angle,colors[1],1);shard(p.x+3,p.y-3,10,angle,colors[2],1);}
        }
      }
      if(t>=.72)impact(burst,colors);
    },destroy);
    return ()=>{stop();destroy();};
  }
  function flash(scene,actorId,targetId,kind='melee',value='',options={}){
    if(!scene||scene.destroyed)return;
    const actor=scene.actors.get(actorId),target=scene.actors.get(targetId);if(!actor||!target)return;
    if(global.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
    const dx=target.homeX-actor.homeX,dy=target.homeY-actor.homeY;
    const enhanced=kind==='magic'||kind==='ranged',duration=enhanced?1100:650;
    const spell=Object.hasOwn(spellNames,options.spell)?options.spell:'fire',outcome=options.outcome||kind;
    actor.cancelAction?.();target.cancelAction?.();
    actor.acting=true;target.acting=true;
    setFacing(actor,dx===0?catalog().defaultFacing(actor.p):dx>0?'right':'left');
    actor.sprite.rotation=0;actor.sprite.scale.y=actor.baseScale;
    const ranged=kind==='magic'||kind==='ranged'||kind==='heal';
    const lunge=ranged?0:Math.sign(dx)*Math.min(32,Math.abs(dx)*.14);
    const color=kind==='heal'?'#86bd99':kind==='magic'?'#90b9d1':kind==='fail'?'#b6b9bc':'#dec190';
    const reset=()=>{actor.wrap.position.set(actor.homeX,actor.homeY);actor.sprite.gotoAndStop(0);actor.acting=false;
      target.wrap.position.set(target.homeX,target.homeY);target.acting=false;resting(actor);resting(target);
      setFacing(actor,catalog().defaultFacing(actor.p));actor.cancelAction=null;target.cancelAction=null;};
    const cancelMotion=tween(scene,duration,t=>{
      actor.wrap.x=actor.homeX+Math.sin(t*Math.PI)*lunge;
      if(actor.frames.length===1)actor.sprite.rotation=Math.sin(t*Math.PI*2)*.025*actor.facing;
      actor.sprite.gotoAndStop(Math.min(actor.frames.length-1,Math.floor(t*actor.frames.length)));
      setFacing(actor,actor.direction);
      if(t>(enhanced?.72:.53)){target.wrap.x=target.homeX+(outcome==='fail'?Math.sin(t*Math.PI)*12:Math.sin(t*42)*2);target.sprite.tint=outcome==='fail'?0xffffff:kind==='heal'?0xb7dfbe:0xf0d7c5;}
    },reset);
    actor.cancelAction=target.cancelAction=()=>{cancelMotion();reset();};
    let cancelFX=()=>{};
    if(enhanced)cancelFX=projectileEffect(scene,actor,target,kind,spell,outcome,tween);
    else {
    const fx=new (P().Graphics)();scene.layers.effects.addChild(fx);
    const y1=actor.homeY-(actor.homeY-actor.bounds.top)*.55,y2=target.homeY-(target.homeY-target.bounds.top)*.55;
    tween(scene,650,t=>{fx.clear();
      if(ranged&&t<.65){const progress=t/.65,x=actor.homeX+dx*progress,y=y1+(y2-y1)*progress;
        if(kind==='ranged')fx.moveTo(x-Math.sign(dx)*10,y+2).lineTo(x,y).stroke({color,width:2});else fx.rect(x-3,y-3,6,6).fill({color,alpha:.8});
      }else if(t>.5&&kind!=='fail'){const r=(kind==='critical'?17:11)*(t-.5)*2;fx.moveTo(target.homeX-r,y2-r).lineTo(target.homeX+r,y2+r).moveTo(target.homeX+r,y2-r).lineTo(target.homeX-r,y2+r).stroke({color,width:2,alpha:1-t});}
    },()=>fx.destroy());
    }
    if(value){const note=text(value,12,color);note.anchor.set(.5);note.x=target.homeX;note.y=target.bounds.top-5;scene.layers.indicators.addChild(note);tween(scene,duration+70,t=>{note.y=target.bounds.top-5-t*18;note.alpha=1-t;},()=>note.destroy());}
    const cancel=actor.cancelAction;actor.cancelAction=target.cancelAction=()=>{cancelFX();cancel();};
    return {duration,cancel:actor.cancelAction};
  }
  global.RPGBattlePixi={mount,flash,assetFor,isEnemy};
})(window);
