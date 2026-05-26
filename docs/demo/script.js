const STORAGE_KEY = "simulador_escalas_favoritas_v030";
const STORAGE_KEY_ANTIGA = "simulador_escalas_favoritas_v020";
const THEME_KEY = "simulador_tema_v030";

const escalasPadrao = [
    {
        nome: "Escala padrão 6x3",
        dias_trabalho: 6,
        dias_folga: 3
    },
    {
        nome: "Escala administrativa 5x2",
        dias_trabalho: 5,
        dias_folga: 2
    },
    {
        nome: "Escala alternada 4x4",
        dias_trabalho: 4,
        dias_folga: 4
    }
];

let indiceEdicao = null;

const formEscala = document.getElementById("form-escala");
const formNovaEscala = document.getElementById("form-nova-escala");

const inputDataInicial = document.getElementById("data-inicial");
const inputDiasTrabalho = document.getElementById("dias-trabalho");
const inputDiasFolga = document.getElementById("dias-folga");
const inputQuantidadeDias = document.getElementById("quantidade-dias");

const inputNomeEscala = document.getElementById("nome-escala");
const inputNovoDiasTrabalho = document.getElementById("novo-dias-trabalho");
const inputNovoDiasFolga = document.getElementById("novo-dias-folga");

const listaEscalas = document.getElementById("lista-escalas");
const mensagem = document.getElementById("mensagem");
const escalaAtualTexto = document.getElementById("escala-atual-texto");
const calendarios = document.getElementById("calendarios");
const botaoTema = document.getElementById("botao-tema");

const tituloFormEscala = document.getElementById("titulo-form-escala");
const descricaoFormEscala = document.getElementById("descricao-form-escala");
const botaoSalvarEscala = document.getElementById("botao-salvar-escala");
const botaoCancelarEdicao = document.getElementById("botao-cancelar-edicao");

function carregarEscalas() {
    const escalasSalvas = localStorage.getItem(STORAGE_KEY);

    if (escalasSalvas) {
        try {
            return JSON.parse(escalasSalvas);
        } catch {
            salvarEscalas(escalasPadrao);
            return escalasPadrao;
        }
    }

    const escalasAntigas = localStorage.getItem(STORAGE_KEY_ANTIGA);

    if (escalasAntigas) {
        try {
            const escalasMigradas = JSON.parse(escalasAntigas);
            salvarEscalas(escalasMigradas);
            return escalasMigradas;
        } catch {
            salvarEscalas(escalasPadrao);
            return escalasPadrao;
        }
    }

    salvarEscalas(escalasPadrao);
    return escalasPadrao;
}

function salvarEscalas(escalas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(escalas));
}

function normalizarTexto(texto) {
    return texto.toLowerCase().trim();
}

function escaparHTML(texto) {
    return texto
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function atualizarEscalaAtual() {
    const diasTrabalho = Number(inputDiasTrabalho.value);
    const diasFolga = Number(inputDiasFolga.value);

    escalaAtualTexto.textContent = `${diasTrabalho}x${diasFolga}`;
}

function mostrarMensagem(texto, tipo) {
    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;

    setTimeout(() => {
        mensagem.className = "mensagem";
        mensagem.textContent = "";
    }, 3500);
}

function aplicarTema(tema) {
    document.body.dataset.theme = tema;
    localStorage.setItem(THEME_KEY, tema);

    if (tema === "light") {
        botaoTema.textContent = "☀️ Tema claro";
    } else {
        botaoTema.textContent = "🌙 Tema escuro";
    }
}

function alternarTema() {
    const temaAtual = document.body.dataset.theme;
    const novoTema = temaAtual === "dark" ? "light" : "dark";

    aplicarTema(novoTema);
}

function carregarTemaSalvo() {
    const temaSalvo = localStorage.getItem(THEME_KEY) || "dark";
    aplicarTema(temaSalvo);
}

function renderizarEscalas() {
    const escalas = carregarEscalas();

    listaEscalas.innerHTML = "";

    if (escalas.length === 0) {
        listaEscalas.innerHTML = `
            <p class="estado-vazio">Nenhuma escala salva no momento.</p>
        `;
        return;
    }

    escalas.forEach((escala, indice) => {
        const card = document.createElement("div");
        card.className = "escala-card";

        card.innerHTML = `
            <h3>${indice + 1} - ${escaparHTML(escala.nome)}</h3>
            <p>${escala.dias_trabalho} dias trabalhando • ${escala.dias_folga} dias de folga</p>

            <div class="escala-actions">
                <button class="botao-usar" type="button" data-indice="${indice}">
                    Usar
                </button>

                <button class="botao-editar" type="button" data-indice="${indice}">
                    Editar
                </button>

                <button class="botao-excluir" type="button" data-indice="${indice}">
                    Excluir
                </button>
            </div>
        `;

        listaEscalas.appendChild(card);
    });

    document.querySelectorAll(".botao-usar").forEach((botao) => {
        botao.addEventListener("click", () => {
            const indice = Number(botao.dataset.indice);
            aplicarEscala(indice);
        });
    });

    document.querySelectorAll(".botao-editar").forEach((botao) => {
        botao.addEventListener("click", () => {
            const indice = Number(botao.dataset.indice);
            prepararEdicaoEscala(indice);
        });
    });

    document.querySelectorAll(".botao-excluir").forEach((botao) => {
        botao.addEventListener("click", () => {
            const indice = Number(botao.dataset.indice);
            excluirEscala(indice);
        });
    });
}

function aplicarEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada.", "erro");
        return;
    }

    inputDiasTrabalho.value = escala.dias_trabalho;
    inputDiasFolga.value = escala.dias_folga;

    atualizarEscalaAtual();
    gerarCalendario();

    mostrarMensagem(`Escala "${escala.nome}" aplicada com sucesso.`, "sucesso");
}

