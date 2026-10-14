/* RPG Master V3 — regras locais de sessão, combate, diário, missões e favoritos. */
(function(global){
  'use strict';
  const now=()=>Date.now();
  const clone=value=>JSON.parse(JSON.stringify(value));
  const uid=prefix=>`${prefix}-${global.crypto?.randomUUID?.()||`${now()}-${Math.random().toString(16).slice(2)}`}`;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,Number(value)||0));

  function ensure(state){
    state.schemaVersion=Math.max(Number(state.schemaVersion)||0,4);
    state.v3=state.v3||{};
    const v=state.v3;
    v.sessions??=[];v.activeSessionId??=null;v.combats??=[];v.activeCombatId??=null;
    v.journal??=[];v.quests??=[];v.favorites??=[];
    v.presentation??={mode:'hidden',content:null,updatedAt:null};
    return v;
  }
  function currentSession(state){let v=ensure(state);return v.sessions.find(x=>x.id===v.activeSessionId)||null}
  function currentCombat(state){let v=ensure(state);return v.combats.find(x=>x.id===v.activeCombatId)||null}
  function createSession(state,input={}){
    const v=ensure(state),session={id:uid('session'),adventureId:input.adventureId||state.v2?.activeAdventure||null,title:String(input.title||'Sessão sem título').trim()||'Sessão sem título',date:input.date||new Date().toISOString().slice(0,10),status:'planned',notes:String(input.notes||''),createdAt:now(),updatedAt:now()};
    v.sessions.unshift(session);return session;
  }
  function startSession(state,id){const v=ensure(state),session=v.sessions.find(x=>x.id===id);if(!session)return null;v.sessions.forEach(x=>{if(x.status==='in-progress'&&x.id!==id)x.status='planned'});session.status='in-progress';session.updatedAt=now();v.activeSessionId=id;return session}
  function endSession(state,id,notes){const v=ensure(state),session=v.sessions.find(x=>x.id===id);if(!session)return null;session.status='ended';if(notes!==undefined)session.notes=String(notes);session.updatedAt=now();if(v.activeSessionId===id)v.activeSessionId=null;return session}
  function createCombat(state,input={}){
    const v=ensure(state),combat={id:uid('combat'),sessionId:input.sessionId||v.activeSessionId||null,adventureId:input.adventureId||state.v2?.activeAdventure||null,title:String(input.title||'Combate sem título'),status:'setup',round:1,turnIndex:0,participants:[],undo:[],history:[],createdAt:now(),updatedAt:now(),endedAt:null,summary:''};
    v.combats.unshift(combat);v.activeCombatId=combat.id;return combat;
  }
  function snapshot(combat,label){combat.undo.push({label,state:clone({round:combat.round,turnIndex:combat.turnIndex,status:combat.status,participants:combat.participants,history:combat.history,summary:combat.summary,endedAt:combat.endedAt})});if(combat.undo.length>30)combat.undo.shift()}
  function note(combat,type,text){combat.history.unshift({id:uid('combat-log'),type,text,at:now()});if(combat.history.length>60)combat.history.pop();combat.updatedAt=now()}
  function normalizeParticipant(input={}){return {id:uid('combatant'),sourceType:input.sourceType||'custom',sourceId:input.sourceId||null,name:String(input.name||'Participante').trim()||'Participante',type:input.type||'Personalizado',hpMax:Math.max(1,Number(input.hpMax)||1),hpCurrent:Math.max(0,Number(input.hpCurrent??input.hpMax)||1),ac:String(input.ac??'CA não definida'),movement:String(input.movement??'Movimento não definido'),initiative:Number.isFinite(Number(input.initiative))?Number(input.initiative):null,initiativeModifier:Number(input.initiativeModifier)||0,attributes:input.attributes||[],attacks:input.attacks||[],damage:input.damage||'',ability:input.ability||input.special||'',image:input.image||input.portrait||'',conditions:Array.isArray(input.conditions)?input.conditions:[],details:input.details||''}}
  function addParticipant(combat,input){snapshot(combat,'Participante adicionado');const entry=normalizeParticipant(input);combat.participants.push(entry);note(combat,'participant',`${entry.name} entrou no combate.`);return entry}
  function removeParticipant(combat,id){const entry=combat.participants.find(x=>x.id===id);if(!entry)return null;snapshot(combat,'Participante removido');combat.participants=combat.participants.filter(x=>x.id!==id);combat.turnIndex=Math.min(combat.turnIndex,Math.max(0,combat.participants.length-1));note(combat,'participant',`${entry.name} saiu do combate.`);return entry}
  function sortParticipants(combat){snapshot(combat,'Iniciativa reordenada');combat.participants=combat.participants.map((x,index)=>({...x,_order:index})).sort((a,b)=>(Number(b.initiative??-Infinity)-Number(a.initiative??-Infinity))||(a._order-b._order)).map(({_order,...x})=>x);combat.turnIndex=0;note(combat,'initiative','Ordem de iniciativa atualizada.')}
  function beginCombat(combat){if(!combat.participants.length)return false;snapshot(combat,'Combate iniciado');combat.status='active';combat.round=Math.max(1,combat.round||1);combat.turnIndex=Math.min(Math.max(0,combat.turnIndex||0),combat.participants.length-1);note(combat,'combat','Combate iniciado.');return true}
  function activeParticipant(combat){return combat?.participants?.[combat.turnIndex]||null}
  function nextTurn(combat){if(!combat?.participants?.length)return null;snapshot(combat,'Próximo turno');if(combat.turnIndex>=combat.participants.length-1){combat.turnIndex=0;combat.round+=1;note(combat,'turn',`Rodada ${combat.round} iniciada.`)}else{combat.turnIndex+=1;note(combat,'turn',`Turno de ${activeParticipant(combat).name}.`)}return activeParticipant(combat)}
  function previousTurn(combat){if(!combat?.participants?.length)return null;snapshot(combat,'Turno anterior');if(combat.turnIndex<=0){combat.turnIndex=combat.participants.length-1;combat.round=Math.max(1,combat.round-1)}else combat.turnIndex-=1;note(combat,'turn',`Retorno ao turno de ${activeParticipant(combat).name}.`);return activeParticipant(combat)}
  function adjustHp(combat,id,delta){const entry=combat.participants.find(x=>x.id===id);if(!entry)return null;snapshot(combat,delta<0?'Dano aplicado':'Cura aplicada');const before=entry.hpCurrent;entry.hpCurrent=clamp(before+Number(delta||0),0,entry.hpMax);note(combat,'hp',`${entry.name}: ${before} → ${entry.hpCurrent} PV.`);return entry}
  function setHp(combat,id,value){const entry=combat.participants.find(x=>x.id===id);if(!entry)return null;snapshot(combat,'PV ajustado');const before=entry.hpCurrent;entry.hpCurrent=clamp(value,0,entry.hpMax);note(combat,'hp',`${entry.name}: ${before} → ${entry.hpCurrent} PV.`);return entry}
  function addCondition(combat,id,name,duration=''){const entry=combat.participants.find(x=>x.id===id),label=String(name||'').trim();if(!entry||!label)return null;snapshot(combat,'Condição adicionada');const condition={id:uid('condition'),name:label,duration:String(duration||'').trim()};entry.conditions.push(condition);note(combat,'condition',`${entry.name}: ${label}.`);return condition}
  function removeCondition(combat,id,conditionId){const entry=combat.participants.find(x=>x.id===id),condition=entry?.conditions.find(x=>x.id===conditionId);if(!condition)return null;snapshot(combat,'Condição removida');entry.conditions=entry.conditions.filter(x=>x.id!==conditionId);note(combat,'condition',`${entry.name}: ${condition.name} removido.`);return condition}
  function undo(combat){const previous=combat?.undo?.pop();if(!previous)return false;Object.assign(combat,clone(previous.state));combat.updatedAt=now();return previous.label}
  function endCombat(combat,summary=''){snapshot(combat,'Combate encerrado');combat.status='ended';combat.summary=String(summary||'');combat.endedAt=now();note(combat,'combat','Combate encerrado pelo mestre.');return combat}
  function rollInitiative(entry){const roll=global.RPGDiceLogic?.rollDie?global.RPGDiceLogic.rollDie(20):Math.floor(Math.random()*20)+1;entry.initiative=roll+(Number(entry.initiativeModifier)||0);return {roll,total:entry.initiative}}
  function journalEntry(state,input={}){const v=ensure(state),entry={id:input.id||uid('journal'),date:input.date||new Date().toISOString().slice(0,10),sessionId:input.sessionId||v.activeSessionId||null,adventureId:input.adventureId||state.v2?.activeAdventure||null,title:String(input.title||'Registro sem título').trim()||'Registro sem título',description:String(input.description||''),category:input.category||'Nota do mestre',importance:input.importance||'Normal',visibility:input.visibility||'private',createdAt:input.createdAt||now(),updatedAt:now()};const index=v.journal.findIndex(x=>x.id===entry.id);if(index>=0)v.journal[index]={...v.journal[index],...entry};else v.journal.unshift(entry);return entry}
  function removeJournal(state,id){const v=ensure(state),entry=v.journal.find(x=>x.id===id);v.journal=v.journal.filter(x=>x.id!==id);return entry||null}
  function questEntry(state,input={}){const v=ensure(state),entry={id:input.id||uid('quest'),name:String(input.name||'Missão sem nome').trim()||'Missão sem nome',description:String(input.description||''),adventureId:input.adventureId||state.v2?.activeAdventure||null,status:input.status||'Não iniciada',notes:String(input.notes||''),objectives:Array.isArray(input.objectives)?input.objectives.filter(Boolean):[],links:Array.isArray(input.links)?input.links:[],suggested:Boolean(input.suggested),createdAt:input.createdAt||now(),updatedAt:now()};const index=v.quests.findIndex(x=>x.id===entry.id);if(index>=0)v.quests[index]={...v.quests[index],...entry};else v.quests.unshift(entry);return entry}
  function removeQuest(state,id){const v=ensure(state),entry=v.quests.find(x=>x.id===id);v.quests=v.quests.filter(x=>x.id!==id);return entry||null}
  function addFavorite(state,input){const v=ensure(state);if(v.favorites.some(x=>x.type===input.type&&x.targetId===input.targetId))return {ok:false,reason:'duplicate'};if(v.favorites.length>=10)return {ok:false,reason:'limit'};const favorite={id:uid('favorite'),type:input.type,targetId:input.targetId,label:String(input.label||'Favorito'),createdAt:now()};v.favorites.push(favorite);return {ok:true,favorite}}
  function removeFavorite(state,id){const v=ensure(state),item=v.favorites.find(x=>x.id===id);v.favorites=v.favorites.filter(x=>x.id!==id);return item||null}
  function reorderFavorite(state,id,direction){const list=ensure(state).favorites,index=list.findIndex(x=>x.id===id),target=index+Number(direction);if(index<0||target<0||target>=list.length)return false;[list[index],list[target]]=[list[target],list[index]];return true}
  global.RPGV3={ensure,currentSession,currentCombat,createSession,startSession,endSession,createCombat,snapshot,addParticipant,removeParticipant,sortParticipants,beginCombat,activeParticipant,nextTurn,previousTurn,adjustHp,setHp,addCondition,removeCondition,undo,endCombat,rollInitiative,journalEntry,removeJournal,questEntry,removeQuest,addFavorite,removeFavorite,reorderFavorite,uid,clone};
})(window);
