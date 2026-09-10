import { ALL_QUESTIONS as RAW_ALL_QUESTIONS } from "./questionSources/index.js";
import { UECE_MATEMATICA_LOTE_20 } from "./questionSources/ueceMatematicaLote120.js";
import { auditQuestionBank } from "./questionAuditEngine.js";

export * from "./questionSources/index.js";

const RAW_WITH_UECE=[...RAW_ALL_QUESTIONS,...UECE_MATEMATICA_LOTE_20];
export const GLOBAL_QUESTION_AUDIT=auditQuestionBank(RAW_WITH_UECE);
export const ALL_QUESTIONS=GLOBAL_QUESTION_AUDIT.published;
export const OCR_QUARANTINED_QUESTIONS=GLOBAL_QUESTION_AUDIT.quarantined;
export const GLOBAL_DUPLICATE_QUESTIONS=GLOBAL_QUESTION_AUDIT.duplicates;
export const GLOBAL_QUESTION_AUDIT_STATS=GLOBAL_QUESTION_AUDIT.stats;
