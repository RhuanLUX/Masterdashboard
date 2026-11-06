# RPG Master — Crônica dos Três Destinos

**Versão atual do código: 4.4.1 — visitantes animados nos cenários, catálogo animado e 13 efeitos de magia. Nenhum novo instalador foi gerado.** Execute **INICIAR_RPG.bat** (Windows) ou **INICIAR_RPG.command** (macOS) nesta pasta. Seus controles continuam em **Mesa → Combate**. Para os jogadores, abra **TV de combate** e arraste a janela para a segunda tela. Todos os participantes, alvos e efeitos da arena são refletidos na TV; flags antigas de revelação não escondem inimigos nem bloqueiam ataques.

Além do dragão, os cenários recebem aparições ocasionais de corvos, águias, corujas, cervos e uma caravana. Cada ambiente tem visitantes próprios, com quadros individuais e passagens em direções e intervalos variados, sincronizadas na TV. O recurso respeita **reduzir movimento** do sistema. Atualize as duas janelas com **F5**. Veja as [aparições e a verificação visual](docs/AMBIENTACAO_V4_4_1.md).

Na arena, escolha **Cenário**: Mordor, Fangorn, Valfenda, Estrada Real ou Hrim. O encontro guarda a escolha e a TV acompanha. As 75 identidades visuais do catálogo têm quatro poses próprias, em PNGs separados: preparação, antecipação, golpe e recuperação. **Magia** oferece também Furacão, Meteoro, Nevasca, Onda das marés, Nuvem venenosa, Lanças das sombras e Luz sagrada. **Cura** continua com a aura descendente. Consulte o [guia das animações e magias](docs/ARENA_V4_4.md) e o [QA com capturas reais](docs/QA_ARENA_V4_4.md).

A nova biblioteca fica em **Biblioteca → Compêndio ampliado**: 42 fichas novas, 12 classes e 48 subclasses de referência, 36 magias adaptadas e 54 ilustrações locais. Pesquise, filtre por nível/ND, salve favoritos, edite ou duplique fichas e adicione aliados ou inimigos ao combate. As adaptações D20 estão identificadas separadamente das referências de D&D 2024. Consulte o [guia da expansão](docs/BIBLIOTECA_EXPANDIDA.md).

Ao chegar a zero PV, o combatente cai e permanece no chão; cura ou desfazer restauram sua posição. As falas periódicas agora são três vezes mais frequentes: aproximadamente **9–22 segundos**. Um banco local de **18.432 variações contextuais** separa receber dano, atacar e inspirar/desafiar durante a luta. O encontro guarda as falas usadas para evitar repetição, inclusive após recarregar e no backup. Quedas e falas acompanham a TV. Atualize com **F5 nas duas janelas** depois desta atualização.

Os instaladores **4.0.0** existentes continuam disponíveis, mas não incluem estas alterações e não são atualizados automaticamente. O runtime desktop de desenvolvimento pode executar o código atual com `pnpm start`, usando as dependências já instaladas.

Para executar direto da pasta: use apenas **INICIAR_RPG.bat** (Windows) ou **INICIAR_RPG.command** (macOS). O servidor e o navegador abrem juntos no endereço fixo `http://127.0.0.1:41731/`. Não é necessário abrir outro arquivo. O modo navegador no macOS requer Python 3 ou Node.js; os pacotes desktop incluem o runtime.

**Antes de trocar do navegador para o instalável, exporte um backup em Configurações e importe-o no aplicativo.** Os dois armazenamentos são separados. Versões antigas podiam salvar em outra porta local: exporte pelo endereço onde suas alterações aparecem.

A navegação foi organizada em Campanha, Companhia, Mesa e Biblioteca. A página de retomada mostra a aventura ativa. As fichas têm consulta/edição, fonte original, histórico, equipamentos em uso e recursos. A importação aceita DOCX, PDF, TXT e Markdown, com prévia e preservação dos documentos originais; PDF escaneado usa OCR local.

O núcleo funciona offline. LOFI só abre o YouTube quando solicitado e precisa de conexão para ouvir.

- [Guia completo de uso, backup e importação](docs/GUIA_PLATAFORMA_V4.md)
- [TV de combate e troca manual de turno](docs/GUIA_TV_COMBATE.md)
- [QA do espelhamento da TV de combate](docs/QA_TV_ESPELHADA.md)
- [QA das quedas e falas](docs/QA_QUEDAS_E_FALAS.md)
- [Banco de falas: testes de três horas sem repetição](docs/QA_FALAS_CONTEXTUAIS.md)
- [Relatório de QA e limitações](docs/QA_PLATAFORMA_V4.md)
- [Arquitetura e builds](README_ARQUITETURA.md)

Os cinco documentos originais de fichas/História 5 permanecem em `source/`. Os demais originais estão em `RPG_Master_V2_Content_Handoff/originais/`. Não foram reescritos.
