/* V3.2.3 — identidade visual e equipes independentes. Resolver arte somente por ID. */
(function (global) {
  'use strict';
  const keyOf = p => `${p.sourceType}:${p.sourceId}`;
  const sprites = Object.freeze({
    'creature:exp-berserker': { asset:'assets/pixel-sprites/v4.3/exp-berserker.png', columns:1, nativeFacing:'right' },
    'creature:exp-coracao': { asset:'assets/pixel-sprites/v4.3/exp-coracao.png', columns:1, nativeFacing:'right' },
    'creature:exp-arvore': { asset:'assets/pixel-sprites/v4.3/exp-arvore.png', columns:1, nativeFacing:'right' },
    'creature:exp-zelote': { asset:'assets/pixel-sprites/v4.3/exp-zelote.png', columns:1, nativeFacing:'right' },
    'creature:exp-mestre-armas': { asset:'assets/pixel-sprites/v4.3/exp-mestre-armas.png', columns:1, nativeFacing:'right' },
    'creature:exp-campea': { asset:'assets/pixel-sprites/v4.3/exp-campea.png', columns:1, nativeFacing:'right' },
    'creature:exp-arcano': { asset:'assets/pixel-sprites/v4.3/exp-arcano.png', columns:1, nativeFacing:'right' },
    'creature:exp-barda': { asset:'assets/pixel-sprites/v4.3/exp-barda.png', columns:1, nativeFacing:'right' },
    'creature:exp-bardo-guerra': { asset:'assets/pixel-sprites/v4.3/exp-bardo-guerra.png', columns:1, nativeFacing:'right' },
    'creature:exp-curadora': { asset:'assets/pixel-sprites/v4.3/exp-curadora.png', columns:1, nativeFacing:'right' },
    'creature:exp-luz': { asset:'assets/pixel-sprites/v4.3/exp-luz.png', columns:1, nativeFacing:'right' },
    'creature:exp-druida-terra': { asset:'assets/pixel-sprites/v4.3/exp-druida-terra.png', columns:1, nativeFacing:'right' },
    'creature:exp-druida-lua': { asset:'assets/pixel-sprites/v4.3/exp-druida-lua.png', columns:1, nativeFacing:'right' },
    'creature:exp-paladina': { asset:'assets/pixel-sprites/v4.3/exp-paladina.png', columns:1, nativeFacing:'right' },
    'creature:exp-paladino-voto': { asset:'assets/pixel-sprites/v4.3/exp-paladino-voto.png', columns:1, nativeFacing:'right' },
    'creature:exp-rastreadora': { asset:'assets/pixel-sprites/v4.3/exp-rastreadora.png', columns:1, nativeFacing:'right' },
    'creature:exp-sombras': { asset:'assets/pixel-sprites/v4.3/exp-sombras.png', columns:1, nativeFacing:'right' },
    'creature:exp-ladra': { asset:'assets/pixel-sprites/v4.3/exp-ladra.png', columns:1, nativeFacing:'right' },
    'creature:exp-assassino': { asset:'assets/pixel-sprites/v4.3/exp-assassino.png', columns:1, nativeFacing:'right' },
    'creature:exp-evocadora': { asset:'assets/pixel-sprites/v4.3/exp-evocadora.png', columns:1, nativeFacing:'right' },
    'creature:exp-abjurador': { asset:'assets/pixel-sprites/v4.3/exp-abjurador.png', columns:1, nativeFacing:'right' },
    'creature:exp-feiticeira': { asset:'assets/pixel-sprites/v4.3/exp-feiticeira.png', columns:1, nativeFacing:'right' },
    'creature:exp-bruxa': { asset:'assets/pixel-sprites/v4.3/exp-bruxa.png', columns:1, nativeFacing:'right' },
    'creature:exp-mercador': { asset:'assets/pixel-sprites/v4.3/exp-mercador.png', columns:1, nativeFacing:'right' },
    'creature:exp-morcego': { asset:'assets/pixel-sprites/v4.3/exp-morcego.png', columns:1, nativeFacing:'right' },
    'creature:exp-gato': { asset:'assets/pixel-sprites/v4.3/exp-gato.png', columns:1, nativeFacing:'right' },
    'creature:exp-sapo': { asset:'assets/pixel-sprites/v4.3/exp-sapo.png', columns:1, nativeFacing:'right' },
    'creature:exp-diabrete': { asset:'assets/pixel-sprites/v4.3/exp-diabrete.png', columns:1, nativeFacing:'right' },
    'creature:exp-mastim': { asset:'assets/pixel-sprites/v4.3/exp-mastim.png', columns:1, nativeFacing:'right' },
    'creature:exp-pseudodragao': { asset:'assets/pixel-sprites/v4.3/exp-pseudodragao.png', columns:1, nativeFacing:'right' },
    'creature:exp-quasit': { asset:'assets/pixel-sprites/v4.3/exp-quasit.png', columns:1, nativeFacing:'right' },
    'creature:exp-esfinge': { asset:'assets/pixel-sprites/v4.3/exp-esfinge.png', columns:1, nativeFacing:'right' },
    'creature:exp-fada': { asset:'assets/pixel-sprites/v4.3/exp-fada.png', columns:1, nativeFacing:'right' },
    'creature:exp-lobo': { asset:'assets/pixel-sprites/v4.3/exp-lobo.png', columns:1, nativeFacing:'right' },
    'creature:exp-construto': { asset:'assets/pixel-sprites/v4.3/exp-construto.png', columns:1, nativeFacing:'right' },
    'creature:exp-serpe': { asset:'assets/pixel-sprites/v4.3/exp-serpe.png', columns:1, nativeFacing:'right' },
    'creature:exp-infernal': { asset:'assets/pixel-sprites/v4.3/exp-infernal.png', columns:1, nativeFacing:'right' },
    'creature:exp-espectro': { asset:'assets/pixel-sprites/v4.3/exp-espectro.png', columns:1, nativeFacing:'right' },
    'creature:exp-raizes': { asset:'assets/pixel-sprites/v4.3/exp-raizes.png', columns:1, nativeFacing:'right' },
    'creature:exp-larva': { asset:'assets/pixel-sprites/v4.3/exp-larva.png', columns:1, nativeFacing:'right' },
    'creature:exp-elemental': { asset:'assets/pixel-sprites/v4.3/exp-elemental.png', columns:1, nativeFacing:'right' },
    'creature:exp-montaria': { asset:'assets/pixel-sprites/v4.3/exp-montaria.png', columns:1, nativeFacing:'right' },
    'visual:barbarvore': { asset:'assets/pixel-sprites/v3.2.3/barbarvore-base.png', columns:1, nativeFacing:'right' },
    'creature:orc-lanceiro-inverno': { asset:'assets/pixel-sprites/v3.2.3/orc-lanceiro-inverno-base.png', columns:1, nativeFacing:'right' },
    'creature:uruk-hai-capitao': { asset:'assets/pixel-sprites/v3.2.3/uruk-hai-capitao-base.png', columns:1, nativeFacing:'right' },
    'creature:vigia-hrim': { asset:'assets/pixel-sprites/v3.2.3/vigia-hrim-base.png', columns:1, nativeFacing:'right' },
    'creature:criatura-aglor': { asset:'assets/pixel-sprites/v3.2.3/criatura-aglor-base.png', columns:1, nativeFacing:'right' },
    'creature:draig-cinzas': { asset:'assets/pixel-sprites/v3.2.3/draig-cinzas-base.png', columns:1, nativeFacing:'right' },
    'creature:serpe-gelo-hrim': { asset:'assets/pixel-sprites/v3.2.3/serpe-gelo-hrim-base.png', columns:1, nativeFacing:'right' },
    'visual:aglor': { asset:'assets/pixel-sprites/v3.2.3/aglor-base.png', columns:1, nativeFacing:'right' },
    'visual:orc-inverno': { asset:'assets/pixel-sprites/v3.2.3/orc-inverno-base.png', columns:1, nativeFacing:'right' },
    'visual:alatar': { asset:'assets/pixel-sprites/v3.2.3/alatar-base.png', columns:1, nativeFacing:'right' },
    'visual:eira': { asset:'assets/pixel-sprites/v3.2.3/eira-base.png', columns:1, nativeFacing:'right' },
    'visual:maelith': { asset:'assets/pixel-sprites/v3.2.3/maelith-base.png', columns:1, nativeFacing:'right' },
    'visual:rei-edran': { asset:'assets/pixel-sprites/v3.2.3/rei-edran-base.png', columns:1, nativeFacing:'right' },
    'visual:talenir': { asset:'assets/pixel-sprites/v3.2.3/talenir-base.png', columns:1, nativeFacing:'right' },
    'visual:morgoth': { asset:'assets/pixel-sprites/v3.2.3/morgoth-base.png', columns:1, nativeFacing:'right' },
    'visual:durin-i': { asset:'assets/pixel-sprites/v3.2.3/durin-i-base.png', columns:1, nativeFacing:'right' },
    'visual:durin-iii': { asset:'assets/pixel-sprites/v3.2.3/durin-iii-base.png', columns:1, nativeFacing:'right' },
    'visual:durin-vi': { asset:'assets/pixel-sprites/v3.2.3/durin-vi-base.png', columns:1, nativeFacing:'right' },
    'visual:lethariel': { asset:'assets/pixel-sprites/v3.2.3/lethariel-base.png', columns:1, nativeFacing:'right' },
    'visual:guarda-minas-tirith': { asset:'assets/pixel-sprites/v3.2.3/guarda-minas-tirith-base.png', columns:1, nativeFacing:'right' },
    'visual:pai-elenya': { asset:'assets/pixel-sprites/v3.2.3/pai-elenya-base.png', columns:1, nativeFacing:'right' },
    'visual:harl-durn': { asset:'assets/pixel-sprites/v3.2.3/harl-durn-base.png', columns:1, nativeFacing:'right' },
    'visual:dito-afinadinho': { asset:'assets/pixel-sprites/v3.2.3/dito-afinadinho-base.png', columns:1, nativeFacing:'right' },
    'visual:pai-inverno': { asset:'assets/pixel-sprites/v3.2.3/pai-inverno-base.png', columns:1, nativeFacing:'right' },
    'character:elenya': { asset:'assets/pixel-sprites/elenya-sheet-v1.png' },
    'character:calion': { asset:'assets/pixel-sprites/calion-sheet-v1.png' },
    'character:nando': { asset:'assets/pixel-sprites/nando-sheet-v1.png' },
    'character:anao': { asset:'assets/pixel-sprites/anao-caolho-sheet-v1.png' },
    'creature:goblin-lanceiro': { asset:'assets/pixel-sprites/goblins-roster-v1.png', frame:0 },
    'creature:goblin-arqueiro': { asset:'assets/pixel-sprites/goblins-roster-v1.png', frame:1 },
    'creature:goblin-espadachim': { asset:'assets/pixel-sprites/goblins-roster-v1.png', frame:2 },
    'creature:uruk-hai-batedor': { asset:'assets/pixel-sprites/uruk-hai-sheet-v1.png', nativeFacing:'left', frameFacings:['left','right','right','left'] },
    'creature:espectro-sombras': { asset:'assets/pixel-sprites/spectro-sheet-v1.png' }
  });
  const exclusions = Object.freeze({
    'pai-elenya':'Artesão civil; sem papel de combate cadastrado.',
    'harl-durn':'Comerciante civil; sem papel de combate cadastrado.',
    'dito-afinadinho':'Reparador/viajante; sem papel de combate cadastrado.',
    'pai-inverno':'Referência atmosférica sem entidade física definida.'
  });
  // Lendas continuam disponíveis para encontros históricos, sem inventar suas fichas.
  const categories = new Set(['NPC','Aliado','Inimigo','Criatura','Entidade','Lenda']);
  const merge = (official=[], local=[]) => {
    const records=new Map();
    for(const entry of [...official,...local])if(entry?.id)records.set(entry.id,entry);
    return [...records.values()].filter(entry=>!entry.archived);
  };
  const creatures = state => merge(global.RPG_MASTER_CAMPAIGN_CODEX?.creatures,state?.v2?.creatures);
  const visuals = state => merge(global.RPG_MASTER_CAMPAIGN_CODEX?.visualEntries,state?.v2?.visualLibrary);
  const numeric = value => value===null||value===undefined||value===''?null:Number.isFinite(Number(value))?Number(value):null;
  function libraryDetails(x,state){
    const fields=[['Descrição',x.description],['Sistema',x.system],['Classe / especialização',[x.className,x.subclass].filter(Boolean).join(' · ')],['Nível / ND',x.cr!=null?'ND '+x.cr:x.level?'Nível '+x.level:''],['Ações',x.actions],['Ações bônus',x.bonusActions],['Reações',x.reactions],['Recursos',x.resources],['Conjuração',x.casting],['Salvaguardas',x.saves],['Perícias',x.skills],['Resistências',x.resistances],['Sentidos',x.senses],['Idiomas',x.languages],['Equipamentos',x.equipment],['Tática',x.tactics],['Notas do mestre',x.notes||x.note]];
    const spells=merge(global.RPG_LIBRARY_EXPANSION?.spells,state?.v2?.spellLibrary);
    for(const id of x.spellIds||[]){const s=spells.find(s=>s.id===id);if(s)fields.push([s.name,`${s.casting}; ${s.range}; ${s.duration}; ${s.cost}. ${s.effect}`]);}
    return fields.filter(([,v])=>v).map(([label,v])=>`${label}: ${v}`).join('\n\n');
  }
  function source(state, kind, id) {
    if(kind==='character'){
      const x=state?.characters?.[id];if(!x)return null;const c=x.combat||{};
      return {id,kind,name:x.name,type:[x.info?.race,x.info?.classLevel].filter(Boolean).join(' · ')||'Personagem',
        hpMax:numeric(c.hpMax),hpCurrent:numeric(c.hpCurrent),ac:c.ac??'',movement:c.movement||'',image:x.portrait||'',
        attributes:x.attributes||[],attacks:x.powers||[],details:(x.background||[]).join('\n')};
    }
    let x=(kind==='creature'?creatures(state):kind==='visual'?visuals(state):[]).find(x=>x.id===id);
    if(!x)return null;
    // Same-ID visual edits may update identity; the creature sheet remains authoritative for rules.
    if(kind==='creature'&&!state?.v2?.creatures?.some(row=>row.id===id)){
      const localVisual=state?.v2?.visualLibrary?.find(row=>row.id===id&&!row.archived);
      if(localVisual)x={...x,name:localVisual.name||x.name,image:localVisual.image||localVisual.url||x.image};
    }
    return {id,kind,name:x.name,type:x.type||x.category||'Entidade',hpMax:numeric(x.hp??x.pv),hpCurrent:numeric(x.hp??x.pv),
      ac:x.ac??'',movement:x.movement||'',image:x.image||x.url||'',attributes:x.attributes||{},attacks:x.attack?[x.attack]:[],...(x.kind?{initiativeModifier:numeric(x.initiative)??0}:{}),
      damage:x.damage||'',special:x.special||'',details:x.kind?libraryDetails(x,state):[x.description,x.notes||x.note].filter(Boolean).join('\n'),origin:x.origin||'',status:x.status||''};
  }
  function roster(state) {
    const entries=[];const creatureIds=new Set([...(global.RPG_MASTER_CAMPAIGN_CODEX?.creatures||[]),...(state?.v2?.creatures||[])].map(x=>x.id));
    const add=(kind,id,group)=>{const x=source(state,kind,id);if(x)entries.push({...x,sourceType:kind,sourceId:id,key:`${kind}:${id}`,group});};
    Object.keys(state?.characters||{}).forEach(id=>add('character',id,'Companhia'));
    creatures(state).forEach(x=>add('creature',x.id,x.kind==='npc'?'NPCs e entidades':x.tags?.some(t=>['chefe','dragão'].includes(t))?'Criaturas especiais / bosses':'Criaturas e inimigos'));
    visuals(state).forEach(x=>{
      if(creatureIds.has(x.id)||x.combatEligible===false)return;
      if(x.combatEligible!==true&&(exclusions[x.id]||!categories.has(x.category)))return;
      add('visual',x.id,x.category==='Lenda'?'Lendas / encontros especiais':'NPCs e entidades');
    });
    const groups=['Companhia','Criaturas e inimigos','Criaturas especiais / bosses','NPCs e entidades','Lendas / encontros especiais'];
    return entries.sort((a,b)=>groups.indexOf(a.group)-groups.indexOf(b.group)||a.name.localeCompare(b.name,'pt-BR'));
  }
  function visualFor(participant,state) {
    const key=keyOf(participant);
    // Same-ID records in the visual library and bestiary are the same entity.
    const alias=participant.sourceType==='visual'&&['vigia-hrim','espectro-sombras',...Object.keys(sprites).filter(k=>k.startsWith('creature:exp-')).map(k=>k.slice(9))].includes(participant.sourceId)?'creature:'+participant.sourceId:null;
    const entry=(participant.sourceType==='creature'?creatures(state):visuals(state)).find(x=>x.id===participant.sourceId);
    const inherited=entry?.miniatureKey||(!state&&participant.arenaVisual?.key===key?participant.arenaVisual.templateKey:null);
    const templateKey=sprites[key]?key:alias||inherited,mapping=sprites[templateKey];
    if(mapping)return {key,templateKey,kind:'sheet',asset:mapping.asset,columns:mapping.columns||4,frame:mapping.frame??null,nativeFacing:mapping.nativeFacing||'right',frameFacings:mapping.frameFacings||null,fallback:false,reason:''};
    // Public descriptors carry only the visual identity selected on the master side.
    const transmitted=participant.arenaVisual;
    if(!state&&transmitted?.key===key&&['portrait','missing'].includes(transmitted.kind))return {...transmitted};
    const canonical=source(state,participant.sourceType,participant.sourceId);
    let asset=canonical?.image||participant.image||participant.portrait||'';
    let reason='Sprite próprio não cadastrado; retrato da própria entidade (R).';
    // A historical library entry mistakenly reused the Uruk portrait for a winter Orc.
    if(key==='visual:orc-inverno'&&asset==='assets/generated/enemies/uruk-hai.png'){
      asset='';reason='Retrato antigo pertence ao Uruk-hai; arte própria do Orc de Inverno não cadastrada.';
    }
    if(asset==='assets/fangorn_atmosphere_crop.jpg'||(asset==='assets/generated/creatures/vigia-de-hrim.png'&&!['creature:vigia-hrim','visual:vigia-hrim'].includes(key))){
      asset='';reason='Imagem padrão do cadastro, não arte própria desta entidade; marcador neutro (?).';
    }
    if(asset&&!canonical)reason='Cadastro de origem indisponível; retrato do participante salvo no encontro (R).';
    return {key,kind:asset?'portrait':'missing',asset,columns:1,frame:null,fallback:true,
      reason:asset?reason:reason==='Sprite próprio não cadastrado; retrato da própria entidade (R).'?'Arte própria não cadastrada; marcador neutro (?) com a identidade da entidade.':reason};
  }
  // Never infer team, identity or sprite from partial display names or arbitrary array order.
  // Team is operational, origin is identity, visibility is a separate decision.
  const teamOf = p => ['left','right'].includes(p?.team) ? p.team : p?.sourceType==='character'?'left':'right';
  const defaultFacing = p => teamOf(p)==='left'?'right':'left';
  const isEnemy = p => teamOf(p)==='right';
  const isPublic = (p,combat) => combat.visibility?.hiddenParticipantIds?.includes(p.id)?false:
    combat.visibility?.revealedParticipantIds?.includes(p.id)?true:p.sourceType==='character';
  const incapacitated = p => p.incapacitated===true || (p.hpCurrent!=null && Number(p.hpCurrent)===0) ||
    (p.conditions||[]).some(c=>/incapacitado|inconsciente/i.test(c.name||c));
  global.RPGBattleCatalog={keyOf,sprites,exclusions,merge,creatures,visuals,source,roster,visualFor,isEnemy,teamOf,defaultFacing,isPublic,incapacitated};
})(window);
