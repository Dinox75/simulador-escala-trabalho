const STORAGE_KEY = "simulador_escalas_favoritas_v050";
const STORAGE_KEY_V040 = "simulador_escalas_favoritas_v040";
const STORAGE_KEY_V030 = "simulador_escalas_favoritas_v030";
const THEME_KEY = "simulador_tema_v050";

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
        nome: "Escala alternada 4x4",
        tipo: TIPO_CICLO_DIAS,
        dias_trabalho: 4,
        dias_folga: 4
    },
    {
        nome: "Escala 12x36",
        tipo: TIPO_CICLO_HORAS,
        horas_trabalho: 12,
        horas_folga: 36
    }
];

let indiceEdicao = null;
let ultimoResultadoGerado = [];
let tipoResultadoAtual = TIPO_CICLO_DIAS;

const $ = (seletor) => document.querySelector(seletor);

const elementos = {
    body: document.body,
    progressoScroll: $("#progresso-scroll"),

    botaoMenu: $("#botao-menu"),
    menuPrincipal: $("#menu-principal"),
    botaoTema: $("#botao-tema"),

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

    toastArea: $("#toast-area"),

    modalRelease: $("#modal-release"),
    fecharRelease: $("#fechar-release")
};

function obterNomeTipo(tipo) {
    return NOMES_TIPOS[tipo] || NOMES_TIPOS[TIPO_CICLO_DIAS];
}

