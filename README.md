<p align="center">
  <img src="./assets/banner.png" alt="Banner do projeto Simulador de Escala de Trabalho" width="100%">
</p>

<h1 align="center">⏰ Simulador de Escala de Trabalho</h1>

<p align="center">
  <strong>Aplicação em Python para consultar, simular, cadastrar, editar e excluir escalas de trabalho por dias, por horas e por turnos rotativos, com CLI, API em FastAPI integrada à demo, persistência em JSON/PostgreSQL, testes automatizados e arquitetura em camadas.</strong>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=00B4D8&center=true&vCenter=true&width=1000&lines=Simule+escalas+de+trabalho+com+Python;API+FastAPI+integrada+%C3%A0+demo;Arquitetura+com+POO%2C+Service+e+Repository;Persist%C3%AAncia+em+JSON+e+PostgreSQL;Testes+automatizados+com+Pytest" alt="Typing SVG">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERS%C3%83O-v0.13.0-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/STATUS-EM%20EVOLU%C3%87%C3%83O-48CAE4?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PYTHON-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/API-FASTAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/INTERFACE-CLI-00C2FF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/ARQUITETURA-POO%20%2B%20SERVICE%20%2B%20REPOSITORY-90E0EF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PERSIST%C3%8ANCIA-JSON%20%2B%20POSTGRESQL-CAF0F8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/BANCO-POSTGRESQL-336791?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/TESTES-PYTEST-CAF0F8?style=for-the-badge&logo=pytest&logoColor=061A2B&labelColor=061A2B">
</p>

<p align="center">
  <a href="https://dinox75.github.io/simulador-escala-trabalho/demo/" target="_blank">
    <img src="https://img.shields.io/badge/%F0%9F%8C%90%20ACESSAR%20DEMO%20INTERATIVA-00B4D8?style=for-the-badge&labelColor=061A2B" alt="Acessar demo interativa">
  </a>
</p>

<p align="center">
  <a href="#-sobre-o-projeto">Sobre</a> •
  <a href="#-versão-atual">Versão atual</a> •
  <a href="#-funcionalidades">Funcionalidades</a> •
  <a href="#-api-v0130">API</a> •
  <a href="#-arquitetura">Arquitetura</a> •
  <a href="#-persistência-json-e-postgresql">Persistência</a> •
  <a href="#-testes-automatizados">Testes</a> •
  <a href="#-como-executar-o-projeto">Executar</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

<table>
  <tr>
    <td width="25%" align="center">
      <h3>📆 Escalas por dias</h3>
      <p>Modelos como 6x3, 5x2 e 4x2.</p>
    </td>
    <td width="25%" align="center">
      <h3>⏱️ Escalas por horas</h3>
      <p>Suporte para ciclos como 12x36.</p>
    </td>
    <td width="25%" align="center">
      <h3>🔄 Turno rotativo</h3>
      <p>Sequências manuais, por blocos e modelos prontos.</p>
    </td>
    <td width="25%" align="center">
      <h3>⚡ API integrada</h3>
      <p>Demo web consumindo FastAPI local na v0.13.0.</p>
    </td>
  </tr>
</table>

---

## 📌 Sobre o projeto

O **Simulador de Escala de Trabalho** é uma aplicação criada para consultar, simular e organizar escalas de trabalho de forma simples, prática e evolutiva.

O projeto nasceu a partir de uma dúvida real:

> **“Hoje eu trabalho, folgo ou estou em qual turno?”**

A aplicação começou como um simulador de escala `6x3` no terminal, mas evoluiu para uma base mais completa, com suporte a:

- escalas por dias;
- escalas por horas;
- turnos rotativos;
- montagem de turnos por blocos;
- modelos predefinidos;
- escala real de 24 dias;
- cadastro, edição, exclusão e aplicação de escalas salvas;
- persistência em arquivo JSON;
- persistência alternativa em PostgreSQL;
- arquitetura com Programação Orientada a Objetos;
- camada de service;
- camada de repository;
- API integrada com FastAPI;
- testes automatizados;
- demo web interativa para apresentação do projeto.

