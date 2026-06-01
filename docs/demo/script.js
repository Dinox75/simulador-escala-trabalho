const STORAGE_KEY = "simulador_escalas_favoritas_v060";
const STORAGE_KEY_V051 = "simulador_escalas_favoritas_v051";
const STORAGE_KEY_V050 = "simulador_escalas_favoritas_v050";
const STORAGE_KEY_V040 = "simulador_escalas_favoritas_v040";
const STORAGE_KEY_V030 = "simulador_escalas_favoritas_v030";
const THEME_KEY = "simulador_tema_v060";

const TIPO_CICLO_DIAS = "ciclo_dias";
const TIPO_CICLO_HORAS = "ciclo_horas";
const TIPO_TURNO_ROTATIVO = "turno_rotativo";

const NOMES_TIPOS = {
  [TIPO_CICLO_DIAS]: "Ciclo por dias",
  [TIPO_CICLO_HORAS]: "Ciclo por horas",
  [TIPO_TURNO_ROTATIVO]: "Turno rotativo"
};

const escalasPadrao = [
  {
    nome: "Escala padrão 6x3",
    tipo: TIPO_CICLO_DIAS,
    dias_trabalho: 6,
    dias_folga: 3
  },
  {
    nome: "Escala administrativa 5x2",
    tipo: TIPO_CICLO_DIAS,
    dias_trabalho: 5,
    dias_folga: 2
  },
  {
    nome: "Escala 12x36",
    tipo: TIPO_CICLO_HORAS,
    horas_trabalho: 12,
    horas_folga: 36
  },
  {
    nome: "Turno rotativo exemplo",
    tipo: TIPO_TURNO_ROTATIVO,
    sequencia_turnos: ["Manhã", "Manhã", "Tarde", "Tarde", "Noite", "Noite", "Folga", "Folga"]
  }
];

let escalas = [];
let indiceEdicao = null;
let tipoResultadoAtual = TIPO_CICLO_DIAS;
let scrollPendente = false;

const $ = (seletor) => document.querySelector(seletor);
const $$ = (seletor) => document.querySelectorAll(seletor);

