# Documentação da API - Simulador de Escala de Trabalho

Documentação dos endpoints da API do projeto **Simulador de Escala de Trabalho**.

A API foi criada na versão `v0.11.0` com o objetivo de expor funcionalidades do simulador por meio de endpoints HTTP, mantendo a lógica principal separada da interface de linha de comando.

Na versão `v0.12.0`, a API evoluiu para incluir um CRUD completo de escalas salvas, permitindo listar, criar, buscar, editar e excluir escalas por meio de requisições HTTP.

---

## Visão geral

A API permite:

- verificar se o serviço está funcionando;
- listar modelos de escala disponíveis;
- consultar o status de uma escala em uma data específica;
- consultar uma sequência de próximos dias da escala;
- listar escalas salvas;
- criar novas escalas salvas;
- buscar uma escala salva pelo nome;
- editar uma escala salva pelo nome;
- excluir uma escala salva pelo nome.

---

## Base URL local

```text
http://127.0.0.1:8000
```

---

## Executar a API localmente

Para iniciar a API em ambiente local, execute:

```powershell
uvicorn api.app:app --reload
```

Depois acesse:

```text
http://127.0.0.1:8000/docs
```

A rota `/docs` abre a documentação automática gerada pelo FastAPI.

Também é possível acessar:

```text
http://127.0.0.1:8000/redoc
```

---

## Endpoints disponíveis

| Método   | Endpoint                          | Descrição                                        |
| -------- | --------------------------------- | ------------------------------------------------ |
| `GET`    | `/health`                         | Verifica se a API está funcionando               |
| `GET`    | `/api/v1/modelos`                 | Lista os modelos de escala disponíveis           |
| `POST`   | `/api/v1/simulacao/status`        | Consulta o status de uma escala em uma data      |
| `POST`   | `/api/v1/simulacao/proximos-dias` | Retorna uma sequência de próximos dias da escala |
| `GET`    | `/api/v1/escalas`                 | Lista as escalas salvas                          |
| `POST`   | `/api/v1/escalas`                 | Cria uma nova escala salva                       |
| `GET`    | `/api/v1/escalas/{nome}`          | Busca uma escala salva pelo nome                 |
| `PUT`    | `/api/v1/escalas/{nome}`          | Edita uma escala salva pelo nome                 |
| `DELETE` | `/api/v1/escalas/{nome}`          | Exclui uma escala salva pelo nome                |

---

# Health Check

Verifica se a API está funcionando.

```http
GET /health
```

## Exemplo de resposta

```json
{
  "status": "ok",
  "message": "API do Simulador de Escala de Trabalho funcionando",
  "version": "0.12.0"
}
```

## Status esperado

```text
200 OK
```

---

# Listar modelos de escala

Retorna os modelos de escala disponíveis para simulação.

```http
GET /api/v1/modelos
```

## Exemplo de resposta

```json
{
  "modelos": [
    {
      "id": "6x3",
      "nome": "Escala 6x3",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 6 dias de trabalho e 3 dias de folga."
    },
    {
      "id": "5x2",
      "nome": "Escala 5x2",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 5 dias de trabalho e 2 dias de folga."
    },
    {
      "id": "4x2",
      "nome": "Escala 4x2",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 4 dias de trabalho e 2 dias de folga."
    },
    {
      "id": "12x36",
      "nome": "Escala 12x36",
      "tipo": "ciclo_horas",
      "descricao": "Ciclo com 12 horas de trabalho e 36 horas de folga."
    },
    {
      "id": "turno_rotativo_simples",
      "nome": "Turno rotativo simples",
      "tipo": "turno_rotativo",
      "descricao": "Sequência rotativa com turnos definidos manualmente."
    },
    {
      "id": "escala_real_24_dias",
      "nome": "Minha escala real 24 dias",
      "tipo": "turno_rotativo",
      "descricao": "Modelo de turno rotativo baseado em uma sequência de 24 dias."
    }
  ]
}
```

## Modelos disponíveis

| ID                       | Tipo             | Descrição                                                |
| ------------------------ | ---------------- | -------------------------------------------------------- |
| `6x3`                    | `ciclo_dias`     | Ciclo com 6 dias de trabalho e 3 dias de folga           |
| `5x2`                    | `ciclo_dias`     | Ciclo com 5 dias de trabalho e 2 dias de folga           |
| `4x2`                    | `ciclo_dias`     | Ciclo com 4 dias de trabalho e 2 dias de folga           |
| `12x36`                  | `ciclo_horas`    | Ciclo com 12 horas de trabalho e 36 horas de folga       |
| `turno_rotativo_simples` | `turno_rotativo` | Sequência rotativa com turnos definidos manualmente      |
| `escala_real_24_dias`    | `turno_rotativo` | Modelo de turno rotativo baseado em sequência de 24 dias |

