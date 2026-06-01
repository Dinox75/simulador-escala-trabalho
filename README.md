<p align="center">
  <img src="./assets/banner.png" alt="Banner do projeto Simulador de Escala de Trabalho" width="100%">
</p>

<h1 align="center">⏰ Simulador de Escala de Trabalho</h1>

<p align="center">
  <strong>Aplicação em Python para consultar, simular, salvar, reutilizar, editar e excluir escalas de trabalho por dias, por horas e por turnos rotativos, com suporte real para 12x36, CRUD completo, persistência em JSON, testes automatizados e uma demo web moderna para apresentação do projeto.</strong>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=00B4D8&center=true&vCenter=true&width=1000&lines=Simule+escalas+de+trabalho+com+Python;Agora+com+suporte+inicial+a+turno+rotativo;Escalas+por+dias%2C+por+horas+e+por+revezamento;CRUD+completo+com+persist%C3%AAncia+em+JSON;Projeto+evoluindo+com+vis%C3%A3o+de+produto" alt="Typing SVG">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/VERS%C3%83O-v0.6.0-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/STATUS-EM%20DESENVOLVIMENTO-48CAE4?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PYTHON-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/INTERFACE-CLI-00C2FF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PERSIST%C3%8ANCIA-JSON-90E0EF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/CRUD-COMPLETO-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/12x36-IMPLEMENTADO-48CAE4?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/TURNO%20ROTATIVO-v0.6.0-90E0EF?style=for-the-badge&labelColor=061A2B">
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
      <h3>🔁 Ciclos por dias</h3>
      <p>Consulta escalas como 6x3, 5x2 e 4x4.</p>
    </td>
    <td width="25%" align="center">
      <h3>⏱️ Ciclos por horas</h3>
      <p>Suporte real para 12x36 e variações como 24x72.</p>
    </td>
    <td width="25%" align="center">
      <h3>🔄 Turno rotativo</h3>
      <p>Sequências como manhã, tarde, noite e folga.</p>
    </td>
    <td width="25%" align="center">
      <h3>🧪 Testes</h3>
      <p>Projeto validado com testes automatizados usando pytest.</p>
    </td>
  </tr>
</table>

---

## 📌 Sobre o projeto

O **Simulador de Escala de Trabalho** é um projeto em Python criado para consultar, simular e gerenciar escalas de trabalho de forma simples, prática e evolutiva.

A aplicação começou como um simulador de escala `6x3`, mas foi crescendo de forma organizada até se tornar uma ferramenta com:

- suporte a escalas por dias;
- suporte a escalas por horas;
- suporte inicial a turnos rotativos;
- CRUD completo de escalas salvas;
- persistência em JSON;
- validações de entrada;
- testes automatizados;
- arquitetura modular;
- demo web interativa para apresentação visual;
- visão de evolução para colaborador e empresa.

O foco do projeto é transformar uma necessidade comum de trabalhadores em uma solução simples de consultar, fácil de expandir e boa o suficiente para compor um portfólio técnico.

---

## 🚀 Versão atual

> **v0.6.0 - Suporte inicial a turno rotativo**

A versão `v0.6.0` marca uma evolução importante do projeto: além de escalas por dias e por horas, o simulador agora passa a suportar escalas baseadas em **sequência de turnos rotativos**.

Com isso, o sistema consegue trabalhar com modelos como:

```text
Manhã -> Manhã -> Tarde -> Tarde -> Noite -> Noite -> Folga -> Folga
```

A lógica identifica a posição da data consultada dentro da sequência e retorna qual turno corresponde àquele dia.

### Principais entregas da v0.6.0

