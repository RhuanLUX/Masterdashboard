/* Arena V3.2 — controles do mestre separados do renderer Pixi local. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const host = () => window.RPGMasterHost;
  const state = () => host()?.getState();
  const api = () => window.RPGBattle;
  const current = () => api()?.combat(state());
  const enemy = p => window.RPGBattlePixi?.isEnemy(p);
  let scene, channel, managerOpen=false, actionType='melee', magicSpell='fire';
  let sceneCombatId=null,previousDefeated;
  function retainPose(){if(scene)previousDefeated=new Map([...scene.actors].map(([id,a])=>[id,a.down]));}
  const spells={fire:'Fogo',ice:'Gelo',lightning:'Eletricidade',missiles:'Mísseis mágicos'};

  function visualPayload(combat,mirror=false) {
    const catalog=window.RPGBattleCatalog;
    const picked=selection(combat);
    return { title: combat.title, round: combat.round, activeId: picked.actorId || null,targetId:picked.targetId||null,
      participants: combat.participants.filter(p => mirror||catalog.isPublic(p,combat)).map(p => ({ id: p.id, name: p.name, sourceId: p.sourceId, sourceType: p.sourceType, type: p.type,
        team:catalog.teamOf(p),facing:catalog.defaultFacing(p),incapacitated:catalog.incapacitated(p),defeated:window.RPGBattlePixi.defeated(p),arenaVisual:catalog.visualFor(p,state()) })) };
  }
  const publicPayload=combat=>visualPayload(combat);
  const mirrorPayload=combat=>visualPayload(combat,true);
  function broadcast(combat, effect, speech=null) {
    if (!('BroadcastChannel' in window)) return;
    channel ||= new BroadcastChannel('rpg-master-battle-v32');
    channel.onmessage = message => { const encounter=current(); if (message.data?.type === 'ready' && encounter) channel.postMessage({ type: 'scene', scene: publicPayload(encounter), effect: null }); };
    const payload=publicPayload(combat), visible=new Set(payload.participants.map(p=>p.id));
    const publicEffect=effect&&visible.has(effect.actorId)&&visible.has(effect.targetId)
      ? {actorId:effect.actorId,targetId:effect.targetId,kind:effect.kind,spell:Object.hasOwn(spells,effect.spell)?effect.spell:'fire',outcome:['normal','critical','fail'].includes(effect.outcome)?effect.outcome:'normal',text:{heal:'Cura',magic:'Magia',ranged:'Disparo',melee:'Ataque',critical:'Crítico',fail:'Falha'}[effect.kind]||'Ação'} : null;
    channel.postMessage({ type: 'scene', scene: payload, effect: publicEffect, speech:speech&&visible.has(speech.speakerId)?speech:null });
    // TV mirrors the master's arena: legacy reveal flags must never drop an actor or attack.
    const present=new Set(combat.participants.map(p=>p.id));
    const mirrorEffect=effect&&present.has(effect.actorId)&&present.has(effect.targetId)?{
      actorId:effect.actorId,targetId:effect.targetId,kind:effect.kind,spell:Object.hasOwn(spells,effect.spell)?effect.spell:'fire',
      outcome:['normal','critical','fail'].includes(effect.outcome)?effect.outcome:'normal',text:String(effect.text||'').slice(0,120)
    }:null;
    window.RPGCombatTV?.publish(mirrorEffect,speech);
  }
  function options(combat, chosen) { return combat.participants.map(p => `<option value="${p.id}" ${p.id === chosen ? 'selected' : ''}>${esc(p.name)}</option>`).join(''); }
  function selection(combat) {
    const turn=window.RPGV3.activeParticipant(combat)||combat.participants[0],saved=combat.arenaSelection||{},sameTurn=saved.turnId===turn?.id;
    const actor=combat.participants.find(p=>sameTurn&&p.id===saved.actorId)||turn;
    const target=combat.participants.find(p=>p.id===saved.targetId)||combat.participants.find(p=>p.id!==actor?.id&&enemy(p)!==enemy(actor))||combat.participants.find(p=>p.id!==actor?.id);
    return {actorId:actor?.id||'',targetId:target?.id||'',turnId:turn?.id||'',actionType:saved.actionType||actionType,magicSpell:saved.magicSpell||magicSpell,outcome:saved.outcome||'normal'};
  }
  function render(combat) {
    const active = window.RPGV3.activeParticipant(combat) || combat.participants[0];
    const picked=selection(combat);
    const next = combat.participants[(combat.turnIndex + 1) % Math.max(1, combat.participants.length)];
    return `<header class="arena-head"><div><small>ARENA 16-BIT · PIXIJS LOCAL</small><strong>${esc(combat.title)}</strong><span>Rodada ${combat.round} · ${combat.participants.length} participantes</span></div><div class="arena-turn">Turno: <b>${esc(active?.name || '—')}</b><small>Próximo: ${esc(next?.name || '—')}</small></div></header>
    <div class="battle-layout"><section class="arena-stage"><div data-pixi-arena class="pixi-arena-host"><p>Preparando arena 16-bit…</p></div><output data-arena-result>Selecione ação e alvo.</output></section>
    <aside class="arena-controls"><label>Atacante<select data-arena-actor>${options(combat, picked.actorId)}</select></label><label>Alvo<select data-arena-target>${options(combat, picked.targetId)}</select></label><label>Ação<select data-arena-type><option value="melee">Corpo a corpo</option><option value="ranged">À distância</option><option value="magic">Magia</option><option value="heal">Cura</option></select></label><label data-arena-spell-field hidden>Magia<select data-arena-spell><option value="fire">Fogo</option><option value="ice">Gelo</option><option value="lightning">Eletricidade</option><option value="missiles">Mísseis mágicos</option></select></label><label>Resultado<select data-arena-outcome><option value="normal">Normal</option><option value="critical">Crítico</option><option value="fail">Falha</option></select></label><div class="arena-actions"><button data-arena-roll class="fantasy-btn">⚄ Dados</button><button data-arena-d3 class="mini-btn">Mesa de Dados</button><button data-arena-confirm class="fantasy-btn">Confirmar ação</button><button data-arena-skip class="mini-btn">Pular efeito</button></div><div class="arena-roll" data-arena-rollbox hidden><label>Dado<select data-arena-die>${[4,6,8,10,12,20,100].map(n => `<option value="${n}" ${n === 20 ? 'selected' : ''}>d${n}</option>`).join('')}</select></label><label>Bônus<input data-arena-bonus type="number" value="0"></label><label>Aplicado<input data-arena-applied type="number" placeholder="auto"></label><button data-arena-roll-now class="mini-btn">Rolar</button><button data-arena-roll-close class="mini-btn">Fechar</button></div><label>Dano/Cura<input data-arena-damage type="number" min="0" value="0"></label><label>Nota narrativa<textarea data-arena-note placeholder="Ação, descrição ou diálogo do mestre..."></textarea></label><button data-arena-narrate class="mini-btn">Narrar ação</button></aside></div>
    <footer class="arena-footer"><button data-arena-details class="mini-btn">Gerenciar participantes</button><button data-arena-template class="mini-btn">Salvar modelo</button><button data-arena-duplicate class="mini-btn">Duplicar encontro</button><button data-arena-archive class="mini-btn">Arquivar</button><button data-arena-json class="mini-btn">Exportar JSON</button><button data-arena-md class="mini-btn">Exportar Markdown</button><button data-arena-present class="mini-btn">TV de combate ↗</button></footer>`;
  }
  async function mount() {
    const combat = current(), list = $('.combat-list'); if (!combat || !list || $('#battle-arena-shell')) return;
    api().ensure(state()); const root = document.createElement('section'); root.id = 'battle-arena-shell'; root.className = 'battle-shell'; root.innerHTML = render(combat); list.before(root);
    root.dataset.arenaReady='false';root.querySelectorAll('.arena-controls input,.arena-controls select,.arena-controls button,.arena-controls textarea').forEach(n=>n.disabled=true);
    const manager=document.createElement('section');manager.className='participant-manager';manager.hidden=!managerOpen;
    manager.id='arena-participant-manager';manager.innerHTML='<h2>Gerenciar participantes</h2><p>Escolha a equipe livremente. Mudar de lado não revela participantes ocultos.</p>';
    const form=$('[data-roster-form]');if(form)manager.append(form);manager.append(list);root.append(manager);
    list.hidden=false;list.classList.add('battle-details-drawer');
    $('[data-arena-details]',root).setAttribute('aria-expanded',String(managerOpen));
    $('[data-arena-details]',root).setAttribute('aria-controls',manager.id);
    try { retainPose();scene?.destroy?.(); const mounted = await window.RPGBattlePixi.mount($('[data-pixi-arena]', root), combat.participants, { actorId: $('[data-arena-actor]', root).value, targetId: $('[data-arena-target]', root).value,previousDefeated:sceneCombatId===combat.id?previousDefeated:null }); if (!root.isConnected) { mounted.destroy(); return; } scene=mounted;sceneCombatId=combat.id; } catch (error) { console.error(error); $('[data-pixi-arena]', root).innerHTML = '<p class="arena-error">A arena 16-bit não pôde ser inicializada.</p>'; }
    bind(root, combat, list);root.querySelectorAll('.arena-controls input,.arena-controls select,.arena-controls button,.arena-controls textarea').forEach(n=>n.disabled=false);root.dataset.arenaReady='true';broadcast(combat);
  }
  function roll(sides) { if (sides === 100) { const x = window.RPGDiceLogic.rollPercentile(); return { raw: x.value, detail: `d100: ${x.tensText} + ${x.units} = ${x.value}` }; } const raw = window.RPGDiceLogic.rollDie(sides); return { raw, detail: `d${sides}: ${raw}` }; }
  function download(name, type, data) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 800); }
  function bind(root, combat, list) {
    let effectHandle,refreshTimer;
    const save = () => host().persist(); const refresh = () => {
      if(!root.isConnected)return;remember();scene?.updateParticipants(combat.participants);
      for(const p of combat.participants){const row=$(`[data-participant-row="${p.id}"]`,list),hp=row&&$('.combat-hp b',row);if(hp)hp.textContent=`${p.hpCurrent}/${p.hpMax}`;}
      const history=$('.combat-history');if(history){history.replaceChildren();for(const entry of combat.history.slice(0,12)){const line=document.createElement('p');line.textContent=entry.text;history.append(line);}}
      $('[data-arena-damage]',root).value='0';$('[data-arena-applied]',root).value='';$('[data-arena-note]',root).value='';$('[data-arena-rollbox]',root).hidden=true;delete root.dataset.pendingEvent;
      $('[data-arena-confirm]',root).disabled=false;
    };
    const actionSelect=$('[data-arena-type]',root),spellSelect=$('[data-arena-spell]',root);
    const savedSelection=selection(combat);
    actionSelect.value=savedSelection.actionType;spellSelect.value=savedSelection.magicSpell;
    $('[data-arena-outcome]',root).value=savedSelection.outcome;
    function remember(){actionType=actionSelect.value;magicSpell=spellSelect.value;combat.arenaSelection={actorId:$('[data-arena-actor]',root).value,targetId:$('[data-arena-target]',root).value,turnId:window.RPGV3.activeParticipant(combat)?.id||'',actionType,magicSpell,outcome:$('[data-arena-outcome]',root).value};save();broadcast(combat)}
    const spellVisibility=()=>{$('[data-arena-spell-field]',root).hidden=actionSelect.value!=='magic';};
    actionSelect.onchange=()=>{remember();spellVisibility();};
    spellSelect.onchange=remember;$('[data-arena-outcome]',root).onchange=remember;spellVisibility();
    const actorId = () => $('[data-arena-actor]', root).value, targetId = () => $('[data-arena-target]', root).value;
    const output = text => { $('[data-arena-result]', root).textContent = text; };
    const sync = () => { remember();scene?.select(actorId(), targetId()); output(`Atacante: ${combat.participants.find(p => p.id === actorId())?.name || '—'} · Alvo: ${combat.participants.find(p => p.id === targetId())?.name || '—'}`); };
    $('[data-arena-actor]', root).onchange = sync; $('[data-arena-target]', root).onchange = sync;
    $('[data-arena-roll]', root).onclick=async()=> { $('[data-arena-rollbox]', root).hidden = false; };
    $('[data-arena-d3]', root).onclick=async()=> { $('[data-arena-rollbox]', root).hidden = false; output('Mesa de dados integrada: selecione o dado e role sem sair da Arena.'); };
    $('[data-arena-roll-close]', root).onclick=async()=> { $('[data-arena-rollbox]', root).hidden = true; };
    $('[data-arena-roll-now]', root).onclick=async()=> { const sides = Number($('[data-arena-die]', root).value), bonus = Number($('[data-arena-bonus]', root).value) || 0, result = roll(sides), total = result.raw + bonus; $('[data-arena-applied]', root).value = total; output(`${result.detail} ${bonus ? `${bonus > 0 ? '+' : ''}${bonus}` : ''} = ${total}`); const event = api().pendingRoll(combat, { actorId: actorId(), targetId: targetId(), label: $('[data-arena-type]', root).value, roll: { notation: `d${sides}`, raw: result.raw, bonus, total, detail: result.detail } }); root.dataset.pendingEvent = event.id; save(); };
    $('[data-arena-confirm]', root).onclick=async()=> { remember();const action = $('[data-arena-type]', root).value, outcome = $('[data-arena-outcome]', root).value, applied = Number($('[data-arena-applied]', root).value) || 0, amount = Number($('[data-arena-damage]', root).value) || 0, note = $('[data-arena-note]', root).value.trim(), pending = combat.battleEvents.find(x => x.id === root.dataset.pendingEvent); const label = outcome === 'critical' ? 'Crítico' : outcome === 'fail' ? 'Falha' : 'Confirmado'; if (pending) api().confirmRoll(combat, pending.id, { original: pending.roll.total, applied, manualAdjustment: applied - pending.roll.total, result: label }); if (action === 'heal' && amount) api().applyHp(combat, targetId(), Math.abs(amount), { actorId: actorId(), label: 'Cura', narrative: note }); else if (amount) api().applyHp(combat, targetId(), -Math.abs(amount), { actorId: actorId(), label: 'Dano', narrative: note }); else api().event(combat, { type: 'action', actorId: actorId(), targetId: targetId(), label: action, narrative: note, result: label }); const text = `${label}${amount ? `: ${amount}` : ''}`; output(text); const enhanced=action==='magic'||action==='ranged',kind=enhanced?action:outcome==='normal'?action:outcome;
      const impactDelay=enhanced?790:345;
      scene?.updateParticipants(combat.participants,{impactDelay});
      effectHandle=scene&&window.RPGBattlePixi.flash(scene,actorId(),targetId(),kind,text,{spell:magicSpell,outcome});
      broadcast(combat,{actorId:actorId(),targetId:targetId(),kind,spell:magicSpell,outcome,text});save();
      $('[data-arena-confirm]',root).disabled=true;
      clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,Math.max((effectHandle?.duration||650)+150,...[...scene?.actors.values()||[]].filter(a=>a.falling).map(()=>impactDelay+950))); };
    $('[data-arena-skip]', root).onclick=async()=> {effectHandle?.cancel();clearTimeout(refreshTimer);refresh();};
    $('[data-arena-narrate]', root).onclick=async()=> { const text = $('[data-arena-note]', root).value.trim(); if (!text) return; api().narrate(combat, { actorId: actorId(), targetId: targetId(), action: $('[data-arena-type]', root).value, text, dialogue: await RPGUI.prompt('Diálogo opcional:', '') || '' }); $('[data-arena-note]', root).value = ''; save(); };
    $('[data-arena-details]', root).onclick=async()=> { managerOpen=!managerOpen;$('.participant-manager',root).hidden=!managerOpen;$('[data-arena-details]',root).setAttribute('aria-expanded',String(managerOpen)); };
    root.querySelectorAll('[data-arena-transfer]').forEach(button=>button.onclick=async()=>{
      const id=button.dataset.arenaTransfer,p=combat.participants.find(x=>x.id===id),team=window.RPGBattleCatalog.teamOf(p)==='left'?'right':'left';
      if(!api().transfer(combat,id,team))return;
      scene?.updateParticipants(combat.participants);
      const row=button.closest('[data-participant-row]');$(`[data-team-rows="${team}"]`,root).append(row);
      $('[data-team-label]',row).textContent=team==='left'?'Equipe Esquerda':'Equipe Direita';
      button.textContent=team==='left'?'Mover para direita':'Mover para esquerda';
      const history=$('.combat-history');if(history){const item=document.createElement('p');item.textContent=combat.history[0].text;history.prepend(item);}
      save();broadcast(combat);output(combat.history[0].text);
    });
    $('[data-arena-template]', root).onclick=async()=> { api().saveTemplate(state(), combat, await RPGUI.prompt('Nome do modelo:', combat.title) || combat.title); save(); };
    $('[data-arena-duplicate]', root).onclick=async()=> { api().duplicate(state(), combat, await RPGUI.prompt('Nome da cópia:', `${combat.title} (cópia)`) || undefined); save(); host().render(); };
    $('[data-arena-archive]', root).onclick=async()=> { api().archive(state(), combat); save(); output('Batalha arquivada.'); };
    $('[data-arena-json]', root).onclick=async()=> download(`batalha-${combat.id}.json`, 'application/json', JSON.stringify({ schemaVersion: 5, combat }, null, 2));
    $('[data-arena-md]', root).onclick=async()=> download(`batalha-${combat.id}.md`, 'text/markdown;charset=utf-8', api().toMarkdown(state(), combat));
    $('[data-arena-present]', root).onclick=()=>window.RPGCombatTV.open();
  }
  window.RPGBattleArena={publicPayload,mirrorPayload};
  const director=window.RPGBattleLife.createDirector({emit:speech=>{const combat=current();if(!combat)return;if(scene?.container.isConnected&&sceneCombatId===combat.id)window.RPGBattlePixi.speak(scene,speech);broadcast(combat,null,speech);}});
  const chatter=setInterval(()=>director.tick(state()?current():null),500);
  addEventListener('pagehide',()=>clearInterval(chatter));
  new MutationObserver(() => { if(scene&&!scene.container.isConnected){retainPose();scene.destroy();scene=null;} if ($('.combat-list')) mount(); }).observe(document.documentElement, { childList: true, subtree: true }); setTimeout(mount, 400);
})();
