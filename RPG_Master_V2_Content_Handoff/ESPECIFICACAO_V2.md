# ESPECIFICAÇÃO OFICIAL | RPG MASTER V2: PLATAFORMA DE CAMPANHA

**Objetivo:** evoluir o aplicativo existente, preservando o que já foi aprovado, com biblioteca de aventuras, LOFI, atlas de mapas, compêndio de regras e documentos narrativos. Esta é uma evolução incremental do código atual, NÃO um produto novo.

## 0. Principais decisões do proprietário

- PRIORIDADE: funcionalidade da plataforma, organização de conteúdo e preservação de dados. **Animações/GIFs/sprites não fazem parte deste ciclo**.
- Design atual: APROVADO = FROZEN. Estética medieval dark fantasy, azul-marinho profundo, molduras e botões rústicos estilo Diablo II, texto claro, detalhes dourados. A História 5 possui folha de pergaminho A4 centralizada, navegação lateral ampliada em 50% e rolagem independente. Não redesenhar essas telas.
- O módulo DADOS (d4, d6, d8, d10, d12, d20, d100) já foi concluído pelo proprietário. **Preservar a versão atual e não refazê-lo**, salvo bug comprovado de integração.
- As quatro fichas editáveis, PV, inventários, galeria, backups, comportamento offline e entrada por duplo clique devem permanecer funcionais.
- Compatibilidade: Windows 10/11 e macOS Intel/Apple Silicon, sem CDN ou APIs em runtime. Links externos do YouTube são exceção acionada pelo usuário.
- A fonte de verdade para mecânicas próprias da campanha é o documento **D20 Simplificado.docx**, complementado por **Resumo Técnico.docx**. O master prompt e o HTML da ficha do Claude NÃO são autoridades sobre regras desta campanha. Não aplicar D&D 5E 2014 automaticamente.
- Rigor narrativo: não inferir que um roteiro planejado foi integralmente jogado. Um documento possui observações sobre cenas não executadas. Preservar e apresentar como nota de origem quando necessário.

## 1. Pré-flight obrigatório, sem sobrescrever

1. Inspecionar o projeto real atualmente aberto no Codex: `ABRIR_RPG.html`, `index.html`, CSS, JS, assets, modelos de dados, armazenamento e inicializadores. Nunca assumir que a cópia de referência antiga corresponde à versão mais recente.
2. Ler `README_COMECE_AQUI.md`, `MANIFEST.json`, este documento e os originais do pacote.
3. Criar um checkpoint de código e verificar possibilidade de restaurar. Não limpar nem migrar de modo destrutivo os dados salvos no navegador. Orientar o proprietário a exportar backup antes de alterar o esquema.
4. Fazer inventário de rotas/abas e chaves de persistência existentes. Conferir se os módulos História 5, Personagens, Dados, Imagens e Configurações continuam disponíveis.
5. Gerar relatório de eventuais ambiguidades sem travar todo o desenvolvimento em assuntos não críticos.

## 2. Arquitetura de conteúdo e integridade

Separar **fontes originais imutáveis**, **conteúdo convertido para apresentação** e **estado editável do usuário**.

- Originais permanecem na pasta `originais` ou área de assets de conteúdo. Não corrigir seus textos.
- Conteúdo dos DOCX e do PDF pode ser pré-processado em tempo de build, preservando ordem, títulos, subtítulos, parágrafos, listas e tabelas. Não descartar capítulos, notas, termos, diálogos, cenas ou desfechos.
- Para funcionar via `file://`, não depender de `fetch()` de JSON externo nem de bibliotecas remotas. Preferir dados pré-empacotados em JS, ou um inicializador local simples compatível com ambos os sistemas, mantendo duplo clique.
- Estado local com migração de esquema versionada. O conteúdo inicial (aventuras, compêndio) não deve ocupar LocalStorage desnecessariamente. Para grandes importações, imagens e cópias editáveis, usar armazenamento apropriado e backup consistente.
- Na importação de conteúdo, utilizar ID estável, hash de origem, versão e proteção contra duplicatas. Se o arquivo já existir, oferecer atualizar ou manter ambas as versões; nunca sobrescrever silenciosamente.
- Ao trocar a aventura ativa, não retroceder PV, inventários, atributos ou estado atual das fichas. Fichas são o estado corrente global da campanha; progresso de leitura e notas pertencem a cada aventura.
- Nome do bardo pode aparecer como Nando Serenata, Nando Serenato ou Elarion Dúnhir em originais diferentes. NÃO normalizar texto-fonte nem substituir um nome pelo outro sem aprovação. Permitir metadados/aliases e sinalizar diferenças.
- Renderizar apenas texto/HTML saneado, sem execução de scripts embutidos em documentos importados.

## 3. Biblioteca de Aventuras (módulo prioritário)

**Menu:** `Aventuras` no topo, seguindo design e interação dos botões já aprovados. A aba `História` continua levando à aventura atualmente selecionada.

