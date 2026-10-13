# QA — Master Control V3

Data: 2026-10-13

## Verificações executadas

- `node --check` aprovado para `js/app.js`, `js/dice-logic.js`, `js/theme-manager.js`, `js/v3-core.js` e `js/v3-ui.js`.
- `git diff --check` aprovado, sem espaços em branco inválidos.
- Teste de regras V3 em Node: criação/início de sessão, criação de combate, participante, iniciativa local, dano com limite mínimo de PV, diário e missão.
- `RPGDiceLogic.rollDie(20)` foi usado pelo núcleo de iniciativa; não existe dependência de rede.
- O carregamento da camada V3 ocorre após o runtime existente e observa a renderização para inserir somente o botão **Mestre**, preservando a abertura, História 5, fichas, dados e biblioteca.

## Fluxos para aceitação visual local

1. Execute `INICIAR_RPG.bat` (Windows) ou `INICIAR_RPG.command` (macOS).
2. Abra **♜ Mestre** e crie uma sessão.
3. Em **Combate**, crie um encontro, adicione Companhia e criatura, role iniciativa, aplique dano/cura e avance o turno.
4. Registre uma nota no **Diário** e uma entrada em **Missões**.
5. Em **Apresentação**, permita pop-ups locais e confirme a janela secundária sem conteúdo privado.
6. Use **Backup V3**, recarregue a página e use **Restaurar V3** para confirmar sessões, diário, missões e preferências.
7. Selecione inverno ou horror nas Configurações existentes e confira intensidade suave/normal/intensa no painel **Temas**.

## Hardening de integração — 2026-10-13

Problemas confirmados e corrigidos:

- A primeira camada V3 mantinha um armazenamento separado; sessões, combate, diário, missões e favoritos agora residem em `state.v3`, dentro do estado principal do RPG, e são incluídos na persistência local e no backup completo.
- O combate encerrado agora permanece armazenado, com histórico e associação à sessão; pode ser retomado pela Central do Mestre.
- A interface passou a utilizar `RPGV3` como única fonte de regras operacionais, incluindo snapshots/desfazer, condições, iniciativa, ordenação estável, PV limitado e histórico.
- Pausar tema chama `ThemeManager.pause()` e retomar chama `ThemeManager.resume()`. Intensidade agora altera a densidade de neve e a frequência/capacidade de morcegos.
- O tema de cada aventura é persistido e é aplicado ao abrir sua aventura.
- Diário e missões incluem edição, exclusão confirmada, pesquisa de diário, associação automática à aventura/sessão ativa e persistência.
- Apresentação permite texto e itens selecionados da biblioteca visual, criaturas e mapas importados. Registros privados não recebem botão de apresentação.
- O servidor Node local agora aceita uma porta alternativa, o que permite QA isolado sem interferir em processos do usuário.

## QA executado no hardening

- Sintaxe aprovada: `app.js`, `v3-ui.js`, `v3-core.js`, `theme-manager.js`, `offline-server.mjs` e `dice-logic.js`.
- `git diff --check` aprovado.
- Cenário de regras integrado aprovado em Node: sessão ativa, combate com 4 personagens + 3 goblins + 1 capitão Uruk-hai, iniciativa, dano, cura, condição, avanço/retorno/desfazer, encerramento preservado, diário e missão editável. Resultado: 8 participantes e 15 eventos no histórico.
- Regressão d100 aprovada: cinco casos determinísticos e 20 rolagens aleatórias mantiveram o valor bruto entre 1 e 100.
- Servidor local isolado em porta alternativa aprovado com HTTP 200 e 943 bytes da página inicial. O processo de QA foi encerrado imediatamente após o teste.

## Limitação de ambiente

A automação de navegador fornecida pelo ambiente não consegue alcançar o loopback do processo isolado, embora a verificação HTTP externa tenha retornado 200. Portanto, a inspeção visual interativa e o teste da segunda janela devem ser repetidos pelo proprietário em seu navegador local durante UAT. Não há declaração de aprovação UAT neste relatório.
