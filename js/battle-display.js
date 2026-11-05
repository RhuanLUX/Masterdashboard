/* Combat TV: a filtered Pixi arena, with no campaign database or master controls. */
(() => {
  'use strict';
  const token=new URLSearchParams(location.search).get('tv'),scoped=/^[a-f0-9-]{36}$/.test(token||''),channel=new BroadcastChannel(scoped?'rpg-combat-tv-'+token:'rpg-master-battle-v32');
  const stage=document.querySelector('[data-public-arena]'),waiting=document.querySelector('[data-tv-waiting]');let scene,signature='',queue=Promise.resolve(),lastSeen=Date.now(),connected=false;
  function visibility(){stage.hidden=!connected;waiting.hidden=connected}
  async function draw(data,effect,speech){if(!data||!Array.isArray(data.participants))return;const next=JSON.stringify(data.participants);
    if(next!==signature||!scene){if(!scene?.updateParticipants(data.participants,{impactDelay:effect?(effect.kind==='magic'||effect.kind==='ranged'?790:345):0})){const previousDefeated=scene&&new Map([...scene.actors].map(([id,a])=>[id,a.down]));scene?.destroy();scene=await RPGBattlePixi.mount(stage,data.participants,{public:true,previousDefeated})}signature=next}
    const actor=effect?.actorId||data.activeId,target=effect?.targetId||data.targetId;scene.select(scene.actors.has(actor)?actor:null,scene.actors.has(target)?target:null);
    if(effect&&connected)RPGBattlePixi.flash(scene,effect.actorId,effect.targetId,effect.kind,effect.text,{spell:effect.spell,outcome:effect.outcome});
    if(speech&&connected)RPGBattlePixi.speak(scene,speech);
  }
  channel.onmessage=e=>{const m=e.data;if(!m)return;if(m.type==='sleep'){connected=false;visibility();return}
    if(m.type==='heartbeat'){lastSeen=Date.now();if(!connected)channel.postMessage({type:'ready'});return}
    if(m.type==='scene'){lastSeen=Date.now();connected=true;visibility();queue=queue.then(()=>draw(m.scene,m.effect,m.speech)).catch(error=>{console.error(error);connected=false;visibility();waiting.textContent='Aguardando a arena do mestre…'})}
  };
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen()}catch(_){waiting.textContent='Use F11 para tela cheia'}};
  document.querySelector('[data-player-fullscreen]').onclick=fullscreen;stage.ondblclick=fullscreen;
  setInterval(()=>{if(Date.now()-lastSeen>7500){connected=false;visibility()}if(!connected)channel.postMessage({type:'ready'})},2500);
  channel.postMessage({type:'ready'});visibility();addEventListener('pagehide',()=>{scene?.destroy();channel.close()});
})();