| Categoria | Entrega |
|---|---|
| 🔄 Turno rotativo | Implementação funcional do tipo `turno_rotativo` |
| 📆 Consulta por data | Cálculo do turno correspondente a uma data consultada |
| 🔁 Sequência de turnos | Suporte a sequências como manhã, tarde, noite e folga |
| ⭐ CRUD completo | Cadastro, aplicação, edição e exclusão de escalas rotativas |
| 🛡️ Validação | Bloqueio de sequência de turnos vazia |
| 💾 Persistência | Escalas rotativas salvas em `data/escalas.json` |
| 🖥️ CLI | Menu principal integrado ao novo tipo de escala |
| 🧪 Testes | Novos testes para cálculo, geração, cadastro e edição |
| 🌐 Demo web | Repaginação visual com foco em apresentação profissional |

> [!NOTE]
> A demo web funciona como vitrine visual do projeto. A implementação mais completa da v0.6.0 está na aplicação Python executada pelo terminal.

---

## 🌐 Demo interativa

A demo web apresenta uma versão visual do projeto, com interface moderna, simulação de escalas, gerenciamento visual e documentação dentro da própria página.

<p align="center">
  <a href="https://dinox75.github.io/simulador-escala-trabalho/demo/" target="_blank">
    <img src="https://img.shields.io/badge/Abrir%20Demo%20Interativa-00B4D8?style=for-the-badge&labelColor=061A2B">
  </a>
</p>

```text
https://dinox75.github.io/simulador-escala-trabalho/demo/
```

A demo foi pensada para deixar o projeto mais apresentável para portfólio, LinkedIn e recrutadores. Ela ajuda a explicar a ideia do sistema, a dor que ele resolve e a visão de evolução para uso por colaboradores e empresas.

---

## 📌 Problema resolvido

Trabalhadores que atuam em escalas como `6x3`, `5x2`, `4x4`, `12x36` ou modelos de revezamento muitas vezes precisam consultar manualmente se estarão trabalhando, folgando ou em determinado turno em uma data futura.

Em ambientes com escalas alternadas, isso pode gerar:

- dúvidas sobre dias de trabalho;
- dúvidas sobre horários de entrada e saída;
- dificuldade para planejar compromissos pessoais;
- confusão em períodos de folga;
- erros em consultas manuais;
- dependência de planilhas, murais ou anotações;
- dificuldade para reutilizar escalas já conhecidas;
- dificuldade para editar ou remover escalas cadastradas incorretamente;
- dificuldade para lidar com diferentes modelos de escala em um mesmo sistema;
- falta de uma visão clara para o colaborador e para a empresa.

Este projeto nasceu a partir de uma necessidade real: transformar uma regra repetitiva em uma ferramenta prática, testável e expansível.

---

## ✅ Solução proposta

O projeto permite consultar e gerenciar escalas de trabalho de forma automatizada.

A versão atual permite:

- consultar se uma data será de trabalho ou folga em escalas por dias;
- consultar se uma data e hora estará dentro de trabalho ou folga em escalas por horas;
- consultar qual turno corresponde a uma data em escalas rotativas;
- visualizar próximos dias para escalas como `6x3`;
- visualizar próximos períodos para escalas como `12x36`;
- visualizar sequência futura para turnos rotativos;
- alterar a escala atual durante a execução;
- cadastrar escalas por dias;
- cadastrar escalas por horas;
- cadastrar escalas por turno rotativo;
- listar escalas salvas;
- aplicar uma escala salva como escala atual;
- editar escalas salvas por dias;
- editar escalas salvas por horas;
- editar escalas salvas por turno rotativo;
- excluir escalas salvas;
- confirmar ações sensíveis antes de editar ou excluir;
- bloquear nomes duplicados;
- bloquear configurações duplicadas considerando o tipo da escala;
- bloquear sequência de turnos vazia;
- persistir dados em JSON;
- normalizar escalas antigas sem campo `tipo`;
- validar os tipos de escala;
- testar a lógica com testes automatizados.

---

