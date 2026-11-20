// 0) IMPORTAÇÕES
import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";
import pg from "pg";

dotenv.config({ quiet: true });

// 1) CONFIGURAÇÕES GERAIS E BANCO DE DADOS
const PORTA = process.env.PORT || 3000;
const MODELO_PRIMARIO = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const MODELO_RESERVA = process.env.GEMINI_MODEL_RESERVA || "gemini-3.1-flash-lite";
const STATUS_VALIDOS = ["Pendente", "Confirmado", "Cancelado"];
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY não encontrada no .env!");
}
if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL não encontrada no .env!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

// Middlewares (devem vir antes das rotas)
app.use(express.json());
app.use(express.static("public"));

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000, // Tolera cold start do Neon.tech
  idleTimeoutMillis: 30000,
  max: 10,
});

// Evita queda do servidor se uma conexão ociosa for encerrada quando o Neon hibernar
pool.on("error", (erro) => {
  console.error("⚠️ Erro em conexão ociosa do pool PostgreSQL:", erro.message);
});

// Helper para validar IDs e inteiros positivos
const MAX_INT4 = 2147483647;
function parseInteiroPositivo(valor) {
  if (typeof valor === "number" && Number.isInteger(valor) && valor > 0 && valor <= MAX_INT4) {
    return valor;
  }
  if (typeof valor === "string" && /^\d{1,10}$/.test(valor.trim())) {
    const num = Number.parseInt(valor.trim(), 10);
    return num > 0 && num <= MAX_INT4 ? num : null;
  }
  return null;
}

// 2) ROTAS DO BANCO DE DADOS

// GET /api/produtos — Consulta produtos disponíveis para o cardápio
app.get("/api/produtos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nome, preco, disponibilidade FROM produto WHERE disponibilidade = true ORDER BY id"
    );
    return res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao buscar produtos:", erro);
    return res.status(500).json({ erro: "Erro ao buscar produtos no banco." });
  }
});

// POST /api/produtos — Cadastro validado de novo produto (atende 3.4)
app.post("/api/produtos", async (req, res) => {
  const { nome, preco, disponibilidade = true } = req.body ?? {};

  if (typeof nome !== "string" || !nome.trim() || nome.trim().length > 100) {
    return res
      .status(400)
      .json({ erro: "Nome do produto é obrigatório e deve ter até 100 caracteres." });
  }

  const precoNum = Number(preco);
  if (!Number.isFinite(precoNum) || precoNum <= 0) {
    return res
      .status(400)
      .json({ erro: "Preço deve ser um número maior que zero." });
  }

  if (typeof disponibilidade !== "boolean") {
    return res
      .status(400)
      .json({ erro: "Disponibilidade deve ser booleano (true ou false)." });
  }

  try {
    const result = await pool.query(
      "INSERT INTO produto (nome, preco, disponibilidade) VALUES ($1, $2, $3) RETURNING id, nome, preco, disponibilidade",
      [nome.trim(), precoNum.toFixed(2), disponibilidade]
    );
    return res.status(201).json(result.rows[0]);
  } catch (erro) {
    console.error("Erro ao cadastrar produto:", erro);
    return res.status(500).json({ erro: "Erro ao cadastrar produto no banco." });
  }
});

