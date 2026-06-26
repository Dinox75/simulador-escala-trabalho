

## [0.8.0] - Refatoração arquitetural com POO e preparação para banco de dados

### Adicionado

* Criada pasta `models/` para centralizar os modelos orientados a objetos do projeto.
* Adicionada classe `EscalaCicloDias` para representar escalas baseadas em dias, como `6x3`, `5x2` e `4x2`.
* Adicionada classe `EscalaCicloHoras` para representar escalas baseadas em horas, como `12x36`, `18x36` e `24x72`.
* Adicionada classe `EscalaTurnoRotativo` para representar escalas com sequência de turnos, incluindo turnos como `Manhã`, `Tarde`, `Noite` e `Folga`.
* Adicionado suporte a conversão de objetos para dicionários com métodos `to_dict()`.
* Adicionado suporte a criação de objetos a partir de dicionários com métodos `from_dict()`.
* Criado arquivo `models/escala_factory.py` para converter automaticamente dicionários em objetos de escala.
* Adicionadas funções para converter listas de escalas entre objetos e dicionários.
* Criada pasta `repositories/` para iniciar a separação da camada de persistência.
* Adicionado `JsonEscalaRepository` para listar, salvar, adicionar, buscar e excluir escalas usando arquivo JSON.
* Criada pasta `database/` para centralizar arquivos relacionados à futura integração com banco de dados.
* Adicionado arquivo `database/schema_postgresql.sql` com proposta inicial de schema para PostgreSQL.
* Adicionado arquivo `database/README.md` documentando a estrutura planejada para banco de dados.
- Adicionada integração gradual do `armazenamento.py` com a camada `EscalaService`.
- Adicionados testes de integração para validar o fluxo entre `armazenamento.py`, `EscalaService`, `JsonEscalaRepository` e JSON.

### Melhorado

* Iniciada a separação entre regras de negócio, modelos de dados e persistência.
* O projeto passou a ter uma base mais preparada para evolução futura com banco de dados.
* A estrutura interna ficou mais próxima de uma arquitetura profissional, usando camadas como `models`, `repositories` e `database`.
* A persistência em JSON passou a ter uma camada própria de repository, facilitando uma futura troca para PostgreSQL.
* A nova estrutura mantém compatibilidade com o formato atual de dados em JSON.
- O gerenciamento de escalas passou a usar a nova camada de service para adicionar, editar e remover registros.
- O `armazenamento.py` manteve compatibilidade com o fluxo antigo, mas passou a utilizar a arquitetura nova internamente.
- A migração foi feita preservando os retornos esperados pelo menu principal, como `sucesso`, `nome_duplicado`, `configuracao_duplicada`, `indice_invalido`, `sequencia_vazia` e `turno_invalido`.

### Testes

* Adicionados testes para a classe `EscalaCicloDias`.
* Adicionados testes para a classe `EscalaCicloHoras`.
* Adicionados testes para a classe `EscalaTurnoRotativo`.
* Adicionados testes para a factory de criação de escalas.
* Adicionados testes para conversão entre dicionários e objetos.
* Adicionados testes para o `JsonEscalaRepository`.
* Mantidos os testes anteriores de cálculo, armazenamento, validações, modelos predefinidos e turnos rotativos.
- Adicionados testes cobrindo adição de escala por dias usando service.
- Adicionados testes cobrindo adição de escala por horas usando service.
- Adicionados testes cobrindo adição de turno rotativo usando service.
- Adicionados testes cobrindo edição e remoção de escalas usando service.
- Adicionados testes garantindo que a montagem de sequência por blocos continua funcionando após a migração.

### Banco de dados

* Criado schema inicial para futura integração com PostgreSQL.
* Adicionada tabela principal `escalas`.
* Adicionada tabela `escalas_ciclo_dias`.
* Adicionada tabela `escalas_ciclo_horas`.
* Adicionada tabela `escalas_turnos`.
* Adicionadas constraints para validar tipos de escala, valores positivos e turnos válidos.
* Adicionados índices iniciais para consultas por tipo de escala e por sequência de turnos.

### Observação

A versão `v0.8.0` ainda está em desenvolvimento.

Nesta fase, a aplicação principal continua funcionando com JSON, mas a base arquitetural foi preparada para uma futura integração com PostgreSQL.

A integração real com banco de dados ficará para uma versão posterior.


## [0.7.0] - Modelos predefinidos de escala

### Adicionado

