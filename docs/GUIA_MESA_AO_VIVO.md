# Mesa ao vivo — RPG Master 4.1

**Documento histórico. A Mesa ao vivo foi retirada a pedido do proprietário na 4.1.1. O recurso atual está em [TV de combate](GUIA_TV_COMBATE.md).**

A Mesa ao vivo reúne leitura e direção de cena. Você pode interpretar e disparar os efeitos aprovados na TV enquanto consulta a aventura e suas referências em privado. Não há novos instaladores nesta entrega.

## Abrir

1. Execute `INICIAR_RPG.bat` no Windows ou `INICIAR_RPG.command` no macOS, na pasta atual do projeto. O código de desenvolvimento também pode ser aberto com `pnpm start` se as dependências estiverem instaladas.
2. Entre na aventura e escolha **Mesa → Mesa ao vivo** ou **Abrir Mesa ao vivo** na página de retomada.
3. Clique em **Organizar telas**.

Os instaladores 4.0 existentes não recebem esta atualização automaticamente. Navegador e desktop têm armazenamentos separados; transfira a campanha pelo backup de Configurações se trocar de ambiente.

## Duas ou três telas

Use a opção **Estender** nas configurações de monitores do computador. O espelhamento mostraria também seus controles privados na TV.

| Organização | Tela do mestre | Tela adicional | TV dos jogadores |
|---|---|---|---|
| Duas telas | História e controles lado a lado | — | Arena e efeitos, imagem ou texto preparado |
| Três telas | Combate completo ou direção de cena | Leitura privada da história | Arena e efeitos, imagem ou texto preparado |

Em **Organizar telas**, abra a tela dos jogadores e, se quiser, a leitura privada. Cada botão abre uma janela independente. Arraste-as para os monitores desejados. No runtime desktop há também seletores de janela e monitor, com **Mover para o monitor**. No navegador, se uma janela for bloqueada, permita pop-ups para o endereço local e clique novamente.

Na TV, mova o mouse para ver **Tela cheia**. Use o botão ou F11 conforme o navegador. As janelas funcionam no mesmo computador, offline; esta função não é transmissão para outro aparelho pela internet.

## Interpretar com efeitos

- Prepare o encontro na tela **Combate completo**, com os participantes desejados. Se ainda não houver participantes, **Preparar cena com a companhia** cria um encontro com os quatro personagens.
- Na Mesa ao vivo, escolha **Quem age** e **Alvo**.
- Use **Golpe**, **Flecha**, **Fogo**, **Gelo**, **Raio** ou **Mísseis mágicos**. Os botões usam as animações já existentes e permitem repetir o último efeito.
- A interpretação é visual: esses botões não rolam dados, não gastam recursos e não alteram PV, turnos ou histórico. As decisões e mudanças de combate continuam em **Combate completo**.
- Participantes ocultos precisam ser revelados antes de aparecer na TV. Os seletores indicam “oculto”; os botões de mostrar/ocultar modificam a visibilidade do encontro, sem mudar suas fichas.

**Mostrar arena**, **Imagem / mapa**, **Texto para a TV** e **Tela de espera** controlam o conteúdo apresentado. A seleção de imagens consulta o catálogo visual e os mapas. O texto passa por uma prévia antes de ser enviado.

**Ocultar TV** fecha uma cortina preta imediatamente. O atalho `Ctrl+Shift+B` (`Cmd+Shift+B` no Mac) funciona na janela principal quando você não está digitando. Efeitos disparados com a cortina fechada não são reproduzidos depois de reabri-la.

## Ler e consultar sem perder a cena

A leitura inclui os blocos integrais da aventura, em pergaminho, com seleção de capítulo, busca local, anterior/próxima ocorrência e ajuste da letra. A posição é salva por aventura. A janela destacada é de consulta: não reescreve a história nem grava uma segunda campanha.

Para compartilhar uma passagem, selecione o texto no pergaminho e use **Preparar trecho para TV**. Confira a prévia e envie. O documento completo nunca é transmitido automaticamente à janela dos jogadores.

**Buscar** ou `Ctrl+K` (`Cmd+K`) consulta aventuras, companhia, regras, documentos, NPCs, criaturas e notas. Aceita várias palavras e ignora diferenças de acentos e maiúsculas. O resultado aparece em prévia, sem navegar para outro módulo. Na leitura destacada, o mesmo atalho foca a busca naquela aventura.

Use **Fixar na sessão** para manter até 12 referências à mão. Elas apontam para os conteúdos atuais; não duplicam nem alteram suas fontes. **Nota rápida** registra uma entrada privada no diário. Ao navegar para outros módulos, a barra inferior mantém acesso à Mesa ao vivo, janelas, busca e cortina.

## Persistência e privacidade

As referências fixadas e posições de leitura entram nos backups normais; notas rápidas ficam no diário. Ao reiniciar, a TV começa em espera e nenhuma janela pública é aberta automaticamente. Se o mestre desconectar, a TV oculta a cena e aguarda reconexão. A leitura destacada permanece disponível para consulta, mas precisa do mestre conectado para enviar texto ou gravar posição.

Na TV são enviados apenas os participantes revelados e os dados visuais necessários. PV, CA, notas privadas, inimigos ocultos e o documento integral ficam com o mestre. Isso protege a apresentação; não é um sistema de autenticação contra alguém com acesso ao seu computador.

Fechar uma janela não fecha a campanha. Para terminar, use **Organizar telas → Encerrar apresentação**. Salve/feche o aplicativo principal normalmente. Não feche o servidor local enquanto estiver usando o modo navegador.
