# Arquitetura offline

`index.html` usa scripts clássicos locais para permanecer compatível com `file://`; os dados da aventura e das fichas foram incorporados em `data/*-data.js`, gerados dos JSONs originais preservados em `data/`. `js/app.js` contém renderização, roteamento de views, armazenamento IndexedDB/fallback, backup, galeria e efeitos de áudio. Não há fetch, CDN, login, telemetria ou API remota.
