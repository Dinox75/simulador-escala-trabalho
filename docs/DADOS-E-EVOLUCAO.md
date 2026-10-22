# Dados, privacidade e próximos passos

Estado examinado em 22/10/2026. Esta nota técnica complementa a [Política de
Privacidade pública](demo/privacidade.html) e os [Termos de Uso](demo/termos.html).

## Fluxos atuais

| Superfície | Entrada e persistência | Saída e exclusão |
| --- | --- | --- |
| Demo pública no GitHub Pages | O usuário digita nomes, ciclos, turnos, datas e horários. As **configurações salvas** ficam em `localStorage` sob `simulador_escala_demo_v014_local`; chaves antigas v0.13/v0.09 são lidas para preservar cadastros. O tema tem chave própria. Datas/horas de consulta ficam no estado da página. | Simulador, comparador, relatório, CSV/XLSX/PDF gerados localmente. Exclusão individual em Minhas escalas ou remoção dos dados do site no navegador. |
| PWA offline | Service worker guarda somente o pacote estático de HTML, CSS, JS, ícones, manifesto e Lucide. | Limpar os dados do site remove também cache e escalas locais; atualizar o pacote não apaga `localStorage`. |
| Backup web | `backup-core.js` valida JSON versão 1, até 512 KB e 200 escalas, com limites por tipo. O download é iniciado pelo usuário. A importação exige prévia e confirmação antes de substituir as escalas locais. | O arquivo fica onde o navegador o salvar. A exportação **não contém âncoras de data/hora**, dados da API nem o tema. |
| API local e terminal | FastAPI só para uso local controlado; JSON é o repository padrão, PostgreSQL opcional por configuração. Sem autenticação nem isolamento por usuário. | Dados separados do navegador. A origem pública não consulta a API. Não expor escrita compartilhada na internet. |
| Widget Android experimental | Seleção manual de arquivo de backup via seletor do sistema, validação e escolha de uma escala. O usuário informa data/hora de início. Apenas a seleção ativa vai para arquivo privado no diretório `noBackupFilesDir`. | Compacto e expandido mostram status e próxima mudança. Pode remover a seleção no app ou desinstalá-lo. Não lê o Chrome, não usa rede e não sincroniza. |
| Hospedagem e contato | GitHub Pages recebe solicitações e [registra IP de visitantes para segurança](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages). Contato por e-mail processado pelo provedor de e-mail usado por cada parte. | O projeto não tem analytics próprio, anúncio, conta, push nem coleta de localização. Consultar a [declaração do GitHub](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) para o tratamento da hospedagem. |

Nomes de escalas podem conter dados pessoais se a própria pessoa os inserir.
Orientar participantes a usar nomes fictícios. Arquivos de backup e planilhas
exportados podem sair do dispositivo por decisão de quem os compartilha.

## Próxima evolução, sem servidor nesta etapa

| Etapa | Dependências e principal risco | Complexidade relativa |
| --- | --- | --- |
| Testar PWA/widget | Aparelhos pessoais, importação explícita, comparação dos mesmos casos de cálculo, fuso, relógio manual e economia de bateria. O widget não é instalável a partir do GitHub Pages. | Média |
| Contas e sincronização | Backend com identidade, autenticação e autorização por usuário, isolamento dos registros, criptografia em trânsito, retenção, backup/restauração, exportação/exclusão, logs sem parâmetros de escala e resposta a incidentes. A API atual não pode receber escrita pública como está. | Alta |
| Avisos direcionados e push | Dependem de contas/dispositivos vinculados, infraestrutura de entrega, opt-in, gestão de tokens, horários e consentimento, revisão de privacidade e bateria. | Alta |
| Distribuição Android | Build assinado e reproduzível, testes em aparelhos reais, acessibilidade, política pública dentro do app, Data safety coerente com o APK, revisão das permissões e regras vigentes da Play. | Média/alta |

Atualizar a PWA pelo GitHub Pages e pelo service worker distribui **código e
recursos estáticos**, não sincroniza os dados locais. O widget é atualizado
pelo Android usando somente a escala que a pessoa transferiu. Nenhuma etapa
acima implica contratação de hospedagem ou implementação de notificações agora.

### Checklist antes de uma possível publicação na Play Store

- Hospedar política de privacidade pública, ativa, em URL não PDF; vinculá-la
  no app e no cadastro da loja, com contato e descrição fiel das práticas.
- Revisar o APK final, permissões, bibliotecas/SDKs e qualquer fluxo de dados
  fora do dispositivo antes de responder ao formulário **Segurança dos dados**;
  não reutilizar automaticamente a declaração desta PWA.
- Testar exclusão, backup, validade do texto em português, acessibilidade,
  atualizações e diferenças entre versões do Android; completar assinatura,
  testes de instalação e exigências atuais da conta de desenvolvedor.

Fontes para requisitos futuros: [política de privacidade do Google Play](https://support.google.com/googleplay/android-developer/answer/10144311),
[Data safety](https://support.google.com/googleplay/android-developer/answer/10787469),
[atualização de widgets](https://developer.android.com/develop/ui/views/appwidgets/advanced)
e [alarmes inexatos no Android](https://developer.android.com/develop/background-work/services/alarms).
