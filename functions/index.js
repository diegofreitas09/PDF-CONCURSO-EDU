const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

const OPENAI_API_KEY = defineSecret("OPENAI_API_KEY");
const ALLOWED_ORIGINS = new Set([
  "https://diegofreitas09.github.io",
  "http://localhost:5173",
]);

const SYSTEM_PROMPT = `Você é o Assistente IA do PDF CONCURSO EDU. Responda em português brasileiro, com foco em concursos públicos e educação. Seja didático, objetivo e confiável. Quando o usuário pedir resolução de questão, explique o raciocínio e indique a alternativa correta. Quando houver dúvida sobre legislação, deixe claro que a norma pode ter sido atualizada e recomende conferir a fonte oficial. Não invente leis, artigos, autores ou dados.`;

function setCors(req, res) {
  const origin = req.get("origin");
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
  }
  res.set("Vary", "Origin");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function extractText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks = [];
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === "output_text" && typeof content.text === "string") {
        chunks.push(content.text);
      }
    }
  }
  return chunks.join("\n").trim();
}

exports.aiChat = onRequest(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (req, res) => {
    setCors(req, res);

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }

    if (req.method === "GET") {
      return res.status(200).json({ ok: true, provider: "openai", model: "gpt-5.4-mini" });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido." });
    }

    try {
      const authHeader = req.get("authorization") || "";
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ error: "Usuário não autenticado." });

      await getAuth().verifyIdToken(token);

      const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const messages = incoming
        .filter((m) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));

      if (!messages.length) {
        return res.status(400).json({ error: "Envie pelo menos uma mensagem." });
      }

      const input = messages.map((m) => ({
        role: m.role,
        content: [{ type: "input_text", text: m.content }],
      }));

      const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY.value()}`,
        },
        body: JSON.stringify({
          model: "gpt-5.4-mini",
          instructions: SYSTEM_PROMPT,
          input,
          max_output_tokens: 1200,
        }),
      });

      const data = await openaiResponse.json();
      if (!openaiResponse.ok) {
        console.error("OpenAI error", data);
        return res.status(openaiResponse.status).json({ error: data?.error?.message || "Falha ao consultar a OpenAI." });
      }

      const text = extractText(data);
      if (!text) return res.status(502).json({ error: "A OpenAI não retornou texto." });

      return res.status(200).json({ message: { role: "assistant", content: text }, model: "gpt-5.4-mini" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno do Assistente IA." });
    }
  }
);
