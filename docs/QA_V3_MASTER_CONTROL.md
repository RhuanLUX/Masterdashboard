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

## Limitação de ambiente

O servidor local ocupado na porta 41731 recusou conexões da sandbox de validação. Por isso, o teste de navegador automatizado não pôde ser concluído neste ambiente; os testes de sintaxe e regras locais acima foram concluídos com sucesso.
