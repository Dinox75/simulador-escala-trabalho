<p align="center">
  <img src="./assets/banner.png" alt="Banner do projeto Simulador de Escala de Trabalho" width="100%">
</p>

<h1 align="center">⏰ Simulador de Escala de Trabalho</h1>

<p align="center">
  <strong>Projeto em Python para consultar, simular e visualizar escalas de trabalho como 6x3, 5x2, 4x4 e outras variações baseadas em ciclos.</strong>
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=2800&pause=900&color=00B4D8&center=true&vCenter=true&width=900&lines=Calcule+dias+de+trabalho+e+folga+com+Python;Simule+escalas+6x3%2C+5x2%2C+4x4+e+personalizadas;Projeto+CLI+modular+com+testes+automatizados" alt="Typing SVG">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/STATUS-EM%20DESENVOLVIMENTO-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PYTHON-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/INTERFACE-CLI-00C2FF?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/TESTES-PYTEST-48CAE4?style=for-the-badge&logo=pytest&logoColor=white&labelColor=061A2B">
  <img src="https://img.shields.io/badge/PORTF%C3%93LIO-GITHUB%20%7C%20LINKEDIN-90E0EF?style=for-the-badge&labelColor=061A2B">
</p>

---

<table>
  <tr>
    <td width="25%" align="center">
      <h3>🔁 Ciclos</h3>
      <p>Calcula automaticamente a posição da data dentro da escala.</p>
    </td>
    <td width="25%" align="center">
      <h3>📅 Consulta</h3>
      <p>Verifica se uma data será de trabalho ou folga.</p>
    </td>
    <td width="25%" align="center">
      <h3>🧩 Modular</h3>
      <p>Projeto separado por lógica, validação e interface.</p>
    </td>
    <td width="25%" align="center">
      <h3>🧪 Testado</h3>
      <p>Validação automatizada da lógica principal com pytest.</p>
    </td>
  </tr>
</table>

---

## 📌 Visão geral

O **Simulador de Escala de Trabalho** é uma aplicação desenvolvida em **Python** para calcular automaticamente se uma determinada data corresponde a um dia de **trabalho** ou **folga**, com base em uma escala definida pelo usuário.

A versão atual funciona via terminal, com foco em:

- clareza de lógica;
- manipulação de datas;
- cálculo de ciclos;
- validação de entradas;
- organização modular;
- testes automatizados;
- documentação profissional;
- evolução gradual para um sistema maior.

> [!NOTE]
> Apesar de começar como um projeto simples em CLI, ele foi estruturado com visão de produto: lógica bem definida, módulos separados, documentação estratégica e espaço para evolução futura.

---

## 🎯 Objetivo

Criar uma ferramenta prática que permita ao usuário:

| Recurso | Descrição |
|--------|-----------|
| 📅 Definir data inicial | Informa quando o ciclo da escala começa |
| 🔎 Consultar uma data | Verifica se o usuário estará trabalhando ou folgando |
| 📆 Visualizar próximos dias | Gera uma sequência futura da escala |
| ⚙️ Alterar escala | Permite mudar os dias de trabalho e folga |
| 🧠 Entender o ciclo | Aplica cálculo modular para localizar a posição dentro da escala |
| 🧪 Validar a lógica | Usa testes automatizados para reduzir erros em futuras alterações |

---

## 🧠 Exemplo prático

Imagine a seguinte escala:

| Informação | Valor |
|-----------|-------|
| Data inicial | `01/05/2026` |
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

## ⚙️ Funcionalidades

| Funcionalidade | Status |
|---------------|--------|
| Consultar uma data específica | ✅ Implementado |
| Gerar próximos dias da escala | ✅ Implementado |
| Alterar escala pelo menu | ✅ Implementado |
| Validação de datas | ✅ Implementado |
| Validação de entradas numéricas | ✅ Implementado |
| Validação de opções do menu | ✅ Implementado |
| Interface organizada em módulo próprio | ✅ Implementado |
| Testes automatizados da lógica principal | ✅ Implementado |
| Licença de uso não comercial | ✅ Implementado |
| Calendário mensal visual | 🔜 Planejado |
| Cadastro de funcionários | 🔜 Planejado |
| Exportação de relatórios | 🔜 Planejado |
| Interface gráfica ou web | 🔜 Planejado |

---

## 🖥️ Demonstração no terminal

```text
==== SIMULADOR DE ESCALAS ====
Escala atual: 6x3

1 - Consultar uma data
2 - Ver próximos dias
3 - Alterar escala
4 - Sair

Escolha uma opção: 1
Digite a data inicial da escala (dd/mm/aaaa): 01/05/2026
Digite a data que deseja consultar (dd/mm/aaaa): 07/05/2026

Na data 07/05/2026, você estará: 🌙 Folga
```

Exemplo de visualização dos próximos dias:

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

---

## 🧩 Arquitetura do projeto

```text
simulador-escala-trabalho/
│
├── assets/
│   └── banner.png
│
├── docs/
│   └── visao_produto.md
│
├── tests/
│   └── test_escala.py
│
├── escala.py
├── interface.py
├── main.py
├── validacoes.py
├── pytest.ini
├── LICENSE
└── README.md
```

### Responsabilidade dos arquivos

| Arquivo/Pasta | Responsabilidade |
|--------------|------------------|
| `assets/` | Armazena recursos visuais do projeto |
| `banner.png` | Banner principal utilizado no README |
| `docs/` | Documentação complementar e visão futura do produto |
| `visao_produto.md` | Documento estratégico sobre evolução do projeto |
| `tests/` | Testes automatizados do projeto |
| `test_escala.py` | Testes da lógica principal de escala |
| `escala.py` | Contém a lógica de cálculo da escala |
| `interface.py` | Centraliza menus, mensagens e exibição no terminal |
| `validacoes.py` | Centraliza validações de entrada do usuário |
| `main.py` | Controla o fluxo principal da aplicação |
| `pytest.ini` | Configuração para execução dos testes |
| `LICENSE` | Licença proprietária de uso não comercial |
| `README.md` | Documentação principal do projeto |

