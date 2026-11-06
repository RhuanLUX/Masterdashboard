/* Local pixel scenery. Presentation only: no combat rules, timers or network. */
(function (global) {
  'use strict';
  const choices=Object.freeze({mordor:'Mordor · A torre distante',fangorn:'Fangorn · Clareira antiga',rivendell:'Valfenda · Ruínas élficas',road:'Estrada Real · Ponte e vila',hrim:'Hrim · Passagem de inverno'});
  const clean=value=>Object.hasOwn(choices,value)?value:'mordor';
  const hash=value=>{let n=2166136261;for(const c of String(value||'arena'))n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0;};
  function settings(combat){return {id:clean(combat?.arenaEnvironment),seed:hash(combat?.id),epoch:0};}
  function mount(layers,W,H,config={}){
    const P=global.PIXI,id=clean(config.id),seed=Number(config.seed)>>>0,roots=[];
    let disposed=false,mesh,positions,original,dragonSprite,previous=-1,frame=0;
    const motion=new P.Graphics();motion.eventMode='none';motion.scale.set(W/640,H/360);layers.middle.addChild(motion);roots.push(motion);
    const ready=P.Assets.load('assets/battle-scenes/'+(id==='mordor'?'v4.4':'v4.3')+'/'+id+'.png').then(texture=>{
      if(disposed)return;texture.source.scaleMode='nearest';
      mesh=new P.MeshPlane({texture,verticesX:17,verticesY:13});mesh.eventMode='none';mesh.scale.set(W/texture.width,H/texture.height);
      positions=mesh.geometry.getBuffer('aPosition');original=new Float32Array(positions.data);
      layers.distant.addChild(mesh);roots.push(mesh);
      // The original 16-bit art is retained; a subtle four-pose wind only touches foliage.
      // No bitmap is cut into rectangles, and the lower fighting surface stays fixed.
      const shade=new P.Graphics();shade.rect(0,0,W,H).fill({color:0x07131d,alpha:id==='hrim'?.20:id==='rivendell'?.17:.08});layers.distant.addChild(shade);roots.push(shade);
    });
    const dragon=new P.Container();dragon.eventMode='none';dragon.visible=false;layers.middle.addChild(dragon);roots.push(dragon);
    const dragonReady=(id==='mordor'||id==='hrim')?Promise.all([0,1,2].map(i=>P.Assets.load('assets/themes/dragon-flight/fly-'+i+'.png'))).then(textures=>{
      if(disposed)return;for(const t of textures)t.source.scaleMode='nearest';dragonSprite=new P.AnimatedSprite([textures[0],textures[1],textures[2],textures[1]]);dragonSprite.anchor.set(.5);dragonSprite.tint=id==='mordor'?0x606473:0x758c9b;dragonSprite.alpha=.65;dragon.addChild(dragonSprite);
    }):Promise.resolve();
    function tick(now,reduced=false){
      const time=reduced?0:Math.max(0,now-Number(config.epoch||0)),step=Math.floor(time/125);if(step===previous)return;previous=step;frame=step%4;
      const f=[0,1,0,-1][frame];motion.clear();
      if(mesh){
        const tw=mesh.texture.width,th=mesh.texture.height;
        for(let i=0;i<positions.data.length;i+=2){const x=original[i],y=original[i+1],v=y/th,u=x/tw;
          const foliage=(id==='mordor'?0:id==='fangorn'?1:id==='rivendell'||id==='road'?(u<.20||u>.86?1:0):u<.23||u>.87?.45:0);
          const amplitude=!reduced&&v<.34?Math.sin(Math.PI*Math.min(1,v/.34))*Math.sin(Math.PI*u)*foliage:0;
          positions.data[i]=x+Math.sin(frame*Math.PI/2+u*7)*amplitude*tw/850;positions.data[i+1]=y;
        }positions.update();
      }
      if(id==='rivendell'&&!reduced){
        // Waterfalls and river shimmer occupy the same distant bands as the artwork.
        for(const x of [319,395])for(let j=0;j<9;j++)motion.rect(x+j%3,98+(j*7+frame*3)%38,1,3+j%2).fill({color:0xd6ebff,alpha:.15});
        for(let j=0;j<35;j++)motion.rect(157+(j*23+frame*2)%329,139+j%11,2+j%6,1).fill({color:0xd4e6f1,alpha:.10});
      }
      if(id==='mordor'){
        motion.ellipse(380,21,4,1.5).fill({color:0xf9a04a,alpha:reduced?.07:.07+frame*.025});
        if(!reduced)for(let i=0;i<3;i++){const x=(time*.0009+i*229)%840-100;motion.ellipse(x,29+i*15,83,7).fill({color:0x16181d,alpha:.08});}
      }
      if(id==='road'){
        // A second small wagon passes occasionally along the distant bridge.
        const t=((time/1000+seed%29)%54);if(t<16&&!reduced){const x=270+t/16*235,y=109;
          motion.rect(x,y-8,14,7).fill(0x51372f).poly([x-1,y-8,x+2,y-13,x+11,y-13,x+15,y-8]).fill(0x98805b);
          motion.rect(x+3,y-6,3,3).fill(0xe6b875).rect(x+8,y-6,3,3).fill(0xe6b875);
          for(const ox of [3,12])motion.circle(x+ox,y,2.8).fill(0x29272b).moveTo(x+ox-2,y+f).lineTo(x+ox+2,y-f).stroke({color:0x8d7860,width:1});
          motion.rect(x+14,y-3,7,1).fill(0x4a3025).poly([x+21,y-6,x+29,y-6,x+30,y-10,x+33,y-10,x+34,y-8,x+31,y-6,x+29,y-2,x+21,y-2]).fill(0x30282b);
          for(const ox of [22,28])motion.moveTo(x+ox,y-2).lineTo(x+ox+f,y+2).stroke({color:0x30282b,width:1});
        }
        // Cloth tips flutter, offset in phase; no synchronization with combat actions.
        for(const [x,y,phase]of [[155,109,0],[617,96,2]]){const sway=[0,1,0,-1][(frame+phase)%4];motion.poly([x-3,y-8,x+3,y-8,x+3+sway,y,x,y-3,x-3+sway,y]).fill({color:0x7d2943,alpha:.8});}
      }
      if(!reduced)for(let i=0;i<(id==='hrim'?32:15);i++){
        const x=(i*67+seed%640+time*(id==='hrim'?.006:.002))%640,y=(i*31+time*(id==='hrim'?.009:.001))%(id==='hrim'?220:150);
        motion.rect(Math.round(x),Math.round(y),id==='hrim'?2:1,1).fill({color:id==='mordor'?0xc78346:id==='fangorn'?0xc3cb82:0xd5e3dc,alpha:id==='fangorn'?.18+.15*Math.sin(time/700+i):.25});
      }
      if((id==='fangorn'||id==='road')&&!reduced)for(let i=0;i<5;i++){
        const t=(time/1000*.05+i*.19)%1,x=(time*.009+i*123+seed%100)%640,y=30+t*110;
        motion.poly([x-2,y,x+Math.cos(t*12+i)*3,y-1,x+2,y+1,x,y+2]).fill({color:id==='fangorn'?0x829352:0xb9995a,alpha:.5});
      }
      const flight=((time/1000+seed%31)%63);dragon.visible=!reduced&&flight<13;
      if(dragonSprite){dragon.position.set((-45+flight/13*740)*W/640,(32+Math.sin(flight*.4)*9)*H/360);dragonSprite.gotoAndStop(frame);const scale=48/dragonSprite.texture.width;dragonSprite.scale.set(scale*W/640,scale*H/360);}
    }
    return {id,seed,ready:Promise.all([ready,dragonReady]),get frame(){return frame;},tick,destroy(){disposed=true;for(const g of roots)if(!g.destroyed)g.destroy({children:true});}};
  }
  global.RPGBattleEnvironment={choices,clean,settings,mount};
})(window);
