<p align="center">
  <img src="./assets/banner.png" alt="Banner do projeto Simulador de Escala de Trabalho" width="100%">
</p>

<h1 align="center">⏰ Simulador de Escala de Trabalho</h1>

<p align="center">
  <strong>Aplicação em Python para consultar, simular, salvar, reutilizar, editar e excluir escalas de trabalho como 6x3, 5x2, 4x4 e outras variações baseadas em ciclos.</strong>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=00B4D8&center=true&vCenter=true&width=950&lines=Simule+dias+de+trabalho+e+folga+com+Python;Gerencie+escalas+favoritas+com+CRUD+completo;Persist%C3%AAncia+em+JSON+com+testes+automatizados;Projeto+CLI+modular+com+vis%C3%A3o+de+produto;Demo+web+interativa+publicada+com+GitHub+Pages" alt="Typing SVG">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERS%C3%83O-v0.3.0-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/STATUS-EM%20DESENVOLVIMENTO-48CAE4?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PYTHON-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/INTERFACE-CLI-00C2FF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PERSIST%C3%8ANCIA-JSON-90E0EF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/CRUD-ESCALAS%20SALVAS-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/TESTES-PYTEST-CAF0F8?style=for-the-badge&logo=pytest&logoColor=061A2B&labelColor=061A2B">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/DEMO-WEB%20INTERATIVA-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/GITHUB%20PAGES-PUBLICADO-00B4D8?style=for-the-badge&logo=github&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/LICEN%C3%87A-USO%20N%C3%83O%20COMERCIAL-E63946?style=for-the-badge&labelColor=061A2B">
</p>

<p align="center">
  <a href="https://dinox75.github.io/simulador-escala-trabalho/demo/" target="_blank">
    <img src="https://img.shields.io/badge/%F0%9F%8C%90%20ACESSAR%20DEMO%20INTERATIVA-00B4D8?style=for-the-badge&labelColor=061A2B">
  </a>
</p>

---

<table>
  <tr>
    <td width="25%" align="center">
      <h3>🔁 Ciclos</h3>
      <p>Calcula a posição de uma data dentro da escala.</p>
    </td>
    <td width="25%" align="center">
      <h3>📅 Consulta</h3>
      <p>Informa se uma data será de trabalho ou folga.</p>
    </td>
    <td width="25%" align="center">
      <h3>⭐ CRUD</h3>
      <p>Permite criar, listar, usar, editar e excluir escalas salvas.</p>
    </td>
    <td width="25%" align="center">
      <h3>🧪 Testes</h3>
      <p>Valida a lógica principal e o armazenamento com pytest.</p>
    </td>
  </tr>
</table>

---

## 📌 Versão atual

> **v0.3.0 - CRUD completo de escalas salvas**

A versão atual transforma o gerenciamento de escalas favoritas em um fluxo mais completo dentro da aplicação CLI.

Agora o usuário pode **cadastrar, listar, aplicar, editar e excluir escalas salvas**, com persistência em JSON, validações de duplicidade, confirmações de segurança e testes automatizados.

### Destaques da versão

| Categoria | Entrega |
|---|---|
| 🐍 Aplicação principal | CLI em Python |
| 🔁 Lógica de escala | Cálculo de trabalho e folga por ciclo |
| 💾 Persistência | Leitura e gravação em `data/escalas.json` |
| ⭐ Escalas favoritas | Cadastro, listagem, aplicação, edição e exclusão |
| 🧠 Validações | Nome obrigatório, números válidos, índice de lista e confirmação de ações |
| 🛡️ Segurança no uso | Confirmação antes de editar ou excluir escalas |
| 🧪 Testes | Testes automatizados com `pytest` |
| 🌐 Demo web | Versão interativa em HTML, CSS e JavaScript |
| 🚀 Publicação | Demo hospedada com GitHub Pages |
| 📚 Documentação | README, visão de produto e changelog |
| 📄 Licença | Uso não comercial sem autorização |

---

## 🌐 Demo interativa