- Adicionado arquivo `modelos_escala.py` para centralizar modelos prontos de escala.
- Adicionados modelos predefinidos:
  - Escala 6x3;
  - Escala 5x2;
  - Escala 4x2;
  - Escala 12x36;
  - Turno rotativo simples;
  - Minha escala real 24 dias.
- Adicionada função para listar todos os modelos disponíveis.
- Adicionada escala real de 24 dias baseada em ciclo rotativo:
  - `Tarde x3`;
  - `Noite x3`;
  - `Folga x3`;
  - `Tarde x3`;
  - `Noite x3`;
  - `Folga x2`;
  - `Manhã x6`;
  - `Folga x1`.
- Adicionada integração dos modelos predefinidos ao menu principal.
- Adicionada opção para aplicar um modelo predefinido como escala atual.
- Adicionada opção para salvar um modelo predefinido nas escalas salvas.

### Melhorado

- O usuário não precisa mais criar manualmente escalas comuns como `6x3`, `5x2`, `4x2` e `12x36`.
- A criação de escalas rotativas complexas ficou mais prática usando modelos prontos.
- A escala real de 24 dias pode ser aplicada rapidamente sem digitar toda a sequência manualmente.
- O fluxo de alteração de escala ficou mais objetivo, separando modelos predefinidos de escalas personalizadas.
- O projeto passa a ter uma base mais útil para uso real, não apenas para simulação genérica.

### Corrigido

- Corrigido desalinhamento anterior entre a documentação e a funcionalidade de montagem por blocos.
- Corrigido nome da escala administrativa, se aplicável.

### Testes

- Adicionados testes para os modelos predefinidos.
- Adicionados testes para validar a escala real de 24 dias.
- Testado se a escala real possui exatamente 24 dias.
- Testado se a escala real mantém a ordem correta dos turnos.
- Testado se a escala real possui:
  - 6 dias de Tarde;
  - 6 dias de Noite;
  - 6 dias de Manhã;
  - 6 dias de Folga.
- Mantidos os testes existentes de cálculo, armazenamento, validação e turno rotativo.

### Observação

Esta versão marca uma mudança importante no projeto: além de permitir criar escalas personalizadas, o sistema agora oferece modelos prontos para uso. Isso torna a aplicação mais prática para o usuário final e prepara a base para futuras melhorias, como refatoração com orientação a objetos, banco de dados e interface mais completa.

## [0.6.2] - Correção da montagem por blocos

### Adicionado

* Adicionada função pura para montar sequência de turnos por blocos.
* Adicionados testes automatizados para validar a montagem de sequência por blocos.
* Integrada a montagem por blocos ao menu principal da aplicação.
* Adicionada opção para o usuário escolher entre:

  * digitar a sequência manualmente;
  * montar a sequência por blocos.

### Corrigido

* Corrigido desalinhamento entre documentação e implementação da `v0.6.1`.
* A funcionalidade de montagem por blocos, já mencionada no README e no CHANGELOG, passou a estar disponível de fato no fluxo principal da CLI.
* Corrigido o fluxo de criação de turnos rotativos para permitir montar ciclos maiores com mais segurança e menos digitação manual.

### Melhorado

* O cadastro de turnos rotativos ficou mais guiado e prático.
* O usuário agora pode criar sequências como `Tarde x3`, `Noite x3` e `Folga x3` sem digitar cada turno individualmente.
* A base do projeto ficou mais preparada para modelos complexos de escala, como ciclos rotativos de 24 dias.

### Testes

* Adicionados testes para montagem de sequência por blocos.
* Validada montagem correta de sequências com turnos normalizados.
* Validado bloqueio de turnos inválidos dentro dos blocos.
* Validado bloqueio de quantidades inválidas, como zero ou valores negativos.

### Observação

Esta versão foi criada como uma correção complementar da `v0.6.1`. O foco foi garantir que a montagem por blocos estivesse realmente integrada ao sistema antes da evolução para modelos predefinidos na `v0.7.0`.


## [0.6.1] - Refinamento do turno rotativo

### Adicionado

* Adicionada normalização automática dos nomes dos turnos.
* Adicionada validação para bloquear turnos inválidos em escalas rotativas.
* Adicionada montagem de sequência de turno rotativo por blocos.
* Adicionada prévia da sequência antes de aplicar ou salvar uma escala rotativa.
* Adicionada exibição do total de dias do ciclo da sequência rotativa.

### Melhorado

