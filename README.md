<div align="center">

# ⏰ Simulador de Escala de Trabalho

### Um projeto em Python para simular escalas de trabalho e consultar dias de **trabalho** ou **folga**

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-yellow)
![Python](https://img.shields.io/badge/python-3.x-blue)
![CLI](https://img.shields.io/badge/interface-CLI-informational)
![Projeto](https://img.shields.io/badge/foco-lógica%20e%20datas-success)

</div>

---

## 📌 Sobre o projeto

O **Simulador de Escala de Trabalho** é um projeto desenvolvido em **Python** com o objetivo de simular diferentes escalas de trabalho e informar se uma pessoa estará **trabalhando** ou **folgando** em uma determinada data.

A proposta inicial é construir o sistema em **terminal/CLI**, com foco no desenvolvimento da lógica do programa, manipulação de datas e organização do código.

Posteriormente, o projeto poderá evoluir para versões mais completas, com novas regras, escalas, turnos, funcionários e até uma interface gráfica ou web.

---

## 🎯 Objetivo

Criar uma ferramenta simples e funcional que permita:

- definir uma **data inicial**
- configurar uma **escala de trabalho**
- consultar uma **data específica**
- descobrir se, naquele dia, a pessoa estará:

✅ **Trabalhando**

ou

🌙 **Folgando**

---

## 🧠 Exemplo de funcionamento

```text
Data inicial da escala: 01/05/2026
Escala: 6x3
Data consultada: 07/05/2026

Resultado: Folga
```

### 🔎 Interpretação do exemplo

Nesse caso:

- a escala é **6x3**
- isso significa **6 dias de trabalho** seguidos de **3 dias de folga**
- ao consultar a data informada, o sistema calcula em qual ponto do ciclo a pessoa estará
- com base nesse cálculo, retorna se o dia será de trabalho ou folga

---

## ⚙️ Tecnologias utilizadas

- **Python**
- **Manipulação de datas com `datetime`**
- **Lógica condicional**
- **Estruturas de repetição**
- **Funções**
- **Organização modular de código**
- **Interface inicial via terminal/CLI**

---

## 📚 Conceitos praticados

Este projeto também serve como prática para estudos em Python, principalmente nos temas:

- lógica de programação
- manipulação de datas
- cálculo de ciclos
- entrada e saída de dados
- funções
- organização de pastas
- modularização
- boas práticas para projetos de portfólio

---

## 📂 Estrutura inicial do projeto

```text
simulador-escala-trabalho/
│
├── main.py
├── README.md
│
├── src/
│   ├── escala.py
│   ├── validacoes.py
│   └── utils.py
│
├── data/
│   └── escalas.json
│
└── docs/
    └── anotacoes.md
```

### 📁 Explicação das pastas

| Pasta / Arquivo | Função |
|---|---|
| `main.py` | Arquivo principal do projeto, responsável por iniciar o sistema |
| `src/` | Pasta onde ficará a lógica principal do programa |
| `escala.py` | Arquivo responsável pelos cálculos da escala |
| `validacoes.py` | Arquivo para validar datas, entradas e formatos |
| `utils.py` | Funções auxiliares do projeto |
| `data/` | Pasta para armazenar dados, como modelos de escala |
| `escalas.json` | Arquivo futuro para salvar configurações de escalas |
| `docs/` | Pasta para anotações, ideias e documentação do projeto |
| `README.md` | Documentação principal do projeto |

---

## 🚀 Proposta de evolução do projeto

Este projeto foi pensado para crescer aos poucos.

### Primeira versão

- [ ] criar sistema em terminal
- [ ] receber data inicial da escala
- [ ] receber tipo de escala
- [ ] receber data de consulta
- [ ] calcular se o dia é trabalho ou folga

### Melhorias futuras

- [ ] suporte para diferentes tipos de escala
- [ ] escalas como 5x2, 6x1, 6x2, 6x3 e outras
- [ ] escalas rotativas com turnos
- [ ] cadastro de funcionários
- [ ] consulta de períodos maiores
- [ ] calendário mensal da escala
- [ ] tratamento de férias
- [ ] tratamento de afastamentos
- [ ] exportação de relatórios
- [ ] versão com interface gráfica
- [ ] versão web com HTML, CSS e Python

---

## 🖥️ Exemplo de uso esperado

O usuário informa:

1. a data de início da escala
2. o modelo da escala, por exemplo **6x3**
3. a data que deseja consultar

E o sistema retorna algo como:

```text
No dia 07/05/2026 você estará de folga.
```

Ou:

```text
No dia 10/05/2026 você estará trabalhando.
```

---

## 🔄 Como funciona a lógica da escala

A escala funciona como um ciclo.

Por exemplo, em uma escala **6x3**:

```text
6 dias trabalhando + 3 dias folgando = ciclo de 9 dias
```

Ou seja:

```text
Dia 1  - Trabalha
Dia 2  - Trabalha
Dia 3  - Trabalha
Dia 4  - Trabalha
Dia 5  - Trabalha
Dia 6  - Trabalha
Dia 7  - Folga
Dia 8  - Folga
Dia 9  - Folga
Dia 10 - Reinicia o ciclo
```

O sistema calcula quantos dias se passaram desde a data inicial e identifica em qual posição do ciclo a data consultada se encaixa.

---

## 📌 Status do projeto

🚧 **Em desenvolvimento**

A estrutura inicial está sendo planejada e construída com foco em clareza, evolução gradual e boas práticas.

---

## 💡 Motivo da criação

Este projeto foi criado como parte da minha jornada de aprendizado em Python e construção de portfólio.

Além de ser um projeto simples, ele trabalha conceitos importantes como:

- datas
- ciclos
- lógica matemática
- validação de entrada
- organização de código
- documentação
- evolução gradual de um sistema

---

## 🤝 Contribuição

Sugestões, melhorias e ideias são sempre bem-vindas.

Esse projeto faz parte da minha jornada de aprendizado e desenvolvimento profissional, então qualquer feedback pode ajudar na evolução do sistema.

---

## 👨‍💻 Autor

**Vinicius Lima**

Estudante de Análise de Dados e Desenvolvimento de Sistemas.

Foco em:

- Python
- automação
- análise de dados
- Power BI
- desenvolvimento de projetos práticos para GitHub e LinkedIn

---

<div align="center">

### ⭐ Projeto em desenvolvimento para aprendizado e portfólio

</div>