# QA — Mesa de Dados 3D

Data: 12/10/2026  
Escopo: somente a aba **Dados**. A História 5, o leitor em pergaminho A4, fichas, galeria e a navegação foram mantidos fora desta alteração.

## Ambiente validado

- Aplicação servida localmente em `127.0.0.1` pelo inicializador do projeto.
- Mesa física: Dice Box 1.1.4, copiado para `vendor/dice-box/package/`.
- Sem CDN, APIs, fontes ou chamadas de rede externas em tempo de execução.

## Resultado da auditoria

| Verificação | Resultado |
| --- | --- |
| Canvas 3D e física carregados localmente | Aprovado |
| d4, d6, d8, d10, d12, d20 e d100 | Aprovado |
| d100 com dois d10 e regra 00 + 0 = 100 | Aprovado |
| Bônus positivo | Aprovado: d20 9 + 5 = 14 |
| Bônus negativo | Aprovado: d12 8 - 3 = 5 |
| Quantidade do dado selecionado | Aprovado: 3d20 = 4 + 6 + 12 = 22 |
| Combinação livre | Aprovado: 1d4 + 2d6 + 1d8 = 1 + 6 + 1 + 3 = 11 |
| d100 em combinação | Aprovado: 48 + 8, mais d6 6 = 62 |
| Persistência após recarregar | Aprovado: histórico e bônus restaurados |
| Histórico limitado e limpo pelo comando próprio | Aprovado |
| Sons condicionados à configuração local | Aprovado por inspeção do fluxo de eventos |
| Som de mesa | Aprovado por inspeção: cascata inicial, impactos por dado estabilizado e impacto final; síntese local, sem arquivo ou rede externa |
| Regressão estática do projeto | Aprovado: `node test/verify.js` |

## Bateria física

Foram executadas 30 rolagens físicas distribuídas pelos sete tipos (duas passagens completas, com d20 adicional), mais duas rolagens de bônus. Todas se estabilizaram no canvas e produziram resultados dentro do intervalo válido. A duração observada por lançamento ficou aproximadamente entre 1,0 s e 4,2 s, conforme o dado e a simulação física.

Também foi verificado explicitamente um d100 exibindo `Percentual: 02 + unidade 1` e `Resultado final: 3`.

## Capturas reais

As capturas de QA foram feitas no navegador local durante esta validação: estado inicial da mesa e d20 físico concluído (face superior 13, resultado 13). O canvas expôs uma malha 3D acessível como `dice-canvas-*`; não há imagem estática usada para simular o dado.

## Correção adicional encontrada durante QA

O campo de bônus tinha escuta somente em `change`, o que permitia perder um valor recém-digitado antes de uma rolagem. A gravação agora ocorre em `input` e `change`; os testes +5 e -3 acima confirmam a correção.