* Entrada de turnos agora aceita variações como `manha`, `MANHA`, `manhã`, `tarde`, `noite` e `folga`, convertendo automaticamente para nomes padronizados.
* Fluxo de criação de turno rotativo ficou mais guiado e menos dependente de digitação manual longa.
* Mensagens de erro ficaram mais claras quando a sequência está vazia ou contém turnos inválidos.
* O usuário agora pode montar ciclos maiores com menos risco de erro, usando blocos como `Tarde x3`, `Noite x3` e `Folga x3`.

### Corrigido

* Evitado salvamento de escalas rotativas com nomes de turnos fora do padrão permitido.
* Reduzido o risco de inconsistência no arquivo JSON causada por turnos digitados com maiúsculas, espaços extras ou ausência de acento.

### Testes

* Adicionados testes para normalização de turnos.
* Adicionados testes para validação de turnos inválidos.
* Mantidos os testes de cálculo, geração, cadastro e edição de escalas rotativas.

### Observação

Esta versão não altera a regra principal de cálculo do turno rotativo. O foco da `v0.6.1` é refinar a experiência de cadastro, melhorar a segurança da entrada de dados e preparar a base para ciclos rotativos mais complexos nas próximas versões.


## [0.6.0] - Suporte inicial a turno rotativo

### Adicionado
- Suporte funcional ao tipo de escala `turno_rotativo`.
- Cálculo de status por sequência de turnos.
- Geração de próximos dias para escalas com turnos rotativos.
- Cadastro de escalas de turno rotativo no CLI.
- Edição de escalas de turno rotativo no CLI.
- Aplicação de escalas rotativas salvas como escala atual.
- Validação para impedir sequência de turnos vazia.
- Testes automatizados para cálculo, geração, cadastro e edição de turno rotativo.

### Alterado
- Menu principal agora permite usar escalas por dias, por horas e por turno rotativo.
- Fluxo de cadastro e edição foi expandido para suportar sequência de turnos.
- Exibição da escala atual agora mostra a sequência do turno rotativo.

### Mantido
- Compatibilidade com escalas por dias.
- Compatibilidade com escalas por horas.
- Suporte à escala 12x36.
- Persistência em JSON.
- Testes automatizados com `pytest`.

### Observação
Esta versão entrega a primeira implementação funcional do turno rotativo. Melhorias de interface, refatoração e recursos avançados podem ser evoluídos em versões futuras.

## [0.5.0] - Escalas por horas e suporte inicial ao 12x36

### Adicionado
- Suporte ao tipo de escala `ciclo_horas`.
- Cálculo real de status para escalas por horas.
- Suporte inicial à escala 12x36.
- Geração de próximos períodos para escalas por horas.
- Cadastro, listagem, aplicação, edição e exclusão de escalas por horas no CLI.
- Leitura de data e hora no formato `dd/mm/aaaa hh:mm`.
- Novos testes para cálculo, períodos e armazenamento de escalas por horas.

### Alterado
- Menu do CLI adaptado para trabalhar com escalas por dias e por horas.
- Exibição de escalas salvas agora mostra o tipo da escala.
- Fluxo principal do CLI preparado para múltiplos tipos de escala.

### Mantido
- Compatibilidade com escalas antigas por dias.
- Migração automática de escalas antigas sem campo `tipo`.

## [v0.4.0] - Preparação para múltiplos tipos de escala

### Adicionado
- Adicionado campo `tipo` nas escalas salvas.
- Criado suporte inicial para tipos de escala:
  - `ciclo_dias`
  - `ciclo_horas`
  - `turno_rotativo`
- Criado módulo `tipos_escala.py`.
- Adicionada validação de tipos de escala suportados.
- Adicionados nomes amigáveis para os tipos de escala.
- Criado motor inicial de cálculo por tipo de escala.
- Criadas funções para cálculo e geração de próximos dias usando uma escala completa.

### Alterado
- A `main.py` passou a trabalhar com `escala_atual` como dicionário.
- A exibição de escalas salvas passou a mostrar o tipo da escala.
- O carregamento de escalas antigas agora normaliza automaticamente o campo `tipo`.
- O sistema agora migra escalas antigas sem `tipo` no arquivo JSON.

### Testes
- Reorganizados testes por responsabilidade.
- Criado arquivo de testes para tipos de escala.
- Adicionados testes para migração de escalas antigas.
- Adicionados testes para validação de tipos.
- Adicionados testes para o motor de cálculo por tipo.

### Observação
Esta versão prepara a base para futuras escalas avançadas, como `12x36`, ciclos por hora e turnos rotativos.

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