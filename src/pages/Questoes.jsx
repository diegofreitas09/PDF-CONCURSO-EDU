import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Bot,
  CheckCircle2,
  ListChecks,
  Shuffle,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { QUESTION_BANK } from "../data/questionBank";
import "../styles/questions.css";

const STORAGE_KEY = "pdf-concurso-edu-state-v1";
const REVIEW_KEY = "pdf-concurso-edu-review-questions";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { answers: [] };
  } catch {
    return { answers: [] };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event("pdfedu-state"));
}

function loadReview() {
  try {
    return JSON.parse(localStorage.getItem(REVIEW_KEY)) || [];
  } catch {
    return [];
  }
}

export default function Questoes() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [state, setState] = useState(loadState);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [index, setIndex] = useState(0);
  const [reviewIds, setReviewIds] = useState(loadReview);

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
    () => QUESTION_BANK.filter((q) =>
      (!discipline || q.discipline === discipline) &&
      (!topic || q.topic === topic)
    ),
    [discipline, topic]
  );

  const current = filtered[index] || null;
  const isMarked = current ? reviewIds.includes(current.id) : false;

  useEffect(() => {
    setIndex(0);
    setSelected(null);
    setChecked(false);
  }, [discipline, topic]);

  useEffect(() => {
    if (index >= filtered.length && filtered.length) setIndex(0);
  }, [filtered.length, index]);

  function changeQuestion(nextIndex) {
    if (!filtered.length) return;
    const safeIndex = (nextIndex + filtered.length) % filtered.length;
    setIndex(safeIndex);
    setSelected(null);
    setChecked(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function selectOption(optionIndex) {
    if (checked) return;
    setSelected(optionIndex);
  }

  function correctQuestion() {
    if (selected === null || !current || checked) return;

    const record = {
      questionId: current.id,
      correct: selected === current.answer,
      selected,
      answer: current.answer,
      at: new Date().toISOString(),
      discipline: current.discipline,
      topic: current.topic,
    };

    const latest = loadState();
    const nextState = {
      ...latest,
      answers: [...(latest.answers || []), record],
    };

    saveState(nextState);
    setState(nextState);
    setChecked(true);
  }

  function toggleReview() {
    if (!current) return;
    const next = isMarked
      ? reviewIds.filter((id) => id !== current.id)
      : [...reviewIds, current.id];
    setReviewIds(next);
    localStorage.setItem(REVIEW_KEY, JSON.stringify(next));
  }

  function randomQuestion() {
    if (filtered.length <= 1) return;
    let next = index;
    while (next === index) next = Math.floor(Math.random() * filtered.length);
    changeQuestion(next);
  }

  function explainWithAI() {
    if (!current) return;
    const alternatives = current.options
      .map((option, i) => `${String.fromCharCode(65 + i)}) ${option}`)
      .join("\n");
    const prompt = `Explique esta questão de concurso de forma didática, indicando por que a alternativa correta está certa e, quando possível, por que as demais estão erradas.\n\n${current.statement}\n\n${alternatives}\n\nGabarito: ${String.fromCharCode(65 + current.answer)}.`;
    navigate(`/assistente-ia?pergunta=${encodeURIComponent(prompt)}`);
  }

  function updateDiscipline(value) {
    const next = new URLSearchParams(params);
    value ? next.set("disciplina", value) : next.delete("disciplina");
    next.delete("topico");
    setParams(next);
  }

  function updateTopic(value) {
    const next = new URLSearchParams(params);
    value ? next.set("topico", value) : next.delete("topico");
    setParams(next);
  }

  return (
    <section className="page questions-page">
      <div className="questions-title">
        <div>
          <div className="page-eyebrow">BANCO DE QUESTÕES</div>
          <h1>Questões</h1>
          <p>Filtre, responda e acompanhe seus resultados.</p>
        </div>
        <div className="questions-title-icon"><ListChecks size={27} /></div>
      </div>

      <div className="question-filters-new">
        <select value={discipline} onChange={(e) => updateDiscipline(e.target.value)}>
          <option value="">Todas as disciplinas ({QUESTION_BANK.length})</option>
          {disciplines.map((name) => (
            <option key={name} value={name}>
              {name} ({QUESTION_BANK.filter((q) => q.discipline === name).length})
            </option>
          ))}
        </select>

        <select value={topic} onChange={(e) => updateTopic(e.target.value)}>
          <option value="">Todos os tópicos</option>
          {topics.map((name) => (
            <option key={name} value={name}>
              {name} ({QUESTION_BANK.filter((q) => (!discipline || q.discipline === discipline) && q.topic === name).length})
            </option>
          ))}
        </select>
        <span>{filtered.length} questão(ões)</span>
      </div>

      {!current ? (
        <div className="question-empty">
          <ListChecks size={42} />
          <h2>Nenhuma questão encontrada</h2>
          <p>Altere os filtros para continuar.</p>
        </div>
      ) : (
        <article className="question-panel">
          <header className="question-panel-header">
            <div>
              <strong>Questão {index + 1} de {filtered.length}</strong>
              <span>{current.discipline} · {current.topic}</span>
            </div>
            <button type="button" className={`review-button ${isMarked ? "active" : ""}`} onClick={toggleReview}>
              <Bookmark size={17} fill={isMarked ? "currentColor" : "none"} />
              {isMarked ? "Marcada para revisar" : "Marcar para revisar"}
            </button>
          </header>

          <div className="question-body">
            <h2>{current.statement}</h2>

            <div className="question-options-new" role="radiogroup" aria-label="Alternativas da questão">
              {current.options.map((option, i) => {
                const selectedNow = selected === i;
                const correct = checked && i === current.answer;
                const wrong = checked && selectedNow && i !== current.answer;
                const className = [
                  "question-option",
                  selectedNow ? "selected" : "",
                  correct ? "correct" : "",
                  wrong ? "wrong" : "",
                ].filter(Boolean).join(" ");

                return (
                  <button
                    type="button"
                    key={`${current.id}-${i}`}
                    className={className}
                    onClick={() => selectOption(i)}
                    disabled={checked}
                    role="radio"
                    aria-checked={selectedNow}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="option-text">{option}</span>
                    {correct && <CheckCircle2 className="option-result-icon" size={20} />}
                  </button>
                );
              })}
            </div>

            <div className="question-navigation">
              <div className="question-navigation-left">
                <button type="button" className="ghost-question-button" onClick={() => changeQuestion(index - 1)}>
                  <ArrowLeft size={17} /> Anterior
                </button>
                <button type="button" className="ghost-question-button" onClick={randomQuestion}>
                  <Shuffle size={17} /> Aleatória
                </button>
              </div>

              <div className="question-navigation-right">
                {!checked ? (
                  <button type="button" className="correct-question-button" disabled={selected === null} onClick={correctQuestion}>
                    Corrigir questão
                  </button>
                ) : (
                  <button type="button" className="correct-question-button checked" disabled>
                    Questão corrigida
                  </button>
                )}
                <button type="button" className="next-question-button" onClick={() => changeQuestion(index + 1)}>
                  {checked ? "Próxima questão" : "Pular questão"} <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </article>
      )}

      {checked && current && (
        <section className={`question-feedback ${selected === current.answer ? "success" : "error"}`}>
          <div className="feedback-top">
            <div>
              <strong>Gabarito: {String.fromCharCode(65 + current.answer)}</strong>
              <span>{selected === current.answer ? "Você acertou!" : `Você marcou ${String.fromCharCode(65 + selected)}.`}</span>
            </div>
            <button type="button" onClick={explainWithAI}><Bot size={17} /> Explicar com IA</button>
          </div>
          <div className="feedback-comment">
            <strong>Comentário da questão</strong>
            <p>{current.explanation || "Comentário detalhado ainda não cadastrado para esta questão."}</p>
          </div>
        </section>
      )}

      <div className="question-history-new">
        Respondidas no histórico: <strong>{(state.answers || []).length}</strong>
      </div>
    </section>
  );
}