// GET /api/reservas — Consulta de pedidos com JOIN nas 4 tabelas (atende 3.5 e 3.10)
app.get("/api/reservas", async (req, res) => {
  try {
    const query = `
      SELECT
        p.id,
        c.nome AS cliente,
        c.email,
        c.telefone,
        pr.nome AS pizza,
        ip.quantidade,
        (pr.preco * ip.quantidade) AS total,
        p.status,
        p.data_pedido
      FROM pedido p
      JOIN cliente c ON p.cliente_id = c.id
      JOIN item_pedido ip ON p.id = ip.pedido_id
      JOIN produto pr ON ip.produto_id = pr.id
      ORDER BY p.data_pedido DESC, p.id DESC
      LIMIT 20;
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao listar reservas:", erro);
    return res.status(500).json({ erro: "Erro ao listar reservas no banco." });
  }
});

// GET /api/reservas/resumo — Consulta de agregação (GROUP BY) usada pelo sistema (atende 3.10)
// IMPORTANTE: deve ficar ANTES de /api/reservas/:email
app.get("/api/reservas/resumo", async (req, res) => {
  try {
    const query = `
      SELECT status, COUNT(id)::int AS total_pedidos
      FROM pedido
      GROUP BY status
      ORDER BY total_pedidos DESC;
    `;
    const result = await pool.query(query);
    return res.json(result.rows);
  } catch (erro) {
    console.error("Erro ao gerar resumo de reservas:", erro);
    return res.status(500).json({ erro: "Erro ao consultar resumo de pedidos." });
  }
});

// GET /api/reservas/:email — Consulta da última reserva por e-mail
app.get("/api/reservas/:email", async (req, res) => {
  const email = (req.params.email || "").trim();

  if (!REGEX_EMAIL.test(email) || email.length > 100) {
    return res.status(400).json({ erro: "Informe um e-mail válido para consulta." });
  }

  try {
    const query = `
      SELECT
        p.id,
        c.nome AS cliente,
        p.status,
        pr.nome AS pizza,
        ip.quantidade,
        p.data_pedido
      FROM pedido p
      JOIN cliente c ON p.cliente_id = c.id
      JOIN item_pedido ip ON p.id = ip.pedido_id
      JOIN produto pr ON ip.produto_id = pr.id
      WHERE LOWER(c.email) = LOWER($1)
      ORDER BY p.data_pedido DESC, p.id DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length > 0) {
      return res.json(result.rows[0]);
    }
    return res
      .status(404)
      .json({ erro: "Nenhuma reserva encontrada para este e-mail." });
  } catch (erro) {
    console.error("Erro na consulta de reserva:", erro);
    return res.status(500).json({ erro: "Erro ao consultar reserva no banco." });
  }
});

// POST /api/reservas — Salva cliente + pedido + item_pedido em TRANSAÇÃO real (pool.connect)
app.post("/api/reservas", async (req, res) => {
  const { nome, email, telefone, produto_id, quantidade = 1 } = req.body ?? {};

  // Validações no servidor (atende 3.7)
  if (typeof nome !== "string" || !nome.trim() || nome.trim().length > 100) {
    return res
      .status(400)
      .json({ erro: "Nome é obrigatório e deve ter no máximo 100 caracteres." });
  }
  if (
    typeof email !== "string" ||
    !REGEX_EMAIL.test(email.trim()) ||
    email.trim().length > 100
  ) {
    return res
      .status(400)
      .json({ erro: "E-mail inválido ou acima de 100 caracteres." });
  }
  if (
    typeof telefone !== "string" ||
    telefone.trim().length < 8 ||
    telefone.trim().length > 20
  ) {
    return res
      .status(400)
      .json({ erro: "Telefone é obrigatório (entre 8 e 20 caracteres)." });
  }

  const produtoIdNum = parseInteiroPositivo(produto_id);
  if (!produtoIdNum) {
    return res
      .status(400)
      .json({ erro: "Selecione uma pizza válida (produto_id inteiro positivo)." });
  }

  const quantidadeNum = parseInteiroPositivo(quantidade);
  if (!quantidadeNum || quantidadeNum > 20) {
    return res
      .status(400)
      .json({ erro: "Quantidade deve ser um número inteiro entre 1 e 20." });
  }

  const nomeLimpo = nome.trim();
  const emailLimpo = email.trim().toLowerCase();
  const telefoneLimpo = telefone.trim();

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Garante que o produto existe e está disponível antes de gravar
    const produtoCheck = await client.query(
      "SELECT id, nome FROM produto WHERE id = $1 AND disponibilidade = true",
      [produtoIdNum]
    );
    if (produtoCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ erro: "Pizza selecionada não encontrada ou indisponível." });
    }

    // Reutiliza cliente existente pelo e-mail (respeitando UNIQUE) ou cadastra novo
    let clienteId;
    const clienteExistente = await client.query(
      "SELECT id FROM cliente WHERE LOWER(email) = LOWER($1)",
      [emailLimpo]
    );

    if (clienteExistente.rows.length > 0) {
      clienteId = clienteExistente.rows[0].id;
    } else {
      const resultCliente = await client.query(
        "INSERT INTO cliente (nome, email, telefone) VALUES ($1, $2, $3) RETURNING id",
        [nomeLimpo, emailLimpo, telefoneLimpo]
      );
      clienteId = resultCliente.rows[0].id;
    }

    // Cria o pedido vinculado ao cliente
    const resultPedido = await client.query(
      "INSERT INTO pedido (cliente_id, status) VALUES ($1, 'Pendente') RETURNING id",
      [clienteId]
    );
    const pedidoId = resultPedido.rows[0].id;

    // Grava na tabela associativa N:N (item_pedido)
    await client.query(
      "INSERT INTO item_pedido (pedido_id, produto_id, quantidade) VALUES ($1, $2, $3)",
      [pedidoId, produtoIdNum, quantidadeNum]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      mensagem: `Tudo certo, ${nomeLimpo}! Sua mesa e ${quantidadeNum}x ${produtoCheck.rows[0].nome} estão reservadas.`,
      id_pedido: pedidoId,
    });
  } catch (erro) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    console.error("Erro ao salvar reserva no banco:", erro);
    return res.status(500).json({ erro: "Erro ao gravar dados no banco." });
  } finally {
    if (client) client.release();
  }
});

