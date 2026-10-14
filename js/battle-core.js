/* Núcleo V3.1.1: regras, dados auditáveis e catálogo estável da arena. */
(function (global) {
  'use strict';

  const uid = prefix => `${prefix}-${global.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const copy = value => JSON.parse(JSON.stringify(value));
  const stamp = () => Date.now();
  const numberOrNull = value => {
    const match = String(value ?? '').match(/\d+/);
    return match ? Number(match[0]) : null;
  };
  const positive = (value, fallback = null) => {
    const result = numberOrNull(value);
    return result && result > 0 ? result : fallback;
  };

  function creatureCatalog(state) {
    const official = global.RPG_MASTER_CAMPAIGN_CODEX?.creatures || [];
    const local = state?.v2?.creatures || [];
    return [...official, ...local].reduce((catalog, entry) => {
      if (entry?.id && !catalog.some(item => item.id === entry.id)) catalog.push(entry);
      return catalog;
    }, []);
  }

  function characterSource(state, id) {
    const character = state?.characters?.[id];
    if (!character) return null;
    const combat = character.combat || {};
    return {
      id, kind: 'character', name: character.name, type: [character.info?.race, character.info?.classLevel].filter(Boolean).join(' · ') || 'Personagem',
      hpMax: positive(combat.hpMax), hpCurrent: positive(combat.hpCurrent), ac: combat.ac || '', movement: combat.movement || '',
      image: character.portrait || '', attributes: character.attributes || [], attacks: character.powers || [], details: (character.background || []).join('\n')
    };
  }

  function creatureSource(state, id) {
    const creature = creatureCatalog(state).find(item => item.id === id);
    if (!creature) return null;
    return {
      id, kind: 'creature', name: creature.name, type: creature.type || 'Criatura', hpMax: positive(creature.hp ?? creature.pv),
      hpCurrent: positive(creature.hp ?? creature.pv), ac: creature.ac ?? '', movement: creature.movement || '', image: creature.image || '',
      attributes: creature.attributes || {}, attacks: creature.attack ? [creature.attack] : [], damage: creature.damage || '', special: creature.special || '', details: creature.description || ''
    };
  }

  function sourceFor(state, participant) {
    if (!participant?.sourceId) return null;
    return participant.sourceType === 'character' ? characterSource(state, participant.sourceId) : creatureSource(state, participant.sourceId);
  }

  function resolveImage(state, participant) {
    const source = sourceFor(state, participant);
    const image = participant?.image || participant?.portrait || source?.image || '';
    return { image, source, fallback: !image };
  }

  function hydrateParticipant(state, participant) {
    const source = sourceFor(state, participant);
    if (!source) return participant;
    participant.name = participant.name || source.name;
    if (!participant.type || participant.type === 'Personalizado') participant.type = source.type;
    if ((!positive(participant.hpMax) || (participant.hpMax === 1 && (source.hpMax || 0) > 1)) && source.hpMax) {
      participant.hpMax = source.hpMax;
      if (!positive(participant.hpCurrent) || participant.hpCurrent === 1) participant.hpCurrent = source.hpCurrent || source.hpMax;
    }
    if (!participant.ac || participant.ac === '—' || participant.ac === 'CA não definida') participant.ac = source.ac || 'CA não definida';
    if (!participant.movement || participant.movement === '—' || participant.movement === 'Movimento não definido') participant.movement = source.movement || 'Movimento não definido';
    if (!participant.image && source.image) participant.image = source.image;
    if ((!participant.attacks || !participant.attacks.length) && source.attacks?.length) participant.attacks = copy(source.attacks);
    if (!participant.damage && source.damage) participant.damage = source.damage;
    if (!participant.special && source.special) participant.special = source.special;
    if ((!participant.attributes || !Object.keys(participant.attributes).length) && source.attributes) participant.attributes = copy(source.attributes);
    if (!participant.details && source.details) participant.details = source.details;
    return participant;
  }

  function hydrateCombat(state, combat) {
    if (!combat) return combat;
    combat.participants?.forEach(participant => hydrateParticipant(state, participant));
    return combat;
  }

  function auditParticipants(state, participants = []) {
    const rows = participants.map(participant => {
      const resolved = resolveImage(state, participant);
      const expected = resolved.source?.image || '';
      return {
        id: participant.id, sourceId: participant.sourceId || '', name: participant.name, asset: resolved.image || 'fallback: nenhum retrato cadastrado',
        expected, ok: Boolean(resolved.image) && (!expected || resolved.image === expected), missing: !resolved.image
      };
    });
    const seen = new Map();
    rows.forEach(row => { if (row.expected) seen.set(row.expected, [...(seen.get(row.expected) || []), row]); });
    return { rows, missing: rows.filter(row => row.missing), mismatched: rows.filter(row => !row.ok), expectedDuplicateAssets: [...seen.values()].filter(group => group.length > 1) };
  }

  function ensure(state) {
    const v = global.RPGV3.ensure(state);
    v.battlePreferences ??= { effects: true, speed: 'normal', showPublicTurn: false };
    v.battleTemplates ??= []; v.battleArchives ??= [];
    v.combats.forEach(combat => ensureCombat(combat, state));
    return v;
  }

  function ensureCombat(combat, state) {
    if (!combat) return null;
    combat.battleEvents ??= []; combat.narrativeNotes ??= []; combat.visibility ??= { revealedParticipantIds: [], showTurn: false }; combat.templateId ??= null;
    if (state) hydrateCombat(state, combat);
    return combat;
  }

  function combat(state) { const v = ensure(state); return v.combats.find(item => item.id === v.activeCombatId) || null; }
  function event(combat, input = {}) {
    ensureCombat(combat);
    const entry = { id: uid('battle-event'), at: stamp(), type: input.type || 'action', actorId: input.actorId || null, targetId: input.targetId || null, label: String(input.label || ''), roll: input.roll ? copy(input.roll) : null, applied: input.applied ? copy(input.applied) : null, narrative: String(input.narrative || ''), dialogue: String(input.dialogue || ''), result: String(input.result || ''), visibility: input.visibility || 'master' };
    combat.battleEvents.push(entry); combat.updatedAt = stamp(); return entry;
  }
  function pendingRoll(combat, input = {}) { return event(combat, { ...input, type: 'roll', result: 'Pendente' }); }
  function confirmRoll(combat, id, input = {}) { ensureCombat(combat); const entry = combat.battleEvents.find(item => item.id === id); if (!entry) return null; entry.applied = { ...(entry.applied || {}), ...input, confirmed: true }; entry.result = input.result || entry.result || 'Confirmado'; entry.at = stamp(); return entry; }
  function applyHp(combat, targetId, delta, meta = {}) {
    ensureCombat(combat); const target = combat.participants.find(item => item.id === targetId); if (!target) return null;
    global.RPGV3.snapshot(combat, delta < 0 ? 'Dano confirmado' : 'Cura confirmada');
    const from = Number(target.hpCurrent) || 0; const targetMax = positive(target.hpMax, from || 1); target.hpCurrent = Math.max(0, Math.min(targetMax, from + Number(delta || 0)));
    const entry = event(combat, { type: delta < 0 ? 'damage' : 'heal', actorId: meta.actorId, targetId, label: meta.label || '', roll: meta.roll, applied: { original: meta.original ?? Math.abs(delta), manualAdjustment: meta.manualAdjustment || 0, value: Math.abs(delta), from, to: target.hpCurrent }, narrative: meta.narrative, dialogue: meta.dialogue, result: target.hpCurrent === 0 ? 'Derrotado' : 'Confirmado' });
    combat.history.unshift({ id: entry.id, type: entry.type, text: `${target.name}: ${from} → ${target.hpCurrent} PV.`, at: entry.at }); return { target, event: entry };
  }
  function narrate(combat, input = {}) { ensureCombat(combat); const note = { id: uid('narrative'), at: stamp(), actorId: input.actorId || null, targetId: input.targetId || null, action: String(input.action || ''), text: String(input.text || ''), dialogue: String(input.dialogue || ''), result: String(input.result || '') }; combat.narrativeNotes.push(note); event(combat, { type: 'narrative', actorId: note.actorId, targetId: note.targetId, label: note.action, narrative: note.text, dialogue: note.dialogue, result: note.result }); return note; }
  function saveTemplate(state, combat, name) { const v = ensure(state); const template = { id: uid('template'), name: String(name || combat.title || 'Encontro'), createdAt: stamp(), adventureId: combat.adventureId, participants: copy(combat.participants) }; v.battleTemplates.push(template); return template; }
  function duplicate(state, combat, name) { ensureCombat(combat, state); const v = ensure(state); const clone = { ...copy(combat), id: uid('combat'), title: String(name || `${combat.title} (cópia)`), status: 'setup', round: 1, turnIndex: 0, participants: copy(combat.participants).map(participant => ({ ...participant, id: uid('combatant'), hpCurrent: participant.hpMax, conditions: [] })), history: [], undo: [], battleEvents: [], narrativeNotes: [], createdAt: stamp(), updatedAt: stamp(), endedAt: null, summary: '' }; v.combats.unshift(clone); v.activeCombatId = clone.id; return clone; }
  function archive(state, combat) { ensureCombat(combat, state); const v = ensure(state); const snapshot = copy(combat); if (!v.battleArchives.some(item => item.id === combat.id)) v.battleArchives.unshift(snapshot); return snapshot; }
  function toMarkdown(state, combat) {
    ensureCombat(combat, state); const who = id => combat.participants.find(item => item.id === id)?.name || '—';
    const lines = [`# ${combat.title}`, '', `- Aventura: ${state.v2?.adventures?.find(item => item.id === combat.adventureId)?.title || '—'}`, `- Sessão: ${ensure(state).sessions.find(item => item.id === combat.sessionId)?.title || '—'}`, `- Status: ${combat.status}`, `- Rodadas: ${combat.round}`, '', '## Participantes'];
    combat.participants.forEach(participant => lines.push(`- ${participant.name}: ${participant.hpCurrent}/${participant.hpMax} PV · CA ${participant.ac || 'não definida'} · iniciativa ${participant.initiative ?? '—'}`));
    lines.push('', '## Cronologia'); combat.battleEvents.forEach(entry => lines.push(`- ${new Date(entry.at).toLocaleString('pt-BR')}: ${entry.type} · ${who(entry.actorId)} → ${who(entry.targetId)}${entry.label ? ` · ${entry.label}` : ''}${entry.narrative ? ` — ${entry.narrative}` : ''}${entry.dialogue ? ` “${entry.dialogue}”` : ''}`)); return lines.join('\n');
  }

  global.RPGBattle = { ensure, combat, event, pendingRoll, confirmRoll, applyHp, narrate, saveTemplate, duplicate, archive, toMarkdown, characterSource, creatureSource, sourceFor, resolveImage, hydrateParticipant, hydrateCombat, auditParticipants };
})(window);
