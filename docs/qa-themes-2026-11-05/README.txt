TRÊS NOVOS TEMAS — 05/11/2026

Castelo Medieval: vinho e bronze, pequenos estandartes heráldicos nas margens,
tochas e poeira dourada. Reino dos Dragões: obsidiana e cobre, brasas, luz baixa
e silhueta de dragão planando ocasionalmente. Bosque Élfico: verde profundo,
prata esverdeada, lua crescente, arabescos e vaga-lumes.

Referências visuais consultadas (não copiadas/downloadadas):
https://www.metmuseum.org/art/collection/search/467528
https://www.tolkienestate.com/painting/the-hobbit/
Arte decorativa original em SVG/CSS local. Sem bibliotecas, APIs ou assets remotos.

Uso: menu Tema no topo. Os nomes completos ficam na lista; os rótulos do botão
são abreviados para não invadir os outros controles. Também disponíveis em
Mestre > Temas > Tema por aventura. Intensidade e pausa usam os controles existentes.
Nenhuma aventura teve seu tema padrão substituído automaticamente.

Persistência usa o estado/backup existente. Catálogo de nomes compartilhado entre
o motor e os dois seletores, evitando listas divergentes. Normal, Inverno e
Halloween preservados. Pergaminho, canvas de combate, sprites e regras intactos.

QA: tests/ambience-themes.cjs, navegador Edge isolado, Windows.
PASS: três seleções pela UI, recarga, exportação/importação real de backup,
associação por aventura, intensidade (10/18/30 partículas), pausa/retomada,
limpeza na troca de temas, regressão de Halloween/Inverno, movimento reduzido.
Capturas em 1366x768, 1920x1080 e 1280x800. Tráfego externo bloqueado durante QA;
nenhuma requisição externa e nenhum erro de página. Dados pessoais não usados.
Na revisão visual os ornamentos foram reduzidos às margens para não cobrir texto.

Limitações: macOS/Safari não executados nesta máquina. Aprovação artística é do
proprietário. Checkpoint: checkpoint-before-three-themes-2026-11-05.
