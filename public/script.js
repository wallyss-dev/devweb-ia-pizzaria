// 1. INTRODUÇÃO: COMENTÁRIOS, console.log, alert, prompt
console.log("JavaScript conectado com sucesso!");
alert("Bem-vindo ao site Forno & Massa!");
let nomeUsuario = prompt("Qual é o seu nome?");

// 2. VARIÁVEIS (let, const), CONCATENAÇÃO, if E ===
const pizzaria = "Forno & Massa";
let anoAbertura = 2020;

function formatarNome(nome) {
    return nome.trim();
}

if (nomeUsuario === null || nomeUsuario.trim() === "") {
    nomeUsuario = "visitante";
}

nomeUsuario = formatarNome(nomeUsuario);

let mensagem = "Olá, " + nomeUsuario + "! Bem-vindo ao " + pizzaria + "!";
console.log("Nome digitado:", nomeUsuario);
console.log("Aberta desde:", anoAbertura);

// 3. DOM: SELEÇÃO DE ELEMENTOS
let titulo = document.querySelector(".hero h2");
titulo.innerText = mensagem;

let botaoWhats = document.getElementById("whats");
console.log("Botão do WhatsApp:", botaoWhats);

let listaCards = document.getElementsByClassName("card");
console.log("Lista de cards:", listaCards);
console.log("Primeiro card:", listaCards[0]);

let titulos = document.getElementsByTagName("h3");
console.log("Todos os h3:", titulos);

let tituloCard = document.querySelector(".card h3");
console.log("Título do primeiro card:", tituloCard.innerText);

let cards = document.querySelectorAll(".card");
console.log("Lista de cards (NodeList):", cards);
console.log("Segundo card:", cards[1]);

// 4. FUNÇÕES E EVENTOS
function mostrarMensagem() {
    alert(mensagem);
}

let btnBoasVindas = document.querySelector("#btnBoasVindas");
btnBoasVindas.addEventListener("click", mostrarMensagem);

function abrirWhats(e) {
    e.preventDefault();
    alert("Você será redirecionado para o WhatsApp!");
    window.open("https://wa.me/5511999999999", "_blank");
}

let whats = document.querySelector("#whats");
whats.addEventListener("click", abrirWhats);

let logo = document.querySelector("#logo");
logo.addEventListener("dblclick", function () {
    document.body.style.background = "#f6d8c8";
    console.log("Duplo clique detectado na logo!");
});

// 5. LISTAS COM forEach + click, mouseenter, mouseleave
cards.forEach(function (card) {
    card.addEventListener("click", function () {
        let nomeItem = card.querySelector("h3").innerText;
        alert("Você clicou em: " + nomeItem);
    });

    card.addEventListener("mouseenter", function () {
        card.style.background = "#ffe0cf";
    });

    card.addEventListener("mouseleave", function () {
        card.style.background = "#ffffff";
    });
});

// 6. LABORATÓRIO: MANIPULANDO ESTILO E CONTEÚDO
function trocarCorTitulo() {
    titulo.style.color = "orange";
}

function colocarBorda() {
    listaCards[0].style.border = "3px solid blue";
}

function trocarFundo() {
    document.body.style.background = "red";
}

function alterarPrimeiroH3() {
    titulos[0].innerText = "Título alterado com JS";
}

function resetar() {
    titulo.style.color = "white";
    listaCards[0].style.border = "1px solid #f0d9cf";
    document.body.style.background = "#fff7f0";
    titulos[0].innerText = "Nossa história";
}

document.getElementById("btnCor").addEventListener("click", trocarCorTitulo);
document.getElementById("btnBorda").addEventListener("click", colocarBorda);
document.getElementById("btnFundo").addEventListener("click", trocarFundo);
document.getElementById("btnTexto").addEventListener("click", alterarPrimeiroH3);
document.getElementById("btnReset").addEventListener("click", resetar);

// 7. COMPARADOR: OPERADORES == E ===
let numeroSecreto = 10;

let inputComparar = document.querySelector("#valorComparar");
let btnComparar = document.querySelector("#btnComparar");
let resultadoIgual = document.querySelector("#resultadoIgual");
let resultadoTipo = document.querySelector("#resultadoTipo");

btnComparar.addEventListener("click", compararValores);

inputComparar.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        compararValores();
    }
});

