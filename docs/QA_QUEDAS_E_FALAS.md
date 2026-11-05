# Quedas e falas de combate — 4.1.3

2026-11-05. Checkpoint: `checkpoint-before-battle-life-2026-11-05`, anterior à mudança. Nenhum instalador gerado.

## Implementação

- O renderer Pixi detecta a transição para zero PV, aguarda o impacto e anima a queda durante 900 ms, com poeira discreta. Mede a silhueta do frame, ajusta a rotação/escala à própria posição e mantém o corpo apoiado na mesma superfície. Não troca os sprites existentes.
- A pose caída permanece nos snapshots, atualizações, redimensionamento e recarregamento. Cura e desfazer restauram a pose em pé. Condições de inconsciência sem zero PV continuam apenas atenuadas, sem serem reinterpretadas como morte.
- Atualizar PV não reconstrói mais a arena depois de cada ação. Isso preserva as quedas, balões e seleção. O formulário de dano/rolagem continua sendo limpo depois de confirmar, evitando reutilizar uma confirmação pendente.
- `battle-life.js` escolhe falas e horários apenas no mestre. Intervalos de 28–65 segundos, vozes de heróis/adversários/feras, reação ao dano com 55% de chance, intervalo mínimo de 10 segundos, memória das últimas oito frases e alternância de falante quando possível. Sem áudio, APIs ou novas regras.
- A TV recebe somente estado visual de derrota e eventos de fala. Continua sem acesso a PV/CA, fichas ou notas privadas. A mesma frase é desenhada pelo mesmo renderer, sem sorteio independente na TV.

## Testes executados

- `tests/battle-life-unit.cjs`: simulação determinística de dez minutos, com 12 falas e intervalos variados dentro dos limites; ambos os lados falam; nenhuma fala de derrotados; sem repetição consecutiva; reação ao dano, pausa, exclusão de quem cai antes de falar, silêncio em preparação/encerramento e ausência de mutação do combate.
- `tests/battle-life-browser.cjs`: navegador Edge/Windows, perfil isolado, requisições externas bloqueadas. Ataque fatal com magia e queda nas duas janelas, cura, dano pelo diálogo real do gerenciador, desfazer, seleção/turno preservados, fala de medo, fala periódica sincronizada, limpeza do balão, recarregamento sem repetir morte e movimento reduzido. O relógio do diretor foi adiantado no teste das falas periódicas; animações Pixi e comunicação entre janelas usam seus temporizadores reais.
- Doze composições com corpos caídos: 4×1, 4×4, 4×8 e 4×16 nas dimensões 1920×1080, 1366×768 e 1280×800. As bordas reais da silhueta transformada foram medidas: sem recorte, sem interseções entre corpos e contato com o solo dentro de um pixel. Nenhum tween residual.
- Regressão da TV: inimigo marcado como oculto no save continua presente, flecha e quatro magias sincronizadas, próximo turno manual, seleção persistente, privacidade, temas e uso offline.
- Regressão de efeitos: 30 casos de flecha/fogo/gelo/eletricidade/mísseis nos dois sentidos e três resoluções, limpeza, cancelamento e movimento reduzido.
- Regressão de catálogo/equipes: 66 verificações das artes em ambas as orientações e 21 composições; início da queda, transferência entre equipes, sincronização, persistência e restauração de backup sem erros.
- Núcleo da plataforma: contratos de backup, persistência, recuperação e equipes sem regressões.

[Relatório principal](qa-battle-life/report.json) · [TV](qa-battle-life/tv-regression/report.json) · [Efeitos](qa-battle-life/effects-regression/report.json) · [Equipes e catálogo](qa-battle-life/teams-regression/report.json).

Capturas reais do navegador de teste: [queda em andamento](qa-battle-life/fall-midpoint.png), [corpo no chão](qa-battle-life/fallen-tv.png), [reação ao dano](qa-battle-life/damage-speech.png), [encorajamento](qa-battle-life/courage-tv.png), [vinte participantes caídos](qa-battle-life/twenty-fallen.png).

## Limites

A queda reutiliza cada sprite com transformação e assentamento no solo; não é uma nova sequência desenhada de morte para cada entidade. Não adiciona regra de morte permanente. A atualização usa HTML/JS/Pixi locais, mas esta rodada foi executada em Windows; macOS não foi revalidado. Nenhum teste alterou a campanha do usuário. OWNER UAT permanece com o proprietário.
