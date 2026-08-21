import React, { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import "../styles/login.css";

export default function Login() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const code = err?.code || "";
      if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
        setError("E-mail ou senha inválidos.");
      } else if (code.includes("too-many-requests")) {
        setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
      } else {
        setError("Não foi possível entrar agora. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <img src={`${import.meta.env.BASE_URL}logo-pdf-concurso.png`} alt="PDF Concurso EDU" />
          <span>PDF CONCURSO EDU</span>
          <h1>Área do aluno</h1>
          <p>Entre com o acesso cadastrado para continuar seus estudos.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            <span>E-mail</span>
            <div className="login-input-wrap">
              <Mail size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" autoComplete="email" required />
            </div>
          </label>

          <label>
            <span>Senha</span>
            <div className="login-input-wrap">
              <LockKeyhole size={18} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" autoComplete="current-password" required />
              <button type="button" className="show-password" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="login-support">Acesso liberado pela administração do PDF Concurso EDU.</p>
      </section>
    </main>
  );
}
