import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, FileText, ImagePlus, RotateCcw, Save, Trash2 } from "lucide-react";
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
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [records, setRecords] = useState(loadRecords);
  const [name, setName] = useState("");
  const [theme, setTheme] = useState("");
  const [image, setImage] = useState("");
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  useEffect(() => () => stopCamera(), []);

  const total = useMemo(() => scores.reduce((sum, score) => sum + Number(score || 0), 0), [scores]);

  function stopCamera() {
    streamRef.current?.getTracks?.().forEach(track => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOpen(false);
    setCameraLoading(false);
  }

  async function openCamera() {
    setMessage("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Este navegador não permite abrir a câmera diretamente. Use 'Escolher foto' ou acesse pelo Chrome/Safari atualizado em conexão HTTPS.");
      return;
    }

    try {
      setCameraLoading(true);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      streamRef.current = stream;
      setCameraOpen(true);
      setCameraLoading(false);

      requestAnimationFrame(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch { /* autoplay pode depender do navegador */ }
      });
    } catch (error) {
      setCameraLoading(false);
      setCameraOpen(false);
      if (error?.name === "NotAllowedError") {
        setMessage("Permissão da câmera negada. Autorize a câmera para este site nas configurações do navegador e tente novamente.");
      } else if (error?.name === "NotFoundError") {
        setMessage("Nenhuma câmera foi encontrada neste dispositivo.");
      } else {
        setMessage("Não foi possível abrir a câmera. Verifique a permissão do navegador ou use 'Escolher foto'.");
      }
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setMessage("A câmera ainda está carregando. Aguarde um instante e tente novamente.");
      return;
    }

    const maxWidth = 1800;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setImage(dataUrl);
    setMessage("Foto registrada. Confira se a folha inteira está legível antes de salvar.");
    stopCamera();
  }

  function handleGalleryPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Selecione uma imagem da redação.");
      return;
    }
    stopCamera();
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
    stopCamera();
    setName("");
    setTheme("");
    setImage("");
    setScores([0, 0, 0, 0, 0]);
    setNotes("");
    setMessage("");
    if (galleryInputRef.current) galleryInputRef.current.value = "";
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
    resetForm();
    setMessage("Redação cadastrada com sucesso.");
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
          <div className="panel-title"><Camera size={20} /><div><strong>1. Registrar redação</strong><span>A câmera agora abre dentro do navegador no celular ou computador.</span></div></div>

          <div className="redacao-fields">
            <label>Nome do candidato<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" /></label>
            <label>Tema da redação<input value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex.: Desafios da educação pública" /></label>
          </div>

          <div className={`camera-box ${cameraOpen ? "is-live" : ""}`}>
            {cameraOpen ? (
              <div className="camera-live-wrap">
                <video ref={videoRef} className="camera-live" autoPlay playsInline muted />
                <div className="camera-guide"><span>Enquadre toda a folha dentro da área</span></div>
              </div>
            ) : image ? (
              <img src={image} alt="Prévia da redação" />
            ) : (
              <div className="camera-empty"><ImagePlus size={42} /><strong>Nenhuma imagem registrada</strong><span>Fotografe a folha inteira, sem sombras e com boa iluminação.</span></div>
            )}
          </div>

          <canvas ref={canvasRef} className="camera-canvas" />
          <input ref={galleryInputRef} className="camera-input" type="file" accept="image/*" onChange={handleGalleryPhoto} />

          <div className="camera-actions">
            {!cameraOpen ? (
              <button className="btn-redacao primary" onClick={openCamera} disabled={cameraLoading}><Camera size={18} /> {cameraLoading ? "Abrindo câmera..." : "Abrir câmera"}</button>
            ) : (
              <>
                <button className="btn-redacao primary capture" onClick={capturePhoto}><Camera size={18} /> Fotografar redação</button>
                <button className="btn-redacao" onClick={stopCamera}><CameraOff size={18} /> Fechar câmera</button>
              </>
            )}
            {!cameraOpen && <button className="btn-redacao" onClick={() => galleryInputRef.current?.click()}><ImagePlus size={18} /> Escolher foto</button>}
            {image && !cameraOpen && <button className="btn-redacao ghost" onClick={() => { setImage(""); openCamera(); }}><RotateCcw size={18} /> Refazer pela câmera</button>}
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
