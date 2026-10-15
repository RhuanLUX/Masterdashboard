# Pipeline de arte individual — V3.2.3

## Identidade e integração

1. Usar o ID estável da fonte (`character:`, `creature:` ou `visual:`), nunca o nome de exibição.
2. Conferir história e retrato individual; não reutilizar espécie/identidade diferente.
3. Criar corpo inteiro, fundo alfa real, margem livre para armas/pés, estilo pixel-art
   dark fantasy consistente com os quatro aventureiros aprovados.
4. Registrar o asset, referência, direção nativa e procedência em `provenance.json`.
5. Em `RPGBattleCatalog.sprites`, mapear `asset`, `columns:1`, `nativeFacing:'right'`
   para novas bases. Não declarar quatro quadros em imagem que só tem um.
6. Para folhas antigas, declarar o número real de colunas; `frame` fixa uma variante
   e `frameFacings` corrige direção nativa quando ela varia entre quadros.
7. Executar auditoria de alfa e inspeção visual, depois testar ambos os lados,
   ataque, dano, incapacitado e densidades/resoluções da arena.

Não rasterizar retratos existentes para fingir que são sprites. Não redesenhar os
quatro aventureiros nem o cenário nesta linha de evolução. A folha de contato é
somente evidência de QA e nunca é carregada como asset do jogo.

## NPCs narrativos

Pai da Elenya, Harl Durn, Dito Afinadinho e Pai do Inverno já estão no resolvedor,
mas sua elegibilidade de combate não foi alterada. Uma futura inclusão deliberada
deve passar pelo mesmo catálogo e fornecer os dados autorizados pelo mestre.
O renderer já reconhece os IDs, sem uma segunda lista de sprites ou cópia espelhada.

## Movimento e armazenamento

Bases individuais usam balanço rígido pelo pivô dos pés e ação curta procedural.
Folhas existentes mantêm os quadros aprovados. Não há GIF, download em execução
ou API externa. Os PNGs originais gerados são preservados; dimensões reais e
contagem de pixels transparentes estão em `docs/qa-v3.2.3/assets.json`.
O renderer mede o alfa, escala proporcionalmente e reserva espaço para as duas direções.

Equipe e visibilidade pertencem à instância, enquanto arte e identidade pertencem
à fonte. Trocar de equipe jamais deve trocar de ficha ou revelar um participante.

## Reproduzir QA

Requer Node, `sharp`, `playwright` e um navegador Chromium instalado no ambiente de
desenvolvimento (não são novas dependências do usuário final). Defina `NODE_PATH`
para essas bibliotecas se não estiverem no projeto e `ARENA_QA_BROWSER` para o
executável local se não usar o Edge padrão do Windows.

```text
node tests/sprite-assets-audit.cjs
node tests/battle-catalog-audit.cjs
node tests/battle-teams-audit.cjs
node tests/battle-arena-audit.cjs
node tests/battle-roster-browser.cjs
node tests/arena-teams-browser.cjs
node tests/d100-regression.cjs
node tests/dice-browser-smoke.cjs
```

Para a regressão visual anterior, defina `ARENA_QA_OUTPUT=docs/qa-v3.2.3/regression`
no shell e execute `node tests/arena-visual.cjs after`. As suítes usam perfis
temporários e servidores locais próprios; não devem ser apontadas para o perfil
pessoal do navegador. Conferir relatórios JSON e abrir as capturas antes de entregar.
