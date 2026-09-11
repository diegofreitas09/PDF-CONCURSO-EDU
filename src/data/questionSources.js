import { ALL_QUESTIONS as RAW_ALL_QUESTIONS } from "./questionSources/index.js";
import { SEDUC_P1_LOTE_300_02 } from "./questionSources/seducP1Lote300_02.js";
import { UECE_MATEMATICA_LOTE_20 } from "./questionSources/ueceMatematicaLote120.js";
import { UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27 } from "./questionSources/ueceFisicaAnaliseDimensionalLote27.js";
import { auditQuestionBank } from "./questionAuditEngine.js";

export * from "./questionSources/index.js";

const RAW_WITH_NEW_BATCHES=[...RAW_ALL_QUESTIONS,...SEDUC_P1_LOTE_300_02,...UECE_MATEMATICA_LOTE_20,...UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27];
export const GLOBAL_QUESTION_AUDIT=auditQuestionBank(RAW_WITH_NEW_BATCHES);
export const ALL_QUESTIONS=GLOBAL_QUESTION_AUDIT.published;
export const OCR_QUARANTINED_QUESTIONS=GLOBAL_QUESTION_AUDIT.quarantined;
export const GLOBAL_DUPLICATE_QUESTIONS=GLOBAL_QUESTION_AUDIT.duplicates;
export const GLOBAL_QUESTION_AUDIT_STATS=GLOBAL_QUESTION_AUDIT.stats;
