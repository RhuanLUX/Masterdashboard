/* Arena V3.1 — apresentação 2D. As regras e a auditoria vivem em battle-core.js. */
(function () {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const host = () => window.RPGMasterHost;
  const state = () => host()?.getState();
  const battle = () => window.RPGBattle;
  const combat = () => battle()?.combat(state());
  const partyPortraits = {
    elenya: 'assets/portraits/elenya-hd.png', calion: 'assets/portraits/calion-hd.png',
    nando: 'assets/portraits/nando-hd.png', anao: 'assets/portraits/anao-caolho-hd.png'
  };
  function avatar(participant) {
    const resolved = battle()?.resolveImage?.(state(), participant);
    return resolved?.image || partyPortraits[participant.sourceId] || 'assets/generated/enemies/uruk-hai.png';
  }
  const isEnemy = participant => participant.sourceType === 'creature'
    || /goblin|orc|uruk|inimigo|criatura/i.test(participant.type || '');

  function mount() {
    const current = combat(); const list = $('.combat-list');
    if (!current || !list || $('#battle-arena-shell')) return;
    battle().ensure(state());
    const root = document.createElement('section');
    root.id = 'battle-arena-shell'; root.className = 'battle-shell'; root.innerHTML = render(current);
    list.before(root); bind(root, current);
  }

  function unitCard(participant, side, focused, targeted) {
    const percent = Math.max(0, Math.min(100, (participant.hpCurrent / participant.hpMax) * 100));
    return `<button class="arena-unit ${side} ${focused ? 'focused' : ''} ${targeted ? 'selected-target' : ''}" data-arena-select="${participant.id}" title="Selecionar ${esc(participant.name)}"><img src="${esc(avatar(participant))}" alt="${esc(participant.name)}"><span>${esc(participant.name)}</span><small>${participant.hpCurrent}/${participant.hpMax} PV · CA ${esc(participant.ac || 'não definida')}</small><i style="--pv:${percent}%"></i></button>`;
  }

  function render(current) {
    const active = window.RPGV3.activeParticipant(current);
    const party = current.participants.filter(participant => !isEnemy(participant));
    const enemies = current.participants.filter(isEnemy);
    const actor = active || current.participants[0];
    const target = current.participants.find(participant => participant.id !== actor?.id && isEnemy(participant)) || enemies[0] || party[0];
    const adventure = state().v2?.adventures?.find(item => item.id === current.adventureId)?.title || '';
    const next = current.participants[(current.turnIndex + 1) % Math.max(1, current.participants.length)];
    const options = selected => current.participants.map(participant => `<option value="${participant.id}" ${participant.id === selected ? 'selected' : ''}>${esc(participant.name)}</option>`).join('');
    const effects = battle().ensure(state()).battlePreferences.effects;
    return `<header class="arena-head"><div><small>ARENA 2D · AÇÃO REPRESENTATIVA</small><strong>${esc(current.title)}</strong><span>${esc(adventure)} · Rodada ${current.round}</span></div><div class="arena-turn">Turno: <b>${esc(active?.name || '—')}</b><small>Próximo: ${esc(next?.name || '—')}</small></div></header>
      <div class="battle-layout"><div class="arena-stage" data-arena-stage><div class="arena-backdrop"></div><div class="arena-side left"><b class="arena-side-label">COMPANHIA</b>${party.slice(0, 4).map(participant => unitCard(participant, 'ally', participant.id === actor?.id, participant.id === target?.id)).join('')}</div><div class="arena-clash"><span class="arena-versus">⚔</span><span class="arena-action-state">Ação representativa</span><div class="arena-fx" data-arena-fx></div><output data-arena-result>Selecione ação e alvo.</output></div><div class="arena-side right"><b class="arena-side-label">INIMIGOS</b>${enemies.slice(0, 4).map(participant => unitCard(participant, 'foe', participant.id === actor?.id, participant.id === target?.id)).join('')}</div></div><aside class="arena-controls">
        <label>Atacante<select data-arena-actor>${options(actor?.id)}</select></label><label>Alvo<select data-arena-target>${options(target?.id)}</select></label><label>Ação<select data-arena-type><option value="melee">Corpo a corpo</option><option value="ranged">À distância</option><option value="magic">Magia</option><option value="heal">Cura</option></select></label><label>Resultado<select data-arena-outcome><option value="normal">Normal</option><option value="critical">Crítico</option><option value="fail">Falha</option></select></label>
        <div class="arena-actions"><button data-arena-roll class="fantasy-btn">⚄ Dados</button><button data-arena-d3 class="mini-btn">Dados 3D</button><button data-arena-confirm class="fantasy-btn">Confirmar ação</button><button data-arena-skip class="mini-btn">Pular efeito</button></div>
        <div class="arena-roll" data-arena-rollbox hidden><label>Dado<select data-arena-die>${[4, 6, 8, 10, 12, 20, 100].map(sides => `<option value="${sides}" ${sides === 20 ? 'selected' : ''}>d${sides}</option>`).join('')}</select></label><label>Bônus<input data-arena-bonus type="number" value="0"></label><label>Aplicado<input data-arena-applied type="number" placeholder="auto"></label><button data-arena-roll-now class="mini-btn">Rolar</button><button data-arena-roll-close class="mini-btn">Cancelar</button></div>
        <label>Dano/Cura<input data-arena-damage type="number" min="0" value="0"></label><label>Nota narrativa<textarea data-arena-note placeholder="Ação, descrição ou diálogo do mestre..."></textarea></label><button data-arena-narrate class="mini-btn">Narrar ação</button>
      </aside></div><footer class="arena-footer"><button data-arena-template class="mini-btn">Salvar modelo</button><button data-arena-duplicate class="mini-btn">Duplicar encontro</button><button data-arena-archive class="mini-btn">Arquivar</button><button data-arena-json class="mini-btn">Exportar JSON</button><button data-arena-md class="mini-btn">Exportar Markdown</button><button data-arena-present class="mini-btn">Mostrar arena</button><button data-arena-effects class="mini-btn">Efeitos: ${effects ? 'ligados' : 'desligados'}</button></footer>`;
  }

  function download(name, type, text) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([text], { type })); link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }

  function roll(sides) {
    if (sides === 100) {
      const percentile = window.RPGDiceLogic.rollPercentile();
      return { raw: percentile.value, detail: `d100: ${percentile.tensText} + ${percentile.units} = ${percentile.value}` };
    }
    const value = window.RPGDiceLogic.rollDie(sides); return { raw: value, detail: `d${sides}: ${value}` };
  }

  function effect(root, effectType, actorId, targetId, text) {
    const stage = $('[data-arena-stage]', root);
    if (!stage) return;
    $('[data-arena-result]', root).textContent = text;
    if (!battle().ensure(state()).battlePreferences.effects || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const actor = $(`[data-arena-select="${actorId}"]`, root); const target = $(`[data-arena-select="${targetId}"]`, root); const fx = $('[data-arena-fx]', root);
    stage.classList.remove('effect-melee', 'effect-ranged', 'effect-magic', 'effect-heal', 'effect-fail', 'effect-critical');
    void stage.offsetWidth; stage.classList.add(`effect-${effectType}`); actor?.classList.add('acting'); target?.classList.add('targeted');
    const spark = document.createElement('i'); spark.className = `fx-${effectType}`;
    const feedback = document.createElement('b'); feedback.className = `arena-feedback ${effectType}`; feedback.textContent = text;
    fx.append(spark, feedback);
    setTimeout(() => { stage.classList.remove(`effect-${effectType}`); actor?.classList.remove('acting'); target?.classList.remove('targeted'); spark.remove(); feedback.remove(); }, 850);
  }

  function bind(root, current) {
    const currentState = state(); const api = battle(); const save = () => host().persist(); const refresh = () => { root.remove(); mount(); };
    const syncSelection = () => {
      const actorId = $('[data-arena-actor]', root).value; const targetId = $('[data-arena-target]', root).value;
      root.querySelectorAll('[data-arena-select]').forEach(button => {
        button.classList.toggle('focused', button.dataset.arenaSelect === actorId);
        button.classList.toggle('selected-target', button.dataset.arenaSelect === targetId);
      });
      $('[data-arena-result]', root).textContent = `Atacante: ${current.participants.find(item => item.id === actorId)?.name || '—'} · Alvo: ${current.participants.find(item => item.id === targetId)?.name || '—'}`;
    };
    root.querySelectorAll('[data-arena-select]').forEach(button => button.onclick = () => {
      const participant = current.participants.find(item => item.id === button.dataset.arenaSelect);
      (isEnemy(participant) ? $('[data-arena-target]', root) : $('[data-arena-actor]', root)).value = button.dataset.arenaSelect;
      syncSelection();
    });
    $('[data-arena-actor]', root).onchange = syncSelection;
    $('[data-arena-target]', root).onchange = syncSelection;
    $('[data-arena-roll]', root).onclick = () => { $('[data-arena-rollbox]', root).hidden = false; };
    $('[data-arena-roll-close]', root).onclick = () => { $('[data-arena-rollbox]', root).hidden = true; };
    $('[data-arena-roll-now]', root).onclick = () => {
      const sides = Number($('[data-arena-die]', root).value); const bonus = Number($('[data-arena-bonus]', root).value) || 0; const result = roll(sides); const total = result.raw + bonus;
      $('[data-arena-applied]', root).value = total; $('[data-arena-result]', root).textContent = `${result.detail} ${bonus ? `${bonus > 0 ? '+' : ''}${bonus}` : ''} = ${total}`;
      const event = api.pendingRoll(current, { actorId: $('[data-arena-actor]', root).value, targetId: $('[data-arena-target]', root).value, label: $('[data-arena-type]', root).value, roll: { notation: `d${sides}`, raw: result.raw, bonus, total, detail: result.detail } });
      root.dataset.pendingEvent = event.id; save();
    };
    $('[data-arena-confirm]', root).onclick = () => {
      const actorId = $('[data-arena-actor]', root).value; const targetId = $('[data-arena-target]', root).value; const action = $('[data-arena-type]', root).value; const outcome = $('[data-arena-outcome]', root).value;
      const applied = Number($('[data-arena-applied]', root).value) || 0; const note = $('[data-arena-note]', root).value.trim(); const pending = current.battleEvents.find(item => item.id === root.dataset.pendingEvent);
      const resultText = outcome === 'critical' ? 'Crítico' : outcome === 'fail' ? 'Falha' : 'Confirmado';
      if (pending) api.confirmRoll(current, pending.id, { original: pending.roll.total, applied, manualAdjustment: applied - pending.roll.total, result: resultText });
      const amount = Number($('[data-arena-damage]', root).value) || 0;
      if (action === 'heal' && amount) api.applyHp(current, targetId, Math.abs(amount), { actorId, label: 'Cura', narrative: note, original: amount });
      else if (amount) api.applyHp(current, targetId, -Math.abs(amount), { actorId, label: 'Dano', narrative: note, original: amount });
      else api.event(current, { type: 'action', actorId, targetId, label: action, narrative: note, result: resultText });
      effect(root, outcome === 'normal' ? action : outcome, actorId, targetId, `${outcome === 'critical' ? 'Crítico!' : outcome === 'fail' ? 'Falha.' : action === 'heal' ? 'Cura confirmada' : 'Ação confirmada'}${amount ? `: ${amount}` : ''}`);
      save(); setTimeout(refresh, 900);
    };
    $('[data-arena-skip]', root).onclick = () => { $('[data-arena-result]', root).textContent = 'Efeito visual pulado.'; };
    $('[data-arena-narrate]', root).onclick = () => {
      const text = $('[data-arena-note]', root).value.trim(); if (!text) return;
      api.narrate(current, { actorId: $('[data-arena-actor]', root).value, targetId: $('[data-arena-target]', root).value, action: $('[data-arena-type]', root).value, text, dialogue: prompt('Diálogo opcional:', '') || '' });
      $('[data-arena-note]', root).value = ''; save();
    };
    $('[data-arena-d3]', root).onclick = () => host().setView('dice');
    $('[data-arena-template]', root).onclick = () => { api.saveTemplate(currentState, current, prompt('Nome do modelo:', current.title) || current.title); save(); };
    $('[data-arena-duplicate]', root).onclick = () => { api.duplicate(currentState, current, prompt('Nome da cópia:', `${current.title} (cópia)`) || undefined); save(); host().render(); };
    $('[data-arena-archive]', root).onclick = () => { api.archive(currentState, current); save(); $('[data-arena-result]', root).textContent = 'Batalha arquivada no histórico do mestre.'; };
    $('[data-arena-json]', root).onclick = () => download(`batalha-${current.id}.json`, 'application/json', JSON.stringify({ schemaVersion: 4, combat: current }, null, 2));
    $('[data-arena-md]', root).onclick = () => download(`batalha-${current.id}.md`, 'text/markdown;charset=utf-8', api.toMarkdown(currentState, current));
    $('[data-arena-effects]', root).onclick = () => { const preferences = api.ensure(currentState).battlePreferences; preferences.effects = !preferences.effects; save(); refresh(); };
    $('[data-arena-present]', root).onclick = () => presentArena(current);
  }

  function presentArena(current) {
    const visible = current.participants.filter(participant => current.visibility.revealedParticipantIds.length ? current.visibility.revealedParticipantIds.includes(participant.id) : !isEnemy(participant));
    const popup = window.open('', 'rpg-master-player-display', 'popup=yes,width=1200,height=720');
    if (!popup) { alert('Permita pop-ups para mostrar a arena.'); return; }
    popup.document.open();
    popup.document.write(`<title>Arena — Crônica dos Três Destinos</title><style>body{margin:0;background:#071320;color:#edcf8d;font:18px Georgia;display:grid;place-items:center;min-height:100vh}.a{display:flex;gap:32px;align-items:end;text-align:center}.u img{width:150px;height:190px;object-fit:contain}.u span{display:block}</style><main><h1>${esc(current.title)}</h1><div class="a">${visible.map(participant => `<div class="u"><img src="${esc(avatar(participant))}" alt="${esc(participant.name)}"><span>${esc(participant.name)}</span></div>`).join('')}</div></main>`);
    popup.document.close();
  }

  new MutationObserver(() => { if ($('.combat-list')) mount(); }).observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(mount, 300);
})();
