# RPG Master — Fangorn

Para a versão completa, abra `INICIAR_RPG.bat` no Windows ou `INICIAR_RPG.command` no macOS. Os dois iniciadores sobem automaticamente um servidor local em `127.0.0.1` e abrem o navegador; não usam internet nem exigem comandos manuais. Isso permite que a mesa física 3D carregue seus módulos, modelos e WebAssembly locais com segurança. No macOS, dê permissão de execução ao `.command` uma única vez (`chmod +x INICIAR_RPG.command`).

O aplicativo não usa rede nem dependências externas. Fichas e imagens importadas são armazenadas localmente no navegador (IndexedDB; há cópia de segurança local para as fichas). Em Configurações, use **Exportar backup** antes de trocar navegador/dispositivo e **Importar backup** para restaurar. Abrir a aplicação em outro navegador cria um armazenamento local separado; o backup é a forma portátil de migração.

As fichas salvam automaticamente após edição. Em **Dados**, a mesa 3D roda localmente com Dice Box (Babylon/Ammo) e aceita d4, d6, d8, d10, d12, d20 e d100 (dois d10: dezenas e unidades). Em **Jogadores** e em **Visão Geral**, os personagens usam sprites animados locais em pixel art; as demais telas preservam os retratos em alta resolução. O clique na animação ativa a reação visual; o som permanece desligado por padrão.