<table>
  <tr>
    <td align="center">
      <h3>🚀 Teste o projeto direto no navegador</h3>
      <p>
        A demo web permite simular escalas visualmente informando a data inicial, dias de trabalho, dias de folga e quantidade de dias para visualizar.
      </p>
      <p>
        <a href="https://dinox75.github.io/simulador-escala-trabalho/demo/" target="_blank">
          <img src="https://img.shields.io/badge/Abrir%20Demo%20Interativa-00B4D8?style=for-the-badge&labelColor=061A2B">
        </a>
      </p>
      <p>
        <code>https://dinox75.github.io/simulador-escala-trabalho/demo/</code>
      </p>
    </td>
  </tr>
</table>

> [!NOTE]
> A aplicação principal do projeto é executada em Python pelo terminal. A demo web funciona como uma vitrine visual do conceito e poderá receber as melhorias mais recentes da CLI em versões futuras.

---

## 📌 Problema resolvido

Trabalhadores que atuam em escalas como **6x3, 5x2, 4x4 ou outros modelos de ciclo** muitas vezes precisam consultar manualmente se estarão trabalhando ou folgando em uma data futura.

Em ambientes com turnos, revezamentos e escalas diferentes, essa consulta pode gerar:

- dúvidas sobre dias de trabalho;
- confusão em períodos de folga;
- dificuldade para planejar compromissos;
- erros de comunicação;
- dependência de planilhas, murais ou consultas manuais;
- dificuldade para reutilizar configurações de escala já conhecidas;
- dificuldade para corrigir ou remover escalas cadastradas incorretamente.

Este projeto foi criado a partir de uma necessidade real observada no ambiente de trabalho: simplificar a consulta de escalas e transformar uma regra repetitiva em uma ferramenta prática, testável e expansível.

---

## ✅ Solução proposta

O **Simulador de Escala de Trabalho** é uma aplicação em **Python** que permite consultar, simular e gerenciar escalas de trabalho baseadas em ciclos.

A versão atual permite:

- consultar se uma data será de trabalho ou folga;
- visualizar os próximos dias da escala;
- alterar manualmente a quantidade de dias trabalhados e dias de folga;
- listar escalas favoritas salvas;
- aplicar uma escala salva como escala atual;
- cadastrar novas escalas pelo terminal;
- editar escalas já cadastradas;
- excluir escalas salvas;
- confirmar ações sensíveis antes de salvar ou remover dados;
- bloquear cadastro com nome duplicado;
- bloquear cadastro com mesma configuração de dias trabalhados e folga;
- persistir dados em arquivo JSON;
- testar a lógica principal e o armazenamento com testes automatizados.

> [!IMPORTANT]
> O projeto começa como uma solução CLI, mas foi estruturado com mentalidade de produto: código modular, testes, documentação, persistência, visão futura e uma demo acessível para apresentação.

---

## 🎯 Objetivo do projeto

Criar uma ferramenta prática para simular e gerenciar escalas de trabalho de forma automática, reduzindo consultas manuais e facilitando o planejamento do usuário.

| Recurso | Descrição |
|---|---|
| 📅 Definir data inicial | Informa quando o ciclo da escala começa |
| 🔎 Consultar uma data | Verifica se o usuário estará trabalhando ou folgando |
| 📆 Visualizar próximos dias | Gera uma sequência futura da escala |
| ⚙️ Alterar escala manualmente | Permite mudar os dias de trabalho e folga durante a execução |
| ⭐ Escalas favoritas | Permite salvar e reutilizar configurações de escala |
| ✏️ Editar escalas salvas | Permite corrigir nome, dias trabalhados e dias de folga |
| 🗑️ Excluir escalas salvas | Remove escalas que não são mais necessárias |
| 🛡️ Confirmação de ações | Evita alterações e exclusões acidentais |
| 💾 Persistência em JSON | Mantém escalas salvas fora do código |
| 🧪 Validar a lógica | Usa testes automatizados para reduzir erros em futuras alterações |
| 🌐 Experimentar visualmente | Permite testar o conceito em uma demo web simples |

---

## 🧠 Exemplo prático

Imagine a seguinte situação:

| Informação | Valor |
|---|---|
| Data inicial da escala | `01/05/2026` |
| Modelo de escala | `6x3` |
| Data consultada | `07/05/2026` |

Resultado esperado:

```text
Na data 07/05/2026, você estará: 🌙 Folga
```

### Interpretação

Uma escala **6x3** significa:

```text
6 dias trabalhando + 3 dias folgando = ciclo de 9 dias
```

