/* Shared backup contract. No migrations may replace a player's existing values. */
(function (root) {
  'use strict';
  const plain = x => x && typeof x === 'object' && !Array.isArray(x);
  function validateState(s) {
    if (!plain(s) || !plain(s.characters) || !plain(s.app)) throw Error('Estado da campanha incompleto.');
    if (Number(s.schemaVersion || 1) > 5) throw Error('Backup de uma versão mais nova do RPG Master.');
    if (s.diceHistory !== undefined && !Array.isArray(s.diceHistory)) throw Error('Histórico de dados inválido.');
    if (s.app.char !== undefined && !['elenya','calion','nando','anao'].includes(s.app.char)) throw Error('Personagem selecionado inválido.');
    if (s.app.liveWorkspace !== undefined) {
      const w = s.app.liveWorkspace;
      if (!plain(w) || (w.enabled !== undefined && typeof w.enabled !== 'boolean') || (w.adventureId !== undefined && typeof w.adventureId !== 'string')) throw Error('Mesa ao vivo inválida.');
      if (w.pins !== undefined && (!Array.isArray(w.pins) || w.pins.length > 12 || w.pins.some(p => !plain(p) || !['id','title','kind'].every(k => typeof p[k] === 'string')))) throw Error('Referências da sessão inválidas.');
      if (w.reading !== undefined && (!plain(w.reading) || Object.values(w.reading).some(i => !Number.isInteger(i) || i < 0))) throw Error('Posição de leitura inválida.');
    }
    for (const id of ['elenya', 'calion', 'nando', 'anao']) {
      const c = s.characters[id];
      if (!plain(c) || c.id !== id || typeof c.name !== 'string' || !plain(c.combat) || !plain(c.info)) throw Error('Ficha inválida: ' + id);
      for (const key of ['attributes','skills','powers','inventory','background','notes']) {
        if (!Array.isArray(c[key])) throw Error('Campo inválido na ficha: ' + key);
      }
      if (c.attributes.some(a => !plain(a) || typeof a.name !== 'string') || ['skills','powers','inventory'].some(k => c[k].some(r => !Array.isArray(r)))) throw Error('Estrutura de ficha inválida.');
      for (const k of ['resources','inventoryMeta','powerMeta','traits','attacks','sheetHistory','sourceDiscrepancies']) if (c[k] !== undefined && !Array.isArray(c[k])) throw Error('Lista da ficha inválida: '+k);
      if ((c.resources||[]).some(r=>!plain(r)||typeof r.name!=='string')) throw Error('Recurso de ficha inválido.');
    }
    for (const [section, keys] of [['v2',['adventures','lofi','importedDocuments','importedMaps','visualLibrary','creatures']],['v3',['sessions','combats','journal','quests','favorites']]]) {
      if (s[section] !== undefined && !plain(s[section])) throw Error('Seção inválida: ' + section);
      for (const key of keys) if (s[section]?.[key] !== undefined && !Array.isArray(s[section][key])) throw Error('Lista inválida: ' + key);
      for (const key of keys) if ((s[section]?.[key]||[]).some(x=>!plain(x))) throw Error('Registro inválido: '+key);
    }
    if(s.v2?.spellLibrary!==undefined){
      if(!Array.isArray(s.v2.spellLibrary))throw Error('Biblioteca de magias inválida.');
      for(const x of s.v2.spellLibrary)if(!plain(x)||!['id','name','effect','school','casting','range','duration','cost','components','note','system'].every(k=>typeof x[k]==='string')||!Number.isInteger(x.circle)||x.circle<0||x.circle>3||!Array.isArray(x.classes)||x.classes.some(k=>typeof k!=='string'))throw Error('Ficha de magia inválida.');
      if(new Set(s.v2.spellLibrary.map(x=>x.id)).size!==s.v2.spellLibrary.length)throw Error('Magias duplicadas no backup.');
    }
    if(s.v2?.ui?.compendium!==undefined){
      const c=s.v2.ui.compendium;
      if(!plain(c)||(c.favorites!==undefined&&(!Array.isArray(c.favorites)||c.favorites.some(x=>typeof x!=='string'))))throw Error('Preferências do compêndio inválidas.');
    }
    for (const a of s.v2?.adventures || []) {
      if (!plain(a) || typeof a.id !== 'string' || typeof a.title !== 'string') throw Error('Aventura inválida.');
      if (a.content && (!Array.isArray(a.content.blocks) || !Array.isArray(a.content.headings))) throw Error('Conteúdo de aventura inválido.');
      if (a.content?.blocks.some(b=>!plain(b)||typeof b.type!=='string'||(b.type==='table'&&(!Array.isArray(b.rows)||b.rows.some(r=>!Array.isArray(r)))))) throw Error('Bloco de aventura inválido.');
      if (a.original && (typeof a.original.name!=='string'||typeof a.original.data!=='string'||!a.original.data.startsWith('data:')||!a.original.data.includes(';base64,'))) throw Error('Documento original inválido.');
    }
    if (new Set((s.v2?.adventures || []).map(a => a.id)).size !== (s.v2?.adventures || []).length) throw Error('Identificadores de aventuras duplicados.');
    for (const c of s.v3?.combats || []) if (!plain(c) || !Array.isArray(c.participants) || !Array.isArray(c.history)) throw Error('Combate inválido.');
    for (const c of s.v3?.combats || []) if(c.participants.some(p=>!plain(p)||!Array.isArray(p.conditions))) throw Error('Participante inválido.');
    return s;
  }
  function validateBackup(x) {
    if (!plain(x) || ![1,2,3,4,5].includes(x.schemaVersion)) throw Error('Formato de backup não reconhecido.');
    validateState(x.state);
    if (!Array.isArray(x.images || [])) throw Error('Galeria inválida.');
    for (const im of x.images || []) if (!plain(im) || typeof im.id !== 'string' || !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=\s]+$/.test(im.data)) throw Error('Imagem de backup inválida.');
    if (new Set((x.images || []).map(i=>i.id)).size !== (x.images || []).length) throw Error('Imagens duplicadas no backup.');
    // Block prototype pollution, without changing any narrative strings.
    const walk = v => { if (!v || typeof v !== 'object') return; for (const k of Object.keys(v)) { if (['__proto__','prototype','constructor'].includes(k)) throw Error('Propriedade inválida no backup.'); walk(v[k]); } };
    walk(x); return x;
  }
  const api = {validateState, validateBackup};
  if (typeof module !== 'undefined') module.exports = api; else root.RPGData = api;
})(typeof window !== 'undefined' ? window : globalThis);
