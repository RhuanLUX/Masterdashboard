# Instalação e atualizações do RPG Master V2

Os pacotes atuais ficam na [página de downloads](https://github.com/RhuanLUX/Masterdashboard/releases/latest).

## Windows

Baixe `RPG-Master-4.5.2-Windows-x64.exe`, execute e siga o instalador. Abra o
atalho **RPG Master**. O aplicativo inclui seu próprio runtime e todos os assets.
O instalador usa a conta atual e preserva a pasta da campanha nas reinstalações.
A primeira instalação usa um executável sem certificado comercial de assinatura.

## Mac

Escolha `RPG-Master-4.5.2-macOS-arm64.dmg` para Apple Silicon (M1 ou posterior)
ou `RPG-Master-4.5.2-macOS-x64.dmg` para Intel. A informação está no menu Apple,
em **Sobre Este Mac**. Abra o DMG e arraste **RPG Master** para **Aplicativos**.
Abra a cópia de Aplicativos e ejete o DMG.

Os pacotes Mac usam assinatura técnica ad-hoc. Como não há certificado Apple
Developer nem notarização configurados, o macOS pode bloquear a primeira
abertura. Depois da tentativa de abrir, autorize o RPG Master em
**Ajustes do Sistema → Privacidade e Segurança → Abrir Mesmo Assim**. Confirme
somente o aplicativo baixado da página deste projeto. O procedimento oficial
está no [suporte da Apple](https://support.apple.com/102445).

## Trazer os dados usados no navegador

Antes de mudar para o instalado, abra o RPG no navegador que contém sua campanha,
entre em **Configurações → Exportar backup** e salve o JSON. No instalado,
use **Configurações → Importar backup** e confira as fichas e os encontros.
O aplicativo e o navegador têm armazenamentos próprios.

Cada computador mantém a sua campanha. Para transportar a campanha entre Windows
e Mac, use exportação e importação de backup. As atualizações do programa não
transferem automaticamente os dados da campanha entre os computadores.

## Receber as próximas atualizações

Quando o mestre pedir uma atualização neste projeto, a nova versão será testada,
empacotada para Windows e para as duas arquiteturas Mac e publicada no GitHub.
O aplicativo verifica ao abrir e a cada seis horas, com internet disponível.
Os computadores podem estar em redes diferentes. O jogo continua utilizável offline.

O pacote comum de atualização contém HTML, CSS, JavaScript, código desktop e
assets. O aplicativo confere a assinatura Ed25519, os tamanhos e os hashes SHA-256
antes de guardar o pacote. Ele será ativado na próxima abertura. Para aplicar
imediatamente, entre em **Configurações → Atualizações do aplicativo → Salvar e
reiniciar para atualizar**. O salvamento precisa terminar antes de reiniciar.
A TV é reaberta pelo mestre após a reinicialização.

Há também **Verificar agora** e a opção de desligar a verificação automática.
Downloads interrompidos podem ser repetidos. Se uma versão falhar ao iniciar,
a abertura seguinte retorna à versão anterior. Os arquivos da campanha ficam
fora das pastas de atualização.

O runtime Electron e o bootstrap vêm no instalador. Uma futura mudança dessa base
exibirá **Abrir downloads** para instalar o novo pacote do sistema correspondente.
As atualizações comuns do aplicativo usam o mesmo pacote assinado nos dois sistemas.

## Publicação pelo responsável pelo projeto

1. Mantenha `V2` como marco histórico aprovado. Incremente a versão técnica em
   `package.json` para cada publicação nova.
2. Execute os testes do núcleo, desktop e atualização. Crie o commit e a tag
   `desktop-vX.Y.Z`, então envie ambos ao GitHub.
3. O workflow **Desktop installers** gera e testa Windows x64, Mac Intel e Mac
   Apple Silicon. Aguarde os três jobs terminarem com sucesso.
4. No computador com a chave local, execute `node tools/package-update.cjs` sobre
   o commit da tag. A chave privada fica em `.release-private/update-private.pem`,
   ignorada pelo Git. Preserve uma cópia dessa chave em local seguro. Somente a
   chave pública faz parte dos aplicativos.
5. Execute `node tools/publish-desktop.cjs --stage-update`. Ele envia somente o
   pacote assinado e o manifesto para um rascunho privado da publicação.
6. Dispare o workflow **Publish tested desktop release**, informando a tag e o
   número da execução bem-sucedida de **Desktop installers**. Ele confere o commit,
   baixa os três instaladores diretamente dos artefatos, gera checksums e publica
   todos os arquivos juntos. Aguarde a conclusão e confira os links e o manifesto.

Para publicar inteiramente por este computador, a alternativa é baixar os três
artefatos, colocar os `.exe` e `.dmg` diretamente em `dist/` e executar
`node tools/publish-desktop.cjs` sem a opção de preparação.

O script de publicação usa a credencial GitHub já configurada no Git ou a variável
`GITHUB_TOKEN`. A chave privada de assinatura permanece neste computador.
