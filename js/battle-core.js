/* Núcleo V3.1: eventos de batalha independentes da arena e de animações. */
(function(global){
  'use strict';
  const uid=prefix=>`${prefix}-${global.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`}`;
  const copy=value=>JSON.parse(JSON.stringify(value));
  const stamp=()=>Date.now();
  function ensure(state){
    const v=global.RPGV3.ensure(state);
    v.battlePreferences??={effects:true,speed:'normal',showPublicTurn:false};
    v.battleTemplates??=[];v.battleArchives??=[];
    v.combats.forEach(c=>{c.battleEvents??=[];c.narrativeNotes??=[];c.visibility??={revealedParticipantIds:[],showTurn:false};c.templateId??=null});
    return v;
  }
  function ensureCombat(c){
    if(!c) return null;
    c.battleEvents??=[];c.narrativeNotes??=[];c.visibility??={revealedParticipantIds:[],showTurn:false};c.templateId??=null;
    return c;
  }
  function combat(state){const v=ensure(state);return v.combats.find(x=>x.id===v.activeCombatId)||null}
  function event(c,input={}){
    ensureCombat(c);
    const entry={id:uid('battle-event'),at:stamp(),type:input.type||'action',actorId:input.actorId||null,targetId:input.targetId||null,label:String(input.label||''),roll:input.roll?copy(input.roll):null,applied:input.applied?copy(input.applied):null,narrative:String(input.narrative||''),dialogue:String(input.dialogue||''),result:String(input.result||''),visibility:input.visibility||'master'};
    c.battleEvents.push(entry);c.updatedAt=stamp();return entry;
  }
  function pendingRoll(c,input={}){return event(c,{...input,type:'roll',result:'Pendente'})}
  function confirmRoll(c,id,input={}){ensureCombat(c);const e=c.battleEvents.find(x=>x.id===id);if(!e)return null;e.applied={...(e.applied||{}),...input,confirmed:true};e.result=input.result||e.result||'Confirmado';e.at=stamp();return e}
  function applyHp(c,targetId,delta,meta={}){
    ensureCombat(c);
    const target=c.participants.find(x=>x.id===targetId);if(!target)return null;
    global.RPGV3.snapshot(c,delta<0?'Dano confirmado':'Cura confirmada');
    const from=target.hpCurrent,targetMax=target.hpMax;target.hpCurrent=Math.max(0,Math.min(targetMax,from+Number(delta||0)));
    const e=event(c,{type:delta<0?'damage':'heal',actorId:meta.actorId,targetId,label:meta.label||'',roll:meta.roll,applied:{original:meta.original??Math.abs(delta),manualAdjustment:meta.manualAdjustment||0,value:Math.abs(delta),from,to:target.hpCurrent},narrative:meta.narrative,dialogue:meta.dialogue,result:target.hpCurrent===0?'Derrotado':'Confirmado'});
    c.history.unshift({id:e.id,type:e.type,text:`${target.name}: ${from} → ${target.hpCurrent} PV.`,at:e.at});return {target,event:e};
  }
  function narrate(c,input={}){ensureCombat(c);const n={id:uid('narrative'),at:stamp(),actorId:input.actorId||null,targetId:input.targetId||null,action:String(input.action||''),text:String(input.text||''),dialogue:String(input.dialogue||''),result:String(input.result||'')};c.narrativeNotes.push(n);event(c,{type:'narrative',actorId:n.actorId,targetId:n.targetId,label:n.action,narrative:n.text,dialogue:n.dialogue,result:n.result});return n}
  function saveTemplate(state,c,name){const v=ensure(state),template={id:uid('template'),name:String(name||c.title||'Encontro'),createdAt:stamp(),adventureId:c.adventureId,participants:copy(c.participants)};v.battleTemplates.push(template);return template}
  function duplicate(state,c,name){ensureCombat(c);const v=ensure(state),clone={...copy(c),id:uid('combat'),title:String(name||`${c.title} (cópia)`),status:'setup',round:1,turnIndex:0,participants:copy(c.participants).map(p=>({...p,id:uid('combatant'),hpCurrent:p.hpMax,conditions:[]})),history:[],undo:[],battleEvents:[],narrativeNotes:[],createdAt:stamp(),updatedAt:stamp(),endedAt:null,summary:''};v.combats.unshift(clone);v.activeCombatId=clone.id;return clone}
  function archive(state,c){ensureCombat(c);const v=ensure(state),snapshot=copy(c);if(!v.battleArchives.some(x=>x.id===c.id))v.battleArchives.unshift(snapshot);return snapshot}
  function toMarkdown(state,c){ensureCombat(c);const who=id=>c.participants.find(x=>x.id===id)?.name||'—';let lines=[`# ${c.title}`,``, `- Aventura: ${state.v2?.adventures?.find(a=>a.id===c.adventureId)?.title||'—'}`,`- Sessão: ${ensure(state).sessions.find(s=>s.id===c.sessionId)?.title||'—'}`,`- Status: ${c.status}`,`- Rodadas: ${c.round}`,``, '## Participantes'];c.participants.forEach(p=>lines.push(`- ${p.name}: ${p.hpCurrent}/${p.hpMax} PV · iniciativa ${p.initiative??'—'}`));lines.push('', '## Cronologia');c.battleEvents.forEach(e=>lines.push(`- ${new Date(e.at).toLocaleString('pt-BR')}: ${e.type} · ${who(e.actorId)} → ${who(e.targetId)}${e.label?` · ${e.label}`:''}${e.narrative?` — ${e.narrative}`:''}${e.dialogue?` “${e.dialogue}”`:''}`));return lines.join('\n')}
  global.RPGBattle={ensure,combat,event,pendingRoll,confirmRoll,applyHp,narrate,saveTemplate,duplicate,archive,toMarkdown};
})(window);
