# QA — Arena 4.4.0

Data: 06/11/2026. Estado: **TECHNICALLY READY FOR OWNER UAT**. A aprovação artística do proprietário permanece pendente.

## Entrega

- 75 identidades com quatro poses individuais: 300 PNGs transparentes de 480 × 480. São 71 entradas selecionáveis e quatro personagens narrativos preparados. [Lista completa](COBERTURA_ANIMACOES_V4_4.md).
- 69 sequências novas e seis sequências aprovadas preservadas, separadas pela silhueta. A Elenya não usa mais recortes iguais de uma faixa com poses de larguras diferentes.
- Âncoras medidas pelos pés em cada quadro, escala proporcional e reserva do espaço ocupado pelo conjunto das poses. Avanços de ataque limitados ao espaço livre.
- Sete efeitos novos: furacão, meteoro, nevasca, onda das marés, nuvem venenosa, lanças das sombras e luz sagrada. Total: 13 opções de magia, além de flecha e cura.
- Mordor redesenhado no nível de detalhe dos outros cenários, com ruínas, montanhas, torre distante e superfície aberta. Outros quatro cenários preservados.
- Mestre e TV usam o mesmo catálogo, efeitos e tempo de impacto. Nenhuma alteração de regras, custos de magia, PV/CA, fichas, dados 3D ou esquema de persistência.

## Testes executados

Navegador Microsoft Edge/Chromium no Windows, em contextos isolados. Todas as requisições externas foram bloqueadas durante os testes. O estado real do usuário não foi usado.

| Verificação | Resultado |
| --- | --- |
| `tests/animation-coverage.cjs` | 75 identidades; 300 arquivos distintos, quatro poses diferentes por entidade; transparência, dimensões e margens seguras válidas. |
| `tests/animation-catalog-browser.cjs` | 150 atores nos dois sentidos; 600 verificações de poses; 150 ataques reproduzindo antecipação, golpe, recuperação e repouso. Nenhum fallback no catálogo padrão. |
| Composição | 60 layouts: cinco cenários × quatro formações (4×1, 4×4, 4×8 e 10×10) × três resoluções. Sem invasão dos espaços reservados. |
| Resoluções | 1920×1080, 1366×768 e 1280×800. Mestre e TV capturados. |
| `tests/spell-effects-browser.cjs` | 30 execuções: 13 magias, cura e flecha nos dois sentidos. Efeitos visíveis, encerramento limpo e interrupção do furacão verificadas. |
| Sincronização | Cinco cenários e todas as sete magias novas recebidos pela TV; dano/cura, seleção do atacante e privacidade preservados. Queda após impacto fatal de furacão verificada nas duas janelas. |
| Persistência | Cenário após recarga, exportação de backup e restauração real pela interface passaram. |
| Movimento reduzido | Cena sem animação ambiental quando solicitado pelo sistema; comportamento de acessibilidade preservado. |
| Limpeza | 25 trocas de cenário sem duplicar camadas ou participantes. Efeitos encerram sem tweens residuais. |
| Desempenho | 20 participantes, cenário móvel e furacão; 150 intervalos: mediana 16,7 ms (~60 fps), p95 20,6 ms, nenhum intervalo acima de 50 ms nesta execução. |
| Regressões | `platform-core`, `library-expansion`, `battle-catalog-audit`, `battle-teams-audit` e `battle-life-unit` passaram. |
| Regressões no navegador | `combat-tv-browser`, `battle-life-browser` e `library-browser` passaram: queda/cura/desfazer, falas, seleção, edição de biblioteca, cópias, imagens em backup e preservação das quatro fichas. |
| Rede/console | Nenhum erro de página, recurso ausente ou acesso externo nas auditorias finais. |

## Evidências reais

- [Mordor anterior, 4.3](qa-arena-enrichment/mordor-1366-4v4.png) e [Mordor atual](qa-animation-magic/mordor.png).
- [Elenya no quadro de ataque completo](qa-animation-magic/elenya-pose-2.png).
- [Furacão](qa-animation-magic/spell-hurricane.png), [meteoro](qa-animation-magic/spell-meteor.png), [onda](qa-animation-magic/spell-tidal.png) e [nevasca](qa-animation-magic/spell-blizzard.png).
- [Interface do mestre](qa-animation-magic/full/master-1366.png) e [TV sem controles](qa-animation-magic/full/tv-1366.png).
- [Vinte participantes](qa-animation-magic/full/fangorn-1280-10v10.png).
- As pranchas `frames-00.png` até `frames-72.png` em `qa-animation-magic/` documentam as quatro poses de todas as entidades. Foram inspecionadas; fundos residuais encontrados durante a produção foram corrigidos antes da integração final.
- [Auditoria de arquivos](qa-animation-magic/frame-audit.json), [auditoria completa do navegador](qa-animation-magic/full/browser.json), [efeitos](qa-animation-magic/spells.json), [TV](qa-animation-magic/tv/report.json), [ciclo de vida](qa-animation-magic/life/report.json) e [biblioteca](qa-animation-magic/library/browser.json).

O acabamento final do meteoro e da onda foi validado novamente pela suíte de efeitos após a auditoria completa. As capturas `spell-*.png` mostram essa última revisão.

## Limites

- O desempenho medido é desta máquina e desta execução, não uma garantia para todas as GPUs. Não houve teste presencial em macOS, Safari ou TV física; as duas janelas foram verificadas no mesmo navegador Windows.
- Não foram produzidos instaladores. A atualização usa os inicializadores existentes e arquivos locais.
- As sequências possuem quatro poses desenhadas, combinadas com movimento do renderer. Não são animações esqueléticas 3D.
- Cadastros personalizados sem vínculo com uma miniatura não ganham arte automaticamente. Cópias vinculadas herdam a animação. Os quatro NPCs narrativos preparados mantêm a elegibilidade anterior.
- A expansão é visual; não concede automaticamente essas magias às fichas nem muda suas regras.

## Arquivos e recuperação

Código: `js/battle-pixi.js`, `js/battle-magic.js`, `js/battle-catalog.js`, `js/battle-environment.js`, `js/battle-arena.js`, `js/battle-display.js`, `data/combat-animations.js` e entradas HTML. Arte: `assets/animation-frames/v4.4/`, `assets/battle-scenes/v4.4/`. Ferramentas, testes e documentação acompanham a versão; a procedência inclui referências, prompts e hashes.

Checkpoint anterior às alterações: tag `checkpoint-before-animated-catalog-4.4.0`, commit `7584dd2`. Nenhum histórico foi reescrito. Para visualizar a atualização, recarregue o mestre e a TV com F5 e abra **Mesa → Combate**.
