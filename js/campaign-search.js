/* Session references: plain-text indexing, previews and stable source links. */
(() => {
  'use strict';
  const host=()=>window.RPGMasterHost, E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const blockText=b=>b.text||(b.rows||[]).map(r=>r.join(' · ')).join('\n');
  function entries(){
    const s=host().getState(),all=[];
    const add=(id,title,kind,text,target)=>all.push({id,title,kind,text:String(text||''),target});
    for(const c of Object.values(s.characters))add('character:'+c.id,c.name,'Companhia',[c.info.race,c.info.classLevel,...c.background,...c.powers.map(r=>r.join(' · ')),...c.notes].join('\n'),{type:'character',id:c.id});
    for(const a of s.v2.adventures.filter(a=>!a.archived)){
      add('adventure:'+a.id,a.title,'Aventuras',a.description,{type:'adventure',id:a.id});
      (host().adventureData(a)?.blocks||[]).forEach((b,i)=>{const t=blockText(b);if(t.trim())add('passage:'+a.id+':'+(b.id||i),a.title,'Aventuras',t,{type:'adventure',id:a.id,index:i,blockId:b.id})});
    }
    for(const kind of ['rules','documents'])for(const [key,doc]of Object.entries(window.RPG_MASTER_V2_CONTENT?.[kind]||{})){
      const title=doc.title||key,text=(doc.blocks||[]).map(blockText).join('\n');add(kind+':'+key,title,kind==='rules'?'Regras':'Documentos',text,{type:'document',kind,key,title});
    }
    for(const x of host().visualEntries())add('visual:'+x.id,x.name,'NPCs',[x.description,x.notes,x.origin].filter(Boolean).join('\n'),{type:'visual',id:x.id});
    for(const x of host().creaturesList())add('creature:'+x.id,x.name,'Criaturas',window.RPGCompendium?.textOf(x)||[x.description,x.special,x.attack,x.damage].filter(Boolean).join('\n'),{type:'creature',id:x.id});
    for(const x of s.v3?.journal||[])add('journal:'+x.id,x.title,'Notas',x.description,{type:'journal',id:x.id});
    for(const a of s.v2.adventures){const note=s.v2.adventureState[a.id]?.notes;if(note)add('note:'+a.id,'Notas · '+a.title,'Notas',note,{type:'adventure',id:a.id})}
    all.push(...(window.RPGCompendium?.searchEntries()||[]));
    return all;
  }
  function find(query,kind='Todas',list=entries()){
    const words=normal(query).trim().split(/\s+/).filter(Boolean);if(!words.length)return [];
    return list.map(x=>({...x,score:words.reduce((n,w)=>n+(normal(x.title).includes(w)?4:0),0)})).filter(x=>(kind==='Todas'||x.kind===kind)&&words.every(w=>normal(x.title+' '+x.text).includes(w))).sort((a,b)=>b.score-a.score).slice(0,60);
  }
  function snippet(text,query,length=200){const first=normal(query).split(/\s+/).filter(Boolean)[0],at=first?normal(text).indexOf(first):0,start=Math.max(0,at-55);return (start?'…':'')+text.slice(start,start+length)+(text.length>start+length?'…':'')}
  function marked(text,query){const words=normal(query).split(/\s+/).filter(Boolean);if(!words.length)return E(text);const folded=normal(text),ranges=[];for(const w of words){let pos=0;while((pos=folded.indexOf(w,pos))>=0){ranges.push([pos,pos+w.length]);pos+=w.length;if(ranges.length>500)break}}ranges.sort((a,b)=>a[0]-b[0]);const merged=[];for(const r of ranges){const last=merged.at(-1);if(last&&r[0]<=last[1])last[1]=Math.max(last[1],r[1]);else merged.push(r)}let at=0,out='';for(const [start,end]of merged){out+=E(text.slice(at,start))+'<mark>'+E(text.slice(start,end))+'</mark>';at=end}return out+E(text.slice(at))}
  function open(entry){const s=host().getState(),t=entry.target;if(t.type==='character'){s.app.char=t.id;s.app.tab='Visão Geral';host().setView('character')}
    else if(t.type==='adventure'){const a=s.v2.adventures.find(a=>a.id===t.id);let index=t.index;if(t.blockId){const found=host().adventureData(a)?.blocks.findIndex(b=>b.id===t.blockId);if(found>=0)index=found}host().openAdventure(t.id,index)}
    else if(t.type==='document')host().openSourceReader(t.kind,t.key,t.title);
    else if(t.type==='visual'){const x=host().visualEntries().find(x=>x.id===t.id);if(x)host().visualDetail(x)}
    else if(t.type==='creature'){const x=host().creaturesList().find(x=>x.id===t.id);if(x)host().creatureDetail(x)}
    else if(t.type==='spell')window.RPGCompendium.spellDetail(window.RPGCompendium.spells().find(x=>x.id===t.id));
    else if(t.type==='class')window.RPGCompendium.classDetail(window.RPG_LIBRARY_EXPANSION.classes.find(x=>x.id===t.id));
    else if(t.type==='journal')window.RPGMasterUI.open('journal');
  }
  function preview(entry,query=''){
    const d=RPGUI.dialog(entry.title,`<p class="source-note">${E(entry.kind)} · consulta do mestre</p><div class="reference-text">${marked(entry.text,query)}</div><div class="dialog-actions"><button class="metal-btn" data-open-reference>Abrir na origem</button></div>`);
    d.querySelector('[data-open-reference]').onclick=()=>{d.close();open(entry)};return d;
  }
  function search(){
    const list=entries(),d=RPGUI.dialog('Consultar sem sair da mesa',`<div class="search-tools"><label class="sheet-field"><span>Palavras-chave · acentos e maiúsculas não importam</span><input data-search-all type="search" placeholder="Ex.: goblin arco, medo, fogo…" autocomplete="off"></label><label class="sheet-field"><span>Onde procurar</span><select data-search-kind>${['Todas','Aventuras','Companhia','Regras','Documentos','NPCs','Criaturas','Classes','Magias','Notas'].map(k=>`<option>${k}</option>`).join('')}</select></label></div><p data-search-count role="status"></p><div class="search-workspace"><div data-search-results class="search-results"></div><aside data-search-preview class="reference-preview"><p>Escolha um resultado para consultar aqui, sem interromper a leitura ou o combate.</p></aside></div>`,{wide:true});
    let matches=[],query='',timer;
    const choose=i=>{const x=matches[i];if(!x)return;d.querySelectorAll('[data-result]').forEach(n=>n.setAttribute('aria-pressed',String(+n.dataset.result===i)));d.querySelector('[data-search-preview]').innerHTML=`<small>${E(x.kind)} · privado</small><h3>${E(x.title)}</h3><div class="reference-text">${marked(x.text,query)}</div><div class="reference-actions"><button class="metal-btn" data-open-reference>Abrir na origem</button></div>`;d.querySelector('[data-open-reference]').onclick=()=>{d.close();open(x)}};
    const update=()=>{clearTimeout(timer);query=d.querySelector('input').value.trim();matches=find(query,d.querySelector('select').value,list);d.querySelector('[data-search-count]').textContent=query?`${matches.length}${matches.length===60?' primeiros':''} resultados · Enter seleciona o primeiro`:'Busque por uma ou mais palavras. A consulta fica apenas na tela do mestre.';const results=d.querySelector('[data-search-results]');results.innerHTML=matches.map((x,i)=>`<button data-result="${i}" aria-pressed="false"><small>${E(x.kind)}</small><strong>${marked(x.title,query)}</strong><span>${marked(snippet(x.text,query),query)}</span></button>`).join('')||(query?'<p>Nenhum resultado. Tente menos palavras ou outra categoria.</p>':'');d.querySelector('[data-search-preview]').innerHTML='<p>Selecione um resultado para consultar.</p>';results.querySelectorAll('[data-result]').forEach(b=>b.onclick=()=>choose(+b.dataset.result));};
    d.querySelector('input').oninput=()=>{clearTimeout(timer);timer=setTimeout(update,140)};d.querySelector('input').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(timer);update();choose(0)}};d.querySelector('select').onchange=update;d.addEventListener('close',()=>clearTimeout(timer));update();d.querySelector('input').focus();
  }
  window.RPGSearch={entries,find,open,preview,search,normal,marked,blockText};
})();
