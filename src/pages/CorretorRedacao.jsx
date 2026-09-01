import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, FileText, ImagePlus, RotateCcw, Save, Trash2 } from "lucide-react";
import "../styles/redacao.css";

const STORAGE_KEY = "pdf-concurso-redacoes-v1";
const SCORE_VALUES = [0, 40, 80, 120, 160, 200];

const COMPETENCIAS = [
  "Domínio da norma-padrão da língua portuguesa",
  "Compreensão da proposta e desenvolvimento do tema",
  "Seleção e organização de argumentos",
  "Coesão e mecanismos linguísticos",
  "Proposta de intervenção respeitando os direitos humanos",
];

function loadRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function CorretorRedacao() {
  const inputRef = useRef(null);
  const [records, setRecords] = useState(loadRecords);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [image, setImage] = useState("");
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const total = useMemo(() => scores.reduce((sum, score) => sum + Number(score || 0), 0), [scores]);

  function handlePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Selecione uma imagem da redação.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result || ""));
      setMessage("Imagem registrada. Confira se a redação está inteira e legível.");
    };
    reader.readAsDataURL(file);
  }

  function updateScore(index, value) {
    setScores(current => current.map((score, i) => (i === index ? Number(value) : score)));
  }

  function resetForm() {
    setName("");
    setTheme("");
    setImage("");
    setScores([0, 0, 0, 0, 0]);
    setNotes("");
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  }

  function saveEssay() {
    if (!name.trim()) {
      setMessage("Informe o nome do candidato.");
      return;
    }
    if (!image) {
      setMessage("Registre a redação pela câmera ou selecione uma foto.");
      return;
    }

    const record = {
      id: `redacao-${Date.now()}`,
      name: name.trim(),
      theme: theme.trim() || "Tema não informado",
      image,
      scores,
      total,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      status: total > 0 ? "Corrigida" : "Aguardando correção",
    };

    setRecords(current => [record, ...current]);
    setMessage("Redação cadastrada com sucesso.");
    resetForm();
  }

  function removeRecord(id) {
    setRecords(current => current.filter(record => record.id !== id));
  }

  return (
    <div className="redacao-page">
      <section className="redacao-hero">
        <div>
          <span className="redacao-kicker">CORRETOR DE REDAÇÃO</span>
          <h1>Envie a redação direto pela câmera</h1>
          <p>O candidato fotografa a folha pelo celular, registra a produção e acompanha a nota por competência.</p>
        </div>
        <div className="redacao-score-card">
          <span>Nota atual</span>
          <strong>{total}</strong>
          <small>de 1000 pontos</small>
        </div>
      </section>

      <section className="redacao-grid">
        <div className="redacao-panel">
          <div className="panel-title"><Camera size={20} /><div><strong>1. Registrar redação</strong><span>Use a câmera traseira do celular para melhor leitura.</span></div></div>

          <div className="redacao-fields">
            <label>Nome do candidato<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" /></label>
            <label>Tema da redação<input value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex.: Desafios da educação pública" /></label>
          </div>

          <div className="camera-box">
            {image ? <img src={image} alt="Prévia da redação" /> : <div className="camera-empty"><ImagePlus size={42} /><strong>Nenhuma imagem registrada</strong><span>Fotografe a folha inteira, sem sombras e com boa iluminação.</span></div>}
          </div>

          <input ref={inputRef} className="camera-input" type="file" accept="image/*" capture="environment" onChange={handlePhoto} />
          <div className="camera-actions">
            <button className="btn-redacao primary" onClick={() => inputRef.current?.click()}><Camera size={18} /> Abrir câmera</button>
            <button className="btn-redacao" onClick={() => inputRef.current?.click()}><ImagePlus size={18} /> Escolher foto</button>
            {image && <button className="btn-redacao ghost" onClick={() => setImage("")}><RotateCcw size={18} /> Refazer</button>}
          </div>
        </div>

        <div className="redacao-panel">
          <div className="panel-title"><FileText size={20} /><div><strong>2. Correção por competências</strong><span>Padrão de 0 a 200 pontos por competência.</span></div></div>

          <div className="competencias-list">
            {COMPETENCIAS.map((label, index) => (
              <div className="competencia-row" key={label}>
                <div><span>C{index + 1}</span><strong>{label}</strong></div>
                <select value={scores[index]} onChange={e => updateScore(index, e.target.value)}>
                  {SCORE_VALUES.map(value => <option key={value} value={value}>{value} pontos</option>)}
                </select>
              </div>
            ))}
          </div>

          <label className="redacao-notes">Observações da correção<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Pontos fortes, desvios, repertório, argumentação e orientações para reescrita..." /></label>

          {message && <div className="redacao-message">{message}</div>}
          <button className="btn-redacao primary full" onClick={saveEssay}><Save size={18} /> Salvar redação</button>
        </div>
      </section>

      <section className="redacao-history">
        <div className="history-head"><div><span className="redacao-kicker">HISTÓRICO</span><h2>Redações cadastradas</h2></div><strong>{records.length}</strong></div>
        {records.length === 0 ? (
          <div className="history-empty">Nenhuma redação cadastrada ainda.</div>
        ) : (
          <div className="history-list">
            {records.map(record => (
              <article className="history-card" key={record.id}>
                <img src={record.image} alt={`Redação de ${record.name}`} />
                <div className="history-content">
                  <div className="history-top"><div><strong>{record.name}</strong><span>{record.theme}</span></div><span className={`status-pill ${record.total > 0 ? "done" : "pending"}`}>{record.status}</span></div>
                  <div className="history-score"><strong>{record.total}</strong><span>/ 1000</span></div>
                  <div className="history-competencias">{record.scores.map((score, i) => <span key={i}>C{i + 1}: <strong>{score}</strong></span>)}</div>
                  {record.notes && <p>{record.notes}</p>}
                  <small>{new Date(record.createdAt).toLocaleString("pt-BR")}</small>
                </div>
                <button className="delete-redacao" onClick={() => removeRecord(record.id)} title="Excluir redação"><Trash2 size={17} /></button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