O foco do projeto é transformar uma necessidade comum de consulta de escala em uma solução técnica organizada, testável e com potencial de evolução para produto.

---

## 🚀 Versão atual

**Versão:** `v0.13.0 - Demo web consumindo API local`

A `v0.13.0` conecta a demo web com a API FastAPI local. A interface agora consegue verificar conexão, carregar modelos prontos, listar escalas salvas, criar novas escalas, excluir escalas e executar simulações de modelos prontos por HTTP.

Essa evolução aproxima o projeto de um sistema web real: o frontend deixa de depender apenas de dados locais e passa a consumir o backend criado nas versões anteriores.

### Resumo da v0.13.0

| Área | Evolução |
|---|---|
| Demo web | Integração com API FastAPI local |
| CORS | Configuração para permitir consumo da API pela demo |
| Health | Card visual verificando conexão com o backend |
| Modelos | Demo carregando modelos via `GET /api/v1/modelos` |
| Escalas salvas | Demo listando escalas via `GET /api/v1/escalas` |
| Cadastro | Demo criando escalas via `POST /api/v1/escalas` |
| Exclusão | Demo excluindo escalas via `DELETE /api/v1/escalas/{nome}` |
| Simulação | Demo simulando modelos prontos via endpoints de simulação |
| Documentação | API docs, requests manuais, README e CHANGELOG atualizados |
| Testes | Testes automatizados preservados |

Até a versão anterior, a API já possuía CRUD completo de escalas salvas. Nesta versão, a demo web passa a consumir essa API local, validando a comunicação entre frontend e backend.

### Resumo da v0.12.0

| Área | Evolução |
|---|---|
| API | CRUD completo de escalas salvas |
| Listagem | Endpoint para listar escalas cadastradas |
| Criação | Endpoint para criar novas escalas |
| Busca | Endpoint para buscar escala pelo nome |
| Edição | Endpoint para editar escala salva |
| Exclusão | Endpoint para excluir escala salva |
| Service | Reaproveitamento do `EscalaService` |
| Repository | Reaproveitamento da persistência padrão |
| Testes | Testes automatizados para os novos endpoints |
| Documentação | README, CHANGELOG, API docs e requests atualizados |

### Resumo da v0.11.0

| Área | Evolução |
|---|---|
| API | Estrutura inicial com FastAPI |
| Health check | Endpoint para verificar se a API está ativa |
| Modelos | Endpoint para listar modelos disponíveis |
| Simulação | Endpoint para consultar status de uma escala |
| Próximos dias | Endpoint para retornar sequência de dias calculados |
| Documentação | Arquivo `docs/API.md` e exemplos em `docs/api_requests.http` |
| Testes | Testes automatizados para os endpoints da API |
| Validação manual | Testes realizados com Thunder Client |

## ✅ Principais entregas da v0.13.0

| Categoria | Entrega |
|---|---|
| Frontend | Demo web consumindo a API local |
| API | CORS configurado para desenvolvimento local e GitHub Pages |
| Health | Card de status da API na demo |
| Modelos | Modelos carregados diretamente da rota `/api/v1/modelos` |
| Escalas salvas | Listagem de escalas salvas consumindo `/api/v1/escalas` |
| Cadastro | Cadastro de escalas pela interface usando `POST /api/v1/escalas` |
| Exclusão | Exclusão de escalas pela interface usando `DELETE /api/v1/escalas/{nome}` |
| Simulação | Simulação de modelos prontos usando `/api/v1/simulacao/status` |
| Próximos dias | Linha do tempo e calendário usando `/api/v1/simulacao/proximos-dias` |
| Documentação | API.md e requests manuais atualizados |
| Estabilidade | Correções na renderização das escalas salvas na demo |
| Limitação conhecida | Escalas personalizadas salvas ainda não são simuladas por nome pela API |

## 📊 Linha de evolução

