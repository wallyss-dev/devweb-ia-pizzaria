// 1. INTRODUÇÃO: COMENTÁRIOS, console.log, alert, prompt
console.log("JavaScript conectado com sucesso!");
alert("Bem-vindo ao site Forno & Massa!");
let nomeUsuario = prompt("Qual é o seu nome?");

// 2. VARIÁVEIS (let, const), CONCATENAÇÃO, if E ===
const pizzaria = "Forno & Massa";
let anoAbertura = 2020;

function formatarNome(nome) {
    return nome ? nome.trim() : "visitante";
}

if (nomeUsuario === null || nomeUsuario.trim() === "") {
    nomeUsuario = "visitante";
}

nomeUsuario = formatarNome(nomeUsuario);

let mensagem = "Olá, " + nomeUsuario + "! Bem-vindo ao " + pizzaria + "!";

// 3. DOM: SELEÇÃO DE ELEMENTOS
let titulo = document.querySelector(".hero h2");
if(titulo) titulo.innerText = mensagem;

function abrirWhats(e) {
    e.preventDefault();
    alert("Você será redirecionado para o WhatsApp!");
    window.open("https://wa.me/5586999999999", "_blank");
}

let whats = document.querySelector("#whats");
if(whats) whats.addEventListener("click", abrirWhats);

let logo = document.querySelector("#logo");
if(logo) {
    logo.addEventListener("dblclick", function () {
        document.body.style.background = "#f6d8c8";
    });
}

// 4. INPUT + STRINGS + EXIBIÇÃO NA TELA (seção Reserva)
let inputNome = document.querySelector("#entrada-nome");
let inputEmail = document.querySelector("#entrada-email");
let inputTelefone = document.querySelector("#entrada-telefone");
let botao = document.querySelector("#botao");
let resultado = document.querySelector("#resultado");

if (botao) {
    botao.addEventListener("click", executar);
}

function adicionarEventoEnter(inputElement) {
    if (inputElement) {
        inputElement.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                executar();
            }
        });
    }
}
adicionarEventoEnter(inputNome);
adicionarEventoEnter(inputEmail);
adicionarEventoEnter(inputTelefone);

async function executar() {
    let nome = inputNome.value.trim();
    let email = inputEmail.value.trim();
    let telefone = inputTelefone.value.trim();

    if (nome === "" || email === "" || telefone === "") {
        resultado.innerText = "Por favor, preencha todos os campos para reservar a mesa!";
        return;
    }

    resultado.innerText = "Aguarde, processando sua reserva...";

    try {
        const resposta = await fetch('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome, email: email, telefone: telefone })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            resultado.innerText = dados.mensagem + ` (Pedido #${dados.id_pedido})`;
            inputNome.value = "";
            inputEmail.value = "";
            inputTelefone.value = "";
        } else {
            resultado.innerText = "Erro: " + dados.erro;
        }
    } catch (erro) {
        console.error("Erro na reserva:", erro);
        resultado.innerText = "Erro de conexão ao tentar reservar a mesa.";
    }
}

// Lógica de Exclusão Controlada (Cancelar Reserva)
let inputCancelar = document.querySelector("#entrada-cancelar");
let botaoCancelar = document.querySelector("#botao-cancelar");
let resultadoCancelar = document.querySelector("#resultado-cancelar");

if (botaoCancelar) {
    botaoCancelar.addEventListener("click", cancelarReserva);
}

async function cancelarReserva() {
    let idPedido = inputCancelar.value.trim();

    if (idPedido === "") {
        resultadoCancelar.innerText = "Por favor, digite o número do pedido para cancelar.";
        resultadoCancelar.style.color = "red";
        return;
    }

    resultadoCancelar.innerText = "Aguarde, cancelando...";
    resultadoCancelar.style.color = "black";

    try {
        const resposta = await fetch(`/api/reservas/${idPedido}`, {
            method: 'DELETE'
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            resultadoCancelar.innerText = "✅ " + dados.mensagem;
            resultadoCancelar.style.color = "green";
            inputCancelar.value = "";
        } else {
            resultadoCancelar.innerText = "❌ Erro: " + dados.erro;
            resultadoCancelar.style.color = "red";
        }
    } catch (erro) {
        console.error("Erro ao cancelar:", erro);
        resultadoCancelar.innerText = "❌ Erro de conexão ao tentar cancelar.";
        resultadoCancelar.style.color = "red";
    }
}

// 5. INTEGRAÇÃO COM INTELIGÊNCIA ARTIFICIAL (GEMINI)
let inputChat = document.querySelector("#input");
let enviar = document.querySelector("#enviar");
let msgUsuario = document.querySelector("#msg-usuario");
let chatBox = document.querySelector("#chat-box");

if (enviar) {
    enviar.addEventListener("click", enviarParaIA);
}

if (inputChat) {
    inputChat.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault(); 
            enviarParaIA();
        }
    });
}

const meuSessionId = Date.now().toString();

async function enviarParaIA() {
    let texto = inputChat.value.trim();

    if (texto === "") {
        chatBox.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    msgUsuario.innerText = "Você: " + texto;
    chatBox.innerText = "Atendente digitando...";
    inputChat.value = ""; 

    try {
        const resposta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mensagem: texto, sessionId: meuSessionId }) 
        });

        const dados = await resposta.json();
        
        // Verifica se a resposta foi um sucesso ou um erro
        if (resposta.ok) {
            chatBox.innerText = dados.resposta;
        } else {
            chatBox.innerText = "❌ Erro do servidor: " + dados.erro;
        }

    } catch (erro) {
        console.error("Erro ao conectar com a IA:", erro);
        chatBox.innerText = "Desculpe, ocorreu um erro de conexão com o servidor.";
    }
} 

// 6. INTEGRAÇÃO COM BANCO DE DADOS (Ler Cardápio)
async function carregarCardapio() {
    let gradeProdutos = document.querySelector("#grade-produtos");
    if (!gradeProdutos) return;

    try {
        const resposta = await fetch('/api/produtos');
        const produtos = await resposta.json();
        
        gradeProdutos.innerHTML = ""; 
        
        produtos.forEach(produto => {
            // A tabela produto não tem a coluna "ingredientes", colocamos um texto padrão
            gradeProdutos.innerHTML += `
                <div class="card">
                    <h3>${produto.nome}</h3>
                    <p>Massa de longa fermentação e ingredientes selecionados.</p>
                    <span>R$ ${produto.preco}</span>
                </div>
            `;
        });

        // Eventos cards gerados dinamicamente
        let cardsDinamicos = document.querySelectorAll("#grade-produtos .card");
        cardsDinamicos.forEach(function (card) {
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

    } catch (erro) {
        console.error("Erro ao carregar cardápio:", erro);
        gradeProdutos.innerHTML = "<p>Desculpe, o cardápio está indisponível no momento.</p>";
    }
}

carregarCardapio();