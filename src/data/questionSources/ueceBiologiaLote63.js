// UECE por Assunto — Biologia — primeiro bloco conectado (63 questões).
// Ordem da apostila: Origem da Vida (30) + Taxonomia/Sistemática/Evolução (28) + Microbiologia 1–5 (5).
import { UECE_BIOLOGIA_ORIGEM_VIDA_30 } from "./ueceBiologiaOrigemVida30.js";
import { UECE_BIOLOGIA_TAXONOMIA_EVOLUCAO_28 } from "./ueceBiologiaTaxonomiaEvolucao28.js";
import { UECE_BIOLOGIA_MICROBIOLOGIA_37 } from "./ueceBiologiaMicrobiologia37.js";

const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);
const MICROBIOLOGIA_001_A_005 = UECE_BIOLOGIA_MICROBIOLOGIA_37.filter((q) => numero(q) >= 1 && numero(q) <= 5);

export const UECE_BIOLOGIA_LOTE_63 = [
  ...UECE_BIOLOGIA_ORIGEM_VIDA_30,
  ...UECE_BIOLOGIA_TAXONOMIA_EVOLUCAO_28,
  ...MICROBIOLOGIA_001_A_005,
];
