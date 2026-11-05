# RPG Master — Crônica dos Três Destinos

**Versão atual do código: 4.1 — Mesa ao vivo. Não foram gerados novos instaladores nesta atualização.** Para usar os novos recursos, execute **INICIAR_RPG.bat** (Windows) ou **INICIAR_RPG.command** (macOS) nesta pasta. Abra **Mesa → Mesa ao vivo → Organizar telas**.

Os instaladores **4.0.0** existentes continuam disponíveis, mas não incluem a Mesa ao vivo e não são atualizados automaticamente. O runtime desktop de desenvolvimento pode executar o código atual com `pnpm start`, usando as dependências já instaladas.

Para executar direto da pasta: use apenas **INICIAR_RPG.bat** (Windows) ou **INICIAR_RPG.command** (macOS). O servidor e o navegador abrem juntos no endereço fixo `http://127.0.0.1:41731/`. Não é necessário abrir outro arquivo. O modo navegador no macOS requer Python 3 ou Node.js; os pacotes desktop incluem o runtime.

**Antes de trocar do navegador para o instalável, exporte um backup em Configurações e importe-o no aplicativo.** Os dois armazenamentos são separados. Versões antigas podiam salvar em outra porta local: exporte pelo endereço onde suas alterações aparecem.

A navegação foi organizada em Campanha, Companhia, Mesa e Biblioteca. A página de retomada mostra a aventura ativa. As fichas têm consulta/edição, fonte original, histórico, equipamentos em uso e recursos. A importação aceita DOCX, PDF, TXT e Markdown, com prévia e preservação dos documentos originais; PDF escaneado usa OCR local.

O núcleo funciona offline. LOFI só abre o YouTube quando solicitado e precisa de conexão para ouvir.

- [Guia completo de uso, backup e importação](docs/GUIA_PLATAFORMA_V4.md)
- [Mesa ao vivo: duas ou três telas, busca e interpretação](docs/GUIA_MESA_AO_VIVO.md)
- [QA da Mesa ao vivo](docs/QA_MESA_AO_VIVO.md)
- [Relatório de QA e limitações](docs/QA_PLATAFORMA_V4.md)
- [Arquitetura e builds](README_ARQUITETURA.md)

Os cinco documentos originais de fichas/História 5 permanecem em `source/`. Os demais originais estão em `RPG_Master_V2_Content_Handoff/originais/`. Não foram reescritos.
