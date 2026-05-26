## [v0.3.0] - CRUD completo de escalas salvas

### Adicionado
- Opção para editar escalas salvas.
- Opção para excluir escalas salvas.
- Confirmação antes de editar uma escala.
- Confirmação antes de excluir uma escala.
- Função `editar_escala()` no módulo de armazenamento.
- Função `remover_escala()` no módulo de armazenamento.
- Função `confirmar_acao()` para centralizar confirmações do usuário.

### Melhorado
- Menu principal atualizado com novas opções.
- Fluxo de edição mais claro, exibindo os dados atuais antes da alteração.
- Separação de responsabilidades entre menu, validações e armazenamento.

### Testes
- Testes para remoção de escalas.
- Testes para edição de escalas.
- Validação de índice inválido.
- Validação de nome duplicado.
- Validação de configuração duplicada.

## [v0.2.0] - Escalas favoritas com persistência em JSON

### Adicionado

- Pasta `data/` para armazenar dados do projeto.
- Arquivo `data/escalas.json` para salvar escalas favoritas.
- Módulo `armazenamento.py` para carregar e salvar escalas em JSON.
- Função para listar escalas salvas.
- Opção no menu para visualizar escalas cadastradas.
- Opção para aplicar uma escala salva como escala atual.
- Opção para cadastrar novas escalas pelo terminal.
- Validação para impedir cadastro de escalas com nome duplicado.
- Validação para impedir cadastro de escalas com mesma configuração de dias trabalhados e dias de folga.
- Testes automatizados para leitura, salvamento e cadastro de escalas.

### Melhorado

- O projeto deixou de depender apenas de valores fixos no código.
- A escala atual agora pode ser alterada usando configurações previamente salvas.
- A estrutura do projeto ficou mais próxima de um sistema real com persistência de dados.

### Testado

- Carregamento de escalas salvas.
- Salvamento de escalas em JSON.
- Cadastro de nova escala.
- Bloqueio de nome duplicado.
- Bloqueio de configuração duplicada.