function normalizarTexto(texto) {
    return String(texto || "").toLowerCase().trim();
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
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

function normalizarListaEscalas(escalas) {
    return escalas.map(normalizarEscala);
}

function carregarEscalas() {
    const dadosAtuais = localStorage.getItem(STORAGE_KEY);

    if (dadosAtuais) {
        try {
            const escalas = normalizarListaEscalas(JSON.parse(dadosAtuais));
            salvarEscalas(escalas);
            return escalas;
        } catch {
            salvarEscalas(escalasPadrao);
            return [...escalasPadrao];
        }
    }

    const dadosAntigos = localStorage.getItem(STORAGE_KEY_V040) || localStorage.getItem(STORAGE_KEY_V030);

    if (dadosAntigos) {
        try {
            const escalasMigradas = normalizarListaEscalas(JSON.parse(dadosAntigos));
            const possui12x36 = escalasMigradas.some((escala) => escala.tipo === TIPO_CICLO_HORAS);

            if (!possui12x36) {
                escalasMigradas.push(escalasPadrao[3]);
            }

            salvarEscalas(escalasMigradas);
            mostrarToast("Escalas antigas migradas para o formato v0.5.0.", "success");
            return escalasMigradas;
        } catch {
            salvarEscalas(escalasPadrao);
            return [...escalasPadrao];
        }
    }

    salvarEscalas(escalasPadrao);
    return [...escalasPadrao];
}

function salvarEscalas(escalas) {
    const escalasNormalizadas = normalizarListaEscalas(escalas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(escalasNormalizadas));
}

function obterValoresEscala(escala) {
    if (escala.tipo === TIPO_CICLO_HORAS) {
        return {
            trabalho: escala.horas_trabalho,
            folga: escala.horas_folga,
            unidade: "horas"
        };
    }

    return {
        trabalho: escala.dias_trabalho,
        folga: escala.dias_folga,
        unidade: "dias"
    };
}

function formatarResumoEscala(escala) {
    const valores = obterValoresEscala(escala);
    return `${valores.trabalho}x${valores.folga} ${valores.unidade}`;
}

function obterDadosFormularioEscala() {
    const tipo = elementos.inputTipoNovaEscala.value || TIPO_CICLO_DIAS;
    const nome = elementos.inputNomeEscala.value.trim();
    const trabalho = Number(elementos.inputNovoTempoTrabalho.value);
    const folga = Number(elementos.inputNovoTempoFolga.value);

    if (tipo === TIPO_CICLO_HORAS) {
        return {
            nome,
            tipo,
            horas_trabalho: trabalho,
            horas_folga: folga
        };
    }

    return {
        nome,
        tipo,
        dias_trabalho: trabalho,
        dias_folga: folga
    };
}

function validarDadosEscala(escala) {
    const valores = obterValoresEscala(escala);

    if (!escala.nome) {
        mostrarMensagem("O nome da escala não pode ficar vazio.", "error");
        return false;
    }

    if (!Number.isFinite(valores.trabalho) || !Number.isFinite(valores.folga)) {
        mostrarMensagem("Informe números válidos para trabalho e folga.", "error");
        return false;
    }

    if (valores.trabalho <= 0 || valores.folga <= 0) {
        mostrarMensagem("Os valores de trabalho e folga precisam ser maiores que zero.", "error");
        return false;
    }

    return true;
}

function existeNomeDuplicado(escalas, nome, indiceIgnorado = null) {
    return escalas.some((escala, indice) => {
        if (indice === indiceIgnorado) {
            return false;
        }

        return normalizarTexto(escala.nome) === normalizarTexto(nome);
    });
}

function existeConfiguracaoDuplicada(escalas, novaEscala, indiceIgnorado = null) {
    return escalas.some((escala, indice) => {
        if (indice === indiceIgnorado) {
            return false;
        }

        if (escala.tipo !== novaEscala.tipo) {
            return false;
        }

        if (novaEscala.tipo === TIPO_CICLO_HORAS) {
            return (
                escala.horas_trabalho === novaEscala.horas_trabalho &&
                escala.horas_folga === novaEscala.horas_folga
            );
        }

        return (
            escala.dias_trabalho === novaEscala.dias_trabalho &&
            escala.dias_folga === novaEscala.dias_folga
        );
    });
}

function atualizarCamposSimulador() {
    const tipo = elementos.tipoEscala.value;

    if (tipo === TIPO_CICLO_HORAS) {
        elementos.labelDataInicial.textContent = "Data e hora inicial da escala";
        elementos.inputDataInicial.type = "datetime-local";

        if (!elementos.inputDataInicial.value.includes("T")) {
            elementos.inputDataInicial.value = `${obterDataHoje()}T06:00`;
        }

        elementos.labelTempoTrabalho.textContent = "Horas trabalhadas";
        elementos.labelTempoFolga.textContent = "Horas de folga";
        elementos.labelQuantidadeItens.textContent = "Quantidade de períodos para visualizar";
        elementos.descricaoSimulador.textContent = "Informe a data e hora inicial, as horas de trabalho, as horas de folga e a quantidade de períodos.";
        elementos.botaoGerar.textContent = "Gerar períodos";

        if (elementos.inputTempoTrabalho.value === "6") {
            elementos.inputTempoTrabalho.value = 12;
        }

        if (elementos.inputTempoFolga.value === "3") {
            elementos.inputTempoFolga.value = 36;
        }

        elementos.inputQuantidadeItens.max = 80;

        if (Number(elementos.inputQuantidadeItens.value) > 80) {
            elementos.inputQuantidadeItens.value = 12;
        }
    } else {
        elementos.labelDataInicial.textContent = "Data inicial da escala";
        elementos.inputDataInicial.type = "date";
        elementos.inputDataInicial.value = obterDataSemHora(elementos.inputDataInicial.value);

        elementos.labelTempoTrabalho.textContent = "Dias trabalhados";
        elementos.labelTempoFolga.textContent = "Dias de folga";
        elementos.labelQuantidadeItens.textContent = "Quantidade de dias para visualizar";
        elementos.descricaoSimulador.textContent = "Informe a data inicial, os dias de trabalho, os dias de folga e o período desejado.";
        elementos.botaoGerar.textContent = "Gerar calendário";
        elementos.inputQuantidadeItens.max = 180;
    }

    atualizarResumo();
}

function atualizarCamposCadastro() {
    const tipo = elementos.inputTipoNovaEscala.value;

    if (tipo === TIPO_CICLO_HORAS) {
        elementos.labelNovoTempoTrabalho.textContent = "Horas trabalhadas";
        elementos.labelNovoTempoFolga.textContent = "Horas de folga";

        if (!elementos.inputNovoTempoTrabalho.value) {
            elementos.inputNovoTempoTrabalho.value = 12;
        }

        if (!elementos.inputNovoTempoFolga.value) {
            elementos.inputNovoTempoFolga.value = 36;
        }

        elementos.inputNomeEscala.placeholder = "Ex: Escala 12x36";
    } else {
        elementos.labelNovoTempoTrabalho.textContent = "Dias trabalhados";
        elementos.labelNovoTempoFolga.textContent = "Dias de folga";

        if (!elementos.inputNovoTempoTrabalho.value) {
            elementos.inputNovoTempoTrabalho.value = 6;
        }

        if (!elementos.inputNovoTempoFolga.value) {
            elementos.inputNovoTempoFolga.value = 3;
        }

        elementos.inputNomeEscala.placeholder = "Ex: Escala turno B 6x3";
    }
}

function atualizarResumo() {
    const tipo = elementos.tipoEscala.value || TIPO_CICLO_DIAS;
    const trabalho = Number(elementos.inputTempoTrabalho.value) || 0;
    const folga = Number(elementos.inputTempoFolga.value) || 0;
    const quantidadeItens = Number(elementos.inputQuantidadeItens.value) || 0;

    const unidade = tipo === TIPO_CICLO_HORAS ? "h" : "";
    elementos.escalaAtualTexto.textContent = `${trabalho}x${folga}${unidade}`;
    elementos.tipoAtualTexto.textContent = obterNomeTipo(tipo);
    elementos.totalItensSimulados.textContent = quantidadeItens;

    const escalas = carregarEscalas();
    elementos.totalEscalas.textContent = escalas.length;
}

function mostrarMensagem(texto, tipo = "") {
    elementos.mensagem.textContent = texto;
    elementos.mensagem.className = `message ${tipo}`;

    if (texto) {
        mostrarToast(texto, tipo);
    }

    setTimeout(() => {
        elementos.mensagem.textContent = "";
        elementos.mensagem.className = "message";
    }, 3800);
}

function mostrarToast(texto, tipo = "") {
    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.textContent = texto;

    elementos.toastArea.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 4200);
}

