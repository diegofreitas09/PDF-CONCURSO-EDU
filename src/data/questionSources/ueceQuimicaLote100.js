// UECE por Assunto — Química — lote auditado 001–100.
// Ordem da apostila: Análise de espécies químicas (34 íntegras), Atomística (60) e Bioquímica (6).
// Itens incompletos ausentes das fontes auditadas permanecem fora; nada é reconstruído.
import { UECE_QUIMICA_ANALISE_ESPECIES_LOTE_09 } from "./ueceQuimicaAnaliseEspeciesLote09.js";
import { UECE_QUIMICA_ANALISE_ESPECIES_LOTE_25 } from "./ueceQuimicaAnaliseEspeciesLote25.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_09 } from "./ueceQuimicaAtomisticaLote09.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_10B } from "./ueceQuimicaAtomisticaLote10b.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_40C } from "./ueceQuimicaAtomisticaLote40c.js";
import { UECE_QUIMICA_BIOQUIMICA_LOTE_01 } from "./ueceQuimicaBioquimicaLote01.js";

const BIOQUIMICA_001_A_006 = UECE_QUIMICA_BIOQUIMICA_LOTE_01.filter((q) => {
  const n = Number(String(q.id).match(/(\d+)$/)?.[1]);
  return Number.isInteger(n) && n >= 1 && n <= 6;
});

export const UECE_QUIMICA_LOTE_100 = [
  ...UECE_QUIMICA_ANALISE_ESPECIES_LOTE_09,
  ...UECE_QUIMICA_ANALISE_ESPECIES_LOTE_25,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_09,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_10B,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_40C,
  ...BIOQUIMICA_001_A_006,
];
