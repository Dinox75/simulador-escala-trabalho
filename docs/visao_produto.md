# Visão do Produto — Simulador de Escala de Trabalho

> Documento de visão estratégica do projeto **Simulador de Escala de Trabalho**, descrevendo a evolução do projeto de uma aplicação CLI em Python para uma possível plataforma de gestão de escalas, turnos, folgas, férias, relatórios e integrações operacionais.

> [!IMPORTANT]
> Este documento representa a visão futura do produto. Nem todas as funcionalidades descritas aqui estão implementadas na versão atual. A versão atual já possui base funcional em Python, demo web, persistência em JSON, suporte a PostgreSQL, arquitetura em camadas e testes automatizados.

---

## 1. Resumo executivo

O **Simulador de Escala de Trabalho** nasceu como uma aplicação em Python para responder uma dúvida simples:

> Em determinada data, eu estou trabalhando, de folga ou em qual turno?

A partir dessa necessidade, o projeto evoluiu para uma base mais estruturada, com suporte a diferentes tipos de escala, modelos predefinidos, turnos rotativos, demo web e persistência em banco de dados.

A visão de produto é transformar essa base em uma solução voltada para **clareza operacional**, ajudando colaboradores e empresas a consultarem, organizarem e acompanharem escalas de forma simples, confiável e visual.

---

## 2. Estado atual do projeto

A versão atual do projeto já deixou de ser apenas um script simples.

Hoje o projeto possui:

- aplicação CLI em Python;
- cálculo de escala por dias;
- cálculo de escala por horas;
- suporte a turno rotativo;
- modelos predefinidos;
- escala real de 24 dias;
- cadastro, edição, listagem e exclusão de escalas;
- persistência em JSON;
- suporte funcional a PostgreSQL;
- arquitetura com POO;
- camada de service;
- camada de repository;
- repository para JSON;
- repository para PostgreSQL;
- configuração técnica por variável de ambiente;
- testes automatizados com pytest;
- demo web interativa;
- documentação em evolução.

### Versão atual de referência

```text
v0.9.0 — PostgreSQL funcional
```

### Próxima frente visual/documental

```text
v0.10.0 — Site demo profissional, documentação separada e apresentação mais clara do produto
```

---

## 3. Problema identificado

Empresas com operação contínua, turnos alternados ou grande volume de colaboradores costumam lidar com diferentes tipos de escala.

Esse cenário aparece em ambientes como:

- fábricas;
- centros logísticos;
- supermercados;
- hospitais;
- segurança;
- transporte;
- operações 24h;
- produção industrial;
- manutenção;
- equipes com revezamento.

Nesses locais, a escala pode estar espalhada em:

- planilhas;
- grupos de mensagem;
- murais físicos;
- arquivos PDF;
- comunicação verbal;
- sistemas internos pouco intuitivos;
- memória de líderes ou colaboradores.

Isso gera dúvidas recorrentes:

- Hoje eu trabalho?
- Qual é meu turno?
- Quando vou folgar?
- Minha escala mudou?
- Esse feriado altera minha jornada?
- Minhas férias já estão consideradas?
- Como sei meus próximos dias de trabalho?
- Qual equipe estará disponível em determinado turno?

---

## 4. Dor principal

A dor central não é apenas calcular uma escala.

A dor real é a **falta de clareza operacional**.

Quando uma escala não está clara, surgem consequências como:

- dúvidas frequentes para liderança e RH;
- risco de faltas não intencionais;
- atrasos por interpretação errada;
- dificuldade para planejar vida pessoal;
- retrabalho na comunicação;
- erros em mudança de turno;
- dificuldade para novos colaboradores entenderem a rotina;
- pouca visibilidade para líderes sobre cobertura de equipe.

> [!NOTE]
> Uma escala mal comunicada não é apenas um problema de agenda. Ela pode afetar produtividade, confiança, previsibilidade e operação.

---

## 5. Proposta de solução

A proposta é evoluir o Simulador de Escala para uma plataforma simples, visual e confiável para consulta e gestão de escalas.

A solução deve atender dois lados:

### Para o colaborador

Uma visão individual da própria jornada.

O colaborador poderia consultar:

