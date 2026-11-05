# RPG Master 4.0 — guia de uso

## Executar

**Windows:** abra `RPG-Master-4.0.0-Windows-x64.exe`, escolha a pasta de instalação e use o atalho **RPG Master**. O aplicativo inclui seu próprio navegador; não exige Node.js, Python, servidor ou internet no computador do jogador. Os dados ficam fora da pasta de instalação.

**macOS:** o projeto gera dois DMGs, para Intel (`x64`) e Apple Silicon (`arm64`), pelo workflow **Desktop installers** do GitHub ou por `pnpm dist:mac` em um Mac. Arraste RPG Master para Aplicativos. Consulte o relatório de QA para saber quais builds e sistemas foram efetivamente testados. O pacote ainda não possui assinatura de desenvolvedor ou notarização Apple.

**Pasta do projeto, sem instalar:** use somente `INICIAR_RPG.bat` no Windows ou `INICIAR_RPG.command` no macOS. O iniciador abre `http://127.0.0.1:41731/` quando o servidor está pronto. Não abra `index.html` diretamente: os workers e os dados 3D precisam do servidor ou do aplicativo. No macOS, o modo navegador requer Node.js ou Python 3; o `.command` pode precisar de `chmod +x INICIAR_RPG.command` uma vez.

## Trazer a campanha existente

O aplicativo instalado e cada navegador têm armazenamentos separados. As alterações existentes **não são copiadas automaticamente** do navegador.

1. Abra a versão do navegador no endereço em que seus dados aparecem.
2. Entre em **Configurações → Exportar backup**.
3. No aplicativo instalado, use **Configurações → Importar backup** e selecione esse JSON.
4. Confira as fichas e a sessão antes de abandonar a cópia anterior.

Versões antigas do iniciador Windows escolhiam portas aleatórias. Se suas alterações estiverem em outro endereço `127.0.0.1:porta`, exporte a partir daquele endereço. Os dados continuam vinculados ao navegador e à porta original; o novo iniciador usa sempre 41731. Não apague os dados antigos do navegador para tentar resolver uma campanha aparentemente vazia.

## Navegar com menos botões

- **Campanha:** retomar sessão, aventuras, História 5 e LOFI.
- **Companhia:** as quatro fichas e seleção de jogadores.
- **Mesa:** central do mestre, combate, dados e apresentação aos jogadores.
- **Biblioteca:** imagens/NPCs, criaturas, mapas, regras e documentos.
- **Buscar** ou `Ctrl+K` / `⌘K`: procura pessoas, regras, documentos e trechos das aventuras.

Depois das boas-vindas, a página de retomada mostra a aventura ativa, os PV da companhia e atalhos de sessão. O botão Continuar retorna à última seção marcada no índice. O tema continua disponível no topo.

## Fichas

**Consultar** é o modo inicial. **Editar ficha** libera identidade, atributos, perícias, poderes, equipamentos, história e anotações. **Concluir edição** volta à consulta. PV atual e usos restantes dos recursos continuam acessíveis durante a sessão.

Elenya e Calion receberam os campos que existiam nos documentos, mas não eram importados: PV, CA, inspiração, equipamentos, magias, características e história. Valores já preenchidos pelo mestre são preservados. Calion permanece com a expressão de CA original na aba Fonte original; o valor final explicitamente declarado ali é 13. Valores de atributos e modificadores não são recalculados segundo D&D.

**Inventário** contém todos os itens; **Equipamentos** mostra apenas aqueles marcados como equipados/em uso. Essa marcação é do mestre, não uma suposição automática.

Poderes mostram os textos originais e campos para alcance, custo e duração. Recursos limitados do Anão usam os limites declarados na fonte; o mestre informa quantos usos restam. Não há descanso automático nem gasto implícito de poderes.

**Fonte original** mantém a transcrição integral das fichas. As diferenças históricas de Nando continuam explícitas. **Alterações** registra até 150 edições por personagem. O que não consta na fonte continua identificado como não informado.

### Ficha e combate

