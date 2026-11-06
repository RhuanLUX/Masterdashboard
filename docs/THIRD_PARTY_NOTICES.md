# Componentes de terceiros

## Importação e aplicativo desktop 4.0

- Mammoth 1.13.0 (BSD-2-Clause): https://github.com/mwilliamson/mammoth.js. Licença em `vendor/import/licenses/mammoth.txt`.
- PDF.js 6.5.438 (Apache-2.0): https://github.com/mozilla/pdf.js. Licença em `vendor/import/licenses/pdfjs.txt`; fontes/CMaps/WASM incluídos localmente.
- Tesseract.js 7.0.0 e tesseract.js-core 7.0.0 (Apache-2.0): https://github.com/naptha/tesseract.js. Licenças em `vendor/import/licenses/`; dados de idioma português/inglês de `@tesseract.js-data` incluídos para uso offline.
- Electron 45.2.3 (MIT e componentes Chromium): https://www.electronjs.org/. Os avisos de licença do runtime acompanham o pacote gerado. Electron-builder é ferramenta de build, não uma dependência externa do usuário final.

O ícone `desktop/icon.svg` foi desenhado como vetor original para este aplicativo.

## Voo de dragões do tema Reino dos Dragões — 4.1.1

Arte de **ZaPaper**, créditos a **Buko Studios** (http://www.buko-studios.com/), encomendada por **PlayCraft** (https://www.playcraftapp.com/). Licença **CC BY 3.0**: https://creativecommons.org/licenses/by/3.0/.

Fonte: [`flying_golden_dragon.png` do Stendhal](https://github.com/arianne/stendhal/blob/fcd8330db06034098f9b164aa67fed82f261ae59/data/sprites/monsters/dragon/flying_golden_dragon.png). A licença específica consta em [`doc/sources/graphics-entity.txt`](https://github.com/arianne/stendhal/blob/fcd8330db06034098f9b164aa67fed82f261ae59/doc/sources/graphics-entity.txt).

A fonte foi preservada e três células de voo foram recortadas para arquivos PNG individuais. Não houve redesenho. O aplicativo acrescenta trajetórias, espelhamento e opacidade atmosférica. Licença integral, origem e descrição das alterações em `assets/themes/dragon-flight/`. A arte é carregada offline; nenhum código do jogo Stendhal foi incorporado.

## PixiJS 8.22.0

O renderizador local da Arena V3.2 usa PixiJS 8.22.0, distribuído sob a licença MIT.
O arquivo offline está em `vendor/pixi/pixi.min.js`; a cópia da licença MIT está em
`vendor/pixi/LICENSE`. Fonte oficial: https://github.com/pixijs/pixijs

Nenhum componente da Arena V3.2 depende de CDN ou de serviço remoto durante a execução.

## Arte da arena V3.2.3

Os 24 PNGs em `assets/pixel-sprites/v3.2.3/` foram gerados com ImageGen para
este projeto, usando os retratos locais como referência de identidade e a
companhia aprovada como referência estética. Não foram extraídos de jogos
comerciais. A procedência individual está em `provenance.json` nessa pasta.
Não há serviço de geração nem download de arte durante a execução do aplicativo.

Essa procedência não transfere direitos sobre nomes, personagens ou universos
preexistentes de terceiros e não representa uma licença oficial de Tolkien.
A licença MIT do PixiJS se refere à biblioteca, não a essas propriedades.

## Acervo fornecido para a biblioteca 4.2.0

As 54 imagens WebP em `assets/library-expansion/` são cópias proporcionais das
ilustrações fornecidas pelo usuário no projeto `Reconstrucao_PHB_2024`, pasta
`Livro_Completo/project/art_generated`. O manifesto nessa pasta identifica cada
arquivo de origem. Não foram baixadas de serviços externos nem geradas durante
a execução do aplicativo. Não se declara licença aberta para essas ilustrações;
o licenciamento de bibliotecas de software não se estende a elas.

As fichas e magias autorais D20 da expansão são identificadas como adaptações.
O guia de classes e as dez criaturas do apêndice B indicam separadamente sua
referência ao Livro do Jogador 2024 fornecido. Isso não transfere a titularidade
de marcas ou propriedades de Dungeons & Dragons e não substitui os documentos
da campanha.

## Arte da arena 4.4.0

As novas sequências de 69 entidades e o cenário de Mordor foram produzidos com
ImageGen para este projeto, tomando as miniaturas locais como referência. Seis
sequências existentes foram separadas tecnicamente pela transparência, sem
redesenhar os personagens. Cada pose entregue é um PNG individual de 480 × 480.
A procedência e os hashes estão em `assets/animation-frames/v4.4/provenance.json`.
Não foram extraídos sprites de jogos comerciais; não há geração ou download
durante o uso. Os novos efeitos são desenhos procedurais locais no PixiJS.
Isso não altera os direitos sobre personagens ou universos preexistentes.

## Visitantes da arena 4.4.1

Corvo, águia, coruja, cervo e caravana receberam quatro poses cada, geradas com
ImageGen para este projeto. São 20 PNGs locais, transparentes e separados por
silhueta; nenhum sprite foi extraído de jogos comerciais. O dragão anterior
continua reutilizado. Prompts, referência e nomes dos originais estão em
`assets/battle-scenes/visitors/v4.4.1/provenance.json`; hashes e pontos de registro
estão em `docs/qa-ambient-visitors/`. Não há download nem geração durante o uso.
