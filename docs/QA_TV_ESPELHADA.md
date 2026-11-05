# TV espelhada — correção 4.1.2

2026-11-05. Checkpoint anterior: `checkpoint-before-tv-mirror-2026-11-05` em `75ee861`. Nenhum instalador gerado.

## Falha encontrada

A TV usava o payload antigo de apresentação, que incluía por padrão apenas os quatro personagens. Inimigos precisavam de uma flag de revelação. O mesmo filtro descartava qualquer animação cujo atacante ou alvo não estivesse nesse subconjunto. Por isso o mestre via o inimigo e executava um ataque, enquanto a TV não exibia nem o inimigo nem o efeito.

O QA anterior explicitamente revelava o inimigo antes de testar. Esse preparo mascarava o cenário real dos encontros existentes. O teste de regressão agora marca o inimigo como oculto de propósito.

## Correção

- `mirrorPayload` transmite os descritores visuais de **todos** os participantes da arena do mestre e os IDs de atacante/alvo. O payload antigo filtrado permanece isolado para compatibilidade, sem ser usado pela TV.
- Os efeitos da TV são validados contra o elenco completo do encontro. Flags antigas de revelação não descartam animações.
- Selecionar outro alvo atualiza seu indicador na TV mesmo antes do ataque.
- O texto do efeito é o mesmo da arena do mestre. Campos privados de ficha, PV/CA, notas e histórico continuam fora dos pacotes.
- O botão de ocultar/revelar alvo foi retirado da arena espelhada.
- Controles ficam desabilitados durante o carregamento inicial dos sprites e são liberados após o vínculo dos eventos. Isso evita seleções feitas antes de os handlers estarem prontos.

## Verificação

O teste `tests/combat-tv-browser.cjs`, em perfil isolado e com requisições externas bloqueadas, passou com:

- inimigo explicitamente marcado como oculto no save, presente na TV com os mesmos cinco IDs do mestre;
- flecha e quatro magias contra esse inimigo, chegando ao renderer da TV;
- efeitos Pixi temporários realmente presentes, não apenas mensagens recebidas;
- atacante/alvo, próximo turno manual e seleção após recarregar;
- arena sem controles e sem dados privados;
- dimensões 1920×1080, 1366×768 e 1280×800;
- testes anteriores de dano sem troca de atacante, temas e funcionamento offline.

[Relatório](qa-tv-mirror/report.json) · [TV em 1366](qa-tv-mirror/tv-1366.png) · [Mestre em 1366](qa-tv-mirror/master-1366.png).

Regressões adicionais executadas:

- [Equipes e composição](qa-tv-mirror/teams/report.json): 66 verificações de arte e 21 composições/resoluções, mudança de equipe refletida na TV sem recriar o canvas, quantidade de participantes, ataque na mesma equipe, recarregamento e backup.
- [Catálogo](qa-tv-mirror/roster/report.json): 29 entidades, 35 seleções, mesma identidade/arte nas duas janelas, recuperação de asset ausente, persistência e restauração.
- [Efeitos](qa-tv-mirror/effects/report.json): 30 casos, flecha e quatro magias nos dois sentidos e três resoluções, sincronização, limpeza e ausência de PV privados.
- Núcleo de equipes e contrato de backup passaram. Os testes antigos de interface foram adaptados ao menu Mesa, aos diálogos atuais e à remoção da etapa de revelação. A comparação de backup normaliza os aliases legados dos participantes antes de capturar o estado esperado.

Também houve inspeção nas duas janelas reais do proprietário no **DuckDuckGo/Windows**. As duas foram recarregadas, o combate existente foi retomado e a Criatura de Aglor passou a aparecer na TV. Uma magia de gelo com dano 0 foi confirmada pelo mestre e observada visualmente chegando à criatura na TV. Não se alteraram PV ou turno. O inimigo já estava em 0/24 PV antes do teste, por isso o sprite permanecia escurecido nas duas arenas. As capturas nativas dessa conferência estão na conversa; as imagens versionadas usam somente os dados isolados do teste.

Sem nova validação em macOS nesta rodada. OWNER UAT não é declarado aprovado.
