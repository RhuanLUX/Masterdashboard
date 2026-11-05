# QA — TV de combate e dragões 4.1.1

**Correção posterior em 4.1.2:** o teste original revelava o inimigo manualmente e não cobria inimigos não revelados de saves existentes. O proprietário encontrou a omissão de inimigo/ataque na TV. O filtro foi removido do espelhamento; veja [QA da TV espelhada](QA_TV_ESPELHADA.md).

Data: 2026-11-05. Checkpoint anterior: `checkpoint-before-combat-tv-2026-11-05` em `9037b9d`. Nenhum instalador foi gerado e nenhum workflow de empacotamento foi acionado.

## Correções

- Mesa ao vivo, leitura destacada, barra de sessão e apresentação genérica foram retiradas da interface. O menu Mesa foi mantido. Conteúdos e notas já gravados não foram apagados.
- A TV mostra somente o canvas da arena, com margem de 4 px e moldura discreta. Cabeçalhos, formulários, história, imagens e controles privados não são carregados nessa janela.
- A arena mantinha apenas a ação/magia em variáveis gerais e reconstruía atacante/alvo com base no primeiro turno. A seleção agora fica no próprio encontro e é restaurada após dano/cura, navegação e recarregamento. Mudança explícita de turno atualiza o atacante para quem joga em seguida.
- O botão Próximo foi colocado após as ações de iniciativa/ordenação. Não foi acrescentada troca automática de turno.
- A silhueta estática do dragão foi substituída pelos frames de voo de ZaPaper/Buko Studios, via GitHub do Stendhal, CC BY 3.0. Fonte e licença estão na pasta do asset; recorte reproduzível em `tools/prepare-dragon-flight.cjs`. Os PNGs de cada frame são independentes.

## Resultados executados

| Verificação | Resultado |
|---|---|
| Dano de 3 e depois 4, usando Calion fora do turno atual | Atacante, alvo, magia de gelo e resultado crítico preservados; PV do alvo 100 → 93; turno permanece em 0 |
| Próximo manual | Um botão; avança uma posição por clique e atualiza o atacante |
| Recarregamento | Seleção do encontro restaurada |
| TV | Um canvas; nenhum cabeçalho, formulário, leitor, banco ou controles de mestre |
| Sincronização | Mesmo elenco revelado e efeitos com os mesmos IDs de atacante/alvo |
| Privacidade | Pacotes inspecionados sem PV, notas privadas, resumo ou metadados da seleção |
| 1920×1080, 1366×768 e 1280×800 | Arena preenche a janela; auditoria de limites sem problemas; capturas reais |
| Dragões | Três voos na intensidade normal, cinco na intensa; frames realmente alternam; trajetórias distintas |
| Pausa e limpeza | Voo pausa; trocar tema cancela as animações e remove dragões; movimento reduzido não cria dragões |
| Efeitos existentes | 30 casos de flecha e magias, dois sentidos, três resoluções, limpeza e TV passaram |
| Temas | Persistência, intensidades, pausa, backup, temas antigos e offline passaram |
| Desktop Windows | Pixi/TV com bridge isolado, d100 e persistência após reiniciar passaram em desenvolvimento |
| Núcleo | Migrações/backup, catálogo de 29 entidades, equipes, d100 e integridade das fontes passaram |
| Plataforma normal | Quatro fichas nas três resoluções; edição persistente; DOCX integral, PDF digital/OCR, versões, backup/restauração, busca e História 5 passaram |

Relatórios: [fluxo e TV](qa-combat-tv/report.json), [efeitos](qa-combat-tv/effects/report.json), [temas](qa-combat-tv/themes/report.json), [desktop](qa-combat-tv/desktop/desktop-report.json), [plataforma](qa-combat-tv/platform/browser-report.json).

Capturas: [mestre em 1366](qa-combat-tv/master-1366.png), [TV em 1366](qa-combat-tv/tv-1366.png), [TV em 1920](qa-combat-tv/tv-1920.png), [tema com dragões](qa-combat-tv/dragon-theme.png).

Os testes usam perfis isolados e bloqueiam requisições externas no navegador. Nenhuma chamada externa foi registrada. A campanha pessoal não foi usada nos testes. O navegador testado foi Edge/Windows; o runtime desktop foi Electron/Windows, sem novo empacotamento. macOS não foi reexecutado nesta rodada. A distribuição física pela TV deve ser feita no modo Estender do sistema operacional.

Para repetir: `node tests/combat-tv-browser.cjs`, `node tests/combat-effects-browser.cjs`, `node tests/ambience-themes.cjs`, `node tests/desktop-smoke.cjs`. Os três últimos aceitam `RPG_QA_OUTPUT` para escolher a pasta de evidências. O motor de combate, regras, dados, fichas, histórias e sprites dos personagens não foram substituídos.

Status: pronto para teste do proprietário. OWNER UAT não foi declarado aprovado.
