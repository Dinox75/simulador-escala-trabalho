const STORAGE_KEY = "simulador_escalas_favoritas_v051";
const STORAGE_KEY_V050 = "simulador_escalas_favoritas_v050";
const STORAGE_KEY_V040 = "simulador_escalas_favoritas_v040";
const STORAGE_KEY_V030 = "simulador_escalas_favoritas_v030";
const THEME_KEY = "simulador_tema_v051";

const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";

const NOMES_TIPOS = {
  [TIPO_CICLO_DIAS]: "Ciclo por dias",
  [TIPO_CICLO_HORAS]: "Ciclo por horas",
  [TIPO_TURNO_ROTATIVO]: "Turno rotativo"
};

const escalasPadrao = [
  { nome: "Escala padrão 6x3", tipo: TIPO_CICLO_DIAS, dias_trabalho: 6, dias_folga: 3 },
  { nome: "Escala administrativa 5x2", tipo: TIPO_CICLO_DIAS, dias_trabalho: 5, dias_folga: 2 },
  { nome: "Escala alternada 4x4", tipo: TIPO_CICLO_DIAS, dias_trabalho: 4, dias_folga: 4 },
  { nome: "Escala 12x36", tipo: TIPO_CICLO_HORAS, horas_trabalho: 12, horas_folga: 36 }
];

let indiceEdicao = null;
let tipoResultadoAtual = TIPO_CICLO_DIAS;
let scrollPendente = false;

const $ = (seletor) => document.querySelector(seletor);

const elementos = {
  body: document.body,
  progressoScroll: $("#progresso-scroll"),
  botaoMenu: $("#botao-menu"),
  menuPrincipal: $("#menu-principal"),
  botaoTema: $("#botao-tema"),
  botoesTipo: document.querySelectorAll(".type-option"),
  formEscala: $("#form-escala"),
  tipoEscala: $("#tipo-escala"),
  inputDataInicial: $("#data-inicial"),
  inputTempoTrabalho: $("#tempo-trabalho"),
  inputTempoFolga: $("#tempo-folga"),
  inputQuantidadeItens: $("#quantidade-itens"),
  labelDataInicial: $("#label-data-inicial"),
  labelTempoTrabalho: $("#label-tempo-trabalho"),
  labelTempoFolga: $("#label-tempo-folga"),
  labelQuantidadeItens: $("#label-quantidade-itens"),
  descricaoSimulador: $("#descricao-simulador"),
  botaoGerar: $("#botao-gerar"),
  escalaAtualTexto: $("#escala-atual-texto"),
  tipoAtualTexto: $("#tipo-atual-texto"),
  totalEscalas: $("#total-escalas"),
  totalItensSimulados: $("#total-itens-simulados"),
  listaEscalas: $("#lista-escalas"),
  botaoExportarJson: $("#botao-exportar-json"),
  botaoLimparDemo: $("#botao-limpar-demo"),
  formNovaEscala: $("#form-nova-escala"),
  tituloFormEscala: $("#titulo-form-escala"),
  descricaoFormEscala: $("#descricao-form-escala"),
  inputNomeEscala: $("#nome-escala"),
  inputTipoNovaEscala: $("#tipo-nova-escala"),
  inputNovoTempoTrabalho: $("#novo-tempo-trabalho"),
  inputNovoTempoFolga: $("#novo-tempo-folga"),
  labelNovoTempoTrabalho: $("#label-novo-tempo-trabalho"),
  labelNovoTempoFolga: $("#label-novo-tempo-folga"),
  botaoSalvarEscala: $("#botao-salvar-escala"),
  botaoCancelarEdicao: $("#botao-cancelar-edicao"),
  mensagem: $("#mensagem"),
  kickerResultado: $("#kicker-resultado"),
  tituloResultado: $("#titulo-resultado"),
  descricaoResultado: $("#descricao-resultado"),
  timeline: $("#timeline"),
  calendarios: $("#calendarios"),
  toastArea: $("#toast-area")
};