Novos participantes da companhia são criados a partir dos valores atuais da ficha, incluindo 0 PV. Um encontro mantém sua própria cópia para preservar turnos, desfazer e histórico. Na ficha, a seção **Na mesa** mostra PV/condições do encontro ativo; **Aplicar PV à ficha** copia o PV atual escolhido após confirmação. Ela não altera PV máximo, CA, encontros encerrados ou o documento original. Duplicatas do mesmo personagem aparecem separadamente.

## Importar aventuras

Em **Campanha → Aventuras → Importar aventura**, selecione DOCX, PDF, TXT ou Markdown.

1. O processamento acontece no computador.
2. A prévia mostra o texto, tabelas, ilustrações e o índice encontrado.
3. Ajuste título e hierarquia dos parágrafos, se necessário.
4. Clique em **Publicar e abrir**. A aventura passa a usar o leitor de pergaminho, busca e notas do mestre.

O arquivo original é guardado integralmente no backup, com nome e SHA-256. Nenhum documento-fonte é reescrito. As cinco aventuras instaladas permanecem preservadas.

DOCX usa estilos de título e conserva texto, ênfases, tabelas e imagens compatíveis. Cabeçalhos de atos/cenas evidentes também podem alimentar o índice. Elementos não suportados aparecem como avisos; consulte sempre o original quando houver layout complexo.

PDF digital tem texto extraído e uma imagem de cada página para conferência. PDF escaneado passa por OCR local em português/inglês e exibe avisos de confiança. OCR pode errar acentos, nomes e números; não corrige narrativas silenciosamente. Não é reconhecimento garantido de manuscritos. Tabelas/colunas de PDF podem precisar de conferência na imagem da página.

Limites atuais: 50 MB por arquivo e 160 páginas por PDF. Divida livros maiores em volumes. Fechar o diálogo de processamento cancela a publicação. Não são inventadas regras, estatísticas ou imagens; referências a entidades existentes são reconhecidas por nome quando possível.

Para revisar uma aventura, importe outro documento e escolha **Nova versão de…**. A versão anterior e seu original ficam disponíveis em **Fontes e versões**. Notas são mantidas; a leitura e marcadores são associados a blocos idênticos quando encontrados. Texto removido ou reescrito pode exigir remarcar a seção. Aventuras arquivadas podem ser reativadas na biblioteca.

Para melhor resultado no Word, use Título 1 para atos, Título 2 para cenas e Título 3 para subseções; insira imagens e tabelas no fluxo do documento. Esse padrão ajuda, mas não é obrigatório.

## Gravação e recuperação

O rodapé distingue Salvando, Salvo e Falha ao salvar. Uma falha nunca é apresentada como sucesso. No aplicativo, o fechamento aguarda a gravação; se ela falhar, a janela continua aberta para exportar um backup.

No navegador, a campanha e a galeria usam uma transação IndexedDB. No desktop, um arquivo JSON versionado é escrito em arquivo temporário, sincronizado e renomeado. Não existe banco nativo adicional para instalar. O formato preserva o estado atual e funciona nos dois sistemas.

**Recuperação automática** lista até cinco cópias no navegador e dez no desktop. Elas são mantidas antes de substituir o estado e aproximadamente a cada dez minutos de edição; não constituem um histórico de cada tecla. No desktop, **Pasta dos dados** informa o caminho exato, independente da instalação. Se o arquivo principal estiver corrompido, a última cópia válida é recuperada e o arquivo problemático é preservado para diagnóstico.

Exporte backups para uma segunda pasta/dispositivo periodicamente. O JSON inclui fichas, campanha, encontros, diário, missões, imagens importadas, mapas, LOFI, documentos de aventuras e versões. Backups anteriores V1/V2/V3 continuam aceitos quando estruturalmente válidos. A restauração valida o conteúdo antes da troca e mantém uma cópia anterior.

## O que continua igual

Pergaminho A4; História 5 integral; regras D20 Simplificado; artes, sprites e cenário da arena; flechas e quatro magias aprovadas; dados 3D sem som; temas e suas opções; biblioteca, atlas, cartas, galeria e configurações. LOFI é o único recurso que abre URLs externas por ação do usuário; ouvir YouTube requer internet.
