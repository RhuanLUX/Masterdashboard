# Arquitetura offline e desktop

A aplicação continua em HTML/CSS/JavaScript, com PixiJS e Dice Box locais. `index.html` usa os dados incorporados de `data/`; `file://` não é o modo suportado para workers/WebAssembly. Use o servidor local ou o aplicativo Electron.

## Módulos da evolução

- `js/platform-data.js`: contrato validado de estado/backup V5; aceita backups antigos compatíveis.
- `js/platform-storage.js`: IndexedDB transacional, fila de gravação, recuperação e bridge desktop.
- `desktop/store.cjs`: JSON versionado em pasta userData, escrita temporária + fsync + rename, backups rotativos. Escolha intencional para manter o mesmo formato portátil sem um módulo SQLite nativo adicional.
- `desktop/main.cjs` e `preload.cjs`: Electron, protocolo local rpg://app, contextIsolation/sandbox, Node desabilitado no renderer, API IPC restrita à janela principal. Instância única e flush antes de fechar.
- `js/character-sheets.js`: migração somente de campos ausentes, fichas, fonte original, histórico e transferência explícita de PV do encontro. Não recalcula regras.
- `js/adventure-import.js`: Mammoth, PDF.js e Tesseract locais; blocos tipados/escapados, imagens, originais SHA-256, revisões, prévia e publicação transacional.
- `js/platform-ui.js`, `css/platform.css`: navegação, retomada, busca e diálogos.
- `js/combat-tv.js`: única janela pública de combate, com canal por sessão, snapshot visual completo da arena e sincronização de ações. A janela principal continua sendo a única escritora. `mirrorPayload` inclui todos os combatentes e os indicadores de atacante/alvo, sem notas nem campos privados. A compatibilidade com o payload antigo filtrado é separada da TV espelhada.
- `js/campaign-search.js`, `css/campaign-search.css`: índice textual local e prévias. Sem APIs de IA ou busca remota.
- `battle-display.html`, `js/battle-display.js`, `css/combat-tv.css`: somente a arena na TV, ocupando a janela inteira, sem história, imagens de catálogo, dados privados ou bridge de disco.
- `js/battle-arena.js`: seleção do mestre em `combat.arenaSelection`, preservada após dano, cura e remontagem. O turno só avança por comando explícito.
- `assets/themes/dragon-flight/`: frames individuais locais, fonte e licença CC BY 3.0 do dragão de ZaPaper/Buko Studios, via Stendhal. Rotas e batidas de asas independentes no tema.

Os módulos de combate, dados, temas e conteúdo existente são preservados. Adaptadores de interface receberam diálogos assíncronos porque prompt nativo não é suportado pelo Electron. O participante da companhia é criado diretamente da ficha canônica; os encontros continuam com cópias próprias.

## Desenvolvimento

Use Node.js 24 e pnpm 11.25.0. Instalação de dependências/build requer internet; uso do pacote final não requer. **A entrega 4.1 é apenas código: não gerar novos instaladores conforme orientação do proprietário.** Os comandos de build abaixo permanecem como referência histórica, não como etapa desta entrega.

```sh
pnpm install --frozen-lockfile --ignore-scripts
node node_modules/electron/install.js
pnpm start
pnpm test
node test/verify.js
pnpm dist:win
# em um Mac, gera Intel e Apple Silicon:
pnpm dist:mac
```

`vendor/import/` já está versionado. Para regenerar: `pnpm vendor`. Licenças estão na mesma pasta. `tools/build-icon.cjs` rasteriza o ícone vetorial original para os formatos de empacotamento. Para QA no navegador Windows: `node tests/platform-browser.cjs`. Para desktop em perfil isolado: `node tests/desktop-smoke.cjs`; use a variável `RPG_TEST_EXE` para testar o executável empacotado.

O workflow manual **Desktop installers** usa runners Windows, Mac Intel e Apple Silicon separados. Testa núcleo, persistência, arena, dados e importação/OCR tanto em desenvolvimento quanto no aplicativo empacotado; publica instaladores como artefatos de Actions. Não cria releases automaticamente. O Mac recebe assinatura técnica ad-hoc para executar o pacote, sem certificado de desenvolvedor nem notarização Apple; o Windows não recebe assinatura de editor. `dist/` e perfis QA não entram no Git.

## Migração

O navegador mantém IndexedDB por origem; o iniciador agora fixa 41731. O desktop usa pasta de dados própria e a importação de backup é a ponte suportada. Nunca buscar credenciais ou bancos de perfis pessoais do navegador. Antes da restauração há validação e cópia de recuperação. Não foi alterado qualquer documento-fonte ou regra D20.

## Limites deliberados

50 MB por importação, 160 páginas por PDF, 512 MB no arquivo de campanha desktop, 150 alterações por ficha, 5 recuperações no navegador / 10 no desktop. Imagens importadas e versões podem aumentar o backup. Originais e transcrições permanecem distintos: OCR não é tratado como fonte infalível. Não há modelo de IA, API remota, CDN ou download de idioma durante o uso.