## 🎯 Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🔎 Consultar status | Verifica se o usuário estará trabalhando, folgando ou em determinado turno |
| 📆 Ver próximos dias | Gera sequência futura para escalas por dias e turnos rotativos |
| ⏱️ Ver próximos períodos | Gera blocos de trabalho e folga para escalas por horas |
| ⚙️ Alterar escala atual | Permite trocar rapidamente a escala em uso |
| ⭐ Cadastrar escala | Salva escalas por dias, por horas ou por turno rotativo |
| 📋 Listar escalas salvas | Exibe escalas registradas no JSON |
| ✅ Aplicar escala salva | Define uma escala salva como escala atual |
| ✏️ Editar escala salva | Atualiza nome e configuração da escala |
| 🗑️ Excluir escala salva | Remove escalas cadastradas |
| 🛡️ Confirmação de ação | Evita alterações e exclusões acidentais |
| 💾 Persistência JSON | Mantém escalas salvas fora do código |
| 🧪 Testes automatizados | Reduz risco de regressão |
| 🌐 Demo web | Apresenta o projeto visualmente no navegador |

---

## 🧠 Como a lógica funciona

### 🔁 Escalas por dias

Exemplo de escala `6x3`:

```text
6 dias trabalhando + 3 dias de folga = ciclo de 9 dias
```

A lógica calcula quantos dias passaram desde a data inicial da escala e encontra a posição da data consultada dentro do ciclo.

Exemplo:

```text
Data inicial:    01/05/2026
Escala:          6x3
Data consultada: 07/05/2026
```

Resultado:

```text
Na data 07/05/2026, você estará: Folga
```

---

### ⏱️ Escalas por horas

Exemplo de escala `12x36`:

```text
12 horas trabalhando + 36 horas de folga = ciclo de 48 horas
```

A lógica calcula quantas horas passaram desde a data e hora inicial da escala e encontra a posição da data e hora consultada dentro do ciclo.

Exemplo:

```text
Data e hora inicial:    01/06/2026 06:00
Escala:                 12x36
Data e hora consultada: 01/06/2026 20:00
```

Resultado:

```text
Na data e hora 01/06/2026 20:00, você estará: Folga
```

---

### 🔄 Turno rotativo

Exemplo de sequência rotativa:

```text
Manhã -> Manhã -> Tarde -> Tarde -> Noite -> Noite -> Folga -> Folga
```

A lógica calcula quantos dias passaram desde a data inicial da escala e usa esse valor para encontrar a posição correta dentro da sequência.

Exemplo:

```text
Data inicial:    01/05/2026
Sequência:       Manhã -> Manhã -> Tarde -> Tarde -> Noite -> Noite -> Folga -> Folga
Data consultada: 03/05/2026
```

Resultado:

```text
Na data 03/05/2026, você estará: Tarde
```

O ciclo se repete automaticamente quando chega ao fim da sequência.

---

## 🖥️ Menu principal da CLI

```text
==== SIMULADOR DE ESCALA DE TRABALHO ====

Escala atual: 6x3 dias

1 - Consultar status em uma data
2 - Visualizar próximos dias/períodos
3 - Alterar escala atual
4 - Usar escala salva
5 - Cadastrar nova escala
6 - Editar escala salva
7 - Excluir escala salva
8 - Sair
```

A opção de alterar, cadastrar e editar escala agora trabalha com três tipos:

```text
1 - Ciclo por dias
2 - Ciclo por horas
3 - Turno rotativo
```

---

## 💾 Exemplo de escalas salvas

As escalas são armazenadas em JSON, facilitando persistência e reutilização.

### Ciclo por dias

```json
{
  "nome": "Escala padrão 6x3",
  "tipo": "ciclo_dias",
  "dias_trabalho": 6,
  "dias_folga": 3
}
```

### Ciclo por horas

```json
{
  "nome": "Escala 12x36",
  "tipo": "ciclo_horas",
  "horas_trabalho": 12,
  "horas_folga": 36
}
```

### Turno rotativo