```mermaid
timeline
    title Evolução do Simulador de Escala de Trabalho
    v0.1 : Simulação inicial 6x3
         : Consulta simples por data
    v0.3 : Persistência em JSON
         : Escalas salvas
    v0.5 : Escalas por horas
         : Suporte ao modelo 12x36
    v0.7 : Turnos rotativos
         : Escala real de 24 dias
    v0.8 : Refatoração com POO
         : Service e Repository
    v0.9 : PostgreSQL funcional
         : Repository para banco relacional
    v0.10 : Demo web profissional
          : Páginas separadas e documentação visual
    v0.11 : API integrada
          : FastAPI e endpoints HTTP
    v0.12 : CRUD de escalas salvas
          : Listar, criar, buscar, editar e excluir escalas pela API
```

---

## 📌 Problema resolvido

Trabalhadores em escala frequentemente precisam consultar se determinado dia será de trabalho, folga ou qual turno será executado.

Esse problema fica mais evidente em escalas como:

- `6x3`;
- `5x2`;
- `4x2`;
- `12x36`;
- turnos rotativos;
- escalas com mudanças entre manhã, tarde, noite e folga.

A consulta manual em papel, planilhas ou memória pode gerar confusão, principalmente quando existem ciclos longos, virada de mês ou troca de turno.

---

## ✅ Solução proposta

O projeto permite informar uma escala, uma data inicial e uma data de consulta para descobrir automaticamente o status daquele dia.

A solução foi evoluindo em camadas:

1. **CLI em Python** para uso direto no terminal.
2. **Modelos predefinidos** para facilitar simulações comuns.
3. **Persistência em JSON** para salvar escalas.
4. **Arquitetura com POO, Service e Repository** para organizar o código.
5. **PostgreSQL funcional** como alternativa de persistência.
6. **Demo web** para apresentação visual do projeto.
7. **API integrada com FastAPI** para expor funcionalidades via HTTP.

---

## 🎯 Funcionalidades

### Consulta de status

Permite consultar se uma pessoa estará trabalhando, folgando ou em determinado turno em uma data informada.

Exemplo:

```text
Data inicial: 01/07/2026
Data consultada: 07/07/2026
Escala: 6x3
Resultado: Folga
```

### Visualização de próximos dias ou períodos

Permite visualizar uma sequência futura da escala, facilitando o planejamento pessoal.

### Cadastro de escalas

Permite cadastrar escalas personalizadas para reutilização posterior.

### Edição de escalas

Permite alterar escalas salvas.

### Exclusão de escalas

Permite remover escalas que não serão mais utilizadas.

### Modelos predefinidos

Inclui modelos prontos para facilitar testes e uso inicial.

### Persistência

O projeto suporta:

- JSON como persistência padrão;
- PostgreSQL como persistência alternativa configurável.

### API integrada

A partir da `v0.11.0`, o projeto passa a expor funcionalidades por endpoints HTTP usando FastAPI.

---

## 🧩 Modelos predefinidos

### Modelos disponíveis

| Modelo | Tipo | Descrição |
|---|---|---|
| `6x3` | ciclo por dias | 6 dias de trabalho e 3 dias de folga |
| `5x2` | ciclo por dias | 5 dias de trabalho e 2 dias de folga |
| `4x2` | ciclo por dias | 4 dias de trabalho e 2 dias de folga |
| `12x36` | ciclo por horas | 12 horas de trabalho e 36 horas de folga |
| `turno_rotativo_simples` | turno rotativo | sequência rotativa definida manualmente |
| `escala_real_24_dias` | turno rotativo | modelo de escala real com sequência de 24 dias |

### Escala real de 24 dias

O projeto também inclui uma escala rotativa baseada em uma sequência real de turnos, usada para validar cenários mais próximos da rotina de trabalho.

---

## 🧠 Como a lógica funciona

### 🔁 Escalas por dias

A regra considera a diferença entre a data inicial e a data consultada.

```python
ciclo = dias_trabalho + dias_folga
posicao = dias_passados % ciclo
```

Se a posição dentro do ciclo estiver dentro dos dias de trabalho, o status será `Trabalhando`. Caso contrário, será `Folga`.

### ⏱️ Escalas por horas

Para escalas como `12x36`, o cálculo considera data e hora.