---

## 🧮 Como funciona a lógica

A lógica principal usa o conceito de **ciclo**.

Para uma escala `6x3`:

```text
ciclo = dias de trabalho + dias de folga
ciclo = 6 + 3
ciclo = 9 dias
```

Depois, o sistema calcula:

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

Essa abordagem permite reaproveitar a mesma lógica para diferentes modelos de escala.

---

## 🛠️ Tecnologias utilizadas

<p align="center">
  <img src="https://img.shields.io/badge/Python-061A2B?style=for-the-badge&logo=python&logoColor=FFD43B">
  <img src="https://img.shields.io/badge/Datetime-0077B6?style=for-the-badge">
  <img src="https://img.shields.io/badge/Pytest-00B4D8?style=for-the-badge&logo=pytest&logoColor=white">
  <img src="https://img.shields.io/badge/CLI-48CAE4?style=for-the-badge">
  <img src="https://img.shields.io/badge/Git-061A2B?style=for-the-badge&logo=git&logoColor=F05032">
  <img src="https://img.shields.io/badge/GitHub-03045E?style=for-the-badge&logo=github&logoColor=white">
</p>

### Conceitos praticados

- lógica de programação;
- funções;
- modularização;
- manipulação de datas;
- estruturas condicionais;
- estruturas de repetição;
- validação de entrada;
- cálculo de ciclos;
- testes automatizados;
- organização de projeto;
- documentação para portfólio;
- visão de evolução de produto.

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/Dinox75/simulador-escala-trabalho.git
```

### 2. Acesse a pasta

```bash
cd simulador-escala-trabalho
```

### 3. Execute o projeto

```bash
python main.py
```

Ou, dependendo do ambiente:

```bash
python3 main.py
```

---

## 🧪 Testes automatizados

O projeto possui testes com `pytest` para validar a lógica principal da escala.

### Executar os testes

```bash
python -m pytest
```

Exemplo de saída esperada:

```text
collected 3 items

tests/test_escala.py ...
```

### O que está sendo testado

| Função | O que o teste valida |
|-------|----------------------|
| `calcular_status()` | Se uma data retorna corretamente `Trabalhando` ou `Folga` |
| `gerar_proximos_dias()` | Se a sequência gerada respeita o ciclo da escala |
| Escala `6x3` | Se os primeiros 6 dias são trabalho e os 3 seguintes são folga |

---

## 🧪 Testes manuais sugeridos

| Data inicial | Escala | Data consultada | Resultado esperado |
|-------------|--------|-----------------|--------------------|
| `01/05/2026` | `6x3` | `01/05/2026` | Trabalhando |
| `01/05/2026` | `6x3` | `06/05/2026` | Trabalhando |
| `01/05/2026` | `6x3` | `07/05/2026` | Folga |
| `01/05/2026` | `6x3` | `09/05/2026` | Folga |
| `01/05/2026` | `6x3` | `10/05/2026` | Trabalhando |

---

## 🧭 Roadmap

### Versão atual

- [x] Criar lógica de cálculo de escala
- [x] Consultar status de uma data
- [x] Gerar próximos dias da escala
- [x] Criar menu interativo
- [x] Permitir alteração da escala no terminal
- [x] Separar validações em módulo próprio
- [x] Separar exibições em módulo próprio
- [x] Adicionar testes automatizados
- [x] Criar documentação de visão do produto
- [x] Adicionar licença de uso não comercial

### Próximas melhorias

- [ ] Criar cadastro simples de escalas favoritas
- [ ] Salvar configurações em arquivo JSON
- [ ] Criar visualização mensal da escala
- [ ] Adicionar suporte para múltiplos funcionários
- [ ] Permitir cadastro de turnos
- [ ] Exportar resultados em `.txt`, `.csv` ou `.pdf`
- [ ] Criar interface gráfica
- [ ] Criar versão web
- [ ] Evoluir para sistema corporativo de gestão de escalas

---

## 💼 Valor profissional

Este projeto demonstra habilidades importantes para desenvolvimento de software:

<table>
  <tr>
    <td align="center"><strong>🧠 Lógica</strong><br>Cálculo de ciclos e regras</td>
    <td align="center"><strong>📅 Datas</strong><br>Manipulação com datetime</td>
    <td align="center"><strong>🧩 Modularização</strong><br>Separação de responsabilidades</td>
  </tr>
  <tr>
    <td align="center"><strong>🖥️ CLI</strong><br>Interação via terminal</td>
    <td align="center"><strong>🧪 Testes</strong><br>Validação automatizada com pytest</td>
    <td align="center"><strong>📚 Documentação</strong><br>README e visão de produto</td>
  </tr>
</table>

> [!IMPORTANT]
> O objetivo não é apenas criar um script, mas desenvolver um projeto apresentável, organizado, testável e com potencial de evolução.

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
- painel para colaborador.

Leia mais em:

```text
docs/visao_produto.md
```

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
  <img src="https://img.shields.io/badge/Personalize-00B4D8?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/Simule-0077B6?style=for-the-badge&labelColor=061A2B">
  <img src="https://img.shields.io/badge/Planeje-03045E?style=for-the-badge&labelColor=061A2B">
</p>

<p align="center">
  ⭐ Se este projeto te ajudou ou serviu como inspiração, considere deixar uma estrela no repositório.
</p>