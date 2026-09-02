import { ALL_QUESTIONS as RAW_ALL_QUESTIONS } from "./questionSources/index.js";
import { auditQuestionBank } from "./questionAuditEngine.js";

export * from "./questionSources/index.js";

export const GLOBAL_QUESTION_AUDIT=auditQuestionBank(RAW_ALL_QUESTIONS);
export const ALL_QUESTIONS=GLOBAL_QUESTION_AUDIT.published;
export const OCR_QUARANTINED_QUESTIONS=GLOBAL_QUESTION_AUDIT.quarantined;
export const GLOBAL_DUPLICATE_QUESTIONS=GLOBAL_QUESTION_AUDIT.duplicates;
export const GLOBAL_QUESTION_AUDIT_STATS=GLOBAL_QUESTION_AUDIT.stats;