```python
ciclo = horas_trabalho + horas_folga
posicao = horas_passadas % ciclo
```

Se a posição estiver dentro das horas de trabalho, o status será `Trabalhando`. Caso contrário, será `Folga`.

### 🔄 Turno rotativo

Para turnos rotativos, o sistema percorre uma sequência de turnos.

Exemplo:

```text
Manhã → Manhã → Tarde → Tarde → Noite → Noite → Folga → Folga
```

A posição dentro da sequência define o turno retornado.

### 🧱 Montagem por blocos

O projeto também suporta montagem de turnos por blocos, reduzindo repetição na criação de sequências maiores.

---

## 🖥️ Menu principal da CLI

Exemplo da interface principal no terminal:

```text
==== SIMULADOR DE ESCALAS ====
Escala atual: 6x3 dias

1 - Consultar status
2 - Ver próximos dias/períodos
3 - Alterar escala
4 - Ver escalas salvas
5 - Cadastrar nova escala
6 - Editar escala salva
7 - Excluir escala salva
8 - Sair

Escolha uma opção:
```

---

## ⚡ API v0.13.0

## Versão atual

```text
v0.13.0 - Demo web consumindo API local
```

A versão `v0.13.0` mantém o CRUD de escalas salvas criado na `v0.12.0` e adiciona integração prática entre a demo web e a API FastAPI local.

A demo agora consome a API para:

- verificar se o backend está online;
- carregar modelos prontos;
- listar escalas salvas;
- criar novas escalas salvas;
- excluir escalas salvas;
- simular modelos prontos;
- exibir próximos dias em linha do tempo e calendário.

---

## API

A API foi desenvolvida com **FastAPI** e permite consumir funcionalidades do simulador por meio de requisições HTTP.

### Executar a API localmente

```powershell
uvicorn api.app:app --reload
```

Depois acesse:

```text
http://127.0.0.1:8000/docs
```

### Endpoints principais

| Método   | Endpoint                          | Descrição                                   |
| -------- | --------------------------------- | ------------------------------------------- |
| `GET`    | `/health`                         | Verifica se a API está funcionando          |
| `GET`    | `/api/v1/modelos`                 | Lista modelos de escala disponíveis         |
| `POST`   | `/api/v1/simulacao/status`        | Consulta o status de uma escala em uma data |
| `POST`   | `/api/v1/simulacao/proximos-dias` | Retorna próximos dias da escala             |
| `GET`    | `/api/v1/escalas`                 | Lista escalas salvas                        |
| `POST`   | `/api/v1/escalas`                 | Cria uma nova escala salva                  |
| `GET`    | `/api/v1/escalas/{nome}`          | Busca uma escala salva pelo nome            |
| `PUT`    | `/api/v1/escalas/{nome}`          | Edita uma escala salva pelo nome            |
| `DELETE` | `/api/v1/escalas/{nome}`          | Exclui uma escala salva pelo nome           |

### Integração com a demo web

A demo web em `docs/demo/` usa a API local em:

```text
http://127.0.0.1:8000
```

Para testar corretamente:

1. execute a API com `uvicorn api.app:app --reload`;
2. abra a demo por um servidor local;
3. confira o card de status da API;
4. use os modelos prontos para simular;
5. teste criar, recarregar e excluir escalas salvas.

> Observação: a simulação pela API ainda trabalha com `modelo_id` dos modelos prontos. Escalas personalizadas salvas podem ser cadastradas e excluídas pela demo, mas a simulação personalizada por nome fica para uma evolução futura.

---

## Evolução recente

### v0.13.0

* Demo web consumindo a API local.
* Configuração de CORS para permitir integração entre frontend e backend.
* Card de status da API na página do simulador.
* Modelos carregados pela rota `/api/v1/modelos`.
* Escalas salvas carregadas pela rota `/api/v1/escalas`.
* Cadastro de escalas salvas via interface web.
* Exclusão de escalas salvas via interface web.
* Simulação de modelos prontos via API.
* Requisições manuais atualizadas em `docs/api_requests.http`.
* Documentação da API atualizada.

### v0.12.0