Representação visual do ciclo:

<p align="center">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/T-Trabalho-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/F-Folga-E63946?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/F-Folga-E63946?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/F-Folga-E63946?style=for-the-badge&labelColor=061A2B">
</p>

---

## ⭐ Escalas favoritas

A partir da versão `v0.2.0`, o projeto passou a permitir o cadastro e reutilização de escalas favoritas.

Na versão `v0.3.0`, esse recurso evoluiu para um **CRUD completo de escalas salvas**, permitindo criar, listar, aplicar, editar e excluir configurações persistidas em JSON.

Exemplo de estrutura salva em JSON:

```json
[
    {
        "nome": "Escala padrão 6x3",
        "dias_trabalho": 6,
        "dias_folga": 3
    },
    {
        "nome": "Escala administrativa 5x2",
        "dias_trabalho": 5,
        "dias_folga": 2
    }
]
```

Essas escalas ficam armazenadas em:

```text
data/escalas.json
```

### Operações disponíveis

| Operação | Comportamento |
|---|---|
| Criar escala | Cadastra uma nova escala no JSON |
| Listar escalas | Exibe todas as escalas salvas |
| Usar escala | Aplica uma escala salva como escala atual |
| Editar escala | Atualiza nome, dias trabalhados e dias de folga |
| Excluir escala | Remove uma escala salva |
| Confirmar ação | Solicita confirmação antes de editar ou excluir |

### Regras aplicadas

| Regra | Comportamento |
|---|---|
| Nome duplicado | O sistema bloqueia o cadastro ou edição |
| Configuração duplicada | O sistema bloqueia escalas com mesmos dias de trabalho e folga |
| Índice inválido | O sistema impede operação fora da lista |
| Confirmação negativa | A edição ou exclusão é cancelada |
| Escala válida | A escala é salva ou atualizada no JSON |
| Escala salva | Pode ser aplicada como escala atual pelo menu |

> [!NOTE]
> Na versão atual, duas escalas com a mesma quantidade de dias trabalhados e dias de folga são consideradas duplicadas. Em versões futuras, essa regra poderá evoluir para considerar turnos, horários, rotação e tipo de escala.

---

## ⚙️ Funcionalidades

| Funcionalidade | Status |
|---|---|
| Consultar uma data específica | ✅ Implementado |
| Gerar próximos dias da escala | ✅ Implementado |
| Alterar escala manualmente pelo menu | ✅ Implementado |
| Validação de datas | ✅ Implementado |
| Validação de entradas numéricas | ✅ Implementado |
| Validação de opções do menu | ✅ Implementado |
| Validação de índice em listas | ✅ Implementado |
| Validação de texto obrigatório | ✅ Implementado |
| Confirmação de ações sensíveis | ✅ Implementado |
| Interface organizada em módulo próprio | ✅ Implementado |
| Formatação visual de status no terminal | ✅ Implementado |
| Persistência em JSON | ✅ Implementado |
| Listar escalas salvas | ✅ Implementado |
| Aplicar escala salva como escala atual | ✅ Implementado |
| Cadastrar nova escala pelo terminal | ✅ Implementado |
| Editar escala salva pelo terminal | ✅ Implementado |
| Excluir escala salva pelo terminal | ✅ Implementado |
| Bloquear nome duplicado | ✅ Implementado |
| Bloquear configuração duplicada | ✅ Implementado |
| Testes automatizados da lógica principal | ✅ Implementado |
| Testes automatizados do armazenamento | ✅ Implementado |
| Demo web interativa | ✅ Implementado |
| GitHub Pages para demo | ✅ Implementado |
| README profissional | ✅ Implementado |
| Documento de visão futura do produto | ✅ Implementado |
| Changelog | ✅ Implementado |
| Licença de uso não comercial | ✅ Implementado |
| Atualizar demo web com edição e exclusão | 🔜 Planejado |
| Calendário mensal visual avançado | 🔜 Planejado |
| Cadastro de funcionários | 🔜 Planejado |
| Exportação de relatórios | 🔜 Planejado |
| Interface gráfica ou web completa | 🔜 Planejado |
| Escalas por hora, como 12x36 | 🔜 Planejado |
| Escalas com rotação de turno | 🔜 Planejado |

---

## 🖥️ Demonstração no terminal

