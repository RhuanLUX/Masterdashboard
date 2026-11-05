/* One public window, exclusively the active battle. The master remains the writer. */
(() => {
  'use strict';
  let channel, token, tv, timer;
  const current=()=>window.RPGV3?.currentCombat(window.RPGMasterHost?.getState());
  function init(){if(channel)return;try{token=sessionStorage.getItem('rpg-combat-tv')}catch(_){}if(!/^[a-f0-9-]{36}$/.test(token||'')){token=crypto.randomUUID();try{sessionStorage.setItem('rpg-combat-tv',token)}catch(_){}}
    channel=new BroadcastChannel('rpg-combat-tv-'+token);channel.onmessage=e=>{if(e.data?.type==='ready')publish()};
    setInterval(()=>channel.postMessage({type:'heartbeat'}),2000);
    addEventListener('pagehide',()=>channel.postMessage({type:'sleep'}));
  }
  function publish(effect=null){if(!channel)return;const c=current();channel.postMessage({type:'scene',scene:c&&window.RPGBattleArena?.publicPayload(c)||{participants:[],activeId:null},effect})}
  function open(){if(!('BroadcastChannel'in window))return RPGUI.alert('Este navegador não oferece a sincronização da TV. Abra o RPG Master em um navegador atualizado.');init();if(tv&&!tv.closed){tv.focus();publish();return}
    tv=window.open('battle-display.html?tv='+token,'rpg-combat-tv-'+token,'popup=yes,width=1280,height=800');if(!tv)return RPGUI.alert('Permita pop-ups deste endereço para abrir a TV de combate.');publish();
  }
  addEventListener('rpg-state-changed',()=>{if(!channel)return;clearTimeout(timer);timer=setTimeout(()=>publish(),80)});
  document.addEventListener('click',e=>{if(e.target.closest('[data-combat-tv]'))open()});
  addEventListener('load',()=>{if('BroadcastChannel'in window)init()});
  window.RPGCombatTV={open,publish};
})();
