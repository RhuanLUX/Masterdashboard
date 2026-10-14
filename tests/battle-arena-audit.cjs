/* QA V3.1.1: auditoria sem navegador para binding de combatentes e assets. */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

global.window = global;
global.crypto = crypto.webcrypto;
require('../data/campaign-codex.js');
require('../js/dice-logic.js');
require('../js/v3-core.js');
require('../js/battle-core.js');

const root = path.resolve(__dirname, '..');
const exists = relative => fs.existsSync(path.join(root, relative));
const party = {
  elenya: { name: 'Elenya', portrait: 'assets/portraits/elenya-hd.png', info: { race: 'Humana', classLevel: 'Ladina' }, combat: { hpCurrent: '14', hpMax: '14', ac: '13', movement: '9 m' } },
  calion: { name: 'Calion Aranwë', portrait: 'assets/portraits/calion-hd.png', info: { race: 'Elfo', classLevel: 'Feiticeiro' }, combat: { hpCurrent: '10', hpMax: '10', ac: '13', movement: '9 m' } },
  nando: { name: 'Nando Serenata', portrait: 'assets/portraits/nando-hd.png', info: { race: 'Meio-Elfo', classLevel: 'Bardo — Nível 1' }, combat: { hpCurrent: '9', hpMax: '9', ac: '13', movement: '9 m' } },
  anao: { name: 'Anão Caolho de Hirnath', portrait: 'assets/portraits/anao-caolho-hd.png', info: { race: 'Anão', classLevel: 'Bárbaro Rúnico — Nível 4' }, combat: { hpCurrent: '52', hpMax: '52', ac: '16', movement: '7,5 m / 12m montado' } }
};
const state = { v2: { activeAdventure: 'a5', adventures: [] }, characters: party };
const combat = RPGV3.createCombat(state, { title: 'Auditoria V3.1.1' });

// Simula o binding defeituoso anterior; a hidratação precisa repará-lo pelo sourceId.
Object.keys(party).forEach(id => RPGV3.addParticipant(combat, { sourceType: 'character', sourceId: id, name: party[id].name, type: 'Personalizado', hpMax: 1, hpCurrent: 1, ac: '—', movement: '—' }));
['goblin-espadachim', 'goblin-arqueiro', 'espectro-sombras'].forEach(id => {
  const creature = RPG_MASTER_CAMPAIGN_CODEX.creatures.find(entry => entry.id === id);
  RPGV3.addParticipant(combat, { sourceType: 'creature', sourceId: id, name: creature.name, type: creature.type, hpMax: creature.hp, hpCurrent: creature.hp, ac: creature.ac, movement: creature.movement });
});
RPGBattle.ensure(state);

const audit = RPGBattle.auditParticipants(state, combat.participants);
const expected = [
  ['elenya', 14, '13', 'assets/portraits/elenya-hd.png'],
  ['calion', 10, '13', 'assets/portraits/calion-hd.png'],
  ['nando', 9, '13', 'assets/portraits/nando-hd.png'],
  ['anao', 52, '16', 'assets/portraits/anao-caolho-hd.png'],
  ['goblin-espadachim', 12, '13', 'assets/generated/codex/creatures/goblin-espadachim.jpg'],
  ['goblin-arqueiro', 9, '12', 'assets/generated/codex/creatures/goblin-arqueiro.jpg'],
  ['espectro-sombras', 38, '14', 'assets/generated/entities/espectro-das-sombras.png']
];

expected.forEach(([id, hp, ac, image]) => {
  const participant = combat.participants.find(entry => entry.sourceId === id);
  if (!participant) throw new Error(`Participante ausente: ${id}`);
  if (participant.hpMax !== hp || participant.hpCurrent !== hp) throw new Error(`PV inválido para ${id}: ${participant.hpCurrent}/${participant.hpMax}`);
  if (String(participant.ac) !== ac) throw new Error(`CA inválida para ${id}: ${participant.ac}`);
  if (participant.image !== image) throw new Error(`Imagem mapeada incorretamente para ${id}: ${participant.image}`);
  if (!exists(image)) throw new Error(`Arquivo de imagem ausente: ${image}`);
});
if (audit.missing.length || audit.mismatched.length) throw new Error('Auditoria de imagem encontrou mapeamento inválido.');
if (new Set(audit.rows.map(row => row.asset)).size !== audit.rows.length) throw new Error('Auditoria encontrou retrato repetido indevidamente.');

// Regressão V3.2: 1 PV real é dano válido e não pode ser curado pela migração.
const wounded = combat.participants.find(entry => entry.sourceId === 'anao');
wounded.hpCurrent = 1; wounded.hpMax = 52; wounded.ac = '16'; wounded.movement = '7,5 m / 12m montado';
RPGBattle.ensure(state);
if (wounded.hpCurrent !== 1) throw new Error(`Migração curou dano histórico indevidamente: ${wounded.hpCurrent}/52`);

// O renderer deve receber listas sem limite artificial de quatro participantes.
for (let index = 0; index < 13; index += 1) RPGV3.addParticipant(combat, { name: `Teste ${index + 1}`, type: 'Personalizado', hpMax: 10 });
if (combat.participants.length !== 20) throw new Error(`Participantes insuficientes para a arena: ${combat.participants.length}`);

console.log(`BATTLE_ARENA_AUDIT_PASS combatentes=${audit.rows.length} arenaCapacity=${combat.participants.length} assets=${new Set(audit.rows.map(row => row.asset)).size}`);
