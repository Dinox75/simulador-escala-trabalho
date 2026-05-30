const STORAGE_KEY = "simulador_escalas_favoritas_v040";
const STORAGE_KEY_ANTIGA = "simulador_escalas_favoritas_v030";
const THEME_KEY = "simulador_tema_v040";

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
    }
];

let indiceEdicao = null;
let ultimoCalendarioGerado = [];

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
    inputDiasTrabalho: $("#dias-trabalho"),
    inputDiasFolga: $("#dias-folga"),
    inputQuantidadeDias: $("#quantidade-dias"),

    escalaAtualTexto: $("#escala-atual-texto"),
    tipoAtualTexto: $("#tipo-atual-texto"),
    totalEscalas: $("#total-escalas"),
    totalDiasSimulados: $("#total-dias-simulados"),

    listaEscalas: $("#lista-escalas"),
    botaoExportarJson: $("#botao-exportar-json"),
    botaoLimparDemo: $("#botao-limpar-demo"),

    formNovaEscala: $("#form-nova-escala"),
    tituloFormEscala: $("#titulo-form-escala"),
    descricaoFormEscala: $("#descricao-form-escala"),
    inputNomeEscala: $("#nome-escala"),
    inputTipoNovaEscala: $("#tipo-nova-escala"),
    inputNovoDiasTrabalho: $("#novo-dias-trabalho"),
    inputNovoDiasFolga: $("#novo-dias-folga"),
    botaoSalvarEscala: $("#botao-salvar-escala"),
    botaoCancelarEdicao: $("#botao-cancelar-edicao"),
    mensagem: $("#mensagem"),

    timeline: $("#timeline"),
    calendarios: $("#calendarios"),

    toastArea: $("#toast-area"),

    modalRelease: $("#modal-release"),
    fecharRelease: $("#fechar-release")
};

function obterNomeTipo(tipo) {
    return NOMES_TIPOS[tipo] || NOMES_TIPOS[TIPO_CICLO_DIAS];
}

