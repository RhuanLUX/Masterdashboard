# QA V2 2026 10 12

## Baseline e integridade

- Checkpoint criado antes de código: `docs/checkpoint-pre-v2.zip`.
- Manifesto V2 auditado: 16 de 16 arquivos com tamanho e SHA-256 correspondentes.
- Teste estático: `node test/verify.js` aprovado.
- Aventura 5 mantida com 1.060 blocos e 66 títulos, também verificados no payload V2.

## Validações funcionais locais

- Biblioteca: as cinco aventuras aparecem; Aventura 1 abriu com índice, busca e notas exclusivas do mestre.
- LOFI: cadastro local de URL HTTPS, renderização da lista e persistência após recarregar a página verificados. Abertura externa não foi acionada durante QA para não navegar ao YouTube.
- Atlas: os quatro JPGs originais renderizaram; abrir mapa, ampliar, enquadrar e fechar foram verificados. O PDF Cidades LOTR foi conferido como fonte de cinco páginas, permanece no pacote original e também possui leitura/pesquisa local no aplicativo.
- Regras: D20 Simplificado abriu com 967 blocos e tabelas preservadas; o índice apresenta os módulos originais.
- Backup: exportação V2 gerou JSON de esquema 2 contendo 4 fichas, 5 aventuras e biblioteca LOFI. Aventuras arquivadas seguem no JSON para recuperação posterior. Restauração não foi executada sobre o perfil de QA para preservar o estado local existente.
- Regressão estática: História 5, as quatro fichas e Dados continuam presentes no roteiro de renderização original; teste estrutural aprovado.

## Verificação visual

- Capturas reais de QA realizadas na interface local para Aventuras, LOFI, Atlas, Regras e Configurações.
- Estilo dark fantasy, botões rústicos e pergaminho A4 foram preservados. Em larguras reduzidas, Mapas, Regras, Documentos e Imagens são agrupados em Biblioteca para evitar quebra horizontal.

## Limitações conhecidas

- O ambiente atual é Windows. Não houve teste em hardware macOS; os inicializadores continuam multiplataforma e não foram alterados.
- Importação PDF de aventura não é anunciada. Importação local de aventuras cobre TXT, MD e DOCX; o leitor DOCX usa APIs locais do navegador.
- O perfil de QA contém um link LOFI de teste (`Floresta de teste`) para comprovar persistência. Ele pode ser removido na própria tela LOFI.
