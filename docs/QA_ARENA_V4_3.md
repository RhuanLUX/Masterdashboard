# QA — Arena 4.3.0

Data: 06/11/2026. Execução real em Windows, Edge/Chromium via Playwright, perfis isolados e servidores temporários locais. O armazenamento da campanha do usuário não foi utilizado.

Status: **pronto para avaliação do proprietário**, sem declarar OWNER UAT APPROVED.

## Comparação e checkpoint

Antes das alterações, `git fetch origin` confirmou `main` e `origin/main` no mesmo commit `f84f940`, sem commits divergentes. Checkpoint: `checkpoint-before-arena-enrichment-2026-11-06`.

A expansão anterior trazia 42 ilustrações que apareciam como retratos na arena. Foram criadas 42 miniaturas distintas, mantendo as ilustrações das fichas. A arte original da companhia e Mordor foram preservados. O dragão distante reutiliza o asset local já licenciado a partir do GitHub, com seus créditos originais.

## Evidência funcional

| Verificação | Resultado |
| --- | --- |
| Catálogo atual | 71 participantes selecionáveis, nenhum fallback de retrato ou marcador. |
| Direção e identidade | 75 identidades × esquerda/direita = 150 instâncias medidas, sem fallback, cortes ou sobreposição. Inclui quatro bases narrativas fora do elenco padrão. |
| Miniaturas novas | 42 arquivos próprios, transparência real, margens livres e dimensão máxima de 480 pixels. Conferência visual das três pranchas e das oito capturas do elenco. |
| Composição | 60 combinações: cinco cenários × quatro formações (4×1, 4×4, 4×8, 10×10) × três resoluções. Nenhum corte, invasão do centro ou sobreposição nas caixas de ação. |
| Resoluções | 1920×1080, 1366×768 e 1280×800, incluindo tela do mestre e TV. |
| Movimento ambiental | Quatro fases produzem quatro quadros distintos no canvas; 25 trocas de cenário mantêm sete camadas, oito atores e zero efeitos pendentes. |
| Efeitos | Fogo, gelo, eletricidade, mísseis, vento, pedra, cura e flecha renderizados e removidos ao terminar. Capturas durante cada efeito. |
| TV | Cinco cenários sincronizados; vento, pedra e cura acionados pela interface e recebidos na TV. Teste anterior também validou flecha e as quatro magias anteriores. |
| Privacidade | TV sem controles, PV, notas do mestre ou seleção privada no payload. Todos os seis participantes de teste aparecem. |
| Regras e seleção | Sequência 80 − 5 − 5 + 5 = 75 PV; atacante permanece Calion. Turno muda somente pelo comando existente. |
| Salvar e reabrir | Cenário Estrada Real permanece após recarregar. |
| Backup | Exportação real, mudança para Hrim e restauração devolvem Estrada Real. Regressão da biblioteca confirma imagens personalizadas, edições e magias no backup. |
| Quedas e falas | Dano fatal, queda na TV, cura, desfazer, falas, limpeza de balões e recarga sem repetir a morte passaram. |
| Offline | Nenhuma requisição externa, nenhum recurso local com erro HTTP e nenhuma exceção JavaScript nos testes finais. |
| Movimento reduzido | Canvas permanece estável; efeitos de movimento desativados pela preferência do sistema. |

A regressão revelou uma corrida preexistente na busca: mudar de categoria enquanto a digitação ainda tinha atualização agendada apagava a prévia já selecionada. A atualização imediata agora cancela o temporizador pendente. O teste repete a sequência e verifica a prévia depois do intervalo do temporizador.

## Desempenho observado

Com 20 participantes, Fangorn animado e efeito de fogo, foram registrados 150 intervalos do ticker real do Pixi: mediana **16,7 ms**, percentil 95 **20,8 ms**, nenhum intervalo acima de 50 ms. É uma amostra local curta em navegador automatizado; não representa garantia para todo hardware nem medição de três horas. O renderer mantém limite de 60 FPS; decoração é atualizada a 8 Hz.

## Capturas reais

- [Mestre com seletor de cenário](qa-arena-enrichment/master-1366.png) e [a mesma batalha na TV](qa-arena-enrichment/tv-1366.png).
- [Fangorn](qa-arena-enrichment/fangorn-1366-4v4.png), [Valfenda](qa-arena-enrichment/rivendell-1366-4v4.png), [Estrada Real](qa-arena-enrichment/road-1366-4v4.png), [Hrim](qa-arena-enrichment/hrim-1366-4v4.png), [Mordor](qa-arena-enrichment/mordor-1366-4v4.png).
- [Vento](qa-arena-enrichment/effect-wind.png), [Pedra](qa-arena-enrichment/effect-stone.png), [Fogo](qa-arena-enrichment/effect-fire.png), [Cura](qa-arena-enrichment/effect-heal.png).
- Miniaturas novas: [prancha 1](qa-arena-enrichment/miniatures-0.png), [prancha 2](qa-arena-enrichment/miniatures-14.png), [prancha 3](qa-arena-enrichment/miniatures-28.png).

Resultados completos: [auditoria do navegador](qa-arena-enrichment/browser.json), [auditoria de assets](qa-arena-enrichment/asset-audit.json), [regressão da TV](qa-arena-enrichment/regression-tv/report.json), [regressão de quedas/falas](qa-arena-enrichment/regression-life/report.json), [regressão da biblioteca](qa-arena-enrichment/regression-library/browser.json).

## Reprodução

Com as dependências de desenvolvimento já instaladas:

```text
node tools/finalize-arena-miniatures.cjs
node tests/platform-core.cjs
node tests/library-expansion.cjs
node tests/battle-catalog-audit.cjs
node tests/battle-teams-audit.cjs
node tests/battle-life-unit.cjs
node tests/arena-enrichment-browser.cjs
node tests/combat-tv-browser.cjs
node tests/battle-life-browser.cjs
node tests/library-browser.cjs
```

Os testes de navegador desta rodada utilizaram Edge instalado no Windows. Os três testes de regressão aceitam `RPG_QA_OUTPUT` para salvar seus relatórios em uma pasta separada e preservar as evidências anteriores.

## Arquivos e limites

Código: `js/battle-environment.js`, `js/battle-pixi.js`, `js/battle-catalog.js`, `js/battle-arena.js`, `js/battle-display.js`, `js/compendium.js`, `js/campaign-search.js`, `css/battle-arena.css`, `index.html`, `battle-display.html` e versão em `package.json`. Acrescentados assets, manifestos de procedência, testes e documentação. Regras de combate, valores das fichas, dados 3D, aventuras e fontes originais não foram alterados.

As novas miniaturas são poses individuais com movimentação do renderer; não são sequências de ataque novas desenhadas quadro a quadro. Cadastros totalmente personalizados e cópias antigas sem vínculo visual ainda podem usar o retrato próprio. Cópias novas do compêndio herdam a miniatura. A correspondência depende de IDs, sem adivinhar a criatura pelo nome.

O código usa recursos web e caminhos relativos. **macOS e Safari não foram executados nesta máquina**, nem uma TV física conectada; foram verificadas duas janelas reais sincronizadas do navegador. Nenhum instalador foi gerado. A avaliação artística final permanece com o proprietário.
