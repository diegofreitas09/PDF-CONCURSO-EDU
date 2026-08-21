import React, { useEffect, useState } from "react";

import {
  Search,
  Bell,
  Wifi,
  X
} from "lucide-react";

import { useNavigate } from "react-router";

export default function Header() {

  const navigate = useNavigate();

  const [apiOnline, setApiOnline] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/health")
      .then((response) => {
        if (!response.ok) {
          throw new Error("API indisponível");
        }

        return response.json();
      })
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false));

  }, []);

  function handleSearch(event) {

    const value = event.target.value;

    setSearch(value);

    if (event.key === "Enter" && value.trim()) {

      const termo = value.toLowerCase();

      if (
        termo.includes("quest") ||
        termo.includes("prova")
      ) {
        navigate("/questoes");
        return;
      }

      if (
        termo.includes("livro") ||
        termo.includes("pdf") ||
        termo.includes("biblioteca")
      ) {
        navigate("/biblioteca");
        return;
      }

      if (
        termo.includes("estudo") ||
        termo.includes("matéria") ||
        termo.includes("materia")
      ) {
        navigate("/estudos");
      }
    }
  }

  return (
    <header className="top-header">

      <div className="search-box">

        <Search size={19} strokeWidth={1.8} />

        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={handleSearch}
          placeholder="Buscar questões, temas, conteúdos..."
        />

        {search && (
          <button
            className="search-clear"
            onClick={() => setSearch("")}
            aria-label="Limpar busca"
          >
            <X size={16} />
          </button>
        )}

      </div>

      <div className="header-actions">

        <div className={`api-status ${apiOnline ? "online" : "offline"}`}>
          <Wifi size={16} strokeWidth={2} />
          <span>
            {apiOnline ? "API online" : "API offline"}
          </span>
        </div>

        <button
          className="icon-button"
          onClick={() =>
            setNotificationsOpen(!notificationsOpen)
          }
          aria-label="Notificações"
        >
          <Bell size={20} strokeWidth={1.8} />

          <span className="notification-dot" />
        </button>

      </div>

      {notificationsOpen && (

        <div className="notification-panel">

          <div className="notification-header">
            <strong>Notificações</strong>

            <button
              onClick={() => setNotificationsOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="notification-empty">
            <Bell size={28} strokeWidth={1.5} />

            <strong>Nenhuma novidade</strong>

            <span>
              Suas notificações aparecerão aqui.
            </span>
          </div>

        </div>

      )}

    </header>
  );
}

