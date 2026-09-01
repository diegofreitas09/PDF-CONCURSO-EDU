import React, { useEffect, useMemo, useRef, useState } from "react";
import { Camera, CameraOff, FileText, ImagePlus, LoaderCircle, RotateCcw, Save, ScanText, Sparkles, Trash2 } from "lucide-react";
import { auth } from "../lib/firebase";
import "../styles/redacao.css";

const STORAGE_KEY = "pdf-concurso-redacoes-v1";
const AI_ENDPOINT = "https://us-central1-pdf-concurso-edu.cloudfunctions.net/corrigirRedacao";
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

function optimizeFile(file, maxWidth = 1600, quality = 0.84) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function buildNotes(result) {
  const parts = [];
  if (result?.general_feedback) parts.push(result.general_feedback);
  if (Array.isArray(result?.strengths) && result.strengths.length) parts.push(`Pontos fortes: ${result.strengths.join("; ")}.`);
  if (Array.isArray(result?.improvements) && result.improvements.length) parts.push(`Prioridades de melhoria: ${result.improvements.join("; ")}.`);
  if (result?.rewrite_plan) parts.push(`Plano de reescrita: ${result.rewrite_plan}`);
  return parts.join("\n\n");
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
  const [aiLoading, setAiLoading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch {
      setMessage("O armazenamento do navegador ficou cheio. Exclua redações antigas antes de salvar outra imagem.");
    }
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

  function clearAiAnalysis() {
    setTranscription("");
    setAiResult(null);
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
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraOpen(true);
      setCameraLoading(false);
      requestAnimationFrame(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        try { await videoRef.current.play(); } catch { }
      });
    } catch (error) {
      setCameraLoading(false);
      setCameraOpen(false);
      if (error?.name === "NotAllowedError") setMessage("Permissão da câmera negada. Autorize a câmera para este site e tente novamente.");
      else if (error?.name === "NotFoundError") setMessage("Nenhuma câmera foi encontrada neste dispositivo.");
      else setMessage("Não foi possível abrir a câmera. Verifique a permissão do navegador ou use 'Escolher foto'.");
    }
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth || !video.videoHeight) {
      setMessage("A câmera ainda está carregando. Aguarde um instante e tente novamente.");
      return;
    }

    const maxWidth = 1600;
    const scale = Math.min(1, maxWidth / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    setImage(canvas.toDataURL("image/jpeg", 0.84));
    clearAiAnalysis();
    setScores([0, 0, 0, 0, 0]);
    setNotes("");
    setMessage("Foto registrada. Confira a legibilidade e clique em 'Corrigir com IA'.");
    stopCamera();
  }

  async function handleGalleryPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Selecione uma imagem da redação.");
      return;
    }
    try {
      stopCamera();
      setMessage("Preparando a imagem...");
      const optimized = await optimizeFile(file);
      setImage(optimized);
      clearAiAnalysis();
      setScores([0, 0, 0, 0, 0]);
      setNotes("");
      setMessage("Imagem registrada. Confira a legibilidade e clique em 'Corrigir com IA'.");
    } catch {
      setMessage("Não foi possível preparar esta imagem. Tente outra foto.");
    }
  }

  async function correctWithAI() {
    if (!image || aiLoading) return;
    const user = auth.currentUser;
    if (!user) {
      setMessage("Sua sessão expirou. Entre novamente para usar a correção automática.");
      return;
    }

    setAiLoading(true);
    setMessage("A IA está lendo a escrita, transcrevendo e avaliando as cinco competências...");
    try {
      const token = await user.getIdToken();
      const response = await fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ image, theme: theme.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || `Falha na correção automática (${response.status}).`);

      setAiResult(data);
      setTranscription(data.transcription || "");
      setScores(Array.isArray(data.scores) ? data.scores : [0, 0, 0, 0, 0]);
      setNotes(buildNotes(data));
      setMessage(`Correção automática concluída. Legibilidade: ${data.legibility || "não informada"}. Revise a transcrição antes de salvar.`);
    } catch (error) {
      setMessage(error?.message || "Não foi possível corrigir a redação com IA.");
    } finally {
      setAiLoading(false);
    }
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
    clearAiAnalysis();
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
      transcription: transcription.trim(),
      aiResult,
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
          <h1>Fotografe, leia e corrija com IA</h1>
          <p>O candidato registra a folha pelo celular. A plataforma transcreve a escrita, avalia as cinco competências e entrega orientações para reescrita.</p>
        </div>
        <div className="redacao-score-card"><span>Nota atual</span><strong>{total}</strong><small>de 1000 pontos</small></div>
      </section>

      <section className="redacao-grid">
        <div className="redacao-panel">
          <div className="panel-title"><Camera size={20} /><div><strong>1. Registrar redação</strong><span>Use a câmera traseira e enquadre toda a folha.</span></div></div>
          <div className="redacao-fields">
            <label>Nome do candidato<input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" /></label>
            <label>Tema da redação<input value={theme} onChange={e => setTheme(e.target.value)} placeholder="Ex.: Desafios da educação pública" /></label>
          </div>

          <div className={`camera-box ${cameraOpen ? "is-live" : ""}`}>
            {cameraOpen ? <div className="camera-live-wrap"><video ref={videoRef} className="camera-live" autoPlay playsInline muted /><div className="camera-guide"><span>Enquadre toda a folha dentro da área</span></div></div>
              : image ? <img src={image} alt="Prévia da redação" />
              : <div className="camera-empty"><ImagePlus size={42} /><strong>Nenhuma imagem registrada</strong><span>Fotografe a folha inteira, sem sombras e com boa iluminação.</span></div>}
          </div>

          <canvas ref={canvasRef} className="camera-canvas" />
          <input ref={galleryInputRef} className="camera-input" type="file" accept="image/*" onChange={handleGalleryPhoto} />
          <div className="camera-actions">
            {!cameraOpen ? <button className="btn-redacao primary" onClick={openCamera} disabled={cameraLoading}><Camera size={18} /> {cameraLoading ? "Abrindo câmera..." : "Abrir câmera"}</button>
              : <><button className="btn-redacao primary capture" onClick={capturePhoto}><Camera size={18} /> Fotografar redação</button><button className="btn-redacao" onClick={stopCamera}><CameraOff size={18} /> Fechar câmera</button></>}
            {!cameraOpen && <button className="btn-redacao" onClick={() => galleryInputRef.current?.click()}><ImagePlus size={18} /> Escolher foto</button>}
            {image && !cameraOpen && <button className="btn-redacao ghost" onClick={() => { setImage(""); clearAiAnalysis(); openCamera(); }}><RotateCcw size={18} /> Refazer pela câmera</button>}
          </div>

          {image && !cameraOpen && <button className="ai-correct-button" onClick={correctWithAI} disabled={aiLoading}>{aiLoading ? <LoaderCircle className="spin" size={19} /> : <Sparkles size={19} />} {aiLoading ? "Lendo e corrigindo..." : "Corrigir automaticamente com IA"}</button>}
        </div>

        <div className="redacao-panel">
          <div className="panel-title"><FileText size={20} /><div><strong>2. Correção por competências</strong><span>A IA preenche as notas; o corretor pode revisar antes de salvar.</span></div></div>
          <div className="competencias-list">
            {COMPETENCIAS.map((label, index) => (
              <div className="competencia-row" key={label}>
                <div><span>C{index + 1}</span><strong>{label}</strong></div>
                <select value={scores[index]} onChange={e => updateScore(index, e.target.value)}>{SCORE_VALUES.map(value => <option key={value} value={value}>{value} pontos</option>)}</select>
              </div>
            ))}
          </div>
          <label className="redacao-notes">Observações da correção<textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="A correção automática preencherá este campo. Você também pode editar manualmente." /></label>
          {message && <div className="redacao-message">{message}</div>}
          <button className="btn-redacao primary full" onClick={saveEssay}><Save size={18} /> Salvar redação</button>
        </div>
      </section>

      {(transcription || aiResult) && <section className="redacao-ai-report">
        <div className="ai-report-head"><ScanText size={22} /><div><span className="redacao-kicker">LEITURA DA IA</span><h2>Transcrição e diagnóstico</h2></div>{aiResult?.legibility && <span className={`legibility ${aiResult.legibility}`}>Legibilidade {aiResult.legibility}</span>}</div>
        <div className="ai-report-grid">
          <div className="transcription-card"><strong>Texto reconhecido</strong><textarea value={transcription} onChange={e => setTranscription(e.target.value)} placeholder="A transcrição aparecerá aqui." /></div>
          <div className="feedback-card"><strong>Feedback por competência</strong><div className="feedback-list">{(aiResult?.competencies || []).map((item, index) => <div key={`${item.code}-${index}`}><span>{item.code || `C${index + 1}`}</span><p>{item.feedback}</p></div>)}</div></div>
        </div>
      </section>}

      <section className="redacao-history">
        <div className="history-head"><div><span className="redacao-kicker">HISTÓRICO</span><h2>Redações cadastradas</h2></div><strong>{records.length}</strong></div>
        {records.length === 0 ? <div className="history-empty">Nenhuma redação cadastrada ainda.</div> : <div className="history-list">
          {records.map(record => <article className="history-card" key={record.id}>
            <img src={record.image} alt={`Redação de ${record.name}`} />
            <div className="history-content">
              <div className="history-top"><div><strong>{record.name}</strong><span>{record.theme}</span></div><span className={`status-pill ${record.total > 0 ? "done" : "pending"}`}>{record.status}</span></div>
              <div className="history-score"><strong>{record.total}</strong><span>/ 1000</span></div>
              <div className="history-competencias">{record.scores.map((score, i) => <span key={i}>C{i + 1}: <strong>{score}</strong></span>)}</div>
              {record.transcription && <details className="history-transcription"><summary>Ver transcrição</summary><p>{record.transcription}</p></details>}
              {record.notes && <p>{record.notes}</p>}
              <small>{new Date(record.createdAt).toLocaleString("pt-BR")}</small>
            </div>
            <button className="delete-redacao" onClick={() => removeRecord(record.id)} title="Excluir redação"><Trash2 size={17} /></button>
          </article>)}
        </div>}
      </section>
    </div>
  );
}