```text
==========================================
        ⏰ SIMULADOR DE ESCALAS
==========================================
Escala atual: 6x3
------------------------------------------
1 - Consultar uma data
2 - Ver próximos dias
3 - Alterar escala
4 - Ver escalas salvas
5 - Cadastrar nova escala
6 - Editar escala salva
7 - Excluir escala salva
8 - Sair
==========================================
```

### Consultar uma data

```text
Escolha uma opção: 1

Digite a data inicial da escala (dd/mm/aaaa): 01/05/2026
Digite a data que deseja consultar (dd/mm/aaaa): 07/05/2026

Na data 07/05/2026, você estará: 🌙 Folga
```

### Ver próximos dias

```text
==== PRÓXIMOS DIAS ====

01/05/2026: 🟢 Trabalhando
02/05/2026: 🟢 Trabalhando
03/05/2026: 🟢 Trabalhando
04/05/2026: 🟢 Trabalhando
05/05/2026: 🟢 Trabalhando
06/05/2026: 🟢 Trabalhando
07/05/2026: 🌙 Folga
08/05/2026: 🌙 Folga
09/05/2026: 🌙 Folga
10/05/2026: 🟢 Trabalhando
```

### Listar escalas salvas

```text
==== ESCALAS SALVAS ====

1 - Escala padrão 6x3
    Dias trabalhados: 6
    Dias de folga: 3

2 - Escala administrativa 5x2
    Dias trabalhados: 5
    Dias de folga: 2
```

### Cadastrar nova escala

```text
Digite o nome da escala: Escala teste 3x2
Digite a quantidade de dias trabalhados: 3
Digite a quantidade de dias de folga: 2

Escala cadastrada com sucesso!
```

### Editar escala salva

```text
Escolha uma escala para editar: 1

Escala selecionada:
Nome atual: Escala padrão 6x3
Dias trabalhados atuais: 6
Dias de folga atuais: 3

Digite o novo nome da escala: Escala principal 6x3
Digite a nova quantidade de dias trabalhados: 6
Digite a nova quantidade de dias de folga: 3

Resumo da alteração:
Nome: Escala padrão 6x3 -> Escala principal 6x3
Dias trabalhados: 6 -> 6
Dias de folga: 3 -> 3

Deseja salvar essa alteração? [s/n]: s

Escala editada com sucesso!
```

### Excluir escala salva

```text
Escolha uma escala para excluir: 2

Tem certeza que deseja excluir a escala 'Escala administrativa 5x2'? [s/n]: s

Escala 'Escala administrativa 5x2' removida com sucesso!
```

---

## 🧩 Organograma técnico

```mermaid
flowchart TD
    A[Usuário] --> B[main.py]

    B --> C[validacoes.py]
    B --> D[escala.py]
    B --> E[interface.py]
    B --> F[armazenamento.py]

    C --> C1[Valida datas]
    C --> C2[Valida números]
    C --> C3[Valida opções]
    C --> C4[Valida índice de lista]
    C --> C5[Valida texto obrigatório]
    C --> C6[Confirma ações do usuário]

    D --> D1[Calcula status]
    D --> D2[Gera próximos dias]
    D --> D3[Aplica regra do ciclo]

    E --> E1[Exibe menu]
    E --> E2[Exibe resultados]
    E --> E3[Exibe escalas salvas]
    E --> E4[Formata status]

    F --> F1[Carrega escalas]
    F --> F2[Salva escalas]
    F --> F3[Adiciona nova escala]
    F --> F4[Edita escala existente]
    F --> F5[Remove escala salva]
    F --> F6[Valida duplicidades]
    F --> G[(data/escalas.json)]
```

---

## 🔄 Fluxo de funcionamento