function compararValores() {
    let valor = inputComparar.value; //.value sempre guarda o valor no tipo texto
    valor = valor.trim();

    if (valor === "") {
        resultadoIgual.innerText = "Digite um valor antes de comparar!";
        resultadoTipo.innerText = "";
        return;
    }

    if (valor == numeroSecreto) {
        resultadoIgual.innerText = "Comparação com ==: Iguais ✅";
    } else {
        resultadoIgual.innerText = "Comparação com ==: Erro ❌";
    }

    if (valor === numeroSecreto) {
        resultadoTipo.innerText = "Comparação com ===: Iguais ✅";
    } else {
        resultadoTipo.innerText = "Comparação com ===: Erro ❌";
    }

    console.log("Valor digitado:", valor);
    console.log("Valor guardado:", numeroSecreto);
    inputComparar.value = "";
}

// 8. INPUT + STRINGS + EXIBIÇÃO NA TELA (seção Reserva)
let input = document.querySelector("#entrada");
let botao = document.querySelector("#botao");
let resultado = document.querySelector("#resultado");

botao.addEventListener("click", executar);

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        executar();
    }
});

function executar() {
    let texto = input.value;
    console.log("Texto original:", texto);

    texto = texto.trim();
    console.log("Sem espaços:", texto);

    if (texto === "") {
        resultado.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    texto = texto.toLowerCase();
    console.log("Minúsculo:", texto);

    resultado.innerText = "Reserva anotada em nome de: " + texto;
    input.value = "";
}

// 9. KEYDOWN NO DOCUMENTO INTEIRO
let campoTecla = document.querySelector("#tecla");
document.addEventListener("keydown", function (e) {
    console.log("Tecla pressionada:", e.key);
    campoTecla.innerText = e.key;
});

// 10. ASSISTENTE VIRTUAL (if / else if / else, includes, ||, return)
let inputChat = document.querySelector("#input");
let enviar = document.querySelector("#enviar");
let msgUsuario = document.querySelector("#msg-usuario");
let chatBox = document.querySelector("#chat-box");

enviar.addEventListener("click", enviarMensagem);

inputChat.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        enviarMensagem();
    }
});

function enviarMensagem() {
    let texto = inputChat.value;
    texto = texto.trim();

    if (texto === "") {
        chatBox.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    msgUsuario.innerText = "Você: " + texto;
    texto = texto.toLowerCase();

    let resposta = analisarTexto(texto);
    console.log("Resposta gerada:", resposta);

    chatBox.innerText = resposta;
    inputChat.value = "";
}

function analisarTexto(texto) {
    if (texto.includes("bom dia")) {
        return "Bom dia! ☀️ Abrimos às 18h, mas já dá para escolher a pizza de hoje à noite!";
    }
    else if (texto.includes("boa tarde")) {
        return "Boa tarde! 🌤️ Que tal reservar uma mesa para hoje à noite?";
    }
    else if (texto.includes("boa noite")) {
        return "Boa noite! 🌙 Nosso forno já está acendendo, abrimos às 18h!";
    }
    else if (texto.includes("cardápio") || texto.includes("cardapio") || texto.includes("pizza") || texto.includes("sabor")) {
        return "Temos Margherita (R$ 42), Calabresa (R$ 46) e Quatro Queijos (R$ 52).";
    }
    else if (texto.includes("horário") || texto.includes("horario") || texto.includes("aberto")) {
        return "Abrimos todos os dias, das 18h às 23h.";
    }
    else if (texto.includes("contato") || texto.includes("whats") || texto.includes("endereço") || texto.includes("endereco")) {
        return "Fale pelo WhatsApp (seção Contato). Estamos na Rua da esquina, 123.";
    }
    else if (texto.includes("reserva") || texto.includes("mesa")) {
        return "Para reservar, use o campo da seção Reserva, logo acima do assistente!";
    }
    else if (texto.includes("site")) {
        return "Este site foi desenvolvido com HTML, CSS e JavaScript.";
    }
    else if (texto.includes("ajuda")) {
        return "Digite palavras como: oi, bom dia, cardápio, horário, contato, reserva, site...";
    }
    else if (texto.includes("oi") || texto.includes("olá") || texto.includes("ola")) {
        return "Olá! Seja bem-vindo 👋";
    }
    else {
        return "Não entendi o que você quis dizer 😅";
    }
}