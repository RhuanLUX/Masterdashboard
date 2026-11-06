/* Shared visual spell catalog and bounded local Pixi effects. No combat rules. */
(function(global){
  'use strict';
  const definitions={
    fire:['Fogo',1100,.72],ice:['Gelo',1100,.72],lightning:['Eletricidade',1100,.72],missiles:['Mísseis mágicos',1100,.72],
    wind:['Vento · Rajada espiral',1100,.72],stone:['Pedra · Impacto rochoso',1100,.72],
    hurricane:['Furacão',1800,.64],meteor:['Meteoro',1500,.64],blizzard:['Nevasca',1700,.64],
    tidal:['Onda das marés',1450,.64],poison:['Nuvem venenosa',1550,.64],shadow:['Lanças das sombras',1300,.64],radiance:['Luz sagrada',1450,.64]
  };
  const names=Object.freeze(Object.fromEntries(Object.entries(definitions).map(([id,v])=>[id,v[0]])));
  const extended=new Set(['hurricane','meteor','blizzard','tidal','poison','shadow','radiance']);
  function timing(kind,spell){const d=kind==='magic'?(definitions[spell]||definitions.fire):kind==='heal'?['',1450,.28]:kind==='ranged'?['',1100,.72]:['',650,.53];return {duration:d[1],impactDelay:Math.round(d[1]*d[2]),impact:d[2]};}
  function effect(scene,actor,target,spell,outcome,tween){
    if(!extended.has(spell))return null;
    const P=global.PIXI,fx=new P.Graphics();fx.label='combat-fx:'+spell;fx.eventMode='none';scene.layers.effects.addChild(fx);
    const s=Math.max(.65,Math.min(1.25,scene.app.screen.height/500)),x0=actor.homeX,y0=actor.homeY-(actor.homeY-actor.bounds.top)*.6;
    const x=target.homeX,y=target.homeY,h=Math.max(55,Math.min(130,(y-target.bounds.top)/s)),cy=y-h*s*.5;
    const clamp=v=>Math.max(0,Math.min(1,v)),lerp=(a,b,p)=>a+(b-a)*p;
    const palettes={hurricane:[0x698d8a,0xb1d1cb,0xe9f5dd],meteor:[0xa42f20,0xff8628,0xffe2a0],blizzard:[0x488bb6,0x96e2eb,0xecffff],tidal:[0x236c8b,0x59bfc4,0xe1fff2],poison:[0x405d35,0x8cbd54,0xdae78b],shadow:[0x342844,0x9267a9,0xdbb8f4],radiance:[0xa87131,0xf6d882,0xfffae1]};
    const c=palettes[spell];
    const dot=(xx,yy,r,col,a=1)=>fx.circle(xx,yy,Math.max(.1,r*s)).fill({color:col,alpha:clamp(a)});
    const ellipse=(xx,yy,rx,ry,col,a=1,w=1.5)=>fx.ellipse(xx,yy,Math.max(.1,rx*s),Math.max(.1,ry*s)).stroke({color:col,alpha:clamp(a),width:w*s});
    const path=(pts,col,a=1,w=2)=>{if(!pts.length)return;fx.moveTo(...pts[0]);for(const p of pts.slice(1))fx.lineTo(...p);fx.stroke({color:col,alpha:clamp(a),width:w*s});};
    const diamond=(xx,yy,r,angle,col,a=1)=>{const u=Math.cos(angle),v=Math.sin(angle);fx.poly([xx+u*r*s,yy+v*r*s,xx-v*r*.3*s,yy+u*r*.3*s,xx-u*r*.65*s,yy-v*r*.65*s,xx+v*r*.3*s,yy-u*r*.3*s]).fill({color:col,alpha:clamp(a)});};
    const clear=()=>{if(!fx.destroyed)fx.destroy();};
    const stop=tween(scene,timing('magic',spell).duration,t=>{
      fx.clear();fx.alpha=outcome==='fail'?.5:1;
      const charge=clamp(t/.22),travel=clamp((t-.20)/.44),burst=clamp((t-.64)/.36),fade=Math.min(1,t*9,(1-t)*5);
      if(t<.27){ellipse(x0,y0,8+charge*12,8+charge*12,c[1],(1-charge*.6)*.8);dot(x0,y0,charge*5,c[2],.8);
        for(let i=0;i<5;i++){const a=i*1.256+t*15,r=(26-charge*18)*s;diamond(x0+Math.cos(a)*r,y0+Math.sin(a)*r,3,a,c[1],charge);}}
      if(t<.20)return;
      if(spell==='hurricane'){
        // A vertical, tapered funnel travels along the floor, with independent helical bands.
        const xx=lerp(x0,x,travel),base=lerp(actor.homeY,y,travel),height=(h+44)*Math.min(1,(t-.2)*8)*s;
        const radius=(41+Math.sin(t*9)*3)*s,top=base-height;
        const center=z=>xx+Math.sin(z*4.5+t*10)*z*9*s;
        const width=z=>(6+Math.pow(z,1.2)*36+Math.sin(z*22+t*27)*z*2)*s;
        const contour=[];for(let j=0;j<=18;j++){const z=j/18;contour.push(center(z)-width(z),base-z*height);}for(let j=18;j>=0;j--){const z=j/18;contour.push(center(z)+width(z),base-z*height);}
        fx.poly(contour).fill({color:0x9ca99f,alpha:fade*.56});
        for(let j=0;j<18;j++){const z=j/18,z2=(j+1)/18,r=width(z),r2=width(z2),cx=center(z),cx2=center(z2),yy=base-z*height,yy2=base-z2*height;
          fx.poly([cx-r,yy,cx2-r2,yy2,cx2+r2*.1,yy2,cx+r*.1,yy]).fill({color:0xc4cbbd,alpha:fade*.15});
          fx.poly([cx+r*.35,yy,cx2+r2*.35,yy2,cx2+r2,yy2,cx+r,yy]).fill({color:0x344847,alpha:fade*.28});
        }
        // Winding ribbons climb the cone instead of forming repeated horizontal rings.
        for(let ribbon=0;ribbon<3;ribbon++){const pts=[],light=[];for(let k=0;k<=64;k++){const z=k/64,a=z*Math.PI*8-t*27+ribbon*2.094,r=width(z),px=center(z)+Math.cos(a)*r,py=base-z*height+Math.sin(a)*r*.16;pts.push([px,py]);if(Math.sin(a)>0)light.push([px,py]);else if(light.length){path(light,0xe0e5d5,fade*.30,1.6);light.length=0;}}
          path(pts,0x435d58,fade*.32,4);if(light.length)path(light,0xe0e5d5,fade*.30,1.6);
        }
        for(let j=0;j<11;j++){const a=t*11+j*.57;dot(center(1)+Math.cos(a)*radius*.75,top+Math.sin(a)*8*s,10+j%4,0x9da99d,fade*.24);}
        for(let i=0;i<18;i++){const z=(t*2.2+i/18)%1,a=t*35+i*2.4,r=(11+z*35)*s;diamond(xx+Math.cos(a)*r,base-z*height+Math.sin(a)*r*.25,2+i%3,a,i%3?0xb1a583:0x52684b,fade*.8);}
        for(let j=0;j<8;j++){const a=t*18+j*.785;dot(xx+Math.cos(a)*(20+burst*16)*s,base+Math.sin(a)*5*s,4+j%3,0xa69b7e,fade*.28);}
      }else if(spell==='meteor'){
        const sx=x-100*s,sy=Math.max(8,cy-220*s),xx=lerp(sx,x,travel),yy=lerp(sy,cy,travel),a=Math.atan2(cy-sy,x-sx);
        if(t<.65){for(let i=18;i>=0;i--){const u=clamp(travel-i*.023),tx=lerp(sx,x,u),ty=lerp(sy,cy,u),r=25-i*.85;dot(tx,ty,r,c[1],fade*(1-i/21)*.12);diamond(tx,ty,r,a,c[i%3],fade*(1-i/21)*.8);}
          for(let i=0;i<11;i++){const u=clamp(travel-((t*2+i*.073)%1)*.3),off=Math.sin(i*3+t*25)*(12+i%4)*s;dot(lerp(sx,x,u)+Math.cos(a+1.57)*off,lerp(sy,cy,u)+Math.sin(a+1.57)*off,1+i%2,c[1+i%2],fade*.8);}
          dot(xx,yy,27,c[1],.13);fx.poly([xx-17*s,yy-7*s,xx-7*s,yy-20*s,xx+14*s,yy-13*s,xx+20*s,yy+7*s,xx+3*s,yy+18*s,xx-16*s,yy+10*s]).fill(0x62443b);
          path([[xx-11*s,yy-9*s],[xx,yy-3*s],[xx-3*s,yy+11*s]],c[1],1,3);diamond(xx+7*s,yy-6*s,9,a,c[2]);}
        if(t>=.64){ellipse(x,y,12+burst*70,4+burst*16,c[1],fade*.7,3);dot(x,cy,30*(1-burst),c[2],fade*.3);
          for(let i=0;i<17;i++){const a=i*2.399,r=(12+burst*65)*s;diamond(x+Math.cos(a)*r,cy+Math.sin(a)*r*.6+burst*burst*35*s,4+(i%3),a,c[i%3],fade);}}
      }else if(spell==='blizzard'){
        const top=Math.max(10,y-(h+62)*s);for(let i=0;i<5;i++)dot(x+(i-2)*19*s,top+Math.sin(i*2)*6*s,24,c[0],fade*.18);
        for(let i=0;i<27;i++){const p=(t*2.6+i*.137)%1,xx=x+Math.sin(i*3.71)*53*s-p*20*s,yy=top+p*(y-top);diamond(xx,yy,6+i%5,1.82,c[1+i%2],fade*Math.sin(p*Math.PI));}
        for(let i=0;i<4;i++){const a=t*10+i*1.57;ellipse(x+Math.cos(a)*8*s,y-6*s,35+i*6,8,c[1],fade*.3,1);}
        if(t>=.64)for(let i=0;i<7;i++){const xx=x+(i-3)*12*s;diamond(xx,y-9*s,13+Math.sin(i)*5,-Math.PI/2,c[2],fade*.75);}
      }else if(spell==='tidal'){
        const xx=lerp(x0,x,travel),base=lerp(actor.homeY,y,travel),dir=x>=x0?1:-1,hh=(h*.78+20)*s;
        const wx=u=>xx+dir*u*s,wy=v=>base-v*hh;
        const crest=()=>fx.moveTo(wx(-42),wy(.1)).bezierCurveTo(wx(-18),wy(.3),wx(-24),wy(.94),wx(4),wy(1)).bezierCurveTo(wx(31),wy(1.08),wx(47),wy(.84),wx(34),wy(.65)).bezierCurveTo(wx(23),wy(.52),wx(11),wy(.68),wx(20),wy(.78));
        crest().bezierCurveTo(wx(6),wy(.85),wx(0),wy(.62),wx(13),wy(.36)).bezierCurveTo(wx(23),wy(.18),wx(35),wy(.06),wx(45),base).lineTo(wx(-50),base).closePath().fill({color:c[0],alpha:fade*.78});
        crest().stroke({color:c[1],alpha:fade*.85,width:6*s});crest().stroke({color:c[2],alpha:fade*.8,width:2*s});
        for(let i=0;i<6;i++){const shift=(i*7+t*27)%39;fx.moveTo(wx(-40+shift*.4),wy(.03)).bezierCurveTo(wx(-15+shift*.25),wy(.22),wx(-27+shift*.7),wy(.52),wx(-9+shift*.45),wy(.76)).stroke({color:c[1],alpha:fade*.25,width:(1+i%2)*s});}
        for(let i=0;i<15;i++){const p=(i*.17+t*2)%1;dot(xx+dir*(p*75-35)*s,base-Math.sin(p*Math.PI)*hh*(.4+i%3*.13),1+i%3,c[2],fade*.7);}
        ellipse(xx,base,44+burst*20,8,c[1],fade*.6,2);
      }else if(spell==='poison'){
        const xx=lerp(x0,x,travel),yy=lerp(y0,cy,travel);
        for(let i=0;i<12;i++){const a=i*2.399+t*3,r=(12+travel*25)*s;dot(xx+Math.cos(a)*r,yy+Math.sin(a)*r*.65,10+i%4*3,c[i%2],fade*.12);}
        for(let i=0;i<16;i++){const p=(t*1.5+i*.13)%1,px=xx+Math.sin(i*3.7+t)*36*s,py=yy+22*s-p*65*s;ellipse(px,py,2+i%3,2+i%3,c[2],fade*Math.sin(p*Math.PI)*.6,1);}
        if(t>=.64)ellipse(x,y,22+burst*30,7,c[1],fade*.6,2);
      }else if(spell==='shadow'){
        ellipse(x0,y0,10,28,c[1],fade*.7,3);ellipse(x0,y0,6,22,c[0],fade,6);
        for(let i=0;i<3;i++){const u=clamp((t-.2-i*.045)/.35),curve=(i-1)*50*s,xx=lerp(x0,x,u),yy=lerp(y0,cy,u)-Math.sin(u*Math.PI)*curve,a=Math.atan2(cy-y0-Math.cos(u*Math.PI)*curve*Math.PI,x-x0);
          if(u>=1)continue;for(let j=0;j<7;j++){const v=clamp(u-j*.025);diamond(lerp(x0,x,v),lerp(y0,cy,v)-Math.sin(v*Math.PI)*curve,16-j*1.5,a,c[0],fade*(1-j/8));}
          diamond(xx,yy,27,a,c[1]);diamond(xx+Math.cos(a)*8*s,yy+Math.sin(a)*8*s,16,a,c[2]);}
        if(t>=.64)for(let i=0;i<8;i++){const a=i*Math.PI/4;diamond(x+Math.cos(a)*burst*40*s,cy+Math.sin(a)*burst*40*s,12*(1-burst),a,c[1],fade);}
      }else if(spell==='radiance'){
        const top=Math.max(10,target.bounds.top-42*s),reach=clamp((t-.2)/.44),base=lerp(top,y,reach);
        for(let i=0;i<4;i++){const w=(25-i*5)*s;fx.poly([x-w*.35,top,x+w*.35,top,x+w,base,x-w,base]).fill({color:c[i%3],alpha:fade*(.06+i*.025)});}
        for(let i=0;i<8;i++){const a=i*Math.PI/4+t*.6,r=(i%2?11:23)*s;path([[x+Math.cos(a)*5*s,top+Math.sin(a)*5*s],[x+Math.cos(a)*r,top+Math.sin(a)*r]],c[2],fade,2);}
        dot(x,top,7,c[2],fade);ellipse(x,top,15,15,c[1],fade*.8);
        if(t>=.64){ellipse(x,y,14+burst*45,4+burst*9,c[1],fade,2);for(let i=0;i<12;i++){const a=i*2.399,r=burst*50*s;diamond(x+Math.cos(a)*r,cy+Math.sin(a)*r,4,a,c[2],fade);}}
      }
    },clear);
    return ()=>{stop();clear();};
  }
  global.RPGBattleMagic=Object.freeze({names,timing,effect,extended});
})(window);
