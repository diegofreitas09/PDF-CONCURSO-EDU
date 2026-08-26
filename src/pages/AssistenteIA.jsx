import React, { useEffect, useRef, useState } from "react";
import { Bot, Send, Trash2, Wifi, WifiOff, Sparkles } from "lucide-react";
import { auth } from "../lib/firebase";
import "../styles/assistant.css";

const CHAT_KEY = "pdf-concurso-edu-ai-chat";
const API_URL = "https://us-central1-pdf-concurso-edu.cloudfunctions.net/aiChat";
const MODEL = "gpt-5.4-mini";

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
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("unknown");
  const endRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      const response = await fetch(API_URL, { method: "GET" });
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
      const user = auth.currentUser;
      if (!user) throw new Error("Faça login novamente para usar o Assistente IA.");
      const token = await user.getIdToken();

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || `Erro ${response.status}`);
      }

      const answer = data?.message?.content || "A IA não retornou conteúdo.";
      setMessages((current) => [...current, { role: "assistant", content: answer, at: Date.now() }]);
      setStatus("online");
    } catch (error) {
      setStatus("offline");
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          error: true,
          content: error?.message || "Não consegui conectar ao Assistente IA. Tente novamente em instantes.",
          at: Date.now(),
        },
      ]);
    } finally {
      setSending(false);
    }
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
            <p>Estude, revise conteúdos e resolva questões com IA da OpenAI.</p>
          </div>
        </div>

        <div className="ai-header-actions">
          <button type="button" className={`ai-status ${status}`} onClick={testConnection}>
            {status === "online" ? <Wifi size={16} /> : <WifiOff size={16} />}
            {status === "online" ? "OpenAI conectada" : "IA indisponível"}
          </button>
          <button type="button" className="ai-icon-button danger" onClick={clearChat} title="Limpar conversa">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="ai-shell">
        <div className="ai-chat">
          {messages.length === 0 ? (
            <div className="ai-empty">
              <div className="ai-empty-icon"><Sparkles size={30} /></div>
              <h2>Como posso ajudar nos seus estudos?</h2>
              <p>Peça explicações, resumos, questões, correções, revisões e planos de estudo.</p>
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
        <div className="ai-model-note">Modelo atual: <strong>{MODEL}</strong> · As respostas de IA podem conter erros; confira normas e fontes oficiais.</div>
      </div>
    </section>
  );
}