* CRUD completo de escalas salvas pela API.
* Reaproveitamento da camada de serviço.
* Reaproveitamento da camada de repository.
* Testes automatizados para os novos endpoints.
* Documentação atualizada da API.
* Exemplos manuais em `docs/api_requests.http`.

### v0.11.0

* Estrutura inicial da API com FastAPI.
* Endpoint `/health`.
* Endpoint `/api/v1/modelos`.
* Endpoint `/api/v1/simulacao/status`.
* Endpoint `/api/v1/simulacao/proximos-dias`.
* Testes automatizados para a API.

### v0.10.0

* Demo web profissional.
* Páginas de apresentação, documentação, sobre e termos.
* Interface visual para portfólio.

### v0.9.0

* PostgreSQL funcional.
* Repository pattern aplicado.
* JSON preservado como persistência padrão.
* Testes automatizados protegendo a evolução.

## 🧱 Arquitetura

O projeto evoluiu para uma estrutura em camadas, separando responsabilidades e facilitando manutenção.

```mermaid
flowchart TD
    A[main.py / CLI] --> B[interface.py]
    B --> C[armazenamento.py]
    C --> D[EscalaService]
    D --> E[EscalaRepository]
    E --> F[JsonEscalaRepository]
    E --> G[PostgresEscalaRepository]

    H[api/app.py] --> I[api/routes]
    I --> J[modelos_escala.py]
    I --> K[escala.py]
```

### Ideia principal

- A CLI continua funcionando como interface principal de terminal.
- A API adiciona uma nova forma de consumir parte das funcionalidades.
- A lógica de escala permanece separada da camada HTTP.
- A persistência continua desacoplada por repositories.

---

## 🧩 Arquitetura em camadas

| Camada | Responsabilidade |
|---|---|
| CLI | Interação com o usuário pelo terminal |
| API | Exposição de funcionalidades via HTTP |
| Models | Representação das escalas como objetos |
| Service | Regras de negócio relacionadas às escalas salvas |
| Repository | Contrato para persistência |
| JSON Repository | Persistência em arquivo JSON |
| PostgreSQL Repository | Persistência em banco relacional |
| Database | Conexão e schema PostgreSQL |
| Tests | Garantia de comportamento esperado |

---

## 🏛️ Diagrama das classes POO

```mermaid
classDiagram
    class EscalaBase {
        +id
        +nome
        +tipo
        +to_dict()
    }

    class EscalaCicloDias {
        +dias_trabalho
        +dias_folga
        +to_dict()
    }

    class EscalaCicloHoras {
        +horas_trabalho
        +horas_folga
        +to_dict()
    }

    class EscalaTurnoRotativo {
        +sequencia_turnos
        +to_dict()
    }

    class EscalaRepository {
        +listar()
        +buscar_por_id()
        +salvar()
        +editar()
        +excluir()
    }

    class JsonEscalaRepository
    class PostgresEscalaRepository
    class EscalaService

    EscalaBase <|-- EscalaCicloDias
    EscalaBase <|-- EscalaCicloHoras
    EscalaBase <|-- EscalaTurnoRotativo
    EscalaRepository <|-- JsonEscalaRepository
    EscalaRepository <|-- PostgresEscalaRepository
    EscalaService --> EscalaRepository
```

---

## 🧱 Estrutura atual do projeto