```json
{
  "nome": "Turno rotativo operacional",
  "tipo": "turno_rotativo",
  "sequencia_turnos": [
    "Manhã",
    "Manhã",
    "Tarde",
    "Tarde",
    "Noite",
    "Noite",
    "Folga",
    "Folga"
  ]
}
```

---

## 🧱 Arquitetura do projeto

O projeto foi separado em módulos para facilitar manutenção, testes e evolução.

```text
simulador-escala-trabalho/
│
├── main.py
├── escala.py
├── armazenamento.py
├── interface.py
├── tipos_escala.py
├── validacoes.py
│
├── data/
│   └── escalas.json
│
├── docs/
│   └── demo/
│       ├── index.html
│       ├── style.css
│       └── script.js
│
├── tests/
│   ├── test_escala.py
│   ├── test_armazenamento.py
│   └── test_tipos_escalas.py
│
├── assets/
│   └── banner.png
│
├── README.md
├── CHANGELOG.md
└── LICENSE
```

---

## 🧩 Responsabilidades dos arquivos

| Arquivo | Responsabilidade |
|---|---|
| `main.py` | Controla o fluxo principal da aplicação e o menu da CLI |
| `escala.py` | Contém as regras de cálculo das escalas |
| `armazenamento.py` | Gerencia leitura, escrita, cadastro, edição e exclusão no JSON |
| `interface.py` | Centraliza exibições, menus e mensagens visuais |
| `validacoes.py` | Controla leitura e validação de entradas do usuário |
| `tipos_escala.py` | Define os tipos de escala suportados |
| `tests/` | Contém testes automatizados com pytest |
| `docs/demo/` | Contém a demo web interativa publicada no GitHub Pages |
| `data/escalas.json` | Armazena as escalas cadastradas |

---

## 🧪 Testes automatizados

O projeto utiliza `pytest` para validar os principais comportamentos.

Os testes cobrem:

- cálculo de escalas por dias;
- geração de próximos dias;
- cálculo de escalas por horas;
- geração de próximos períodos;
- cálculo de turno rotativo;
- geração de próximos dias para turno rotativo;
- validação de sequência vazia;
- cadastro de escalas;
- edição de escalas;
- remoção de escalas;
- bloqueio de nomes duplicados;
- bloqueio de configurações duplicadas;
- migração de escalas antigas;
- validação de tipos de escala.

Para executar:

```bash
pytest
```

---

## ▶️ Como executar o projeto

Clone o repositório:

```bash
git clone https://github.com/Dinox75/simulador-escala-trabalho.git
```

Acesse a pasta:

```bash
cd simulador-escala-trabalho
```

Execute a aplicação:

```bash
python main.py
```

Para rodar os testes:

```bash
pytest
```

---

## 🧭 Linha de evolução

| Versão | Entrega principal |
|---|---|
| `v0.1.0` | Simulador inicial de escala por dias |
| `v0.2.0` | Escalas favoritas com persistência em JSON |
| `v0.3.0` | CRUD completo de escalas salvas |
| `v0.4.0` | Preparação para múltiplos tipos de escala |
| `v0.5.0` | Escalas por horas e suporte real ao 12x36 |
| `v0.6.0` | Suporte inicial a turno rotativo |

---

## 🏢 Visão de produto

O projeto começou como uma aplicação de terminal, mas está sendo estruturado com uma visão maior: evoluir para uma ferramenta útil tanto para o colaborador quanto para empresas.

### 👤 Área do colaborador

Ideias futuras:

- consultar rapidamente se trabalha ou folga;
- visualizar calendário mensal da escala;
- receber alertas de próximos turnos;
- salvar múltiplas escalas pessoais;
- consultar feriados e compromissos;
- exportar calendário;
- usar interface web ou mobile.

### 🏭 Área da empresa

Ideias futuras:

