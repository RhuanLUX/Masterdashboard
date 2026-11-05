/* IndexedDB transactions in browsers; durable atomic files through the desktop bridge. */
(() => {
  'use strict';
  let db, pending, timeout, chain = Promise.resolve(), lastRecovery = 0;
  let status = 'Pronto para salvar', lastError = null;
  const request = r => new Promise((resolve,reject) => {r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});
  const transaction = tx => new Promise((resolve,reject)=>{tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error||Error('Gravação interrompida.'))});
  function announce(text,error=null) {status=text;lastError=error;const n=document.querySelector('#save-state');if(n){n.textContent=text;n.dataset.error=error?'true':'false'}window.dispatchEvent(new CustomEvent('rpg-save-status',{detail:{status,error:error?.message}}));}
  async function open() {
    try {const r=indexedDB.open('fangorn-rpg-v1',2);r.onupgradeneeded=()=>{for(const name of ['state','gallery','recovery'])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name,name==='state'?undefined:{keyPath:'id'})};db=await request(r);db.onversionchange=()=>db.close();return db}
    catch(e){announce('Armazenamento do navegador indisponível',e);return null}
  }
  async function load() {
    if(window.RPGDesktop){try{const x=await RPGDesktop.load();if(x){RPGData.validateBackup(x);announce(x.recovered?'Recuperado do backup automático':'Salvo no computador');return {state:x.state,images:decodeImages(x.images||[])}}}catch(e){announce('Não foi possível ler a campanha. Use Recuperação.',e);throw e}}
    let state,images=[];
    if(db){state=await request(db.transaction('state').objectStore('state').get('main'));images=await request(db.transaction('gallery').objectStore('gallery').getAll())}
    let old;try{old=JSON.parse(localStorage.getItem('fangorn-rpg-state'));if(old)RPGData.validateState(old)}catch(_){old=null}
    if(old&&(!state||Date.parse(old.updatedAt)>Date.parse(state.updatedAt)))state=old;
    if(state)RPGData.validateState(state);
    announce(state?'Salvo localmente':'Pronto para salvar');return {state,images};
  }
  const dataUrl = blob=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)});
  async function envelope(state,images) {return {schemaVersion:5,exportedAt:new Date().toISOString(),state:structuredClone(state),images:await Promise.all(images.map(async im=>({id:im.id,title:im.title,category:im.category,createdAt:im.createdAt,mimeType:im.mimeType,data:im.data||await dataUrl(im.blob)})))}}
  function decodeImages(images){return images.map(im=>{const [head,b64]=im.data.split(','),raw=atob(b64),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));return {...im,blob:new Blob([bytes],{type:head.slice(5).split(';')[0]})}})}
  async function commit(state,images,{replace=false,recovery=false}={}) {
    RPGData.validateState(state);
    if(window.RPGDesktop){await RPGDesktop.save(await envelope(state,images),{forceBackup:recovery});}
    if(db&&!window.RPGDesktop){
      if(recovery||Date.now()-lastRecovery>600000){
        const previous=await request(db.transaction('state').objectStore('state').get('main'));
        if(previous){const priorImages=await request(db.transaction('gallery').objectStore('gallery').getAll());const tx=db.transaction('recovery','readwrite');tx.objectStore('recovery').put({id:Date.now().toString(),state:previous,images:priorImages});await transaction(tx);const all=await request(db.transaction('recovery').objectStore('recovery').getAll());const trim=db.transaction('recovery','readwrite');all.sort((a,b)=>Number(b.id)-Number(a.id)).slice(5).forEach(x=>trim.objectStore('recovery').delete(x.id));await transaction(trim)}lastRecovery=Date.now();
      }
      const tx=db.transaction(['state','gallery'],'readwrite');tx.objectStore('state').put(state,'main');if(replace)tx.objectStore('gallery').clear();for(const image of images){const {url,...item}=image;tx.objectStore('gallery').put(item)}await transaction(tx);
    } else if(!window.RPGDesktop) throw Error('IndexedDB indisponível. Exporte um backup antes de fechar.');
    try{const json=JSON.stringify(state);if(json.length<1500000)localStorage.setItem('fangorn-rpg-state',json);else localStorage.removeItem('fangorn-rpg-state')}catch(_){/* IDB/disk transaction already committed. */}
    announce(window.RPGDesktop?'Salvo no computador':'Salvo localmente');
  }
  function enqueue(fn){const job=chain.catch(()=>{}).then(fn);chain=job;return job.catch(e=>{announce('Falha ao salvar — exporte um backup',e);throw e})}
  function schedule(state,images) {pending={state:structuredClone(state),images:[...images]};announce('Salvando…');clearTimeout(timeout);timeout=setTimeout(()=>flush().catch(()=>{}),180)}
  function flush(){clearTimeout(timeout);const job=pending;pending=null;if(job)return enqueue(()=>commit(job.state,job.images));return chain}
  async function replace(backup){RPGData.validateBackup(backup);await flush();const images=decodeImages(backup.images||[]);await enqueue(()=>commit(backup.state,images,{replace:true,recovery:true}));return images}
  async function update(state,images){await flush();return enqueue(()=>commit(structuredClone(state),images,{recovery:true}))}
  async function recoveries(){if(window.RPGDesktop)return RPGDesktop.recoveries();if(!db)return [];return (await request(db.transaction('recovery').objectStore('recovery').getAll())).sort((a,b)=>Number(b.id)-Number(a.id)).map(x=>({id:x.id,date:new Date(Number(x.id)).toISOString()}))}
  async function recovery(id){if(window.RPGDesktop)return RPGDesktop.recovery(id);const x=await request(db.transaction('recovery').objectStore('recovery').get(id));if(!x)throw Error('Backup não encontrado.');return envelope(x.state,x.images)}
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')flush().catch(()=>{})});
  window.addEventListener('beforeunload',e=>{if(pending||lastError){flush().catch(()=>{});e.preventDefault();e.returnValue=''}});
  window.RPGDesktop?.onBeforeClose(async()=>{try{await flush();await RPGDesktop.closed(true)}catch(_){await RPGDesktop.closed(false)}});
  window.RPGStorage={open,load,schedule,flush,replace,update,envelope,recoveries,recovery,commit,get status(){return status},get error(){return lastError}};
})();
