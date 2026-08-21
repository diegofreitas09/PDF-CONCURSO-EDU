import React from "react";

import {
  LayoutDashboard,
  BookOpenText,
  ListChecks,
  ChartNoAxesCombined,
  CalendarRange,
  LibraryBig,
  BrainCircuit,
  Network,
  Settings2
} from "lucide-react";

import { NavLink } from "react-router";

const menu = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/estudos",
    label: "Estudos",
    icon: BookOpenText,
  },
  {
    to: "/questoes",
    label: "Questões",
    icon: ListChecks,
  },
  {
    to: "/desempenho",
    label: "Desempenho",
    icon: ChartNoAxesCombined,
  },
  {
    to: "/cronograma",
    label: "Cronograma",
    icon: CalendarRange,
  },
  {
    to: "/biblioteca",
    label: "Biblioteca",
    icon: LibraryBig,
  },
  {
    to: "/flashcards",
    label: "Flashcards",
    icon: BrainCircuit,
  },
  {
    to: "/mapas-mentais",
    label: "Mapas Mentais",
    icon: Network,
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="brand">
        <img className="brand-logo" src="/logo-pdf-concurso.png" alt="PDF Concurso Edu" />

        <div className="brand-text">
          <strong>PDF</strong>
          <span>CONCURSO EDU</span>
        </div>
      </div>

      <nav className="sidebar-nav">

        <div className="nav-label">
          PLATAFORMA
        </div>

        {menu.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} strokeWidth={1.8} />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="nav-label system-label">
          SISTEMA
        </div>

        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings2 size={19} strokeWidth={1.8} />
          <span>Configurações</span>
        </NavLink>

      </nav>

      <div className="sidebar-footer">

        <div className="user-avatar">
          E
        </div>

        <div className="user-info">
          <strong>Diego</strong>
          <span>Administrador</span>
        </div>

      </div>

    </aside>
  );
}



