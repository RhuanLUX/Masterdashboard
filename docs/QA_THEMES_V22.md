# QA — Temas globais V2.2

Data: 13/10/2026  
Ambiente: servidor local offline (`127.0.0.1`), navegador Chromium, viewport desktop de 1280 px.

## Verificações executadas

| Cenário | Resultado |
| --- | --- |
| Sintaxe de `js/app.js` e `js/theme-manager.js` | Aprovado (`node --check`) |
| Espaços e patch inválido | Aprovado (`git diff --check`) |
| Tema Normal selecionado manualmente | Aprovado: efeitos ocultos e rótulo atualizado |
| Tema Terror selecionado manualmente | Aprovado: névoa/pumpkin ativados, sem bloquear cliques |
| Persistência do tema manual após recarregar | Aprovado: Terror permaneceu selecionado |
| Abrir Aventura 3 | Aprovado: troca automática para Natal / Inverno e neve visível |
| Abrir Aventura 2 após a Aventura 3 | Aprovado: retorno automático para Normal |
| Tema invernal nos módulos História, Aventuras, Jogadores, Dados, LOFI, Configurações, Imagens, Criaturas, Mapas, Regras e Documentos | Aprovado: o mesmo tema permaneceu ativo em todos |
| Rolagem de d20 com neve ativa | Aprovado: resultado e histórico gerados; camada de efeitos com `pointer-events: none` |
| Console do navegador | Aprovado: nenhum aviso ou erro encontrado |
| Visibilidade do seletor no desktop | Aprovado: botão visível no canto superior direito em 1280 px |

## Cobertura técnica implementada

- Neve em um único canvas, com `requestAnimationFrame`, pool limitado de partículas e pausa por `visibilitychange`.
- `prefers-reduced-motion` impede a criação/animação de flocos; a folha de estilos também desativa animações não essenciais.
- Camadas temáticas são decorativas (`pointer-events: none`) e ficam abaixo de modais.
- Não há dependência de rede, scripts remotos ou novos assets para as ambientações.

## Limites deste ciclo

O comportamento de aba realmente oculta, a preferência de movimento reduzido do sistema operacional e o uso contínuo por muitas horas foram implementados no código, mas não foram emulados manualmente neste navegador durante esta sessão de QA. Devem ser rechecados em validação de aceite nos sistemas Windows e macOS.
