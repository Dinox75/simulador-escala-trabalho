# Protótipo de widget Android nativo

Projeto separado da PWA. Não há APK, assinatura, Play Store nem sincronização
publicados. O app usa Java, Android SDK 35, minSdk 26 e Gradle/AGP 8.7.3.
Abra `android-widget/` no Android Studio com JDK 17, Android SDK 35 e Gradle
8.9. Execute `:app:assembleDebug` e `:app:testDebugUnitTest`; instale o APK
de desenvolvimento em um aparelho ou emulador. Não há wrapper Gradle
versionado; use o Gradle configurado pelo Android Studio. A propriedade
`android.overridePathCheck` permite tentar o build na pasta atual do Windows,
que contém caracteres acentuados; se alguma ferramenta do SDK falhar por isso,
copie apenas `android-widget/` para um caminho ASCII temporário e compile lá.
Em pastas sincronizadas pelo OneDrive, resultados de teste podem ficar
temporariamente bloqueados; a cópia temporária evita também esse problema.

Uma PWA instalada pelo navegador não fornece AppWidget nativo. Um invólucro
WebView/TWA acrescentaria uma camada Android, mas não daria ao widget acesso
automático ao `localStorage` do Chrome. Por isso, o protótipo usa
`AppWidgetProvider` e importação explícita pelo seletor de arquivos do
Android, sem servidor ou permissão de rede.

## Teste com uma escala

1. Na PWA, salve uma escala fictícia e abra **Dados locais → Baixar JSON v1 para widget**. O backup v2 da PWA preserva referências, mas o protótipo Android ainda importa somente o formato v1.
2. Abra o aplicativo Android, toque em **Escolher backup JSON** e selecione
   esse arquivo pelo seletor do sistema. O app aceita somente UTF-8/JSON
   versão 1, até 512 KB e 200 escalas, com tipos, campos e limites do backup
   web. Uma seleção inválida não substitui a configuração ativa.
3. Escolha uma escala e informe **Início do ciclo** no formato AAAA-MM-DD.
   Digite a mesma âncora usada na simulação da PWA: o campo começa vazio,
   pois a âncora não vem no backup v1 para widget. Para ciclos por horas, informe também
   HH:mm. Toque em **Conferir situação agora** e verifique status, posição no
   ciclo e próxima mudança. **Aplicar ao widget** só fica disponível após
   essa conferência; qualquer mudança de escala, data ou hora exige nova
   prévia. A seleção ativa só é substituída ao aplicar.
4. Na tela inicial do Android, adicione **Escalas · widget** em tamanho
   compacto ou expandido. Ambos mostram a situação no horário atual do
   aparelho, a posição no ciclo e a próxima mudança calculada. Ciclos por
   dias mostram, por exemplo, **Dia 4 de 9**; por horas mostram a fase e a
   hora dentro dela; turnos rotativos mostram a posição na sequência. Toque
   para reconfigurar.

O arquivo escolhido é lido uma vez; o app não recebe atualizações automáticas
das escalas do navegador. Ele não tem permissão de internet nem acesso ao
`localStorage` do Chrome. Somente a escala escolhida e sua âncora são
guardadas em arquivo privado com substituição atômica em
`getNoBackupFilesDir()`. O Android pode copiar outros dados do app em
transferências entre aparelhos conforme o fabricante; o estado do widget
fica deliberadamente fora do diretório de backup normal.

## Regra de cálculo e atualização

`ScheduleEngine` espelha `docs/demo/calendar-core.js`: dias e turnos
usam diferença de datas locais e módulo positivo; horas usam componentes de
relógio local, inclusive antes da âncora. 12x36 com início às 18:00 muda de
trabalho para folga às 06:00 do dia seguinte. O widget mostra **o instante
atual**, não um status para o dia inteiro. A próxima mudança por dias/turnos
ocorre à meia-noite local; por horas, no limite do ciclo.

O sistema oferece atualização periódica de 30 minutos. O app agenda também
um alarme **inexato** para a próxima transição e recalcula após reinício,
mudança de hora/fuso, abertura do app e importação. Android pode atrasar
atualizações em Doze, economia de bateria ou restrições do fabricante;
portanto, o horário exibido deve ser conferido ao abrir. Sem mudança na
sequência rotativa, a tela informa isso.

## Verificação pendente antes de distribuir

- Repetir `app:assembleDebug` e `app:testDebugUnitTest` em outra instalação
  do Android Studio e testar o APK em um dispositivo.
- Emular Android 8 e versões recentes; conferir widget compacto e expandido,
  importação válida/inválida, reinício, fuso, relógio manual e Doze.
- Comparar estados com `calendar-core.js` para âncoras distintas e
  transições de 12x36. O teste Java e o smoke do Chrome leem as mesmas
  11 entradas de `app/src/test/resources/parity-cases.tsv`; ampliar esse
  arquivo sempre que a regra web mudar.
- Revisar acessibilidade, ícone de lançamento, assinatura, política e
  formulário Data safety antes de qualquer distribuição. Não tratar este
  protótipo como pronto para a Play Store.
