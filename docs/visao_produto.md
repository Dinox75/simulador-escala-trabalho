# Visão do Produto

## 1. Contexto

O projeto **Simulador de Escala de Trabalho** nasceu inicialmente como uma aplicação simples em Python, executada via terminal, com o objetivo de calcular se uma determinada data corresponde a um dia de trabalho ou folga com base em uma escala definida.

Apesar de começar como um projeto de estudo e portfólio, a ideia possui potencial para evoluir para uma solução corporativa mais completa: um sistema privado de gestão de escalas, jornadas, folgas, férias, feriados, paradas programadas e relatórios operacionais para empresas com grande volume de colaboradores.

A proposta futura é transformar a lógica atual em um produto real, capaz de atender empresas que trabalham com diferentes turnos, escalas rotativas e equipes distribuídas em setores distintos.

---

## 2. Problema identificado

Empresas com muitos colaboradores, principalmente em ambientes industriais, logísticos, operacionais ou de produção, costumam lidar com diferentes tipos de escala, turnos e regras internas.

Em cenários como esse, é comum que colaboradores, principalmente novos funcionários, tenham dificuldade para entender corretamente:

- quais dias irão trabalhar;
- quais dias estarão de folga;
- quando haverá troca de turno;
- quais feriados afetam sua escala;
- quando existem paradas de fábrica;
- quando começam ou terminam suas férias;
- como consultar seu histórico de trabalho, faltas e folgas.

Do lado da empresa, a dificuldade está em manter uma visão clara e centralizada sobre a jornada dos colaboradores, especialmente quando há diferentes escalas, setores, líderes e regras operacionais.

A falta de clareza pode gerar atrasos, faltas não intencionais, dúvidas recorrentes com liderança e RH, falhas de comunicação e perda de produtividade.

---

## 3. Proposta de solução

A proposta é evoluir o projeto para uma plataforma privada de gestão de escalas, acessível por empresa e por colaborador, onde cada usuário tenha uma visão personalizada de suas informações.

O sistema permitiria que a empresa cadastrasse suas informações, setores, funcionários, escalas e eventos importantes, enquanto o colaborador poderia acessar sua própria conta para consultar seus dias de trabalho, folgas, férias, feriados e alertas relacionados à sua jornada.

A lógica atual do projeto, responsável por calcular ciclos de trabalho e folga, seria o núcleo inicial do sistema. Com o tempo, essa lógica poderia ser expandida para atender regras mais complexas de negócio.

---

## 4. Público-alvo

O sistema seria voltado para empresas que possuem grande quantidade de colaboradores e trabalham com escalas variadas, como:

- indústrias;
- fábricas;
- centros logísticos;
- supermercados;
- hospitais;
- empresas de segurança;
- empresas de transporte;
- operações com turnos alternados;
- empresas com regime 6x3, 5x2, 6x1, 4x4 ou escalas personalizadas.

Um exemplo de aplicação prática seria uma empresa de grande porte, como uma fábrica com muitos colaboradores em turnos diferentes, onde novos funcionários precisam consultar com facilidade seus dias de trabalho e folga sem depender sempre de planilhas, murais ou comunicação informal.

---

## 5. Perfis de usuário

## 5.1 Empresa / Administrador

O perfil de empresa ou administrador seria responsável por gerenciar a estrutura principal do sistema.

Possíveis permissões:

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

## 5.2 Colaborador

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

## 5.3 Liderança / RH

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

## 6. Funcionalidades futuras

## 6.1 Gestão de empresas

O sistema poderá permitir o cadastro de empresas, criando um ambiente privado para cada organização.

Cada empresa teria seus próprios usuários, funcionários, escalas, setores e regras internas.

## 6.2 Gestão de funcionários

A empresa poderá cadastrar colaboradores com informações como:

- nome;
- matrícula;
- setor;
- cargo;
- turno;
- escala vinculada;
- data de início na escala;
- status ativo ou inativo.

## 6.3 Gestão de escalas

O sistema poderá permitir a criação de diferentes modelos de escala, como:

- 6x3;
- 5x2;
- 6x1;
- 4x4;
- escalas personalizadas;
- escalas por setor;
- escalas por funcionário;
- escalas com troca de turno.

## 6.4 Calendário individual

Cada colaborador poderá visualizar um calendário com seus dias de trabalho, folgas, férias, feriados e eventos importantes.

Essa funcionalidade ajudaria principalmente novos colaboradores, evitando confusão sobre o ciclo da escala.

## 6.5 Alertas e notificações

Uma funcionalidade futura importante seria a ativação de alertas, como:

- lembrete antes do turno;
- aviso de mudança de escala;
- aviso de início de férias;
- aviso de retorno ao trabalho;
- aviso de parada programada;
- aviso de feriado.

