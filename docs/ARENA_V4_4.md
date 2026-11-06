# Arena 4.4 — animações e magias

Abra **Mesa → Combate**, escolha atacante, alvo e ação. **Confirmar ação** reproduz a sequência e retorna ao repouso. O atacante continua selecionado; **Próximo** permanece como comando explícito para trocar o turno.

## Quadros individuais

O catálogo visual possui 75 identidades: 71 selecionáveis no elenco padrão e quatro bases narrativas preparadas. A [lista de cobertura](COBERTURA_ANIMACOES_V4_4.md) identifica todas elas. Cada identidade tem quatro PNGs transparentes, de 480 × 480 pixels, sem deformação de proporção: repouso, antecipação, ataque e recuperação. A animação usa arquivos separados, sem deslocar uma janela sobre uma faixa compartilhada.

As seis sequências anteriores foram isoladas preservando sua arte. A Elenya tinha poses com larguras diferentes: o recorte em quatro colunas iguais cortava adagas e incluía partes de outra pose. Agora a extração segue a silhueta transparente de cada figura. As outras 69 identidades receberam sequências novas, baseadas na própria miniatura. Pés e área ocupada por todas as poses determinam âncora, escala e espaço na arena.

Cópias vinculadas a uma identidade do catálogo herdam sua animação. Cadastros inteiramente novos, sem vínculo visual, continuam usando a imagem fornecida pelo mestre: não existe geração automática de arte durante a execução offline. Os retratos das fichas e da biblioteca permanecem disponíveis.

## Magias

Selecione **Ação → Magia** e escolha:

| Efeito | Apresentação |
| --- | --- |
| Fogo | Projétil flamejante e explosão de brasas. |
| Gelo | Lança de gelo e estilhaços. |
| Eletricidade | Descarga ramificada. |
| Mísseis mágicos | Três projéteis em trajetórias curvas. |
| Vento | Rajada espiral horizontal. |
| Pedra | Rocha em arco, fragmentos e impacto no chão. |
| Furacão | Funil vertical, faixas de vento e detritos em rotação. |
| Meteoro | Rocha incandescente em queda, onda de choque e fragmentos. |
| Nevasca | Nuvem fria, precipitação de gelo e cristais. |
| Onda das marés | Onda com crista curva e espuma. |
| Nuvem venenosa | Névoa esverdeada e bolhas ascendentes. |
| Lanças das sombras | Portal e três lanças escuras. |
| Luz sagrada | Estrela, coluna de luz e anel luminoso. |

**À distância** continua lançando uma flecha. **Cura** usa a aura descendente. São opções de apresentação: não modificam regras, dano, resistência, custo de magia ou valores das fichas. O mestre informa os valores pelos controles existentes.

**Pular efeito** interrompe a animação e limpa a cena. A preferência de movimento reduzido do sistema continua respeitada.

## Cenário e TV

Mordor recebeu uma nova pintura em pixel art, com superfície aberta, ruínas, montanhas, vulcão distante e torre com olho discreto. Os outros quatro cenários e os movimentos ambientais foram mantidos.

Use **TV de combate** para mostrar apenas a arena. Ela usa os mesmos quadros, cenário e efeitos. Após atualizar o código, pressione **F5 nas duas janelas**. Toda a arte e os efeitos são locais; não é necessária conexão para jogar.

Checkpoint anterior: `checkpoint-before-animated-catalog-4.4.0`, no commit `7584dd2`. Evidências e limites de teste estão no [QA desta versão](QA_ARENA_V4_4.md).
