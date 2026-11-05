# QA — Mesa ao vivo 4.1

**Registro histórico da 4.1. A interface foi retirada na 4.1.1 por decisão do proprietário. Consulte o [QA atual da TV de combate](QA_TV_COMBATE.md).**

Data: 2026-11-05. Checkpoint anterior: `checkpoint-before-live-table-2026-11-05` em `da8cc44`. Testes usam perfis isolados, sem acessar ou alterar a campanha pessoal do mestre. Nenhum instalador ou novo executável foi gerado; o workflow de instaladores não foi disparado.

## Decisões de experiência

Para o mestre: reunir leitura e efeitos, consultar regras sem sair do encontro, fixar referências e registrar decisões em uma nota curta. Para os jogadores: uma cena limpa na TV, sem controles de administração ou informações privadas. As funções avançadas de regras e fichas permanecem nos módulos existentes.

A direção de cena reutiliza o PixiJS e os efeitos aprovados. Não modifica o motor de combate. As janelas secundárias não carregam o banco de campanha nem o bridge de disco; a janela principal continua sendo a única escritora. Canais independentes de leitura privada e apresentação pública usam identificadores de sessão diferentes. A janela de TV recebe o mesmo filtro de visibilidade do combate.

## Evidências e resultados

| Verificação | Resultado |
|---|---|
| Mesa ao vivo em 1920×1080, 1366×768 e 1280×800 | Sem transbordamento horizontal; captura real e inspeção visual |
| Mestre + TV + leitura privada simultâneos | Três janelas funcionais no Edge e Electron de desenvolvimento |
| Dois monitores físicos detectados | Envio da TV ao primeiro e leitura privada ao segundo confirmado por limites reais de janela |
| TV em tela cheia | Testada no Electron |
| História 5 | 1.060 blocos preservados na leitura destacada |
| Efeitos de interpretação | Golpe, flecha, fogo, gelo, raio e mísseis chegam à TV; estado de combate permanece byte a byte igual |
| Cortina | Oculta a cena, suprime efeitos públicos enquanto fechada, sem reprodução atrasada |
| Imagem e texto público | Mapa carregado; texto aparece só após comando explícito |
| Busca | Múltiplas palavras, prévia e referência fixada; não muda a tela atual |
| Nota rápida | Entrada privada no diário, persistente após recarregar |
| Navegação | TV e leitura continuam abertas ao trocar de módulo |
| Dados privados | Pacotes públicos inspecionados: nenhum PV, notas, resumo privado ou inimigo oculto |
| Reabertura | Referências e posição persistem após encerrar e reiniciar o processo desktop |
| Posições antigas | Retomada de `b25` e `v2b20` nos leitores anteriores preservada ao entrar na Mesa ao vivo |
| Fechar/reabrir TV | Nova janela reconecta sem fechar a leitura privada |
| Mestre desconectado | Conteúdo público ocultado automaticamente; aguardando conexão |
| Sincronização periódica | Preserva o mesmo elemento de imagem, sem reiniciar conteúdo a cada heartbeat |
| Pop-up bloqueado | Mensagem orienta permitir a janela; campanha preservada |
| Backup e recuperação | Referências e leitura restauradas; metadados inválidos recusados; backups antigos continuam aceitos |
| Regressão dos efeitos | 30 casos de direção/resolução, limpeza, redução de movimento e sincronização do combate completo |
| Regressão da plataforma | Quatro fichas nas três resoluções; edição, DOCX, PDF digital e OCR, backup/restauração, busca e História 5 passaram |
| Offline | Requisições externas bloqueadas no QA de navegador; nenhuma tentativa externa registrada |

Relatórios reproduzíveis: [navegador](qa-live-session/browser-report.json), [desktop](qa-live-session/desktop-report.json), [efeitos](qa-live-session/effects/report.json) e [regressão](qa-live-session/regression/browser-report.json).

Capturas reais: [mesa em 1920](qa-live-session/mesa-1920.png), [1366](qa-live-session/mesa-1366.png), [1280](qa-live-session/mesa-1280.png), [leitura privada](qa-live-session/leitura-privada.png), [fogo na TV](qa-live-session/tv-fire.png), [texto público](qa-live-session/tv-texto.png), [desktop TV](qa-live-session/desktop-tv.png). São cenas de teste, não a campanha pessoal.

## Reproduzir sem gerar instaladores

```sh
node tests/live-session-data.cjs
node tests/platform-core.cjs
node tests/live-session-browser.cjs
node tests/live-session-desktop.cjs
node tests/combat-effects-browser.cjs
node tests/platform-browser.cjs
node tests/battle-teams-audit.cjs
node tests/battle-catalog-audit.cjs
node tests/d100-regression.cjs
node test/verify.js
```

Os testes de navegador usam Edge no Windows e servidores em portas locais isoladas. Os testes de efeitos e plataforma aceitam `RPG_QA_OUTPUT` para conservar os relatórios de versões anteriores. Os testes desktop usam Electron já instalado como dependência, sem empacotamento.

## Arquivos e limites

- Novos: `js/live-session.js`, `js/session-reader.js`, `js/session-screen.js`, `js/campaign-search.js`, `session-screen.html`, `css/live-session.css` e testes/documentação desta entrega.
- Integração: `index.html`, `js/app.js`, `js/platform-ui.js`, `js/battle-arena.js`, `battle-display.html`, `js/battle-display.js`, `js/platform-data.js`, `desktop/main.cjs`, `desktop/preload.cjs`, `package.json` e `tests/platform-browser.cjs`.
- Nenhum documento original, sprite, tema, regra, valor de ficha ou código de física dos dados foi alterado.
- Windows/Edge/Electron foram executados nesta rodada. A implementação utiliza APIs multiplataforma, mas esta função ainda não foi revalidada no macOS nesta rodada.
- Foram usados dois monitores físicos com três janelas. A distribuição em três monitores físicos não pôde ser exercitada por não haver um terceiro monitor conectado.
- No navegador, posicionar a janela em outro monitor depende de arrastá-la. O seletor automático de monitor pertence ao runtime desktop atual.
- A TV depende do aplicativo principal aberto no mesmo computador. Não há streaming remoto, compartilhamento de áudio novo ou sincronização entre computadores.

Estado: pronto para teste do proprietário, com os limites acima. OWNER UAT não é declarado aprovado.