const elementos = {
  body: document.body,
  progressoScroll: $("#progresso-scroll"),
  botaoMenu: $("#botao-menu"),
  menuPrincipal: $("#menu-principal"),
  botaoTema: $("#botao-tema"),
  botoesTipo: $$(".type-option"),
  formEscala: $("#form-escala"),
  tipoEscala: $("#tipo-escala"),
  inputDataInicial: $("#data-inicial"),
  inputTempoTrabalho: $("#tempo-trabalho"),
  inputTempoFolga: $("#tempo-folga"),
  inputSequenciaTurnos: $("#sequencia-turnos"),
  inputQuantidadeItens: $("#quantidade-itens"),
  campoTempoTrabalho: $("#campo-tempo-trabalho"),
  campoTempoFolga: $("#campo-tempo-folga"),
  campoSequenciaTurnos: $("#campo-sequencia-turnos"),
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
  inputNovaSequenciaTurnos: $("#nova-sequencia-turnos"),
  campoNovoTempoTrabalho: $("#campo-novo-tempo-trabalho"),
  campoNovoTempoFolga: $("#campo-novo-tempo-folga"),
  campoNovaSequenciaTurnos: $("#campo-nova-sequencia-turnos"),
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

function obterNomeTipo(tipo) {
  return NOMES_TIPOS[tipo] || NOMES_TIPOS[TIPO_CICLO_DIAS];
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizarTexto(texto) {
  return String(texto || "").toLowerCase().trim();
}

function normalizarSequenciaTurnos(valor) {
  if (Array.isArray(valor)) {
    return valor
      .map((turno) => String(turno).trim())
      .filter(Boolean);
  }

  return String(valor || "")
    .split(/[,;>\n]/)
    .map((turno) => turno.trim())
    .filter(Boolean);
}

function formatarSequenciaTurnos(sequencia) {
  const turnos = normalizarSequenciaTurnos(sequencia);
  return turnos.length ? turnos.join(" → ") : "Sequência não definida";
}

function normalizarEscala(escala) {
  const tipo = Object.keys(NOMES_TIPOS).includes(escala?.tipo)
    ? escala.tipo
    : TIPO_CICLO_DIAS;

  if (tipo === TIPO_CICLO_HORAS) {
    return {
      nome: escala.nome || "Escala sem nome",
      tipo,
      horas_trabalho: Number(escala.horas_trabalho) || Number(escala.dias_trabalho) || 12,
      horas_folga: Number(escala.horas_folga) || Number(escala.dias_folga) || 36
    };
  }

  if (tipo === TIPO_TURNO_ROTATIVO) {
    const sequencia = normalizarSequenciaTurnos(
      escala.sequencia_turnos || escala.sequencia || escala.turnos
    );

    return {
      nome: escala.nome || "Escala sem nome",
      tipo,
      sequencia_turnos: sequencia.length ? sequencia : ["Manhã", "Tarde", "Noite", "Folga"]
    };
  }

  return {
    nome: escala.nome || "Escala sem nome",
    tipo: TIPO_CICLO_DIAS,
    dias_trabalho: Number(escala.dias_trabalho) || 1,
    dias_folga: Number(escala.dias_folga) || 1
  };
}

function normalizarListaEscalas(lista) {
  return Array.isArray(lista) ? lista.map(normalizarEscala) : [...escalasPadrao];
}

function carregarEscalas() {
  const chaves = [STORAGE_KEY, STORAGE_KEY_V051, STORAGE_KEY_V050, STORAGE_KEY_V040, STORAGE_KEY_V030];

  for (const chave of chaves) {
    const dados = localStorage.getItem(chave);

    if (!dados) {
      continue;
    }

    try {
      const lista = normalizarListaEscalas(JSON.parse(dados));
      salvarEscalas(lista);
      return lista;
    } catch (erro) {
      localStorage.removeItem(chave);
    }
  }

  salvarEscalas(escalasPadrao);
  return normalizarListaEscalas(escalasPadrao);
}

function salvarEscalas(lista) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizarListaEscalas(lista)));
}

function obterResumoEscala(escala) {
  if (escala.tipo === TIPO_CICLO_HORAS) {
    return `${escala.horas_trabalho}x${escala.horas_folga} horas`;
  }

  if (escala.tipo === TIPO_TURNO_ROTATIVO) {
    return formatarSequenciaTurnos(escala.sequencia_turnos);
  }

  return `${escala.dias_trabalho}x${escala.dias_folga} dias`;
}

function obterClasseStatus(status) {
  const texto = normalizarTexto(status);

  if (texto.includes("folga")) {
    return "status-folga";
  }

  if (texto.includes("noite")) {
    return "status-noite";
  }

  if (texto.includes("tarde")) {
    return "status-tarde";
  }

  return "status-trabalho";
}

function exibirMensagem(texto, tipo = "info") {
  if (!elementos.mensagem) {
    return;
  }

  elementos.mensagem.textContent = texto;
  elementos.mensagem.className = `message ${tipo}`;
}

