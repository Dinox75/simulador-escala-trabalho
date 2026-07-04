# Documentação da API - Simulador de Escala de Trabalho

Documentação dos endpoints da API do projeto **Simulador de Escala de Trabalho**.

A API foi criada na versão `v0.11.0` para expor funcionalidades do simulador por meio de endpoints HTTP, mantendo a lógica principal separada da interface de linha de comando.

Na versão `v0.12.0`, a API evoluiu para incluir um CRUD completo de escalas salvas, permitindo listar, criar, buscar, editar e excluir escalas por meio de requisições HTTP.

Na versão `v0.13.0`, a demo web passou a consumir a API local para verificar conexão, carregar modelos, listar escalas salvas, cadastrar escalas, excluir escalas e simular modelos prontos. Também foram adicionadas configurações de CORS e exemplos manuais atualizados.

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
- excluir uma escala salva pelo nome;
- servir como backend local para a demo web.

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

## Integração com a demo web

A partir da `v0.13.0`, a demo web localizada em `docs/demo/` consome a API local.

A demo utiliza a API para:

- testar a conexão com o backend;
- carregar modelos prontos;
- listar escalas salvas;
- cadastrar novas escalas salvas;
- excluir escalas salvas;
- simular modelos prontos usando os endpoints de simulação.

Para funcionar localmente, a API deve estar rodando em:

```text
http://127.0.0.1:8000
```

A demo deve ser aberta em um servidor local, por exemplo:

```text
http://127.0.0.1:5500
```

ou por outro servidor estático equivalente.

---

## CORS

A versão `v0.13.0` adiciona configuração de CORS para permitir que a demo web consuma a API local.

Origens permitidas no ambiente de desenvolvimento:

```text
http://127.0.0.1:5500
http://localhost:5500
http://127.0.0.1:8000
http://localhost:8000
https://dinox75.github.io
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
  "version": "0.13.0"
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

Na versão `v0.13.0`, os modelos retornam também os dados necessários para preencher a demo web, como dias de trabalho, dias de folga, horas de trabalho, horas de folga ou sequência de turnos.

## Exemplo de resposta

```json
{
  "modelos": [
    {
      "id": "6x3",
      "nome": "Escala 6x3",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 6 dias de trabalho e 3 dias de folga.",
      "dias_trabalho": 6,
      "dias_folga": 3
    },
    {
      "id": "5x2",
      "nome": "Escala 5x2",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 5 dias de trabalho e 2 dias de folga.",
      "dias_trabalho": 5,
      "dias_folga": 2
    },
    {
      "id": "4x2",
      "nome": "Escala 4x2",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 4 dias de trabalho e 2 dias de folga.",
      "dias_trabalho": 4,
      "dias_folga": 2
    },
    {
      "id": "12x36",
      "nome": "Escala 12x36",
      "tipo": "ciclo_horas",
      "descricao": "Ciclo com 12 horas de trabalho e 36 horas de folga.",
      "horas_trabalho": 12,
      "horas_folga": 36
    },
    {
      "id": "turno_rotativo_simples",
      "nome": "Turno rotativo simples",
      "tipo": "turno_rotativo",
      "descricao": "Sequência rotativa com turnos definidos manualmente.",
      "sequencia_turnos": ["Manhã", "Manhã", "Tarde", "Tarde", "Noite", "Noite", "Folga", "Folga"]
    },
    {
      "id": "escala_real_24_dias",
      "nome": "Minha escala real 24 dias",
      "tipo": "turno_rotativo",
      "descricao": "Modelo de turno rotativo baseado em uma sequência de 24 dias.",
      "sequencia_turnos": [
        "Tarde",
        "Tarde",
        "Tarde",
        "Noite",
        "Noite",
        "Noite",
        "Folga",
        "Folga",
        "Folga",
        "Tarde",
        "Tarde",
        "Tarde",
        "Noite",
        "Noite",
        "Noite",
        "Folga",
        "Folga",
        "Manhã",
        "Manhã",
        "Manhã",
        "Manhã",
        "Manhã",
        "Manhã",
        "Folga"
      ]
    }
  ]
}
```

## Modelos disponíveis

| ID                       | Tipo             | Configuração principal                    |
| ------------------------ | ---------------- | ----------------------------------------- |
| `6x3`                    | `ciclo_dias`     | 6 dias de trabalho e 3 dias de folga      |
| `5x2`                    | `ciclo_dias`     | 5 dias de trabalho e 2 dias de folga      |
| `4x2`                    | `ciclo_dias`     | 4 dias de trabalho e 2 dias de folga      |
| `12x36`                  | `ciclo_horas`    | 12 horas de trabalho e 36 horas de folga  |
| `turno_rotativo_simples` | `turno_rotativo` | sequência simples de manhã/tarde/noite    |
| `escala_real_24_dias`    | `turno_rotativo` | sequência real de 24 dias                 |

## Status esperado

```text
200 OK
```

---

# Consultar status da escala

Consulta se uma escala está em trabalho, folga ou turno específico em uma data.

```http
POST /api/v1/simulacao/status
```

## Campos da requisição

| Campo           | Tipo     | Obrigatório | Descrição                                      |
| --------------- | -------- | ----------- | ---------------------------------------------- |
| `modelo_id`     | `string` | Sim         | ID do modelo de escala                         |
| `data_inicio`   | `string` | Sim         | Data inicial da escala no formato `dd/mm/aaaa` |
| `data_consulta` | `string` | Sim         | Data consultada no formato `dd/mm/aaaa`        |
| `hora_inicio`   | `string` | Para 12x36  | Hora inicial no formato `HH:MM`                |
| `hora_consulta` | `string` | Para 12x36  | Hora consultada no formato `HH:MM`             |

## Exemplo - Escala 6x3 trabalhando

### Requisição

```http
POST /api/v1/simulacao/status
Content-Type: application/json
```

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

## Exemplo - Escala 12x36

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

Consulta uma sequência de próximos dias calculados pela API.

```http
POST /api/v1/simulacao/proximos-dias
```

## Campos da requisição

| Campo             | Tipo     | Obrigatório | Descrição                                      |
| ----------------- | -------- | ----------- | ---------------------------------------------- |
| `modelo_id`       | `string` | Sim         | ID do modelo de escala                         |
| `data_inicio`     | `string` | Sim         | Data inicial da escala no formato `dd/mm/aaaa` |
| `quantidade_dias` | `int`    | Sim         | Quantidade de dias retornados                  |
| `hora_inicio`     | `string` | Para 12x36  | Hora inicial no formato `HH:MM`                |
| `hora_consulta`   | `string` | Opcional    | Hora base da consulta no formato `HH:MM`       |

## Limite de dias

O campo `quantidade_dias` aceita valores de `1` até `60`.

## Exemplo - Próximos dias da escala 6x3

### Requisição

```json
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 10
}
```

### Resposta esperada

```json
{
  "modelo_id": "6x3",
  "modelo_nome": "Escala 6x3",
  "tipo": "ciclo_dias",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 10,
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
    }
  ]
}
```

### Status esperado

```text
200 OK
```

## Exemplo - Próximos dias da escala 12x36

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "hora_inicio": "07:00",
  "hora_consulta": "10:00",
  "quantidade_dias": 5
}
```

### Resposta esperada