function aplicarTema(tema) {
    elementos.body.dataset.theme = tema;
    localStorage.setItem(THEME_KEY, tema);

    if (tema === "light") {
        elementos.botaoTema.textContent = "☀️ Tema claro";
    } else {
        elementos.botaoTema.textContent = "🌙 Tema escuro";
    }
}

function alternarTema() {
    const temaAtual = elementos.body.dataset.theme;
    const novoTema = temaAtual === "dark" ? "light" : "dark";
    aplicarTema(novoTema);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";
    aplicarTema(temaSalvo);
}

function renderizarEscalas() {
    const escalas = carregarEscalas();

    elementos.listaEscalas.innerHTML = "";
    elementos.totalEscalas.textContent = escalas.length;

    if (escalas.length === 0) {
        elementos.listaEscalas.innerHTML = `
            <p class="empty-state">Nenhuma escala salva no momento.</p>
        `;
        return;
    }

    escalas.forEach((escala, indice) => {
        const card = document.createElement("article");
        card.className = "saved-card";

        card.innerHTML = `
            <h4>${indice + 1} - ${escaparHTML(escala.nome)}</h4>
            <p>${formatarResumoEscala(escala)}</p>
            <span class="type-badge">${obterNomeTipo(escala.tipo)}</span>

            <div class="saved-actions">
                <button type="button" data-indice="${indice}" class="use-scale">Usar</button>
                <button type="button" data-indice="${indice}" class="edit-scale">Editar</button>
                <button type="button" data-indice="${indice}" class="delete-scale">Excluir</button>
            </div>
        `;

        elementos.listaEscalas.appendChild(card);
    });

    document.querySelectorAll(".use-scale").forEach((botao) => {
        botao.addEventListener("click", () => {
            aplicarEscala(Number(botao.dataset.indice));
        });
    });

    document.querySelectorAll(".edit-scale").forEach((botao) => {
        botao.addEventListener("click", () => {
            prepararEdicaoEscala(Number(botao.dataset.indice));
        });
    });

    document.querySelectorAll(".delete-scale").forEach((botao) => {
        botao.addEventListener("click", () => {
            excluirEscala(Number(botao.dataset.indice));
        });
    });
}

function aplicarEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada.", "error");
        return;
    }

    const valores = obterValoresEscala(escala);

    elementos.tipoEscala.value = escala.tipo;
    atualizarCamposSimulador();

    elementos.inputTempoTrabalho.value = valores.trabalho;
    elementos.inputTempoFolga.value = valores.folga;

    atualizarResumo();
    gerarVisualizacao();

    mostrarMensagem(`Escala "${escala.nome}" aplicada com sucesso.`, "success");
}

function salvarFormularioEscala(evento) {
    evento.preventDefault();

    if (indiceEdicao === null) {
        cadastrarEscala();
    } else {
        salvarEdicaoEscala();
    }
}

function cadastrarEscala() {
    const novaEscala = obterDadosFormularioEscala();

    if (!validarDadosEscala(novaEscala)) {
        return;
    }

    const escalas = carregarEscalas();

    if (existeNomeDuplicado(escalas, novaEscala.nome)) {
        mostrarMensagem(`A escala "${novaEscala.nome}" já existe.`, "error");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, novaEscala)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error");
        return;
    }

    escalas.push(novaEscala);
    salvarEscalas(escalas);

    limparFormularioEscala();
    renderizarEscalas();
    atualizarResumo();

    mostrarMensagem("Escala cadastrada com sucesso.", "success");
}

function prepararEdicaoEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada para edição.", "error");
        return;
    }

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

    if (!escalaAtual) {
        mostrarMensagem("Escala não encontrada para salvar edição.", "error");
        limparFormularioEscala();
        return;
    }

    const escalaEditada = obterDadosFormularioEscala();

    if (!validarDadosEscala(escalaEditada)) {
        return;
    }

    if (existeNomeDuplicado(escalas, escalaEditada.nome, indiceEdicao)) {
        mostrarMensagem(`A escala "${escalaEditada.nome}" já existe.`, "error");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, escalaEditada, indiceEdicao)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error");
        return;
    }

    const confirmarEdicao = confirm(`Deseja salvar as alterações da escala "${escalaAtual.nome}"?`);

    if (!confirmarEdicao) {
        mostrarMensagem("Edição cancelada.", "warning");
        return;
    }

    escalas[indiceEdicao] = escalaEditada;

    salvarEscalas(escalas);
    limparFormularioEscala();
    renderizarEscalas();
    atualizarResumo();

    mostrarMensagem("Escala editada com sucesso.", "success");
}

function excluirEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada para exclusão.", "error");
        return;
    }

    const confirmarExclusao = confirm(`Tem certeza que deseja excluir a escala "${escala.nome}"?`);

    if (!confirmarExclusao) {
        mostrarMensagem("Exclusão cancelada.", "warning");
        return;
    }

    escalas.splice(indice, 1);
    salvarEscalas(escalas);

    if (indiceEdicao === indice) {
        limparFormularioEscala();
    }

    renderizarEscalas();
    atualizarResumo();

    mostrarMensagem(`Escala "${escala.nome}" excluída com sucesso.`, "success");
}

function limparFormularioEscala() {
    indiceEdicao = null;

    elementos.formNovaEscala.reset();
    elementos.inputTipoNovaEscala.value = TIPO_CICLO_DIAS;

    elementos.tituloFormEscala.textContent = "Nova escala";
    elementos.descricaoFormEscala.textContent = "Cadastre uma configuração para reutilizar depois.";
    elementos.botaoSalvarEscala.textContent = "Cadastrar escala";
    elementos.botaoCancelarEdicao.classList.add("hidden");

    atualizarCamposCadastro();
}

function cancelarEdicao() {
    limparFormularioEscala();
    mostrarMensagem("Edição cancelada.", "warning");
}

function gerarVisualizacao(evento) {
    if (evento) {
        evento.preventDefault();
    }

    atualizarResumo();

    const tipo = elementos.tipoEscala.value;
    const trabalho = Number(elementos.inputTempoTrabalho.value);
    const folga = Number(elementos.inputTempoFolga.value);
    const quantidadeItens = Number(elementos.inputQuantidadeItens.value);

    if (!Number.isFinite(trabalho) || !Number.isFinite(folga) || !Number.isFinite(quantidadeItens) || trabalho <= 0 || folga <= 0 || quantidadeItens <= 0) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Preencha todos os campos com valores maiores que zero.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    if (tipo === TIPO_CICLO_HORAS) {
        gerarVisualizacaoPorHoras(trabalho, folga, quantidadeItens);
        return;
    }

    gerarVisualizacaoPorDias(trabalho, folga, quantidadeItens);
}