function obterNomeTipo(tipo) { return NOMES_TIPOS[tipo] || NOMES_TIPOS[TIPO_CICLO_DIAS]; }
function normalizarTexto(texto) { return String(texto || "").toLowerCase().trim(); }
function escaparHTML(texto) {
  return String(texto).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function normalizarEscala(escala) {
  const tipoValido = Object.keys(NOMES_TIPOS).includes(escala.tipo);
  const tipo = tipoValido ? escala.tipo : TIPO_CICLO_DIAS;
  if (tipo === TIPO_CICLO_HORAS) {
    return {
      nome: escala.nome || "Escala sem nome",
      tipo,
      horas_trabalho: Number(escala.horas_trabalho) || Number(escala.dias_trabalho) || 12,
      horas_folga: Number(escala.horas_folga) || Number(escala.dias_folga) || 36
    };
  }
  return {
    nome: escala.nome || "Escala sem nome",
    tipo: TIPO_CICLO_DIAS,
    dias_trabalho: Number(escala.dias_trabalho) || 1,
    dias_folga: Number(escala.dias_folga) || 1
  };
}
function normalizarListaEscalas(escalas) { return Array.isArray(escalas) ? escalas.map(normalizarEscala) : [...escalasPadrao]; }

function carregarEscalas() {
  const chaves = [STORAGE_KEY, STORAGE_KEY_V050, STORAGE_KEY_V040, STORAGE_KEY_V030];
  for (const chave of chaves) {
    const dados = localStorage.getItem(chave);
    if (!dados) continue;
    try {
      const escalas = normalizarListaEscalas(JSON.parse(dados));
      if (!escalas.some((escala) => escala.tipo === TIPO_CICLO_HORAS)) escalas.push(escalasPadrao[3]);
      salvarEscalas(escalas);
      return escalas;
    } catch {
      localStorage.removeItem(chave);
    }
  }
  salvarEscalas(escalasPadrao);
  return [...escalasPadrao];
}
function salvarEscalas(escalas) { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizarListaEscalas(escalas))); }

function obterValoresEscala(escala) {
  if (escala.tipo === TIPO_CICLO_HORAS) return { trabalho: escala.horas_trabalho, folga: escala.horas_folga, unidade: "horas" };
  return { trabalho: escala.dias_trabalho, folga: escala.dias_folga, unidade: "dias" };
}
function formatarResumoEscala(escala) { const v = obterValoresEscala(escala); return `${v.trabalho}x${v.folga} ${v.unidade}`; }

function selecionarTipoEscala(tipo) {
  if (tipo === TIPO_TURNO_ROTATIVO) {
    mostrarMensagem("Turno rotativo está planejado para uma versão futura.", "warning");
    return;
  }
  elementos.tipoEscala.value = tipo;
  elementos.botoesTipo.forEach((botao) => botao.classList.toggle("active", botao.dataset.tipo === tipo));
  atualizarCamposSimulador();
  gerarVisualizacao();
}

function obterDadosFormularioEscala() {
  const tipo = elementos.inputTipoNovaEscala.value || TIPO_CICLO_DIAS;
  const nome = elementos.inputNomeEscala.value.trim();
  const trabalho = Number(elementos.inputNovoTempoTrabalho.value);
  const folga = Number(elementos.inputNovoTempoFolga.value);
  if (tipo === TIPO_CICLO_HORAS) return { nome, tipo, horas_trabalho: trabalho, horas_folga: folga };
  return { nome, tipo, dias_trabalho: trabalho, dias_folga: folga };
}
function validarDadosEscala(escala) {
  const valores = obterValoresEscala(escala);
  if (!escala.nome) { mostrarMensagem("O nome da escala não pode ficar vazio.", "error"); return false; }
  if (!Number.isFinite(valores.trabalho) || !Number.isFinite(valores.folga)) { mostrarMensagem("Informe números válidos para trabalho e folga.", "error"); return false; }
  if (valores.trabalho <= 0 || valores.folga <= 0) { mostrarMensagem("Os valores de trabalho e folga precisam ser maiores que zero.", "error"); return false; }
  return true;
}
function existeNomeDuplicado(escalas, nome, indiceIgnorado = null) {
  return escalas.some((escala, indice) => indice !== indiceIgnorado && normalizarTexto(escala.nome) === normalizarTexto(nome));
}
function existeConfiguracaoDuplicada(escalas, novaEscala, indiceIgnorado = null) {
  return escalas.some((escala, indice) => {
    if (indice === indiceIgnorado || escala.tipo !== novaEscala.tipo) return false;
    if (novaEscala.tipo === TIPO_CICLO_HORAS) return escala.horas_trabalho === novaEscala.horas_trabalho && escala.horas_folga === novaEscala.horas_folga;
    return escala.dias_trabalho === novaEscala.dias_trabalho && escala.dias_folga === novaEscala.dias_folga;
  });
}

