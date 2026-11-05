# TV de combate — 4.1.3

Execute o projeto pelo iniciador habitual. Abra **Mesa → Combate** para controlar participantes, iniciativas, ações, danos e cura. A Mesa ao vivo foi retirada; o menu Mesa continua organizado.

**TV de combate** abre uma segunda janela que mostra exclusivamente a arena do encontro atual, como a área visual do combate no programa normal. O botão está no menu Mesa, na Central e na própria tela de combate.

1. Configure o computador para **estender** os monitores.
2. Abra a TV de combate e arraste essa janela para a TV/segundo monitor.
3. Dê dois cliques na arena para entrar/sair da tela cheia, ou use F11 no navegador. Há também um pequeno botão no canto inferior direito, visível ao passar o mouse sobre ele.
4. Controle tudo no programa normal. A TV reflete todos os participantes que você vê na arena, os alvos selecionados, ataques, flechas, magias e mudanças de equipe/turno.

A janela dos jogadores recebe o estado visual completo da arena. Marcas antigas de inimigo oculto/revelado não interferem no espelhamento. O botão de ocultar alvo foi retirado desse fluxo para não criar diferenças entre as duas arenas. PV, CA, notas privadas e histórico não são enviados como campos de dados; os textos visuais do próprio efeito, como “Confirmado: 3”, acompanham a animação. Não há modos de história, mapa ou texto na TV. Nenhum tema do mestre é aplicado por cima da arena pública.

Quando um combatente passa de PV positivo para 0 PV, ele cai após o impacto do ataque. O corpo permanece deitado e escurecido nas duas arenas. Quem já estava em 0 PV ao abrir o encontro começa deitado, sem repetir a animação. Curar ou desfazer o dano restaura a pose normal. A queda é uma indicação visual de derrota: não muda regras de morte, condições, PV ou iniciativa.

Depois de **Iniciar combate**, falas curtas em português aparecem em balões junto aos combatentes, com intervalos sorteados de 28 a 65 segundos. Heróis encorajam a companhia; adversários desafiam os heróis e feras têm reações narrativas. Ao sofrer dano sem cair, há 55% de chance de uma reação de medo/dor, respeitando uma pausa mínima de 10 segundos entre falas. Só há um balão de cada vez, por cerca de 3 a 5 segundos; quem está derrotado ou inconsciente não fala. O mestre escolhe aleatoriamente a frase e a TV recebe a mesma fala. Elas não são gravadas no histórico nem alteram notas do mestre, e param ao encerrar o combate. Não há voz sintetizada nem serviço externo.

Com movimento reduzido no sistema, o combatente assume a pose caída sem a rotação animada. As falas continuam legíveis. Após atualizar o código, recarregue **as duas janelas com F5**.

Após confirmar dano, cura ou uma ação, o atacante, alvo, tipo de ação, magia e resultado selecionados continuam no lugar. O turno não muda automaticamente. Use **Próximo ▶**, depois dos botões de iniciativa/ordenação, quando decidir avançar. A escolha do atacante pode ser feita livremente sem avançar a iniciativa.

A seleção é salva por encontro e retomada após recarregar. Se a janela do mestre desconectar, a TV aguarda; ao retornar, recebe o estado atual sem repetir o último ataque. Fechar a TV não fecha a campanha. Clicar novamente no botão reaproveita a janela aberta.

No tema **Reino dos Dragões**, o voo usa frames PNG locais: dois dragões na intensidade suave, três na normal e cinco na intensa, com rotas e ritmos independentes. Pausar efeitos congela voo e asas; a preferência de movimento reduzido desativa os dragões. As cores aprovadas do tema permanecem.

Esta atualização é de código. Nenhum instalador foi gerado; os instaladores 4.0 existentes não são atualizados automaticamente.