function gerarVisualizacaoPorDias(diasTrabalho, diasFolga, quantidadeDias) {
    const dataInicial = elementos.inputDataInicial.value;

    tipoResultadoAtual = TIPO_CICLO_DIAS;

    elementos.kickerResultado.textContent = "Calendário";
    elementos.tituloResultado.textContent = "Dias de trabalho e folga";
    elementos.descricaoResultado.textContent = "Visualização organizada por mês, com cada dia marcado conforme o ciclo informado.";

    if (!dataInicial) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Informe uma data inicial para gerar o calendário.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    if (quantidadeDias > 180) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Para manter a demo leve, visualize no máximo 180 dias.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    const diasGerados = gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias);
    ultimoResultadoGerado = diasGerados;

    renderizarTimeline(diasGerados);
    renderizarCalendariosPorMes(diasGerados);
}

function gerarVisualizacaoPorHoras(horasTrabalho, horasFolga, quantidadePeriodos) {
    const dataHoraInicial = elementos.inputDataInicial.value;

    tipoResultadoAtual = TIPO_CICLO_HORAS;

    elementos.kickerResultado.textContent = "Períodos";
    elementos.tituloResultado.textContent = "Períodos de trabalho e folga";
    elementos.descricaoResultado.textContent = "Visualização em blocos com início e fim, ideal para escalas como 12x36.";

    if (!dataHoraInicial) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Informe uma data e hora inicial para gerar os períodos.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    if (quantidadePeriodos > 80) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Para manter a demo leve, visualize no máximo 80 períodos.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    const periodosGerados = gerarPeriodosDaEscala(dataHoraInicial, horasTrabalho, horasFolga, quantidadePeriodos);
    ultimoResultadoGerado = periodosGerados;

    renderizarTimeline(periodosGerados);
    renderizarPeriodos(periodosGerados);
}

function gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias) {
    const dias = [];
    const ciclo = diasTrabalho + diasFolga;

    for (let indice = 0; indice < quantidadeDias; indice++) {
        const dataAtual = new Date(`${dataInicial}T00:00:00`);
        dataAtual.setDate(dataAtual.getDate() + indice);

        const posicaoCiclo = indice % ciclo;
        const estaTrabalhando = posicaoCiclo < diasTrabalho;

        dias.push({
            data: dataAtual,
            dia: dataAtual.getDate(),
            mes: dataAtual.getMonth(),
            ano: dataAtual.getFullYear(),
            status: estaTrabalhando ? "Trabalhando" : "Folga",
            classe: estaTrabalhando ? "work" : "rest",
            icone: estaTrabalhando ? "🟢" : "🌙"
        });
    }

    return dias;
}

function gerarPeriodosDaEscala(dataHoraInicial, horasTrabalho, horasFolga, quantidadePeriodos) {
    const periodos = [];
    let inicioPeriodo = new Date(dataHoraInicial);

    for (let indice = 0; indice < quantidadePeriodos; indice++) {
        const estaTrabalhando = indice % 2 === 0;
        const duracaoHoras = estaTrabalhando ? horasTrabalho : horasFolga;
        const fimPeriodo = new Date(inicioPeriodo.getTime() + duracaoHoras * 60 * 60 * 1000);

        periodos.push({
            inicio: new Date(inicioPeriodo),
            fim: fimPeriodo,
            status: estaTrabalhando ? "Trabalhando" : "Folga",
            classe: estaTrabalhando ? "work" : "rest",
            icone: estaTrabalhando ? "🟢" : "🌙"
        });

        inicioPeriodo = fimPeriodo;
    }

    return periodos;
}

function renderizarTimeline(itensGerados) {
    elementos.timeline.innerHTML = "";

    const limite = Math.min(itensGerados.length, 60);

    itensGerados.slice(0, limite).forEach((item) => {
        const ponto = document.createElement("span");
        ponto.className = `timeline-dot ${item.classe}`;

        if (tipoResultadoAtual === TIPO_CICLO_HORAS) {
            ponto.title = `${formatarDataHora(item.inicio)} até ${formatarDataHora(item.fim)} - ${item.status}`;
        } else {
            ponto.title = `${formatarData(item.data)} - ${item.status}`;
        }

        elementos.timeline.appendChild(ponto);
    });
}

