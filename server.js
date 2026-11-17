
// 0) IMPORTAÇÕES

import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js";
import pg from "pg";

dotenv.config({ quiet: true });


// 1) CONFIGURAÇÕES GERAIS E BANCO DE DADOS

const PORTA = 3000;
const MODELO = "gemini-2.5-flash";

if (!process.env.GEMINI_API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY não encontrada no .env!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

// IMPORTANTE: O express.json() tem que vir ANTES das rotas!
app.use(express.json());           
app.use(express.static("public")); 

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});


// 2) ROTAS DO BANCO DE DADOS


// Ler produtos
app.get("/api/produtos", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM produto WHERE disponibilidade = true ORDER BY id");
        res.json(result.rows);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar produtos no banco" });
    }
});

// Salvar reserva/cliente
app.post("/api/reservas", async (req, res) => {
    const { nome, email, telefone } = req.body;
    
    if (!nome || !email || !telefone) {
        return res.status(400).json({ erro: "Nome, e-mail e telefone são obrigatórios." });
    }

    try {
        let clienteId;

        // Verifica se o cliente já existe pelo email (para respeitar a regra UNIQUE da tabela)
        const clienteExistente = await pool.query("SELECT id FROM cliente WHERE email = $1", [email]);
        
        if (clienteExistente.rows.length > 0) {
            clienteId = clienteExistente.rows[0].id;
        } else {
            // Insere novo cliente
            const resultCliente = await pool.query(
                "INSERT INTO cliente (nome, email, telefone) VALUES ($1, $2, $3) RETURNING id",
                [nome, email, telefone]
            );
            clienteId = resultCliente.rows[0].id;
        }

        // Insere o pedido
        const resultPedido = await pool.query(
            "INSERT INTO pedido (cliente_id, status) VALUES ($1, 'Pendente') RETURNING id",
            [clienteId]
        );

        res.json({ 
            mensagem: `🍕 Tudo certo, ${nome}! Sua mesa está reservada.`, 
            id_pedido: resultPedido.rows[0].id 
        });
    } catch (erro) {
        console.error("Erro ao salvar no banco:", erro);
        res.status(500).json({ erro: "Erro ao gravar dados no banco." });
    }
});

// Rota para cancelar/excluir (Exclusão controlada exigida)
app.delete("/api/reservas/:id", async (req, res) => {
    const { id } = req.params;
    try {
        // Exclui primeiro os itens (se existirem), depois o pedido, respeitando chaves estrangeiras
        await pool.query("DELETE FROM item_pedido WHERE pedido_id = $1", [id]);
        await pool.query("DELETE FROM pedido WHERE id = $1", [id]);
        res.json({ mensagem: "Reserva cancelada com sucesso" });
    } catch (erro) {
        console.error("Erro ao excluir reserva:", erro);
        res.status(500).json({ erro: "Erro ao excluir reserva no banco." });
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

function pegarHistorico(sessionId) {
  if (!historicos.has(sessionId)) historicos.set(sessionId, []);
  return historicos.get(sessionId);
}

app.post("/api/chat", async (req, res) => {
  const { mensagem, sessionId } = req.body;

  if (!mensagem?.trim()) {
    return res.status(400).json({ erro: "Mensagem vazia." });
  }

  const historico = pegarHistorico(sessionId || "anonimo");
  const tamanhoAntes = historico.length; 
  historico.push({ role: "user", parts: [{ text: mensagem }] });

  try {
    const resposta = await ai.models.generateContent({
      model: MODELO,
      contents: historico,
      config: { systemInstruction: INSTRUCAO_DE_SISTEMA },
    });

    const conteudo = resposta.candidates?.[0]?.content;
    if (conteudo) historico.push(conteudo);

    return res.json({ resposta: resposta.text ?? "" });
  } catch (erro) {
    console.error("❌ Erro ao falar com o Gemini:", erro); 
    historico.length = tamanhoAntes; 
    return res.status(500).json({ erro: "Falha ao falar com o Gemini." });
  }
});


// 4) LIGAR O SERVIDOR

app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome}`);
});