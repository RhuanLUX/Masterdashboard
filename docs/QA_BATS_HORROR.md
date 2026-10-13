# QA — Bando de morcegos do tema Terror

Data: 13/10/2026  
Ambiente: servidor local offline, navegador Chromium.

## Resultado

- O tema Terror cria surtos aleatórios a cada 540–1320 ms.
- Cada surto contém um morcego ou, ocasionalmente, grupos de 2 a 4.
- As rotas usam três pontos aleatórios, com travessias horizontais, diagonais e curvas.
- Escala, opacidade, duração, ângulo, direção e velocidade de asas variam por morcego.
- Cerca de 19% são morcegos próximos, maiores e temporariamente acima dos painéis.
- O limite de 14 morcegos ativos mantém a camada leve.

## Verificações executadas

| Cenário | Resultado |
| --- | --- |
| Tema Terror ativo por 2,6 s | aprovado: 9 morcegos ativos, incluindo tamanhos próximos |
| Rotas independentes | aprovado: matrizes de transformação distintas para todos os morcegos visíveis |
| Renovação após 3,4 s | aprovado: 8 → 10 morcegos; posições alteradas; limite respeitado |
| Interações | aprovado: camada e bando usam `pointer-events: none` |
| Sair do tema Terror | aprovado: morcegos removidos e camada ocultada |
| Console | aprovado: sem avisos ou erros |

`prefers-reduced-motion` e aba oculta impedem novos surtos; ao retornar à aba, o bando recomeça sem reutilizar trajetórias antigas.