**Catálogo inicial derivado dos originais, preservando os títulos próprios:**
1. `Aventura 1.docx`: abertura da campanha.
2. `aventura 2 - Crônica de Origem – “As Sombras de Tharbad”.docx`: roteiro de origem, com apontamentos históricos do mestre.
3. `aventura 3 - Crônica Invernal – O Azul que Caminha na Neve.docx`: especial invernal.
4. `aventura 4 - Crônica dos Três - Destinos Parte I_ A Marca e a Luz.docx`: parte I da crônica.
5. `Aventura 5.docx`: parte II, Floresta de Fangorn, **já publicada** no aplicativo. Não duplicar nem substituir os 1.060 blocos e 66 títulos já aprovados. Comparar e utilizar como evidência de integridade.

**Funções:**
- Listar aventuras com número, título, categoria, data (quando documentada), status editável (`Planejada`, `Em andamento`, `Concluída`), última abertura e descrição curta.
- Abrir aventura no leitor existente, com índice navegável por atos/cenas/subtítulos e busca por texto.
- Adicionar nova aventura por importação local e, opcionalmente, cadastro manual. Priorizar DOCX e TXT/MD. Se suportar PDF, usar processamento local confiável e indicar limitações; não anunciar importação PDF funcional sem testes reais.
- Editar metadados, ordem de exibição e notas do mestre, sem alterar o texto-fonte original. Arquivar/excluir aventuras adicionadas com confirmação e possibilidade de exportação prévia. Aventuras base incluídas devem exigir proteção contra remoção acidental.
- Persistir posição de leitura e favoritos por aventura, mantendo o pergaminho A4 como padrão para TODAS.
- Permitir separar `notas exclusivas do mestre` do texto exibível ao grupo.
- Se uma seção converter incorretamente (ex.: tabela, lista, fala com quebras relevantes), preservar o texto bruto e registrar a divergência para correção, não inventar a passagem.

## 4. LOFI (módulo pequeno e de baixa dependência)

- Adicionar botão `LOFI` no topo, no mesmo estilo de metal/madeira/bronze. Se não houver largura, usar grupo de menu responsivo, sem esmagar os botões atuais.
- Biblioteca CRUD local: nome/título, URL de vídeo ou playlist no YouTube, categoria/ambiente opcional, observações e ordem.
- Adicionar, editar, apagar com confirmação, pesquisar e abrir no navegador em nova aba/janela.
- Aceitar URLs HTTPS válidas de `youtube.com`, `www.youtube.com`, `music.youtube.com` e `youtu.be`, incluindo playlists. Impedir esquemas perigosos e usar `noopener,noreferrer` ao abrir.
- NÃO embutir o player, NÃO fazer download de áudio e NÃO exigir rede para abrir/editar a biblioteca. Somente o destino do link exige conexão.
- Os links participam do backup e da restauração.

## 5. Atlas / Mapas

Arquivos originais:
- `big-middle-earth-map.jpg`
- `map-middle-earth-50.jpg`
- `map-middle-earth-b.jpg`
- `mordor-map.jpg`
- `Cidades LOTR.pdf`, como referência de reinos e cidades

- Criar botão `Mapas`, coleção com nome, miniatura, categoria e pesquisa.
- Visualizador local em alta resolução: zoom (botões +/-, roda do mouse, limites), arrastar, enquadrar, reset, tela cheia, fechar/ESC. Não cortar informações cartográficas.
- O PDF Cidades LOTR fica acessível e pesquisável como compêndio textual; pode haver ligações entre cidades e mapas, mas não inventar coordenadas, fronteiras ou correspondências exatas.
- Não redesenhar mapas enviados, não trocar por imagens obtidas na internet e não remover bordas originais. Não usar Google Maps/OpenStreetMap ou tiles externos para este atlas.
- Suporte a anexar novos mapas locais futuramente, com importação e backup que contemple imagens de usuário ou mecanismo de exportação separado com alerta claro.

## 6. Regras / Compêndio

Arquivos:
- `D20 Simplificado.docx` (referência principal e extensa)
- `Resumo Técnico.docx` (consulta rápida)

- Botão `Regras`, painel pesquisável, índice por módulos e subtítulos, atalhos para fórmulas e tabelas.
- Preservar hierarquia, valores, modificadores, CDs, exceções, tabelas e regras caseiras **como estão nos documentos**. Não completar com conhecimento externo do D&D 5E, não corrigir sem autorização e não combinar edições.
- Oferecer acesso à versão integral e ao resumo; colocar uma etiqueta visual indicando fonte e capítulo.
- Integração com Dados: opcional, apenas atalhos ou ajuda textual nesta etapa. Não modificar o funcionamento ou a matemática do motor de dados previamente concluído.

## 7. Documentos / Biblioteca narrativa

Arquivos:
- `Carta Nando Serenata.docx`
- `Carta Elenya.docx`
- `Carta Calion.docx`
- `Item Lendário - Alaúde de Húrinel, O Eco da Esperança(1).docx`

