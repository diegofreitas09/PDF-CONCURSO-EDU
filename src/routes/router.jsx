import React from "react";
import { createHashRouter } from "react-router";

import App from "../App";
import ProtectedRoute from "../components/ProtectedRoute";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Estudos from "../pages/Estudos";
import Questoes from "../pages/Questoes";
import Simulados from "../pages/Simulados";
import Desempenho from "../pages/Desempenho";
import Cronograma from "../pages/Cronograma";
import Biblioteca from "../pages/Biblioteca";
import Flashcards from "../pages/Flashcards";
import MapasMentais from "../pages/MapasMentais";
import AssistenteIA from "../pages/AssistenteIA";
import Configuracoes from "../pages/Configuracoes";

const router = createHashRouter([
  { path: "/login", Component: Login },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: App,
        children: [
          { index: true, Component: Dashboard },
          { path: "estudos", Component: Estudos },
          { path: "questoes", Component: Questoes },
          { path: "simulados", Component: Simulados },
          { path: "desempenho", Component: Desempenho },
          { path: "cronograma", Component: Cronograma },
          { path: "biblioteca", Component: Biblioteca },
          { path: "flashcards", Component: Flashcards },
          { path: "mapas-mentais", Component: MapasMentais },
          { path: "assistente-ia", Component: AssistenteIA },
          { path: "configuracoes", Component: Configuracoes },
        ],
      },
    ],
  },
]);

export default router;
