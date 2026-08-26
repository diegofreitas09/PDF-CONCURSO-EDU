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
 * - remove marcações de Markdown/HTML herdadas de OCR;
 * - normaliza espaços e pontuação;
 * - impede a exibição de questões que dependem de texto-base ausente;
 * - preserva a questão original nos arquivos-fonte para futura revisão manual.
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
  return Boolean(
    q?.context || q?.passage || q?.supportText || q?.texto || q?.textBase || q?.baseText
  );
}

function dependsOnMissingText(q) {
  if (hasEmbeddedContext(q)) return false;
  const s = cleanText(q?.statement).toLowerCase();
  const patterns = [
    /\bno texto[\s:“\"']/,
    /\bno texto intitulado\b/,
    /\bde acordo com o texto\b/,
    /\bcom base no texto\b/,
    /\bcom base no trecho\b/,
    /\ba partir do texto\b/,
    /\bsegundo o texto\b/,
    /\btexto acima\b/,
    /\btexto anterior\b/,
    /\bleia o texto\b/,
    /\bleia o trecho\b/,
    /\bconsidere o texto\b/,
    /\bobserve o texto\b/
  ];
  return patterns.some((pattern) => pattern.test(s));
}

function normalizeQuestion(q, sourceIndex) {
  const options = Array.isArray(q?.options) ? q.options.map(cleanText) : [];
  return {
    ...q,
    id: q?.id ?? `audit-${sourceIndex}`,
    statement: cleanText(q?.statement),
    options,
    explanation: cleanText(q?.explanation),
    auditStatus: dependsOnMissingText(q) ? "missing-context" : (q?.auditStatus || "ok")
  };
}

const RAW_QUESTIONS = [
  ...LEGACY_QUESTION_BANK,
  ...SIMULADO_05_TEORIAS_PEDAGOGICAS,
  ...SEDUC_CONHECIMENTOS_GERAIS_MODULO_1,
  ...APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01,
  ...PORTUGUES_APOSTILA_PRESENCIAL,
  ...INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL,
  ...ADMINISTRACAO_PUBLICA_SEDUC_01,
];

export const AUDITED_QUESTIONS = RAW_QUESTIONS.map(normalizeQuestion);
export const QUARANTINED_QUESTIONS = AUDITED_QUESTIONS.filter(q => q.auditStatus === "missing-context");
export const ALL_QUESTIONS = AUDITED_QUESTIONS.filter(q => q.auditStatus !== "missing-context");

export const QUESTION_AUDIT_STATS = {
  raw: RAW_QUESTIONS.length,
  published: ALL_QUESTIONS.length,
  quarantinedMissingContext: QUARANTINED_QUESTIONS.length,
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
