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