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

## V3.1 — Arena 2D e Combate do Mestre

Status: validação técnica concluída; aguardando UAT visual do mestre.

- A arena é uma camada visual sobre o Combate V3: não substitui iniciativa, PV, condições ou desfazer.
- Rolagens ficam pendentes até confirmação. O valor aplicado pelo mestre, incluindo ajustes manuais, é registrado no evento da batalha.
- Eventos registram atacante, alvo, tipo de ação, rolagem, resultado, dano/cura, nota narrativa e diálogo opcional.
- A arena contém efeitos leves e reutilizáveis para corpo a corpo, distância, magia, cura, falha e crítico. `prefers-reduced-motion` e o botão de efeitos interrompem as animações.
- `Dados 3D` leva à mesa de dados existente, preservando o módulo aprovado. O d100 permanece percentual.
- A janela de apresentação da arena oculta inimigos por padrão. O conteúdo do jogador é separado do controle do mestre.
- Exportações: JSON técnico e Markdown legível. Modelos, cópias e arquivos ficam em `state.v3`, portanto são incluídos no backup geral.

### Testes executados

1. Sintaxe aprovada para `battle-core.js`, `battle-arena.js`, `v3-core.js`, `v3-ui.js` e `app.js`.
2. Fluxo do núcleo aprovado: criação de combate, participantes, rolagem pendente, confirmação com ajuste manual, dano, narração, modelo, duplicação, arquivamento e Markdown.
3. Regressão d100 aprovada: casos 00+0, 00+7, 30+0, 40+6, 90+9 e 2.000 rolagens aleatórias dentro de 1–100.
4. Integridade de diff aprovada com `git diff --check`.

## V3.1.1 — Battle Arena Correction Pass

Status: **TECHNICALLY READY FOR OWNER UAT**. Não equivale a OWNER UAT APPROVED.

### Correções entregues

- A arena agora explicita os lados **Companhia** e **Inimigos**, exibe PV/CA por combatente, destaca atacante e alvo e mostra estado de ação no centro do palco.
- O núcleo hidrata participantes antigos pelo `sourceId`. Isso corrige encontros que receberam os fallbacks anteriores `1/1`, `CA —`, tipo personalizado ou movimento ausente.
- Cada combatente resolve seu retrato pelo catálogo estável da ficha/criatura. O fallback somente ocorre quando não há imagem cadastrada.
- Ações possuem deslocamento curto para ataque físico, projétil para distância, brilho para magia, elevação para cura, tremor no alvo e feedback flutuante para dano, falha, crítico e cura.
- Inputs, selects, placeholders e a iniciativa receberam acabamento dark fantasy; nenhum campo novo usa a aparência branca padrão do navegador.
- A apresentação de jogadores conserva o bloqueio de inimigos por padrão e não inclui notas narrativas privadas.

### Auditoria obrigatória de imagens e dados

O comando `node tests/battle-arena-audit.cjs` foi aprovado com sete combatentes e sete assets distintos:

| Combatente | PV | CA | Asset efetivo |
| --- | ---: | ---: | --- |
| Elenya | 14/14 | 13 | `assets/portraits/elenya-hd.png` |
| Calion Aranwë | 10/10 | 13 | `assets/portraits/calion-hd.png` |
| Nando Serenata | 9/9 | 13 | `assets/portraits/nando-hd.png` |
| Anão Caolho de Hirnath | 52/52 | 16 | `assets/portraits/anao-caolho-hd.png` |
| Goblin Espadachim de Fangorn | 12/12 | 13 | `assets/generated/codex/creatures/goblin-espadachim.jpg` |
| Goblin Arqueiro de Fangorn | 9/9 | 12 | `assets/generated/codex/creatures/goblin-arqueiro.jpg` |
| Espectro das Sombras | 38/38 | 14 | `assets/generated/entities/espectro-das-sombras.png` |

O teste verifica asset ausente, caminho divergente, retrato repetido indevidamente, PV e CA. A verificação de contrato visual confirma os seis efeitos da arena. O servidor offline retornou HTTP 200.

### Evidência visual

Foi iniciado o servidor local e a página respondeu HTTP 200. A ferramenta de navegador deste ambiente recusou abrir o loopback por política de segurança, portanto não foi possível capturar screenshots reais a partir daqui. Essa limitação está registrada em vez de declarar aprovação visual indevida. O UAT local precisa abrir `http://127.0.0.1:4174/`, entrar em **Mestre → Combate** e registrar os screenshots solicitados.

## V3.2 — True 16-Bit Battle Arena Visual Rebuild

Status: **TECHNICALLY READY FOR OWNER UAT**. Não equivale a OWNER UAT APPROVED.

- A Arena deixou de montar retratos HTML em grupos limitados: o palco é agora um canvas PixiJS 8.22.0 local, com grade para todos os participantes. A auditoria inclui 20 combatentes.
- Foram incluídos spritesheets raster originais em `assets/pixel-sprites/`: quatro frames para a companhia, Uruk-hai e Espectro, além de sprites distintos de goblin lanceiro, arqueiro e espadachim.
- Ataque, magia, cura, falha e crítico movem/iluminam sprites pelo ticker. Regras de iniciativa, PV, condição, desfazer e histórico permanecem no núcleo V3.
- **Mesa de Dados** abre a rolagem compacta dentro da Arena com `RPGDiceLogic`, inclusive d100 percentual, e registra evento pendente até a confirmação; não redireciona para outra tela.
- `battle-display.html` recebe por `BroadcastChannel` somente nome, lado, sprite, título e rodada. PV, CA, notas, dano e histórico privados não são transmitidos. O mestre revela inimigos explicitamente.
- A migração só repara o fallback histórico `1/1` quando CA e movimento também são os valores vazios do bug. Um combatente realmente ferido com 1 PV continua ferido.
- Controles de tema e inputs/selects da Arena têm acabamento dark fantasy explícito, sem campos brancos nativos.

### Testes executados

1. `node --check` aprovado para `battle-pixi.js`, `battle-arena.js`, `battle-display.js` e `battle-core.js`.
2. `node tests/battle-arena-audit.cjs` aprovado: sete bindings canônicos, paths de assets, dano real em 1 PV preservado e capacidade de 20 participantes.
3. `git diff --check` aprovado.
4. O servidor PowerShell offline retornou HTTP 200 para `index.html`, `vendor/pixi/pixi.min.js` (840.663 bytes) e `battle-display.html`; não há CDN em execução.

### Limitação de evidência

O browser de automação desta sessão bloqueia o loopback local por política da ferramenta. A validação HTTP foi possível, mas screenshots e interação da janela secundária precisam ser feitos pelo proprietário no UAT. Esta limitação não foi convertida em aprovação visual.
