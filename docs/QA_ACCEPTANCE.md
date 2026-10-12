# QA — RPG Master Fangorn V1

## Automatizado (executar `node test/verify.js`)

- PASS — 1.060 blocos e 66 headings da aventura carregados localmente.
- PASS — atos I–V, epílogo e recompensa encontrados nos dados.
- PASS — quatro personagens e as cinco abas da planilha de Nando presentes.
- PASS — hashes dos cinco arquivos originais conferidos contra o manifesto quando o pacote de handover está disponível.
- PASS — sintaxe do runtime validada com `node --check js/app.js`.
- PASS — runtime não contém URL HTTP(S), CDN ou API externa.
- PASS — controles principais possuem regra CSS de placa forjada (chanfro, moldura interna, textura, hover/ativo/pressionado) e o JavaScript de navegação não foi alterado.

## Manual de aceite a executar no navegador-alvo

1. Abrir `ABRIR_RPG.html` em Chrome/Edge (Windows) e Safari/Chrome (macOS); confirmar a capa e a história.
2. Em 1536×1024, 1920×1080 e 1366×768, conferir cabeçalho fixo, rolagem apenas interna e ausência de clipping.
3. Abrir quatro fichas; alterar PV do Anão 52→25 (deve exibir combate), restaurar 52; alterar atributo de Elenya, item de Calion e nota de Nando. Fechar/reabrir e confirmar persistência.
4. Importar JPG/PNG, recarregar e abrir no lightbox; exportar backup, restaurar e validar dados.
5. Confirmar Escape no modal e submenu Jogadores com mouse/teclado.

## Limite desta execução

O ambiente de validação bloqueou abrir arquivos `file://` em seu navegador automatizado. Por isso não há screenshots alegadas como reais nesta entrega e a inspeção visual em navegador local permanece como validação manual pendente — não foi substituída por imagens de mockup.