```json
{
  "modelo_id": "12x36",
  "modelo_nome": "Escala 12x36",
  "tipo": "ciclo_horas",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 5,
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

Os endpoints de escalas salvas permitem gerenciar modelos cadastrados pelo usuário.

Na `v0.13.0`, a demo web já usa esses endpoints para listar, criar e excluir escalas salvas.

> Observação: a simulação pela API ainda usa `modelo_id` dos modelos prontos. Escalas personalizadas salvas podem ser cadastradas, listadas, aplicadas visualmente e excluídas pela demo, mas a simulação personalizada por nome fica para uma evolução futura.

## Listar escalas salvas

```http
GET /api/v1/escalas
```

### Exemplo de resposta

```json
{
  "total": 3,
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
    },
    {
      "nome": "Minha escala real 24 dias",
      "tipo": "turno_rotativo",
      "sequencia_turnos": ["Tarde", "Tarde", "Tarde", "Noite", "Noite", "Noite", "Folga"]
    }
  ]
}
```

### Status esperado

```text
200 OK
```

## Criar escala salva

```http
POST /api/v1/escalas
```

### Campos da requisição

| Campo               | Tipo      | Obrigatório | Descrição                                  |
| ------------------- | --------- | ----------- | ------------------------------------------ |
| `nome`              | `string`  | Sim         | Nome da escala salva                       |
| `tipo`              | `string`  | Sim         | Tipo da escala                             |
| `dias_trabalho`     | `int`     | Para dias   | Dias de trabalho em escalas `ciclo_dias`   |
| `dias_folga`        | `int`     | Para dias   | Dias de folga em escalas `ciclo_dias`      |
| `horas_trabalho`    | `int`     | Para horas  | Horas de trabalho em escalas `ciclo_horas` |
| `horas_folga`       | `int`     | Para horas  | Horas de folga em escalas `ciclo_horas`    |
| `sequencia_turnos`  | `list`    | Para turno  | Sequência de turnos em `turno_rotativo`    |

### Tipos aceitos

```text
ciclo_dias
ciclo_horas
turno_rotativo
```

### Exemplo - ciclo por dias

```json
{
  "nome": "Escala API Docs 21x8",
  "tipo": "ciclo_dias",
  "dias_trabalho": 21,
  "dias_folga": 8
}
```

### Exemplo - ciclo por horas

```json
{
  "nome": "Escala API Docs 13x37",
  "tipo": "ciclo_horas",
  "horas_trabalho": 13,
  "horas_folga": 37
}
```

### Exemplo - turno rotativo

```json
{
  "nome": "Escala API Docs Turnos",
  "tipo": "turno_rotativo",
  "sequencia_turnos": ["Manhã", "Tarde", "Noite", "Folga"]
}
```

### Exemplo de resposta

```json
{
  "message": "Escala criada com sucesso.",
  "escala": {
    "nome": "Escala API Docs 21x8",
    "tipo": "ciclo_dias",
    "dias_trabalho": 21,
    "dias_folga": 8
  }
}
```

### Status esperado

```text
201 Created
```

## Buscar escala salva pelo nome

```http
GET /api/v1/escalas/{nome}
```

### Exemplo

```http
GET /api/v1/escalas/Escala%20API%20Docs%2021x8
```

### Exemplo de resposta

```json
{
  "escala": {
    "nome": "Escala API Docs 21x8",
    "tipo": "ciclo_dias",
    "dias_trabalho": 21,
    "dias_folga": 8
  }
}
```

### Status esperado

```text
200 OK
```

## Editar escala salva pelo nome

```http
PUT /api/v1/escalas/{nome}
```

### Exemplo de requisição

```json
{
  "nome": "Escala API Docs 22x9",
  "tipo": "ciclo_dias",
  "dias_trabalho": 22,
  "dias_folga": 9
}
```

### Exemplo de resposta

```json
{
  "message": "Escala atualizada com sucesso.",
  "escala": {
    "nome": "Escala API Docs 22x9",
    "tipo": "ciclo_dias",
    "dias_trabalho": 22,
    "dias_folga": 9
  }
}
```

### Status esperado

```text
200 OK
```

## Excluir escala salva pelo nome

```http
DELETE /api/v1/escalas/{nome}
```

### Exemplo

```http
DELETE /api/v1/escalas/Escala%20API%20Docs%2022x9
```

### Exemplo de resposta

```json
{
  "message": "Escala excluída com sucesso."
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

## Escala 12x36 sem hora inicial em próximos dias

### Requisição

```json
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 10
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

A validação é feita pelo Pydantic/FastAPI.

```json
{
  "detail": [
    {
      "type": "less_than_equal",
      "loc": ["body", "quantidade_dias"],
      "msg": "Input should be less than or equal to 60",
      "input": 100,
      "ctx": {
        "le": 60
      }
    }
  ]
}
```

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
- retorno de configuração completa dos modelos;
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

A versão `v0.13.0` consolida a primeira integração real entre a demo web e a API local.

O foco desta versão é permitir que a interface web consuma dados reais do backend para modelos, escalas salvas e simulações de modelos prontos.

Esta versão ainda não implementa:

- login;
- autenticação;
- usuários;
- vínculo entre escala e colaborador;
- deploy da API;
- simulação personalizada por nome de escala salva.

---

# Próximos passos planejados

- Permitir simular escalas personalizadas salvas pela API.
- Criar estrutura de usuários em versão futura.
- Implementar login em versão futura.
- Associar escalas a colaboradores.
- Preparar deploy da API em versão futura.
- Evoluir a demo para consumir API publicada, não apenas API local.

---

# Versão

```text
v0.13.0 - Demo web consumindo API local
```
