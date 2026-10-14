/* Arena V3.2.1 — composição visual local, sem regras ou mutações de combate. */
(function (global) {
  'use strict';
  const sheet = {
    elenya: 'assets/pixel-sprites/elenya-sheet-v1.png', calion: 'assets/pixel-sprites/calion-sheet-v1.png',
    nando: 'assets/pixel-sprites/nando-sheet-v1.png', anao: 'assets/pixel-sprites/anao-caolho-sheet-v1.png',
    'goblin-lanceiro': 'assets/pixel-sprites/goblins-roster-v1.png', 'goblin-arqueiro': 'assets/pixel-sprites/goblins-roster-v1.png',
    'goblin-espadachim': 'assets/pixel-sprites/goblins-roster-v1.png', 'uruk-hai-batedor': 'assets/pixel-sprites/uruk-hai-sheet-v1.png',
    'uruk-hai-capitao': 'assets/pixel-sprites/uruk-hai-sheet-v1.png', 'espectro-sombras': 'assets/pixel-sprites/spectro-sheet-v1.png'
  };
  const sourceFrame = { 'goblin-lanceiro': 0, 'goblin-arqueiro': 1, 'goblin-espadachim': 2 };
  const cache = new Map();
  const isEnemy = p => p?.sourceType === 'creature' || /goblin|orc|uruk|inimigo|criatura|espectro/i.test(p?.type || '');
  const assetFor = p => sheet[p.sourceId] || (isEnemy(p) ? sheet['goblin-espadachim'] : sheet.elenya);
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
  async function framesFor(participant) {
    const path = assetFor(participant);
    if (!cache.has(path)) {
      const promise = (async () => {
        const base = await P().Assets.load(path);
        base.source.scaleMode = 'nearest';
        const width = Math.floor(base.width / 4), height = base.height;
        const canvas = document.createElement('canvas'); canvas.width = base.width; canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(base.source.resource, 0, 0);
        const pixels = context.getImageData(0, 0, canvas.width, height).data;
        return Array.from({ length: 4 }, (_, index) => {
          const bounds = measureFrame(pixels, canvas.width, index * width, width, height);
          const texture = new (P().Texture)({ source: base.source, frame: new (P().Rectangle)(index * width, 0, width, height), defaultAnchor: { x: bounds.footX / width, y: bounds.footY / height } });
          return { texture, ...bounds };
        });
      })();
      cache.set(path, promise); promise.catch(() => cache.delete(path));
    }
    return cache.get(path);
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
  async function mount(container, participants, options = {}) {
    if (!P()) throw new Error('PixiJS não carregou.');
    container.replaceChildren();
    const app = new (P().Application)();
    await app.init({ width: Math.max(1,container.clientWidth), height: Math.max(1,container.clientHeight), backgroundAlpha: 0, antialias: false, autoDensity: true, resolution: Math.min(global.devicePixelRatio || 1, 2) });
    app.ticker.maxFPS=60;
    app.canvas.className='pixi-arena-canvas';app.canvas.setAttribute('aria-label','Arena de batalha: companhia à esquerda, inimigos à direita');container.append(app.canvas);
    const layers={};
    for(const key of ['distant','middle','surface','shadows','characters','effects','indicators']){layers[key]=new (P().Container)();app.stage.addChild(layers[key]);}
    layers.characters.sortableChildren=true;
    const scene={app,actors:new Map(),container,public:!!options.public,layers,destroyed:false,selected:{actorId:options.actorId,targetId:options.targetId},tweens:new Set()};
    try {
      await Promise.all(participants.map(async p=>{
        const atlas=await framesFor(p),fixed=sourceFrame[p.sourceId];
        const frames=fixed===undefined?atlas:[atlas[fixed]],measured=envelope(frames);
        const extent=isEnemy(p)?{...measured,left:-measured.right,right:-measured.left}:measured;
        const wrap=new (P().Container)(),sprite=new (P().AnimatedSprite)(frames.map(f=>f.texture));
        sprite.updateAnchor=true;sprite.gotoAndStop(0);sprite.anchor.copyFrom(frames[0].texture.defaultAnchor);
        wrap.addChild(sprite);layers.characters.addChild(wrap);
        const name=text(compactName(p));name.anchor.set(.5,0);layers.indicators.addChild(name);
        const shadow=new (P().Graphics)(),marker=new (P().Graphics)();layers.shadows.addChild(shadow);layers.indicators.addChild(marker);
        scene.actors.set(p.id,{p,wrap,sprite,frames,extent,name,shadow,marker,side:isEnemy(p)?-1:1,homeX:0,homeY:0});
      }));
    } catch(error){app.destroy(true,{children:true,texture:false,textureSource:false});throw error;}
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
          const inRow=Math.min(plan.cols,group.length-row*plan.cols),offset=(plan.cols-inRow)/2;
          const cellX=W*(side?.58:.04)+(col+offset)*plan.cw,cellY=fieldTop+row*plan.ch;
          const perspective=plan.rows===1?1:.91+.09*row/(plan.rows-1);
          const extent=a.extent,scale=commonHeight*perspective/Math.max(1,extent.bottom-extent.top);
          // Center the entire action envelope inside its slot; anchor itself stays on the feet.
          a.homeX=cellX+plan.cw/2-(extent.left+extent.right)*scale/2;
          a.homeY=cellY+plan.ch-22-extent.bottom*scale;
          a.wrap.position.set(a.homeX,a.homeY);a.wrap.zIndex=a.homeY;a.sprite.scale.set(a.side*scale,scale);a.baseScale=scale;
          a.shadow.clear().ellipse(a.homeX,a.homeY+1,Math.min(plan.cw*.22,commonHeight*.24),Math.max(2,commonHeight*.035)).fill({color:'#020709',alpha:.50});
          a.name.position.set(cellX+plan.cw/2,a.homeY+12);a.name.style.fontSize=Math.max(9,Math.min(12,plan.cw/8));
          a.bounds={left:a.homeX+extent.left*scale,right:a.homeX+extent.right*scale,top:a.homeY+extent.top*scale,bottom:a.homeY+extent.bottom*scale};
        });
      });paintSelection();
    }
    scene.select=(actorId,targetId)=>{scene.selected={actorId,targetId};paintSelection();};
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
    const idle=ticker=>{elapsed+=ticker.deltaMS;if(global.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;let i=0;for(const a of scene.actors.values()){if(!a.acting)a.sprite.scale.y=a.baseScale*(1+Math.sin(elapsed/1100+i++)*.006);}};
    app.ticker.add(idle);
    scene.destroy=()=>{if(scene.destroyed)return;scene.destroyed=true;observer.disconnect();scene.tweens.forEach(cancel=>cancel());app.destroy(true,{children:true,texture:false,textureSource:false});};
    return scene;
  }
  function tween(scene,duration,update,done){let elapsed=0;const cancel=()=>{scene.app.ticker.remove(tick);scene.tweens.delete(cancel);};const tick=ticker=>{elapsed+=ticker.deltaMS;update(Math.min(1,elapsed/duration));if(elapsed>=duration){cancel();done?.();}};scene.tweens.add(cancel);scene.app.ticker.add(tick);return cancel;}
  function flash(scene,actorId,targetId,kind='melee',value=''){
    if(!scene||scene.destroyed)return;
    const actor=scene.actors.get(actorId),target=scene.actors.get(targetId);if(!actor||!target)return;
    if(global.matchMedia?.('(prefers-reduced-motion: reduce)').matches)return;
    const dx=target.homeX-actor.homeX,dy=target.homeY-actor.homeY;
    actor.acting=true;
    const ranged=kind==='magic'||kind==='ranged'||kind==='heal';
    const lunge=ranged?0:Math.sign(dx)*Math.min(32,Math.abs(dx)*.14);
    const color=kind==='heal'?'#86bd99':kind==='magic'?'#90b9d1':kind==='fail'?'#b6b9bc':'#dec190';
    tween(scene,650,t=>{
      actor.wrap.x=actor.homeX+Math.sin(t*Math.PI)*lunge;
      actor.sprite.gotoAndStop(Math.min(actor.frames.length-1,Math.floor(t*actor.frames.length)));
      if(t>.53){target.wrap.x=target.homeX+(kind==='fail'?Math.sin((t-.53)*Math.PI/.47)*12:Math.sin(t*42)*2);target.sprite.tint=kind==='fail'?0xffffff:kind==='heal'?0xb7dfbe:0xf0d7c5;}
    },()=>{actor.wrap.x=actor.homeX;actor.sprite.gotoAndStop(0);actor.acting=false;target.wrap.x=target.homeX;target.sprite.tint=0xffffff;});
    const fx=new (P().Graphics)();scene.layers.effects.addChild(fx);
    const y1=actor.homeY-(actor.homeY-actor.bounds.top)*.55,y2=target.homeY-(target.homeY-target.bounds.top)*.55;
    tween(scene,650,t=>{fx.clear();
      if(ranged&&t<.65){const progress=t/.65,x=actor.homeX+dx*progress,y=y1+(y2-y1)*progress;
        if(kind==='ranged')fx.moveTo(x-Math.sign(dx)*10,y+2).lineTo(x,y).stroke({color,width:2});else fx.rect(x-3,y-3,6,6).fill({color,alpha:.8});
      }else if(t>.5&&kind!=='fail'){const r=(kind==='critical'?17:11)*(t-.5)*2;fx.moveTo(target.homeX-r,y2-r).lineTo(target.homeX+r,y2+r).moveTo(target.homeX+r,y2-r).lineTo(target.homeX-r,y2+r).stroke({color,width:2,alpha:1-t});}
    },()=>fx.destroy());
    if(value){const note=text(value,12,color);note.anchor.set(.5);note.x=target.homeX;note.y=target.bounds.top-5;scene.layers.indicators.addChild(note);tween(scene,720,t=>{note.y=target.bounds.top-5-t*18;note.alpha=1-t;},()=>note.destroy());}
  }
  global.RPGBattlePixi={mount,flash,assetFor,isEnemy};
})(window);
