# QA Códice Vivo 2026 10 12

## Validações automatizadas

- `node --check js/app.js`: aprovado.
- `node test/verify.js`: aprovado.
- Regressões verificadas: História 5 com 1.060 blocos e 66 títulos; quatro fichas; cinco aventuras V2; duas fontes de regras; quatro documentos narrativos; Cidades LOTR com cinco títulos.
- Códice novo: 15 entradas automáticas da Biblioteca Visual, 8 criaturas, cinco assets gerados locais e metadados obrigatórios verificados.
- O teste continua bloqueando URLs HTTP/HTTPS no runtime local.

## QA visual local

- A Biblioteca Visual abriu com busca, filtros por categoria/origem, ordenação e cards de imagem.
- Os cinco assets PNG estáticos gerados carregaram nos cards; não há GIF ou animação nova nesta rodada.
- A aba Criaturas abriu com oito cards e filtros por tipo; as fichas rápidas exibem CA, PV, movimento, atributos, ataque, dano, habilidade e observação.
- A navegação existente para História, Aventuras, Jogadores, Dados, LOFI e Biblioteca permaneceu disponível.

## Persistência e backup

- Estado V3 mantém entradas e fichas manuais em `state.v2.visualLibrary` e `state.v2.creatures` e faz parte da exportação JSON.
- Importação aceita backups V1, V2 e V3 e executa migração não destrutiva de esquema.
- A restauração completa não foi disparada sobre o perfil local de QA para evitar substituir dados existentes.
