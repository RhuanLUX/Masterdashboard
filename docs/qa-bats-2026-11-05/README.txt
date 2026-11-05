Halloween — refinamento dos morcegos, 05/11/2026

Silhueta SVG original local: corpo, orelhas, cauda, membranas recortadas e
nervuras discretas. Asas articuladas separadas do espelhamento e do percurso.
Corrigida a inversão de 180 graus nos voos vindos da direita e a deformação
causada pelo keyframe CSS compartilhado dos pseudo-elementos antigos.
Percursos quadráticos com 33 amostras, curvas suaves, inclinação limitada,
variação de profundidade e batimentos em fases independentes.
Preservados frequência, grupos, limite de população e pointer-events:none.
Timers de aparição são retirados da lista após execução. Pausa da aba agora
interrompe também as asas. Nada foi alterado no combate ou nos dados da campanha.

QA real: tests/halloween-bats.cjs before / after, Edge headless no Windows,
armazenamento isolado. Comparação visual dos quatro momentos das asas e da UI.
PASS: clique através da camada, 33 keyframes por voo, limite de 14 na intensidade
normal, remoção ao terminar, remoção ao trocar tema, inverno e movimento reduzido.
Capturas em 1366x768, 1920x1080 e 1280x800. Zero erros de página.
macOS/Safari não executados nesta máquina. Aprovação estética final é do usuário.

before-wing-phases.png e after-wing-phases.png ampliam os mesmos elementos reais
para inspecionar a anatomia. Não representam seu tamanho normal na interface.