function atualizarCamposSimulador() {
  const tipo = elementos.tipoEscala.value;
  if (tipo === TIPO_CICLO_HORAS) {
    elementos.labelDataInicial.textContent = "Data e hora inicial da escala";
    elementos.inputDataInicial.type = "datetime-local";
    if (!elementos.inputDataInicial.value.includes("T")) elementos.inputDataInicial.value = `${obterDataHoje()}T06:00`;
    elementos.labelTempoTrabalho.textContent = "Horas trabalhadas";
    elementos.labelTempoFolga.textContent = "Horas de folga";
    elementos.labelQuantidadeItens.textContent = "Quantidade de períodos para visualizar";
    elementos.descricaoSimulador.textContent = "Informe a data e hora inicial, as horas de trabalho, as horas de folga e a quantidade de períodos.";
    elementos.botaoGerar.textContent = "Gerar períodos";
    if (elementos.inputTempoTrabalho.value === "6") elementos.inputTempoTrabalho.value = 12;
    if (elementos.inputTempoFolga.value === "3") elementos.inputTempoFolga.value = 36;
    elementos.inputQuantidadeItens.max = 80;
    if (Number(elementos.inputQuantidadeItens.value) > 80) elementos.inputQuantidadeItens.value = 12;
  } else {
    elementos.labelDataInicial.textContent = "Data inicial da escala";
    elementos.inputDataInicial.type = "date";
    elementos.inputDataInicial.value = obterDataSemHora(elementos.inputDataInicial.value);
    elementos.labelTempoTrabalho.textContent = "Dias trabalhados";
    elementos.labelTempoFolga.textContent = "Dias de folga";
    elementos.labelQuantidadeItens.textContent = "Quantidade de dias para visualizar";
    elementos.descricaoSimulador.textContent = "Informe a data inicial, os dias de trabalho, os dias de folga e o período desejado.";
    elementos.botaoGerar.textContent = "Gerar calendário";
    if (elementos.inputTempoTrabalho.value === "12") elementos.inputTempoTrabalho.value = 6;
    if (elementos.inputTempoFolga.value === "36") elementos.inputTempoFolga.value = 3;
    elementos.inputQuantidadeItens.max = 180;
  }
  atualizarResumo();
}
function atualizarCamposCadastro() {
  const tipo = elementos.inputTipoNovaEscala.value;
  if (tipo === TIPO_CICLO_HORAS) {
    elementos.labelNovoTempoTrabalho.textContent = "Horas trabalhadas";
    elementos.labelNovoTempoFolga.textContent = "Horas de folga";
    if (!elementos.inputNovoTempoTrabalho.value) elementos.inputNovoTempoTrabalho.value = 12;
    if (!elementos.inputNovoTempoFolga.value) elementos.inputNovoTempoFolga.value = 36;
    elementos.inputNomeEscala.placeholder = "Ex: Escala 12x36";
  } else {
    elementos.labelNovoTempoTrabalho.textContent = "Dias trabalhados";
    elementos.labelNovoTempoFolga.textContent = "Dias de folga";
    if (!elementos.inputNovoTempoTrabalho.value) elementos.inputNovoTempoTrabalho.value = 6;
    if (!elementos.inputNovoTempoFolga.value) elementos.inputNovoTempoFolga.value = 3;
    elementos.inputNomeEscala.placeholder = "Ex: Turno B 6x3";
  }
}
function atualizarResumo() {
  const tipo = elementos.tipoEscala.value || TIPO_CICLO_DIAS;
  const trabalho = Number(elementos.inputTempoTrabalho.value) || 0;
  const folga = Number(elementos.inputTempoFolga.value) || 0;
  const quantidadeItens = Number(elementos.inputQuantidadeItens.value) || 0;
  elementos.escalaAtualTexto.textContent = `${trabalho}x${folga}${tipo === TIPO_CICLO_HORAS ? "h" : ""}`;
  elementos.tipoAtualTexto.textContent = obterNomeTipo(tipo);
  elementos.totalItensSimulados.textContent = quantidadeItens;
  elementos.totalEscalas.textContent = carregarEscalas().length;
}
function mostrarMensagem(texto, tipo = "") {
  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `message ${tipo}`;
  if (texto) mostrarToast(texto, tipo);
  setTimeout(() => { elementos.mensagem.textContent = ""; elementos.mensagem.className = "message"; }, 3800);
}
function mostrarToast(texto, tipo = "") {
  const toast = document.createElement("div");
  toast.className = `toast ${tipo}`;
  toast.textContent = texto;
  elementos.toastArea.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}
