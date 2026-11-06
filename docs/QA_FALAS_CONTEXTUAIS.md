# Falas contextuais — 4.1.4

2026-11-06. Checkpoint anterior: `checkpoint-before-dialogue-library-2026-11-06` em `5dec24b`. Nenhum instalador gerado.

## Comportamento

- Intervalo periódico dividido por três: de 28–65 segundos para 9,333–21,667 segundos. O observador de 500 ms pode acrescentar até meio segundo à apresentação.
- Banco autoral local em `data/battle-dialogue.js`: 32 aberturas por voz e 64 mensagens por situação. Três vozes (herói, adversário, fera) × três situações (receber dano, atacar, inspirar/desafiar) × 2.048 combinações = **18.432 falas completas distintas**. São variações compostas; partes individuais podem reaparecer em combinações diferentes. Não são 18 mil textos-base independentes.
- Baralho embaralhado por contexto, consumido sem reposição. Não há ordem fixa da primeira frase. Entre combates na mesma execução, evita-se também repetir imediatamente a última frase do encontro anterior.
- `combat.dialogueMemory` guarda a versão do banco, o ID do encontro e os identificadores usados. IDs de outro encontro não são herdados ao duplicar. Recarregar, trocar de tela e retomar o mesmo encontro preservam as exclusões. O backup transporta esse registro.
- Confirmar uma ação pode gerar uma reação do atacante ou do alvo ferido (85% de chance de reação, escolha aleatória do candidato). Cura e falha não geram reação de ataque. O gerenciador de PV continua reconhecendo dano. Há seis segundos entre balões, sem falas de mortos/inconscientes, sem fila atrasada interminável e sem bloquear as inspirações periódicas.
- A memória de falas fica no mestre; a TV recebe somente o balão escolhido. PV, CA, regras, iniciativa, histórico, animação de queda e sprites permanecem no fluxo existente.

## Verificação executada

`tests/dialogue-library.cjs` verifica o banco inteiro: 18.432 textos e identificadores únicos, todos dentro do limite de 110 caracteres do balão. Executa nove simulações de três horas, uma para cada voz/situação, incluindo recarregar o diretor a partir do JSON no meio de cada simulação. Resultado: zero repetição de falas completas. Cada cenário de reação extrema exibiu **1.800 falas**; cada cenário periódico no intervalo mínimo exibiu **1.136**. Uma simulação mista de três horas exibiu **1.560 falas**, dos três contextos, sem repetição. Trinta combates com sementes diferentes produziram trinta falas iniciais diferentes. Testou-se também cópia de encontro, retorno ao encontro anterior, cura/falha e classificação de fera aliada.

`tests/battle-life-unit.cjs` passou com cadência nova, participação dos dois lados, intervalos variados, zero repetição, pausa entre reações, exclusão de derrotados e silêncio após encerrar. Os campos de regras permanecem iguais; somente a memória de apresentação é acrescentada.

`tests/dialogue-browser.cjs` passou em Edge/Windows, perfil isolado e rede externa bloqueada. Usou os botões reais de confirmar ação para verificar reação ao dano, frase do atacante e inspiração, com o mesmo ID/texto na TV. Exportou o backup pelo aplicativo, recarregou do IndexedDB, restaurou pelo diálogo do aplicativo e verificou a memória e exclusão das falas anteriores. Seleção de Calion, turno e PV esperados foram preservados. Balões temporários foram removidos. O teste controla sorteio e relógio do diretor; renderização e comunicação entre janelas usam os temporizadores reais.

`tests/battle-life-browser.cjs` passou novamente com ataque fatal, cura, dano pelo gerenciador, desfazer, movimento reduzido, recarregamento sem nova queda e 12 composições de corpos caídos (4×1, 4×4, 4×8, 4×16 em três resoluções). Os contratos de persistência/backup e de equipes passaram em `platform-core.cjs` e `battle-teams-audit.cjs`.

`tests/combat-tv-browser.cjs` passou com o banco novo: elenco completo mesmo com inimigo marcado como oculto, flecha e quatro magias nas duas telas, escolha de alvo, próximo turno manual, seleção após recarregar, privacidade dos pacotes, temas e movimento reduzido em três resoluções, com rede externa bloqueada.

[Simulações](qa-dialogue-v2/simulation.json) · [Integração e backup](qa-dialogue-v2/browser.json) · [Regressão de queda](qa-dialogue-v2/lifecycle/report.json) · [Regressão da TV](qa-dialogue-v2/tv-regression/report.json).

Capturas reais de teste: [receber dano](qa-dialogue-v2/received-tv.png), [atacar](qa-dialogue-v2/attack-tv.png), [inspirar](qa-dialogue-v2/inspire-tv.png). Os tempos de três horas foram simulados, não aguardados em tempo real. Nenhum teste usa o armazenamento da campanha do proprietário. macOS não foi revalidado nesta rodada. OWNER UAT permanece com o proprietário.