- cadastrar setores;
- cadastrar colaboradores;
- organizar equipes por escala;
- visualizar cobertura de turnos;
- acompanhar folgas;
- reduzir conflitos de agenda;
- gerar relatórios;
- integrar com sistemas internos.

---

## 🗺️ Roadmap

### Próximas melhorias técnicas

- Refatorar `main.py` para reduzir responsabilidades.
- Mover exibições específicas de turno rotativo para `interface.py`.
- Melhorar mensagens de erro no CLI.
- Criar testes para fluxos mais próximos do uso real.
- Melhorar tratamento de datas anteriores à data inicial.
- Padronizar retornos e mensagens.
- Atualizar a demo web para representar 100% dos recursos da CLI.

### Próximas melhorias de produto

- Calendário visual completo.
- Área do colaborador.
- Área da empresa.
- Exportação de escalas.
- Dashboard de turnos.
- Perfil de colaborador.
- Configuração de feriados.
- Notificações.
- Interface web completa.

---

## 🧠 Aprendizados aplicados

Durante o desenvolvimento foram aplicados conceitos importantes de programação e organização de projeto:

- funções puras para cálculo;
- separação de responsabilidades;
- persistência em arquivo JSON;
- validação de entrada;
- CRUD;
- tratamento de erros;
- testes automatizados;
- versionamento com Git;
- organização por branches;
- Pull Requests;
- documentação técnica;
- visão de produto;
- evolução incremental por versões.

---

## 📚 Tecnologias usadas

| Tecnologia | Uso |
|---|---|
| Python | Lógica principal da aplicação |
| JSON | Persistência das escalas |
| pytest | Testes automatizados |
| HTML | Estrutura da demo web |
| CSS | Estilização da demo web |
| JavaScript | Interatividade da demo web |
| Git | Versionamento |
| GitHub | Repositório, Pull Requests e Releases |
| GitHub Pages | Publicação da demo |

---

## 📷 Demonstração visual

A demo web está disponível em:

```text
https://dinox75.github.io/simulador-escala-trabalho/demo/
```

Ela apresenta:

- visão geral do projeto;
- simulador visual;
- gerenciamento de escalas;
- documentação;
- sobre;
- visão de futuro;
- termos;
- explicação da dor resolvida;
- proposta para colaborador e empresa.

---

## ⚠️ Limitações atuais

Esta versão já entrega uma base funcional, mas ainda possui pontos planejados para evolução:

- a aplicação principal ainda é CLI;
- a demo web funciona como vitrine e pode não refletir todos os recursos avançados da CLI;
- o turno rotativo ainda é baseado em sequência diária simples;
- ainda não há cadastro de colaboradores;
- ainda não há login;
- ainda não há banco de dados;
- ainda não há exportação de calendário;
- ainda não há painel empresarial;
- ainda não há alertas ou notificações.

---

## ✅ Status da v0.6.0

- [x] Cálculo de turno rotativo
- [x] Geração de próximos dias para turno rotativo
- [x] Validação de sequência vazia
- [x] Cadastro de turno rotativo
- [x] Edição de turno rotativo
- [x] Aplicação de escala rotativa salva
- [x] Integração com menu principal
- [x] Testes automatizados
- [x] README atualizado
- [x] CHANGELOG atualizado
- [x] Demo web repaginada para apresentação profissional

---

## 📄 Licença

Este projeto está licenciado para uso **não comercial**, conforme definido no arquivo `LICENSE`.

O uso, estudo e adaptação para fins educacionais são permitidos, respeitando os termos definidos na licença.

---

## 👨‍💻 Autor

Desenvolvido por **Vinicius Lima**.

Projeto criado como parte da evolução prática em Python, lógica de programação, arquitetura simples, testes automatizados, versionamento e construção de portfólio técnico.

<p align="center">
  <strong>⭐ Se este projeto te ajudou ou chamou sua atenção, considere deixar uma estrela no repositório.</strong>
</p>