function normalizarEscala(escala) {
    const tipoValido = Object.keys(NOMES_TIPOS).includes(escala.tipo);

    return {
        nome: escala.nome || "Escala sem nome",
        tipo: tipoValido ? escala.tipo : TIPO_CICLO_DIAS,
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

    const dadosAntigos = localStorage.getItem(STORAGE_KEY_ANTIGA);

    if (dadosAntigos) {
        try {
            const escalasMigradas = normalizarListaEscalas(JSON.parse(dadosAntigos));
            salvarEscalas(escalasMigradas);
            mostrarToast("Escalas antigas migradas para o formato v0.4.0.", "success");
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

function normalizarTexto(texto) {
    return texto.toLowerCase().trim();
}

function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function atualizarResumo() {
    const diasTrabalho = Number(elementos.inputDiasTrabalho.value) || 0;
    const diasFolga = Number(elementos.inputDiasFolga.value) || 0;
    const quantidadeDias = Number(elementos.inputQuantidadeDias.value) || 0;
    const tipo = elementos.tipoEscala.value || TIPO_CICLO_DIAS;

    elementos.escalaAtualTexto.textContent = `${diasTrabalho}x${diasFolga}`;
    elementos.tipoAtualTexto.textContent = obterNomeTipo(tipo);
    elementos.totalDiasSimulados.textContent = quantidadeDias;

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
            <p>${escala.dias_trabalho} dias trabalhando • ${escala.dias_folga} dias de folga</p>
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

    elementos.tipoEscala.value = escala.tipo;
    elementos.inputDiasTrabalho.value = escala.dias_trabalho;
    elementos.inputDiasFolga.value = escala.dias_folga;

    atualizarResumo();
    gerarCalendario();

    mostrarMensagem(`Escala "${escala.nome}" aplicada com sucesso.`, "success");
}

function obterDadosFormularioEscala() {
    return {
        nome: elementos.inputNomeEscala.value.trim(),
        tipo: elementos.inputTipoNovaEscala.value || TIPO_CICLO_DIAS,
        diasTrabalho: Number(elementos.inputNovoDiasTrabalho.value),
        diasFolga: Number(elementos.inputNovoDiasFolga.value)
    };
}

function validarDadosEscala(nome, diasTrabalho, diasFolga) {
    if (!nome) {
        mostrarMensagem("O nome da escala não pode ficar vazio.", "error");
        return false;
    }

    if (!Number.isFinite(diasTrabalho) || !Number.isFinite(diasFolga)) {
        mostrarMensagem("Informe números válidos para trabalho e folga.", "error");
        return false;
    }

    if (diasTrabalho <= 0 || diasFolga <= 0) {
        mostrarMensagem("Os dias trabalhados e de folga precisam ser maiores que zero.", "error");
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

function existeConfiguracaoDuplicada(escalas, tipo, diasTrabalho, diasFolga, indiceIgnorado = null) {
    return escalas.some((escala, indice) => {
        if (indice === indiceIgnorado) {
            return false;
        }

        return (
            escala.tipo === tipo &&
            escala.dias_trabalho === diasTrabalho &&
            escala.dias_folga === diasFolga
        );
    });
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
    const { nome, tipo, diasTrabalho, diasFolga } = obterDadosFormularioEscala();

    if (!validarDadosEscala(nome, diasTrabalho, diasFolga)) {
        return;
    }

    const escalas = carregarEscalas();

    if (existeNomeDuplicado(escalas, nome)) {
        mostrarMensagem(`A escala "${nome}" já existe.`, "error");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, tipo, diasTrabalho, diasFolga)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error");
        return;
    }

    const novaEscala = {
        nome,
        tipo,
        dias_trabalho: diasTrabalho,
        dias_folga: diasFolga
    };

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

    indiceEdicao = indice;

    elementos.inputNomeEscala.value = escala.nome;
    elementos.inputTipoNovaEscala.value = escala.tipo;
    elementos.inputNovoDiasTrabalho.value = escala.dias_trabalho;
    elementos.inputNovoDiasFolga.value = escala.dias_folga;

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

    const { nome, tipo, diasTrabalho, diasFolga } = obterDadosFormularioEscala();

    if (!validarDadosEscala(nome, diasTrabalho, diasFolga)) {
        return;
    }

    if (existeNomeDuplicado(escalas, nome, indiceEdicao)) {
        mostrarMensagem(`A escala "${nome}" já existe.`, "error");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, tipo, diasTrabalho, diasFolga, indiceEdicao)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "error");
        return;
    }

    const confirmarEdicao = confirm(`Deseja salvar as alterações da escala "${escalaAtual.nome}"?`);

    if (!confirmarEdicao) {
        mostrarMensagem("Edição cancelada.", "warning");
        return;
    }

    escalas[indiceEdicao] = {
        nome,
        tipo: tipo || escalaAtual.tipo || TIPO_CICLO_DIAS,
        dias_trabalho: diasTrabalho,
        dias_folga: diasFolga
    };

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
}

function cancelarEdicao() {
    limparFormularioEscala();
    mostrarMensagem("Edição cancelada.", "warning");
}

function gerarCalendario(evento) {
    if (evento) {
        evento.preventDefault();
    }

    const tipo = elementos.tipoEscala.value;
    const dataInicial = elementos.inputDataInicial.value;
    const diasTrabalho = Number(elementos.inputDiasTrabalho.value);
    const diasFolga = Number(elementos.inputDiasFolga.value);
    const quantidadeDias = Number(elementos.inputQuantidadeDias.value);

    atualizarResumo();

    if (tipo !== TIPO_CICLO_DIAS) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">
                O tipo escolhido ainda não possui cálculo implementado nesta demo.
            </p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    if (!dataInicial) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Informe uma data inicial para gerar o calendário.</p>
        `;
        elementos.timeline.innerHTML = "";
        return;
    }

    if (
        !Number.isFinite(diasTrabalho) ||
        !Number.isFinite(diasFolga) ||
        !Number.isFinite(quantidadeDias) ||
        diasTrabalho <= 0 ||
        diasFolga <= 0 ||
        quantidadeDias <= 0
    ) {
        elementos.calendarios.innerHTML = `
            <p class="empty-state">Preencha todos os campos com valores maiores que zero.</p>
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
    ultimoCalendarioGerado = diasGerados;

    renderizarTimeline(diasGerados);
    renderizarCalendariosPorMes(diasGerados);
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

function renderizarTimeline(diasGerados) {
    elementos.timeline.innerHTML = "";

    const limite = Math.min(diasGerados.length, 60);

    diasGerados.slice(0, limite).forEach((dia) => {
        const ponto = document.createElement("span");
        ponto.className = `timeline-dot ${dia.classe}`;
        ponto.title = `${formatarData(dia.data)} - ${dia.status}`;
        elementos.timeline.appendChild(ponto);
    });
}

function renderizarCalendariosPorMes(diasGerados) {
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

function formatarData(data) {
    return data.toLocaleDateString("pt-BR");
}

function definirDataInicialPadrao() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    elementos.inputDataInicial.value = `${ano}-${mes}-${dia}`;
}

function exportarJson() {
    const escalas = carregarEscalas();
    const conteudo = JSON.stringify(escalas, null, 4);
    const blob = new Blob([conteudo], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "escalas-demo-v040.json";
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
    salvarEscalas(escalasPadrao);

    limparFormularioEscala();
    renderizarEscalas();
    atualizarResumo();
    gerarCalendario();

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
        elementos.menuPrincipal.classList.toggle("open");
    });

    elementos.menuPrincipal.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            elementos.menuPrincipal.classList.remove("open");
        });
    });
}

function configurarModalRelease() {
    const botaoRelease = document.createElement("button");
    botaoRelease.type = "button";
    botaoRelease.className = "ghost-button";
    botaoRelease.textContent = "Notas v0.4.0";

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
    elementos.formEscala.addEventListener("submit", gerarCalendario);
    elementos.formNovaEscala.addEventListener("submit", salvarFormularioEscala);

    elementos.botaoCancelarEdicao.addEventListener("click", cancelarEdicao);
    elementos.botaoTema.addEventListener("click", alternarTema);
    elementos.botaoExportarJson.addEventListener("click", exportarJson);
    elementos.botaoLimparDemo.addEventListener("click", resetarDemo);

    elementos.inputDiasTrabalho.addEventListener("input", () => {
        atualizarResumo();
        gerarCalendario();
    });

    elementos.inputDiasFolga.addEventListener("input", () => {
        atualizarResumo();
        gerarCalendario();
    });

    elementos.inputQuantidadeDias.addEventListener("input", () => {
        atualizarResumo();
        gerarCalendario();
    });

    elementos.inputDataInicial.addEventListener("change", gerarCalendario);
    elementos.tipoEscala.addEventListener("change", gerarCalendario);

    window.addEventListener("scroll", atualizarProgressoScroll);
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
    atualizarResumo();
    gerarCalendario();
    atualizarProgressoScroll();
}

inicializarDemo();