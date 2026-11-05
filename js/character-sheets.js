/* Source-faithful player sheets. Values and modifiers are never recalculated from external rules. */
(() => {
  'use strict';
  const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clone=x=>JSON.parse(JSON.stringify(x)), missing=v=>v===undefined||v===null||v===''||v==='—';
  const host=()=>window.RPGMasterHost, source=id=>window.FANGORN_ROSTER.characters.find(c=>c.id===id)?.source;
  const tabs=['Visão Geral','Atributos','Perícias','Poderes / Runas / Magias','Equipamentos','Inventário','Background','Anotações','Fonte original','Alterações'];
  const infoLabels={race:'Raça',classLevel:'Classe e nível',player:'Jogador',title:'Título',background:'Antecedente',alignment:'Alinhamento',age:'Idade',height:'Altura',weight:'Peso',languages:'Idiomas',renown:'Renome',legend:'Traço lendário',role:'Função'};
  const combatLabels={hpCurrent:'PV atual',hpMax:'PV máximo',ac:'CA',initiative:'Iniciativa',movement:'Deslocamento',proficiency:'Proficiência',inspiration:'Inspiração',hitDice:'Dados de vida',casting:'Conjuração'};
  const sourcePowerDetails={
    'Fúria da Forja':{cost:'Ação bônus / 3x por descanso longo',duration:'5 turnos'},
    'Runa da Brasa':{cost:'1 Carga de Brasa'},
    'Impacto da Forja':{range:'Inimigos a até 3m',cost:'3 Cargas'},
    'Runa da Rocha':{cost:'Reação / 2x por descanso curto'},
    'Marca do Desafio':{range:'1 inimigo a até 6m',cost:'Ação bônus',duration:'Até o início do próximo turno do Anão'},
    'Guarda da Primeira Linha':{range:'Aliado adjacente',cost:'Reação / 1x por rodada'},
    'Sangue de Fogo Antigo':{range:'Inimigos adjacentes',cost:'1x por descanso longo',duration:'Aura de fogo por 2 rodadas'},
    'Investida de Brasa':{cost:'Usa a ação do Anão / 1x por combate'},
    'Voz Persuasiva':{duration:'1 minuto'},
    'Canção de Cura':{range:'Aliados em 6m'}
  };
  function baseline(id){
    const s=source(id),p=s.sourceParagraphs||[],d=s.details||Object.fromEntries((s.sheetValues?.Ficha.rows||[]).filter(r=>r[0]).map(r=>[r[0],r[1]]));
    const header=Object.fromEntries((s.headerText||'').split('\n').map(x=>{const at=x.indexOf(':');return [x.slice(0,at).trim(),x.slice(at+1).trim()]}));
    const line=re=>p.find(x=>re.test(x))?.split(':').slice(1).join(':').trim();
    const hp=d.PV??line(/\(PV\):/),ac=d.CA??line(/\(CA\):/);
    const combat={hpCurrent:hp,hpMax:hp,ac:id==='calion'?'13':ac,initiative:d.Iniciativa??line(/^Iniciativa:/),movement:d.Deslocamento??line(/^Deslocamento:/),proficiency:d['Bônus de Proficiência'],inspiration:d.Inspiracao??line(/^Inspiração:/)??(id==='elenya'?'1':undefined),hitDice:line(/\(DV\):/),casting:line(/^Ataques e Conjuração:/)};
    const names={race:'Raça',classLevel:'Classe e Nível',player:'Jogador',title:'Título',background:'Antecedente',alignment:'Alinhamento',age:'Idade',height:'Altura',weight:'Peso',languages:'Idiomas',renown:'Renome',legend:'Traço Lendário',role:'Função'};
    const info=Object.fromEntries(Object.entries(names).map(([key,label])=>[key,d[label]??header[label]]));
    const between=(a,b)=>p.slice(p.findIndex(x=>a.test(x))+1,p.findIndex(x=>b.test(x))).filter(x=>x.trim());
    const inventory=['elenya','calion'].includes(id)?between(/Equipamento & Inventário/,/Proficências/).filter(x=>!/^1 ponto de inspiração/.test(x)).map(x=>[x,'']):null;
    const powers=id==='calion'?p.filter(x=>/^(Truques|Magias de 1º nível):/.test(x)).flatMap(x=>{let [kind,...v]=x.split(':');return v.join(':').split(',').map(name=>[name.trim(),kind,'Não informado na ficha-fonte.'])}):null;
    const traits=id==='calion'?between(/Proficências/,/Magias Conhecidas/):id==='elenya'?['(não há anotações específicas além das vantagens raciais e de classe)']:[];
    const start=id==='calion'?p.indexOf('História')+1:id==='elenya'?p.findIndex(x=>x.startsWith('Elenya, filha')):0;
    return {combat,info,inventory,powers,traits,attacks:id==='elenya'?['Adaga +3']:id==='calion'?['Encantado – Testes de Conjuração +1']:[],background:start>0?p.slice(start).filter(x=>x.trim()):null};
  }
  function migrate(state){
    state.schemaVersion=Math.max(5,state.schemaVersion||0);
    for(const c of Object.values(state.characters)){
      if(!source(c.id))continue;
      c.sheetHistory??=[];c.resources??=[];c.inventoryMeta??=[];c.powerMeta??=[];c.traits??=[];c.attacks??=[];
      if(c.sheetVersion===1)continue;
      const b=baseline(c.id),changes=[];
      for(const section of ['combat','info'])for(const [key,value]of Object.entries(b[section]))if(missing(c[section][key])&&!missing(value)){changes.push({field:section+'.'+key,before:c[section][key]??'',after:String(value)});c[section][key]=String(value)}
      for(const key of ['inventory','powers','traits','attacks'])if(!c[key].length&&b[key]?.length){changes.push({field:key,before:clone(c[key]),after:clone(b[key])});c[key]=clone(b[key])}
      const sourcePowers=source(c.id).tables?.poderes?.slice(1)||source(c.id).sheetValues?.Magias?.rows.slice(1)||[];
      c.powers.forEach((row,i)=>{if(sourcePowers.some(r=>JSON.stringify(r)===JSON.stringify(row)))c.powerMeta[i]??=clone(sourcePowerDetails[row[0]]||{})});
      // Only replace the legacy unsplit source paragraphs, never a user's edited background.
      if(b.background&&JSON.stringify(c.background)===JSON.stringify(source(c.id).sourceParagraphs)){changes.push({field:'background',before:clone(c.background),after:clone(b.background)});c.background=clone(b.background)}
      if(c.id==='anao'&&!c.resources.length)c.resources=[{name:'Fúria da Forja',current:'',max:3,reset:'descanso longo'},{name:'Cargas de Brasa',current:'',max:3,reset:'conforme Fúria da Forja'},{name:'Runa da Rocha',current:'',max:2,reset:'descanso curto'},{name:'Sangue de Fogo Antigo',current:'',max:1,reset:'descanso longo'},{name:'Investida de Brasa',current:'',max:1,reset:'combate'}];
      if(changes.length)c.sheetHistory.unshift({at:Date.now(),label:'Campos ausentes recuperados da ficha-fonte',changes});
      c.sheetVersion=1;
    }
  }
  function record(c,label,field,before,after){if(JSON.stringify(before)===JSON.stringify(after))return;c.sheetHistory.unshift({at:Date.now(),label,changes:[{field,before:clone(before??''),after:clone(after)}]});c.sheetHistory=c.sheetHistory.slice(0,150)}
  function field(path,label,value,edit,multiline=false){return `<label class="sheet-field"><span>${E(label)}</span>${edit?(multiline?`<textarea data-sheet-field="${path}" rows="4">${E(value)}</textarea>`:`<input data-sheet-field="${path}" value="${E(value)}">`):`<strong class="${missing(value)?'not-informed':''}">${E(missing(value)?'Não informado':value)}</strong>`}</label>`}
  function change(c,path,value){const parts=path.split('.');let at=c;for(const k of parts.slice(0,-1))at=at[k];const key=parts.at(-1);record(c,'Edição da ficha',path,at[key],value);at[key]=value;host().persist()}
  function table(c,edit){return `<div class="table-scroll"><table class="attr-table sheet-attributes"><thead><tr><th>Atributo</th><th>Valor</th><th>Mod.</th><th>Salv.</th><th>Pontos</th></tr></thead><tbody>${c.attributes.map((a,i)=>`<tr><th>${E(a.name)}</th>${['value','modifier','save','allocated'].map(k=>`<td>${edit?`<input aria-label="${E(a.name+' '+k)}" data-sheet-field="attributes.${i}.${k}" value="${E(a[k])}">`:E(missing(a[k])?'—':a[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="source-note">Valores e modificadores seguem a ficha original ou a edição do mestre. Nenhum cálculo de D&D é aplicado.</p>`}
  function rows(c,key,edit,equippedOnly=false){
    const titles=key==='skills'?(c.id==='elenya'||c.id==='calion'?['Perícia','Modificador','Observações']:['Origem','Perícia','Atributo','Função']):key==='powers'?['Nome','Tipo / uso','Efeito']:['Item','Efeito / observação'];
    const items=c[key].map((row,i)=>({row,i})).filter(({i})=>!equippedOnly||c.inventoryMeta[i]?.equipped);
    return `<div class="sheet-card-list">${items.map(({row,i})=>`<article class="sheet-entry"><div class="sheet-entry-fields">${Array.from({length:Math.max(row.length,titles.length)},(_,n)=>field(`${key}.${i}.${n}`,titles[n]||'Detalhe '+(n+1),row[n]??'',edit,n===titles.length-1&&titles.length>1)).join('')}</div>${key==='inventory'?`<label class="equipment-toggle"><input type="checkbox" data-equipped="${i}" ${c.inventoryMeta[i]?.equipped?'checked':''} ${edit?'':'disabled'}> Equipado / em uso</label>`:''}${key==='powers'?`<details><summary>Alcance, custo e duração</summary><div class="sheet-field-grid">${['range','cost','duration'].map((k,n)=>field(`powerMeta.${i}.${k}`,['Alcance','Custo','Duração'][n],c.powerMeta[i]?.[k],edit)).join('')}</div></details>`:''}${edit?`<button class="metal-btn danger-btn" data-sheet-remove="${key}.${i}">Remover</button>`:''}</article>`).join('')||'<p class="empty-state">'+(equippedOnly?'Marque os itens em uso no Inventário, em Editar ficha.':'Nenhum registro na ficha. Consulte a fonte original ou acrescente uma anotação do mestre.')+'</p>'}</div>${edit&&!equippedOnly?`<button class="metal-btn" data-sheet-add="${key}">＋ Adicionar ${key==='skills'?'perícia':key==='powers'?'poder / magia':'item'}</button>`:''}`;
  }
  function resources(c,edit){return `<section class="sheet-section"><h2>Recursos de sessão</h2><p class="source-note">O mestre registra os usos restantes. Descansos não alteram valores automaticamente.</p>${c.resources.map((r,i)=>`<article class="resource-row">${field(`resources.${i}.name`,'Recurso',r.name,edit)}${field(`resources.${i}.current`,'Restantes',r.current,true)}${field(`resources.${i}.max`,'Máximo',r.max,edit)}${field(`resources.${i}.reset`,'Recuperação',r.reset,edit)}${edit?`<button class="metal-btn" data-sheet-remove="resources.${i}" aria-label="Remover recurso">×</button>`:''}</article>`).join('')||'<p>Nenhum recurso limitado declarado.</p>'}${edit?'<button class="metal-btn" data-resource-add>＋ Recurso</button>':''}</section>`}
  function original(c){const s=source(c.id);return `<p class="source-note">${E(s.sourceFile)} · transcrição preservada, sem alterações do mestre.</p>${c.sourceDiscrepancies?.length?`<aside class="source-caution">${c.sourceDiscrepancies.map(x=>`<p>${E(x)}</p>`).join('')}</aside>`:''}<div class="source-document">${s.sourceParagraphs?.map(p=>`<p>${E(p)}</p>`).join('')||''}${s.details?`<dl>${Object.entries(s.details).map(([k,v])=>`<dt>${E(k)}</dt><dd>${E(v)}</dd>`).join('')}</dl>`:''}${Object.entries({...s.tables,...Object.fromEntries(Object.entries(s.sheetValues||{}).map(([k,v])=>[k,v.rows])),...(s.sourceAttributes?{'Atributos':s.sourceAttributes,'Perícias':s.sourceSkills}:{})}).map(([key,rows])=>`<h3>${E(key)}</h3><div class="table-scroll"><table>${rows.map(r=>`<tr>${r.filter(v=>v!==null).map(v=>`<td>${E(v)}</td>`).join('')}</tr>`).join('')}</table></div>`).join('')}</div>`}
  function combatLink(c){const battle=window.RPGV3?.currentCombat(host().getState());if(!battle||battle.status==='ended')return '';const ps=battle.participants.filter(p=>p.sourceType==='character'&&p.sourceId===c.id);return ps.length?`<section class="sheet-battle-note"><h2>Na mesa · ${E(battle.title)}</h2>${ps.map(p=>`<p>${E(p.name)}: <b>${E(p.hpCurrent)} / ${E(p.hpMax)} PV</b> · ${E((p.conditions||[]).map(x=>x.name).join(', ')||'Sem condições')} <button class="metal-btn" data-adopt-combat="${E(p.id)}">Aplicar PV à ficha</button></p>`).join('')}<small>O encontro mantém seu próprio estado e histórico. Esta ação copia apenas o PV atual escolhido para a ficha.</small></section>`:''}
  function render(c,tab){
    const edit=host().getState().app.sheetEdit===true;let content='';
    if(tab==='Visão Geral')content=`<div class="sheet-overview"><img class="sheet-portrait" src="${E(c.portrait)}" alt="${E(c.name)}"><div><p class="eyebrow">CRÔNICA DOS TRÊS DESTINOS</p><h2>${E(c.info.background||'Companheiro de aventura')}</h2><div class="sheet-field-grid">${Object.entries(infoLabels).map(([k,label])=>field('info.'+k,label,c.info[k],edit)).join('')}</div></div></div><section class="sheet-section"><h2>Ataques e características</h2>${field('attacks','Ataques',c.attacks.join('\n'),edit,true)}${field('traits','Características',c.traits.join('\n'),edit,true)}</section>${resources(c,edit)}`;
    else if(tab==='Atributos')content=table(c,edit);
    else if(tab==='Perícias')content=rows(c,'skills',edit);
    else if(tab==='Poderes / Runas / Magias')content=rows(c,'powers',edit)+resources(c,edit);
    else if(tab==='Equipamentos'||tab==='Inventário')content=rows(c,'inventory',edit,tab==='Equipamentos');
    else if(tab==='Background'||tab==='Anotações')content=field(tab==='Background'?'background':'notes',tab, c[tab==='Background'?'background':'notes'].join('\n\n'),edit,true);
    else if(tab==='Fonte original')content=original(c);
    else content=`<p class="source-note">Últimas 150 alterações. O documento original permanece intacto.</p>${c.sheetHistory.map(x=>`<details class="sheet-entry"><summary>${new Date(x.at).toLocaleString('pt-BR')} · ${E(x.label)}</summary>${x.changes.map(ch=>`<p><b>${E(ch.field)}</b><br>Antes: ${E(typeof ch.before==='object'?JSON.stringify(ch.before):ch.before)}<br>Depois: ${E(typeof ch.after==='object'?JSON.stringify(ch.after):ch.after)}</p>`).join('')}</details>`).join('')||'<p>Nenhuma edição.</p>'}`;
    return `<div class="sheet sheet-v4"><aside class="sheet-side panel"><p class="sheet-side-kicker">COMPANHIA</p>${Object.values(host().getState().characters).map(x=>`<button class="drop-item ${x.id===c.id?'active':''}" data-char="${E(x.id)}">${E(x.name)}</button>`).join('')}<hr>${tabs.map(t=>`<button class="sheet-tab ${tab===t?'active':''}" data-tab="${t}">${t}</button>`).join('')}</aside><section class="sheet-main panel"><header class="sheet-heading"><div><small>FICHA DO JOGADOR · D20 SIMPLIFICADO</small>${edit?field('name','Nome',c.name,true):`<h1 class="char-name">${E(c.name)}</h1>`}<p class="char-sub">${E(c.info.race)} · ${E(c.info.classLevel)}</p></div><button class="metal-btn" data-sheet-mode>${edit?'Concluir edição':'Editar ficha'}</button></header><div class="sheet-vitals">${['hpCurrent','hpMax','ac','initiative','movement'].map(k=>field('combat.'+k,combatLabels[k],c.combat[k],edit||k==='hpCurrent')).join('')}</div>${combatLink(c)}<div class="sheet-tab-content"><h2>${E(tab)}</h2>${content}</div><details class="sheet-secondary"><summary>Outros dados de sessão</summary><div class="sheet-field-grid">${['proficiency','inspiration','hitDice','casting'].map(k=>field('combat.'+k,combatLabels[k],c.combat[k],edit)).join('')}</div></details></section></div>`;
  }
  function bind(){const s=host()?.getState(),c=s?.characters[s.app.char];if(s?.app.view!=='character'||!c)return;
    c.powers.forEach((_,i)=>c.powerMeta[i]??={});
    document.querySelector('[data-sheet-mode]')?.addEventListener('click',()=>{s.app.sheetEdit=!s.app.sheetEdit;host().render()});
    document.querySelectorAll('[data-sheet-field]').forEach(n=>n.onchange=()=>{
      const path=n.dataset.sheetField;let v=n.value;
      if(['background','notes','traits','attacks'].includes(path))v=v.split(path==='background'||path==='notes'?/\n\n+/:/\n/);
      if(/^resources\.\d+\.(current|max)$/.test(path)&&v!==''&&(!/^\d+$/.test(v)||Number(v)>9999)){n.setCustomValidity('Use um inteiro entre 0 e 9999.');n.reportValidity();return}n.setCustomValidity('');
      change(c,path,v);
    });
    document.querySelectorAll('[data-equipped]').forEach(n=>n.onchange=()=>{const i=Number(n.dataset.equipped);c.inventoryMeta[i]??={};change(c,`inventoryMeta.${i}.equipped`,n.checked)});
    document.querySelectorAll('[data-sheet-add]').forEach(n=>n.onclick=()=>{const k=n.dataset.sheetAdd,old=clone(c[k]);c[k].push(['Novo registro','','']);record(c,'Registro adicionado',k,old,c[k]);host().persist();host().render()});
    document.querySelectorAll('[data-sheet-remove]').forEach(n=>n.onclick=async()=>{if(!await RPGUI.confirm('Remover registro?','Esta alteração ficará registrada na ficha.'))return;const[k,index]=n.dataset.sheetRemove.split('.'),old=clone(c[k]);c[k].splice(Number(index),1);if(k==='inventory')c.inventoryMeta.splice(Number(index),1);if(k==='powers')c.powerMeta.splice(Number(index),1);record(c,'Registro removido',k,old,c[k]);host().persist();host().render()});
    document.querySelector('[data-resource-add]')?.addEventListener('click',()=>{c.resources.push({name:'Novo recurso',current:'',max:'',reset:''});host().persist();host().render()});
    document.querySelectorAll('[data-adopt-combat]').forEach(n=>n.onclick=async()=>{const p=window.RPGV3.currentCombat(s)?.participants.find(p=>p.id===n.dataset.adoptCombat);if(!p)return;if(await RPGUI.confirm('Atualizar PV da ficha?',`${c.combat.hpCurrent} → ${p.hpCurrent} PV. O máximo e o histórico do encontro serão preservados.`)){change(c,'combat.hpCurrent',String(p.hpCurrent));host().render()}});
  }
  window.RPGSheets={migrate,render,bind,baseline};
})();
