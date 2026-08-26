import React, { useEffect, useMemo, useState } from "react";
import { Search, Bell, Wifi, WifiOff, X, CalendarRange, ListChecks, BookOpenText, ChartNoAxesCombined, LogOut, Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../styles/theme.css";

const STORAGE_KEY = "pdf-concurso-edu-state-v1";
const THEME_KEY = "pdf-concurso-edu-theme";

function readState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function readTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [online, setOnline] = useState(() => navigator.onLine);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [platformState, setPlatformState] = useState(readState);
  const [theme, setTheme] = useState(readTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    const sync = () => setPlatformState(readState());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", sync);
    window.addEventListener("pdfedu-state", sync);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", sync);
      window.removeEventListener("pdfedu-state", sync);
    };
  }, []);

  const notifications = useMemo(() => {
    const items = [];
    const pending = (platformState.schedule || []).filter((item) => !item.done).length;
    const answers = (platformState.answers || []).length;
    const completed = (platformState.completedTopics || []).length;

    if (pending > 0) items.push({ icon: CalendarRange, title: `${pending} estudo${pending > 1 ? "s" : ""} pendente${pending > 1 ? "s" : ""}`, text: "Abra o cronograma para continuar sua rotina.", route: "/cronograma" });
    if (answers > 0) items.push({ icon: ChartNoAxesCombined, title: `${answers} questão${answers > 1 ? "ões" : ""} respondida${answers > 1 ? "s" : ""}`, text: "Confira seus acertos e pontos de atenção.", route: "/desempenho" });
    if (completed > 0) items.push({ icon: BookOpenText, title: `${completed} tópico${completed > 1 ? "s" : ""} concluído${completed > 1 ? "s" : ""}`, text: "Continue avançando na sua trilha de estudos.", route: "/estudos" });
    if (!items.length) items.push({ icon: ListChecks, title: "Comece sua preparação", text: "Resolva questões ou abra uma trilha de estudos.", route: "/questoes" });
    return items;
  }, [platformState]);

  function runSearch() {
    const raw = search.trim();
    const termo = raw.toLowerCase();
    if (!termo) return;
    if (termo.includes("ldb")) return navigate("/questoes?disciplina=Legisla%C3%A7%C3%A3o%20Educacional&topico=Lei%20de%20Diretrizes%20e%20Bases%20%E2%80%94%20LDB");
    if (termo.includes("eca")) return navigate("/questoes?disciplina=Legisla%C3%A7%C3%A3o%20Educacional&topico=Estatuto%20da%20Crian%C3%A7a%20e%20do%20Adolescente%20%E2%80%94%20ECA");
    if (termo.includes("filosof")) return navigate("/questoes?disciplina=Filosofia");
    if (termo.includes("portugu") || termo.includes("crase") || termo.includes("concord")) return navigate("/questoes?disciplina=L%C3%ADngua%20Portuguesa");
    if (termo.includes("quest") || termo.includes("prova") || termo.includes("simulado")) return navigate("/questoes");
    if (termo.includes("livro") || termo.includes("pdf") || termo.includes("biblioteca") || termo.includes("material")) return navigate(`/biblioteca?busca=${encodeURIComponent(raw)}`);
    if (termo.includes("cronograma") || termo.includes("agenda") || termo.includes("planejamento")) return navigate("/cronograma");
    if (termo.includes("flash")) return navigate("/flashcards");
    if (termo.includes("mapa")) return navigate("/mapas-mentais");
    if (termo.includes("desempenho") || termo.includes("acerto") || termo.includes("erro")) return navigate("/desempenho");
    if (termo.includes("config")) return navigate("/configuracoes");
    return navigate(`/biblioteca?busca=${encodeURIComponent(raw)}`);
  }

  function openNotification(route) {
    setNotificationsOpen(false);
    navigate(route);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="top-header">
      <div className="search-box">
        <button type="button" className="search-trigger" onClick={runSearch} aria-label="Buscar" title="Buscar"><Search size={19} strokeWidth={1.8} /></button>
        <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && runSearch()} placeholder="Buscar questões, temas, conteúdos..." />
        <span className="search-shortcut">Ctrl + K</span>
        {search && <button type="button" className="search-clear" onClick={() => setSearch("")} aria-label="Limpar busca"><X size={16} /></button>}
      </div>

      <div className="header-actions">
        <div className="theme-switch" aria-label="Tema da plataforma">
          <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")} title="Modo dia"><Sun size={15} /><span>Dia</span></button>
          <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")} title="Modo noite"><Moon size={15} /><span>Noite</span></button>
        </div>

        <button type="button" className={`api-status ${online ? "online" : "offline"}`} onClick={() => setOnline(navigator.onLine)} title={online ? "Plataforma conectada à internet" : "Sem conexão com a internet"}>
          {online ? <Wifi size={16} strokeWidth={2} /> : <WifiOff size={16} strokeWidth={2} />}<span>{online ? "Plataforma online" : "Sem conexão"}</span>
        </button>

        <button type="button" className="icon-button" onClick={() => setNotificationsOpen((open) => !open)} aria-label="Notificações"><Bell size={20} strokeWidth={1.8} />{notifications.length > 0 && <span className="notification-dot" />}</button>
        <button type="button" className="icon-button" onClick={handleLogout} aria-label="Sair" title={`Sair${user?.email ? ` — ${user.email}` : ""}`}><LogOut size={20} strokeWidth={1.8} /></button>
      </div>

      {notificationsOpen && (
        <div className="notification-panel">
          <div className="notification-header"><strong>Notificações</strong><button type="button" onClick={() => setNotificationsOpen(false)} aria-label="Fechar notificações"><X size={16} /></button></div>
          <div className="notification-list">
            {notifications.map(({ icon: Icon, title, text, route }) => (
              <button type="button" className="notification-item" key={`${title}-${route}`} onClick={() => openNotification(route)}>
                <span className="notification-item-icon"><Icon size={18} /></span><span><strong>{title}</strong><small>{text}</small></span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
