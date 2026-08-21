import React from "react";
import { createBrowserRouter } from "react-router";

import App from "../App";

import Dashboard from "../pages/Dashboard";
import Estudos from "../pages/Estudos";
import Questoes from "../pages/Questoes";
import Desempenho from "../pages/Desempenho";
import Cronograma from "../pages/Cronograma";
import Biblioteca from "../pages/Biblioteca";
import Flashcards from "../pages/Flashcards";
import MapasMentais from "../pages/MapasMentais";
import Configuracoes from "../pages/Configuracoes";

const router = createBrowserRouter([
  {
    path: "/",
    Component: App,
    children: [
      {
        index: true,
        Component: Dashboard,
      },
      {
        path: "estudos",
        Component: Estudos,
      },
      {
        path: "questoes",
        Component: Questoes,
      },
      {
        path: "desempenho",
        Component: Desempenho,
      },
      {
        path: "cronograma",
        Component: Cronograma,
      },
      {
        path: "biblioteca",
        Component: Biblioteca,
      },
      {
        path: "flashcards",
        Component: Flashcards,
      },
      {
        path: "mapas-mentais",
        Component: MapasMentais,
      },
      {
        path: "configuracoes",
        Component: Configuracoes,
      },
    ],
  },
]);

export default router;