- dias de trabalho;
- folgas;
- turno atual;
- próximos turnos;
- férias;
- feriados aplicáveis;
- alterações feitas pela empresa;
- histórico de escala;
- alertas antes do turno.

### Para a empresa

Uma visão organizada das equipes e escalas.

A empresa poderia gerenciar:

- colaboradores;
- setores;
- modelos de escala;
- escalas por equipe;
- férias;
- faltas;
- feriados;
- paradas programadas;
- relatórios;
- cobertura por turno;
- possíveis integrações com ponto.

---

## 6. Princípio do produto

O produto deve ser construído com uma regra simples:

> O colaborador precisa entender sua jornada em segundos. A empresa precisa gerenciar a escala sem depender de comunicação espalhada.

Isso significa que o sistema deve priorizar:

- clareza;
- simplicidade;
- confiança;
- rastreabilidade;
- consulta rápida;
- visual limpo;
- regras explícitas;
- evolução gradual.

---

## 7. Público-alvo

| Público | Necessidade principal |
|---|---|
| Colaborador operacional | Consultar escala, folgas e turnos com clareza |
| Líder de equipe | Ver equipe, cobertura e ausências |
| RH | Organizar dados de jornada, férias e histórico |
| Empresa | Reduzir falhas de comunicação e melhorar previsibilidade |
| Desenvolvedor/recrutador | Avaliar arquitetura, evolução técnica e qualidade do projeto |

---

## 8. Segmentos com maior aderência

| Segmento | Possível uso |
|---|---|
| Indústrias e fábricas | Controle de turnos, paradas, escalas rotativas e equipes |
| Centros logísticos | Organização de equipes em operação contínua |
| Supermercados | Escalas por setor, caixa, estoque, padaria, açougue e reposição |
| Hospitais e clínicas | Plantões, trocas e jornadas alternadas |
| Segurança patrimonial | Revezamento de postos e equipes |
| Transporte | Equipes com horários variados |
| Operações 24h | Cobertura contínua por turno |
| Manutenção industrial | Escalas técnicas e plantões |

---

## 9. Personas principais

### 9.1 Colaborador

Perfil:

- trabalha em escala;
- precisa consultar folgas e turnos;
- pode ter dificuldade para acompanhar ciclos longos;
- depende de informação clara para se organizar.

Objetivos:

- saber se trabalha em determinada data;
- visualizar próximas folgas;
- entender o turno atual;
- acompanhar mudanças;
- evitar confusão com a escala.

Funcionalidades importantes:

- calendário individual;
- status do dia;
- próximos dias de trabalho;
- próximas folgas;
- alertas;
- histórico.

---

### 9.2 Empresa / Administrador

Perfil:

- cadastra e organiza a estrutura do sistema;
- define modelos de escala;
- associa colaboradores a escalas;
- consulta dados gerais.

Objetivos:

- centralizar informações;
- reduzir dúvidas;
- evitar inconsistências;
- organizar equipes;
- visualizar cobertura operacional.

Funcionalidades importantes:

- cadastro de empresa;
- cadastro de setores;
- cadastro de colaboradores;
- modelos de escala;
- associação colaborador → escala;
- relatórios;
- gestão de eventos.

---

### 9.3 Liderança / RH

Perfil:

- acompanha equipes;
- responde dúvidas;
- precisa enxergar escala, férias, faltas e disponibilidade.

Objetivos:

- consultar equipe por setor;
- visualizar ausências;
- planejar cobertura;
- validar informações;
- apoiar tomada de decisão.

Funcionalidades importantes:

- visão por equipe;
- filtros por setor;
- relatório de ausências;
- calendário coletivo;
- consulta por colaborador;
- exportação de dados.

---

## 10. Funcionalidades atuais

| Funcionalidade | Status |
|---|---|
| Cálculo de escala 6x3 | Implementado |
| Cálculo por dias | Implementado |
| Cálculo por horas | Implementado |
| Escala 12x36 | Implementado |
| Turno rotativo | Implementado |
| Modelos predefinidos | Implementado |
| Escala real de 24 dias | Implementado |
| Cadastro de escalas | Implementado |
| Edição de escalas | Implementado |
| Exclusão de escalas | Implementado |
| Persistência JSON | Implementado |
| Persistência PostgreSQL | Implementado |
| Testes automatizados | Implementado |
| Demo web | Implementado |
| Site demo separado por páginas | Em evolução |
| Login | Futuro |
| Cadastro de usuários | Futuro |
| API | Futuro |
| Painel administrativo | Futuro |

