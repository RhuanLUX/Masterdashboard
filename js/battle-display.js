/* Mesmo palco público; mensagens são desenhadas em ordem e efeitos não recriam a cena. */
(function () {
  'use strict';
  if (!('BroadcastChannel' in window)) { document.querySelector('[data-round]').textContent='Este navegador não oferece sincronização entre janelas.'; return; }
  let scene, signature='', queue=Promise.resolve();
  const channel=new BroadcastChannel('rpg-master-battle-v32');
  async function draw(data,effect) {
    document.querySelector('[data-title]').textContent=data.title;
    document.querySelector('[data-round]').textContent=`Rodada ${data.round}`;
    const next=JSON.stringify(data.participants);
    if(next!==signature||!scene){if(!scene?.updateParticipants(data.participants)){scene?.destroy();scene=await window.RPGBattlePixi.mount(document.querySelector('[data-public-arena]'),data.participants,{public:true});}signature=next;}
    // Only already-revealed actors can receive indicators or effects.
    const actorId=effect?.actorId||data.activeId;
    scene.select(scene.actors.has(actorId)?actorId:null,scene.actors.has(effect?.targetId)?effect.targetId:null);
    if(effect)window.RPGBattlePixi.flash(scene,effect.actorId,effect.targetId,effect.kind,effect.text);
  }
  channel.onmessage=event=>{if(event.data?.type==='scene')queue=queue.then(()=>draw(event.data.scene,event.data.effect)).catch(console.error);};
  channel.postMessage({type:'ready'});
  window.addEventListener('pagehide',()=>{scene?.destroy();channel.close();});
})();
