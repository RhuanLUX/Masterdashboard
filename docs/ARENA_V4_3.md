# Arena 4.3 — miniaturas, cenários e efeitos

Abra **Mesa → Combate**. Atualize o aplicativo e a **TV de combate** com F5 para carregar esta versão. Não é necessário instalar outro programa.

## Escolher o ambiente

O seletor **Cenário** fica no cabeçalho da arena. A escolha pertence ao encontro, permanece depois de reabrir e acompanha o backup JSON.

| Cenário | Ambientação |
| --- | --- |
| Mordor · A torre distante | Cenário aprovado preservado, brasas e passagem eventual de um dragão distante. |
| Fangorn · Clareira antiga | Árvores antigas, arco em ruínas, folhagem ao vento e folhas atravessando a clareira. |
| Valfenda · Ruínas élficas | Pátio élfico, cascatas, reflexos na água e vegetação em movimento. |
| Estrada Real · Ponte e vila | Castelo ao pôr do sol, bandeiras, folhas e uma pequena carroça que cruza a ponte de tempos em tempos. |
| Hrim · Passagem de inverno | Montanhas nevadas, portal anão, neve e aparições distantes de um dragão. |

O movimento ambiental usa quatro fases a 8 Hz, com o solo estável. O relógio e a semente do encontro alinham a ambientação do mestre e da TV. Efeitos e movimentação dos combatentes mantêm a atualização do Pixi, limitada a 60 FPS. A preferência do sistema por movimento reduzido é respeitada. Nenhuma decoração recebe cliques.

## Miniaturas

As 24 fichas de NPCs e as 18 criaturas do compêndio ampliado receberam arte própria. Cada arquivo contém somente um personagem de corpo inteiro, com transparência e até 480 pixels por dimensão. A lista de arquivos, referências e prompts está em [PROVENANCE.json](../assets/pixel-sprites/v4.3/PROVENANCE.json); as [pranchas de conferência](qa-arena-enrichment/miniatures-0.png) mostram o resultado.

O contato com o chão considera a silhueta e os pés reais. O renderer espelha a miniatura conforme o lado e adapta o espaço à quantidade de participantes. As novas bases usam os movimentos de repouso, ataque e queda do Pixi; não são novas sequências desenhadas quadro a quadro. As quatro animações anteriores da companhia permanecem intactas.

Todos os 71 participantes selecionáveis do catálogo padrão estão cobertos. Quatro entidades narrativas adicionais têm bases preparadas: Pai da Elenya, Harl Durn, Dito Afinadinho e Pai do Inverno. Cópias feitas a partir de agora pelo compêndio herdam a miniatura. Um cadastro inteiramente novo ou uma cópia antiga sem vínculo visual ainda precisa de arte própria; não se associa um monstro diferente pelo nome.

## Ataques e cura

- **À distância:** flecha com haste, ponta e penas.
- **Magia → Fogo:** chama com núcleo luminoso, cauda e labaredas de impacto.
- **Magia → Gelo:** projétil de cristal e fragmentos.
- **Magia → Eletricidade:** descarga ramificada.
- **Magia → Mísseis mágicos:** três projéteis arcanos curvos.
- **Magia → Vento:** vórtice translúcido, anéis de ar e folhas.
- **Magia → Pedra:** rocha facetada em arco, fragmentos e poeira no impacto.
- **Cura:** feixe descendente, halo, círculo no chão e partículas luminosas no receptor.

São efeitos visuais. Dano, cura, recursos e decisões continuam sob controle do mestre, com os valores e regras atuais. A seleção do atacante não volta automaticamente à Elenya.

## TV e dados

**TV de combate** mostra a mesma arena, cenário, participantes e ações. Não apresenta controles, PV privados, fichas ou notas do mestre. A configuração do cenário é um campo do encontro e usa o fluxo existente de salvar, exportar e restaurar a campanha.

Todo o material desta arena é local. Os quatro fundos novos foram gerados individualmente; a procedência está em [PROVENANCE.json](../assets/battle-scenes/v4.3/PROVENANCE.json). O dragão distante reutiliza a arte já licenciada no projeto, de ZaPaper/Buko Studios/PlayCraft, sob CC BY 3.0; consulte [créditos e licença](../assets/themes/dragon-flight/SOURCE.md).

Nenhum instalador foi gerado. A validação desta entrega está no [relatório de QA](QA_ARENA_V4_3.md).
