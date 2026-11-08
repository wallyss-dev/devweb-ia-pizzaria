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

function abrirWhats(e) {
    e.preventDefault();
    alert("Você será redirecionado para o WhatsApp!");
    window.open("https://wa.me/5586999999999", "_blank");
}

let whats = document.querySelector("#whats");
whats.addEventListener("click", abrirWhats);

let logo = document.querySelector("#logo");
logo.addEventListener("dblclick", function () {
    document.body.style.background = "#f6d8c8";
    console.log("Duplo clique detectado na logo!");
});

// 4. INPUT + STRINGS + EXIBIÇÃO NA TELA (seção Reserva)
let input = document.querySelector("#entrada");
let botao = document.querySelector("#botao");
let resultado = document.querySelector("#resultado");

botao.addEventListener("click", executar);

input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        executar();
    }
});

function executar() {
    let texto = input.value;
    texto = texto.trim();

    if (texto === "") {
        resultado.innerText = "Por favor, digite seu nome para reservar a mesa!";
        return;
    }

    texto = texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();

    resultado.innerText = "🍕 Tudo certo, " + texto + "! Sua mesa está reservada e o forno já está aquecendo. Te esperamos!";
    
    input.value = "";
}

// 5. INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL (GEMINI)
let inputChat = document.querySelector("#input");
let enviar = document.querySelector("#enviar");
let msgUsuario = document.querySelector("#msg-usuario");
let chatBox = document.querySelector("#chat-box");

enviar.addEventListener("click", enviarParaIA);

inputChat.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault(); // Evita recarregar a página
        enviarParaIA();
    }
});

// Cria um ID único para o usuário, assim a IA lembra do contexto da conversa
const meuSessionId = Date.now().toString();

async function enviarParaIA() {
    let texto = inputChat.value.trim();

    if (texto === "") {
        chatBox.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    // Atualiza a tela com o que o usuário digitou
    msgUsuario.innerText = "Você: " + texto;
    chatBox.innerText = "Atendente digitando...";
    inputChat.value = ""; 

    try {
        // Faz a chamada para o server.js
        const resposta = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ mensagem: texto, sessionId: meuSessionId }) 
        });

        const dados = await resposta.json();
        
        // Coloca a resposta da IA na tela
        chatBox.innerText = dados.resposta;

    } catch (erro) {
        console.error("Erro ao conectar com a IA:", erro);
        chatBox.innerText = "Desculpe, ocorreu um erro de conexão com o servidor.";
    }
}