function renderizarCalendariosPorMes(diasGerados) {
    elementos.calendarios.className = "calendars";
    elementos.calendarios.innerHTML = "";

    const meses = agruparDiasPorMes(diasGerados);

    Object.keys(meses).forEach((chaveMes) => {
        const diasDoMes = meses[chaveMes];
        const primeiroDiaGerado = diasDoMes[0].data;

        const monthCard = document.createElement("article");
        monthCard.className = "month-card";

        const tituloMes = primeiroDiaGerado.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric"
        });

        monthCard.innerHTML = `
            <div class="month-title">
                <h4>${tituloMes}</h4>
            </div>

            <div class="weekdays">
                <span>Dom</span>
                <span>Seg</span>
                <span>Ter</span>
                <span>Qua</span>
                <span>Qui</span>
                <span>Sex</span>
                <span>Sáb</span>
            </div>

            <div class="days-grid"></div>
        `;

        const daysGrid = monthCard.querySelector(".days-grid");

        const primeiroDiaSemana = new Date(
            primeiroDiaGerado.getFullYear(),
            primeiroDiaGerado.getMonth(),
            1
        ).getDay();

        for (let vazio = 0; vazio < primeiroDiaSemana; vazio++) {
            const emptyCell = document.createElement("div");
            emptyCell.className = "day-cell empty";
            daysGrid.appendChild(emptyCell);
        }

        diasDoMes.forEach((diaInfo) => {
            const dayCell = document.createElement("div");
            dayCell.className = `day-cell ${diaInfo.classe}`;
            dayCell.title = `${formatarData(diaInfo.data)} - ${diaInfo.status}`;

            dayCell.innerHTML = `
                <span class="day-number">${diaInfo.dia}</span>
                <span class="day-status">${diaInfo.icone} ${diaInfo.status}</span>
            `;

            daysGrid.appendChild(dayCell);
        });

        elementos.calendarios.appendChild(monthCard);
    });
}

function renderizarPeriodos(periodosGerados) {
    elementos.calendarios.className = "periods-grid";
    elementos.calendarios.innerHTML = "";

    periodosGerados.forEach((periodo, indice) => {
        const card = document.createElement("article");
        card.className = `period-card ${periodo.classe}`;

        card.innerHTML = `
            <h4>${indice + 1}º período • ${periodo.icone} ${periodo.status}</h4>
            <p><strong>Início:</strong> ${formatarDataHora(periodo.inicio)}</p>
            <p><strong>Fim:</strong> ${formatarDataHora(periodo.fim)}</p>
            <p><strong>Duração:</strong> ${calcularDuracaoHoras(periodo.inicio, periodo.fim)} horas</p>
        `;

        elementos.calendarios.appendChild(card);
    });
}

function agruparDiasPorMes(diasGerados) {
    return diasGerados.reduce((meses, diaInfo) => {
        const chave = `${diaInfo.ano}-${String(diaInfo.mes + 1).padStart(2, "0")}`;

        if (!meses[chave]) {
            meses[chave] = [];
        }

        meses[chave].push(diaInfo);

        return meses;
    }, {});
}

function calcularDuracaoHoras(inicio, fim) {
    return Math.round((fim - inicio) / (60 * 60 * 1000));
}

function formatarData(data) {
    return data.toLocaleDateString("pt-BR");
}

function formatarDataHora(data) {
    return data.toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short"
    });
}

function obterDataHoje() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function obterDataSemHora(valor) {
    if (!valor) {
        return obterDataHoje();
    }

    return valor.split("T")[0] || obterDataHoje();
}

function definirDataInicialPadrao() {
    elementos.inputDataInicial.value = obterDataHoje();
}

function exportarJson() {
    const escalas = carregarEscalas();
    const conteudo = JSON.stringify(escalas, null, 4);
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "escalas-demo-v050.json";
    link.click();

    URL.revokeObjectURL(url);

    mostrarMensagem("JSON exportado com sucesso.", "success");
}

