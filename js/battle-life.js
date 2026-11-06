/* Master-only dialogue scheduling. Memory belongs to the encounter, never the TV. */
(function(global){
  'use strict';
  const bank=global.RPGDialogueBank;
  const MIN_GAP=6000,INTERVAL_MIN=28000/3,INTERVAL_MAX=65000/3;
  const alive=p=>Number(p.hpCurrent)>0&&!global.RPGBattleCatalog?.incapacitated(p);
  function createDirector({random=Math.random,emit=()=>{},onChange=()=>{}}={}){
    const encounters=new Map();let active=null,lastText='';
    const pick=n=>Math.min(n-1,Math.floor(random()*n));
    const interval=()=>INTERVAL_MIN+random()*(INTERVAL_MAX-INTERVAL_MIN);
    function load(combat,now){
      if(!combat)return null;
      let s=encounters.get(combat.id);
      if(!s||s.source!==combat.dialogueMemory){
        const saved=combat.dialogueMemory;
        const used=saved?.version===bank.version&&saved.owner===combat.id&&Array.isArray(saved.used)
          ? saved.used.filter(x=>typeof x==='string'&&/^(hero|foe|beast):(received|attack|inspire):\d+:\d+$/.test(x)).slice(0,20000):[];
        s={source:saved,used:new Set(used),decks:new Map(),lastAt:-Infinity,nextAt:now+interval(),pending:null,lastSpeaker:'',hp:new Map()};
        encounters.set(combat.id,s);
      }
      if(active!==combat.id){s.pending=null;s.nextAt=now+interval();s.lastAt=-Infinity;s.hp=new Map(combat.participants.map(p=>[p.id,Number(p.hpCurrent)]));active=combat.id;}
      return s;
    }
    function draw(s,voice,context){
      const key=voice+':'+context;
      if(!s.decks.has(key)){
        const deck=bank.pool(voice,context).filter(e=>!s.used.has(e.key));
        for(let i=deck.length-1;i>0;i--){const j=pick(i+1);[deck[i],deck[j]]=[deck[j],deck[i]];}
        s.decks.set(key,deck);
      }
      const deck=s.decks.get(key);if(!deck.length)return null;
      if(deck.at(-1).text===lastText&&deck.length>1)[deck[0],deck[deck.length-1]]=[deck.at(-1),deck[0]];
      return deck.pop(); // Exhaustion stays silent rather than recycling a phrase.
    }
    function say(combat,s,p,context,now){
      const entry=draw(s,bank.voice(p),context);if(!entry)return false;
      s.used.add(entry.key);s.lastAt=now;s.lastSpeaker=p.id;lastText=entry.text;
      combat.dialogueMemory={version:bank.version,owner:combat.id,used:[...s.used]};s.source=combat.dialogueMemory;
      emit({id:`${combat.id}:${entry.key}`,speakerId:p.id,text:entry.text,context,tone:context==='received'?'fear':context==='attack'?'attack':'courage',at:now});
      onChange(combat);return true;
    }
    function queue(s,candidates,now,delay=850){
      if(!candidates.length||random()>=.85)return;
      const selected=candidates[pick(candidates.length)];
      s.pending={...selected,due:now+delay,expires:now+6500};
    }
    function tick(combat,now=Date.now()){
      if(!combat){active=null;return;}
      const s=load(combat,now);
      const damaged=combat.participants.filter(p=>Number(p.hpCurrent)<s.hp.get(p.id)&&alive(p));
      s.hp=new Map(combat.participants.map(p=>[p.id,Number(p.hpCurrent)]));
      if(combat.status==='ended'){s.pending=null;return;}
      if(damaged.length)queue(s,damaged.map(p=>({id:p.id,context:'received'})),now,1150);
      if(combat.status==='active'&&now>=s.nextAt&&now-s.lastAt>=MIN_GAP){
        s.nextAt=now+interval();
        const available=combat.participants.filter(alive),others=available.filter(p=>p.id!==s.lastSpeaker),choices=others.length?others:available;
        if(choices.length&&say(combat,s,choices[pick(choices.length)],'inspire',now)){s.pending=null;return;}
      }
      if(s.pending&&now>s.pending.expires)s.pending=null;
      if(s.pending&&now>=s.pending.due&&now-s.lastAt>=MIN_GAP){
        const {id,context}=s.pending,p=combat.participants.find(x=>x.id===id&&alive(x));s.pending=null;
        if(p)say(combat,s,p,context,now);
      }
    }
    function action(combat,{actorId,targetId,kind,outcome,damage=0}={},now=Date.now()){
      const s=load(combat,now);if(!s||combat.status==='ended')return;
      s.hp=new Map(combat.participants.map(p=>[p.id,Number(p.hpCurrent)]));
      if(kind==='heal'||outcome==='fail')return;
      const actor=combat.participants.find(p=>p.id===actorId&&alive(p)),target=combat.participants.find(p=>p.id===targetId&&alive(p)),candidates=[];
      if(damage>0&&target)candidates.push({id:target.id,context:'received'});
      if(actor)candidates.push({id:actor.id,context:'attack'});
      queue(s,candidates,now,kind==='magic'||kind==='ranged'?950:600);
    }
    return {tick,action};
  }
  global.RPGBattleLife={createDirector,interval:{min:INTERVAL_MIN,max:INTERVAL_MAX},minimumGap:MIN_GAP};
})(window);
