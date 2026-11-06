# Visitantes dos cenários — 4.4.1

Abra **Mesa → Combate** e escolha o cenário. As passagens acontecem automaticamente
ao fundo, também na **TV de combate**. Atualize ambas as janelas com **F5**.

| Cenário | Aparições |
| --- | --- |
| Mordor | Dragão distante e bandos de corvos |
| Fangorn | Corujas, cervos e corvos |
| Valfenda | Águias, ocasionalmente em par, e corujas |
| Estrada Real | Caravana na ponte, cervos e corvos |
| Hrim | Águias, dragão e corvos |

Cinco sequências novas somam **20 PNGs individuais**, quatro poses por visitante.
A arte segue a linguagem pixel art da arena. As asas, patas e passos se movem;
o corpo mantém registro próprio em cada quadro, sem esticar ou recortar uma faixa
de imagens durante a animação. O dragão existente foi preservado. A caravana
substitui a pequena carroça anteriormente desenhada por formas geométricas.

As passagens duram aproximadamente 11–21 segundos, com intervalos variáveis e
pausas. A agenda usa a identidade do encontro e o relógio compartilhado pelo
mestre e pela TV: abrir outra janela não reinicia a sequência. Direção, altura,
fase das asas, tamanho e formação variam. Há no máximo cinco visitantes ao mesmo
tempo, sempre na camada intermediária, atrás dos combatentes. Não recebem cliques
e desaparecem quando o sistema solicita **reduzir movimento**.

## Verificação executada

Em 6 de novembro de 2026, no Windows com Edge/Playwright e PixiJS local:

- **20 imagens**: dimensões, transparência, margens, hashes, âncoras e quatro poses
  distintas por sequência; inspeção da prancha e das capturas reais.
- **Três horas simuladas por cenário**: todas as espécies previstas apareceram,
  nos dois sentidos, com 152 intervalos distintos no conjunto testado; a cena
  permaneceu sem visitantes por aproximadamente 67–73% do tempo.
- **12 combinações visuais**: seis tipos, cada um nos dois sentidos, com os quatro
  quadros percorridos; escala proporcional e camadas sem interação.
- **Cinco cenários na TV real**: mesmos visitantes, fase, posição normalizada,
  direção e transparência do mestre, usando a janela pública do aplicativo.
- **Ataque durante passagem**: Furacão reproduzido na TV, dano aplicado corretamente
  e atacante mantido. A regressão existente validou também fogo, gelo, eletricidade,
  mísseis, flecha, seleção, próximo turno, recarga e privacidade.
- **1920×1080, 1366×768 e 1280×800**: capturas do mestre e da TV, sem erros no
  diagnóstico de composição dos combatentes.
- **25 trocas de cenário**: nenhuma acumulação de camadas de visitantes; 20
  combatentes preservados.
- **Desempenho**: 20 combatentes, cinco corvos e Furacão; 150 intervalos do ticker
  medidos. Valores exatos na seção `performance` do relatório do navegador.
- **Offline**: solicitações externas bloqueadas durante os testes; nenhuma
  solicitação externa, erro de JavaScript ou asset ausente.
- **Persistência**: teste central de migração, validação de backup, gravação
  atômica, serialização e recuperação passou; seleção após recarregar também.

Evidências: [navegador](qa-ambient-visitors/browser.json),
[agenda de três horas](qa-ambient-visitors/schedule.json),
[imagens](qa-ambient-visitors/assets.json),
[regressão da TV](qa-ambient-visitors/combat-tv-regression.json),
[quadros registrados](qa-ambient-visitors/frames-registered.webp),
[caravana na ponte](qa-ambient-visitors/road-caravan.webp) e
[TV de combate](qa-ambient-visitors/tv-1366.webp).

## Arquivos e limites

`js/battle-ambience.js` contém a agenda e o renderer dos visitantes.
`js/battle-environment.js` integra a camada ao cenário existente. Os dois HTMLs
do aplicativo carregam `data/ambient-frames.js` e o novo módulo. Arte em
`assets/battle-scenes/visitors/v4.4.1/`, com [procedência e prompts completos](../assets/battle-scenes/visitors/v4.4.1/provenance.json).
Ferramenta de separação: `tools/prepare-ambient-frames.cjs`. Testes:
`tests/ambient-assets.cjs`, `tests/ambient-visitors.cjs` e
`tests/ambient-visitors-browser.cjs`.

Não houve alteração de regras, PV, CA, fichas, dados, aventuras ou formato dos
backups. Nenhum instalador foi gerado. O macOS físico e uma TV física não foram
testados nesta rodada; o código continua sendo JavaScript/PixiJS e assets locais.
A medição de desempenho é específica deste ambiente, não uma garantia para todo
hardware. A revisão do proprietário continua sendo o aceite final.

Checkpoint anterior: `checkpoint-before-ambient-4.4.1`, commit `5763726`.