function resetarDemo() {
    const confirmar = confirm("Deseja resetar a demo e restaurar as escalas padrão?");

    if (!confirmar) {
        mostrarMensagem("Reset cancelado.", "warning");
        return;
    }

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY_V040);
    localStorage.removeItem(STORAGE_KEY_V030);

    salvarEscalas(escalasPadrao);

    limparFormularioEscala();
    renderizarEscalas();
    atualizarCamposSimulador();
    atualizarResumo();
    gerarVisualizacao();

    mostrarMensagem("Demo resetada para os dados padrão.", "success");
}

function configurarTabsDocumentacao() {
    document.querySelectorAll(".doc-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            const target = tab.dataset.target;

            document.querySelectorAll(".doc-tab").forEach((item) => {
                item.classList.remove("active");
            });

            document.querySelectorAll(".doc-panel").forEach((panel) => {
                panel.classList.remove("active");
            });

            tab.classList.add("active");
            document.getElementById(target).classList.add("active");
        });
    });
}

function configurarAnimacoesDeEntrada() {
    const itens = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver((entradas) => {
        entradas.forEach((entrada) => {
            if (entrada.isIntersecting) {
                entrada.target.classList.add("visible");
            }
        });
    }, {
        threshold: 0.12
    });

    itens.forEach((item) => observer.observe(item));
}

function atualizarProgressoScroll() {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;

    elementos.progressoScroll.style.width = `${progresso}%`;
}

function configurarMenuMobile() {
    elementos.botaoMenu.addEventListener("click", () => {
        const menuAberto = elementos.menuPrincipal.classList.toggle("open");
        elementos.botaoMenu.setAttribute("aria-expanded", String(menuAberto));
    });

    elementos.menuPrincipal.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            elementos.menuPrincipal.classList.remove("open");
            elementos.botaoMenu.setAttribute("aria-expanded", "false");
        });
    });
}

function configurarModalRelease() {
    const botaoRelease = document.createElement("button");
    botaoRelease.type = "button";
    botaoRelease.className = "ghost-button";
    botaoRelease.textContent = "Notas v0.5.0";

    const heroActions = document.querySelector(".hero-actions");
    heroActions.appendChild(botaoRelease);

    botaoRelease.addEventListener("click", () => {
        if (typeof elementos.modalRelease.showModal === "function") {
            elementos.modalRelease.showModal();
        }
    });

    elementos.fecharRelease.addEventListener("click", () => {
        elementos.modalRelease.close();
    });
}

function configurarEventos() {
    elementos.formEscala.addEventListener("submit", gerarVisualizacao);
    elementos.formNovaEscala.addEventListener("submit", salvarFormularioEscala);

    elementos.botaoCancelarEdicao.addEventListener("click", cancelarEdicao);
    elementos.botaoTema.addEventListener("click", alternarTema);
    elementos.botaoExportarJson.addEventListener("click", exportarJson);
    elementos.botaoLimparDemo.addEventListener("click", resetarDemo);

    elementos.tipoEscala.addEventListener("change", () => {
        atualizarCamposSimulador();
        gerarVisualizacao();
    });

    elementos.inputTipoNovaEscala.addEventListener("change", atualizarCamposCadastro);

    elementos.inputTempoTrabalho.addEventListener("input", gerarVisualizacao);
    elementos.inputTempoFolga.addEventListener("input", gerarVisualizacao);
    elementos.inputQuantidadeItens.addEventListener("input", gerarVisualizacao);
    elementos.inputDataInicial.addEventListener("change", gerarVisualizacao);

    window.addEventListener("scroll", atualizarProgressoScroll);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";
    aplicarTema(temaSalvo);
}

function inicializarDemo() {
    carregarTemaSalvo();
    definirDataInicialPadrao();

    configurarEventos();
    configurarTabsDocumentacao();
    configurarAnimacoesDeEntrada();
    configurarMenuMobile();
    configurarModalRelease();

    renderizarEscalas();
    atualizarCamposSimulador();
    atualizarCamposCadastro();
    atualizarResumo();
    gerarVisualizacao();
    atualizarProgressoScroll();
}

inicializarDemo();