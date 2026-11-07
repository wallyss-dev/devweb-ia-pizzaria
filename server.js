// ---------------------------------------------------------------------
// 0) IMPORTAÇÕES
// ---------------------------------------------------------------------
import express from "express";                    // cria o servidor web
import dotenv from "dotenv";                      // lê a chave do arquivo .env
import { GoogleGenAI } from "@google/genai";      // conversa com o Gemini
import { PERSONA, CONHECIMENTO, REGRAS } from "./persona.js"; // sua persona ✏️

// Carrega o arquivo .env (a partir daqui existe process.env.GEMINI_API_KEY).
dotenv.config({ quiet: true });

// ---------------------------------------------------------------------
// 1) CONFIGURAÇÕES
// ---------------------------------------------------------------------
const PORTA = 3000; // o site abrirá em http://localhost:3000

// Modelo do Gemini. Se um dia der "model not found", troque só esta linha
// por um nome da lista: https://ai.google.dev/gemini-api/docs/models
const MODELO = "gemini-3.7-flash";

// Aviso no terminal se a chave não foi configurada.
if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "\n⚠️  GEMINI_API_KEY não encontrada!\n" +
      "   Crie o arquivo .env (fora da pasta public) com a linha:\n" +
      "   GEMINI_API_KEY=sua_chave_aqui\n"
  );
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const app = express();

app.use(express.json());           // entende JSON enviado pelo navegador
app.use(express.static("public")); // entrega o seu site (pasta public)

// ---------------------------------------------------------------------
// 2) MONTANDO A INSTRUÇÃO DE SISTEMA A PARTIR DO persona.js
// ---------------------------------------------------------------------
// É o "treinamento" que o atendente recebe. Vai junto em TODA pergunta,
// mas o cliente nunca vê este texto.
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

// ---------------------------------------------------------------------
// 3) HISTÓRICO DAS CONVERSAS (memória de curto prazo)
// ---------------------------------------------------------------------
// Cada visitante tem um código (sessionId). Guardamos a conversa dele
// para que a IA entenda perguntas como "e quanto custa ISSO?".
// ⚠️ Fica na memória RAM: se o servidor desligar, as conversas somem.
const historicos = new Map();

function pegarHistorico(sessionId) {
  if (!historicos.has(sessionId)) historicos.set(sessionId, []);
  return historicos.get(sessionId);
}

// ---------------------------------------------------------------------
// 4) ROTA DO CHAT: POST /api/chat  (o script.js chama este endereço)
// ---------------------------------------------------------------------
app.post("/api/chat", async (req, res) => {
  const { mensagem, sessionId } = req.body;

  // Validações antes de gastar uma chamada à API.
  if (!mensagem?.trim()) {
    return res.status(400).json({ erro: "Mensagem vazia." });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ erro: "A chave do Gemini não está configurada no .env." });
  }

  const historico = pegarHistorico(sessionId || "anonimo");
  const tamanhoAntes = historico.length; // para desfazer se der erro
  historico.push({ role: "user", parts: [{ text: mensagem }] });

  try {
    let textoFinal = "";

    // Apenas 1 chamada direta para a IA gerar o conteúdo (sem ferramentas)
    const resposta = await ai.models.generateContent({
      model: MODELO,
      contents: historico, // a conversa inteira (contexto)
      config: {
        systemInstruction: INSTRUCAO_DE_SISTEMA, // a persona
      },
    });

    // Guarda a resposta da IA no histórico.
    const conteudo = resposta.candidates?.[0]?.content;
    if (conteudo) historico.push(conteudo);

    textoFinal = resposta.text ?? ""; 

    return res.json({
      resposta: textoFinal || "Desculpe, não consegui responder agora. Pode repetir?",
    });
  } catch (erro) {
    console.error("❌ Erro ao falar com o Gemini:", erro); // o erro completo aparece no terminal
    historico.length = tamanhoAntes; // desfaz para não quebrar o histórico
    return res.status(500).json({ erro: erro?.message || "Falha ao falar com o Gemini." });
  }
});

// ---------------------------------------------------------------------
// 5) LIGAR O SERVIDOR
// ---------------------------------------------------------------------
app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome}`);
});