function aplicarTema(tema) {
  elementos.body.dataset.theme = tema;
  localStorage.setItem(THEME_KEY, tema);
  elementos.botaoTema.textContent = tema === "light" ? "☀️ Tema claro" : "🌙 Tema escuro";
}
function alternarTema() { aplicarTema(elementos.body.dataset.theme === "dark" ? "light" : "dark"); }
function carregarTemaSalvo() { aplicarTema(localStorage.getItem(THEME_KEY) || "dark"); }

function renderizarEscalas() {
  const escalas = carregarEscalas();
  elementos.listaEscalas.innerHTML = "";
  elementos.totalEscalas.textContent = escalas.length;
  if (escalas.length === 0) { elementos.listaEscalas.innerHTML = `<p class="empty-state">Nenhuma escala salva no momento.</p>`; return; }
  escalas.forEach((escala, indice) => {
    const card = document.createElement("article");
    card.className = "saved-card";
    card.innerHTML = `<h4>${indice + 1} - ${escaparHTML(escala.nome)}</h4><p>${formatarResumoEscala(escala)}</p><span class="type-badge">${obterNomeTipo(escala.tipo)}</span><div class="saved-actions"><button type="button" data-indice="${indice}" class="use-scale">Usar</button><button type="button" data-indice="${indice}" class="edit-scale">Editar</button><button type="button" data-indice="${indice}" class="delete-scale">Excluir</button></div>`;
    elementos.listaEscalas.appendChild(card);
  });
  document.querySelectorAll(".use-scale").forEach((b) => b.addEventListener("click", () => aplicarEscala(Number(b.dataset.indice))));
  document.querySelectorAll(".edit-scale").forEach((b) => b.addEventListener("click", () => prepararEdicaoEscala(Number(b.dataset.indice))));
  document.querySelectorAll(".delete-scale").forEach((b) => b.addEventListener("click", () => excluirEscala(Number(b.dataset.indice))));
}
function aplicarEscala(indice) {
  const escala = carregarEscalas()[indice];
  if (!escala) { mostrarMensagem("Escala não encontrada.", "error"); return; }
  const valores = obterValoresEscala(escala);
  selecionarTipoEscala(escala.tipo);
  elementos.inputTempoTrabalho.value = valores.trabalho;
  elementos.inputTempoFolga.value = valores.folga;
  atualizarResumo(); gerarVisualizacao();
  mostrarMensagem(`Escala "${escala.nome}" aplicada com sucesso.`, "success");
}
function salvarFormularioEscala(evento) { evento.preventDefault(); indiceEdicao === null ? cadastrarEscala() : salvarEdicaoEscala(); }
function cadastrarEscala() {
  const novaEscala = obterDadosFormularioEscala();
  if (!validarDadosEscala(novaEscala)) return;
  const escalas = carregarEscalas();
  if (existeNomeDuplicado(escalas, novaEscala.nome)) { mostrarMensagem(`A escala "${novaEscala.nome}" já existe.`, "error"); return; }
  if (existeConfiguracaoDuplicada(escalas, novaEscala)) { mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error"); return; }
  escalas.push(novaEscala); salvarEscalas(escalas); limparFormularioEscala(); renderizarEscalas(); atualizarResumo(); mostrarMensagem("Escala cadastrada com sucesso.", "success");
}
function prepararEdicaoEscala(indice) {
  const escala = carregarEscalas()[indice];
  if (!escala) { mostrarMensagem("Escala não encontrada para edição.", "error"); return; }
  const valores = obterValoresEscala(escala);
  indiceEdicao = indice;
  elementos.inputNomeEscala.value = escala.nome;
  elementos.inputTipoNovaEscala.value = escala.tipo;
  atualizarCamposCadastro();
  elementos.inputNovoTempoTrabalho.value = valores.trabalho;
  elementos.inputNovoTempoFolga.value = valores.folga;
  elementos.tituloFormEscala.textContent = "Editar escala";
  elementos.descricaoFormEscala.textContent = "Altere os dados da escala selecionada e salve a atualização.";
  elementos.botaoSalvarEscala.textContent = "Salvar alteração";
  elementos.botaoCancelarEdicao.classList.remove("hidden");
  elementos.inputNomeEscala.focus();
  mostrarMensagem(`Editando a escala "${escala.nome}".`, "warning");
}
function salvarEdicaoEscala() {
  const escalas = carregarEscalas();
  const escalaAtual = escalas[indiceEdicao];
  if (!escalaAtual) { mostrarMensagem("Escala não encontrada para salvar edição.", "error"); limparFormularioEscala(); return; }
  const escalaEditada = obterDadosFormularioEscala();
  if (!validarDadosEscala(escalaEditada)) return;
  if (existeNomeDuplicado(escalas, escalaEditada.nome, indiceEdicao)) { mostrarMensagem(`A escala "${escalaEditada.nome}" já existe.`, "error"); return; }
  if (existeConfiguracaoDuplicada(escalas, escalaEditada, indiceEdicao)) { mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error"); return; }
  if (!confirm(`Deseja salvar as alterações da escala "${escalaAtual.nome}"?`)) { mostrarMensagem("Edição cancelada.", "warning"); return; }
  escalas[indiceEdicao] = escalaEditada; salvarEscalas(escalas); limparFormularioEscala(); renderizarEscalas(); atualizarResumo(); mostrarMensagem("Escala editada com sucesso.", "success");
}
function excluirEscala(indice) {
  const escalas = carregarEscalas(); const escala = escalas[indice];
  if (!escala) { mostrarMensagem("Escala não encontrada para exclusão.", "error"); return; }
  if (!confirm(`Tem certeza que deseja excluir a escala "${escala.nome}"?`)) { mostrarMensagem("Exclusão cancelada.", "warning"); return; }
  escalas.splice(indice, 1); salvarEscalas(escalas); if (indiceEdicao === indice) limparFormularioEscala(); renderizarEscalas(); atualizarResumo(); mostrarMensagem(`Escala "${escala.nome}" excluída com sucesso.`, "success");
}
function limparFormularioEscala() {
  indiceEdicao = null; elementos.formNovaEscala.reset(); elementos.inputTipoNovaEscala.value = TIPO_CICLO_DIAS;
  elementos.tituloFormEscala.textContent = "Nova escala"; elementos.descricaoFormEscala.textContent = "Cadastre uma configuração para reutilizar depois.";
  elementos.botaoSalvarEscala.textContent = "Cadastrar escala"; elementos.botaoCancelarEdicao.classList.add("hidden"); atualizarCamposCadastro();
}
function cancelarEdicao() { limparFormularioEscala(); mostrarMensagem("Edição cancelada.", "warning"); }

function gerarVisualizacao(evento) {
  if (evento) evento.preventDefault();
  atualizarResumo();
  const tipo = elementos.tipoEscala.value;
  const trabalho = Number(elementos.inputTempoTrabalho.value);
  const folga = Number(elementos.inputTempoFolga.value);
  const quantidade = Number(elementos.inputQuantidadeItens.value);
  if (!Number.isFinite(trabalho) || !Number.isFinite(folga) || !Number.isFinite(quantidade) || trabalho <= 0 || folga <= 0 || quantidade <= 0) {
    elementos.calendarios.innerHTML = `<p class="empty-state">Preencha todos os campos com valores maiores que zero.</p>`;
    elementos.timeline.innerHTML = ""; return;
  }
  tipo === TIPO_CICLO_HORAS ? gerarVisualizacaoPorHoras(trabalho, folga, quantidade) : gerarVisualizacaoPorDias(trabalho, folga, quantidade);
}
function gerarVisualizacaoPorDias(diasTrabalho, diasFolga, quantidadeDias) {
  const dataInicial = elementos.inputDataInicial.value; tipoResultadoAtual = TIPO_CICLO_DIAS;
  elementos.kickerResultado.textContent = "Calendário"; elementos.tituloResultado.textContent = "Dias de trabalho e folga"; elementos.descricaoResultado.textContent = "Visualização organizada por mês, com todos os dias da semana visíveis.";
  if (!dataInicial) { elementos.calendarios.innerHTML = `<p class="empty-state">Informe uma data inicial para gerar o calendário.</p>`; elementos.timeline.innerHTML = ""; return; }
  if (quantidadeDias > 180) { elementos.calendarios.innerHTML = `<p class="empty-state">Para manter a demo leve, visualize no máximo 180 dias.</p>`; elementos.timeline.innerHTML = ""; return; }
  const dias = gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias); renderizarTimeline(dias); renderizarCalendariosPorMes(dias);
}
function gerarVisualizacaoPorHoras(horasTrabalho, horasFolga, quantidadePeriodos) {
  const dataHoraInicial = elementos.inputDataInicial.value; tipoResultadoAtual = TIPO_CICLO_HORAS;
  elementos.kickerResultado.textContent = "Períodos"; elementos.tituloResultado.textContent = "Períodos de trabalho e folga"; elementos.descricaoResultado.textContent = "Visualização em blocos com início e fim, ideal para escalas como 12x36.";
  if (!dataHoraInicial) { elementos.calendarios.innerHTML = `<p class="empty-state">Informe uma data e hora inicial para gerar os períodos.</p>`; elementos.timeline.innerHTML = ""; return; }
  if (quantidadePeriodos > 80) { elementos.calendarios.innerHTML = `<p class="empty-state">Para manter a demo leve, visualize no máximo 80 períodos.</p>`; elementos.timeline.innerHTML = ""; return; }
  const periodos = gerarPeriodosDaEscala(dataHoraInicial, horasTrabalho, horasFolga, quantidadePeriodos); renderizarTimeline(periodos); renderizarPeriodos(periodos);
}
function gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias) {
  const dias = []; const ciclo = diasTrabalho + diasFolga;
  for (let i = 0; i < quantidadeDias; i++) {
    const data = new Date(`${dataInicial}T00:00:00`); data.setDate(data.getDate() + i);
    const trabalha = i % ciclo < diasTrabalho;
    dias.push({ data, dia: data.getDate(), mes: data.getMonth(), ano: data.getFullYear(), status: trabalha ? "Trabalhando" : "Folga", classe: trabalha ? "work" : "rest", icone: trabalha ? "🟢" : "🌙" });
  }
  return dias;
}
function gerarPeriodosDaEscala(dataHoraInicial, horasTrabalho, horasFolga, quantidadePeriodos) {
  const periodos = []; let inicio = new Date(dataHoraInicial);
  for (let i = 0; i < quantidadePeriodos; i++) {
    const trabalha = i % 2 === 0; const duracao = trabalha ? horasTrabalho : horasFolga; const fim = new Date(inicio.getTime() + duracao * 60 * 60 * 1000);
    periodos.push({ inicio: new Date(inicio), fim, status: trabalha ? "Trabalhando" : "Folga", classe: trabalha ? "work" : "rest", icone: trabalha ? "🟢" : "🌙" }); inicio = fim;
  }
  return periodos;
}
function renderizarTimeline(itens) {
  elementos.timeline.innerHTML = "";
  itens.slice(0, Math.min(itens.length, 60)).forEach((item) => {
    const ponto = document.createElement("span"); ponto.className = `timeline-dot ${item.classe}`;
    ponto.title = tipoResultadoAtual === TIPO_CICLO_HORAS ? `${formatarDataHora(item.inicio)} até ${formatarDataHora(item.fim)} - ${item.status}` : `${formatarData(item.data)} - ${item.status}`;
    elementos.timeline.appendChild(ponto);
  });
}
function renderizarCalendariosPorMes(dias) {
  elementos.calendarios.className = "calendars"; elementos.calendarios.innerHTML = "";
  const meses = agruparDiasPorMes(dias);
  Object.keys(meses).forEach((chave) => {
    const diasMes = meses[chave]; const primeiro = diasMes[0].data; const card = document.createElement("article"); card.className = "month-card";
    const titulo = primeiro.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    card.innerHTML = `<div class="month-title"><h4>${titulo}</h4></div><div class="weekdays"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div><div class="days-grid"></div>`;
    const grid = card.querySelector(".days-grid");
    const primeiroDiaSemana = new Date(primeiro.getFullYear(), primeiro.getMonth(), 1).getDay();
    for (let v = 0; v < primeiroDiaSemana; v++) { const empty = document.createElement("div"); empty.className = "day-cell empty"; grid.appendChild(empty); }
    diasMes.forEach((dia) => { const cell = document.createElement("div"); cell.className = `day-cell ${dia.classe}`; cell.title = `${formatarData(dia.data)} - ${dia.status}`; cell.innerHTML = `<span class="day-number">${dia.dia}</span><span class="day-status">${dia.icone} ${dia.status}</span>`; grid.appendChild(cell); });
    elementos.calendarios.appendChild(card);
  });
}
function renderizarPeriodos(periodos) {
  elementos.calendarios.className = "periods-grid"; elementos.calendarios.innerHTML = "";
  periodos.forEach((periodo, indice) => { const card = document.createElement("article"); card.className = `period-card ${periodo.classe}`; card.innerHTML = `<h4>${indice + 1}º período • ${periodo.icone} ${periodo.status}</h4><p><strong>Início:</strong> ${formatarDataHora(periodo.inicio)}</p><p><strong>Fim:</strong> ${formatarDataHora(periodo.fim)}</p><p><strong>Duração:</strong> ${calcularDuracaoHoras(periodo.inicio, periodo.fim)} horas</p>`; elementos.calendarios.appendChild(card); });
}
function agruparDiasPorMes(dias) { return dias.reduce((meses, d) => { const chave = `${d.ano}-${String(d.mes + 1).padStart(2, "0")}`; if (!meses[chave]) meses[chave] = []; meses[chave].push(d); return meses; }, {}); }
function calcularDuracaoHoras(inicio, fim) { return Math.round((fim - inicio) / (60 * 60 * 1000)); }
function formatarData(data) { return data.toLocaleDateString("pt-BR"); }
function formatarDataHora(data) { return data.toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }); }
function obterDataHoje() { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`; }
function obterDataSemHora(valor) { return valor ? valor.split("T")[0] || obterDataHoje() : obterDataHoje(); }
function definirDataInicialPadrao() { elementos.inputDataInicial.value = obterDataHoje(); }
function exportarJson() { const blob = new Blob([JSON.stringify(carregarEscalas(), null, 4)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = "escalas-demo-v051.json"; link.click(); URL.revokeObjectURL(url); mostrarMensagem("JSON exportado com sucesso.", "success"); }
function resetarDemo() { if (!confirm("Deseja resetar a demo e restaurar as escalas padrão?")) { mostrarMensagem("Reset cancelado.", "warning"); return; } [STORAGE_KEY, STORAGE_KEY_V050, STORAGE_KEY_V040, STORAGE_KEY_V030].forEach((k) => localStorage.removeItem(k)); salvarEscalas(escalasPadrao); limparFormularioEscala(); renderizarEscalas(); atualizarCamposSimulador(); atualizarResumo(); gerarVisualizacao(); mostrarMensagem("Demo resetada para os dados padrão.", "success"); }
function configurarTabsDocumentacao() { document.querySelectorAll(".doc-tab").forEach((tab) => tab.addEventListener("click", () => { const target = tab.dataset.target; document.querySelectorAll(".doc-tab").forEach((i) => i.classList.remove("active")); document.querySelectorAll(".doc-panel").forEach((p) => p.classList.remove("active")); tab.classList.add("active"); document.getElementById(target).classList.add("active"); })); }
function configurarAnimacoesDeEntrada() { const itens = document.querySelectorAll(".reveal"); if (!("IntersectionObserver" in window)) { itens.forEach((i) => i.classList.add("visible")); return; } const observer = new IntersectionObserver((entradas) => { entradas.forEach((entrada) => { if (entrada.isIntersecting) { entrada.target.classList.add("visible"); observer.unobserve(entrada.target); } }); }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }); itens.forEach((i) => observer.observe(i)); }
function atualizarProgressoScroll() { if (scrollPendente) return; scrollPendente = true; requestAnimationFrame(() => { const total = document.documentElement.scrollHeight - window.innerHeight; const progresso = total > 0 ? (window.scrollY / total) * 100 : 0; elementos.progressoScroll.style.width = `${progresso}%`; scrollPendente = false; }); }
function configurarMenuMobile() { elementos.botaoMenu.addEventListener("click", () => { const aberto = elementos.menuPrincipal.classList.toggle("open"); elementos.botaoMenu.setAttribute("aria-expanded", String(aberto)); }); elementos.menuPrincipal.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => { elementos.menuPrincipal.classList.remove("open"); elementos.botaoMenu.setAttribute("aria-expanded", "false"); })); }
function configurarEventosTipoEscala() { elementos.botoesTipo.forEach((botao) => botao.addEventListener("click", () => selecionarTipoEscala(botao.dataset.tipo))); }
function configurarEventos() {
  elementos.formEscala.addEventListener("submit", gerarVisualizacao);
  elementos.formNovaEscala.addEventListener("submit", salvarFormularioEscala);
  elementos.botaoCancelarEdicao.addEventListener("click", cancelarEdicao);
  elementos.botaoTema.addEventListener("click", alternarTema);
  elementos.botaoExportarJson.addEventListener("click", exportarJson);
  elementos.botaoLimparDemo.addEventListener("click", resetarDemo);
  configurarEventosTipoEscala();
  elementos.inputTipoNovaEscala.addEventListener("change", atualizarCamposCadastro);
  elementos.inputTempoTrabalho.addEventListener("input", gerarVisualizacao);
  elementos.inputTempoFolga.addEventListener("input", gerarVisualizacao);
  elementos.inputQuantidadeItens.addEventListener("input", gerarVisualizacao);
  elementos.inputDataInicial.addEventListener("change", gerarVisualizacao);
  window.addEventListener("scroll", atualizarProgressoScroll, { passive: true });
}
function inicializarDemo() { carregarTemaSalvo(); definirDataInicialPadrao(); configurarEventos(); configurarTabsDocumentacao(); configurarAnimacoesDeEntrada(); configurarMenuMobile(); renderizarEscalas(); atualizarCamposSimulador(); atualizarCamposCadastro(); atualizarResumo(); gerarVisualizacao(); atualizarProgressoScroll(); }
inicializarDemo();