// PATCH /api/reservas/:id/status — Atualização controlada de status (atende 3.6)
app.patch("/api/reservas/:id/status", async (req, res) => {
  const pedidoId = parseInteiroPositivo(req.params.id);
  const { status } = req.body ?? {};

  if (!pedidoId) {
    return res.status(400).json({ erro: "ID do pedido deve ser um inteiro positivo." });
  }

  if (!STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({
      erro: `Status inválido. Use um dos valores: ${STATUS_VALIDOS.join(", ")}.`,
    });
  }

  try {
    const result = await pool.query(
      "UPDATE pedido SET status = $1 WHERE id = $2 RETURNING id, status",
      [status, pedidoId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ erro: "Pedido não encontrado." });
    }

    return res.json({
      mensagem: `Status do pedido #${pedidoId} atualizado para ${status}.`,
      pedido: result.rows[0],
    });
  } catch (erro) {
    console.error("Erro ao atualizar status:", erro);
    return res.status(500).json({ erro: "Erro ao atualizar status no banco." });
  }
});

// DELETE /api/reservas/:id — Exclusão controlada em transação (apaga item_pedido -> pedido; mantém cliente)
app.delete("/api/reservas/:id", async (req, res) => {
  const pedidoId = parseInteiroPositivo(req.params.id);

  if (!pedidoId) {
    return res
      .status(400)
      .json({ erro: "ID do pedido inválido. Informe um número inteiro positivo." });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    await client.query("DELETE FROM item_pedido WHERE pedido_id = $1", [pedidoId]);
    const result = await client.query(
      "DELETE FROM pedido WHERE id = $1 RETURNING id",
      [pedidoId]
    );

    if (result.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ erro: `Pedido #${pedidoId} não encontrado.` });
    }

    await client.query("COMMIT");
    return res.json({
      mensagem: `Reserva #${pedidoId} cancelada com sucesso (cadastro do cliente preservado).`,
    });
  } catch (erro) {
    if (client) {
      await client.query("ROLLBACK").catch(() => {});
    }
    console.error("Erro ao excluir reserva:", erro);
    return res.status(500).json({ erro: "Erro ao excluir reserva no banco." });
  } finally {
    if (client) client.release();
  }
});

