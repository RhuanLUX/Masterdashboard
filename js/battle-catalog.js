/* V3.2.3 — identidade visual e equipes independentes. Resolver arte somente por ID. */
(function (global) {
  'use strict';
  const keyOf = p => `${p.sourceType}:${p.sourceId}`;
  const sprites = Object.freeze({
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
      ac:x.ac??'',movement:x.movement||'',image:x.image||x.url||'',attributes:x.attributes||{},attacks:x.attack?[x.attack]:[],
      damage:x.damage||'',special:x.special||'',details:[x.description,x.notes||x.note].filter(Boolean).join('\n'),origin:x.origin||'',status:x.status||''};
  }
  function roster(state) {
    const entries=[];const creatureIds=new Set([...(global.RPG_MASTER_CAMPAIGN_CODEX?.creatures||[]),...(state?.v2?.creatures||[])].map(x=>x.id));
    const add=(kind,id,group)=>{const x=source(state,kind,id);if(x)entries.push({...x,sourceType:kind,sourceId:id,key:`${kind}:${id}`,group});};
    Object.keys(state?.characters||{}).forEach(id=>add('character',id,'Companhia'));
    creatures(state).forEach(x=>add('creature',x.id,x.tags?.some(t=>['chefe','dragão'].includes(t))?'Criaturas especiais / bosses':'Criaturas e inimigos'));
    visuals(state).forEach(x=>{
      if(creatureIds.has(x.id)||x.combatEligible===false)return;
      if(x.combatEligible!==true&&(exclusions[x.id]||!categories.has(x.category)))return;
      add('visual',x.id,x.category==='Lenda'?'Lendas / encontros especiais':'NPCs e entidades');
    });
    const groups=['Companhia','Criaturas e inimigos','Criaturas especiais / bosses','NPCs e entidades','Lendas / encontros especiais'];
    return entries.sort((a,b)=>groups.indexOf(a.group)-groups.indexOf(b.group)||a.name.localeCompare(b.name,'pt-BR'));
  }
  function visualFor(participant,state) {
    const key=keyOf(participant),mapping=sprites[key];
    if(mapping)return {key,kind:'sheet',asset:mapping.asset,columns:mapping.columns||4,frame:mapping.frame??null,nativeFacing:mapping.nativeFacing||'right',frameFacings:mapping.frameFacings||null,fallback:false,reason:''};
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
