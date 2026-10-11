# Persistência e PostgreSQL

## Arquitetura atual

O projeto usa `JsonEscalaRepository` por padrão. A interface pública usa `localStorage` no navegador; a demo local pode chamar a API FastAPI, cuja persistência padrão é o arquivo `data/escalas.json`. O terminal e a API aceitam seleção explícita do repository por `ESCALA_REPOSITORY=json|postgres`.

O repository PostgreSQL está implementado em `repositories/postgres_escala_repository.py`. O schema está em `schema_postgresql.sql` e pode ser criado com `python -m database.inicializar_postgres`. O inicializador requer uma configuração PostgreSQL explícita; não há host, banco ou senha padrão que provoquem conexão acidental.

## Modelo relacional

- `escalas`: ID, nome único, tipo e timestamps.
- `escalas_ciclo_dias`: valores do ciclo por dias.
- `escalas_ciclo_horas`: valores do ciclo por horas.
- `escalas_turnos`: turnos em ordem, com chave estrangeira e exclusão em cascata.

O modelo e o schema limitam o nome a 100 caracteres, ciclos a 120 unidades totais e sequências rotativas a 60 posições.

## Selecionar PostgreSQL

JSON permanece o padrão e não exige serviço de banco. Para selecionar PostgreSQL no terminal ou na API, configure explicitamente `ESCALA_REPOSITORY=postgres` e `POSTGRES_DSN`:

```powershell
$env:ESCALA_REPOSITORY = 'postgres'
$env:POSTGRES_DSN = 'host=127.0.0.1 port=5432 dbname=simulador_escala user=postgres password=...'
python main.py
```

A API cria e fecha uma conexão por requisição. O terminal fecha a conexão ao final de cada operação de persistência. Falhas de configuração ou conexão são exibidas; o sistema não troca para JSON silenciosamente. Sem `ESCALA_REPOSITORY`, a seleção é JSON. As rotas de escrita recusam clientes remotos com HTTP 403. Ainda assim, a API não possui autenticação nem isolamento por pessoa: mantenha o servidor ligado somente a loopback e não exponha escritas na rede.

## Migração explícita JSON → PostgreSQL

`migrar_json_postgres.py` valida o arquivo e, por padrão, só exibe a prévia por tipo sem conectar ao banco. Para aplicar, exige a variável `TEST_POSTGRES_DSN` e que o nome do banco inclua `test`. A origem é sempre somente leitura. O destino precisa ter o schema instalado e nenhuma escala; a checagem e a importação são protegidas pela mesma transação. Uma falha ou divergência na leitura de retorno reverte toda a importação.

Faça a prévia sobre uma cópia temporária do JSON:

```powershell
$copia = Join-Path $env:TEMP 'escalas-migracao-teste.json'
Copy-Item data/escalas.json $copia
python migrar_json_postgres.py --source $copia
```

Somente para um banco dedicado a testes, depois de inicializar o schema e confirmar que está vazio:

```powershell
$env:TEST_POSTGRES_DSN = 'host=127.0.0.1 port=5432 dbname=simulador_escala_test user=postgres password=...'
python migrar_json_postgres.py --source $copia --apply
```

O comando recusa qualquer banco sem nome de teste e qualquer destino que já contenha escalas. Não use o fluxo `--apply` com dados de produção ou banco padrão. A integração real permanece condicionada à execução contra um PostgreSQL de teste dedicado.

## Testes

```powershell
python -m pytest
```

Os testes PostgreSQL são ignorados sem `TEST_POSTGRES_DSN`. Para executá-los, configure o DSN de um banco dedicado com `test` no nome, aplique `database/schema_postgresql.sql` nesse banco e rode:

```powershell
python -m pytest tests/test_postgres_escala_repository.py
```

Quando a variável está configurada, erros de conexão, credenciais e schema fazem os testes falharem. Não configure `POSTGRES_DSN` para habilitar testes.
