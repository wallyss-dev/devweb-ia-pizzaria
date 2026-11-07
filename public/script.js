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

// 10. INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL (GEMINI)
let inputChat = document.querySelector("#input");
let enviar = document.querySelector("#enviar");
let msgUsuario = document.querySelector("#msg-usuario");
let chatBox = document.querySelector("#chat-box");

// Eventos de envio
enviar.addEventListener("click", enviarParaIA);

inputChat.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault(); // Evita recarregar a página
        enviarParaIA();
    }
});

async function enviarParaIA() {
    let texto = inputChat.value.trim();

    if (texto === "") {
        chatBox.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    // 1. Atualiza a tela com a mensagem do usuário
    msgUsuario.innerText = "Você: " + texto;
    
    // Mostra que a IA está "pensando"
    chatBox.innerText = "Luigi está digitando...";
    inputChat.value = ""; // Limpa o campo

    try {
        // 2. Faz a chamada (fetch) para o seu servidor local (server.js)
        const resposta = await fetch('http://localhost:3000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensagem: texto }) // Envia o texto digitado
        });

        const dados = await resposta.json();

        // 3. Atualiza a tela com a resposta vinda do Gemini
        chatBox.innerText = dados.resposta;

    } catch (erro) {
        console.error("Erro ao conectar com a IA:", erro);
        chatBox.innerText = "Desculpe, ocorreu um erro ao conectar com o servidor. Verifique se o server.js está rodando!";
    }
}