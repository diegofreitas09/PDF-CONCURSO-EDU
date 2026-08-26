import { QUESTION_BANK as LEGACY_QUESTION_BANK } from "../questionBank";
import { SIMULADO_05_TEORIAS_PEDAGOGICAS } from "./simulado05TeoriasPedagogicas";

/**
 * Banco unificado da plataforma.
 * Cada novo material deve ser importado como um lote separado em questionSources/.
 * Isso permite auditoria por fonte, deduplicação e atualização sem editar o banco legado.
 */
export const ALL_QUESTIONS = [
  ...LEGACY_QUESTION_BANK,
  ...SIMULADO_05_TEORIAS_PEDAGOGICAS,
];

export const QUESTION_SOURCE_STATS = {
  legado: LEGACY_QUESTION_BANK.length,
  simulado05TeoriasPedagogicas: SIMULADO_05_TEORIAS_PEDAGOGICAS.length,
  total: LEGACY_QUESTION_BANK.length + SIMULADO_05_TEORIAS_PEDAGOGICAS.length,
};