```text
simulador-escala-trabalho/
├── .github/
│   └── workflows/
│       └── tests.yml
│
├── api/
│   ├── __init__.py
│   ├── app.py
│   └── routes/
│       ├── __init__.py
│       ├── health.py
│       ├── modelos.py
│       └── simulacao.py
│
├── assets/
│   └── banner.png
│
├── config/
│   ├── __init__.py
│   └── database_config.py
│
├── data/
│   └── escalas.json
│
├── database/
│   ├── inicializar_postgres.py
│   ├── postgres_connection.py
│   └── schema_postgresql.sql
│
├── docs/
│   ├── API.md
│   ├── api_requests.http
│   └── demo/
│       ├── index.html
│       ├── simulador.html
│       ├── documentacao.html
│       ├── sobre.html
│       ├── termos.html
│       ├── script.js
│       └── style.css
│
├── models/
│   ├── __init__.py
│   ├── escala_base.py
│   ├── escala_ciclo_dias.py
│   ├── escala_ciclo_horas.py
│   ├── escala_factory.py
│   └── escala_turno_rotativo.py
│
├── repositories/
│   ├── escala_repository.py
│   ├── json_escala_repository.py
│   └── postgres_escala_repository.py
│
├── services/
│   ├── escala_service.py
│   └── escala_service_factory.py
│
├── tests/
│   ├── test_api_health.py
│   ├── test_api_modelos.py
│   ├── test_api_simulacao.py
│   ├── test_api_proximos_dias.py
│   ├── test_postgres_escala_repository.py
│   └── demais testes do projeto
│
├── armazenamento.py
├── escala.py
├── interface.py
├── main.py
├── modelos_escala.py
├── tipos_escala.py
├── validacoes.py
├── requirements.txt
└── README.md
```

---

## 💾 Persistência JSON e PostgreSQL

O projeto possui duas formas de persistência:

| Tipo | Status | Uso |
|---|---|---|
| JSON | Padrão | Execução simples, testes e fallback |
| PostgreSQL | Funcional | Persistência relacional configurável |

### JSON

O JSON continua sendo o padrão do projeto.

Isso permite executar o sistema sem precisar configurar banco de dados.

```powershell
python main.py
```

### PostgreSQL

O PostgreSQL pode ser usado configurando variáveis de ambiente.

```powershell
$env:ESCALA_REPOSITORY="postgres"
```

A aplicação utiliza o repository correspondente de acordo com a configuração técnica definida.

---

## 🐘 Schema PostgreSQL

O schema atual usa uma tabela principal e tabelas específicas por tipo de escala.

### Tabelas principais

| Tabela | Responsabilidade |
|---|---|
| `escalas` | Guarda dados comuns da escala |
| `escalas_ciclo_dias` | Guarda dados de escalas por dias |
| `escalas_ciclo_horas` | Guarda dados de escalas por horas |
| `escalas_turnos` | Guarda a sequência dos turnos rotativos |

### Visão geral

```mermaid
erDiagram
    escalas ||--o| escalas_ciclo_dias : possui
    escalas ||--o| escalas_ciclo_horas : possui
    escalas ||--o{ escalas_turnos : possui

    escalas {
        int id PK
        string nome
        string tipo
        datetime criado_em
        datetime atualizado_em
    }

    escalas_ciclo_dias {
        int id PK
        int escala_id FK
        int dias_trabalho
        int dias_folga
    }

    escalas_ciclo_horas {
        int id PK
        int escala_id FK
        int horas_trabalho
        int horas_folga
    }

    escalas_turnos {
        int id PK
        int escala_id FK
        int ordem
        string turno
    }
```

---

## 🌐 Demo interativa

A demo web está disponível em:

```text
https://dinox75.github.io/simulador-escala-trabalho/demo/
```

A demo possui páginas separadas para:

- início;
- simulador;
- documentação;
- sobre;
- termos.

Na `v0.13.0`, a página do simulador passa a consumir a API FastAPI local durante o desenvolvimento.

Recursos integrados à API:

- verificação de conexão com o backend;
- carregamento de modelos prontos;
- listagem de escalas salvas;
- cadastro de escalas salvas;
- exclusão de escalas salvas;
- simulação de modelos prontos;
- renderização dos próximos dias em linha do tempo e calendário.

> Observação: para a integração funcionar localmente, a API deve estar rodando em `http://127.0.0.1:8000`.

## 🧪 Testes automatizados

O projeto possui testes automatizados com `pytest` cobrindo:

- lógica de escalas;
- validações;
- models;
- factories;
- repositories;
- services;
- armazenamento;
- PostgreSQL repository;
- API FastAPI.

### Rodar todos os testes

```powershell
python -m pytest
```

### Rodar testes da API

```powershell
python -m pytest tests/test_api_health.py tests/test_api_modelos.py tests/test_api_simulacao.py tests/test_api_proximos_dias.py
```

