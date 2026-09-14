// UECE por Assunto — Química — fechamento cumulativo auditável 001–537.
// 501–537: Orgânica 106–109 (4) + Reações Químicas (14) + Termoquímica (19).
import { UECE_QUIMICA_LOTE_500 } from "./ueceQuimicaLote100.js";
import { UECE_QUIMICA_ORGANICA_FINAL_04 } from "./ueceQuimicaOrganicaFinal04.js";
import { UECE_QUIMICA_REACOES_14 } from "./ueceQuimicaReacoes14.js";
import { UECE_QUIMICA_TERMOQUIMICA_19 } from "./ueceQuimicaTermoquimica19.js";

const TERMOQUIMICA_19 = UECE_QUIMICA_TERMOQUIMICA_19.filter((q) => q.discipline === "Química" && q.topic === "Termoquímica");

export const UECE_QUIMICA_LOTE_537 = [
  ...UECE_QUIMICA_LOTE_500,
  ...UECE_QUIMICA_ORGANICA_FINAL_04,
  ...UECE_QUIMICA_REACOES_14,
  ...TERMOQUIMICA_19,
];

// Compatibilidade com o agregador principal: alias cumulativo mais recente.
export const UECE_QUIMICA_LOTE_100 = UECE_QUIMICA_LOTE_537;
