/* Authored Portuguese dialogue fragments. All combinations are local and contextual. */
(function(global){
  'use strict';
  const list=s=>s.trim().split('\n').map(x=>x.trim()).filter(Boolean);
  const openings={
    hero:list(`Companheiros!
      Pela companhia!
      Escutem!
      Fiquem atentos!
      Mantenham a guarda!
      Ainda estou aqui!
      Olhos abertos!
      Com firmeza!
      Guardem suas forças!
      Sem perder o passo!
      Lembrem-se de casa!
      Com coragem!
      Fiquem por perto!
      Respirem fundo!
      Não se dispersem!
      Pelo nosso juramento!
      Segurem a formação!
      Aqui, ao meu lado!
      Uma coisa de cada vez!
      Atenção ao flanco!
      Pela nossa estrada!
      Conservem a calma!
      Não baixem os olhos!
      Estamos juntos!
      Não recuem sozinhos!
      Mais um esforço!
      Fiquem comigo!
      Sob este céu!
      Por quem nos espera!
      Escutem minha voz!
      Não cedam ao medo!
      Por nossos amigos!`),
    foe:list(`Grr!
      Escutem bem!
      Atenção!
      Maldição!
      Olhem para mim!
      Sem descanso!
      Ainda não acabou!
      Fiquem alertas!
      Eu avisei!
      Não se distraiam!
      Mais perto!
      Abram os olhos!
      Guardem meu flanco!
      Sem piedade!
      Agora escutem!
      Pelo nosso bando!
      Não parem!
      Cuidado aí!
      Vejam só!
      Mexam-se!
      Que noite maldita!
      Gritem mais alto!
      Não me ignorem!
      Olhem bem!
      Reúnam o bando!
      Com toda a força!
      Não percam terreno!
      Ouçam meu aviso!
      Por estas terras!
      Fechem as fileiras!
      Mostrem os dentes!
      Não se afastem!`),
    beast:list(`Entre as sombras,
      Sob o céu escuro,
      Por um breve instante,
      No meio da luta,
      Diante da companhia,
      Em meio aos golpes,
      Com um som profundo,
      Junto ao chão marcado,
      Entre passos apressados,
      Sob os olhares atentos,
      Durante o confronto,
      Contra o silêncio distante,
      Entre ecos da batalha,
      Na penumbra da arena,
      Entre os combatentes,
      Com um movimento brusco,
      Em meio à poeira,
      No ar carregado,
      Sob a tensão da luta,
      Diante das armas erguidas,
      Naquele momento,
      Durante um breve respiro,
      Sob a luz incerta,
      Entre ruídos de metal,
      No chão castigado,
      Diante dos adversários,
      Entre ameaças e gritos,
      No campo de batalha,
      Por entre os vultos,
      Em plena confusão,
      Entre movimentos rápidos,
      Ao alcance dos olhares,`)
  };
  const bodies={
    hero:{
      inspire:list(`Enquanto houver esperança, ficaremos de pé!
        Ninguém precisa enfrentar a escuridão sozinho.
        A estrada ainda nos reserva uma manhã.
        Nosso medo não decide o fim desta história.
        Somos mais fortes quando protegemos uns aos outros.
        A companhia não abandona os seus.
        Há luz além desta sombra.
        Cada passo firme abre caminho para todos.
        Que nossas mãos não soltem as de nossos amigos.
        Esta noite também vai passar.
        Nosso lar ainda vive em nossa memória.
        Juntos, podemos atravessar esta tormenta.
        Não deixaremos a esperança cair.
        O inimigo ainda não venceu nossa vontade.
        Um coração firme sustenta muitos outros.
        Se a sombra avançar, avancemos juntos.
        Há gente esperando nossa volta.
        Nossa coragem vale mais que o tamanho do inimigo.
        Não precisamos vencer sozinhos.
        O próximo amanhecer merece nossa luta.
        Nossa amizade trouxe todos até aqui.
        A companhia ainda tem muito a contar.
        Que o medo ouça nossa resposta.
        Temos uns aos outros, e isso importa.
        A noite não apagará nossos nomes.
        Eu confio em quem luta ao meu lado.
        Nossa estrada não termina neste chão.
        Ainda há força em nossos braços.
        Protejam quem estiver mais cansado.
        A calma também é uma forma de coragem.
        Cada um de nós faz falta nesta companhia.
        Hoje lutamos pelo direito de voltar para casa.
        Que nossos amigos encontrem abrigo em nossa guarda.
        A esperança sobrevive enquanto a sustentamos.
        Não entregaremos este lugar ao desespero.
        Ainda podemos mudar o rumo desta luta.
        Nossa união abre brechas onde não havia caminho.
        Deixem que a lembrança de casa lhes dê força.
        Há batalhas que se vencem ficando juntos.
        Que ninguém carregue o peso de todos sozinho.
        Conservem o fôlego para o próximo passo.
        Uma guarda firme pode salvar uma vida.
        Hoje seremos abrigo uns para os outros.
        Não deixem o cansaço falar mais alto que a esperança.
        A sombra encontra resistência em cada um de nós.
        Nossa promessa ainda está de pé.
        Nem toda força precisa fazer barulho.
        Os dias bons também dependem desta coragem.
        A companhia conhece caminhos que o medo ignora.
        Podemos ter medo e seguir em frente.
        Que nossa presença devolva força aos feridos.
        Ainda há tempo de proteger quem amamos.
        O que defendemos é maior que esta ameaça.
        Mantenham perto a lembrança de um lugar seguro.
        Nenhuma noite dura para sempre.
        Nossos passos juntos fazem a estrada existir.
        Se alguém vacilar, os demais o sustentam.
        Não deixaremos um amigo lutar sem apoio.
        Nossa história merece mais um capítulo.
        Há bondade no mundo que vale nossa resistência.
        A coragem pode começar com uma única respiração.
        Daremos uns aos outros motivos para continuar.
        Ainda não dissemos nossa última palavra.
        Quando sairmos daqui, sairemos juntos.`),
      received:list(`Esse golpe abalou minha guarda!
        Preciso de um instante para recuperar o fôlego.
        Senti esse impacto até os ossos.
        Minha defesa ficou aberta por um momento.
        Não posso deixar que me cerquem.
        Ainda consigo lutar, mas preciso de cobertura.
        Esse ataque chegou perto demais.
        Tenho de encontrar um lugar para respirar.
        Estou sentindo o peso desta luta.
        Preciso firmar os pés outra vez.
        Eles encontraram uma brecha na minha guarda.
        Não me deixem isolado aqui.
        Por um instante, tudo ficou escuro.
        Esse impacto quase me tirou do lugar.
        Preciso manter a cabeça no combate.
        Minha mão está tremendo, mas não vou soltar a arma.
        Devo recuar um passo e fechar a guarda.
        Esse golpe foi mais forte do que parecia.
        Tenho de proteger melhor meu flanco.
        A dor não pode me distrair agora.
        Ainda ouço o impacto daquele ataque.
        Não esperava tanta força naquele movimento.
        Preciso acompanhar melhor seus passos.
        Quase perdi o equilíbrio.
        Há uma abertura perigosa deste lado.
        Não deixem que repitam esse golpe.
        Preciso de espaço para me recompor.
        Esse ataque me deixou sem ar.
        Vou precisar de ajuda para segurar este flanco.
        Não consigo ignorar essa dor.
        Deem-me um instante e voltarei à formação.
        Esse golpe atravessou minha defesa.
        Tenho de evitar outro impacto assim.
        Não posso baixar a guarda de novo.
        Por pouco não fui ao chão.
        Preciso ouvir a voz de vocês agora.
        Estou ferido, mas ainda vejo uma saída.
        O medo chegou perto naquele instante.
        Preciso controlar a respiração.
        Meus passos estão ficando pesados.
        Ainda estou de pé; mantenham-me na formação.
        Esse ataque mudou meu ritmo.
        Não deixem que se aproximem pelas costas.
        Tenho de recuperar minha posição.
        Foi uma boa defesa, mas não foi suficiente.
        A próxima investida não pode me pegar assim.
        Estou perdendo terreno deste lado.
        Preciso de uma guarda amiga por perto.
        A dor veio antes que eu percebesse o ataque.
        Tenho de reagir antes do próximo golpe.
        Essa ameaça é maior do que eu calculava.
        Preciso de um caminho para sair deste cerco.
        Não posso dar outra abertura dessas.
        Ainda consigo acompanhar vocês.
        Esse golpe fez o mundo girar.
        Preciso de firmeza para não tropeçar.
        Minha resistência está sendo posta à prova.
        Não é hora de ceder à dor.
        Tenho de reencontrar meu centro.
        Meu flanco precisa de proteção agora.
        Ainda luto, mesmo com o coração disparado.
        Preciso de calma para responder a isso.
        Esse ataque me ensinou a ter mais cuidado.
        Não me deixem enfrentar o próximo sozinho.`),
      attack:list(`Vou abrir espaço para a companhia!
        Minha resposta vem agora!
        Vou testar essa defesa.
        Fiquem prontos para avançar comigo.
        Não deixarei que nos encurralem.
        Vou buscar uma brecha deste lado.
        Essa ameaça terá de me enfrentar.
        Vou tirar a pressão dos nossos feridos.
        Meu próximo movimento é por todos nós.
        Vou forçar o inimigo a recuar.
        Protejam meu flanco enquanto avanço.
        Há uma oportunidade aqui!
        Vou quebrar o ritmo deles.
        Minha guarda acompanha meu ataque.
        Agora é hora de responder.
        Vou manter essa ameaça ocupada.
        Quero abrir um caminho de saída.
        Vou pressionar antes que se reorganizem.
        A companhia precisa desta abertura.
        Meu avanço será firme.
        Não vou dar descanso a essa ameaça.
        Vou impedir que alcancem nossos amigos.
        Este movimento é pela nossa passagem.
        Quero tirar o inimigo de sua posição.
        Vou chamar a atenção para mim.
        Aproveitem a brecha que eu criar.
        Vou responder com tudo que ainda tenho.
        Deixem este adversário comigo por um instante.
        Vou cobrir nosso avanço.
        Minha vez de mudar o ritmo.
        Não deixarei que ditem cada passo da luta.
        Vou procurar o ponto fraco dessa guarda.
        Quero afastar o perigo da companhia.
        Vou dar espaço para vocês respirarem.
        Esta investida é por quem está ao meu lado.
        Vou enfrentar essa linha de frente.
        Preparem-se para a minha resposta.
        Quero obrigá-los a olhar para este flanco.
        Vou lutar com precisão.
        Agora tentarei atravessar essa defesa.
        Não vou desperdiçar esta oportunidade.
        Vou pressionar sem perder a guarda.
        Quero impedir o próximo avanço deles.
        Minha coragem também sabe responder.
        Vou tomar de volta nosso espaço.
        Este passo é para proteger os demais.
        Vou exigir atenção desse adversário.
        A iniciativa pode mudar de mãos agora.
        Vou romper este cerco.
        Quero desviar o perigo para longe dos feridos.
        Vou fazê-los trabalhar por cada passo.
        Meu ataque acompanha o ritmo da companhia.
        Vou tentar abrir a formação inimiga.
        Quero alcançar aquela brecha antes que feche.
        Vou responder à altura desta ameaça.
        Esta é a hora de avançar com cuidado.
        Não darei minha posição sem resistência.
        Vou mostrar que nossa força continua aqui.
        Quero obrigá-los a rever essa aproximação.
        Vou lutar por mais um passo de liberdade.
        Meu foco está nessa defesa.
        Vou afastá-los da nossa linha.
        A companhia terá minha resposta.
        Vou pôr minha coragem neste movimento.`)
    },
    foe:{
      inspire:list(`O bando ainda tem força!
        Não deixem que a companhia respire.
        Eles também sentem cansaço.
        Fechem os caminhos ao redor deles.
        Ainda podemos tomar este terreno.
        Ninguém abandona esta linha.
        Mantenham a pressão sobre os intrusos.
        A vantagem muda a cada passo.
        Não lhes deem tempo para se reunir.
        Nosso número ainda importa.
        Eles não podem vigiar todos os lados.
        Fiquem próximos e cerquem as saídas.
        Não deixem que protejam os feridos.
        A coragem deles também pode quebrar.
        Conservem força para outra investida.
        Esta luta ainda pode ser nossa.
        Pressionem onde a guarda estiver aberta.
        Não vamos ceder todo o terreno.
        Segurem a frente enquanto o bando se reúne.
        Eles precisam de espaço; tomem esse espaço.
        Não deixem que controlem o ritmo.
        A companhia não é invencível.
        Continuem atentos às brechas.
        Nosso bando conhece a resistência.
        Quanto mais hesitarem, mais tempo terão os intrusos.
        Não gastem toda a força de uma vez.
        Guardem os flancos e mantenham a ameaça.
        Ainda há lugar para uma virada.
        Façam com que duvidem do próximo passo.
        Esta posição não será entregue facilmente.
        Há força suficiente para mais uma rodada.
        Não deixem um dos nossos isolado.
        A pressão precisa vir de todos os lados.
        Eles não vão atravessar sem resistência.
        Cada brecha deles deve ser aproveitada.
        O chão não pertence somente à companhia.
        Continuem entre eles e a saída.
        Não confundam a calma deles com vitória.
        Nosso momento ainda pode chegar.
        Um ataque de cada lado quebrará o ritmo deles.
        Fiquem prontos para aproveitar um erro.
        Eles terão de lutar por este caminho.
        Se nos mantivermos juntos, ainda há chance.
        A guarda deles não pode durar para sempre.
        Reúnam coragem e segurem o avanço.
        Não lhes entreguem uma passagem livre.
        Ainda podemos cercar a companhia.
        Mostrem que este bando continua perigoso.
        Não deixem que o medo nos espalhe.
        Há mais força em nós do que eles pensam.
        Mantenham os intrusos à distância.
        Esta resistência ainda vai lhes custar esforço.
        Cada passo deles deve encontrar oposição.
        Não cedam à primeira ameaça.
        Não há vitória enquanto a luta continua.
        Vigiem quem tenta se aproximar pelas bordas.
        Eles precisam errar apenas uma vez.
        Ainda podemos impor nosso ritmo.
        Não deixem a companhia descansar a guarda.
        A frente deles pode se abrir a qualquer momento.
        O bando precisa de firmeza agora.
        Tomem fôlego e sustentem a pressão.
        Não deixem que a união deles nos disperse.
        Esta batalha ainda tem dentes.`),
      received:list(`Esse golpe foi fundo demais!
        Cubram meu lado antes que ataquem de novo!
        Preciso sair desta posição.
        Não pensei que fossem tão fortes.
        Ainda estou lutando, mas preciso de espaço.
        Eles encontraram minha guarda aberta.
        Não me deixem cercado aqui.
        Essa dor não estava nos meus planos.
        Preciso recobrar o equilíbrio.
        Esse ataque quase me tirou da luta.
        Não posso receber outro desses.
        Meu fôlego desapareceu com o impacto.
        Alguém segure esse adversário por um instante!
        Quase perdi meu lugar na formação.
        Esse golpe não pode se repetir.
        Eles sabem mais do que aparentam.
        Preciso manter os olhos naquele movimento.
        A companhia está ficando perigosa demais.
        Não deixem que avancem sobre mim.
        Tenho de proteger melhor esta abertura.
        Esse impacto fez meus passos falharem.
        Estou sentindo cada parte daquele golpe.
        Preciso de um flanco seguro.
        Não vou aguentar essa pressão sozinho.
        Minha defesa cedeu por um instante.
        Aquilo chegou perto do fim.
        Não era para doer tanto.
        Tenho de respirar antes da próxima investida.
        Eles não estão cedendo como eu esperava.
        Não me abandonem na frente!
        Esse ataque foi mais rápido que meus olhos.
        Preciso firmar a guarda de novo.
        Meus braços sentiram toda a força disso.
        Tenho de mudar minha aproximação.
        Por pouco não fui derrubado.
        Quero distância daquele adversário por um momento.
        Minha posição ficou ruim.
        Esse golpe trouxe o medo bem perto.
        Preciso de cobertura para recuar um passo.
        Não deixem que ataquem minhas costas.
        Ainda consigo reagir, mas isso custou caro.
        Meu ritmo foi quebrado.
        Tenho de fechar essa brecha depressa.
        Estou ficando sem lugar para recuar.
        A companhia percebeu minha hesitação.
        Não consigo ignorar esse ferimento.
        Esse ataque quase me fez largar tudo.
        Eles estão mais perto do que eu queria.
        Preciso tirar o peso deste flanco.
        Não pensei que minha guarda fosse falhar assim.
        O chão pareceu se mover com esse impacto.
        Tenho de responder antes que sintam meu medo.
        Não deixem aquele combatente me alcançar outra vez.
        Estou lutando para manter o fôlego.
        Preciso de apoio antes que avancem.
        Esse golpe tornou tudo mais difícil.
        Minha coragem vacilou com o impacto.
        Não vou resistir parado aqui.
        Preciso encontrar uma saída deste aperto.
        A força deles não é conversa.
        Esse ataque me obrigou a recuar.
        Tenho de recuperar o controle dos meus passos.
        Mais um desses e minha guarda desaba.
        Não permitam que explorem meu ferimento.`),
      attack:list(`Vou abrir a guarda deles!
        Minha resposta vem deste lado!
        Quero ver como resistem agora.
        Vou pressionar o centro da companhia.
        Não deixarei que avancem à vontade.
        Meu próximo movimento vai exigir atenção.
        Vou testar a coragem desses intrusos.
        Quero tirar um deles da formação.
        Vou tomar esse espaço para o bando.
        A companhia terá de se defender.
        Vou buscar o flanco mais exposto.
        Preparem o avanço atrás de mim!
        Não vou dar tempo para descansarem.
        Quero quebrar essa guarda cuidadosa.
        Minha ameaça vem agora.
        Vou obrigá-los a recuar um passo.
        Quero que olhem para este lado.
        Não deixarei essa brecha escapar.
        Vou apertar o cerco.
        A próxima pressão será minha.
        Quero roubar o ritmo deles.
        Vou fazer essa companhia trabalhar para passar.
        Mantenham a linha enquanto eu avanço.
        Vou testar aquele ponto fraco.
        Quero empurrá-los para longe do nosso espaço.
        Minha investida não vai esperar.
        Vou forçar uma resposta desses viajantes.
        Não terão passagem sem enfrentar minha guarda.
        Quero afastar quem protege os demais.
        Vou alcançar aquela abertura.
        A companhia vai sentir esta pressão.
        Quero impedir que se reorganizem.
        Vou buscar uma vantagem antes que reajam.
        Não deixarei a iniciativa nas mãos deles.
        Meu movimento vai fechar esse caminho.
        Quero ver seus passos vacilarem.
        Vou levar a ameaça até a linha deles.
        Abram espaço para a minha investida!
        Quero desviar sua atenção da saída.
        Vou responder com a força que me resta.
        Esse flanco merece uma visita.
        Quero fazer a guarda deles se dividir.
        Vou lutar por cada pedaço deste terreno.
        Não darei espaço a esses intrusos.
        Quero quebrar o conforto dessa posição.
        Minha resposta não ficará para depois.
        Vou insistir onde a defesa parece cansada.
        Quero alcançar o centro antes que se feche.
        Vou manter a companhia ocupada.
        Este avanço é pelo nosso bando.
        Quero exigir toda a atenção daquele adversário.
        Vou pressionar sem sair da formação.
        A próxima aproximação será por aqui.
        Quero colocar medo nessa linha de frente.
        Vou disputar cada passo com eles.
        Não deixarei que escondam suas fraquezas.
        Quero cortar o avanço da companhia.
        Vou tentar quebrar essa resistência.
        Preparem-se para aproveitar minha abertura!
        Quero forçar aquele combatente a me encarar.
        Vou trazer a luta para este flanco.
        Minha ameaça ainda está de pé.
        Quero arrancar a calma desses intrusos.
        Vou procurar espaço onde pensam estar seguros.`)
    },
    beast:{
      inspire:list(`a criatura sustenta sua presença ameaçadora.
        um chamado grave desafia os adversários.
        a fera observa a formação sem se afastar.
        a ameaça permanece firme diante da companhia.
        a criatura impõe respeito com um bramido.
        um ruído profundo atravessa o campo.
        a fera reafirma seu domínio sobre aquele espaço.
        a criatura acompanha os movimentos ao redor.
        uma presença inquietante pesa sobre a batalha.
        a ameaça não demonstra vontade de ceder.
        um som áspero chama a atenção dos combatentes.
        a criatura mantém os adversários sob vigilância.
        a fera ameaça qualquer aproximação.
        um chamado prolongado quebra a calma.
        a criatura se firma diante da linha inimiga.
        a tensão cresce diante daquela presença.
        a fera demonstra que ainda tem energia.
        um bramido devolve força à ameaça.
        a criatura resiste à pressão da companhia.
        um som baixo anuncia que a luta continua.
        a fera mantém sua atenção sobre os intrusos.
        a ameaça guarda o terreno que ocupa.
        a criatura responde à coragem dos adversários.
        um chamado áspero desafia a linha de frente.
        a presença da fera se faz sentir outra vez.
        a criatura parece medir a força dos combatentes.
        um ruído ameaçador toma o lugar do silêncio.
        a fera não abandona sua posição.
        a ameaça mantém o campo sob tensão.
        a criatura lança um desafio sem palavras.
        um som intenso corta o ar da arena.
        a fera permanece pronta para reagir.
        a criatura vigia qualquer sinal de fraqueza.
        a ameaça volta sua atenção para a companhia.
        um chamado rouco atravessa a distância.
        a fera demonstra sua disposição para continuar.
        a criatura sustenta a pressão sobre os adversários.
        um som grave faz os combatentes hesitarem.
        a ameaça se mantém entre a companhia e o caminho.
        a criatura recusa o espaço que lhe querem tomar.
        a fera acompanha cada mudança na formação.
        um ruído insistente mantém todos em alerta.
        a criatura permanece atenta ao próximo movimento.
        a presença da fera pesa sobre a linha de frente.
        um chamado hostil se espalha pela arena.
        a ameaça não deixa a companhia esquecer seu alcance.
        a criatura mantém o confronto vivo.
        a fera transforma sua presença em um desafio.
        um som inquietante percorre o campo de luta.
        a criatura impõe cautela aos combatentes.
        a ameaça continua firme apesar da resistência.
        a fera vigia o espaço entre as duas linhas.
        um chamado vibrante atravessa os ecos da luta.
        a criatura sustenta sua disposição de enfrentar todos.
        a ameaça parece guardar forças para outra investida.
        a fera exige atenção com um som repentino.
        a criatura conserva o terreno sob sua sombra.
        um ruído profundo devolve tensão ao confronto.
        a ameaça permanece próxima e vigilante.
        a fera não permite que o campo se acalme.
        a criatura demonstra que sua resistência continua.
        um chamado severo acompanha a pausa na luta.
        a ameaça mantém seus adversários em expectativa.
        a criatura desafia a companhia a se aproximar.`),
      received:list(`a criatura solta um som de dor.
        a fera hesita depois do impacto.
        um chamado agudo denuncia o ferimento.
        a ameaça vacila sob o golpe recebido.
        a criatura tenta recuperar sua posição.
        um ruído áspero acompanha o recuo.
        a fera demonstra surpresa com o ataque.
        a criatura se afasta da pressão por um instante.
        a ameaça perde parte de sua firmeza.
        um som abafado denuncia a força do impacto.
        a criatura reage ao ferimento com inquietação.
        a fera muda de posição para se proteger.
        um chamado rouco rompe o ritmo da luta.
        a criatura procura distância do adversário.
        a ameaça hesita antes de se aproximar de novo.
        a fera demonstra o peso do golpe recebido.
        um ruído irregular revela a dor.
        a criatura tenta se recompor diante da companhia.
        a ameaça parece mais cautelosa após o ataque.
        um som repentino denuncia o susto.
        a fera interrompe seu avanço para reagir à dor.
        a criatura se volta para a origem do golpe.
        a ameaça busca espaço para recuperar a firmeza.
        um chamado tenso acompanha a reação ao impacto.
        a fera perde o ritmo por um breve momento.
        a criatura responde ao ataque com um som ferido.
        a ameaça recua sem abandonar o confronto.
        um ruído hostil tenta esconder a dor.
        a fera demonstra dificuldade para manter a pressão.
        a criatura redobra a atenção ao adversário.
        um som entrecortado revela sua hesitação.
        a ameaça se afasta da abertura que expôs.
        a fera procura uma posição menos vulnerável.
        a criatura interrompe seu desafio com um chamado de dor.
        um ruído baixo acompanha sua tentativa de resistir.
        a ameaça evita a aproximação imediata.
        a fera mostra receio diante de outro possível golpe.
        a criatura perde parte da confiança no avanço.
        um chamado estridente responde ao ferimento.
        a ameaça tenta reorganizar seus movimentos.
        a fera acusa o impacto antes de voltar à luta.
        a criatura procura aliviar a pressão sobre si.
        um som rouco deixa claro que o ataque doeu.
        a ameaça cede espaço enquanto se recompõe.
        a fera mantém distância por um instante.
        a criatura reage com um chamado alarmado.
        um ruído irregular corta sua postura ameaçadora.
        a ameaça se torna cautelosa diante daquele adversário.
        a fera procura se defender do próximo movimento.
        a criatura parece medir melhor o perigo.
        um som de dor substitui o desafio anterior.
        a ameaça hesita ao tentar recuperar terreno.
        a fera busca equilíbrio depois do golpe.
        a criatura volta sua atenção à própria defesa.
        um chamado fraco denuncia o esforço para resistir.
        a ameaça muda seu ritmo para evitar outro impacto.
        a fera responde ao ataque com um recuo brusco.
        a criatura perde sua posição mais favorável.
        um ruído tenso acompanha sua tentativa de se proteger.
        a ameaça parece sentir o peso do ferimento.
        a fera recua diante da insistência dos combatentes.
        a criatura demonstra que aquele golpe não foi leve.
        um chamado de alerta denuncia sua vulnerabilidade.
        a ameaça hesita antes de retomar a pressão.`),
      attack:list(`a criatura se lança contra a defesa inimiga.
        a fera concentra sua ameaça em um adversário.
        um chamado violento acompanha a investida.
        a ameaça procura uma brecha na formação.
        a criatura força a companhia a reagir.
        a fera avança sobre o espaço disputado.
        um ruído hostil anuncia o ataque.
        a criatura pressiona a linha de frente.
        a ameaça muda de ritmo para surpreender.
        a fera busca alcançar quem está mais perto.
        a criatura exige atenção imediata dos adversários.
        um chamado áspero acompanha o movimento ofensivo.
        a ameaça tenta empurrar a companhia para trás.
        a fera disputa o terreno com uma investida.
        a criatura rompe a pausa com um ataque.
        um som grave anuncia perigo próximo.
        a ameaça procura separar os combatentes.
        a fera se aproxima da guarda adversária.
        a criatura pressiona o flanco mais exposto.
        um chamado repentino marca a nova ofensiva.
        a ameaça avança antes que o campo se acalme.
        a fera tenta tomar o espaço à sua frente.
        a criatura concentra sua força naquele movimento.
        um ruído intenso acompanha a aproximação.
        a ameaça desafia a defesa mais próxima.
        a fera tenta quebrar a distância entre as linhas.
        a criatura exige uma resposta da companhia.
        um chamado hostil marca o início da investida.
        a ameaça busca o centro da formação.
        a fera muda de posição para atacar.
        a criatura procura desviar a atenção dos defensores.
        um som brusco acompanha o avanço.
        a ameaça disputa cada passo com os adversários.
        a fera força a linha inimiga a se fechar.
        a criatura responde com uma aproximação agressiva.
        um chamado longo anuncia a intenção de atacar.
        a ameaça tenta alcançar uma abertura na guarda.
        a fera pressiona sem abandonar seu terreno.
        a criatura leva o perigo até o adversário.
        um ruído cortante acompanha sua ofensiva.
        a ameaça tenta impedir o avanço dos combatentes.
        a fera toma a iniciativa daquele momento.
        a criatura procura romper o ritmo da companhia.
        um chamado poderoso marca o ataque seguinte.
        a ameaça tenta afastar quem está à sua frente.
        a fera mantém o foco em sua investida.
        a criatura busca uma passagem entre as defesas.
        um som abrupto interrompe a calma dos adversários.
        a ameaça exige espaço com um movimento ofensivo.
        a fera tenta desviar a guarda de seu objetivo.
        a criatura avança sobre uma posição disputada.
        um chamado áspero acompanha a pressão sobre o flanco.
        a ameaça busca a iniciativa no confronto.
        a fera se aproxima com intenção de atacar.
        a criatura testa a resistência da linha inimiga.
        um ruído ameaçador precede o avanço.
        a ameaça concentra sua pressão em um ponto.
        a fera lança seu desafio contra a guarda inimiga.
        a criatura disputa a passagem à força.
        um chamado seco acompanha a nova aproximação.
        a ameaça tenta deslocar a formação adversária.
        a fera leva a luta para mais perto.
        a criatura procura impor seu ritmo ao confronto.
        um som intenso acompanha a tentativa de avançar.`)
    }
  };
  const cache=new Map();
  function pool(voice,context){
    const key=voice+':'+context;if(!bodies[voice]?.[context])return [];
    if(!cache.has(key)){const entries=[];openings[voice].forEach((head,i)=>bodies[voice][context].forEach((body,j)=>entries.push({key:`${key}:${i}:${j}`,text:head+' '+body})));cache.set(key,entries);}
    return cache.get(key);
  }
  function voice(p){
    const type=String(p.type||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    if(/dragao|dragoes|fera|besta|animal|aranha|lobo|aberracao|constructo/.test(type))return 'beast';
    return p.sourceType==='character'||p.sourceType==='npc'||p.team==='left'?'hero':'foe';
  }
  global.RPGDialogueBank={version:1,voices:Object.keys(bodies),contexts:['received','attack','inspire'],pool,voice};
})(window);