---

## 11. Funcionalidades futuras

| Módulo | Descrição | Prioridade |
|---|---|---|
| Cadastro de usuários | Permitir login e perfis | Alta |
| Cadastro de colaboradores | Registrar dados básicos do colaborador | Alta |
| Cadastro de empresas | Separar dados por empresa | Alta |
| Setores | Organizar colaboradores por área | Alta |
| Associação de escala | Vincular colaborador a uma escala | Alta |
| Calendário individual | Exibir jornada por colaborador | Alta |
| Calendário coletivo | Exibir equipe ou setor | Média |
| Férias | Registrar e exibir períodos de férias | Média |
| Feriados | Considerar feriados nacionais ou internos | Média |
| Paradas programadas | Registrar eventos da empresa | Média |
| Alertas | Avisar turno, folga ou mudança | Média |
| Relatórios | Gerar indicadores por período | Alta |
| Integração com ponto | Comparar escala planejada e ponto real | Avançada |
| API | Permitir comunicação com frontend e sistemas externos | Alta |
| Auditoria | Registrar alterações em escalas | Média |
| Permissões | Controlar acesso por perfil | Alta |

---

## 12. MVP recomendado

O primeiro MVP como produto não deve tentar resolver tudo.

O MVP recomendado deve focar em:

### Para empresa

- cadastro de empresa;
- cadastro de setor;
- cadastro de colaborador;
- cadastro de modelos de escala;
- associação de colaborador a uma escala;
- calendário básico por colaborador.

### Para colaborador

- login;
- consulta da própria escala;
- visualização de próximos dias;
- visualização de próximas folgas.

### Para sistema

- PostgreSQL como banco principal;
- autenticação;
- backend com API;
- frontend web;
- testes;
- documentação de uso.

---

## 13. Fora do escopo inicial

Para evitar um sistema grande demais no começo, algumas funcionalidades devem ficar fora do MVP inicial:

- integração com relógio de ponto;
- cálculo trabalhista avançado;
- banco de horas;
- fechamento de folha;
- gestão completa de RH;
- controle jurídico de jornada;
- aplicativo mobile nativo;
- notificações por WhatsApp;
- múltiplas empresas no mesmo ambiente com cobrança;
- relatórios complexos de BI.

Essas funcionalidades podem entrar depois, quando a base estiver estável.

---

## 14. Módulos futuros do sistema

Uma arquitetura futura de produto poderia ser organizada assim:

```text
Sistema de Gestão de Escalas
│
├── Autenticação
│   ├── Login
│   ├── Permissões
│   └── Perfis de acesso
│
├── Empresas
│   ├── Cadastro da empresa
│   ├── Configurações
│   └── Feriados internos
│
├── Colaboradores
│   ├── Cadastro
│   ├── Setor
│   ├── Cargo
│   └── Escala associada
│
├── Escalas
│   ├── Ciclo por dias
│   ├── Ciclo por horas
│   ├── Turno rotativo
│   └── Modelos personalizados
│
├── Calendário
│   ├── Visão individual
│   ├── Visão por setor
│   └── Visão por equipe
│
├── Eventos
│   ├── Férias
│   ├── Feriados
│   ├── Paradas
│   └── Ausências
│
├── Relatórios
│   ├── Por colaborador
│   ├── Por setor
│   └── Por período
│
├── Integrações
│   ├── Relógio de ponto
│   ├── APIs externas
│   └── Exportações
│
└── Interface
    ├── Painel empresa
    ├── Painel colaborador
    └── Área administrativa
```

---

## 15. Arquitetura técnica atual

A arquitetura atual já prepara o projeto para essa evolução.

```text
main.py
  ↓
armazenamento.py
  ↓
EscalaService
  ↓
EscalaRepository
  ├── JsonEscalaRepository
  └── PostgresEscalaRepository
      ↓
      PostgreSQL
```

Essa estrutura permite trocar a forma de persistência sem misturar regra de negócio com banco de dados.

---

