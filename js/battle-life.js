/* Offline Portuguese battle dialogue. Only the master chooses lines and times. */
(function(global){
  'use strict';
  const lines={
    hero:{
      courage:['Enquanto houver esperança, ficaremos de pé!','Pela companhia! Ninguém fica para trás!','Coragem! A sombra não vencerá hoje.','Mantenham a formação. Ainda estamos juntos!','A estrada não termina aqui!','Por aqueles que esperam nosso retorno!','Respirem fundo. Podemos vencer!','Hoje seremos a luz nesta escuridão.','Eu cubro vocês. Avancem!','Não entregaremos este chão ao medo.'],
      fear:['Esse golpe foi fundo… preciso de cobertura!','Não posso cair agora… não aqui!','Minha guarda falhou! Fiquem perto!','Estou ferido, mas ainda posso lutar!','Por um instante… achei que seria o fim.','Preciso recuperar o fôlego!','Eles são mais fortes do que pareciam…','Não me deixem para trás!']
    },
    foe:{
      courage:['Vocês não passarão por nós!','Cerquem a companhia!','Suas armas não vão salvá-los!','A escuridão está do nosso lado!','Avancem! Não lhes deem descanso!','Ainda temos força para lutar!','Quebrem a formação deles!','Este lugar será a ruína de vocês!'],
      fear:['Argh! Esse golpe foi fundo!','Afastem-se! Preciso de espaço!','Eles… eles estão resistindo!','Cubram meu flanco, seus inúteis!','Não era para ser tão difícil!','Maldição! Ainda estou de pé!','Esse golpe… quase me derrubou!','Não me deixem sozinho com eles!']
    },
    beast:{
      courage:['Um rugido rompe o silêncio!','A criatura avança, ameaçadora.','Um rosnado faz o chão parecer tremer.','A fera desafia a companhia com um bramido.'],
      fear:['Um urro de dor ecoa pela arena.','A criatura recua, ferida e hesitante.','Um grito agudo denuncia seu medo.','A fera rosna, tentando esconder a dor.']
    }
  };
  function voice(p){
    if(p.sourceType==='character'||p.sourceType==='npc'||p.team==='left')return 'hero';
    const type=String(p.type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    return /dragao|drag[oõ]es|fera|besta|animal|aranha|lobo|aberracao|constructo/.test(type)?'beast':'foe';
  }
  function createDirector({random=Math.random,emit=()=>{}}={}){
    let encounter=null,nextAt=0,lastAt=-Infinity,lastSpeaker='',recent=[],hp=new Map(),pending=null,sequence=0;
    const interval=()=>28000+Math.floor(random()*37001);
    const alive=p=>Number(p.hpCurrent)>0&&!global.RPGBattleCatalog?.incapacitated(p);
    function say(p,tone,now){
      const pool=lines[voice(p)][tone],fresh=pool.filter(x=>!recent.includes(x)),choices=fresh.length?fresh:pool;
      const phrase=choices[Math.floor(random()*choices.length)];recent.push(phrase);recent=recent.slice(-8);lastSpeaker=p.id;lastAt=now;
      const line={id:`${encounter}:${++sequence}`,speakerId:p.id,text:phrase,tone,at:now};emit(line);return line;
    }
    function tick(combat,now=Date.now()){
      if(!combat){encounter=null;hp.clear();pending=null;nextAt=0;return;}
      if(encounter!==combat.id){encounter=combat.id;hp=new Map(combat.participants.map(p=>[p.id,Number(p.hpCurrent)]));nextAt=now+interval();pending=null;lastAt=-Infinity;lastSpeaker='';}
      for(const p of combat.participants){const before=hp.get(p.id),after=Number(p.hpCurrent);
        if(after<before&&alive(p)&&now-lastAt>10000&&!pending&&random()<.55)pending={id:p.id,due:now+1150};
      }
      hp=new Map(combat.participants.map(p=>[p.id,Number(p.hpCurrent)]));
      if(combat.status==='ended'){pending=null;nextAt=now+interval();return;}
      if(pending&&now>=pending.due){const p=combat.participants.find(x=>x.id===pending.id&&alive(x));pending=null;
        if(p&&now-lastAt>=10000){say(p,'fear',now);nextAt=Math.max(nextAt,now+14000);return;}}
      if(combat.status!=='active'){nextAt=now+interval();return;}
      if(now<nextAt||now-lastAt<14000)return;
      nextAt=now+interval();const available=combat.participants.filter(alive),different=available.filter(p=>p.id!==lastSpeaker),choices=different.length?different:available;
      if(choices.length)say(choices[Math.floor(random()*choices.length)],'courage',now);
    }
    return {tick};
  }
  global.RPGBattleLife={createDirector};
})(window);
