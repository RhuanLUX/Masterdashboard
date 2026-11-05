/* Player-only surface: no campaign store, notes, character stats or disk bridge. */
(() => {
  'use strict';
  const token=new URLSearchParams(location.search).get('live'),scoped=/^[a-f0-9-]{36}$/.test(token||''),channel=new BroadcastChannel(scoped?'rpg-live-public-'+token:'rpg-master-battle-v32');
  let scene,signature='',queue=Promise.resolve(),display={mode:'arena',curtain:false},lastSeen=Date.now(),connected=!scoped;
  const stage=document.querySelector('[data-public-arena]'),content=document.querySelector('[data-public-content]'),overlay=document.querySelector('[data-public-overlay]');
  function visibility(){const hidden=display.curtain||!connected;document.body.dataset.curtain=String(display.curtain);overlay.hidden=!hidden;overlay.textContent=display.curtain?'':'Aguardando conexão com o mestre…';document.querySelector('main').hidden=hidden;document.body.dataset.mode=display.mode;}
  function mode(next){const updated={mode:['arena','image','text','neutral'].includes(next?.mode)?next.mode:'arena',curtain:next?.curtain===true,title:String(next?.title||''),text:String(next?.text||''),image:String(next?.image||'')};const changed=JSON.stringify(updated)!==JSON.stringify(display);display=updated;visibility();if(!changed)return;stage.hidden=display.mode!=='arena';content.hidden=display.mode==='arena';if(display.mode!=='arena'){
      scene?.destroy();scene=null;signature='';content.replaceChildren();document.querySelector('[data-title]').textContent=display.title||'Crônica dos Três Destinos';document.querySelector('[data-round]').textContent='';
      if(display.mode==='image'){const img=document.createElement('img');if(/^(assets\/|RPG_Master_V2_Content_Handoff\/originais\/atlas\/|data:image\/(png|jpeg|webp|gif);base64,|blob:)/.test(display.image))img.src=display.image;img.alt=display.title;content.append(img)}
      else{const p=document.createElement('p');p.textContent=display.mode==='neutral'?'A companhia aguarda o próximo passo.':display.text;content.append(p)}
    }}
  async function draw(data,effect){if(!data||!Array.isArray(data.participants)||display.mode!=='arena')return;document.querySelector('[data-title]').textContent=data.title||'Crônica dos Três Destinos';document.querySelector('[data-round]').textContent=data.participants.length?`Rodada ${data.round||1}`:'Aguardando a cena';const next=JSON.stringify(data.participants);
    if(next!==signature||!scene){if(!scene?.updateParticipants(data.participants)){scene?.destroy();scene=await RPGBattlePixi.mount(stage,data.participants,{public:true});}signature=next;}
    if(display.mode!=='arena'){scene?.destroy();scene=null;signature='';return}const actorId=effect?.actorId||data.activeId;scene.select(scene.actors.has(actorId)?actorId:null,scene.actors.has(effect?.targetId)?effect.targetId:null);
    if(effect&&!display.curtain&&connected)RPGBattlePixi.flash(scene,effect.actorId,effect.targetId,effect.kind,effect.text,{spell:effect.spell,outcome:effect.outcome});
  }
  channel.onmessage=e=>{const m=e.data;if(!m)return;
    if(m.type==='heartbeat'){lastSeen=Date.now();const was=connected;connected=true;visibility();channel.postMessage({type:was?'alive':'ready'});return}
    if(m.type==='sleep'){connected=false;visibility();return}
    if(m.type==='close'){window.close();return}
    if(m.type==='scene'){lastSeen=Date.now();connected=true;if(m.display)mode(m.display);else visibility();queue=queue.then(()=>draw(m.scene,m.effect)).catch(error=>{console.error(error);content.hidden=false;content.textContent='A cena não pôde ser carregada. Aguarde o mestre.'})}
  };
  document.querySelector('[data-player-fullscreen]').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(_){document.querySelector('[data-player-fullscreen]').textContent='Use F11 para tela cheia'}};
  if(scoped)setInterval(()=>{if(Date.now()-lastSeen>7500){connected=false;visibility()}channel.postMessage({type:'ready'})},4000);
  channel.postMessage({type:'ready'});visibility();window.addEventListener('pagehide',()=>{scene?.destroy();channel.close()});
})();
