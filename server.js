// ---------------------------------------------------------------------
// 0) IMPORTAÇÕES
// ---------------------------------------------------------------------
import express from "express";                    // cria o servidor web
import dotenv from "dotenv";                      // lê a chave do arquivo .env
import fs from "fs";                              // salva arquivos (pedidos.json)
import { GoogleGenAI, Type } from "@google/genai"; // conversa com o Gemini
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
// 4) FERRAMENTA: registrar_pedido  (o que deixa o chat "funcional")
// ---------------------------------------------------------------------
// A IA não consegue salvar nada sozinha. Ela PEDE para usar esta
// ferramenta, e o NOSSO código é quem salva o pedido no arquivo pedidos.json.
const FERRAMENTAS = [
  {
    name: "registrar_pedido",
    description:
      "Registra um pedido de agendamento, orçamento ou compra quando o cliente já informou nome, telefone e o que deseja.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        nome: { type: Type.STRING, description: "Nome do cliente." },
        telefone: { type: Type.STRING, description: "Telefone ou WhatsApp do cliente." },
        pedido: { type: Type.STRING, description: "O que o cliente quer (serviço, produto, data/horário preferido)." },
      },
      required: ["nome", "telefone", "pedido"],
    },
  },
];

const ARQUIVO_PEDIDOS = "pedidos.json";

// Executa DE VERDADE a ferramenta que a IA pediu.
function executarFerramenta(chamada) {
  if (chamada.name === "registrar_pedido") {
    // Lê os pedidos que já existem (ou começa uma lista vazia).
    let pedidos = [];
    try {
      pedidos = JSON.parse(fs.readFileSync(ARQUIVO_PEDIDOS, "utf-8"));
    } catch (e) {
      pedidos = [];
    }

    // Monta o novo pedido com data e hora.
    const novo = { ...chamada.args, data: new Date().toLocaleString("pt-BR") };
    pedidos.push(novo);

    // Salva o arquivo e mostra no terminal (é aqui que a "loja" vê os pedidos).
    fs.writeFileSync(ARQUIVO_PEDIDOS, JSON.stringify(pedidos, null, 2));
    console.log("📥 NOVO PEDIDO:", novo);

    return { sucesso: true, numero_do_pedido: pedidos.length };
  }

  // Se a IA pedir uma ferramenta que não existe, nada é executado.
  return { sucesso: false, aviso: `Ferramenta inexistente: ${chamada.name}` };
}

// ---------------------------------------------------------------------
// 5) ROTA DO CHAT: POST /api/chat  (o script.js chama este endereço)
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

    // Até 3 voltas: pergunta → (talvez ferramenta) → resposta final.
    for (let volta = 1; volta <= 3; volta++) {
      const resposta = await ai.models.generateContent({
        model: MODELO,
        contents: historico, // a conversa inteira (contexto)
        config: {
          systemInstruction: INSTRUCAO_DE_SISTEMA, // a persona
          tools: [{ functionDeclarations: FERRAMENTAS }], // o que ela pode pedir
        },
      });

      // Guarda a resposta da IA no histórico.
      const conteudo = resposta.candidates?.[0]?.content;
      if (conteudo) historico.push(conteudo);

      // A IA pediu para usar uma ferramenta?
      const chamadas = resposta.functionCalls;
      if (!chamadas || chamadas.length === 0) {
        textoFinal = resposta.text ?? ""; // não pediu: esta é a resposta final
        break;
      }

      // Pediu: executamos e devolvemos o resultado para ela continuar.
      const resultados = chamadas.map((chamada) => ({
        functionResponse: {
          id: chamada.id,
          name: chamada.name,
          response: executarFerramenta(chamada),
        },
      }));
      historico.push({ role: "user", parts: resultados });
    }

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
// 6) LIGAR O SERVIDOR
// ---------------------------------------------------------------------
app.listen(PORTA, () => {
  console.log(`✅ ${PERSONA.empresa} no ar: http://localhost:${PORTA}`);
  console.log(`🤖 Atendente virtual: ${PERSONA.nome}`);
});
