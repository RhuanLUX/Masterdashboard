# QA — instaladores e atualização 4.5.2

Verificação realizada em 17 de novembro de 2026. Base publicada para os pacotes,
commit `862bfe9`, tag `desktop-v4.5.2`. A tag histórica `V2` continua apontando
para a versão aprovada pelo proprietário.

## Builds e testes nativos

O workflow [44080158306](https://github.com/RhuanLUX/Masterdashboard/actions/runs/44080158306)
terminou com sucesso nos três sistemas.

| Ambiente | Arquitetura | Resultado |
| --- | --- | --- |
| Windows no runner GitHub | x64 | Núcleo, atualização, desktop, importação, EXE e testes do empacotado passaram |
| macOS Intel no runner GitHub | x64 | Núcleo, atualização, desktop, importação, DMG e testes do empacotado passaram |
| macOS Apple Silicon no runner GitHub | arm64 | Núcleo, atualização, desktop, importação, DMG e testes do empacotado passaram |

Os testes desktop verificaram gravação após fechar/reabrir o processo, perfil
isolado, preload restrito ao mestre, TV pública com canvas, arena PixiJS e d100.
Os testes de importação usaram DOCX, PDF digital e PDF escaneado com OCR local.
A ausência de acesso externo durante esses testes foi verificada. Todos foram
repetidos no binário empacotado. A verificação de atualização usa perfil de teste
e transporte controlado, sem alterar a campanha do proprietário.

## Atualização completa no Windows

`tests/desktop-update-app.cjs` executou uma versão de teste anterior, fez o
download do pacote final assinado por um transporte local e reiniciou o
aplicativo usando o ASAR externo verificado. Foram confirmados:

- assinatura e integridade do download real;
- versão ativa 4.5.2 após reiniciar;
- campanha preservada após atualizar;
- arena e TV servidas pelo pacote atualizado, com bridge ausente na TV;
- marca de inicialização saudável e nova abertura bem-sucedida;
- retorno à base ao corromper o arquivo antes de abrir;
- retorno à base após uma inicialização sem confirmação de prontidão;
- nenhum erro de JavaScript no teste.

O teste de núcleo cobre ainda download truncado, tamanho excedido, origem e
assinatura inválidas, versão incompatível do runtime, concorrência de verificações,
preferência automática e funcionamento sem conexão. Esses testes de núcleo
passaram nos três sistemas. O teste completo de troca de ASAR foi executado
localmente no Windows.

## Correções encontradas durante o QA

O Electron trata ASARs como diretórios virtuais. As verificações de tamanho e
hash agora usam `original-fs` para ler os bytes físicos antes de carregar código.

O Mac Intel do runner usou o renderer Canvas do PixiJS. A versão local da
biblioteca não oferece a pipe de malha nesse renderer, o que causava erro em
`validateRenderable`. O cenário passa a usar a mesma arte completa em Sprite
quando essa pipe está ausente. Personagens, visitantes, partículas e efeitos
continuam animados. Somente a deformação da malha de folhagem depende da GPU.
O teste `tests/arena-software.cjs` forçou Canvas e validou os cinco cenários com
Furacão e composição dos combatentes sem erros.

A lista de participantes da arena também é copiada no início da montagem
assíncrona para não mudar durante o carregamento dos assets. A renderização
começa depois da montagem e para antes de destruir a cena.

## Evidências e limites

- [Troca real de versão](qa-installers/update-app.json)
- [Captura da atualização pronta](qa-installers/update-ready.png)
- [Renderer de software](qa-installers/software-renderer.json)
- [Etapas completas dos builds](qa-installers/github-builds.json)
- [Publicação, links e checksum Windows verificados](qa-installers/publication.json)

A [publicação final](https://github.com/RhuanLUX/Masterdashboard/releases/tag/desktop-v4.5.2)
terminou no workflow [44082448619](https://github.com/RhuanLUX/Masterdashboard/actions/runs/44082448619).
Os três links públicos responderam com seus tamanhos corretos. O serviço de
atualização real consultou o feed público, verificou a assinatura e retornou
`current` para 4.5.2. O SHA-256 do EXE salvo localmente corresponde ao digest do
asset no GitHub e ao arquivo público de checksums.

Os computadores Mac físicos do proprietário e as permissões da primeira abertura
no Gatekeeper precisam ser confirmados nele. Os DMGs usam assinatura ad-hoc,
sem certificado Apple Developer ou notarização. O EXE também não tem certificado
comercial de assinatura de código. A assinatura Ed25519 dos pacotes de atualização
foi testada separadamente e a chave privada permanece local, fora do repositório.

A verificação automática ocorre ao abrir e a cada seis horas. O pacote é aplicado
no próximo reinício do processo, depois do salvamento. Atualizar o runtime Electron
ou o bootstrap exige novo instalador, apresentado pela opção **Abrir downloads**.
As campanhas são locais em cada dispositivo e podem ser transferidas por backup.
O mecanismo não implementa sincronização de campanhas entre Windows e Mac.
