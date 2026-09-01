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

const ESSAY_PROMPT = `Você atua como corretor pedagógico de redações em português brasileiro. Analise somente o que estiver legível na imagem. Primeiro transcreva a redação manuscrita com máxima fidelidade, sem completar palavras ou trechos ilegíveis por adivinhação. Marque trechos impossíveis de ler como [ilegível]. Depois avalie o texto em cinco competências inspiradas no padrão ENEM: C1 domínio da norma-padrão; C2 compreensão da proposta e desenvolvimento do tema; C3 seleção, organização e defesa de argumentos; C4 coesão e mecanismos linguísticos; C5 proposta de intervenção respeitando direitos humanos. Cada competência deve receber exclusivamente uma destas notas: 0, 40, 80, 120, 160 ou 200. Não aplique nota máxima se a imagem não permitir avaliar adequadamente a competência. Não invente repertório, citações, dados ou argumentos que não estejam no texto. Aponte acertos e problemas de maneira formativa. Retorne SOMENTE JSON válido, sem markdown, neste formato exato: {"transcription":"...","scores":[0,0,0,0,0],"competencies":[{"code":"C1","feedback":"..."},{"code":"C2","feedback":"..."},{"code":"C3","feedback":"..."},{"code":"C4","feedback":"..."},{"code":"C5","feedback":"..."}],"strengths":["..."],"improvements":["..."],"rewrite_plan":"...","general_feedback":"...","legibility":"alta|média|baixa"}.`;

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

function parseJsonText(text) {
  const cleaned = String(text || "")
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(cleaned);
}

async function verifyRequest(req, res) {
  const authHeader = req.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    res.status(401).json({ error: "Usuário não autenticado." });
    return null;
  }
  try {
    return await getAuth().verifyIdToken(token);
  } catch {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
    return null;
  }
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
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method === "GET") return res.status(200).json({ ok: true, provider: "openai", model: "gpt-5.4-mini" });
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

    try {
      if (!await verifyRequest(req, res)) return;

      const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
      const messages = incoming
        .filter((m) => ["user", "assistant"].includes(m?.role) && typeof m?.content === "string")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));

      if (!messages.length) return res.status(400).json({ error: "Envie pelo menos uma mensagem." });

      const input = messages.map((m) => ({
        role: m.role,
        content: [{ type: "input_text", text: m.content }],
      }));

      const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY.value()}` },
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

exports.corrigirRedacao = onRequest(
  {
    region: "us-central1",
    secrets: [OPENAI_API_KEY],
    timeoutSeconds: 120,
    memory: "512MiB",
  },
  async (req, res) => {
    setCors(req, res);
    if (req.method === "OPTIONS") return res.status(204).send("");
    if (req.method === "GET") return res.status(200).json({ ok: true, provider: "openai", model: "gpt-5.6-luna", capability: "essay-vision" });
    if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido." });

    try {
      if (!await verifyRequest(req, res)) return;

      const image = typeof req.body?.image === "string" ? req.body.image : "";
      const theme = typeof req.body?.theme === "string" ? req.body.theme.trim().slice(0, 500) : "";
      if (!image.startsWith("data:image/")) return res.status(400).json({ error: "Envie uma imagem válida da redação." });
      if (image.length > 9_000_000) return res.status(413).json({ error: "A imagem está muito grande. Fotografe novamente ou reduza a resolução." });

      const context = theme
        ? `Tema informado pelo candidato: ${theme}`
        : "O tema da proposta não foi informado. Avalie o desenvolvimento temático apenas pelo que puder ser inferido com segurança do texto e sinalize essa limitação no feedback da C2.";

      const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY.value()}` },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          instructions: ESSAY_PROMPT,
          input: [{
            role: "user",
            content: [
              { type: "input_text", text: `${context}\nLeia a redação fotografada, transcreva e corrija.` },
              { type: "input_image", image_url: image, detail: "high" },
            ],
          }],
          max_output_tokens: 2600,
        }),
      });

      const data = await openaiResponse.json();
      if (!openaiResponse.ok) {
        console.error("Essay OpenAI error", data);
        return res.status(openaiResponse.status).json({ error: data?.error?.message || "Falha ao analisar a redação." });
      }

      const text = extractText(data);
      let result;
      try {
        result = parseJsonText(text);
      } catch (error) {
        console.error("Essay JSON parse error", text);
        return res.status(502).json({ error: "A correção foi recebida em formato inválido. Tente novamente." });
      }

      const allowed = new Set([0, 40, 80, 120, 160, 200]);
      const scores = Array.isArray(result?.scores) ? result.scores.slice(0, 5).map(Number) : [];
      if (scores.length !== 5 || scores.some((score) => !allowed.has(score))) {
        return res.status(502).json({ error: "A IA retornou notas fora da escala esperada. Tente novamente." });
      }

      return res.status(200).json({
        ...result,
        scores,
        total: scores.reduce((sum, score) => sum + score, 0),
        model: "gpt-5.6-luna",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro interno ao corrigir a redação." });
    }
  }
);
