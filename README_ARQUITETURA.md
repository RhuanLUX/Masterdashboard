# Arquitetura offline

`index.html` usa scripts clássicos locais para permanecer compatível com `file://`; os dados da aventura e das fichas foram incorporados em `data/*-data.js`, gerados dos JSONs originais preservados em `data/`. A camada V2 está em `data/v2-content.js`, gerada por `tools/generate_v2_content.py` a partir de `RPG_Master_V2_Content_Handoff/originais/`, que permanece imutável.

`js/app.js` contém renderização, roteamento de views, armazenamento IndexedDB/fallback, backup, galeria, Aventuras, LOFI, Atlas, Regras e Documentos. O estado editável V2 vive em `state.v2` e é adicionado por `ensureV2()` sem migrar ou apagar as fichas existentes. Não há fetch, CDN, login, telemetria ou API remota; URLs do YouTube só são abertas sob ação explícita do usuário.