## Status esperado

```text
200 OK
```

---

# Consultar status da escala

Consulta o status de uma escala em determinada data.

```http
POST /api/v1/simulacao/status
```

## Campos da requisição

| Campo           | Tipo     | Obrigatório          | Descrição                                        |
| --------------- | -------- | -------------------- | ------------------------------------------------ |
| `modelo_id`     | `string` | Sim                  | ID do modelo de escala                           |
| `data_inicio`   | `string` | Sim                  | Data inicial da escala no formato `dd/mm/aaaa`   |
| `data_consulta` | `string` | Sim                  | Data que será consultada no formato `dd/mm/aaaa` |
| `hora_inicio`   | `string` | Somente para `12x36` | Hora inicial no formato `HH:MM`                  |
| `hora_consulta` | `string` | Somente para `12x36` | Hora consultada no formato `HH:MM`               |

---

## Exemplo - Escala 6x3 trabalhando

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "data_consulta": "01/07/2026"
}
```

### Resposta esperada

```json
{
  "modelo_id": "6x3",
  "modelo_nome": "Escala 6x3",
  "tipo": "ciclo_dias",
  "data_inicio": "01/07/2026",
  "data_consulta": "01/07/2026",
  "status": "Trabalhando"
}
```

### Status esperado

```text
200 OK
```

---

## Exemplo - Escala 6x3 com folga

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "data_consulta": "07/07/2026"
}
```

### Resposta esperada

```json
{
  "modelo_id": "6x3",
  "modelo_nome": "Escala 6x3",
  "tipo": "ciclo_dias",
  "data_inicio": "01/07/2026",
  "data_consulta": "07/07/2026",
  "status": "Folga"
}
```

### Status esperado

```text
200 OK
```

---

## Exemplo - Escala 12x36

Para escalas por horas, é necessário informar `hora_inicio` e `hora_consulta`.

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "hora_inicio": "07:00",
  "data_consulta": "01/07/2026",
  "hora_consulta": "10:00"
}
```

### Resposta esperada

```json
{
  "modelo_id": "12x36",
  "modelo_nome": "Escala 12x36",
  "tipo": "ciclo_horas",
  "data_inicio": "01/07/2026",
  "data_consulta": "01/07/2026",
  "status": "Trabalhando"
}
```

### Status esperado

```text
200 OK
```

---

# Consultar próximos dias da escala

Retorna uma sequência de dias calculados a partir da data inicial da escala.

```http
POST /api/v1/simulacao/proximos-dias
```

## Campos da requisição

| Campo             | Tipo      | Obrigatório          | Descrição                                             |
| ----------------- | --------- | -------------------- | ----------------------------------------------------- |
| `modelo_id`       | `string`  | Sim                  | ID do modelo de escala                                |
| `data_inicio`     | `string`  | Sim                  | Data inicial da escala no formato `dd/mm/aaaa`        |
| `quantidade_dias` | `integer` | Sim                  | Quantidade de dias que serão retornados               |
| `hora_inicio`     | `string`  | Somente para `12x36` | Hora inicial no formato `HH:MM`                       |
| `hora_consulta`   | `string`  | Não                  | Hora usada para consultar cada dia no formato `HH:MM` |

## Limite de dias

O campo `quantidade_dias` aceita valores de:

| Mínimo | Máximo |
| ------ | ------ |
| `1`    | `60`   |

Caso o valor fique fora desse intervalo, a API retorna erro de validação do FastAPI.

---

## Exemplo - Próximos dias da escala 6x3

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 7
}
```

### Resposta esperada

```json
{
  "modelo_id": "6x3",
  "modelo_nome": "Escala 6x3",
  "tipo": "ciclo_dias",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 7,
  "dias": [
    {
      "data": "01/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "02/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "03/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "04/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "05/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "06/07/2026",
      "status": "Trabalhando"
    },
    {
      "data": "07/07/2026",
      "status": "Folga"
    }
  ]
}
```

### Status esperado

```text
200 OK
```

---

## Exemplo - Próximos dias da escala 12x36

Para escalas por horas, é necessário informar `hora_inicio`.