### Rodar testes do PostgreSQL

```powershell
python -m pytest tests/test_postgres_escala_repository.py
```

### Observação sobre PostgreSQL nos testes

Os testes do PostgreSQL podem ser pulados automaticamente quando o ambiente de banco não estiver configurado.

Isso evita falhas em ambientes onde não existe conexão local com PostgreSQL.

---

## ⚙️ GitHub Actions

O projeto utiliza GitHub Actions para executar a suíte de testes automaticamente.

O workflow executa os testes usando JSON como persistência padrão:

```yaml
ESCALA_REPOSITORY: json
```

Isso mantém o pipeline mais estável e evita dependência obrigatória de banco PostgreSQL no ambiente de CI.

---

## ▶️ Como executar o projeto

### 1. Clonar o repositório

```powershell
git clone https://github.com/Dinox75/simulador-escala-trabalho.git
```

### 2. Entrar na pasta

```powershell
cd simulador-escala-trabalho
```

### 3. Criar ambiente virtual

```powershell
python -m venv venv
```

### 4. Ativar ambiente virtual

No Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

No Windows CMD:

```cmd
venv\Scripts\activate
```

No Linux/Mac:

```bash
source venv/bin/activate
```

### 5. Instalar dependências

```powershell
pip install -r requirements.txt
```

### 6. Executar aplicação no terminal

```powershell
python main.py
```

### 7. Executar API local

```powershell
uvicorn api.app:app --reload
```

Depois acesse:

```text
http://127.0.0.1:8000/docs
```

### 8. Executar testes

```powershell
python -m pytest
```

---

## 🐘 Como preparar o PostgreSQL

### 1. Criar o banco

No PostgreSQL, crie o banco:

```sql
CREATE DATABASE simulador_escala;
```

### 2. Configurar variáveis de ambiente

No PowerShell, configure as variáveis conforme seu ambiente local:

```powershell
$env:ESCALA_REPOSITORY="postgres"
$env:POSTGRES_DB="simulador_escala"
$env:POSTGRES_USER="postgres"
$env:POSTGRES_PASSWORD="SUA_SENHA_AQUI"
$env:POSTGRES_HOST="localhost"
$env:POSTGRES_PORT="5432"
```

### 3. Inicializar tabelas

```powershell
python -m database.inicializar_postgres
```

### 4. Executar aplicação usando PostgreSQL

```powershell
python main.py
```

---

## 💾 Exemplo de escalas salvas

### JSON

```json
{
  "id": 1,
  "nome": "Escala 6x3",
  "tipo": "ciclo_dias",
  "dias_trabalho": 6,
  "dias_folga": 3
}
```

### PostgreSQL

Exemplo de consulta:

```sql
SELECT
    e.id,
    e.nome,
    e.tipo,
    d.dias_trabalho,
    d.dias_folga,
    h.horas_trabalho,
    h.horas_folga
FROM escalas e
LEFT JOIN escalas_ciclo_dias d
    ON e.id = d.escala_id
LEFT JOIN escalas_ciclo_horas h
    ON e.id = h.escala_id
ORDER BY e.id;
```

---

## 🏢 Visão de produto

O projeto tem potencial para evoluir para uma solução mais completa de gestão e consulta de escalas.

### 👤 Área do colaborador

Possíveis funcionalidades futuras:

- consultar escala individual;
- visualizar próximos turnos;
- acompanhar folgas;
- receber notificações;
- acessar calendário pessoal.

### 🏭 Área da empresa

Possíveis funcionalidades futuras:

- cadastrar colaboradores;
- vincular colaboradores a escalas;
- gerenciar escalas por equipe;
- consultar cobertura de turnos;
- exportar relatórios.

---

## 🗺️ Roadmap

### Versões recentes

| Versão | Entrega principal |
|---|---|
| `v0.9.0` | PostgreSQL funcional |
| `v0.10.0` | Demo web profissional |
| `v0.11.0` | API integrada com FastAPI |
| `v0.12.0` | API com CRUD de escalas salvas |
| `v0.13.0` | Demo web consumindo API local |

