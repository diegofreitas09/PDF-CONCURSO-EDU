import { REGISTERED_QUESTIONS } from "../data/questionRegistry";

const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
export const PLATFORM_SELECTION_KEY = "pdf-concurso-edu-selection-v1";

export function normalizeLabel(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export const QUESTION_CATALOG = REGISTERED_QUESTIONS;

export const DISCIPLINES = [...new Set(
  QUESTION_CATALOG.map((q) => q.discipline).filter(Boolean)
)].sort(collator.compare);

export function topicsFor(discipline = "") {
  return [...new Set(
    QUESTION_CATALOG
      .filter((q) => !discipline || q.discipline === discipline)
      .map((q) => q.topic)
      .filter(Boolean)
  )].sort(collator.compare);
}

export function questionCount(discipline = "", topic = "") {
  return QUESTION_CATALOG.filter(
    (q) =>
      (!discipline || q.discipline === discipline) &&
      (!topic || q.topic === topic)
  ).length;
}

export function questionPool(discipline = "", topic = "") {
  return QUESTION_CATALOG.filter(
    (q) =>
      (!discipline || q.discipline === discipline) &&
      (!topic || q.topic === topic)
  );
}

export const DISCIPLINE_STATS = DISCIPLINES.map((discipline) => {
  const questions = questionCount(discipline);
  const topics = topicsFor(discipline);
  return { discipline, questions, topics, topicCount: topics.length };
});

export const TOTAL_TOPICS = DISCIPLINE_STATS.reduce((sum, item) => sum + item.topicCount, 0);

export function buildQuestionsRoute(discipline = "", topic = "") {
  const params = new URLSearchParams();
  if (discipline) params.set("disciplina", discipline);
  if (topic) params.set("topico", topic);
  const query = params.toString();
  return query ? `/questoes?${query}` : "/questoes";
}

export function readPlatformSelection() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PLATFORM_SELECTION_KEY) || "{}");
    const discipline = DISCIPLINES.includes(parsed.discipline) ? parsed.discipline : "";
    const validTopics = topicsFor(discipline);
    const topic = parsed.topic && validTopics.includes(parsed.topic) ? parsed.topic : "";
    return { discipline, topic };
  } catch {
    return { discipline: "", topic: "" };
  }
}

export function savePlatformSelection(discipline = "", topic = "") {
  const safeDiscipline = DISCIPLINES.includes(discipline) ? discipline : "";
  const validTopics = topicsFor(safeDiscipline);
  const safeTopic = topic && validTopics.includes(topic) ? topic : "";
  const next = { discipline: safeDiscipline, topic: safeTopic };
  localStorage.setItem(PLATFORM_SELECTION_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("pdfedu-selection", { detail: next }));
  return next;
}

export function resolveQuestionSearch(term = "") {
  const query = normalizeLabel(term);
  if (!query) return null;

  const disciplineExact = DISCIPLINES.find((d) => normalizeLabel(d) === query);
  if (disciplineExact) {
    return { discipline: disciplineExact, topic: "", route: buildQuestionsRoute(disciplineExact) };
  }

  for (const discipline of DISCIPLINES) {
    const topicExact = topicsFor(discipline).find((t) => normalizeLabel(t) === query);
    if (topicExact) {
      return {
        discipline,
        topic: topicExact,
        route: buildQuestionsRoute(discipline, topicExact),
      };
    }
  }

  const disciplineContains = DISCIPLINES.find((d) => {
    const nd = normalizeLabel(d);
    return nd.includes(query) || query.includes(nd);
  });
  if (disciplineContains) {
    return { discipline: disciplineContains, topic: "", route: buildQuestionsRoute(disciplineContains) };
  }

  for (const discipline of DISCIPLINES) {
    const topicContains = topicsFor(discipline).find((t) => {
      const nt = normalizeLabel(t);
      return nt.includes(query) || query.includes(nt);
    });
    if (topicContains) {
      return {
        discipline,
        topic: topicContains,
        route: buildQuestionsRoute(discipline, topicContains),
      };
    }
  }

  return null;
}

export function answeredCoverage(answers = [], discipline = "", topic = "") {
  const pool = questionPool(discipline, topic);
  const allowed = new Set(pool.flatMap((q) => [q.id, q.bankId, q.legacyId].filter(Boolean).map(String)));
  const relevant = answers.filter((a) =>
    (!discipline || a.discipline === discipline) &&
    (!topic || a.topic === topic)
  );
  const uniqueAnswered = new Set(
    relevant
      .map((a) => String(a.questionId || ""))
      .filter((id) => id && (!allowed.size || allowed.has(id)))
  ).size;
  return {
    bank: pool.length,
    answered: relevant.length,
    uniqueAnswered,
    coverage: pool.length ? Math.min(100, Math.round((uniqueAnswered / pool.length) * 100)) : 0,
  };
}
