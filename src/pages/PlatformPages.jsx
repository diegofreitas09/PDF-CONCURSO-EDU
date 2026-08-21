import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  ListChecks,
  ChartNoAxesCombined,
  CalendarRange,
  LibraryBig,
  BrainCircuit,
  Network,
  Settings2,
  PlayCircle,
  Database,
  FileText,
  Target,
  Clock3,
  CheckCircle2,
  Trash2,
  Plus,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
  Save,
  CircleCheck,
  Circle,
  Trophy
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import "../styles/functions.css";
import { QUESTION_BANK } from "../data/questionBank";

const STORAGE_KEY = "pdf-concurso-edu-state-v1";

const DEFAULT_STATE = {
  answers: [],
  studySeconds: 0,
  simulations: 0,
  completedTopics: [],
  schedule: [],
  flashcards: [],
  mapNotes: [],
  settings: { name: "Diego", weeklyGoal: 300 }
};

const STUDY_DATA = [
  {
    title: "Legislação Educacional",
    icon: BookOpenText,
    description: "Base legal e fundamentos da educação brasileira.",
    topics: [
      "Constituição Federal — Educação",
      "Lei de Diretrizes e Bases — LDB",
      "Estatuto da Criança e do Adolescente — ECA",
      "Plano Nacional de Educação — PNE",
      "Diretrizes Curriculares Nacionais",
      "BNCC",
      "Legislação Educacional"
    ]
  },
  {
    title: "Filosofia",
    icon: Network,
    description: "Conteúdos específicos para preparação do concurso.",
    topics: [
      "Filosofia Antiga",
      "Filosofia Medieval",
      "Filosofia Moderna",
      "Filosofia Contemporânea",
      "Ética e Filosofia Política",
      "Epistemologia",
      "Filosofia da Educação"
    ]
  },
  {
    title: "Língua Portuguesa",
    icon: FileText,
    description: "Gramática, interpretação e conhecimentos linguísticos.",
    topics: [
      "Interpretação de Textos",
      "Ortografia",
      "Classes de Palavras",
      "Sintaxe",
      "Concordância",
      "Regência",
      "Crase",
      "Pontuação"
    ]
  }
];

const LIBRARY = [
  { title: "Constituição Federal — Educação", type: "Legislação", note: "Artigos constitucionais relacionados ao direito à educação." },
  { title: "Lei de Diretrizes e Bases — LDB", type: "Legislação", note: "Lei nº 9.394/1996 e organização da educação nacional." },
  { title: "Estatuto da Criança e do Adolescente — ECA", type: "Legislação", note: "Direitos de crianças e adolescentes aplicados ao contexto educacional." },
  { title: "Filosofia da Educação", type: "Filosofia", note: "Autores, correntes e fundamentos filosóficos da educação." },
  { title: "Gramática e interpretação", type: "Português", note: "Revisão de linguagem, sintaxe e interpretação textual." }
];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...DEFAULT_STATE, ...(saved || {}), settings: { ...DEFAULT_STATE.settings, ...(saved?.settings || {}) } };
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("pdfedu-state"));
}

function usePlatformState() {
  const [state, setState] = useState(loadState);
  useEffect(() => {
    const sync = () => setState(loadState());
    window.addEventListener("storage", sync);
    window.addEventListener("pdfedu-state", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("pdfedu-state", sync);
    };
  }, []);
  const update = (producer) => {
    const current = loadState();
    const next = typeof producer === "function" ? producer(current) : { ...current, ...producer };
    saveState(next);
    setState(next);
  };
  return [state, update];
}

function PageHeader({ eyebrow, title, description, icon: Icon }) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {Icon && <div className="page-icon"><Icon size={28} strokeWidth={1.7} /></div>}
    </div>
  );
}

