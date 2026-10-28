EFEITOS DE COMBATE — 28/10/2026

Checkpoint recuperável: tag anotada versao-boa-2026-10-28
Nome: Versão Boa
Commit aprovado: 1e536dc286c785fc96fb5a721aa8b288e8a555ff
Esse checkpoint preserva código e assets versionados, não substitui o backup
dos dados de campanha armazenados no navegador. Nenhum dado pessoal foi usado
ou modificado pelos testes.

USO
Mestre > Combate > Ação: Magia > escolher Fogo, Gelo, Eletricidade ou
Mísseis mágicos > selecionar atacante/alvo > Confirmar ação.
À distância agora usa uma flecha com haste, ponta e penas.
A magia escolhida permanece selecionada entre ações da mesma sessão de página.

EFEITOS
Fogo: preparação, chama projetada com rastro de brasas e explosão curta.
Gelo: preparação, cristal alongado e estilhaços no impacto.
Eletricidade: carga, raio ramificado entre atacante/alvo e dissipação.
Mísseis mágicos: três projéteis luminosos em curvas separadas e convergentes.
Flecha: trajetória levemente arqueada, orientação pela tangente e impacto.
Duração aproximada: 1,1 segundo. Sem sons novos, sem dano automático adicional.
O botão de confirmação fica temporariamente desabilitado durante a ação para
evitar confirmações duplicadas. Pular efeito cancela a apresentação local;
a janela pública termina sua animação curta normalmente.
Preferência do sistema por movimento reduzido é respeitada.

IMPLEMENTAÇÃO
Efeitos originais em Graphics/PixiJS já distribuído localmente no app.
Nenhum motor adicional, CDN, textura remota ou código externo incorporado.
Foi consultado o PixiJS Particle Emitter (MIT) como alternativa técnica:
https://github.com/pixijs-userland/particle-emitter
Não foi necessário instalar/copiar essa biblioteca.
Sprites, cenário, regras, cálculo de dano, PV/CA, dados 3D e backups preservados.
A seleção visual da magia acompanha o broadcast público; notas privadas e
valores de PV não são enviados por essa alteração.

QA EXECUTADO
Windows, Edge/Chromium headless, armazenamento isolado, tráfego restrito a localhost.
tests/combat-effects-browser.cjs: 30 casos, cinco efeitos x duas direções x
1920x1080 / 1366x768 / 1280x800. PASS.
Inclui limpeza de objetos/tweens, posição e direção de repouso, ações repetidas,
cancelamento, movimento reduzido, seletor de magia, resultado de falha,
sincronização pública, ausência de PV privados e nenhuma mudança de PV. PASS.
tests/arena-visual.cjs after: 15 cenários, integração pública, composição e
limpeza dos efeitos. PASS. Mediana de frame 16,7 ms; P95 20,8 ms na amostra.
tests/battle-teams-audit.cjs: PASS.
tests/battle-catalog-audit.cjs: 29 entidades, zero fallback, PASS.
tests/d100-regression.cjs: cinco casos, 20 rolagens, bônus/combinação, PASS.

EVIDÊNCIAS
report.json: novos efeitos e UI.
regression/report.json: regressão do renderer.
*-flight.png / *-impact.png: capturas reais dos cinco efeitos.
master-spell-control.png / players-spell.png: controles reais e apresentação.

LIMITAÇÕES
QA nativo macOS/Safari não executado nesta máquina Windows.
Efeitos são vetoriais/procedurais, não animações articuladas novas dos personagens.
A aprovação estética final depende do proprietário; não se declara Owner UAT aprovado.
Para voltar à Versão Boa, usar a tag em um checkout separado ou uma reversão
cuidadosa do commit de efeitos; não apagar dados nem aplicar reset destrutivo.
