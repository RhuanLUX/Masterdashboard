# QA — Biblioteca ampliada 4.2.0

Data: 6 de novembro de 2026. Checkpoint anterior: `checkpoint-before-library-expansion-2026-11-06`, commit `8ec7811`.

## Resultados observados

| Verificação | Resultado |
| --- | --- |
| 42 fichas, IDs únicos, valores básicos e referências de magias | Passou |
| 42 imagens individuais de entidades, sem arquivos repetidos por hash | Passou |
| 54 artes locais existentes, aproximadamente 4,03 MiB | Passou |
| 12 classes, 48 descrições de subclasses, 36 magias | Passou |
| Cadastros anteriores preservados após carregar o pacote | Passou |
| 42 vínculos com combate: identidade, PV, CA, dano, imagem | Passou |
| NPCs no grupo de NPCs, sem duplicação na seleção | Passou |
| Busca por acento, classe, efeito; filtro de ND | Passou |
| Favoritos entre categorias | Passou |
| Editar nome/PV/notas; sincronizar galeria | Passou |
| Cancelar cópia, salvar cópia, arquivar | Passou |
| Editar magia; localizar pela busca global e abrir origem | Passou |
| Fechar/reabrir a página mantendo dados | Passou, IndexedDB em perfil isolado |
| Exportar JSON, alterar dados, restaurar exportação | Passou |
| Importar retrato WebP na ficha e incluir imagem no backup | Passou |
| Iniciativa do novo NPC copiada para o encontro | Passou |
| Rejeitar estruturas inválidas de magia/favoritos em backup | Passou |
| Novos aliado/inimigo junto aos quatro jogadores na arena/TV | Passou |
| Notas privadas ausentes do payload da TV e da tela pública | Passou |
| Quatro fichas de jogadores idênticas antes/depois | Passou |
| 1920×1080, 1366×768, 1280×800 | Sem overflow horizontal; capturas reais |
| Requisições externas durante navegação da biblioteca | Zero; bloqueadas pelo teste |
| Erros JavaScript ou arquivos HTTP ausentes | Zero |

## Testes executados

- `node tests/library-expansion.cjs`
- `node tests/library-browser.cjs`
- `node tests/platform-core.cjs`
- `node tests/battle-catalog-audit.cjs`
- `node tests/battle-teams-audit.cjs`
- `node tests/dialogue-library.cjs`
- `node tests/combat-tv-browser.cjs`

A regressão da TV confirmou sincronização de alvos, ataques à distância, quatro efeitos mágicos, participantes com flags antigas de ocultação, preservação de seleção após dano/reload, turno somente por comando e ausência de informações privadas. As simulações do banco de falas continuam sem repetição em três horas.

## Evidências

Os JSONs de resultados e as capturas estão em `qa-library-expansion/`:

- `browser.json`: teste funcional da biblioteca.
- `npcs-1920.png`, `npcs-1366.png`, `npcs-1280.png`: layout nos três tamanhos.
- `subclasses.png`, `magias.png`, `magia-detalhe.png`, `ficha-detalhe.png`: referências e consulta.
- `combate.png`, `tv.png`: novos registros junto à companhia.
- `combat-regression/report.json` e respectivas capturas: regressão dos efeitos e espelhamento.

As capturas da biblioteca, classes, magia e TV foram inspecionadas. Também foi feita inspeção de contato das artes e ajuste de nomes, descrições e equipamento quando havia divergência com a ilustração (por exemplo, o mestre de armas draconato e o feiticeiro de aparência glacial). As páginas de detalhes possuem rolagem interna; capturas mostram a porção visível, não a totalidade do texto.

## Limites da verificação

- Navegador testado: Edge/Chromium no Windows, perfil novo e servidor local isolado. Não houve teste físico de macOS/Safari nesta rodada, nem produção de instaladores.
- A persistência foi verificada ao fechar/reabrir páginas e restaurar backup; não se reiniciou o sistema operacional.
- Os novos modelos autorais não são fichas oficiais de D&D nem resultado de um simulador de balanceamento. A identificação de sistema e o ajuste manual são explícitos.
- O guia cobre opções de classes/subclasses; não implementa criação/progressão automática de personagens até nível 20.
- As novas entidades usam retratos estáticos na arena, não sprites 16-bit inéditos. Isso está indicado no detalhe antes de adicionar ao combate e registrado nas capturas. A arte da companhia e demais sprites anteriores não mudou.

Status: testes técnicos acima concluídos; avaliação de gosto visual e balanceamento permanece com o mestre. Não se declara OWNER UAT APPROVED.
