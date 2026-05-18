# Visão do Produto

> Documento de visão estratégica do projeto **Simulador de Escala de Trabalho**, descrevendo sua possível evolução de uma aplicação CLI em Python para uma plataforma corporativa de gestão de escalas, jornadas, folgas, férias, relatórios e integrações operacionais.

> [!IMPORTANT]
> Este documento representa a visão futura do produto. Nem todas as funcionalidades descritas aqui estão implementadas na versão atual do projeto.

---

## 1. Contexto

O **Simulador de Escala de Trabalho** nasceu como uma aplicação simples em Python, executada via terminal, com o objetivo de calcular se uma determinada data corresponde a um dia de **trabalho** ou **folga**, com base em uma escala definida.

Apesar de começar como um projeto de estudo e portfólio, a ideia possui potencial para evoluir para uma solução corporativa mais completa: um sistema privado para empresas gerenciarem escalas, turnos, funcionários, folgas, férias, feriados, paradas programadas e relatórios operacionais.

A lógica atual do projeto funciona como o primeiro núcleo do sistema: o cálculo de ciclos de trabalho e folga.

---

## 2. Problema identificado

Empresas com grande volume de colaboradores, principalmente em ambientes industriais, logísticos, operacionais e de produção, costumam lidar com diferentes tipos de escala, turnos e regras internas.

Nesse cenário, colaboradores podem ter dificuldade para entender corretamente:

- quais dias irão trabalhar;
- quais dias estarão de folga;
- quando haverá troca de turno;
- quais feriados afetam sua escala;
- quando existem paradas de fábrica;
- quando começam ou terminam suas férias;
- como consultar seu histórico de trabalho, faltas e folgas.

Do lado da empresa, o desafio está em manter uma visão centralizada, confiável e atualizada sobre a jornada dos colaboradores, especialmente quando há diferentes setores, líderes, turnos e escalas.

> [!NOTE]
> A falta de clareza sobre escalas pode gerar atrasos, faltas não intencionais, dúvidas recorrentes com liderança/RH e falhas de comunicação operacional.

---

## 3. Proposta de solução

A proposta é evoluir o projeto para uma plataforma privada de gestão de escalas, acessível por empresas e colaboradores.

A empresa poderia cadastrar funcionários, setores, escalas, férias, feriados e paradas programadas. O colaborador, por sua vez, teria acesso a uma visão individual da própria jornada, podendo consultar seus próximos dias de trabalho, folgas, férias e alertas.

A ideia central é transformar uma regra que hoje está no terminal em uma solução mais ampla, com potencial para:

- reduzir confusão sobre escalas;
- melhorar a comunicação entre empresa e colaborador;
- apoiar o RH e a liderança;
- gerar relatórios operacionais;
- futuramente integrar com relógios de ponto ou sistemas internos.

---

## 4. Público-alvo

O sistema seria voltado para empresas que possuem muitos colaboradores e trabalham com escalas variadas.

| Tipo de empresa | Possível uso |
|---|---|
| Indústrias e fábricas | Controle de turnos, paradas e escalas rotativas |
| Centros logísticos | Organização de equipes em operação contínua |
| Supermercados | Escalas variadas por setor e turno |
| Hospitais | Controle de plantões e jornadas alternadas |
| Empresas de segurança | Escalas com revezamento |
| Empresas de transporte | Controle de equipes em horários diferentes |
| Operações 24h | Gestão de múltiplos turnos |

Um exemplo prático seria uma empresa de grande porte, com muitos colaboradores em escalas diferentes, onde novos funcionários precisam consultar seus dias de trabalho e folga sem depender apenas de planilhas, murais ou comunicação informal.

---

## 5. Perfis de usuário

| Perfil | Objetivo principal |
|---|---|
| Empresa / Administrador | Gerenciar funcionários, escalas, eventos e relatórios |
| Colaborador | Consultar a própria escala, folgas, férias e alertas |
| Liderança / RH | Acompanhar equipe, ausências, jornadas e indicadores |

---

## 6. Empresa / Administrador

O perfil de empresa ou administrador seria responsável por gerenciar a estrutura principal do sistema.

Possíveis funcionalidades:

- cadastrar empresa;
- cadastrar setores;
- cadastrar funcionários;
- definir escalas de trabalho;
- associar funcionários a escalas;
- registrar férias;
- registrar faltas;
- cadastrar feriados;
- cadastrar paradas de fábrica;
- consultar relatórios individuais;
- consultar relatórios gerais;
- visualizar indicadores por setor, escala ou colaborador.

---

## 7. Colaborador

O colaborador teria acesso a uma visão individual e simplificada da própria jornada.

Possíveis funcionalidades:

- visualizar próximos dias de trabalho;
- visualizar próximas folgas;
- consultar férias;
- consultar feriados aplicáveis;
- receber alertas antes do turno;
- consultar histórico de dias trabalhados;
- consultar faltas registradas;
- acompanhar sua escala atual;
- verificar mudanças feitas pela empresa.

> [!TIP]
> Essa visão é especialmente útil para novos colaboradores, que ainda estão se adaptando à rotina da empresa e ao funcionamento da escala.

---

## 8. Liderança / RH

Em uma versão futura, o sistema também poderia ter um perfil intermediário para líderes, supervisores ou RH.

Possíveis funcionalidades:

- acompanhar equipe;
- visualizar escala do setor;
- consultar ausências;
- identificar faltas;
- apoiar planejamento operacional;
- gerar relatórios de presença e jornada;
- validar informações antes de envio para folha ou controle interno.

---

## 9. Funcionalidades futuras

| Módulo | Descrição | Prioridade futura |
|---|---|---|
| Gestão de empresas | Cadastro e organização de ambientes por empresa | Alta |
| Gestão de funcionários | Cadastro de colaboradores, matrícula, setor e escala | Alta |
| Gestão de escalas | Criação de escalas 6x3, 5x2, 4x4 e personalizadas | Alta |
| Calendário individual | Visualização de trabalho, folgas, férias e feriados | Alta |
| Alertas | Lembretes antes do turno ou mudanças de escala | Média |
| Feriados e paradas | Cadastro de eventos que impactam a jornada | Média |
| Relatórios | Indicadores individuais e gerais | Alta |
| Integração com ponto | Comparação entre escala planejada e ponto registrado | Avançada |

---

## 10. Gestão de escalas

O sistema poderá permitir a criação de diferentes modelos de escala, como:

- 6x3;
- 5x2;
- 6x1;
- 4x4;
- escalas personalizadas;
- escalas por setor;
- escalas por funcionário;
- escalas com troca de turno.

A lógica atual do projeto já permite calcular ciclos baseados em dias de trabalho e dias de folga. Futuramente, essa lógica poderá ser expandida para lidar com turnos, exceções, feriados, férias e mudanças específicas de funcionário.

---

## 11. Calendário individual

Cada colaborador poderá visualizar um calendário com:

- dias de trabalho;
- folgas;
- férias;
- feriados;
- paradas programadas;
- possíveis alterações de escala.

Essa funcionalidade ajudaria a reduzir dúvidas e evitar que colaboradores se percam no ciclo da escala.

---

## 12. Alertas e notificações

Uma funcionalidade futura importante seria a ativação de alertas.

Possíveis alertas:

| Alerta | Objetivo |
|---|---|
| Lembrete antes do turno | Avisar o colaborador antes do horário de trabalho |
| Mudança de escala | Notificar alteração feita pela empresa |
| Início de férias | Avisar início do período de férias |
| Retorno ao trabalho | Lembrar retorno após férias ou folga |
| Parada programada | Comunicar parada de fábrica ou evento interno |
| Feriado | Informar impacto de feriado na jornada |

---

## 13. Relatórios

O sistema poderá gerar relatórios tanto para a empresa quanto para o colaborador.

### Relatórios para a empresa

- dias trabalhados por funcionário;
- folgas no período;
- faltas registradas;
- férias programadas;
- histórico anual;
- resumo por setor;
- resumo por escala;
- relatório individual;
- relatório geral.

### Relatórios para o colaborador

- dias trabalhados no mês;
- dias trabalhados no ano;
- folgas;
- faltas;
- férias;
- histórico de jornada.

---

## 14. Integração com relógio de ponto

Em uma evolução mais avançada, o sistema poderá se integrar a relógios de ponto ou sistemas externos via API.