function exibirToast(texto) {
  if (!elementos.toastArea) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = texto;
  elementos.toastArea.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function atualizarCamposSimulador(tipo) {
  const ciclo = tipo === TIPO_CICLO_DIAS;
  const horas = tipo === TIPO_CICLO_HORAS;
  const rotativo = tipo === TIPO_TURNO_ROTATIVO;

  elementos.tipoEscala.value = tipo;
  elementos.inputDataInicial.type = horas ? "datetime-local" : "date";
  elementos.labelDataInicial.textContent = horas ? "Data e hora inicial" : "Data inicial da escala";
  elementos.labelQuantidadeItens.textContent = horas ? "Quantidade de períodos" : "Quantidade de dias";

  elementos.campoTempoTrabalho.hidden = rotativo;
  elementos.campoTempoFolga.hidden = rotativo;
  elementos.campoSequenciaTurnos.hidden = !rotativo;

  elementos.inputTempoTrabalho.required = !rotativo;
  elementos.inputTempoFolga.required = !rotativo;
  elementos.inputSequenciaTurnos.required = rotativo;

  if (ciclo) {
    elementos.labelTempoTrabalho.textContent = "Dias trabalhados";
    elementos.labelTempoFolga.textContent = "Dias de folga";
    elementos.inputTempoTrabalho.value = elementos.inputTempoTrabalho.value || 6;
    elementos.inputTempoFolga.value = elementos.inputTempoFolga.value || 3;
    elementos.escalaAtualTexto.textContent = `${elementos.inputTempoTrabalho.value}x${elementos.inputTempoFolga.value} dias`;
    elementos.descricaoSimulador.textContent = "Use ciclos como 6x3, 5x2 ou 4x4 para prever trabalho e folga.";
  }

  if (horas) {
    elementos.labelTempoTrabalho.textContent = "Horas trabalhadas";
    elementos.labelTempoFolga.textContent = "Horas de folga";
    elementos.inputTempoTrabalho.value = 12;
    elementos.inputTempoFolga.value = 36;
    elementos.escalaAtualTexto.textContent = "12x36 horas";
    elementos.descricaoSimulador.textContent = "Use data e hora inicial para simular escalas como 12x36.";
  }

  if (rotativo) {
    elementos.escalaAtualTexto.textContent = "Turno rotativo";
    elementos.descricaoSimulador.textContent = "Informe uma sequência, como Manhã, Tarde, Noite e Folga.";
  }

  elementos.tipoAtualTexto.textContent = obterNomeTipo(tipo);

  elementos.botoesTipo.forEach((botao) => {
    botao.classList.toggle("active", botao.dataset.tipo === tipo);
  });
}

function atualizarCamposCadastro() {
  const tipo = elementos.inputTipoNovaEscala.value;
  const rotativo = tipo === TIPO_TURNO_ROTATIVO;
  const horas = tipo === TIPO_CICLO_HORAS;

  elementos.campoNovoTempoTrabalho.hidden = rotativo;
  elementos.campoNovoTempoFolga.hidden = rotativo;
  elementos.campoNovaSequenciaTurnos.hidden = !rotativo;

  elementos.inputNovoTempoTrabalho.required = !rotativo;
  elementos.inputNovoTempoFolga.required = !rotativo;
  elementos.inputNovaSequenciaTurnos.required = rotativo;

  if (horas) {
    elementos.labelNovoTempoTrabalho.textContent = "Horas trabalhadas";
    elementos.labelNovoTempoFolga.textContent = "Horas de folga";
    elementos.inputNovoTempoTrabalho.value = 12;
    elementos.inputNovoTempoFolga.value = 36;
    return;
  }

  elementos.labelNovoTempoTrabalho.textContent = "Dias trabalhados";
  elementos.labelNovoTempoFolga.textContent = "Dias de folga";

  if (!rotativo) {
    elementos.inputNovoTempoTrabalho.value = elementos.inputNovoTempoTrabalho.value || 6;
    elementos.inputNovoTempoFolga.value = elementos.inputNovoTempoFolga.value || 3;
  }
}

function existeNomeDuplicado(nome, indiceIgnorado = null) {
  const nomeNormalizado = normalizarTexto(nome);

  return escalas.some((escala, indice) => {
    return indice !== indiceIgnorado && normalizarTexto(escala.nome) === nomeNormalizado;
  });
}

function obterChaveConfiguracao(escala) {
  const item = normalizarEscala(escala);

  if (item.tipo === TIPO_CICLO_HORAS) {
    return `${item.tipo}:${item.horas_trabalho}:${item.horas_folga}`;
  }

  if (item.tipo === TIPO_TURNO_ROTATIVO) {
    return `${item.tipo}:${normalizarSequenciaTurnos(item.sequencia_turnos).join("|").toLowerCase()}`;
  }

  return `${item.tipo}:${item.dias_trabalho}:${item.dias_folga}`;
}

function existeConfiguracaoDuplicada(novaEscala, indiceIgnorado = null) {
  const chave = obterChaveConfiguracao(novaEscala);

  return escalas.some((escala, indice) => {
    return indice !== indiceIgnorado && obterChaveConfiguracao(escala) === chave;
  });
}

function renderizarEscalas() {
  elementos.totalEscalas.textContent = String(escalas.length);

  if (!elementos.listaEscalas) {
    return;
  }

  if (!escalas.length) {
    elementos.listaEscalas.innerHTML = `<p class="muted">Nenhuma escala salva.</p>`;
    return;
  }

  elementos.listaEscalas.innerHTML = escalas
    .map((escala, indice) => {
      const resumo = obterResumoEscala(escala);
      const tipo = obterNomeTipo(escala.tipo);

      return `
        <article class="saved-card">
          <div>
            <strong>${escaparHTML(escala.nome)}</strong>
            <span>${escaparHTML(tipo)} • ${escaparHTML(resumo)}</span>
          </div>
          <div class="saved-actions">
            <button class="ghost-button use-scale" type="button" data-indice="${indice}">Usar</button>
            <button class="ghost-button edit-scale" type="button" data-indice="${indice}">Editar</button>
            <button class="danger-button delete-scale" type="button" data-indice="${indice}">Excluir</button>
          </div>
        </article>
      `;
    })
    .join("");

  $$(".use-scale").forEach((botao) => {
    botao.addEventListener("click", () => aplicarEscala(Number(botao.dataset.indice)));
  });

  $$(".edit-scale").forEach((botao) => {
    botao.addEventListener("click", () => prepararEdicaoEscala(Number(botao.dataset.indice)));
  });

  $$(".delete-scale").forEach((botao) => {
    botao.addEventListener("click", () => excluirEscala(Number(botao.dataset.indice)));
  });
}

function aplicarEscala(indice) {
  const escala = escalas[indice];

  if (!escala) {
    return;
  }

  atualizarCamposSimulador(escala.tipo);

  if (escala.tipo === TIPO_CICLO_HORAS) {
    elementos.inputTempoTrabalho.value = escala.horas_trabalho;
    elementos.inputTempoFolga.value = escala.horas_folga;
    elementos.escalaAtualTexto.textContent = obterResumoEscala(escala);
  } else if (escala.tipo === TIPO_TURNO_ROTATIVO) {
    elementos.inputSequenciaTurnos.value = escala.sequencia_turnos.join(", ");
    elementos.escalaAtualTexto.textContent = escala.nome;
  } else {
    elementos.inputTempoTrabalho.value = escala.dias_trabalho;
    elementos.inputTempoFolga.value = escala.dias_folga;
    elementos.escalaAtualTexto.textContent = obterResumoEscala(escala);
  }

  elementos.tipoAtualTexto.textContent = obterNomeTipo(escala.tipo);
  exibirToast(`Escala "${escala.nome}" aplicada.`);
}

function obterDadosNovaEscala() {
  const tipo = elementos.inputTipoNovaEscala.value;
  const nome = elementos.inputNomeEscala.value.trim();

  if (tipo === TIPO_CICLO_HORAS) {
    return {
      nome,
      tipo,
      horas_trabalho: Number(elementos.inputNovoTempoTrabalho.value),
      horas_folga: Number(elementos.inputNovoTempoFolga.value)
    };
  }

  if (tipo === TIPO_TURNO_ROTATIVO) {
    return {
      nome,
      tipo,
      sequencia_turnos: normalizarSequenciaTurnos(elementos.inputNovaSequenciaTurnos.value)
    };
  }

  return {
    nome,
    tipo: TIPO_CICLO_DIAS,
    dias_trabalho: Number(elementos.inputNovoTempoTrabalho.value),
    dias_folga: Number(elementos.inputNovoTempoFolga.value)
  };
}

function validarEscala(escala) {
  if (!escala.nome) {
    return "Digite um nome para a escala.";
  }

  if (escala.tipo === TIPO_TURNO_ROTATIVO) {
    if (!escala.sequencia_turnos.length) {
      return "Digite pelo menos um turno na sequência.";
    }

    return "";
  }

  const trabalho = escala.tipo === TIPO_CICLO_HORAS ? escala.horas_trabalho : escala.dias_trabalho;
  const folga = escala.tipo === TIPO_CICLO_HORAS ? escala.horas_folga : escala.dias_folga;

  if (!Number.isFinite(trabalho) || trabalho <= 0 || !Number.isFinite(folga) || folga <= 0) {
    return "Os valores de trabalho e folga precisam ser maiores que zero.";
  }

  return "";
}

function salvarFormularioEscala(evento) {
  evento.preventDefault();

  const novaEscala = normalizarEscala(obterDadosNovaEscala());
  const erro = validarEscala(novaEscala);

  if (erro) {
    exibirMensagem(erro, "erro");
    return;
  }

  if (existeNomeDuplicado(novaEscala.nome, indiceEdicao)) {
    exibirMensagem("Já existe uma escala com esse nome.", "erro");
    return;
  }

  if (existeConfiguracaoDuplicada(novaEscala, indiceEdicao)) {
    exibirMensagem("Já existe uma escala com essa mesma configuração.", "erro");
    return;
  }

  if (indiceEdicao === null) {
    escalas.push(novaEscala);
    exibirMensagem("Escala cadastrada com sucesso!", "sucesso");
  } else {
    escalas[indiceEdicao] = novaEscala;
    exibirMensagem("Escala editada com sucesso!", "sucesso");
  }

  salvarEscalas(escalas);
  renderizarEscalas();
  limparFormularioEscala();
}

function prepararEdicaoEscala(indice) {
  const escala = escalas[indice];

  if (!escala) {
    return;
  }

  indiceEdicao = indice;
  elementos.tituloFormEscala.textContent = "Editar escala";
  elementos.descricaoFormEscala.textContent = "Atualize os dados da escala selecionada.";
  elementos.botaoSalvarEscala.textContent = "Salvar alteração";
  elementos.botaoCancelarEdicao.hidden = false;
  elementos.inputNomeEscala.value = escala.nome;
  elementos.inputTipoNovaEscala.value = escala.tipo;
  atualizarCamposCadastro();

  if (escala.tipo === TIPO_CICLO_HORAS) {
    elementos.inputNovoTempoTrabalho.value = escala.horas_trabalho;
    elementos.inputNovoTempoFolga.value = escala.horas_folga;
  } else if (escala.tipo === TIPO_TURNO_ROTATIVO) {
    elementos.inputNovaSequenciaTurnos.value = escala.sequencia_turnos.join(", ");
  } else {
    elementos.inputNovoTempoTrabalho.value = escala.dias_trabalho;
    elementos.inputNovoTempoFolga.value = escala.dias_folga;
  }

  elementos.inputNomeEscala.focus();
}

function limparFormularioEscala() {
  indiceEdicao = null;
  elementos.formNovaEscala.reset();
  elementos.inputTipoNovaEscala.value = TIPO_CICLO_DIAS;
  elementos.inputNovoTempoTrabalho.value = 6;
  elementos.inputNovoTempoFolga.value = 3;
  elementos.inputNovaSequenciaTurnos.value = "Manhã, Tarde, Noite, Folga";
  elementos.tituloFormEscala.textContent = "Cadastrar nova escala";
  elementos.descricaoFormEscala.textContent = "Crie modelos para reaproveitar na simulação.";
  elementos.botaoSalvarEscala.textContent = "Salvar escala";
  elementos.botaoCancelarEdicao.hidden = true;
  atualizarCamposCadastro();
}

function excluirEscala(indice) {
  const escala = escalas[indice];

  if (!escala) {
    return;
  }

  const confirmado = window.confirm(`Excluir a escala "${escala.nome}"?`);

  if (!confirmado) {
    return;
  }

  escalas.splice(indice, 1);
  salvarEscalas(escalas);
  renderizarEscalas();
  exibirToast("Escala excluída.");
}

function calcularStatusCicloDias(dataInicio, dataConsulta, diasTrabalho, diasFolga) {
  const ciclo = diasTrabalho + diasFolga;
  const diasPassados = Math.floor((dataConsulta - dataInicio) / 86400000);
  const posicao = ((diasPassados % ciclo) + ciclo) % ciclo;
  return posicao < diasTrabalho ? "Trabalhando" : "Folga";
}

function calcularStatusTurnoRotativo(dataInicio, dataConsulta, sequenciaTurnos) {
  if (!sequenciaTurnos.length) {
    throw new Error("A sequência de turnos não pode estar vazia.");
  }

  const diasPassados = Math.floor((dataConsulta - dataInicio) / 86400000);
  const posicao = ((diasPassados % sequenciaTurnos.length) + sequenciaTurnos.length) % sequenciaTurnos.length;
  return sequenciaTurnos[posicao];
}

function gerarDias(dataInicio, quantidade, tipo, config) {
  const resultado = [];

  for (let indice = 0; indice < quantidade; indice += 1) {
    const data = new Date(dataInicio);
    data.setDate(dataInicio.getDate() + indice);

    let status = "Folga";

    if (tipo === TIPO_TURNO_ROTATIVO) {
      status = calcularStatusTurnoRotativo(dataInicio, data, config.sequencia_turnos);
    } else {
      status = calcularStatusCicloDias(dataInicio, data, config.dias_trabalho, config.dias_folga);
    }

    resultado.push({ data, status });
  }

  return resultado;
}

function gerarPeriodosHoras(dataInicio, quantidade, horasTrabalho, horasFolga) {
  const periodos = [];
  let inicio = new Date(dataInicio);

  for (let indice = 0; indice < quantidade; indice += 1) {
    const trabalhando = indice % 2 === 0;
    const duracao = trabalhando ? horasTrabalho : horasFolga;
    const fim = new Date(inicio.getTime() + duracao * 60 * 60 * 1000);

    periodos.push({
      inicio: new Date(inicio),
      fim,
      status: trabalhando ? "Trabalhando" : "Folga"
    });

    inicio = fim;
  }

  return periodos;
}

function formatarData(data) {
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function formatarDataHora(data) {
  return data.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function obterDataDoInput(valor, tipo) {
  if (!valor) {
    return null;
  }

  if (tipo === TIPO_CICLO_HORAS) {
    return new Date(valor);
  }

  return new Date(`${valor}T00:00:00`);
}

function renderizarTimelineDias(dias) {
  elementos.timeline.innerHTML = dias
    .map((item) => {
      return `
        <article class="timeline-item ${obterClasseStatus(item.status)}">
          <strong>${formatarData(item.data)}</strong>
          <span>${escaparHTML(item.status)}</span>
        </article>
      `;
    })
    .join("");
}

function renderizarTimelinePeriodos(periodos) {
  elementos.timeline.innerHTML = periodos
    .map((periodo) => {
      return `
        <article class="timeline-item ${obterClasseStatus(periodo.status)}">
          <strong>${escaparHTML(periodo.status)}</strong>
          <span>${formatarDataHora(periodo.inicio)} até ${formatarDataHora(periodo.fim)}</span>
        </article>
      `;
    })
    .join("");
}

function agruparPorMes(dias) {
  return dias.reduce((grupos, item) => {
    const chave = `${item.data.getFullYear()}-${String(item.data.getMonth()).padStart(2, "0")}`;

    if (!grupos[chave]) {
      grupos[chave] = [];
    }

    grupos[chave].push(item);
    return grupos;
  }, {});
}

function renderizarCalendarioDias(dias) {
  const grupos = agruparPorMes(dias);
  const nomesSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  elementos.calendarios.innerHTML = Object.values(grupos)
    .map((itensMes) => {
      const primeiraData = itensMes[0].data;
      const ano = primeiraData.getFullYear();
      const mes = primeiraData.getMonth();
      const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
      const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
      const mapa = new Map(itensMes.map((item) => [item.data.getDate(), item.status]));
      const titulo = primeiraData.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
      });

      const vazios = Array.from({ length: primeiroDiaSemana }, (_, indice) => {
        return `<div class="day-cell empty" aria-hidden="true" data-empty="${indice}"></div>`;
      });

      const diasMes = Array.from({ length: ultimoDiaMes }, (_, indice) => {
        const dia = indice + 1;
        const status = mapa.get(dia);
        const classe = status ? obterClasseStatus(status) : "fora-periodo";
        const texto = status || "-";

        return `
          <div class="day-cell ${classe}">
            <strong>${dia}</strong>
            <span>${escaparHTML(texto)}</span>
          </div>
        `;
      });

      return `
        <article class="calendar-card">
          <h3>${escaparHTML(titulo)}</h3>
          <div class="week-row">
            ${nomesSemana.map((nome) => `<span>${nome}</span>`).join("")}
          </div>
          <div class="days-grid">
            ${vazios.join("")}
            ${diasMes.join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function gerarResultado(evento) {
  evento.preventDefault();

  const tipo = elementos.tipoEscala.value;
  const quantidade = Number(elementos.inputQuantidadeItens.value);
  const dataInicio = obterDataDoInput(elementos.inputDataInicial.value, tipo);

  if (!dataInicio || Number.isNaN(dataInicio.getTime())) {
    exibirToast("Informe uma data inicial válida.");
    return;
  }

  if (!Number.isFinite(quantidade) || quantidade <= 0) {
    exibirToast("Informe uma quantidade válida.");
    return;
  }

  tipoResultadoAtual = tipo;
  elementos.totalItensSimulados.textContent = String(quantidade);
  elementos.kickerResultado.textContent = obterNomeTipo(tipo);

  try {
    if (tipo === TIPO_CICLO_HORAS) {
      const horasTrabalho = Number(elementos.inputTempoTrabalho.value);
      const horasFolga = Number(elementos.inputTempoFolga.value);
      const periodos = gerarPeriodosHoras(dataInicio, quantidade, horasTrabalho, horasFolga);

      elementos.tituloResultado.textContent = `Próximos ${quantidade} períodos da escala ${horasTrabalho}x${horasFolga}.`;
      elementos.descricaoResultado.textContent = "A visualização abaixo mostra o início e o fim de cada período.";
      renderizarTimelinePeriodos(periodos);
      elementos.calendarios.innerHTML = "";
      return;
    }

    const config = tipo === TIPO_TURNO_ROTATIVO
      ? { sequencia_turnos: normalizarSequenciaTurnos(elementos.inputSequenciaTurnos.value) }
      : {
          dias_trabalho: Number(elementos.inputTempoTrabalho.value),
          dias_folga: Number(elementos.inputTempoFolga.value)
        };

    if (tipo === TIPO_TURNO_ROTATIVO && !config.sequencia_turnos.length) {
      throw new Error("Informe pelo menos um turno para simular.");
    }

    const dias = gerarDias(dataInicio, quantidade, tipo, config);
    elementos.tituloResultado.textContent = `Previsão dos próximos ${quantidade} dias.`;
    elementos.descricaoResultado.textContent = tipo === TIPO_TURNO_ROTATIVO
      ? `Sequência usada: ${formatarSequenciaTurnos(config.sequencia_turnos)}.`
      : "O calendário mostra trabalho e folga sem cortar sábado ou domingo.";

    renderizarTimelineDias(dias);
    renderizarCalendarioDias(dias);
  } catch (erro) {
    exibirToast(erro.message || "Não foi possível gerar a simulação.");
  }
}

function exportarJson() {
  const blob = new Blob([JSON.stringify(escalas, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "escalas-simulador.json";
  link.click();
  URL.revokeObjectURL(url);
}

function limparDemo() {
  const confirmado = window.confirm("Restaurar os dados padrão da demo?");

  if (!confirmado) {
    return;
  }

  escalas = normalizarListaEscalas(escalasPadrao);
  salvarEscalas(escalas);
  renderizarEscalas();
  exibirToast("Dados da demo restaurados.");
}

function configurarTema() {
  const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";
  elementos.body.dataset.theme = temaSalvo;
  atualizarBotaoTema();
}

function atualizarBotaoTema() {
  const temaAtual = elementos.body.dataset.theme || "dark";
  elementos.botaoTema.textContent = temaAtual === "dark" ? "🌙 Tema escuro" : "☀️ Tema claro";
}

function alternarTema() {
  const temaAtual = elementos.body.dataset.theme || "dark";
  const novoTema = temaAtual === "dark" ? "light" : "dark";
  elementos.body.dataset.theme = novoTema;
  localStorage.setItem(THEME_KEY, novoTema);
  atualizarBotaoTema();
}

function configurarTabs() {
  $$(".doc-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.target;

      $$(".doc-tab").forEach((item) => item.classList.remove("active"));
      $$(".doc-panel").forEach((painel) => painel.classList.remove("active"));

      tab.classList.add("active");
      const painel = document.getElementById(target);

      if (painel) {
        painel.classList.add("active");
      }
    });
  });
}

function configurarAnimacoesDeEntrada() {
  const itens = $$(".reveal");

  if (!("IntersectionObserver" in window)) {
    itens.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observer.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -40px 0px"
  });

  itens.forEach((item) => observer.observe(item));
}

function atualizarProgressoScroll() {
  if (scrollPendente || !elementos.progressoScroll) {
    return;
  }

  scrollPendente = true;

  window.requestAnimationFrame(() => {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    elementos.progressoScroll.style.width = `${progresso}%`;
    scrollPendente = false;
  });
}

function configurarMenuMobile() {
  elementos.botaoMenu.addEventListener("click", () => {
    const aberto = elementos.menuPrincipal.classList.toggle("open");
    elementos.botaoMenu.setAttribute("aria-expanded", String(aberto));
  });

  elementos.menuPrincipal.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      elementos.menuPrincipal.classList.remove("open");
      elementos.botaoMenu.setAttribute("aria-expanded", "false");
    });
  });
}

function configurarEventos() {
  elementos.botoesTipo.forEach((botao) => {
    botao.addEventListener("click", () => atualizarCamposSimulador(botao.dataset.tipo));
  });

  elementos.formEscala.addEventListener("submit", gerarResultado);
  elementos.formNovaEscala.addEventListener("submit", salvarFormularioEscala);
  elementos.inputTipoNovaEscala.addEventListener("change", atualizarCamposCadastro);
  elementos.botaoCancelarEdicao.addEventListener("click", limparFormularioEscala);
  elementos.botaoExportarJson.addEventListener("click", exportarJson);
  elementos.botaoLimparDemo.addEventListener("click", limparDemo);
  elementos.botaoTema.addEventListener("click", alternarTema);
  window.addEventListener("scroll", atualizarProgressoScroll, { passive: true });

  configurarMenuMobile();
  configurarTabs();
}

function definirDataInicialPadrao() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  elementos.inputDataInicial.value = `${ano}-${mes}-${dia}`;
}

function inicializar() {
  configurarTema();
  escalas = carregarEscalas();
  definirDataInicialPadrao();
  atualizarCamposSimulador(TIPO_CICLO_DIAS);
  atualizarCamposCadastro();
  renderizarEscalas();
  configurarEventos();
  configurarAnimacoesDeEntrada();
  atualizarProgressoScroll();
}

inicializar();
