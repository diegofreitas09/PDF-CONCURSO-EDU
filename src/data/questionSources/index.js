import "../../styles/questionAudit.css";
import { QUESTION_BANK as LEGACY_QUESTION_BANK } from "../questionBank";
import { SIMULADO_05_TEORIAS_PEDAGOGICAS } from "./simulado05TeoriasPedagogicas";
import { SEDUC_CONHECIMENTOS_GERAIS_MODULO_1 } from "./seducConhecimentosGeraisModulo1";
import { APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01 } from "./apostilaPresencialSeducPedagogicos01";
import { PORTUGUES_APOSTILA_PRESENCIAL } from "./portuguesApostilaPresencial";
import { INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL } from "./indicadoresEducacionaisApostilaPresencial";
import { ADMINISTRACAO_PUBLICA_SEDUC_01 } from "./administracaoPublicaSeduc01";

/**
 * Camada de auditoria do banco.
 * Corrige problemas típicos de OCR antes de qualquer questão aparecer ao aluno.
 */
function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}

function hasEmbeddedContext(q) {
  return Boolean(q?.context || q?.passage || q?.supportText || q?.texto || q?.textBase || q?.baseText);
}

function getContext(q) {
  return cleanText(q?.context || q?.passage || q?.supportText || q?.texto || q?.textBase || q?.baseText || "");
}