```mermaid
flowchart LR
    A[Início] --> B[Menu principal]
    B --> C{Opção escolhida}

    C -->|1| D[Consultar data]
    C -->|2| E[Gerar próximos dias]
    C -->|3| F[Alterar escala manualmente]
    C -->|4| G[Ver escalas salvas]
    C -->|5| H[Cadastrar nova escala]
    C -->|6| I[Editar escala salva]
    C -->|7| J[Excluir escala salva]
    C -->|8| K[Sair]

    D --> L[Validar datas]
    L --> M[Calcular status]
    M --> N[Exibir resultado]

    E --> O[Validar data inicial]
    O --> P[Validar quantidade]
    P --> Q[Gerar lista de dias]
    Q --> R[Exibir próximos dias]

    F --> S[Validar dias de trabalho e folga]
    S --> T[Atualizar escala atual]

    G --> U[Carregar JSON]
    U --> V[Exibir escalas]
    V --> W[Selecionar escala]
    W --> T

    H --> X[Validar nome e números]
    X --> Y[Verificar duplicidade]
    Y --> Z[Salvar no JSON]

    I --> AA[Selecionar escala]
    AA --> AB[Exibir dados atuais]
    AB --> AC[Informar novos dados]
    AC --> AD[Confirmar alteração]
    AD -->|Sim| AE[Editar no JSON]
    AD -->|Não| AF[Cancelar edição]

    J --> AG[Selecionar escala]
    AG --> AH[Confirmar exclusão]
    AH -->|Sim| AI[Remover do JSON]
    AH -->|Não| AJ[Cancelar exclusão]

    N --> B
    R --> B
    T --> B
    Z --> B
    AE --> B
    AF --> B
    AI --> B
    AJ --> B
```

---

## 🧱 Arquitetura do projeto

```text
simulador-escala-trabalho/
│
├── assets/
│   └── banner.png
│
├── data/
│   └── escalas.json
│
├── docs/
│   ├── visao_produto.md
│   └── demo/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── tests/
│   ├── test_escala.py
│   └── test_armazenamento.py
│
├── armazenamento.py
├── escala.py
├── interface.py
├── main.py
├── validacoes.py
├── pytest.ini
├── requirements.txt
├── LICENSE
├── CHANGELOG.md
└── README.md
```

### Responsabilidade dos arquivos

| Arquivo/Pasta | Responsabilidade |
|---|---|
| `assets/` | Armazena recursos visuais do projeto |
| `banner.png` | Banner principal utilizado no README |
| `data/` | Armazena dados utilizados pelo sistema |
| `escalas.json` | Guarda as escalas favoritas cadastradas |
| `docs/` | Documentação complementar e visão futura do produto |
| `docs/demo/` | Demo web interativa publicada via GitHub Pages |
| `visao_produto.md` | Documento estratégico sobre evolução do projeto |
| `tests/` | Testes automatizados do projeto |
| `test_escala.py` | Testes da lógica principal de escala |
| `test_armazenamento.py` | Testes de leitura, salvamento, cadastro, edição e remoção de escalas |
| `armazenamento.py` | Carrega, salva, cadastra, edita e remove escalas em JSON |
| `escala.py` | Contém a lógica de cálculo da escala |
| `interface.py` | Centraliza menus, mensagens e exibição no terminal |
| `validacoes.py` | Centraliza validações e confirmações de entrada do usuário |
| `main.py` | Controla o fluxo principal da aplicação |
| `pytest.ini` | Configuração para execução dos testes |
| `requirements.txt` | Lista dependências do projeto |
| `LICENSE` | Licença proprietária de uso não comercial |
| `CHANGELOG.md` | Histórico de alterações do projeto |
| `README.md` | Documentação principal do projeto |

---

## 🧮 Como funciona a lógica

A lógica principal usa o conceito de **ciclo**.

Em uma escala `6x3`:

```text
ciclo = dias de trabalho + dias de folga
ciclo = 6 + 3
ciclo = 9 dias
```

Depois, o sistema calcula a diferença entre a data consultada e a data inicial da escala:

```text
dias_passados = data_consulta - data_inicio
posicao_ciclo = dias_passados % ciclo
```

A decisão acontece assim:

```text
Se posicao_ciclo < dias_trabalho:
    Trabalhando
Senão:
    Folga
```

Essa abordagem permite reaproveitar a mesma lógica para diferentes modelos de escala baseados em dias completos.

> [!WARNING]
> Escalas baseadas em horas, como `12x36`, ainda exigem uma lógica diferente da atual, pois envolvem controle por horário e não apenas por dias completos.

---

## 💾 Como funciona a persistência

A persistência foi adicionada para permitir que escalas sejam salvas fora do código.

O arquivo responsável pelo armazenamento é:

```text
data/escalas.json
```

O módulo responsável por manipular esse arquivo é:

```text
armazenamento.py
```

### Funções principais do armazenamento

| Função | Responsabilidade |
|---|---|
| `carregar_escalas()` | Lê as escalas salvas no JSON |
| `salvar_escalas(escalas)` | Salva a lista de escalas no JSON |
| `adicionar_escala(nome, dias_trabalho, dias_folga)` | Cadastra uma nova escala |
| `editar_escala(indice, novo_nome, novos_dias_trabalho, novos_dias_folga)` | Edita uma escala existente |
| `remover_escala(indice)` | Remove uma escala salva |

### Fluxo de persistência

```mermaid
flowchart TD
    A[Usuário gerencia escala] --> B[main.py]
    B --> C[validacoes.py]
    B --> D[armazenamento.py]

    C --> E[Valida entradas e confirma ações]

    D --> F[carregar_escalas]
    F --> G[Verificar operação]

    G --> H{Tipo de ação}
    H -->|Cadastrar| I[adicionar_escala]
    H -->|Editar| J[editar_escala]
    H -->|Excluir| K[remover_escala]

    I --> L[Verificar duplicidades]
    J --> L
    K --> M[Atualizar lista]

    L --> N{Pode salvar?}
    N -->|Sim| O[salvar_escalas]
    N -->|Não| P[Retornar erro]

    M --> O
    O --> Q[(data/escalas.json)]
```

---

## 🛠️ Tecnologias utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Python-061A2B?style=for-the-badge&logo=python&logoColor=FFD43B">
  <img src="https://img.shields.io/badge/Datetime-0077B6?style=for-the-badge">
  <img src="https://img.shields.io/badge/JSON-00B4D8?style=for-the-badge&logo=json&logoColor=white">
  <img src="https://img.shields.io/badge/Pytest-90E0EF?style=for-the-badge&logo=pytest&logoColor=061A2B">
  <img src="https://img.shields.io/badge/CLI-48CAE4?style=for-the-badge">
  <img src="https://img.shields.io/badge/HTML5-061A2B?style=for-the-badge&logo=html5&logoColor=E34F26">
  <img src="https://img.shields.io/badge/CSS3-0077B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-03045E?style=for-the-badge&logo=javascript&logoColor=F7DF1E">
  <img src="https://img.shields.io/badge/GitHub%20Pages-00B4D8?style=for-the-badge&logo=github&logoColor=white">
  <img src="https://img.shields.io/badge/Git-061A2B?style=for-the-badge&logo=git&logoColor=F05032">
</p>

### Conceitos praticados

- lógica de programação;
- funções;
- modularização;
- manipulação de datas;
- estruturas condicionais;
- estruturas de repetição;
- validação de entrada;
- leitura e escrita de arquivos JSON;
- persistência de dados;
- CRUD em arquivo JSON;
- cálculo de ciclos;
- confirmação de ações do usuário;
- testes automatizados;
- organização de projeto;
- documentação para portfólio;
- visão de evolução de produto;
- criação de demo web estática;
- publicação com GitHub Pages.

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/Dinox75/simulador-escala-trabalho.git
```

### 2. Acesse a pasta do projeto

```bash
cd simulador-escala-trabalho
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Execute o projeto

```bash
python main.py
```

Ou, dependendo do ambiente:

```bash
python3 main.py
```

---

## 🧪 Testes automatizados

O projeto possui testes com `pytest` para validar tanto a lógica de escala quanto o armazenamento em JSON.

### Executar os testes

```bash
python -m pytest
```

### O que está sendo testado

| Arquivo de teste | O que valida |
|---|---|
| `tests/test_escala.py` | Cálculo de trabalho e folga |
| `tests/test_escala.py` | Geração dos próximos dias da escala |
| `tests/test_armazenamento.py` | Salvamento e carregamento de escalas |
| `tests/test_armazenamento.py` | Cadastro de nova escala |
| `tests/test_armazenamento.py` | Remoção de escala salva |
| `tests/test_armazenamento.py` | Edição de escala salva |
| `tests/test_armazenamento.py` | Bloqueio de nome duplicado |
| `tests/test_armazenamento.py` | Bloqueio de configuração duplicada |
| `tests/test_armazenamento.py` | Validação de índice inválido |

### Exemplo de saída esperada

