// Captura o formulário e a área onde os resultados serão exibidos
const formEscala = document.getElementById("form-escala");
const listaResultados = document.getElementById("lista-resultados");

// Escuta o envio do formulário
formEscala.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const dataInicial = document.getElementById("data-inicial").value;
    const diasTrabalho = Number(document.getElementById("dias-trabalho").value);
    const diasFolga = Number(document.getElementById("dias-folga").value);
    const quantidadeDias = Number(document.getElementById("quantidade-dias").value);

    if (!dataInicial || diasTrabalho <= 0 || diasFolga <= 0 || quantidadeDias <= 0) {
        listaResultados.innerHTML = `
            <p class="mensagem-inicial">
                Preencha todos os campos corretamente antes de gerar a escala.
            </p>
        `;
        return;
    }

    gerarEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias);
});

// Função responsável por gerar a escala
function gerarEscala(dataInicial, diasTrabalho, diasFolga, quantidadeDias) {
    listaResultados.innerHTML = "";

    const ciclo = diasTrabalho + diasFolga;

    for (let dia = 0; dia < quantidadeDias; dia++) {
        const dataAtual = new Date(dataInicial + "T00:00:00");

        dataAtual.setDate(dataAtual.getDate() + dia);

        const posicaoCiclo = dia % ciclo;

        let status = "";
        let classe = "";
        let icone = "";

        if (posicaoCiclo < diasTrabalho) {
            status = "Trabalhando";
            classe = "trabalho";
            icone = "🟢";
        } else {
            status = "Folga";
            classe = "folga";
            icone = "🌙";
        }

        criarCardDia(dataAtual, status, classe, icone);
    }
}

// Função responsável por criar o card visual de cada dia
function criarCardDia(dataAtual, status, classe, icone) {
    const card = document.createElement("div");

    card.classList.add("item-dia", classe);

    const dataFormatada = dataAtual.toLocaleDateString("pt-BR");

    card.innerHTML = `
        <strong>${dataFormatada}</strong>
        <span>${icone} ${status}</span>
    `;

    listaResultados.appendChild(card);
}