function obterDadosFormularioEscala() {
    const nome = inputNomeEscala.value.trim();
    const diasTrabalho = Number(inputNovoDiasTrabalho.value);
    const diasFolga = Number(inputNovoDiasFolga.value);

    return {
        nome,
        diasTrabalho,
        diasFolga
    };
}

function validarDadosEscala(nome, diasTrabalho, diasFolga) {
    if (!nome) {
        mostrarMensagem("O nome da escala não pode ficar vazio.", "erro");
        return false;
    }

    if (diasTrabalho <= 0 || diasFolga <= 0) {
        mostrarMensagem("Os dias trabalhados e de folga precisam ser maiores que zero.", "erro");
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

function existeConfiguracaoDuplicada(escalas, diasTrabalho, diasFolga, indiceIgnorado = null) {
    return escalas.some((escala, indice) => {
        if (indice === indiceIgnorado) {
            return false;
        }

        return escala.dias_trabalho === diasTrabalho && escala.dias_folga === diasFolga;
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
    const { nome, diasTrabalho, diasFolga } = obterDadosFormularioEscala();

    if (!validarDadosEscala(nome, diasTrabalho, diasFolga)) {
        return;
    }

    const escalas = carregarEscalas();

    if (existeNomeDuplicado(escalas, nome)) {
        mostrarMensagem(`A escala "${nome}" já existe.`, "erro");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, diasTrabalho, diasFolga)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "erro");
        return;
    }

    const novaEscala = {
        nome: nome,
        dias_trabalho: diasTrabalho,
        dias_folga: diasFolga
    };

    escalas.push(novaEscala);
    salvarEscalas(escalas);

    limparFormularioEscala();
    renderizarEscalas();

    mostrarMensagem("Escala cadastrada com sucesso.", "sucesso");
}

function prepararEdicaoEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada para edição.", "erro");
        return;
    }

    indiceEdicao = indice;

    inputNomeEscala.value = escala.nome;
    inputNovoDiasTrabalho.value = escala.dias_trabalho;
    inputNovoDiasFolga.value = escala.dias_folga;

    tituloFormEscala.textContent = "Editar escala";
    descricaoFormEscala.textContent = "Altere os dados da escala selecionada e salve a atualização.";
    botaoSalvarEscala.textContent = "Salvar alteração";
    botaoCancelarEdicao.classList.remove("hidden");

    inputNomeEscala.focus();

    mostrarMensagem(`Editando a escala "${escala.nome}".`, "aviso");
}

function salvarEdicaoEscala() {
    const escalas = carregarEscalas();
    const escalaAtual = escalas[indiceEdicao];

    if (!escalaAtual) {
        mostrarMensagem("Escala não encontrada para salvar edição.", "erro");
        cancelarEdicao();
        return;
    }

    const { nome, diasTrabalho, diasFolga } = obterDadosFormularioEscala();

    if (!validarDadosEscala(nome, diasTrabalho, diasFolga)) {
        return;
    }

    if (existeNomeDuplicado(escalas, nome, indiceEdicao)) {
        mostrarMensagem(`A escala "${nome}" já existe.`, "erro");
        return;
    }

    if (existeConfiguracaoDuplicada(escalas, diasTrabalho, diasFolga, indiceEdicao)) {
        mostrarMensagem("Já existe uma escala com essa mesma configuração.", "erro");
        return;
    }

    const confirmarEdicao = confirm(
        `Deseja salvar as alterações da escala "${escalaAtual.nome}"?`
    );

    if (!confirmarEdicao) {
        mostrarMensagem("Edição cancelada.", "aviso");
        return;
    }

    escalas[indiceEdicao] = {
        nome: nome,
        dias_trabalho: diasTrabalho,
        dias_folga: diasFolga
    };

    salvarEscalas(escalas);
    limparFormularioEscala();
    renderizarEscalas();

    mostrarMensagem("Escala editada com sucesso.", "sucesso");
}

function excluirEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    if (!escala) {
        mostrarMensagem("Escala não encontrada para exclusão.", "erro");
        return;
    }

    const confirmarExclusao = confirm(
        `Tem certeza que deseja excluir a escala "${escala.nome}"?`
    );

    if (!confirmarExclusao) {
        mostrarMensagem("Exclusão cancelada.", "aviso");
        return;
    }

    escalas.splice(indice, 1);
    salvarEscalas(escalas);

    if (indiceEdicao === indice) {
        limparFormularioEscala();
    }

    renderizarEscalas();

    mostrarMensagem(`Escala "${escala.nome}" excluída com sucesso.`, "sucesso");
}

function cancelarEdicao() {
    limparFormularioEscala();
    mostrarMensagem("Edição cancelada.", "aviso");
}

function limparFormularioEscala() {
    indiceEdicao = null;

    formNovaEscala.reset();

    tituloFormEscala.textContent = "Nova escala";
    descricaoFormEscala.textContent = "Cadastre uma nova configuração e reutilize depois.";
    botaoSalvarEscala.textContent = "Cadastrar escala";
    botaoCancelarEdicao.classList.add("hidden");
}

function gerarCalendario(evento) {
    if (evento) {
        evento.preventDefault();
    }

    const dataInicial = inputDataInicial.value;
    const diasTrabalho = Number(inputDiasTrabalho.value);
    const diasFolga = Number(inputDiasFolga.value);
    const quantidadeDias = Number(inputQuantidadeDias.value);

    atualizarEscalaAtual();

    if (!dataInicial) {
        calendarios.innerHTML = `
            <p class="estado-vazio">Informe uma data inicial para gerar o calendário.</p>
        `;
        return;
    }

    if (diasTrabalho <= 0 || diasFolga <= 0 || quantidadeDias <= 0) {
        calendarios.innerHTML = `
            <p class="estado-vazio">Preencha todos os campos com valores maiores que zero.</p>
        `;
        return;
    }

    const diasGerados = gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias);
    renderizarCalendariosPorMes(diasGerados);
}

function gerarDiasDaEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias) {
    const dias = [];
    const ciclo = diasTrabalho + diasFolga;

    for (let indice = 0; indice < quantidadeDias; indice++) {
        const dataAtual = new Date(dataInicial + "T00:00:00");
        dataAtual.setDate(dataAtual.getDate() + indice);

        const posicaoCiclo = indice % ciclo;
        const estaTrabalhando = posicaoCiclo < diasTrabalho;

        dias.push({
            data: dataAtual,
            dia: dataAtual.getDate(),
            mes: dataAtual.getMonth(),
            ano: dataAtual.getFullYear(),
            status: estaTrabalhando ? "Trabalhando" : "Folga",
            classe: estaTrabalhando ? "trabalho" : "folga",
            icone: estaTrabalhando ? "🟢" : "🌙"
        });
    }

    return dias;
}

function renderizarCalendariosPorMes(diasGerados) {
    calendarios.innerHTML = "";

    const meses = agruparDiasPorMes(diasGerados);

    Object.keys(meses).forEach((chaveMes) => {
        const diasDoMes = meses[chaveMes];
        const primeiroDia = diasDoMes[0].data;

        const monthCard = document.createElement("article");
        monthCard.className = "month-card";

        const tituloMes = primeiroDia.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric"
        });

        monthCard.innerHTML = `
            <div class="month-title">
                <h3>${tituloMes}</h3>
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
            primeiroDia.getFullYear(),
            primeiroDia.getMonth(),
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

            dayCell.innerHTML = `
                <span class="day-number">${diaInfo.dia}</span>
                <span class="day-status">${diaInfo.icone} ${diaInfo.status}</span>
            `;

            daysGrid.appendChild(dayCell);
        });

        calendarios.appendChild(monthCard);
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

function definirDataInicialPadrao() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const dia = String(hoje.getDate()).padStart(2, "0");

    inputDataInicial.value = `${ano}-${mes}-${dia}`;
}

formEscala.addEventListener("submit", gerarCalendario);
formNovaEscala.addEventListener("submit", salvarFormularioEscala);
botaoCancelarEdicao.addEventListener("click", cancelarEdicao);
botaoTema.addEventListener("click", alternarTema);

inputDiasTrabalho.addEventListener("input", () => {
    atualizarEscalaAtual();
    gerarCalendario();
});

inputDiasFolga.addEventListener("input", () => {
    atualizarEscalaAtual();
    gerarCalendario();
});

inputQuantidadeDias.addEventListener("input", gerarCalendario);
inputDataInicial.addEventListener("change", gerarCalendario);

carregarTemaSalvo();
definirDataInicialPadrao();
renderizarEscalas();
atualizarEscalaAtual();
gerarCalendario();