## 16. Arquitetura técnica futura

Uma arquitetura futura para produto web poderia seguir este caminho:

```text
Frontend Web
  ↓
API Backend
  ↓
Services
  ↓
Repositories
  ↓
PostgreSQL
```

Possível stack:

| Camada | Tecnologia possível |
|---|---|
| Frontend | HTML/CSS/JavaScript, React ou Vue |
| Backend | FastAPI ou Flask |
| Banco | PostgreSQL |
| Autenticação | JWT ou sessão |
| Testes | Pytest |
| Deploy | Render, Railway, Fly.io, VPS ou Docker |
| Documentação API | Swagger/OpenAPI |
| Versionamento | Git/GitHub |
| CI/CD | GitHub Actions |

---

## 17. Modelo de dados futuro

Entidades prováveis:

```text
Empresa
Setor
Usuário
Colaborador
Escala
TipoEscala
Turno
EventoCalendario
Férias
Feriado
Ausência
RegistroPonto
Relatório
```

Relacionamentos possíveis:

```text
Empresa 1:N Setores
Empresa 1:N Colaboradores
Setor 1:N Colaboradores
Colaborador N:1 Escala
Escala 1:N Turnos
Colaborador 1:N EventosCalendario
Colaborador 1:N Férias
Colaborador 1:N Ausências
```

---

## 18. Calendário individual

O calendário individual seria uma das telas mais importantes do produto.

Ele deve responder rapidamente:

- hoje eu trabalho?
- estou de folga?
- qual é meu turno?
- quando é minha próxima folga?
- quando começo férias?
- houve alteração na escala?

Possível visual:

```text
Segunda      Trabalho - Manhã
Terça        Trabalho - Manhã
Quarta       Folga
Quinta       Folga
Sexta        Trabalho - Tarde
Sábado       Trabalho - Tarde
Domingo      Folga
```

---

## 19. Calendário da empresa

A empresa poderia visualizar:

- colaboradores por turno;
- equipe disponível por dia;
- folgas por setor;
- férias programadas;
- ausências;
- cobertura mínima;
- conflitos.

Exemplo de uso:

```text
Setor: Produção
Data: 20/07/2026

Manhã:
- 18 colaboradores previstos
- 2 férias
- 1 falta registrada

Tarde:
- 22 colaboradores previstos
- 0 férias
- 0 faltas

Noite:
- 15 colaboradores previstos
- 1 ausência
```

---

## 20. Relatórios

Relatórios podem ser divididos em três grupos.

### Relatórios operacionais

- colaboradores por turno;
- cobertura por setor;
- folgas por período;
- férias programadas;
- ausências;
- escala aplicada por equipe.

### Relatórios individuais

- histórico de jornada;
- dias trabalhados;
- folgas;
- férias;
- faltas;
- alterações de escala.

### Relatórios estratégicos

- setores com maior ausência;
- turnos com menor cobertura;
- concentração de férias;
- divergência entre planejado e realizado;
- necessidade de reforço de equipe.

---

## 21. Integração com relógio de ponto

Em uma fase avançada, o sistema pode se integrar com relógios de ponto ou sistemas externos.

Objetivo:

> Comparar a escala planejada com os registros reais de entrada e saída.

Possíveis análises:

- presença confirmada;
- atraso;
- ausência;
- divergência de turno;
- hora extra;
- saída antecipada;
- inconsistência de registro.

> [!WARNING]
> Integrações com ponto eletrônico exigem atenção a regras trabalhistas, LGPD, segurança de dados, permissões de acesso e validação jurídica.

---

## 22. Valor para a empresa

| Benefício | Impacto esperado |
|---|---|
| Centralização das escalas | Menos informação espalhada |
| Clareza operacional | Menos dúvidas recorrentes |
| Redução de erros | Menos faltas por confusão |
| Planejamento de equipe | Melhor cobertura por turno |
| Apoio ao RH | Dados mais acessíveis |
| Relatórios | Melhor análise por setor |
| Histórico | Mais rastreabilidade |
| Integração futura | Base para conectar sistemas internos |

---

## 23. Valor para o colaborador

