# QA — evolução da plataforma 4.0

Checkpoint anterior: `checkpoint-platform-evolution-2026-11-05`, baseado em `26b88f1`.

Ambiente local: Windows 11, Edge headless e Electron 45.2.3, perfis de teste separados da campanha do usuário. Nenhuma ficha pessoal do navegador foi lida ou substituída durante o QA.

## Testado

- Quatro fichas em 1920×1080, 1366×768 e 1280×800, sem overflow horizontal no corpo/painel: 12 combinações. Capturas reais em `qa-platform-v4/`.
- PV/CA de Elenya 14/13 e Calion 10/13 recuperados da fonte; seis magias de Calion, equipamentos e dados existentes preservados. Migração idempotente e preservação de edições anteriores.
- Edição de nome/PV, detalhes de poder, item equipado e persistência após recarregar.
- DOCX real `Aventura 1.docx`: 171 blocos e 26 títulos no importador; documento original com SHA-256 no estado. Comparação byte a byte do original e conferência dos textos contra a aventura instalada, sem trechos ausentes. Reimportação cria revisão e preserva notas.
- DOCX adicional com imagem embutida, tabela, negrito/itálico e texto contendo marcação: formatos preservados, marcação exibida como texto sem executar código e referência a Elenya reconhecida.
- PDF digital de teste e PDF escaneado com texto em pixels: extração e OCR local, publicação no pergaminho, página original preservada. OCR do exemplo teve 93% de confiança; isto não generaliza para todo PDF.
- Exportação/restauração do backup V5 com originais e versões, rejeição de backup inválido e criação de recuperação anterior.
- Falha de IndexedDB injetada: rodapé informa falha; retoma gravação depois de restabelecer o armazenamento.
- Armazenamento desktop: escrita atômica, gravações serializadas, corrupção simulada, recuperação válida e preservação de conteúdo editado.
- Executável Electron, em desenvolvimento e empacotado para Windows: janela própria, pasta de perfil independente, persistência após encerrar/reabrir o processo, arena Pixi, apresentação em segunda janela sem bridge de disco e d100 real.
- No executável Windows empacotado: importação de DOCX (171 blocos), PDF digital e PDF escaneado com OCR, com originais idênticos byte a byte, nenhum erro de página e nenhuma requisição HTTP externa. Instalador NSIS gerado; o assistente de instalação/desinstalação ainda não passou por teste manual.
- Busca global e preservação dos 1060 blocos/66 títulos da História 5.
- 30 combinações visuais de efeitos de combate (flecha + quatro magias, duas direções, três resoluções), sincronização pública, ausência de PV privado no payload, limpeza de efeitos e movimento reduzido.
- Oito rolagens físicas 3D (d4/d6/d8/d10/d12/d20/d100 e combinação livre), sem erro de página ou requisição externa.
- D100: cinco exemplos exigidos, 20 rolagens automáticas, bônus e combinação; auditorias de catálogo (29 entidades), equipes, estados, histórico e desfazer.
- Temas, intensidades, pausa, persistência, backup e opção por aventura; zero requisições externas nos cenários de navegador testados.
- Hashes dos cinco arquivos-fonte em `source/` preservados.

Resultados estruturados: `qa-platform-v4/browser-report.json`, `formats-report.json`, `desktop-report.json`, `desktop-import-report.json`, `effects/report.json`, `themes/report.json`, `dice/report.json`. Os scripts estão em `tests/`; bibliotecas de teste estão fixadas em `package.json`/`pnpm-lock.yaml`.

## Limites de aceite

O ambiente local não é macOS. O projeto inclui empacotamento Intel/Apple Silicon e workflow em runner macOS; a situação dos artefatos e desse teste remoto deve ser consultada no GitHub. Um build não equivale a teste presencial em ambos os tipos de Mac. Sem assinatura Windows e sem certificado/notarização Apple nesta entrega.

OCR, colunas/tabelas complexas de PDF e recursos exóticos do Word exigem conferência. O arquivo original permanece preservado. Não há IA remota, geração automática de arte ou inventário de regras criado por inferência.

O estado da ficha e o de cada encontro são deliberadamente separados, com aplicação explícita de PV; não há sincronização silenciosa de encontros históricos. No navegador, use uma aba de edição por campanha. O desktop impede uma segunda instância do aplicativo.

Não representa **OWNER UAT APPROVED**. Os resultados acima são verificações técnicas e visuais registradas, sujeitas ao teste do mestre.