### Próximas versões sugeridas

| Versão | Objetivo |
|---|---|
| `v0.14.0` | Simular escalas personalizadas salvas pela API |
| `v0.15.0` | Usuários e login |
| `v1.0.0` | Primeira versão completa do sistema |

### Melhorias técnicas planejadas

- Permitir simular escalas salvas personalizadas por nome ou ID.
- Criar schemas de request/response mais detalhados.
- Separar camada de serviços da API de forma mais explícita.
- Criar autenticação em versão futura.
- Preparar deploy da API.
- Evoluir testes de integração.
- Consumir uma API publicada em produção, não apenas API local.

### Melhorias de produto planejadas

- Área do colaborador.
- Área da empresa.
- Associação de escalas a colaboradores.
- Calendário mais completo.
- Relatórios.
- Exportação de dados.
- Notificações.

## 🧭 Linha de evolução técnica

| Fase | Aprendizado aplicado |
|---|---|
| Simulador inicial | Funções, datas e lógica condicional |
| Persistência JSON | Leitura e escrita de arquivos |
| Modelos predefinidos | Organização de regras reutilizáveis |
| POO | Classes e responsabilidades |
| Service | Separação de regra de negócio |
| Repository | Desacoplamento da persistência |
| PostgreSQL | Banco relacional e SQL |
| Demo web | Apresentação visual e portfólio |
| API | Endpoints HTTP com FastAPI |
| Testes | Pytest e validação automatizada |
| GitHub Actions | Integração contínua |

---

## 🧠 Aprendizados aplicados

Durante a evolução do projeto foram praticados conceitos como:

- manipulação de datas;
- modularização;
- validação de entrada;
- Programação Orientada a Objetos;
- camada de service;
- repository pattern;
- persistência em JSON;
- integração com PostgreSQL;
- criação de API com FastAPI;
- testes automatizados com Pytest;
- documentação técnica;
- versionamento com Git e GitHub;
- GitHub Actions.

---

## 📚 Tecnologias usadas

- Python;
- FastAPI;
- Uvicorn;
- Pytest;
- HTTPX;
- JSON;
- PostgreSQL;
- psycopg2;
- HTML;
- CSS;
- JavaScript;
- Git;
- GitHub;
- GitHub Actions;
- GitHub Pages.

---

## ⚠️ Limitações atuais

Mesmo com o CRUD de escalas salvas implementado na API, o projeto ainda possui limitações importantes:

- a API ainda é local e não está em deploy;
- a demo web ainda não consome a API;
- ainda não possui login;
- ainda não possui cadastro de usuários;
- ainda não existe vínculo entre escala e colaborador;
- ainda não possui painel web completo;
- ainda não possui migrations versionadas;
- a escolha de JSON/PostgreSQL ainda é técnica, feita por variável de ambiente.

---

## ✅ Status da v0.13.0

A `v0.13.0` está funcional para o objetivo da versão.

Entregas confirmadas:

- CLI continua funcionando.
- JSON continua como persistência padrão.
- PostgreSQL permanece funcional como alternativa.
- API FastAPI continua funcionando.
- CRUD de escalas salvas preservado.
- CORS configurado para integração local.
- Demo web verifica conexão com a API.
- Demo web carrega modelos pela API.
- Demo web lista escalas salvas pela API.
- Demo web cria escalas salvas pela API.
- Demo web exclui escalas salvas pela API.
- Demo web simula modelos prontos pela API.
- Testes automatizados passando.
- Testes manuais realizados com Thunder Client.
- Documentação da API atualizada.
- Requisições manuais documentadas.

Limitação conhecida:

- Escalas personalizadas salvas ainda não são simuladas por nome pela API.

## 📄 Licença

Este projeto está sob licença MIT.

---

## 👨‍💻 Autor

Desenvolvido por **Vinicius Lima**.

GitHub:

```text
https://github.com/Dinox75
```

LinkedIn:

```text
https://www.linkedin.com/in/vinicius-limajr/
```

---

<p align="center">
  <strong>Projeto em evolução contínua 🚀</strong>
</p>