function ModulePage({ eyebrow, title, description, icon, children }) {
  return (
    <section className="page">
      <PageHeader eyebrow={eyebrow} title={title} description={description} icon={icon} />
      {children}
    </section>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [state] = usePlatformState();
  const total = state.answers.length;
  const correct = state.answers.filter((a) => a.correct).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const studiedMinutes = Math.floor(state.studySeconds / 60);
  const totalTopics = STUDY_DATA.reduce((acc, d) => acc + d.topics.length, 0);
  const progress = Math.round((state.completedTopics.length / totalTopics) * 100);

  return (
    <section className="page dashboard-page">
      <div className="dashboard-heading">
        <div>
          <div className="page-eyebrow">PAINEL DE ESTUDOS</div>
          <h1>Olá, {state.settings.name || "Diego"}!</h1>
          <p>Continue sua preparação para o seu concurso.</p>
        </div>
        <button className="primary-button" onClick={() => navigate("/estudos")}><PlayCircle size={19} />Iniciar estudo<ArrowRight size={18} /></button>
      </div>

      <div className="stats-grid">
        <Stat icon={ListChecks} label="QUESTÕES" value={total} description="Questões respondidas" />
        <Stat icon={Target} label="ACERTOS" value={`${accuracy}%`} description={`${correct} respostas corretas`} />
        <Stat icon={FileText} label="SIMULADOS" value={state.simulations} description="Simulados realizados" />
        <Stat icon={Clock3} label="TEMPO DE ESTUDO" value={`${studiedMinutes} min`} description="Tempo acumulado" />
      </div>

      <div className="dashboard-grid">
        <div className="card study-card">
          <div className="card-heading">
            <div><div className="card-eyebrow">CONTINUE ESTUDANDO</div><h2>Trilha geral</h2><p>Conclua tópicos e acompanhe sua evolução geral.</p></div>
            <BookOpenText size={27} strokeWidth={1.6} />
          </div>
          <div className="progress-meta"><span>Tópicos concluídos</span><strong>{state.completedTopics.length}/{totalTopics}</strong></div>
          <div className="progress-meta"><span>Progresso</span><strong>{progress}%</strong></div>
          <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
          <button className="secondary-button" onClick={() => navigate("/estudos")}>Abrir estudos<ArrowRight size={17} /></button>
        </div>

        <div className="card">
          <div className="card-heading"><div><div className="card-eyebrow">BASE PDF CONCURSO EDU</div><h2>Base de conhecimento</h2></div><Database size={26} strokeWidth={1.6} /></div>
          <div className="source-list">
            <button onClick={() => navigate("/questoes")}><div><strong>01&nbsp;&nbsp; Base de Questões</strong><span>{QUESTION_BANK.length} questões disponíveis</span></div><ArrowRight size={17} /></button>
            <button onClick={() => navigate("/biblioteca")}><div><strong>02&nbsp;&nbsp; Biblioteca de Pesquisa</strong><span>{LIBRARY.length} materiais cadastrados</span></div><ArrowRight size={17} /></button>
            <button onClick={() => navigate("/desempenho")}><div><strong>03&nbsp;&nbsp; Motor de Análise</strong><span>Histórico de acertos e erros</span></div><ArrowRight size={17} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value, description }) {
  return <div className="stat-card"><div className="stat-icon"><Icon size={21} strokeWidth={1.7} /></div><div><span>{label}</span><strong>{value}</strong><small>{description}</small></div></div>;
}

export function Estudos() {
  const navigate = useNavigate();
  const [state, update] = usePlatformState();

  function toggleTopic(discipline, topic) {
    const key = `${discipline}::${topic}`;
    update((s) => ({ ...s, completedTopics: s.completedTopics.includes(key) ? s.completedTopics.filter((x) => x !== key) : [...s.completedTopics, key] }));
  }

  function startStudy(discipline, topic) {
    update((s) => ({ ...s, studySeconds: s.studySeconds + 900 }));
    navigate(`/questoes?disciplina=${encodeURIComponent(discipline)}&topico=${encodeURIComponent(topic)}`);
  }

  return (
    <ModulePage eyebrow="PREPARAÇÃO" title="Estudos" description="Marque conteúdos concluídos e pratique por disciplina ou tópico." icon={BookOpenText}>
      <div className="study-page-grid">
        {STUDY_DATA.map((discipline) => {
          const Icon = discipline.icon;
          const done = discipline.topics.filter((topic) => state.completedTopics.includes(`${discipline.title}::${topic}`)).length;
          const progress = Math.round((done / discipline.topics.length) * 100);
          return (
            <section className="study-discipline-card" key={discipline.title}>
              <div className="study-discipline-header"><div className="study-discipline-icon"><Icon size={24} /></div><div><h2>{discipline.title}</h2><p>{discipline.description}</p></div></div>
              <div className="study-progress-info"><span>Progresso da disciplina</span><strong>{progress}%</strong></div>
              <div className="study-progress-track"><span style={{ width: `${progress}%` }} /></div>
              <div className="study-topics">
                {discipline.topics.map((topic, index) => {
                  const key = `${discipline.title}::${topic}`;
                  const completed = state.completedTopics.includes(key);
                  return (
                    <div className={`study-topic-row ${completed ? "completed" : ""}`} key={topic}>
                      <button className="topic-check" onClick={() => toggleTopic(discipline.title, topic)} title="Marcar como concluído">{completed ? <CircleCheck size={19} /> : <Circle size={19} />}</button>
                      <button className="study-topic" onClick={() => startStudy(discipline.title, topic)}><span className="study-topic-number">{String(index + 1).padStart(2, "0")}</span><span className="study-topic-name">{topic}</span><ArrowRight size={17} /></button>
                    </div>
                  );
                })}
              </div>
              <button className="study-main-action" onClick={() => navigate(`/questoes?disciplina=${encodeURIComponent(discipline.title)}`)}>Praticar disciplina<ArrowRight size={17} /></button>
            </section>
          );
        })}
      </div>
    </ModulePage>
  );
}

export function Questoes() {
  const [params, setParams] = useSearchParams();
  const [state, update] = usePlatformState();
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [index, setIndex] = useState(0);
  const discipline = params.get("disciplina") || "";
  const topic = params.get("topico") || "";

  const disciplines = useMemo(
    () => [...new Set(QUESTION_BANK.map((q) => q.discipline).filter(Boolean))].sort(),
    []
  );

  const topics = useMemo(
    () => [...new Set(
      QUESTION_BANK
        .filter((q) => !discipline || q.discipline === discipline)
        .map((q) => q.topic)
        .filter(Boolean)
    )].sort(),
    [discipline]
  );

  const filtered = useMemo(
    () =>
      QUESTION_BANK.filter(
        (q) =>
          (!discipline || q.discipline === discipline) &&
          (!topic || q.topic === topic)
      ),
    [discipline, topic]
  );
  const current = filtered[index] || filtered[0];

  useEffect(() => { setIndex(0); setSelected(null); setChecked(false); }, [discipline, topic]);

  function answerQuestion() {
    if (selected === null || !current) return;
    const correct = selected === current.answer;
    const record = { questionId: current.id, correct, at: new Date().toISOString(), discipline: current.discipline, topic: current.topic };
    update((s) => ({ ...s, answers: [...s.answers, record] }));
    setChecked(true);
  }

  function nextQuestion() {
    if (!filtered.length) return;
    setIndex((i) => (i + 1) % filtered.length);
    setSelected(null);
    setChecked(false);
  }

  return (
    <ModulePage eyebrow="BANCO DE QUESTÕES" title="Questões" description="Filtre, responda e acompanhe seus resultados." icon={ListChecks}>
      <div className="question-filters">
        <select value={discipline} onChange={(e) => { const p = new URLSearchParams(params); e.target.value ? p.set("disciplina", e.target.value) : p.delete("disciplina"); p.delete("topico"); setParams(p); }}>
          <option value="">Todas as disciplinas ({QUESTION_BANK.length})</option>
          {disciplines.map((name) => {
            const count = QUESTION_BANK.filter(
              (q) => q.discipline === name
            ).length;

            return (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            );
          })}
        </select>
        <select value={topic} onChange={(e) => { const p = new URLSearchParams(params); e.target.value ? p.set("topico", e.target.value) : p.delete("topico"); setParams(p); }} >
          <option value="">Todos os tópicos</option>
          {topics.map((name) => {
            const count = QUESTION_BANK.filter(
              (q) =>
                (!discipline || q.discipline === discipline) &&
                q.topic === name
            ).length;

            return (
              <option key={name} value={name}>
                {name} ({count})
              </option>
            );
          })}
        </select>
        <span className="filter-count">{filtered.length} questão(ões)</span>
      </div>

      {!current ? <div className="feature-panel"><ListChecks size={42} /><h2>Nenhuma questão encontrada</h2><p>Altere os filtros para continuar.</p></div> : (
        <div className="question-card">
          <div className="question-meta"><span>{current.discipline}</span><span>{current.topic}</span><strong>{index + 1}/{filtered.length}</strong></div>
          <h2>{current.statement}</h2>
          <div className="question-options">
            {current.options.map((option, i) => {
              const isCorrect = checked && i === current.answer;
              const isWrong = checked && i === selected && i !== current.answer;
              return <button key={option} disabled={checked} onClick={() => setSelected(i)} className={`${selected === i ? "selected" : ""} ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}><span>{String.fromCharCode(65 + i)}</span>{option}</button>;
            })}
          </div>
          {checked && <div className={`answer-feedback ${selected === current.answer ? "success" : "error"}`}><strong>{selected === current.answer ? "Resposta correta!" : "Resposta incorreta."}</strong><p>{current.explanation}</p></div>}
          <div className="question-actions"><button className="secondary-button" disabled={selected === null || checked} onClick={answerQuestion}>Corrigir questão</button><button className="primary-button" disabled={!checked} onClick={nextQuestion}>Próxima<ArrowRight size={17} /></button></div>
        </div>
      )}
      <div className="mini-history">Respondidas nesta sessão/histórico: <strong>{state.answers.length}</strong></div>
    </ModulePage>
  );
}

export function Desempenho() {
  const [state] = usePlatformState();
  const total = state.answers.length;
  const correct = state.answers.filter((a) => a.correct).length;
  const accuracy = total ? Math.round(correct / total * 100) : 0;
  const byDiscipline = STUDY_DATA.map((d) => {
    const answers = state.answers.filter((a) => a.discipline === d.title);
    const hits = answers.filter((a) => a.correct).length;
    return { title: d.title, total: answers.length, accuracy: answers.length ? Math.round(hits / answers.length * 100) : 0 };
  });
  return (
    <ModulePage eyebrow="ANÁLISE" title="Desempenho" description="Acompanhe acertos, erros e pontos que precisam de reforço." icon={ChartNoAxesCombined}>
      <div className="performance-kpis"><div><span>Questões respondidas</span><strong>{total}</strong></div><div><span>Acertos</span><strong>{correct}</strong></div><div><span>Aproveitamento</span><strong>{accuracy}%</strong></div></div>
      <div className="performance-list">{byDiscipline.map((item) => <div className="performance-row" key={item.title}><div><strong>{item.title}</strong><span>{item.total} resposta(s)</span></div><div className="performance-bar"><span style={{ width: `${item.accuracy}%` }} /></div><strong>{item.accuracy}%</strong></div>)}</div>
    </ModulePage>
  );
}

export function Cronograma() {
  const [state, update] = usePlatformState();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  function addTask(e) { e.preventDefault(); if (!title.trim()) return; update((s) => ({ ...s, schedule: [...s.schedule, { id: Date.now(), title: title.trim(), date, done: false }] })); setTitle(""); setDate(""); }
  function toggle(id) { update((s) => ({ ...s, schedule: s.schedule.map((t) => t.id === id ? { ...t, done: !t.done } : t) })); }
  function remove(id) { update((s) => ({ ...s, schedule: s.schedule.filter((t) => t.id !== id) })); }
  return (
    <ModulePage eyebrow="PLANEJAMENTO" title="Cronograma" description="Crie tarefas de estudo e acompanhe sua rotina." icon={CalendarRange}>
      <form className="scheduler-form" onSubmit={addTask}><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Revisar LDB" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /><button className="primary-button"><Plus size={17} />Adicionar</button></form>
      <div className="task-list">{state.schedule.length === 0 ? <div className="empty-inline">Nenhuma tarefa cadastrada.</div> : state.schedule.map((task) => <div className={`task-row ${task.done ? "done" : ""}`} key={task.id}><button className="task-check" onClick={() => toggle(task.id)}>{task.done ? <CircleCheck /> : <Circle />}</button><div><strong>{task.title}</strong><span>{task.date || "Sem data definida"}</span></div><button className="danger-icon" onClick={() => remove(task.id)}><Trash2 size={18} /></button></div>)}</div>
    </ModulePage>
  );
}

export function Biblioteca() {
  const [search, setSearch] = useState("");
  const materials = LIBRARY.filter((m) => `${m.title} ${m.type} ${m.note}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <ModulePage eyebrow="BASE DE PESQUISA" title="Biblioteca" description="Consulte os materiais utilizados como fonte de conhecimento." icon={LibraryBig}>
      <div className="library-search"><Search size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar na biblioteca..." /></div>
      <div className="library-grid">{materials.map((m) => <article className="library-card" key={m.title}><div className="library-type">{m.type}</div><LibraryBig size={25} /><h2>{m.title}</h2><p>{m.note}</p><button className="secondary-button" onClick={() => alert(`Material '${m.title}' pronto para receber o arquivo PDF correspondente.`)}>Ver material<ArrowRight size={16} /></button></article>)}</div>
    </ModulePage>
  );
}

export function Flashcards() {
  const [state, update] = usePlatformState();
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [revealed, setRevealed] = useState({});
  function add(e) { e.preventDefault(); if (!front.trim() || !back.trim()) return; update((s) => ({ ...s, flashcards: [...s.flashcards, { id: Date.now(), front: front.trim(), back: back.trim(), reviews: 0 }] })); setFront(""); setBack(""); }
  function remove(id) { update((s) => ({ ...s, flashcards: s.flashcards.filter((f) => f.id !== id) })); }
  function review(id) { update((s) => ({ ...s, flashcards: s.flashcards.map((f) => f.id === id ? { ...f, reviews: (f.reviews || 0) + 1 } : f) })); }
  return (
    <ModulePage eyebrow="REVISÃO" title="Flashcards" description="Crie cartões e faça revisões rápidas." icon={BrainCircuit}>
      <form className="flash-form" onSubmit={add}><input value={front} onChange={(e) => setFront(e.target.value)} placeholder="Frente: pergunta ou conceito" /><input value={back} onChange={(e) => setBack(e.target.value)} placeholder="Verso: resposta" /><button className="primary-button"><Plus size={17} />Criar</button></form>
      <div className="flash-grid">{state.flashcards.length === 0 ? <div className="empty-inline">Nenhum flashcard criado.</div> : state.flashcards.map((card) => <article className="flash-card" key={card.id}><div className="flash-top"><span>{card.reviews || 0} revisão(ões)</span><button className="danger-icon" onClick={() => remove(card.id)}><Trash2 size={17} /></button></div><h3>{card.front}</h3>{revealed[card.id] && <p>{card.back}</p>}<button className="secondary-button" onClick={() => { setRevealed((r) => ({ ...r, [card.id]: !r[card.id] })); if (!revealed[card.id]) review(card.id); }}>{revealed[card.id] ? <EyeOff size={16} /> : <Eye size={16} />}{revealed[card.id] ? "Ocultar resposta" : "Mostrar resposta"}</button></article>)}</div>
    </ModulePage>
  );
}

export function MapasMentais() {
  const [state, update] = usePlatformState();
  const [note, setNote] = useState("");
  function add(e) { e.preventDefault(); if (!note.trim()) return; update((s) => ({ ...s, mapNotes: [...s.mapNotes, { id: Date.now(), text: note.trim() }] })); setNote(""); }
  return (
    <ModulePage eyebrow="VISUALIZAÇÃO" title="Mapas Mentais" description="Registre conceitos-chave para organizar seus mapas." icon={Network}>
      <form className="map-form" onSubmit={add}><input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Novo conceito ou ramo..." /><button className="primary-button"><Plus size={17} />Adicionar</button></form>
      <div className="mind-board"><div className="mind-center">PDF CONCURSO EDU</div>{state.mapNotes.map((n) => <div className="mind-node" key={n.id}><Network size={17} /><span>{n.text}</span><button onClick={() => update((s) => ({ ...s, mapNotes: s.mapNotes.filter((x) => x.id !== n.id) }))}><Trash2 size={14} /></button></div>)}</div>
    </ModulePage>
  );
}

export function Configuracoes() {
  const [state, update] = usePlatformState();
  const [name, setName] = useState(state.settings.name || "Diego");
  const [goal, setGoal] = useState(state.settings.weeklyGoal || 300);
  function save(e) { e.preventDefault(); update((s) => ({ ...s, settings: { ...s.settings, name: name.trim() || "Diego", weeklyGoal: Number(goal) || 300 } })); }
  function reset() { if (window.confirm("Apagar todos os dados locais da plataforma?")) { saveState(DEFAULT_STATE); window.location.reload(); } }
  return (
    <ModulePage eyebrow="SISTEMA" title="Configurações" description="Preferências e dados locais da plataforma." icon={Settings2}>
      <form className="settings-form" onSubmit={save}><label>Nome exibido<input value={name} onChange={(e) => setName(e.target.value)} /></label><label>Meta semanal (minutos)<input type="number" min="30" value={goal} onChange={(e) => setGoal(e.target.value)} /></label><button className="primary-button"><Save size={17} />Salvar preferências</button></form>
      <div className="settings-danger"><div><strong>Reiniciar dados locais</strong><p>Apaga respostas, cronograma, flashcards, progresso e preferências deste navegador.</p></div><button onClick={reset}><RotateCcw size={17} />Reiniciar</button></div>
    </ModulePage>
  );
}