// 3) ROTA E LÓGICA DA INTELIGÊNCIA ARTIFICIAL
const INSTRUCAO_DE_SISTEMA = `
Você é ${PERSONA.nome}, atendente virtual da ${PERSONA.empresa} (${PERSONA.ramo}).
Seu objetivo: ${PERSONA.objetivo}.
Seu tom: ${PERSONA.tom}

=== CONHECIMENTO DA EMPRESA ===
${CONHECIMENTO}

=== REGRAS ===
${REGRAS.map((regra, i) => `${i + 1}. ${regra}`).join("\n")}

Escreva em texto simples, sem markdown (não use **, # ou tabelas).
`;

const historicos = new Map();
const MAX_MENSAGENS_HISTORICO = 20;

function pegarHistorico(sessionId) {
  if (!historicos.has(sessionId)) historicos.set(sessionId, []);
  return historicos.get(sessionId);
}

async function gerarRespostaGemini(historico) {
  const config = { systemInstruction: INSTRUCAO_DE_SISTEMA };
  try {
    return await ai.models.generateContent({
      model: MODELO_PRIMARIO,
      contents: historico,
      config,
    });
  } catch (erroPrimario) {
    const status = erroPrimario?.status || erroPrimario?.code;
    const msg = String(erroPrimario?.message || "");
    const podeTentarReserva =
      status === 503 || status === 404 ||
      msg.includes("503") || msg.includes("UNAVAILABLE") ||
      msg.includes("404") || msg.includes("NOT_FOUND");

    if (podeTentarReserva) {
      console.warn(`⚠️ ${MODELO_PRIMARIO} indisponível. Tentando ${MODELO_RESERVA}...`);
      return await ai.models.generateContent({
        model: MODELO_RESERVA,
        contents: historico,
        config,
      });
    }
    throw erroPrimario;
  }
}

app.post("/api/chat", async (req, res) => {
  const { mensagem, sessionId } = req.body ?? {};

  if (typeof mensagem !== "string" || !mensagem.trim()) {
    return res.status(400).json({ erro: "Digite uma mensagem antes de enviar." });
  }
  if (mensagem.trim().length > 1000) {
    return res
      .status(400)
      .json({ erro: "Mensagem muito longa. Envie até 1000 caracteres." });
  }

  const historico = pegarHistorico(
    typeof sessionId === "string" && sessionId.trim() ? sessionId.trim() : "anonimo"
  );
  const tamanhoAntes = historico.length;
  historico.push({ role: "user", parts: [{ text: mensagem.trim() }] });

  try {
    const resposta = await gerarRespostaGemini(historico);
    const texto = (resposta.text || "").trim();

    if (!texto) {
      historico.length = tamanhoAntes;
      return res.status(502).json({
        erro: "A Luiza não conseguiu formular uma resposta agora. Tente reformular sua pergunta.",
      });
    }

    const conteudo = resposta.candidates?.[0]?.content;
    if (conteudo) historico.push(conteudo);

    // Mantém a memória enxuta
    if (historico.length > MAX_MENSAGENS_HISTORICO) {
      historico.splice(0, historico.length - MAX_MENSAGENS_HISTORICO);
    }

    return res.json({ resposta: texto });
  } catch (erro) {
    console.error("❌ Erro ao falar com o Gemini:", erro);
    historico.length = tamanhoAntes;

    const status = erro?.status || erro?.code;
    const msg = String(erro?.message || "");

    if (status === 429 || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        erro: "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente.",
      });
    }
    if (status === 503 || msg.includes("503") || msg.includes("UNAVAILABLE")) {
      return res.status(503).json({
        erro: "Nossa assistente está com alta demanda no momento. Tente novamente em instantes ou chame no WhatsApp.",
      });
    }
    return res.status(500).json({
      erro: "Não foi possível falar com a assistente agora. Tente novamente ou fale conosco pelo WhatsApp.",
    });
  }
});

app.use((erro, req, res, next) => {
  if (erro?.type === "entity.parse.failed") {
    return res.status(400).json({ erro: "JSON inválido na requisição." });
  }
  console.error("Erro não tratado:", erro);
  return res.status(500).json({ erro: "Erro interno do servidor." });
});

// 4) LIGAR O SERVIDOR
app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome} (${MODELO_PRIMARIO})`);
});