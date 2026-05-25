const STORAGE_KEY = "simulador_escalas_favoritas_v020";
const THEME_KEY = "simulador_tema_v020";

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

function carregarEscalas() {
    const escalasSalvas = localStorage.getItem(STORAGE_KEY);

    if (!escalasSalvas) {
        salvarEscalas(escalasPadrao);
        return escalasPadrao;
    }

    try {
        return JSON.parse(escalasSalvas);
    } catch {
        salvarEscalas(escalasPadrao);
        return escalasPadrao;
    }
}

function salvarEscalas(escalas) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(escalas));
}

function normalizarTexto(texto) {
    return texto.toLowerCase().trim();
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

    escalas.forEach((escala, indice) => {
        const card = document.createElement("div");
        card.className = "escala-card";

        card.innerHTML = `
            <h3>${indice + 1} - ${escala.nome}</h3>
            <p>${escala.dias_trabalho} dias trabalhando • ${escala.dias_folga} dias de folga</p>
            <button type="button" data-indice="${indice}">Usar escala</button>
        `;

        listaEscalas.appendChild(card);
    });

    document.querySelectorAll(".escala-card button").forEach((botao) => {
        botao.addEventListener("click", () => {
            const indice = Number(botao.dataset.indice);
            aplicarEscala(indice);
        });
    });
}

function aplicarEscala(indice) {
    const escalas = carregarEscalas();
    const escala = escalas[indice];

    inputDiasTrabalho.value = escala.dias_trabalho;
    inputDiasFolga.value = escala.dias_folga;

    atualizarEscalaAtual();
    gerarCalendario();

    mostrarMensagem(`Escala "${escala.nome}" aplicada com sucesso.`, "sucesso");
}

function cadastrarEscala(evento) {
    evento.preventDefault();

    const nome = inputNomeEscala.value.trim();
    const diasTrabalho = Number(inputNovoDiasTrabalho.value);
    const diasFolga = Number(inputNovoDiasFolga.value);

    if (!nome) {
        mostrarMensagem("O nome da escala não pode ficar vazio.", "erro");
        return;
    }

    if (diasTrabalho <= 0 || diasFolga <= 0) {
        mostrarMensagem("Os dias trabalhados e de folga precisam ser maiores que zero.", "erro");
        return;
    }

    const escalas = carregarEscalas();

    const nomeDuplicado = escalas.some((escala) => {
        return normalizarTexto(escala.nome) === normalizarTexto(nome);
    });

    if (nomeDuplicado) {
        mostrarMensagem(`A escala "${nome}" já existe.`, "erro");
        return;
    }

    const configuracaoDuplicada = escalas.some((escala) => {
        return escala.dias_trabalho === diasTrabalho && escala.dias_folga === diasFolga;
    });

    if (configuracaoDuplicada) {
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

    formNovaEscala.reset();
    renderizarEscalas();

    mostrarMensagem("Escala cadastrada com sucesso.", "sucesso");
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
formNovaEscala.addEventListener("submit", cadastrarEscala);
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