## 6.6 Feriados, férias e paradas

A empresa poderá cadastrar eventos que impactam a escala, como:

- feriados nacionais;
- feriados locais;
- férias individuais;
- paradas de fábrica;
- afastamentos;
- folgas programadas;
- compensações.

## 6.7 Relatórios

O sistema poderá gerar relatórios para empresa e colaborador.

Relatórios possíveis para a empresa:

- dias trabalhados por funcionário;
- folgas no período;
- faltas registradas;
- férias programadas;
- histórico anual;
- resumo por setor;
- resumo por escala;
- relatório individual;
- relatório geral.

Relatórios possíveis para o colaborador:

- dias trabalhados no mês;
- dias trabalhados no ano;
- folgas;
- faltas;
- férias;
- histórico de jornada.

## 6.8 Integração com relógio de ponto

Em uma evolução mais avançada, o sistema poderá se integrar a relógios de ponto ou sistemas externos via API.

Essa integração permitiria comparar a escala planejada com os registros reais de entrada e saída, possibilitando análises como:

- presença confirmada;
- falta;
- atraso;
- divergência entre escala e ponto;
- horas trabalhadas;
- inconsistências de registro.

---

## 7. Valor para a empresa

A solução pode gerar valor para empresas ao centralizar informações de escala e reduzir falhas de comunicação.

Benefícios esperados:

- maior clareza na comunicação de jornadas;
- redução de dúvidas frequentes com RH e liderança;
- melhor organização de escalas;
- apoio ao planejamento operacional;
- redução de faltas causadas por confusão de escala;
- acompanhamento mais claro de folgas, férias e faltas;
- relatórios para tomada de decisão;
- possibilidade futura de integração com sistemas internos.

---

## 8. Valor para o colaborador

Para o colaborador, o sistema oferece autonomia e clareza.

Benefícios esperados:

- consultar a própria escala a qualquer momento;
- entender melhor seus ciclos de trabalho e folga;
- evitar confusão sobre dias de trabalho;
- receber alertas antes do turno;
- acompanhar férias, folgas e feriados;
- ter uma visão mais transparente da própria jornada.

Essa funcionalidade pode ser especialmente útil para novos colaboradores, que ainda estão se adaptando ao ritmo da empresa e às regras da escala.

---

## 9. Evolução técnica planejada

A evolução do projeto pode acontecer em fases, respeitando o aprendizado e a complexidade do sistema.

## Fase 1 — Aplicação CLI

Fase atual do projeto.

Objetivo:

- calcular escalas;
- consultar datas;
- gerar próximos dias;
- validar entradas;
- organizar o código em módulos;
- documentar o projeto.

## Fase 2 — Persistência com arquivos

Adicionar salvamento de dados em arquivos, como JSON.

Possíveis arquivos:

- empresas.json;
- funcionarios.json;
- escalas.json;
- feriados.json;
- registros.json.

## Fase 3 — Cadastro básico

Criar funcionalidades para cadastrar empresas, funcionários e escalas diretamente pelo terminal.

Objetivo:

- transformar o simulador em um pequeno sistema de gestão;
- permitir consultas vinculadas a funcionários;
- salvar e reutilizar dados cadastrados.

## Fase 4 — Banco de dados

Migrar os dados para um banco estruturado.

Possíveis tecnologias:

- SQLite para aprendizado inicial;
- PostgreSQL ou MySQL para uma abordagem mais profissional.

## Fase 5 — API

Criar uma API para permitir comunicação entre backend, frontend, app mobile ou integrações externas.

Possíveis tecnologias:

- FastAPI;
- Flask.

## Fase 6 — Interface web ou aplicativo

Criar uma interface para empresa e colaborador.

Possíveis telas:

- login;
- painel da empresa;
- painel do colaborador;
- cadastro de funcionário;
- calendário de escala;
- relatórios;
- alertas.

## Fase 7 — Integrações externas

Adicionar integrações com sistemas corporativos, relógios de ponto ou APIs internas.

---

## 10. Visão de longo prazo

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

Essa evolução torna o projeto relevante tanto como ferramenta prática quanto como demonstração de aprendizado profissional em desenvolvimento de sistemas.

---

## 11. Conclusão

O **Simulador de Escala de Trabalho** representa o primeiro passo de uma ideia maior: criar uma solução que ajude empresas e colaboradores a lidarem melhor com escalas, turnos, folgas e jornadas.

A versão atual tem foco na lógica principal do problema. As próximas versões podem transformar essa base em um sistema mais completo, com cadastro de empresas, funcionários, relatórios, calendário e integração com ponto eletrônico.

Mais do que um exercício de programação, este projeto tem potencial para se tornar uma aplicação real voltada para organização operacional, produtividade e melhoria da comunicação entre empresa e colaborador.