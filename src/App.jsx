import React from "react";
import { Outlet } from "react-router";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export default function App() {
  return (
    <div className="app-shell">
      <Sidebar />

      <div className="app-main">
        <Header />

        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

