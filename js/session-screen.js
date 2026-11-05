/* Private companion window. It never loads or writes the campaign database. */
(() => {
  'use strict';
  const token=new URLSearchParams(location.search).get('live');if(!/^[a-f0-9-]{36}$/.test(token||''))return;
  const channel=new BroadcastChannel('rpg-live-private-'+token),root=document.getElementById('detached-reader'),status=document.querySelector('[data-reader-connection]');let reader,lastSeen=Date.now(),connected=false;
  const send=message=>{if(connected)channel.postMessage(message)};
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopImmediatePropagation();root.querySelector('[data-reading-query]')?.focus()}},true);
  function prepare(text,title){const d=RPGUI.dialog('Trecho que será mostrado aos jogadores','<p>Confira o texto público antes de enviar.</p><label class="sheet-field"><span>Texto para a TV</span><textarea rows="8" maxlength="12000"></textarea></label><div class="dialog-actions"><button class="metal-btn" data-share-text>Exibir na TV</button></div>');d.querySelector('textarea').value=text;d.querySelector('[data-share-text]').onclick=()=>{if(!connected){status.textContent='Reconecte o aplicativo principal para enviar.';return}send({type:'show-text',title,text:d.querySelector('textarea').value});d.close()}}
  channel.onmessage=e=>{const m=e.data;if(!m)return;if(m.type==='close'){window.close();return}if(m.type==='sleep'){connected=false;status.textContent='Mestre desconectado · consulta local disponível';return}lastSeen=Date.now();connected=true;status.textContent='Conectada · esta janela não aparece na TV';
    if(m.type==='heartbeat'){channel.postMessage({type:reader?'alive':'ready'});return}
    if(m.type==='document'&&Array.isArray(m.document?.blocks)){reader?.dispose();reader=RPGLiveReader.mount(root,{document:m.document,adventures:m.adventures,index:m.index,onAdventure:id=>send({type:'document-request',id}),onLocation:index=>send({type:'reading-location',id:m.document.id,index}),onText:prepare})}
  };
  setInterval(()=>{if(Date.now()-lastSeen>7500){connected=false;status.textContent='Mestre desconectado · consulta local disponível'}if(!reader)channel.postMessage({type:'ready'})},3000);channel.postMessage({type:'ready'});window.addEventListener('pagehide',()=>{reader?.dispose();channel.close()});
})();
