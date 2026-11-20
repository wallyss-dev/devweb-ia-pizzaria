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

function escaparHtml(texto) {
    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

if (nomeUsuario === null || nomeUsuario.trim() === "") {
    nomeUsuario = "visitante";
}

nomeUsuario = formatarNome(nomeUsuario);

let mensagem = "Olá, " + nomeUsuario + "! Bem-vindo ao " + pizzaria + "!";

// 3. DOM: SELEÇÃO DE ELEMENTOS
let titulo = document.querySelector(".hero h2");
if (titulo) titulo.innerText = mensagem;

function abrirWhats(e) {
    e.preventDefault();
    alert("Você será redirecionado para o WhatsApp!");
    window.open("https://wa.me/5586999999999", "_blank");
}

let whats = document.querySelector("#whats");
if (whats) whats.addEventListener("click", abrirWhats);

let logo = document.querySelector("#logo");
if (logo) {
    logo.addEventListener("dblclick", function () {
        document.body.style.background = "#f6d8c8";
    });
}

// 4. RESERVA: CADASTRO (POST), CONSULTA (GET), ATUALIZAÇÃO (PATCH) E EXCLUSÃO CONTROLADA (DELETE)
let inputNome = document.querySelector("#entrada-nome");
let inputEmail = document.querySelector("#entrada-email");
let inputTelefone = document.querySelector("#entrada-telefone");
let inputPizza = document.querySelector("#entrada-pizza");
let inputQuantidade = document.querySelector("#entrada-quantidade");
let botao = document.querySelector("#botao");
let resultado = document.querySelector("#resultado");

let inputConsulta = document.querySelector("#entrada-consulta");
let botaoConsultar = document.querySelector("#botao-consultar");
let inputCancelar = document.querySelector("#entrada-cancelar");
let botaoCancelar = document.querySelector("#botao-cancelar");
let resultadoAcao = document.querySelector("#resultado-acao");
let resumoStatus = document.querySelector("#resumo-status");
let listaReservas = document.querySelector("#lista-reservas");

if (botao) botao.addEventListener("click", executar);
if (botaoConsultar) botaoConsultar.addEventListener("click", consultarReserva);
if (botaoCancelar) botaoCancelar.addEventListener("click", cancelarReserva);

function adicionarEventoEnter(inputElement, callback) {
    if (inputElement) {
        inputElement.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                callback();
            }
        });
    }
}
adicionarEventoEnter(inputNome, executar);
adicionarEventoEnter(inputEmail, executar);
adicionarEventoEnter(inputTelefone, executar);
adicionarEventoEnter(inputQuantidade, executar);
adicionarEventoEnter(inputConsulta, consultarReserva);
adicionarEventoEnter(inputCancelar, cancelarReserva);

async function executar() {
    let nome = inputNome.value.trim();
    let email = inputEmail.value.trim();
    let telefone = inputTelefone.value.trim();
    let produto_id = inputPizza ? inputPizza.value : "";
    let quantidade = inputQuantidade ? Number(inputQuantidade.value) : 1;

    if (nome === "" || email === "" || telefone === "" || produto_id === "") {
        resultado.innerText = "Por favor, preencha todos os campos e escolha uma pizza!";
        return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 20) {
        resultado.innerText = "Informe uma quantidade válida (entre 1 e 20).";
        return;
    }

    resultado.innerText = "Aguarde, processando sua reserva...";

    try {
        const resposta = await fetch("/api/reservas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, email, telefone, produto_id, quantidade }),
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            resultado.innerText = dados.mensagem + ` (Pedido #${dados.id_pedido})`;
            inputNome.value = "";
            inputEmail.value = "";
            inputTelefone.value = "";
            inputPizza.value = "";
            if (inputQuantidade) inputQuantidade.value = "1";
            carregarReservas();
        } else {
            resultado.innerText = "Erro: " + (dados.erro || "Não foi possível concluir a reserva.");
        }
    } catch (erro) {
        console.error("Erro na reserva:", erro);
        resultado.innerText = "Erro de conexão ao tentar reservar a mesa.";
    }
}

