import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Settings2, Trash2, Wifi, WifiOff, Sparkles } from "lucide-react";
import "../styles/assistant.css";

const CHAT_KEY = "pdf-concurso-edu-ai-chat";
const CONFIG_KEY = "pdf-concurso-edu-ai-config";

const DEFAULT_CONFIG = {
  endpoint: "http://127.0.0.1:11434",
  model: "llama3.2",
};

const SYSTEM_PROMPT = `Você é o Assistente IA do PDF CONCURSO EDU. Responda em português brasileiro, com foco em concursos públicos e educação. Seja didático, objetivo e confiável. Quando o usuário pedir resolução de questão, explique o raciocínio e indique a alternativa correta. Quando houver dúvida sobre legislação, deixe claro que a norma pode ter sido atualizada e recomende conferir a fonte oficial. Não invente leis, artigos, autores ou dados.`;

function readJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export default function AssistenteIA() {
  const [messages, setMessages] = useState(() => readJSON(CHAT_KEY, []));
  const [config, setConfig] = useState(() => readJSON(CONFIG_KEY, DEFAULT_CONFIG));
  const [draftConfig, setDraftConfig] = useState(config);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("unknown");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    testConnection(config);
  }, [config]);

  async function testConnection(target = config) {
    try {
      const response = await fetch(`${target.endpoint.replace(/\/$/, "")}/api/tags`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Servidor indisponível");
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  }

  async function sendMessage(event) {
    event?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const userMessage = { role: "user", content: text, at: Date.now() };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    try {
      const response = await fetch(`${config.endpoint.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model,
          stream: false,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...nextMessages.map(({ role, content }) => ({ role, content })),
          ],
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `Erro ${response.status}`);
      }

      const data = await response.json();
      const answer = data?.message?.content || data?.response || "O modelo não retornou conteúdo.";
      setMessages((current) => [...current, { role: "assistant", content: answer, at: Date.now() }]);
      setStatus("online");
    } catch (error) {
      setStatus("offline");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          error: true,
          content: `Não consegui conectar ao Ollama. Verifique se ele está aberto, se o modelo “${config.model}” está instalado e se o endereço ${config.endpoint} está acessível.`,
          at: Date.now(),
        },
      ]);
      console.error(error);
    } finally {
      setSending(false);
    }
  }

  function saveConfig(event) {
    event.preventDefault();
    const endpoint = draftConfig.endpoint.trim().replace(/\/$/, "") || DEFAULT_CONFIG.endpoint;
    const model = draftConfig.model.trim() || DEFAULT_CONFIG.model;
    const next = { endpoint, model };
    setConfig(next);
    setDraftConfig(next);
    setSettingsOpen(false);
  }

  function clearChat() {
    if (!messages.length || window.confirm("Apagar toda a conversa com o Assistente IA?")) {
      setMessages([]);
    }
  }

  return (
    <section className="page ai-page">
      <div className="ai-header">
        <div className="ai-title-group">
          <div className="ai-icon"><Bot size={26} /></div>
          <div>
            <div className="page-eyebrow">INTELIGÊNCIA ARTIFICIAL</div>
            <h1>Assistente IA</h1>
            <p>Estude, revise conteúdos e resolva questões com seu modelo Llama via Ollama.</p>
          </div>
        </div>

        <div className="ai-header-actions">
          <button type="button" className={`ai-status ${status}`} onClick={() => testConnection()}>
            {status === "online" ? <Wifi size={16} /> : <WifiOff size={16} />}
            {status === "online" ? "Ollama conectado" : "Ollama desconectado"}
          </button>
          <button type="button" className="ai-icon-button" onClick={() => setSettingsOpen((value) => !value)} title="Configurar Ollama">
            <Settings2 size={18} />
          </button>
          <button type="button" className="ai-icon-button danger" onClick={clearChat} title="Limpar conversa">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {settingsOpen && (
        <form className="ai-settings" onSubmit={saveConfig}>
          <label>
            Endereço do Ollama
            <input value={draftConfig.endpoint} onChange={(e) => setDraftConfig((c) => ({ ...c, endpoint: e.target.value }))} placeholder="http://127.0.0.1:11434" />
          </label>
          <label>
            Modelo
            <input value={draftConfig.model} onChange={(e) => setDraftConfig((c) => ({ ...c, model: e.target.value }))} placeholder="llama3.2" />
          </label>
          <button className="primary-button" type="submit">Salvar conexão</button>
        </form>
      )}

      <div className="ai-shell">
        <div className="ai-chat">
          {messages.length === 0 ? (
            <div className="ai-empty">
              <div className="ai-empty-icon"><Sparkles size={30} /></div>
              <h2>Como posso ajudar nos seus estudos?</h2>
              <p>Você pode pedir explicações, resumos, questões, correções ou revisões para concurso.</p>
              <div className="ai-suggestions">
                {["Explique a LDB de forma resumida", "Crie 5 questões de conhecimentos pedagógicos", "Revise crase comigo", "Monte um plano de estudo para hoje"].map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => setInput(suggestion)}>{suggestion}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="ai-messages">
              {messages.map((message, index) => (
                <div className={`ai-message ${message.role} ${message.error ? "error" : ""}`} key={`${message.at}-${index}`}>
                  <div className="ai-avatar">{message.role === "user" ? "DF" : <Bot size={17} />}</div>
                  <div className="ai-bubble">
                    <strong>{message.role === "user" ? "Você" : "Assistente IA"}</strong>
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              {sending && (
                <div className="ai-message assistant">
                  <div className="ai-avatar"><Bot size={17} /></div>
                  <div className="ai-bubble"><strong>Assistente IA</strong><p className="ai-thinking">Pensando...</p></div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <form className="ai-composer" onSubmit={sendMessage}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
            placeholder="Pergunte sobre legislação, português, filosofia, pedagogia..."
            rows={2}
          />
          <button type="submit" disabled={!input.trim() || sending} aria-label="Enviar mensagem"><Send size={19} /></button>
        </form>
        <div className="ai-model-note">Modelo atual: <strong>{config.model}</strong> · As respostas de IA podem conter erros; confira normas e fontes oficiais.</div>
      </div>
    </section>
  );
}
