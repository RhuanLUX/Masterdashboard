/* Arena V3.2 — controles do mestre separados do renderer Pixi local. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&gt;', '>': '&quot;', '"': '&quot;', "'": '&#39;' }[c]));
  const host = () => window.RPGMasterHost;
  const state = () => host()?.getState();
  const api = () => window.RPGBattle;
  const current = () => api()?.combat(state());
  const enemy = p => window.RPGBattlePixi?.isEnemy(p);
  let scene, channel;

  function publicPayload(combat) {
    const revealed = combat.visibility?.revealedParticipantIds || [];
    return { title: combat.title, round: combat.round, activeId: window.RPGV3.activeParticipant(combat)?.id || null,
      participants: combat.participants.filter(p => !enemy(p) || revealed.includes(p.id)).map(p => ({ id: p.id, name: p.name, sourceId: p.sourceId, sourceType: p.sourceType, type: p.type })) };
  }
  function broadcast(combat, effect) {
    if (!('BroadcastChannel' in window)) return;
    channel ||= new BroadcastChannel('rpg-master-battle-v32');
    channel.onmessage = message => { if (message.data?.type === 'ready') channel.postMessage({ type: 'scene', scene: publicPayload(current()), effect: null }); };
    channel.postMessage({ type: 'scene', scene: publicPayload(combat), effect });
  }
  function options(combat, chosen) { return combat.participants.map(p => `<option value="${p.id}" ${p.id === chosen ? 'selected' : ''}>${esc(p.name)}</option>`).join(''); }
  function render(combat) {
    const active = window.RPGV3.activeParticipant(combat) || combat.participants[0];
    const target = combat.participants.find(p => p.id !== active?.id && enemy(p)) || combat.participants.find(p => p.id !== active?.id);
    const next = combat.participants[(combat.turnIndex + 1) % Math.max(1, combat.participants.length)];
    return `<header class="arena-head"><div><small>ARENA 16-BIT · PIXIJS LOCAL</small><strong>${esc(combat.title)}</strong><span>Rodada ${combat.round} · ${combat.participants.length} participantes</span></div><div class="arena-turn">Turno: <b>${esc(active?.name || '—')}</b><small>Próximo: ${esc(next?.name || '—')}</small></div></header>
    <div class="battle-layout"><section class="arena-stage"><div data-pixi-arena class="pixi-arena-host"><p>Preparando arena 16-bit…</p></div><output data-arena-result>Selecione ação e alvo.</output></section>
    <aside class="arena-controls"><label>Atacante<select data-arena-actor>${options(combat, active?.id)}</select></label><label>Alvo<select data-arena-target>${options(combat, target?.id)}</select></label><label>Ação<select data-arena-type><option value="melee">Corpo a corpo</option><option value="ranged">À distância</option><option value="magic">Magia</option><option value="heal">Cura</option></select></label><label>Resultado<select data-arena-outcome><option value="normal">Normal</option><option value="critical">Crítico</option><option value="fail">Falha</option></select></label><div class="arena-actions"><button data-arena-roll class="fantasy-btn">⚄ Dados</button><button data-arena-d3 class="mini-btn">Mesa de Dados</button><button data-arena-confirm class="fantasy-btn">Confirmar ação</button><button data-arena-skip class="mini-btn">Pular efeito</button></div><div class="arena-roll" data-arena-rollbox hidden><label>Dado<select data-arena-die>${[4,6,8,10,12,20,100].map(n => `<option value="${n}" ${n === 20 ? 'selected' : ''}>d${n}</option>`).join('')}</select></label><label>Bônus<input data-arena-bonus type="number" value="0"></label><label>Aplicado<input data-arena-applied type="number" placeholder="auto"></label><button data-arena-roll-now class="mini-btn">Rolar</button><button data-arena-roll-close class="mini-btn">Fechar</button></div><label>Dano/Cura<input data-arena-damage type="number" min="0" value="0"></label><label>Nota narrativa<textarea data-arena-note placeholder="Ação, descrição ou diálogo do mestre..."></textarea></label><button data-arena-narrate class="mini-btn">Narrar ação</button></aside></div>
    <footer class="arena-footer"><button data-arena-details class="mini-btn">Gerenciar participantes</button><button data-arena-reveal class="mini-btn">Revelar / ocultar inimigo</button><button data-arena-template class="mini-btn">Salvar modelo</button><button data-arena-duplicate class="mini-btn">Duplicar encontro</button><button data-arena-archive class="mini-btn">Arquivar</button><button data-arena-json class="mini-btn">Exportar JSON</button><button data-arena-md class="mini-btn">Exportar Markdown</button><button data-arena-present class="mini-btn">Mostrar arena</button></footer>`;
  }
  async function mount() {
    const combat = current(), list = $('.combat-list'); if (!combat || !list || $('#battle-arena-shell')) return;
    api().ensure(state()); const root = document.createElement('section'); root.id = 'battle-arena-shell'; root.className = 'battle-shell'; root.innerHTML = render(combat); list.before(root);
    list.hidden = true; list.classList.add('battle-details-drawer');
    try { scene?.destroy?.(); scene = await window.RPGBattlePixi.mount($('[data-pixi-arena]', root), combat.participants); } catch (error) { console.error(error); $('[data-pixi-arena]', root).innerHTML = '<p class="arena-error">A arena 16-bit não pôde ser inicializada.</p>'; }
    bind(root, combat, list); broadcast(combat);
  }
  function roll(sides) { if (sides === 100) { const x = window.RPGDiceLogic.rollPercentile(); return { raw: x.value, detail: `d100: ${x.tensText} + ${x.units} = ${x.value}` }; } const raw = window.RPGDiceLogic.rollDie(sides); return { raw, detail: `d${sides}: ${raw}` }; }
  function download(name, type, data) { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 800); }
  function bind(root, combat, list) {
    const save = () => host().persist(); const refresh = () => { scene?.destroy?.(); root.remove(); mount(); };
    const actorId = () => $('[data-arena-actor]', root).value, targetId = () => $('[data-arena-target]', root).value;
    const output = text => { $('[data-arena-result]', root).textContent = text; };
    const sync = () => output(`Atacante: ${combat.participants.find(p => p.id === actorId())?.name || '—'} · Alvo: ${combat.participants.find(p => p.id === targetId())?.name || '—'}`);
    $('[data-arena-actor]', root).onchange = sync; $('[data-arena-target]', root).onchange = sync;
    $('[data-arena-roll]', root).onclick = () => { $('[data-arena-rollbox]', root).hidden = false; };
    $('[data-arena-d3]', root).onclick = () => { $('[data-arena-rollbox]', root).hidden = false; output('Mesa de dados integrada: selecione o dado e role sem sair da Arena.'); };
    $('[data-arena-roll-close]', root).onclick = () => { $('[data-arena-rollbox]', root).hidden = true; };
    $('[data-arena-roll-now]', root).onclick = () => { const sides = Number($('[data-arena-die]', root).value), bonus = Number($('[data-arena-bonus]', root).value) || 0, result = roll(sides), total = result.raw + bonus; $('[data-arena-applied]', root).value = total; output(`${result.detail} ${bonus ? `${bonus > 0 ? '+' : ''}${bonus}` : ''} = ${total}`); const event = api().pendingRoll(combat, { actorId: actorId(), targetId: targetId(), label: $('[data-arena-type]', root).value, roll: { notation: `d${sides}`, raw: result.raw, bonus, total, detail: result.detail } }); root.dataset.pendingEvent = event.id; save(); };
    $('[data-arena-confirm]', root).onclick = () => { const action = $('[data-arena-type]', root).value, outcome = $('[data-arena-outcome]', root).value, applied = Number($('[data-arena-applied]', root).value) || 0, amount = Number($('[data-arena-damage]', root).value) || 0, note = $('[data-arena-note]', root).value.trim(), pending = combat.battleEvents.find(x => x.id === root.dataset.pendingEvent); const label = outcome === 'critical' ? 'Crítico' : outcome === 'fail' ? 'Falha' : 'Confirmado'; if (pending) api().confirmRoll(combat, pending.id, { original: pending.roll.total, applied, manualAdjustment: applied - pending.roll.total, result: label }); if (action === 'heal' && amount) api().applyHp(combat, targetId(), Math.abs(amount), { actorId: actorId(), label: 'Cura', narrative: note }); else if (amount) api().applyHp(combat, targetId(), -Math.abs(amount), { actorId: actorId(), label: 'Dano', narrative: note }); else api().event(combat, { type: 'action', actorId: actorId(), targetId: targetId(), label: action, narrative: note, result: label }); const text = `${label}${amount ? `: ${amount}` : ''}`; output(text); scene && window.RPGBattlePixi.flash(scene, actorId(), targetId(), outcome === 'normal' ? action : outcome, text); broadcast(combat, { actorId: actorId(), targetId: targetId(), kind: action, text }); save(); setTimeout(refresh, 850); };
    $('[data-arena-skip]', root).onclick = () => output('Efeito visual pulado.');
    $('[data-arena-narrate]', root).onclick = () => { const text = $('[data-arena-note]', root).value.trim(); if (!text) return; api().narrate(combat, { actorId: actorId(), targetId: targetId(), action: $('[data-arena-type]', root).value, text, dialogue: prompt('Diálogo opcional:', '') || '' }); $('[data-arena-note]', root).value = ''; save(); };
    $('[data-arena-details]', root).onclick = () => { list.hidden = !list.hidden; };
    $('[data-arena-reveal]', root).onclick = () => { const p = combat.participants.find(x => x.id === targetId()); if (!p || !enemy(p)) return output('Selecione um inimigo como alvo para controlar a revelação.'); const ids = combat.visibility.revealedParticipantIds ||= []; const index = ids.indexOf(p.id); index < 0 ? ids.push(p.id) : ids.splice(index, 1); save(); broadcast(combat); output(`${p.name}: ${index < 0 ? 'revelado' : 'ocultado'} para os jogadores.`); };
    $('[data-arena-template]', root).onclick = () => { api().saveTemplate(state(), combat, prompt('Nome do modelo:', combat.title) || combat.title); save(); };
    $('[data-arena-duplicate]', root).onclick = () => { api().duplicate(state(), combat, prompt('Nome da cópia:', `${combat.title} (cópia)`) || undefined); save(); host().render(); };
    $('[data-arena-archive]', root).onclick = () => { api().archive(state(), combat); save(); output('Batalha arquivada.'); };
    $('[data-arena-json]', root).onclick = () => download(`batalha-${combat.id}.json`, 'application/json', JSON.stringify({ schemaVersion: 5, combat }, null, 2));
    $('[data-arena-md]', root).onclick = () => download(`batalha-${combat.id}.md`, 'text/markdown;charset=utf-8', api().toMarkdown(state(), combat));
    $('[data-arena-present]', root).onclick = () => { const win = window.open('battle-display.html', 'rpg-master-player-display', 'popup=yes,width=1200,height=720'); if (!win) return alert('Permita pop-ups para mostrar a arena.'); setTimeout(() => broadcast(combat), 300); setTimeout(() => broadcast(combat), 1000); };
  }
  new MutationObserver(() => { if ($('.combat-list')) mount(); }).observe(document.documentElement, { childList: true, subtree: true }); setTimeout(mount, 400);
})();