O campo `hora_consulta` é opcional. Se não for informado, a API usa a mesma hora de início.

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "hora_inicio": "07:00",
  "hora_consulta": "10:00",
  "quantidade_dias": 2
}
```

### Resposta esperada

```json
{
  "modelo_id": "12x36",
  "modelo_nome": "Escala 12x36",
  "tipo": "ciclo_horas",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 2,
  "dias": [
    {
      "data": "01/07/2026",
      "hora_consulta": "10:00",
      "status": "Trabalhando"
    },
    {
      "data": "02/07/2026",
      "hora_consulta": "10:00",
      "status": "Folga"
    }
  ]
}
```

### Status esperado

```text
200 OK
```

---

# Escalas salvas

A partir da versão `v0.12.0`, a API permite gerenciar escalas salvas por meio de um CRUD completo.

Os endpoints de escalas salvas reaproveitam a camada de service e repository do projeto.

---

## Listar escalas salvas

Retorna todas as escalas salvas no repositório padrão do projeto.

```http
GET /api/v1/escalas
```

### Exemplo de resposta

```json
{
  "total": 2,
  "escalas": [
    {
      "nome": "Escala 6x3",
      "tipo": "ciclo_dias",
      "dias_trabalho": 6,
      "dias_folga": 3
    },
    {
      "nome": "Escala 12x36",
      "tipo": "ciclo_horas",
      "horas_trabalho": 12,
      "horas_folga": 36
    }
  ]
}
```

### Status esperado

```text
200 OK
```

---

## Criar escala salva

Cria uma nova escala salva.

```http
POST /api/v1/escalas
```

### Campos da requisição

| Campo               | Tipo       | Obrigatório                 | Descrição                                      |
| ------------------- | ---------- | --------------------------- | ---------------------------------------------- |
| `nome`              | `string`   | Sim                         | Nome da escala salva                           |
| `tipo`              | `string`   | Sim                         | Tipo da escala                                 |
| `dias_trabalho`     | `integer`  | Para `ciclo_dias`           | Quantidade de dias de trabalho                 |
| `dias_folga`        | `integer`  | Para `ciclo_dias`           | Quantidade de dias de folga                    |
| `horas_trabalho`    | `integer`  | Para `ciclo_horas`          | Quantidade de horas de trabalho                |
| `horas_folga`       | `integer`  | Para `ciclo_horas`          | Quantidade de horas de folga                   |
| `sequencia_turnos`  | `array`    | Para `turno_rotativo`       | Sequência de turnos da escala                  |

### Tipos aceitos

| Tipo | Descrição |
| ---- | --------- |
| `ciclo_dias` | Escala baseada em dias de trabalho e dias de folga |
| `ciclo_horas` | Escala baseada em horas de trabalho e horas de folga |
| `turno_rotativo` | Escala baseada em sequência de turnos |

### Exemplo - ciclo por dias

```json
{
  "nome": "Escala API 6x3",
  "tipo": "ciclo_dias",
  "dias_trabalho": 6,
  "dias_folga": 3
}
```

### Exemplo - ciclo por horas

```json
{
  "nome": "Escala API 12x36",
  "tipo": "ciclo_horas",
  "horas_trabalho": 12,
  "horas_folga": 36
}
```

### Exemplo - turno rotativo

```json
{
  "nome": "Escala API Turnos",
  "tipo": "turno_rotativo",
  "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
}
```

### Exemplo de resposta

```json
{
  "message": "Escala criada com sucesso.",
  "escala": {
    "nome": "Escala API 6x3",
    "tipo": "ciclo_dias",
    "dias_trabalho": 6,
    "dias_folga": 3
  }
}
```

### Status esperado

```text
201 Created
```

---

## Buscar escala salva pelo nome

Busca uma escala salva usando o nome como identificador.

```http
GET /api/v1/escalas/{nome}
```

### Exemplo

```http
GET /api/v1/escalas/Escala%206x3
```

### Exemplo de resposta

```json
{
  "escala": {
    "nome": "Escala 6x3",
    "tipo": "ciclo_dias",
    "dias_trabalho": 6,
    "dias_folga": 3
  }
}
```

### Status esperado

```text
200 OK
```

---

## Editar escala salva pelo nome

Edita uma escala salva usando o nome atual como referência.

```http
PUT /api/v1/escalas/{nome}
```

### Exemplo de requisição

```json
{
  "nome": "Escala API Editada",
  "tipo": "ciclo_dias",
  "dias_trabalho": 7,
  "dias_folga": 3
}
```

### Exemplo de resposta

```json
{
  "message": "Escala editada com sucesso.",
  "escala": {
    "nome": "Escala API Editada",
    "tipo": "ciclo_dias",
    "dias_trabalho": 7,
    "dias_folga": 3
  }
}
```

### Status esperado

```text
200 OK
```

---

## Excluir escala salva pelo nome

Exclui uma escala salva usando o nome como identificador.

```http
DELETE /api/v1/escalas/{nome}
```

### Exemplo

```http
DELETE /api/v1/escalas/Escala%20API%206x3
```

### Exemplo de resposta

```json
{
  "message": "Escala excluída com sucesso.",
  "nome": "Escala API 6x3"
}
```

### Status esperado

```text
200 OK
```

---

# Tratamento de erros

## Modelo inexistente

Erro retornado quando o `modelo_id` informado não existe nos modelos de simulação.

### Requisição

```json
{
  "modelo_id": "modelo_inexistente",
  "data_inicio": "01/07/2026",
  "data_consulta": "01/07/2026"
}
```

### Resposta esperada

```json
{
  "detail": "Modelo de escala não encontrado."
}
```

### Status HTTP esperado

```text
404 Not Found
```

---

## Data inválida

Erro retornado quando a data não segue o formato esperado `dd/mm/aaaa`.

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "2026-07-01",
  "data_consulta": "01/07/2026"
}
```

