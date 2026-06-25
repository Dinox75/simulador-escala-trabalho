# Banco de Dados

Esta pasta contém os arquivos relacionados à futura integração do projeto **Simulador de Escala de Trabalho** com banco de dados.

Na versão atual, o projeto ainda utiliza arquivo JSON como forma principal de persistência dos dados:

```text
data/escalas.json
```

A estrutura presente nesta pasta foi criada para preparar a evolução futura do projeto para PostgreSQL.

---

## Objetivo da pasta

O objetivo da pasta `database/` é centralizar arquivos relacionados à modelagem e preparação do banco de dados.

Atualmente, ela contém:

```text
database/
├── README.md
└── schema_postgresql.sql
```

---

## Status atual

Na versão `v0.8.0`, o schema PostgreSQL é apenas uma estrutura planejada.

Isso significa que:

* a aplicação ainda não conecta no PostgreSQL;
* o `main.py` ainda não usa banco de dados;
* os dados continuam sendo carregados e salvos em JSON;
* o schema serve como base para uma futura migração.

A integração real com banco de dados está planejada para uma versão posterior.

---

## Relação com a arquitetura da v0.8.0

A versão `v0.8.0` iniciou uma refatoração arquitetural do projeto com foco em:

* modelos orientados a objetos;
* conversão entre objetos e dicionários;
* camada de repository;
* preparação para troca futura da persistência.

A ideia principal é separar o programa em camadas:

```text
main.py
↓
services / fluxo da aplicação
↓
models / classes de escala
↓
repositories / acesso aos dados
↓
JSON agora / PostgreSQL futuramente
```

Com essa separação, a aplicação não precisa depender diretamente do formato de armazenamento.

Hoje, o sistema pode usar:

```text
JsonEscalaRepository
```

No futuro, poderá usar:

```text
PostgresEscalaRepository
```

Dessa forma, a lógica principal da aplicação deverá mudar o mínimo possível quando a persistência for migrada de JSON para PostgreSQL.

---

## Arquivo schema_postgresql.sql

O arquivo:

```text
database/schema_postgresql.sql
```

define uma proposta inicial de estrutura para armazenar escalas no PostgreSQL.

Ele contém as seguintes tabelas:

```text
escalas
escalas_ciclo_dias
escalas_ciclo_horas
escalas_turnos
```

---

## Tabela escalas

A tabela `escalas` armazena os dados comuns a todos os tipos de escala.

Exemplos de informações armazenadas:

* identificador da escala;
* nome da escala;
* tipo da escala;
* data de criação;
* data de atualização.

Tipos aceitos:

```text
ciclo_dias
ciclo_horas
turno_rotativo
```

Essa tabela funciona como a tabela principal do modelo.

---

## Tabela escalas_ciclo_dias

A tabela `escalas_ciclo_dias` armazena informações específicas de escalas baseadas em dias.

Exemplo:

```text
Escala 6x3
```

Essa escala seria representada por:

```text
dias_trabalho = 6
dias_folga = 3
```

Esse tipo de escala é usado para ciclos como:

* 6x3;
* 5x2;
* 4x2.

---

## Tabela escalas_ciclo_horas

A tabela `escalas_ciclo_horas` armazena informações específicas de escalas baseadas em horas.

Exemplo:

```text
Escala 12x36
```

Essa escala seria representada por:

```text
horas_trabalho = 12
horas_folga = 36
```

Esse tipo de escala é usado para ciclos como:

* 12x36;
* 18x36;
* 24x72.

---

## Tabela escalas_turnos

A tabela `escalas_turnos` armazena a sequência de turnos de uma escala rotativa.

Cada linha representa uma posição dentro do ciclo.

Exemplo de sequência:

```text
Tarde, Tarde, Tarde, Noite, Noite, Noite, Folga
```

Essa sequência seria armazenada como:

```text
ordem 1 -> Tarde
ordem 2 -> Tarde
ordem 3 -> Tarde
ordem 4 -> Noite
ordem 5 -> Noite
ordem 6 -> Noite
ordem 7 -> Folga
```

Essa estrutura permite representar escalas rotativas simples ou complexas.

---

## Escala real de 24 dias

A escala real de 24 dias adicionada ao projeto pode ser representada no banco através da tabela `escalas_turnos`.

Sequência:

```text
Tarde x3
Noite x3
Folga x3
Tarde x3
Noite x3
Folga x2
Manhã x6
Folga x1
```

Total:

```text
24 dias de ciclo
```

Distribuição:

```text
Tarde: 6 dias
Noite: 6 dias
Manhã: 6 dias
Folga: 6 dias
```

No banco, cada dia do ciclo seria salvo como uma linha na tabela `escalas_turnos`, respeitando a ordem da sequência.

---

## Por que não usar uma única tabela?

Uma alternativa seria criar uma única tabela com muitos campos, como:

```text
nome
tipo
dias_trabalho
dias_folga
horas_trabalho
horas_folga
sequencia_turnos
```

Porém, essa estrutura deixaria muitos campos vazios dependendo do tipo da escala.

Exemplos:

* uma escala 6x3 não usa `horas_trabalho`;
* uma escala 12x36 não usa `dias_trabalho`;
* um turno rotativo não usa `dias_folga` nem `horas_folga`.

Por isso, a estrutura foi dividida em uma tabela principal e tabelas específicas por tipo.

Essa abordagem deixa o banco mais organizado, mais claro e mais fácil de evoluir.

---

## Relação com os modelos POO

Na v0.8.0, o projeto passou a contar com classes para representar os tipos de escala.

Exemplos:

```text
EscalaCicloDias
EscalaCicloHoras
EscalaTurnoRotativo
```

Essas classes representam a lógica da aplicação.

O banco de dados representa a persistência.

A separação entre essas partes permite que o projeto evolua de forma mais organizada:

```text
Models -> representam os dados e comportamentos
Repositories -> cuidam do acesso aos dados
Database -> define a estrutura futura do banco
```

---

## Repository

A camada de repository foi criada para evitar que a aplicação dependa diretamente de um formato específico de armazenamento.

Atualmente, o projeto usa:

```text
JsonEscalaRepository
```

Esse repository trabalha com o arquivo:

```text
data/escalas.json
```

No futuro, poderá ser criado:

```text
PostgresEscalaRepository
```

Esse novo repository será responsável por salvar, listar, buscar e excluir escalas usando PostgreSQL.

A vantagem dessa abordagem é que o restante do sistema não precisa saber se os dados vêm de JSON ou de banco de dados.

---

## Próximos passos planejados

Possíveis melhorias futuras:

* criar script de migração do JSON para PostgreSQL;
* criar `PostgresEscalaRepository`;
* adicionar conexão com banco usando Python;
* configurar variáveis de ambiente;
* implementar migrations;
* adicionar testes de integração com banco;
* permitir alternar entre JSON e PostgreSQL;
* preparar o projeto para uma interface web mais completa.

---

## Observação

Este schema é uma proposta inicial e poderá ser ajustado nas próximas versões conforme o projeto evoluir.

Na versão atual, ele serve como documentação técnica e preparação para a futura camada de banco de dados.

A aplicação continua funcionando com JSON, mas agora possui uma base arquitetural mais preparada para crescer.