async function consultarReserva() {
    let email = inputConsulta.value.trim();
    if (email === "") {
        resultadoAcao.innerText = "Digite o e-mail para consultar.";
        resultadoAcao.style.color = "#a11c12";
        return;
    }

    resultadoAcao.innerText = "Consultando...";
    resultadoAcao.style.color = "#2b1a14";

    try {
        const resposta = await fetch(`/api/reservas/${encodeURIComponent(email)}`);
        const dados = await resposta.json();

        if (resposta.ok) {
            resultadoAcao.innerText = `Pedido #${dados.id} (${dados.cliente}) — ${dados.quantidade}x ${dados.pizza} | Status: ${dados.status}`;
            resultadoAcao.style.color = "#1b4f72";
        } else {
            resultadoAcao.innerText = "❌ " + (dados.erro || "Reserva não encontrada.");
            resultadoAcao.style.color = "#a11c12";
        }
    } catch (erro) {
        console.error("Erro ao consultar:", erro);
        resultadoAcao.innerText = "❌ Erro de conexão ao consultar.";
        resultadoAcao.style.color = "#a11c12";
    }
}

async function cancelarReservaPorId(idPedido) {
    resultadoAcao.innerText = `Aguarde, cancelando pedido #${idPedido}...`;
    resultadoAcao.style.color = "#2b1a14";

    try {
        const resposta = await fetch(`/api/reservas/${encodeURIComponent(idPedido)}`, {
            method: "DELETE",
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            resultadoAcao.innerText = "✅ " + dados.mensagem;
            resultadoAcao.style.color = "#1e7e34";
            if (inputCancelar) inputCancelar.value = "";
            carregarReservas();
        } else {
            resultadoAcao.innerText = "❌ Erro: " + (dados.erro || "Não foi possível cancelar.");
            resultadoAcao.style.color = "#a11c12";
        }
    } catch (erro) {
        console.error("Erro ao cancelar:", erro);
        resultadoAcao.innerText = "❌ Erro de conexão ao tentar cancelar.";
        resultadoAcao.style.color = "#a11c12";
    }
}

async function cancelarReserva() {
    let idPedido = inputCancelar.value.trim();
    if (idPedido === "") {
        resultadoAcao.innerText = "Digite o número do pedido para cancelar.";
        resultadoAcao.style.color = "#a11c12";
        return;
    }
    await cancelarReservaPorId(idPedido);
}

async function atualizarStatusReserva(idPedido, novoStatus) {
    try {
        const resposta = await fetch(`/api/reservas/${encodeURIComponent(idPedido)}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: novoStatus }),
        });
        const dados = await resposta.json();

        if (resposta.ok) {
            resultadoAcao.innerText = "✅ " + dados.mensagem;
            resultadoAcao.style.color = "#1e7e34";
            carregarReservas();
        } else {
            resultadoAcao.innerText = "❌ Erro: " + (dados.erro || "Falha ao atualizar status.");
            resultadoAcao.style.color = "#a11c12";
        }
    } catch (erro) {
        console.error("Erro ao atualizar status:", erro);
        resultadoAcao.innerText = "❌ Erro de conexão ao atualizar status.";
        resultadoAcao.style.color = "#a11c12";
    }
}

async function carregarReservas() {
    if (!listaReservas) return;

    try {
        const [respLista, respResumo] = await Promise.all([
            fetch("/api/reservas"),
            fetch("/api/reservas/resumo"),
        ]);

        if (respResumo.ok && resumoStatus) {
            const resumo = await respResumo.json();
            resumoStatus.innerText =
                resumo.length > 0
                    ? "Resumo: " + resumo.map((r) => `${r.status}: ${r.total_pedidos}`).join(" · ")
                    : "Resumo: nenhum pedido cadastrado.";
        }

        if (!respLista.ok) {
            listaReservas.innerText = "Não foi possível carregar as reservas.";
            return;
        }

        const reservas = await respLista.json();
        if (reservas.length === 0) {
            listaReservas.innerHTML = "<p>Nenhuma reserva registrada ainda.</p>";
            return;
        }

        listaReservas.innerHTML = reservas
            .map(
                (r) => `
                <div class="reserva-item">
                    <div>
                        <strong>Pedido #${escaparHtml(r.id)}</strong> · ${escaparHtml(r.cliente)} (${escaparHtml(r.email)})<br>
                        <small>${escaparHtml(r.quantidade)}x ${escaparHtml(r.pizza)} · R$ ${Number(r.total).toFixed(2)} · Status: <b>${escaparHtml(r.status)}</b></small>
                    </div>
                    <div class="reserva-botoes">
                        ${
                            r.status !== "Confirmado"
                                ? `<button type="button" class="btn-mini btn-confirmar" data-id="${escaparHtml(r.id)}">Confirmar</button>`
                                : ""
                        }
                        <button type="button" class="btn-mini btn-excluir" data-id="${escaparHtml(r.id)}">Excluir</button>
                    </div>
                </div>
            `
            )
            .join("");

        listaReservas.querySelectorAll(".btn-confirmar").forEach((btn) => {
            btn.addEventListener("click", () =>
                atualizarStatusReserva(btn.dataset.id, "Confirmado")
            );
        });
        listaReservas.querySelectorAll(".btn-excluir").forEach((btn) => {
            btn.addEventListener("click", () => cancelarReservaPorId(btn.dataset.id));
        });
    } catch (erro) {
        console.error("Erro ao carregar reservas:", erro);
        listaReservas.innerHTML = "<p>Erro de conexão ao carregar reservas.</p>";
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
adicionarEventoEnter(inputChat, enviarParaIA);

const meuSessionId = Date.now().toString();

async function enviarParaIA() {
    let texto = inputChat.value.trim();

    if (texto === "") {
        chatBox.innerText = "Digite alguma coisa antes de enviar!";
        return;
    }

    msgUsuario.innerText = "Você: " + texto;
    chatBox.innerText = "Luiza digitando...";
    inputChat.value = "";

    try {
        const resposta = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mensagem: texto, sessionId: meuSessionId }),
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            chatBox.innerText =
                dados.erro || "Desculpe, não foi possível responder agora. Tente novamente.";
            return;
        }

        chatBox.innerText = dados.resposta;
    } catch (erro) {
        console.error("Erro ao conectar com a IA:", erro);
        chatBox.innerText = "Desculpe, ocorreu um erro de conexão com o servidor.";
    }
}

// 6. INTEGRAÇÃO COM BANCO DE DADOS (Ler Cardápio e sincronizar Select de Pizzas)
async function carregarCardapio() {
    let gradeProdutos = document.querySelector("#grade-produtos");
    if (!gradeProdutos) return;

    try {
        const resposta = await fetch("/api/produtos");
        if (!resposta.ok) throw new Error("Falha ao buscar produtos");
        const produtos = await resposta.json();

        gradeProdutos.innerHTML = "";

        if (inputPizza) {
            inputPizza.innerHTML =
                '<option value="" disabled selected>Escolha uma pizza para a mesa...</option>';
        }

        produtos.forEach((produto) => {
            const precoFormatado = Number(produto.preco).toFixed(2).replace(".", ",");
            gradeProdutos.innerHTML += `
                <div class="card">
                    <h3>${escaparHtml(produto.nome)}</h3>
                    <p>Massa de longa fermentação e ingredientes selecionados.</p>
                    <span>R$ ${precoFormatado}</span>
                </div>
            `;

            if (inputPizza) {
                const opcao = document.createElement("option");
                opcao.value = produto.id;
                opcao.textContent = `${produto.nome} (R$ ${precoFormatado})`;
                inputPizza.appendChild(opcao);
            }
        });

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
carregarReservas();
