# Documentação da API - Simulador de Escala de Trabalho

Esta documentação descreve os endpoints iniciais da API do projeto **Simulador de Escala de Trabalho**.

A API foi criada na versão `v0.11.0` com o objetivo de expor funcionalidades do projeto por meio de endpoints HTTP, mantendo a lógica principal do simulador separada da interface de linha de comando.

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

---

# Endpoints disponíveis

## Health Check

Verifica se a API está funcionando.

```http
GET /health
```

### Exemplo de resposta

```json
{
  "status": "ok",
  "message": "API do Simulador de Escala de Trabalho funcionando",
  "version": "0.11.0"
}
```

---

## Listar modelos de escala

Retorna os modelos de escala disponíveis para simulação.

```http
GET /api/v1/modelos
```

### Exemplo de resposta

```json
{
  "modelos": [
    {
      "id": "6x3",
      "nome": "Escala 6x3",
      "tipo": "ciclo_dias",
      "descricao": "Ciclo com 6 dias de trabalho e 3 dias de folga."
    }
  ]
}
```

### Modelos disponíveis

* `6x3`
* `5x2`
* `4x2`
* `12x36`
* `turno_rotativo_simples`
* `escala_real_24_dias`

---

## Consultar status da escala

Consulta o status de uma escala em determinada data.

```http
POST /api/v1/simulacao/status
```

---

## Consultar próximos dias da escala

Retorna uma sequência de dias calculados a partir da data inicial da escala.

```http
POST /api/v1/simulacao/proximos-dias
Exemplo - Escala 6x3
Requisição
{
  "modelo_id": "6x3",
  "data_inicio": "01/07/2026",
  "quantidade_dias": 10
}
Resposta esperada
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
      "data": "07/07/2026",
      "status": "Folga"
    }
  ]
}
Exemplo - Escala 12x36

Para escalas por horas, é necessário informar hora_inicio.
O campo hora_consulta é opcional. Se não for informado, a API usa a mesma hora de início.

Requisição
{
  "modelo_id": "12x36",
  "data_inicio": "01/07/2026",
  "hora_inicio": "07:00",
  "hora_consulta": "10:00",
  "quantidade_dias": 2
}
Resposta esperada
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
    }
  ]
}
Limite de dias

O campo quantidade_dias aceita valores de:

mínimo: 1
máximo: 60

Caso o valor fique fora desse intervalo, a API retorna erro de validação.


---

## 3. Rodar testes

Depois de atualizar os arquivos:

```powershell
python -m pytest

---

## Exemplo - Escala 6x3

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

### Resultado esperado

```json
{
  "status": "Folga"
}
```

---

## Exemplo - Escala 12x36

Para escalas por horas, é necessário informar também `hora_inicio` e `hora_consulta`.

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

### Resultado esperado

```json
{
  "modelo_id": "12x36",
  "status": "Trabalhando"
}
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

## Escala 12x36 sem horário

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

# Testes manuais

Os exemplos de requisições manuais estão disponíveis em:

```text
docs/api_requests.http
```

Esse arquivo pode ser usado como apoio para testar a API com ferramentas como:

* Thunder Client
* Postman
* Insomnia
* Extensões REST Client

---

# Testes automatizados

Para executar os testes automatizados do projeto:

```powershell
python -m pytest
```

A API possui testes para:

* Health check
* Listagem de modelos
* Consulta de status
* Tratamento de modelo inexistente
* Validação de data inválida
* Validação de escala 12x36 sem horário

---

# Observação

Esta é a primeira versão da API do projeto.

O foco da `v0.11.0` é expor funcionalidades básicas do simulador via HTTP, mantendo a estrutura existente do projeto e preparando caminho para futuras evoluções, como:

* API completa
* Login
* Usuários
* Associação de escalas a colaboradores

---

# Comandos Git

Depois de salvar este conteúdo no arquivo `docs/API.md`, rode:

```powershell
git add docs/API.md
git commit -m "docs: adiciona documentacao da API"
git push origin feat/v0.11.0-api-inicial
```