| Benefício | Impacto esperado |
|---|---|
| Consulta rápida | Menos dependência de terceiros |
| Previsibilidade | Melhor planejamento pessoal |
| Clareza de turno | Menos erro de interpretação |
| Próximas folgas | Melhor organização da rotina |
| Histórico | Mais transparência |
| Alertas futuros | Menos esquecimento |

---

## 24. Indicadores de sucesso

Quando o projeto virar produto, alguns indicadores podem medir valor real:

| Métrica | O que mede |
|---|---|
| Consultas por colaborador | Uso da plataforma |
| Dúvidas reduzidas com RH/liderança | Eficiência operacional |
| Escalas cadastradas | Aderência da empresa |
| Colaboradores ativos | Engajamento |
| Alterações registradas | Rastreabilidade |
| Erros de escala reportados | Qualidade da comunicação |
| Tempo para consultar escala | Usabilidade |
| Uso por setor | Cobertura interna |

---

## 25. Segurança e LGPD

Em uma evolução com dados reais de colaboradores, o projeto precisará considerar:

- controle de acesso;
- autenticação segura;
- senhas protegidas;
- permissões por perfil;
- logs de alteração;
- consentimento e finalidade de uso;
- minimização de dados pessoais;
- exclusão ou anonimização quando necessário;
- criptografia quando aplicável;
- boas práticas de backup;
- separação de dados por empresa.

> [!IMPORTANT]
> A partir do momento em que o sistema tratar dados reais de colaboradores, segurança e LGPD deixam de ser detalhes técnicos e passam a ser requisitos centrais do produto.

---

## 26. Riscos e desafios

| Risco | Cuidado necessário |
|---|---|
| Complexidade trabalhista | Não tentar substituir folha ou jurídico no início |
| Dados sensíveis | Implementar segurança desde cedo |
| Regras diferentes por empresa | Criar modelos flexíveis |
| Escalas com exceções | Separar regra padrão de eventos especiais |
| Integração com ponto | Tratar como fase avançada |
| Interface confusa | Priorizar clareza e usabilidade |
| Produto amplo demais | Começar com MVP enxuto |

---

## 27. Roadmap sugerido

### v0.9.0 — Banco de dados

Status: concluído.

- PostgreSQL funcional;
- repository PostgreSQL;
- configuração por variável de ambiente;
- testes automatizados;
- JSON preservado como padrão seguro.

### v0.10.0 — Apresentação profissional

Status: em andamento.

- site demo dividido por páginas;
- documentação visual mais clara;
- landing page mais forte;
- separação entre simulador, documentação, sobre e termos;
- melhor comunicação para LinkedIn e portfólio.

### v0.11.0 — API inicial

Possível foco:

- criar backend com FastAPI ou Flask;
- expor endpoints de escalas;
- manter PostgreSQL como banco;
- preparar comunicação com frontend.

### v0.12.0 — Usuários e autenticação

Possível foco:

- login;
- cadastro de usuários;
- perfis;
- permissões básicas.

### v1.0.0 — Produto mínimo com colaborador

Possível foco:

- colaborador com escala vinculada;
- consulta individual;
- calendário próprio;
- painel simples;
- banco como fonte principal.

---

## 28. Visão de longo prazo

A visão de longo prazo é transformar o Simulador de Escala de Trabalho em uma plataforma de gestão de jornada simples, visual e confiável.

O projeto deve evoluir sem perder o foco:

> Começar resolvendo bem a consulta de escala. Depois crescer para gestão, relatórios, usuários, calendário e integrações.

Essa evolução permite que o projeto continue servindo como portfólio técnico, mas também como base real para um produto aplicável em ambientes operacionais.

---

## 29. Conclusão

O Simulador de Escala de Trabalho representa uma ideia com base prática: reduzir confusão sobre trabalho, folga e turnos.

A versão atual já demonstra evolução técnica importante, saindo de um cálculo simples em terminal para uma aplicação com arquitetura em camadas, persistência em JSON e PostgreSQL, testes automatizados e demo web.

A visão de produto é continuar essa evolução de forma responsável, transformando o projeto em uma solução que ajude colaboradores a terem clareza sobre sua rotina e empresas a organizarem melhor suas escalas.

Mais do que um exercício de programação, o projeto tem potencial para se tornar uma ferramenta real de organização operacional, comunicação interna e gestão de jornada.