### Resposta esperada

```json
{
  "detail": "Data inválida. Use o formato dd/mm/aaaa."
}
```

### Status HTTP esperado

```text
400 Bad Request
```

---

## Escala 12x36 sem horário na consulta de status

Erro retornado quando uma escala por horas é consultada sem os horários obrigatórios.

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "data_consulta": "01/07/2026"
}
```

### Resposta esperada

```json
{
  "detail": "Para escala 12x36, informe hora_inicio e hora_consulta no formato HH:MM."
}
```

### Status HTTP esperado

```text
400 Bad Request
```

---

## Escala 12x36 sem hora inicial em próximos dias

Erro retornado quando uma escala por horas é usada em próximos dias sem `hora_inicio`.

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 2
}
```

### Resposta esperada

```json
{
  "detail": "Para escala 12x36, informe hora_inicio no formato HH:MM."
}
```

### Status HTTP esperado

```text
400 Bad Request
```

---

## Quantidade de dias fora do limite

Erro retornado quando o campo `quantidade_dias` fica fora do limite permitido.

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 100
}
```

### Resposta esperada

A validação desse campo é feita automaticamente pelo FastAPI/Pydantic.

O retorno segue o padrão de erro de validação da ferramenta.

### Status HTTP esperado

```text
422 Unprocessable Entity
```

---

# Erros em escalas salvas

## Escala não encontrada

Erro retornado ao buscar, editar ou excluir uma escala que não existe.

```json
{
  "detail": "Escala não encontrada."
}
```

Status esperado:

```text
404 Not Found
```

---

## Nome duplicado

Erro retornado ao tentar criar ou editar uma escala usando um nome já existente.

```json
{
  "detail": "Já existe uma escala salva com esse nome."
}
```

Status esperado:

```text
409 Conflict
```

---

## Configuração duplicada

Erro retornado ao tentar criar ou editar uma escala com uma configuração já existente.

```json
{
  "detail": "Já existe uma escala salva com essa configuração."
}
```

Status esperado:

```text
409 Conflict
```

---

## Tipo inválido

Erro retornado quando o campo `tipo` possui um valor não aceito.

```json
{
  "detail": "Tipo de escala inválido."
}
```

Status esperado:

```text
400 Bad Request
```

---

## Campos obrigatórios ausentes

Erro retornado quando os campos obrigatórios para determinado tipo de escala não são informados.

### Exemplo para `ciclo_dias` sem `dias_trabalho` e `dias_folga`

```json
{
  "detail": "Para ciclo_dias, informe dias_trabalho e dias_folga."
}
```

Status esperado:

```text
400 Bad Request
```

---

# Testes manuais

Os exemplos de requisições manuais estão disponíveis em:

```text
docs/api_requests.http
```

Esse arquivo pode ser usado como apoio para testar a API com ferramentas como:

- Thunder Client;
- Postman;
- Insomnia;
- extensões REST Client.

---

# Testes automatizados

Para executar os testes automatizados do projeto:

```powershell
python -m pytest
```

A API possui testes para:

- health check;
- listagem de modelos;
- consulta de status;
- consulta de próximos dias;
- tratamento de modelo inexistente;
- validação de data inválida;
- validação de escala 12x36 sem horário;
- validação de quantidade de dias fora do limite;
- listagem de escalas salvas;
- criação de escalas salvas;
- busca de escala salva pelo nome;
- edição de escala salva;
- exclusão de escala salva;
- validação de nome duplicado;
- validação de configuração duplicada;
- validação de tipo de escala inválido;
- validação de campos obrigatórios ausentes.

---

# Observações

A versão `v0.12.0` consolida a API como uma camada mais completa para gerenciamento de escalas salvas.

O foco desta versão é permitir que aplicações externas possam consumir e manipular escalas salvas por HTTP, mantendo a lógica principal do projeto organizada nas camadas de service e repository.

Esta versão ainda não implementa:

- login;
- autenticação;
- usuários;
- vínculo entre escala e colaborador;
- integração direta da demo web com a API;
- deploy da API.

---

# Próximos passos planejados

- Integrar a demo web com a API.
- Preparar configuração de CORS.
- Evoluir o frontend para consumir dados reais.
- Criar estrutura de usuários em versão futura.
- Implementar login em versão futura.
- Preparar deploy da API em versão futura.

---

# Versão

```text
v0.12.0 - API com CRUD de escalas salvas
```