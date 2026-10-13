# QA — d100 percentual

Data: 13/10/2026  
Ambiente: servidor local offline, navegador Chromium, mesa 3D local.

## Cálculo aplicado

Cada `d100` consome dois d10 físicos, sempre nesta ordem:

1. primeiro d10: dezenas (`00`, `10`, …, `90`);
2. segundo d10: unidades (`0` a `9`).

O valor bruto é `dezenas + unidades`, exceto `00 + 0`, que representa `100`.
O bônus somente é somado depois desse valor percentual. Portanto, o d100 bruto permanece sempre entre 1 e 100.

Ao iniciar, o aplicativo remove somente entradas antigas de histórico que contêm `d100` sem o detalhamento de dezenas/unidades. Esses registros foram produzidos pelo cálculo anterior e não podem ser corrigidos com segurança; os demais registros são preservados.

## Testes automatizados

Executado com `node tests/d100-regression.cjs`:

| Caso | Resultado |
| --- | --- |
| `00 + 0` | aprovado: `100` |
| `00 + 7` | aprovado: `7` |
| `30 + 0` | aprovado: `30` |
| `40 + 6` | aprovado: `46` |
| `90 + 9` | aprovado: `99` |
| 20 rolagens percentuais determinísticas | aprovado: todas entre 1 e 100 |
| Bônus `+2` após `40+6=46` | aprovado: final `48` |
| Bônus `-3` após `40+6=46` | aprovado: final `43` |
| Combinação `d100 + d6 + d8` | aprovado: componentes somados separadamente |

## Testes na interface

| Cenário | Resultado |
| --- | --- |
| Selecionar d100 | aprovado: legenda mostra `1º d10: dezenas` e `2º d10: unidades` |
| Rolagem 3D d100 com bônus `+2` | aprovado: resultado real exibiu `d100: 80 + 5 = 85`, final `87` |
| Histórico da mesma rolagem | aprovado: `1d100 (d100 80 + 5 = 85) +2 = 87` |
| Combinação `1d100 + 1d6 + 1d8` com bônus `-3` | aprovado: detalhamento e histórico exibidos sem valores percentuais inválidos |
| Rolagem 3D de regressão `1d6` | aprovado: `d6: 6`, final `6` |
| Reabrir a mesa após as rolagens | aprovado: histórico percentual e detalhamento permaneceram salvos localmente |
| d4, d6, d8, d10, d12 e d20 | preservados: a rota de rolagem dos demais dados não foi alterada |

Os testes de sintaxe de `app.js`, `dice3d.js` e `dice-logic.js`, além de `git diff --check`, também foram aprovados.