```text
tests/test_armazenamento.py ..........
tests/test_escala.py ...
```

> [!NOTE]
> A quantidade exata de testes pode variar conforme novas validações forem adicionadas ao projeto.

---

## 🧪 Testes manuais sugeridos

| Cenário | Entrada | Resultado esperado |
|---|---|---|
| Consultar primeiro dia da escala | `01/05/2026` em escala `6x3` | Trabalhando |
| Consultar sexto dia da escala | `06/05/2026` em escala `6x3` | Trabalhando |
| Consultar sétimo dia da escala | `07/05/2026` em escala `6x3` | Folga |
| Aplicar escala salva | Selecionar `5x2` | Menu passa a exibir `5x2` |
| Cadastrar escala nova | Nome novo + configuração nova | Cadastro realizado |
| Cadastrar nome repetido | Mesmo nome de uma escala existente | Cadastro bloqueado |
| Cadastrar configuração repetida | Nome diferente + mesmos dias | Cadastro bloqueado |
| Editar escala válida | Selecionar escala + novos dados válidos | Escala atualizada |
| Cancelar edição | Digitar `n` na confirmação | Nenhuma alteração salva |
| Excluir escala válida | Selecionar escala + confirmar com `s` | Escala removida |
| Cancelar exclusão | Digitar `n` na confirmação | Escala permanece salva |

---

## 🧭 Roadmap

```mermaid
timeline
    title Evolução planejada do projeto
    v0.1.0 : CLI funcional
           : Validações
           : Testes da lógica de escala
           : Demo web publicada
    v0.2.0 : Persistência em JSON
           : Escalas favoritas
           : Cadastro de escalas
           : Testes de armazenamento
    v0.3.0 : CRUD completo de escalas salvas
           : Edição de escalas
           : Exclusão de escalas
           : Confirmação de ações
           : Testes de edição e remoção
    v0.4.0 : Atualização da demo web
           : Melhorias visuais da interface
           : Visualização mensal mais completa
    v0.5.0 : Cadastro simples de funcionários
           : Cadastro de turnos
           : Escalas por colaborador
    Futuro : Banco de dados
           : API
           : Interface web completa
           : Dashboards
           : Gestão corporativa de escalas
```

### Implementado até a versão atual

- [x] Criar lógica de cálculo de escala
- [x] Consultar status de uma data
- [x] Gerar próximos dias da escala
- [x] Criar menu interativo
- [x] Permitir alteração manual da escala
- [x] Separar validações em módulo próprio
- [x] Separar exibições em módulo próprio
- [x] Criar módulo de armazenamento
- [x] Salvar escalas em JSON
- [x] Listar escalas salvas
- [x] Aplicar escala salva como escala atual
- [x] Cadastrar nova escala pelo terminal
- [x] Editar escala salva pelo terminal
- [x] Excluir escala salva pelo terminal
- [x] Confirmar edição antes de salvar alteração
- [x] Confirmar exclusão antes de remover escala
- [x] Bloquear nome duplicado
- [x] Bloquear configuração duplicada
- [x] Adicionar testes automatizados da lógica principal
- [x] Adicionar testes automatizados do armazenamento
- [x] Adicionar testes de edição de escalas
- [x] Adicionar testes de remoção de escalas
- [x] Criar documentação de visão do produto
- [x] Adicionar licença de uso não comercial
- [x] Criar demo web inicial
- [x] Publicar demo com GitHub Pages

### Próximas melhorias

- [ ] Atualizar a demo web com edição de escalas salvas
- [ ] Atualizar a demo web com exclusão de escalas salvas
- [ ] Melhorar mensagens visuais da interface CLI
- [ ] Permitir salvar a escala atual escolhida como preferência
- [ ] Criar visualização mensal mais completa
- [ ] Adicionar suporte para múltiplos funcionários
- [ ] Permitir cadastro de turnos
- [ ] Estudar escalas com rotação de turno
- [ ] Estudar escalas baseadas em horas, como `12x36`
- [ ] Exportar resultados em `.txt`, `.csv` ou `.pdf`
- [ ] Criar interface gráfica ou web completa
- [ ] Evoluir para sistema corporativo de gestão de escalas

---

## 💼 Valor profissional

Este projeto demonstra habilidades importantes para desenvolvimento de software:

