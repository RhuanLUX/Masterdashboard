# RPG Master — Crônica dos Três Destinos

No Windows, instale o arquivo **RPG-Master-4.0.0-Windows-x64.exe** da pasta `dist/` e abra o atalho RPG Master. Ele inclui todos os recursos locais, sem exigir Node.js ou Python.

No Mac, abra **RPG-Master-4.0.0-macOS-arm64.dmg** (Apple Silicon) ou **RPG-Master-4.0.0-macOS-x64.dmg** (Intel) e arraste o app para Aplicativos. Os instaladores também estão nos artefatos do [build verificado](https://github.com/RhuanLUX/Masterdashboard/actions/runs/42041203893). São builds sem certificado de editor/notarização; veja os limites no relatório de QA.

Para executar direto da pasta: use apenas **INICIAR_RPG.bat** (Windows) ou **INICIAR_RPG.command** (macOS). O servidor e o navegador abrem juntos no endereço fixo `http://127.0.0.1:41731/`. Não é necessário abrir outro arquivo. O modo navegador no macOS requer Python 3 ou Node.js; os pacotes desktop incluem o runtime.

**Antes de trocar do navegador para o instalável, exporte um backup em Configurações e importe-o no aplicativo.** Os dois armazenamentos são separados. Versões antigas podiam salvar em outra porta local: exporte pelo endereço onde suas alterações aparecem.

A navegação foi organizada em Campanha, Companhia, Mesa e Biblioteca. A página de retomada mostra a aventura ativa. As fichas têm consulta/edição, fonte original, histórico, equipamentos em uso e recursos. A importação aceita DOCX, PDF, TXT e Markdown, com prévia e preservação dos documentos originais; PDF escaneado usa OCR local.

O núcleo funciona offline. LOFI só abre o YouTube quando solicitado e precisa de conexão para ouvir.

- [Guia completo de uso, backup e importação](docs/GUIA_PLATAFORMA_V4.md)
- [Relatório de QA e limitações](docs/QA_PLATAFORMA_V4.md)
- [Arquitetura e builds](README_ARQUITETURA.md)

Os cinco documentos originais de fichas/História 5 permanecem em `source/`. Os demais originais estão em `RPG_Master_V2_Content_Handoff/originais/`. Não foram reescritos.
