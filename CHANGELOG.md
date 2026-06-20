## [0.6.1] - Refinamento do turno rotativo

### Adicionado

* Adicionada normalização automática dos nomes dos turnos.
* Adicionada validação para bloquear turnos inválidos em escalas rotativas.
* Adicionada montagem de sequência de turno rotativo por blocos.
* Adicionada prévia da sequência antes de aplicar ou salvar uma escala rotativa.
* Adicionada exibição do total de dias do ciclo da sequência rotativa.

### Melhorado

* Entrada de turnos agora aceita variações como `manha`, `MANHA`, `manhã`, `tarde`, `noite` e `folga`, convertendo automaticamente para nomes padronizados.
* Fluxo de criação de turno rotativo ficou mais guiado e menos dependente de digitação manual longa.
* Mensagens de erro ficaram mais claras quando a sequência está vazia ou contém turnos inválidos.
* O usuário agora pode montar ciclos maiores com menos risco de erro, usando blocos como `Tarde x3`, `Noite x3` e `Folga x3`.

### Corrigido

* Evitado salvamento de escalas rotativas com nomes de turnos fora do padrão permitido.
* Reduzido o risco de inconsistência no arquivo JSON causada por turnos digitados com maiúsculas, espaços extras ou ausência de acento.

### Testes

* Adicionados testes para normalização de turnos.
* Adicionados testes para validação de turnos inválidos.
* Mantidos os testes de cálculo, geração, cadastro e edição de escalas rotativas.

### Observação

Esta versão não altera a regra principal de cálculo do turno rotativo. O foco da `v0.6.1` é refinar a experiência de cadastro, melhorar a segurança da entrada de dados e preparar a base para ciclos rotativos mais complexos nas próximas versões.


## [0.6.0] - Suporte inicial a turno rotativo

### Adicionado
- Suporte funcional ao tipo de escala `turno_rotativo`.
- Cálculo de status por sequência de turnos.
- Geração de próximos dias para escalas com turnos rotativos.
- Cadastro de escalas de turno rotativo no CLI.
- Edição de escalas de turno rotativo no CLI.
- Aplicação de escalas rotativas salvas como escala atual.
- Validação para impedir sequência de turnos vazia.
- Testes automatizados para cálculo, geração, cadastro e edição de turno rotativo.

### Alterado
- Menu principal agora permite usar escalas por dias, por horas e por turno rotativo.
- Fluxo de cadastro e edição foi expandido para suportar sequência de turnos.
- Exibição da escala atual agora mostra a sequência do turno rotativo.

### Mantido
- Compatibilidade com escalas por dias.
- Compatibilidade com escalas por horas.
- Suporte à escala 12x36.
- Persistência em JSON.
- Testes automatizados com `pytest`.

### Observação
Esta versão entrega a primeira implementação funcional do turno rotativo. Melhorias de interface, refatoração e recursos avançados podem ser evoluídos em versões futuras.

## [0.5.0] - Escalas por horas e suporte inicial ao 12x36

### Adicionado
- Suporte ao tipo de escala `ciclo_horas`.
- Cálculo real de status para escalas por horas.
- Suporte inicial à escala 12x36.
- Geração de próximos períodos para escalas por horas.
- Cadastro, listagem, aplicação, edição e exclusão de escalas por horas no CLI.
- Leitura de data e hora no formato `dd/mm/aaaa hh:mm`.
- Novos testes para cálculo, períodos e armazenamento de escalas por horas.

### Alterado
- Menu do CLI adaptado para trabalhar com escalas por dias e por horas.
- Exibição de escalas salvas agora mostra o tipo da escala.
- Fluxo principal do CLI preparado para múltiplos tipos de escala.

### Mantido
- Compatibilidade com escalas antigas por dias.
- Migração automática de escalas antigas sem campo `tipo`.

## [v0.4.0] - Preparação para múltiplos tipos de escala

### Adicionado
- Adicionado campo `tipo` nas escalas salvas.
- Criado suporte inicial para tipos de escala:
  - `ciclo_dias`
  - `ciclo_horas`
  - `turno_rotativo`
- Criado módulo `tipos_escala.py`.
- Adicionada validação de tipos de escala suportados.
- Adicionados nomes amigáveis para os tipos de escala.
- Criado motor inicial de cálculo por tipo de escala.
- Criadas funções para cálculo e geração de próximos dias usando uma escala completa.

### Alterado
- A `main.py` passou a trabalhar com `escala_atual` como dicionário.
- A exibição de escalas salvas passou a mostrar o tipo da escala.
- O carregamento de escalas antigas agora normaliza automaticamente o campo `tipo`.
- O sistema agora migra escalas antigas sem `tipo` no arquivo JSON.

### Testes
- Reorganizados testes por responsabilidade.
- Criado arquivo de testes para tipos de escala.
- Adicionados testes para migração de escalas antigas.
- Adicionados testes para validação de tipos.
- Adicionados testes para o motor de cálculo por tipo.

### Observação
Esta versão prepara a base para futuras escalas avançadas, como `12x36`, ciclos por hora e turnos rotativos.

## [v0.3.0] - CRUD completo de escalas salvas

### Adicionado
- Opção para editar escalas salvas.
- Opção para excluir escalas salvas.
- Confirmação antes de editar uma escala.
- Confirmação antes de excluir uma escala.
- Função `editar_escala()` no módulo de armazenamento.
- Função `remover_escala()` no módulo de armazenamento.
- Função `confirmar_acao()` para centralizar confirmações do usuário.

### Melhorado
- Menu principal atualizado com novas opções.
- Fluxo de edição mais claro, exibindo os dados atuais antes da alteração.
- Separação de responsabilidades entre menu, validações e armazenamento.

### Testes
- Testes para remoção de escalas.
- Testes para edição de escalas.
- Validação de índice inválido.
- Validação de nome duplicado.
- Validação de configuração duplicada.

## [v0.2.0] - Escalas favoritas com persistência em JSON

### Adicionado

- Pasta `data/` para armazenar dados do projeto.
- Arquivo `data/escalas.json` para salvar escalas favoritas.
- Módulo `armazenamento.py` para carregar e salvar escalas em JSON.
- Função para listar escalas salvas.
- Opção no menu para visualizar escalas cadastradas.
- Opção para aplicar uma escala salva como escala atual.
- Opção para cadastrar novas escalas pelo terminal.
- Validação para impedir cadastro de escalas com nome duplicado.
- Validação para impedir cadastro de escalas com mesma configuração de dias trabalhados e dias de folga.
- Testes automatizados para leitura, salvamento e cadastro de escalas.

### Melhorado

- O projeto deixou de depender apenas de valores fixos no código.
- A escala atual agora pode ser alterada usando configurações previamente salvas.
- A estrutura do projeto ficou mais próxima de um sistema real com persistência de dados.

### Testado

- Carregamento de escalas salvas.
- Salvamento de escalas em JSON.
- Cadastro de nova escala.
- Bloqueio de nome duplicado.
- Bloqueio de configuração duplicada.