Essa integração permitiria comparar a escala planejada com os registros reais de entrada e saída.

Possíveis análises:

- presença confirmada;
- falta;
- atraso;
- divergência entre escala e ponto;
- horas trabalhadas;
- inconsistências de registro.

> [!WARNING]
> Integrações com ponto eletrônico exigem atenção a regras trabalhistas, segurança de dados, permissões de acesso e confiabilidade das informações.

---

## 15. Valor para a empresa

A solução pode gerar valor ao centralizar informações de escala e reduzir falhas de comunicação.

| Benefício | Impacto esperado |
|---|---|
| Clareza de jornada | Menos dúvidas sobre dias de trabalho e folga |
| Organização operacional | Melhor planejamento de equipes |
| Redução de erros | Menos faltas por confusão de escala |
| Apoio ao RH | Informações mais acessíveis e organizadas |
| Relatórios | Melhor acompanhamento de indicadores |
| Integração futura | Possibilidade de conexão com sistemas internos |

---

## 16. Valor para o colaborador

Para o colaborador, o sistema oferece autonomia e previsibilidade.

Benefícios esperados:

- consultar a própria escala a qualquer momento;
- entender melhor seus ciclos de trabalho e folga;
- evitar confusão sobre dias de trabalho;
- receber alertas antes do turno;
- acompanhar férias, folgas e feriados;
- ter uma visão mais transparente da própria jornada.

---

## 17. Evolução técnica planejada

A evolução do projeto pode acontecer em fases, respeitando o aprendizado e a complexidade do sistema.

| Fase | Objetivo | Tecnologias possíveis |
|---|---|---|
| Fase 1 | Aplicação CLI | Python |
| Fase 2 | Persistência em arquivos | JSON |
| Fase 3 | Cadastro básico | Python + JSON |
| Fase 4 | Banco de dados | SQLite, PostgreSQL ou MySQL |
| Fase 5 | API | FastAPI ou Flask |
| Fase 6 | Interface web ou app | HTML, CSS, JavaScript, React ou Flutter |
| Fase 7 | Integrações externas | APIs, sistemas de ponto, serviços internos |

---

## 18. Fase atual — Aplicação CLI

A versão atual do projeto está focada em:

- calcular escalas;
- consultar datas;
- gerar próximos dias;
- validar entradas;
- organizar o código em módulos;
- documentar o projeto;
- manter uma base simples, funcional e evolutiva.

Essa etapa é importante porque estabelece a lógica principal antes de adicionar camadas mais complexas, como banco de dados, autenticação ou interface.

---

## 19. Possível arquitetura futura

Uma arquitetura futura poderia seguir uma divisão parecida com:

```text
Sistema de Gestão de Escalas
│
├── Empresas
├── Usuários
├── Funcionários
├── Setores
├── Escalas
├── Turnos
├── Feriados
├── Férias
├── Faltas
├── Registros de ponto
├── Relatórios
├── API
└── Interface web/app
```

Essa estrutura ajudaria a separar responsabilidades e permitir crescimento gradual do projeto.

---

## 20. Visão de longo prazo

A visão de longo prazo é transformar o projeto em uma solução completa de gestão de escalas corporativas, com foco em clareza, organização e redução de falhas operacionais.

O projeto começa como um simulador simples em Python, mas foi pensado para crescer de forma gradual, passando por etapas importantes de desenvolvimento de software:

- lógica de negócio;
- validação de dados;
- modularização;
- persistência;
- banco de dados;
- API;
- autenticação;
- interface;
- relatórios;
- integração com sistemas externos.

---

## 21. Conclusão

O **Simulador de Escala de Trabalho** representa o primeiro passo de uma ideia maior: criar uma solução que ajude empresas e colaboradores a lidarem melhor com escalas, turnos, folgas e jornadas.

A versão atual tem foco na lógica principal do problema. As próximas versões podem transformar essa base em um sistema mais completo, com cadastro de empresas, funcionários, relatórios, calendário e integração com ponto eletrônico.

Mais do que um exercício de programação, este projeto tem potencial para se tornar uma aplicação real voltada para organização operacional, produtividade e melhoria da comunicação entre empresa e colaborador.