function dependsOnText(statement = "") {
  const s = cleanText(statement).toLowerCase();
  const patterns = [
    /\bno texto[\s:“\"']/, /\bno texto intitulado\b/, /\bde acordo com o texto\b/,
    /\bcom base no texto\b/, /\bcom base no trecho\b/, /\ba partir do texto\b/,
    /\bsegundo o texto\b/, /\btexto acima\b/, /\btexto anterior\b/, /\bleia o texto\b/,
    /\bleia o trecho\b/, /\bconsidere o texto\b/, /\bobserve o texto\b/,
    /\binterpretação coerente com o texto\b/, /\bideia central do texto\b/, /\bautor do texto\b/
  ];
  return patterns.some(pattern => pattern.test(s));
}

/**
 * PDFs em colunas fizeram o OCR anexar o texto-base ao fim da última alternativa.
 * Ex.: "Alternativa E. 43 TEXTO TÍTULO...".
 * Este método separa a alternativa do texto sem apagar o conteúdo recuperado.
 */
function splitPassageFromOption(option = "") {
  const text = cleanText(option);
  const marker = /(?:\s|^)(?:\d{1,3}\s+)?TEXTO(?:\s+\d+)?\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/i;
  const match = marker.exec(text);
  if (!match) return null;

  const before = cleanText(text.slice(0, match.index)).replace(/\s+\d{1,3}\s*$/, "").trim();
  const rawPassage = cleanText(text.slice(match.index));
  const passage = rawPassage
    .replace(/^\d{1,3}\s+TEXTO(?:\s+\d+)?\s+/i, "")
    .replace(/^TEXTO(?:\s+\d+)?\s+/i, "")
    .trim();

  if (!before || passage.length < 120) return null;
  return { option: before, passage };
}

function normalizeQuestion(q, sourceIndex, inheritedContext = "") {
  const originalOptions = Array.isArray(q?.options) ? q.options : [];
  const options = originalOptions.map(cleanText);
  const explicitContext = getContext(q);
  const context = explicitContext || inheritedContext || "";
  const statement = cleanText(q?.statement);

  const suspiciousOversizedOption = options.some(option => option.length > 900);
  const missingContext = dependsOnText(statement) && !context;

  return {
    ...q,
    id: q?.id ?? `audit-${sourceIndex}`,
    statement,
    context,
    options,
    explanation: cleanText(q?.explanation),
    auditStatus: missingContext ? "missing-context" : (suspiciousOversizedOption ? "oversized-option" : (q?.auditStatus || "ok"))
  };
}

/**
 * Recupera textos-base sequenciais no banco legado.
 * Um texto encontrado no fim de uma alternativa passa a valer para as questões seguintes,
 * até que um novo marcador TEXTO seja encontrado.
 */
function recoverLegacyQuestions(questions) {
  let activeContext = "";
  let recoveredPassages = 0;
  const recovered = [];

  questions.forEach((raw, index) => {
    const cloned = { ...raw, options: Array.isArray(raw?.options) ? [...raw.options] : [] };

    // A questão atual usa o texto recuperado anteriormente.
    const normalized = normalizeQuestion(cloned, index, activeContext);

    let nextContext = activeContext;
    const cleanedOptions = [];
    for (const option of normalized.options) {
      const split = splitPassageFromOption(option);
      if (split) {
        cleanedOptions.push(split.option);
        nextContext = split.passage;
        recoveredPassages += 1;
      } else {
        cleanedOptions.push(option);
      }
    }

    // Recalcula status após retirar o texto gigante da alternativa.
    const fixed = {
      ...normalized,
      options: cleanedOptions,
      auditStatus: dependsOnText(normalized.statement) && !normalized.context ? "missing-context" : (normalized.auditStatus === "oversized-option" && !cleanedOptions.some(o => o.length > 900) ? "ok" : normalized.auditStatus)
    };

    recovered.push(fixed);
    activeContext = nextContext;
  });

  return { questions: recovered, recoveredPassages };
}

function normalizeAuthoredSource(questions, prefix) {
  return questions.map((q, i) => normalizeQuestion(q, `${prefix}-${i}`));
}

const LEGACY_RECOVERY = recoverLegacyQuestions(LEGACY_QUESTION_BANK);
const RAW_QUESTIONS = [
  ...LEGACY_RECOVERY.questions,
  ...normalizeAuthoredSource(SIMULADO_05_TEORIAS_PEDAGOGICAS, "sim05"),
  ...normalizeAuthoredSource(SEDUC_CONHECIMENTOS_GERAIS_MODULO_1, "seduc1"),
  ...normalizeAuthoredSource(APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01, "ped01"),
  ...normalizeAuthoredSource(PORTUGUES_APOSTILA_PRESENCIAL, "port"),
  ...normalizeAuthoredSource(INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL, "ind"),
  ...normalizeAuthoredSource(ADMINISTRACAO_PUBLICA_SEDUC_01, "adm"),
];

export const AUDITED_QUESTIONS = RAW_QUESTIONS;
export const QUARANTINED_QUESTIONS = AUDITED_QUESTIONS.filter(q => q.auditStatus === "missing-context" || q.auditStatus === "oversized-option");
export const ALL_QUESTIONS = AUDITED_QUESTIONS.filter(q => q.auditStatus !== "missing-context" && q.auditStatus !== "oversized-option");

export const QUESTION_AUDIT_STATS = {
  raw: AUDITED_QUESTIONS.length,
  published: ALL_QUESTIONS.length,
  recoveredPassagesFromOptions: LEGACY_RECOVERY.recoveredPassages,
  quarantinedMissingContext: AUDITED_QUESTIONS.filter(q => q.auditStatus === "missing-context").length,
  quarantinedOversizedOption: AUDITED_QUESTIONS.filter(q => q.auditStatus === "oversized-option").length,
};

export const QUESTION_SOURCE_STATS = {
  legado: LEGACY_QUESTION_BANK.length,
  simulado05TeoriasPedagogicas: SIMULADO_05_TEORIAS_PEDAGOGICAS.length,
  seducConhecimentosGeraisModulo1: SEDUC_CONHECIMENTOS_GERAIS_MODULO_1.length,
  apostilaPresencialSeducPedagogicos01: APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01.length,
  portuguesApostilaPresencial: PORTUGUES_APOSTILA_PRESENCIAL.length,
  indicadoresEducacionaisApostilaPresencial: INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL.length,
  administracaoPublicaSeduc01: ADMINISTRACAO_PUBLICA_SEDUC_01.length,
  total: ALL_QUESTIONS.length,
};
