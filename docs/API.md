# Documentação da API - Simulador de Escala de Trabalho

Documentação dos endpoints iniciais da API do projeto **Simulador de Escala de Trabalho**.

A API foi criada na versão `v0.11.0` com o objetivo de expor funcionalidades do simulador por meio de endpoints HTTP, mantendo a lógica principal separada da interface de linha de comando.

---

## Visão geral

A API permite:

* verificar se o serviço está funcionando;
* listar modelos de escala disponíveis;
* consultar o status de uma escala em uma data específica;
* consultar uma sequência de próximos dias da escala.

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

| Método | Endpoint                          | Descrição                                        |
| ------ | --------------------------------- | ------------------------------------------------ |
| `GET`  | `/health`                         | Verifica se a API está funcionando               |
| `GET`  | `/api/v1/modelos`                 | Lista os modelos de escala disponíveis           |
| `POST` | `/api/v1/simulacao/status`        | Consulta o status de uma escala em uma data      |
| `POST` | `/api/v1/simulacao/proximos-dias` | Retorna uma sequência de próximos dias da escala |

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
  "version": "0.11.0"
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

# Tratamento de erros

## Modelo inexistente

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

# Testes manuais

Os exemplos de requisições manuais estão disponíveis em:

```text
docs/api_requests.http
```

Esse arquivo pode ser usado como apoio para testar a API com ferramentas como:

* Thunder Client;
* Postman;
* Insomnia;
* extensões REST Client.

---

# Testes automatizados

Para executar os testes automatizados do projeto:

```powershell
python -m pytest
```

A API possui testes para:

* health check;
* listagem de modelos;
* consulta de status;
* consulta de próximos dias;
* tratamento de modelo inexistente;
* validação de data inválida;
* validação de escala 12x36 sem horário;
* validação de quantidade de dias fora do limite.

---

# Observações

Esta é a primeira versão da API do projeto.

O foco da `v0.11.0` é expor funcionalidades básicas do simulador via HTTP, mantendo a estrutura existente do projeto e preparando caminho para futuras evoluções, como:

* API mais completa;
* integração com frontend;
* login;
* usuários;
* associação de escalas a colaboradores;
* deploy da API.

---

# Versão

```text
v0.11.0 - API inicial
```