- Criar biblioteca de documentos narrativos pesquisável, filtrável por personagem/tipo e vinculável a uma aventura sem alterar o original.
- Cartas de Alatar devem ser visualmente distintas, com tratamento de pergaminho, mas sem eliminar trechos ou mudar as palavras.
- Item lendário: registrar natureza, efeitos, frequência e limitações de acordo com o texto fornecido, sempre distinguindo regras de item e narrativa.
- Modo Mestre: os documentos e anotações são privados por padrão e **não devem ser mostrados inadvertidamente quando o usuário abrir a galeria em modo apresentação**.
- Poder abrir em visualizador interno e, quando relevante, exportar ou imprimir em formato legível, preservando a legibilidade.
- Não fazer revelações automáticas de spoilers com base no número da aventura.

## 8. UI/UX e organização de menu

- Barra superior atual segue como baseline, com suas classes e espaçamentos. Acrescentar `Aventuras`, `Mapas`, `Regras`, `LOFI` e entrada `Documentos` em grupo adequado.
- Os novos botões devem usar as **classes CSS existentes** de botões rústicos; não criar versões brancas/genéricas.
- Evitar overflow horizontal. Caso falte largura, colocar `Mapas`, `Regras` e `Documentos` em um submenu `Biblioteca`, e manter `LOFI` visível quando possível.
- Histórico de navegação e `Voltar` sem perder ponto de leitura, scroll, filtros ou dados digitados.
- Acessibilidade básica: foco visível, atalhos ESC, rótulos claros, estados ativos e tela responsiva.
- As telas da História 5 e Dados não devem sofrer modificação visual; comparar screenshots antes/depois.

## 9. Backup, persistência e segurança operacional

- Fazer migração não destrutiva dos dados anteriores, preservar chaves quando possível e testar com backup real sintético.
- Exportação/restauração: incluir aventuras importadas, dados e preferências de leitura, notas, LOFI, mapas anexados, metadados e documentos adicionados. Se o armazenamento de imagens não couber em JSON, oferecer pacote/ZIP local ou exportação separada, SEM dizer que o backup é completo quando não for.
- Validar formato, versão e limites de tamanho antes de importar, evitar corrupção e oferecer rollback.
- Não usar bibliotecas remotas/CDN, serviço de login, API externa nem telemetria.
- A biblioteca de links do YouTube é local; não tentar acessar o YouTube sem ação explícita do usuário.

## 10. Ordem de implementação e checkpoints

1. **Checkpoint:** inventário, backup, baselines funcionais e screenshots existentes.
2. **Aventuras:** catálogo com as 5 fontes, leitura, busca, navegação, preservação da História 5, favoritos/notas e importação básica.
3. **LOFI:** cadastro, edição, exclusão, validação de URL, abertura externa e persistência.
4. **Atlas:** 4 JPGs e Cidades LOTR, zoom, pan, tela cheia.
5. **Regras:** ingestão integral, índice e busca.
6. **Biblioteca narrativa:** cartas, alaúde, filtros, proteção de spoilers.
7. **Backup ampliado, testes e regressão.**

Fazer commits/checkpoints por fase quando o repositório permitir. Não pedir intervenção humana desnecessária. Entretanto, se houver incompatibilidade estrutural, perda de dados potencial, dependência bloqueada, dúvida irreversível sobre narrativa ou design conflitante, parar e sinalizar o bloqueio.

## 11. QA e critérios de aceite

- Cinco aventuras visíveis; selecionar A1, depois A3, A5 e voltar a A1 sem misturar seus textos; A5 deve seguir com os mesmos 1.060 blocos / 66 títulos se essa for a baseline técnica real.
- Abrir e navegar os atos/cenas; pesquisar conteúdo real; preservar quebras, tabelas e diálogos; sem perda silenciosa de conteúdo.
- LOFI: cadastrar três links, editar um, remover um, abrir um e validar bloqueio de URL inválida; persistir após reinício e restauração.
- Quatro mapas originais carregados sem distorção; zoom, arrastar e tela cheia funcionando; PDF Cidades acessível.
- Busca no D20 Simplificado e no Resumo Técnico retorna referências corretas; números e tabelas preservados.
- Cartas dos três personagens acessíveis, com spoilers protegidos; item lendário consultável.
- Rodar smoke tests em História 5, Jogadores, Dados, Imagens, Configurações, alterações em PV e recuperação por backup. **Proibida regressão.**
- Verificar modo offline com rede desligada, abertura por duplo clique no Windows e, quando possível, teste real macOS. Não declarar PASS em macOS se não testado.
- Capturas de tela reais de Aventuras, LOFI, Mapas, Regras e Documentos. Sem screenshots não declarar QA visual concluído.
- Relatório final com arquivos alterados, escopo implementado, evidências verificáveis, itens pendentes, riscos e como acessar cada módulo.

**Critério de sucesso:** RPG Master continua operacional exatamente como antes, mas agora administra múltiplas aventuras e materiais de campanha, com experiência medieval coerente, busca rápida e persistência confiável.
