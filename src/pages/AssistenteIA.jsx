import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, Wifi, WifiOff, Sparkles } from "lucide-react";
import "../styles/assistant.css";

const CHAT_KEY = "pdf-concurso-edu-ai-chat";
const OLLAMA_URL = "https://audience-discovered-episodes-persistent.trycloudflare.com";
const MODEL = "qwen3:8b";
const SYSTEM_PROMPT = `Você é o assistente pedagógico do PDF Concurso EDU, especializado em concursos públicos brasileiros. Responda sempre em português brasileiro, de forma didática, direta e curta. Use prioritariamente as informações fornecidas pelo usuário e pela plataforma. Não invente leis, artigos, autores, datas, gabaritos ou referências. Quando não tiver segurança, diga claramente que a informação precisa ser conferida em fonte oficial. Em questões, nunca altere o gabarito oficial informado pela plataforma; sua função é explicá-lo. Evite respostas longas quando o usuário não pedir aprofundamento.`;

function readJSON(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; }
  catch { return fallback; }
}

export default function AssistenteIA() {
  const [messages, setMessages] = useState(() => readJSON(CHAT_KEY, []));
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("unknown");
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => { testConnection(); }, []);

  async function testConnection() {
    try {
      const r = await fetch(`${OLLAMA_URL}/api/tags`);
      if (!r.ok) throw new Error();
      setStatus("online");
    } catch { setStatus("offline"); }
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMessage = { role: "user", content: text, at: Date.now() };
    const history = [...messages, userMessage];
    const assistantAt = Date.now() + 1;
    setMessages([...history, { role: "assistant", content: "", at: assistantAt, streaming: true }]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: MODEL,
          stream: true,
          think: false,
          keep_alive: "30m",
          options: {
            num_ctx: 4096,
            num_predict: 320,
            temperature: 0.2,
            top_p: 0.9
          },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...history.slice(-8).map(({ role, content }) => ({ role, content }))
          ]
        })
      });

      if (!response.ok || !response.body) throw new Error(`Erro ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            const chunk = data?.message?.content || "";
            if (chunk) {
              fullText += chunk;
              setMessages(current => current.map(m => m.at === assistantAt ? { ...m, content: fullText } : m));
            }
          } catch { /* ignora fragmento incompleto */ }
        }
      }

      if (!fullText.trim()) throw new Error("A IA não retornou conteúdo.");
      setMessages(current => current.map(m => m.at === assistantAt ? { ...m, content: fullText.trim(), streaming: false } : m));
      setStatus("online");
    } catch (error) {
      setStatus("offline");
      setMessages(current => current.map(m => m.at === assistantAt ? {
        ...m,
        streaming: false,
        error: true,
        content: error?.message || "Não consegui conectar ao Ollama pelo túnel HTTPS."
      } : m));
    } finally { setSending(false); }
  }

  function clearChat() {
    if (!messages.length || window.confirm("Apagar toda a conversa com o Assistente IA?")) setMessages([]);
  }

  return (
    <section className="page ai-page">
      <div className="ai-header">
        <div className="ai-title-group"><div className="ai-icon"><Bot size={26}/></div><div><div className="page-eyebrow">INTELIGÊNCIA ARTIFICIAL LOCAL</div><h1>Assistente IA</h1><p>Respostas locais com Ollama e Qwen3.</p></div></div>
        <div className="ai-header-actions"><button type="button" className={`ai-status ${status}`} onClick={testConnection}>{status === "online" ? <Wifi size={16}/> : <WifiOff size={16}/>} {status === "online" ? "Ollama conectado" : "Ollama desconectado"}</button><button type="button" className="ai-icon-button danger" onClick={clearChat}><Trash2 size={18}/></button></div>
      </div>

      <div className="ai-shell">
        <div className="ai-chat">
          {messages.length === 0 ? <div className="ai-empty"><div className="ai-empty-icon"><Sparkles size={30}/></div><h2>Como posso ajudar nos seus estudos?</h2><p>Peça explicações, resumos, questões e revisões.</p><div className="ai-suggestions">{["Explique a LDB de forma resumida","Crie 5 questões de conhecimentos pedagógicos","Revise crase comigo","Monte um plano de estudo para hoje"].map(s => <button key={s} type="button" onClick={() => setInput(s)}>{s}</button>)}</div></div> : <div className="ai-messages">{messages.map((m,i) => <div className={`ai-message ${m.role} ${m.error ? "error" : ""}`} key={`${m.at}-${i}`}><div className="ai-avatar">{m.role === "user" ? "DF" : <Bot size={17}/>}</div><div className="ai-bubble"><strong>{m.role === "user" ? "Você" : "Assistente IA"}</strong><p>{m.content || (m.streaming ? "Iniciando resposta..." : "")}</p></div></div>)}<div ref={endRef}/></div>}
        </div>

        <form className="ai-composer" onSubmit={sendMessage}><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(e); } }} placeholder="Pergunte sobre legislação, português, filosofia, pedagogia..." rows={2}/><button type="submit" disabled={!input.trim() || sending}><Send size={19}/></button></form>
        <div className="ai-model-note">Motor local: <strong>Ollama · {MODEL}</strong> · streaming ativado para respostas mais rápidas.</div>
      </div>
    </section>
  );
}
