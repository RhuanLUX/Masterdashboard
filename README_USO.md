# RPG Master — Fangorn / Crônica dos Três Destinos

Para a versão completa, abra `INICIAR_RPG.bat` no Windows ou `INICIAR_RPG.command` no macOS. Os dois iniciadores sobem automaticamente um servidor local em `127.0.0.1` e abrem o navegador; não usam internet nem exigem comandos manuais. No Windows, o iniciador usa apenas o PowerShell já instalado pelo sistema — não é necessário instalar Node.js. Ele só abre o navegador depois que o servidor local estiver pronto. Isso permite que a mesa física 3D carregue seus módulos, modelos e WebAssembly locais com segurança. No macOS, dê permissão de execução ao `.command` uma única vez (`chmod +x INICIAR_RPG.command`).

O aplicativo não usa rede nem dependências externas. Fichas e imagens importadas são armazenadas localmente no navegador (IndexedDB; há cópia de segurança local para as fichas). Em Configurações, use **Exportar backup** antes de trocar navegador/dispositivo e **Importar backup** para restaurar. O backup V2 inclui fichas, imagens, aventuras adicionadas, estado e notas de leitura, LOFI e mapas anexados. Abrir a aplicação em outro navegador cria um armazenamento local separado; o backup é a forma portátil de migração.

As fichas salvam automaticamente após edição. Em **Dados**, a mesa 3D roda localmente com Dice Box (Babylon/Ammo) e aceita d4, d6, d8, d10, d12, d20 e d100 (dois d10: dezenas e unidades). Em **Jogadores** e em **Visão Geral**, os personagens usam sprites animados locais em pixel art; as demais telas preservam os retratos em alta resolução. O clique na animação ativa a reação visual; o som permanece desligado por padrão.

## Módulos V2

- **Aventuras**: cinco aventuras, busca, índice, notas privadas, estado de leitura e importação local de TXT, MD ou DOCX.
- **LOFI**: biblioteca local de URLs HTTPS do YouTube. Nenhum player é embutido; abrir um link é sempre uma ação explícita.
- **Biblioteca**: reúne o Atlas com os quatro mapas originais, o compêndio D20 Simplificado e Resumo Técnico, além das cartas e do Alaúde de Húrinel. Documentos narrativos privados não aparecem na galeria.

Os originais V2 ficam intactos em `RPG_Master_V2_Content_Handoff/originais/`. A versão de leitura local é `data/v2-content.js`; ela pode ser regenerada sem alterar os originais com:

```powershell
C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe tools\generate_v2_content.py
```

## Códice Vivo

- **Imagens** agora é a Biblioteca Visual: contém NPCs, aliados, inimigos, criaturas, entidades e lendas. Há busca, filtro por categoria/origem, ordenação e tela de detalhe. Use **Adicionar item** para uma entrada manual; itens manuais podem ser editados, excluídos ou receber uma imagem local substituta.
- **Criaturas** é o bestiário rápido: oito fichas resumidas com CA, PV, movimento, atributos, ataque, dano e habilidade especial. Use **Adicionar criatura** para criar uma ficha local editável.
- Os cinco retratos/ilustrações estáticas novos ficam em `assets/generated/`. Não há GIFs ou novas animações nesse módulo.
- A exportação agora usa esquema V3 e inclui as entradas e imagens manuais da Biblioteca Visual, além de criaturas manuais. A importação continua compatível com backups V1 e V2.