<table>
  <tr>
    <td align="center">
      <strong>🧠 Lógica</strong><br>
      Cálculo de ciclos e regras
    </td>
    <td align="center">
      <strong>📅 Datas</strong><br>
      Manipulação com datetime
    </td>
    <td align="center">
      <strong>🧩 Modularização</strong><br>
      Separação de responsabilidades
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>💾 JSON</strong><br>
      Persistência de dados
    </td>
    <td align="center">
      <strong>🧪 Testes</strong><br>
      Validação automatizada com pytest
    </td>
    <td align="center">
      <strong>🌐 Demo Web</strong><br>
      Apresentação visual do conceito
    </td>
  </tr>
  <tr>
    <td align="center">
      <strong>⭐ CRUD</strong><br>
      Gerenciamento completo de escalas
    </td>
    <td align="center">
      <strong>🛡️ Validações</strong><br>
      Prevenção de erros de uso
    </td>
    <td align="center">
      <strong>📚 Documentação</strong><br>
      Organização para portfólio
    </td>
  </tr>
</table>

> [!IMPORTANT]
> O objetivo não é apenas criar um script, mas desenvolver um projeto apresentável, organizado, testável e com potencial de evolução para um sistema real.

---

## 🏢 Visão futura do produto

Este projeto também possui uma documentação estratégica descrevendo sua possível evolução para uma plataforma corporativa de gestão de escalas.

A ideia futura envolve:

- cadastro de empresas;
- cadastro de funcionários;
- gestão de escalas por colaborador;
- feriados;
- férias;
- paradas programadas;
- relatórios individuais e gerais;
- integração com sistemas de ponto;
- painel para empresa;
- painel para colaborador;
- dashboards para acompanhamento;
- alertas e notificações.

Leia mais em:

```text
docs/visao_produto.md
```

---

## 📝 Changelog

As mudanças do projeto são registradas no arquivo:

```text
CHANGELOG.md
```

Versões principais:

| Versão | Entrega |
|---|---|
| `v0.1.0` | CLI funcional, lógica de escala, validações e testes iniciais |
| `v0.2.0` | Escalas favoritas com persistência em JSON |
| `v0.3.0` | CRUD completo de escalas salvas |

---

## 👨‍💻 Autor

**Vinicius Lima**

Estudante de **Análise de Dados e Desenvolvimento de Sistemas**, com foco em desenvolvimento prático, automação, análise de dados e construção de projetos para GitHub e LinkedIn.

### Áreas de interesse

<p>
  <img src="https://img.shields.io/badge/Python-0077B6?style=flat-square">
  <img src="https://img.shields.io/badge/Automa%C3%A7%C3%A3o-00B4D8?style=flat-square">
  <img src="https://img.shields.io/badge/An%C3%A1lise%20de%20Dados-48CAE4?style=flat-square">
  <img src="https://img.shields.io/badge/Power%20BI-F9C74F?style=flat-square">
  <img src="https://img.shields.io/badge/GitHub-061A2B?style=flat-square">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square">
</p>

---

## 📄 Licença

Este projeto está protegido por uma **Licença Proprietária de Uso Não Comercial**.

O código está disponível publicamente para fins de estudo, avaliação técnica, portfólio e recrutamento.  
O uso comercial, redistribuição, venda, cópia substancial ou criação de soluções derivadas para fins comerciais não é permitido sem autorização prévia e por escrito do autor.

Para mais detalhes, consulte o arquivo [LICENSE](./LICENSE).

---

<p align="center">
  <strong>Projeto desenvolvido como parte da minha jornada de aprendizado, prática e evolução profissional em tecnologia.</strong>
</p>

<p align="center">
  <a href="https://dinox75.github.io/simulador-escala-trabalho/demo/" target="_blank">
    <img src="https://img.shields.io/badge/%F0%9F%8C%90%20Abrir%20Demo-00B4D8?style=for-the-badge&labelColor=061A2B">
  </a>
  <img src="https://img.shields.io/badge/Simule-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/Gerencie%20Escalas-48CAE4?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/Planeje-03045E?style=for-the-badge&labelColor=061A2B">
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=00B4D8&height=90&section=footer">
</p>

<p align="center">
  ⭐ Se este projeto te ajudou ou serviu como inspiração, considere deixar uma estrela no repositório.
</p>