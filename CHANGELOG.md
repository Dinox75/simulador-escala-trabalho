# Changelog

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato segue uma organização simples por versões, facilitando o acompanhamento da evolução do projeto ao longo do tempo.

---

## [v0.1.0] - Primeira versão CLI funcional

### Adicionado

- Aplicação inicial em Python executada via terminal.
- Menu interativo com opções para:
  - consultar uma data específica;
  - visualizar os próximos dias da escala;
  - alterar a escala atual;
  - sair do sistema.
- Lógica para cálculo de escalas baseadas em ciclos de trabalho e folga.
- Suporte inicial para escalas como:
  - `6x3`;
  - `5x2`;
  - `4x4`;
  - modelos personalizados baseados em dias.
- Função para consultar se uma data será de trabalho ou folga.
- Função para gerar os próximos dias da escala.
- Validação de datas informadas pelo usuário.
- Validação de entradas numéricas.
- Validação de opções do menu.
- Exibição visual dos status no terminal:
  - `🟢 Trabalhando`;
  - `🌙 Folga`.
- Separação do projeto em módulos:
  - `main.py`;
  - `escala.py`;
  - `validacoes.py`;
  - `interface.py`.
- Testes automatizados com `pytest`.
- Arquivo `pytest.ini` para configuração dos testes.
- Arquivo `requirements.txt` com dependências do projeto.
- README profissional com:
  - banner;
  - badges;
  - organogramas;
  - roadmap;
  - exemplos de uso;
  - instruções de execução;
  - seção de testes;
  - visão futura.
- Documento `docs/visao_produto.md` com a visão estratégica do produto.
- Demo web inicial em HTML, CSS e JavaScript.
- Animações leves na demo web.
- Licença proprietária de uso não comercial.

### Melhorado

- Organização do código com separação de responsabilidades.
- Clareza das mensagens exibidas no terminal.
- Aparência visual do README.
- Documentação do projeto para apresentação em portfólio.
- Estrutura do projeto para facilitar futuras evoluções.

### Testado

- Testes para validar o status de trabalho e folga.
- Testes para validar a sequência de dias gerada pela escala.
- Validação da escala `6x3` com dias de trabalho e folga.

---

## Próximas versões planejadas

### [v0.1.1] - Ajustes de apresentação e documentação

Planejado:

- Ativar GitHub Pages para a demo web.
- Adicionar link direto da demo no README.
- Melhorar roteiro de apresentação do projeto.
- Ajustar detalhes visuais da documentação.

### [v0.2.0] - Persistência de dados

Planejado:

- Criar salvamento de escalas em JSON.
- Permitir cadastro de escalas favoritas.
- Reutilizar escalas salvas.
- Preparar base para cadastro de funcionários.

### [v0.3.0] - Visualização mensal

Planejado:

- Criar visualização mensal da escala.
- Exibir dias de trabalho e folga em formato de calendário.
- Melhorar apresentação dos resultados no terminal e na demo web.

### [v0.4.0] - Cadastro inicial de funcionários

Planejado:

- Cadastrar funcionários.
- Associar funcionários a escalas.
- Consultar escala individual.
- Preparar evolução para uma solução corporativa.

---

## Observação

Este projeto está em evolução contínua.

A versão `v0.1.0` representa a primeira base funcional em CLI, com foco em lógica de escala, organização modular, testes automatizados, documentação profissional e visão futura de produto.# Changelog

Todas as mudanças relevantes deste projeto serão documentadas neste arquivo.

O formato segue uma organização simples por versões, facilitando o acompanhamento da evolução do projeto ao longo do tempo.

---

## [v0.1.0] - Primeira versão CLI funcional

### Adicionado

- Aplicação inicial em Python executada via terminal.
- Menu interativo com opções para:
  - consultar uma data específica;
  - visualizar os próximos dias da escala;
  - alterar a escala atual;
  - sair do sistema.
- Lógica para cálculo de escalas baseadas em ciclos de trabalho e folga.
- Suporte inicial para escalas como:
  - `6x3`;
  - `5x2`;
  - `4x4`;
  - modelos personalizados baseados em dias.
- Função para consultar se uma data será de trabalho ou folga.
- Função para gerar os próximos dias da escala.
- Validação de datas informadas pelo usuário.
- Validação de entradas numéricas.
- Validação de opções do menu.
- Exibição visual dos status no terminal:
  - `🟢 Trabalhando`;
  - `🌙 Folga`.
- Separação do projeto em módulos:
  - `main.py`;
  - `escala.py`;
  - `validacoes.py`;
  - `interface.py`.
- Testes automatizados com `pytest`.
- Arquivo `pytest.ini` para configuração dos testes.
- Arquivo `requirements.txt` com dependências do projeto.
- README profissional com:
  - banner;
  - badges;
  - organogramas;
  - roadmap;
  - exemplos de uso;
  - instruções de execução;
  - seção de testes;
  - visão futura.
- Documento `docs/visao_produto.md` com a visão estratégica do produto.
- Demo web inicial em HTML, CSS e JavaScript.
- Animações leves na demo web.
- Licença proprietária de uso não comercial.

### Melhorado

- Organização do código com separação de responsabilidades.
- Clareza das mensagens exibidas no terminal.
- Aparência visual do README.
- Documentação do projeto para apresentação em portfólio.
- Estrutura do projeto para facilitar futuras evoluções.

### Testado

- Testes para validar o status de trabalho e folga.
- Testes para validar a sequência de dias gerada pela escala.
- Validação da escala `6x3` com dias de trabalho e folga.

---

## Próximas versões planejadas

### [v0.1.1] - Ajustes de apresentação e documentação

Planejado:

- Ativar GitHub Pages para a demo web.
- Adicionar link direto da demo no README.
- Melhorar roteiro de apresentação do projeto.
- Ajustar detalhes visuais da documentação.

### [v0.2.0] - Persistência de dados

Planejado:

- Criar salvamento de escalas em JSON.
- Permitir cadastro de escalas favoritas.
- Reutilizar escalas salvas.
- Preparar base para cadastro de funcionários.

### [v0.3.0] - Visualização mensal

Planejado:

- Criar visualização mensal da escala.
- Exibir dias de trabalho e folga em formato de calendário.
- Melhorar apresentação dos resultados no terminal e na demo web.

### [v0.4.0] - Cadastro inicial de funcionários

Planejado:

- Cadastrar funcionários.
- Associar funcionários a escalas.
- Consultar escala individual.
- Preparar evolução para uma solução corporativa.

---

## Observação

Este projeto está em evolução contínua.

A versão `v0.1.0` representa a primeira base funcional em CLI, com foco em lógica de escala, organização modular, testes automatizados, documentação profissional e visão futura de produto.