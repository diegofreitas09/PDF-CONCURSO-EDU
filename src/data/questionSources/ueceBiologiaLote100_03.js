// UECE por Assunto — Biologia — lote 164–263 (100 questões íntegras).
// Ordem: Botânica 9–65 (57) + Citologia 1–41 (41) + Ecologia 1–2 (2).
import { UECE_BIOLOGIA_BOTANICA_15 } from "./ueceBiologiaBotanica15.js";
import { UECE_BIOLOGIA_BOTANICA_16_25 } from "./ueceBiologiaBotanica16a25.js";
import { UECE_BIOLOGIA_BOTANICA_26_35 } from "./ueceBiologiaBotanica26a35.js";
import { UECE_BIOLOGIA_BOTANICA_36_45 } from "./ueceBiologiaBotanica36a45.js";
import { UECE_BIOLOGIA_BOTANICA_46_55 } from "./ueceBiologiaBotanica46a55.js";
import { UECE_BIOLOGIA_BOTANICA_56_65 } from "./ueceBiologiaBotanica56a65.js";
import { UECE_BIOLOGIA_CITOLOGIA_01_14 } from "./ueceBiologiaCitologia01a14.js";
import { UECE_BIOLOGIA_CITOLOGIA_15_28 } from "./ueceBiologiaCitologia15a28.js";
import { UECE_BIOLOGIA_CITOLOGIA_29_41_ECOLOGIA_01_02 } from "./ueceBiologiaCitologia29a41Ecologia01a02.js";

const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);
const BOTANICA_009_A_015=UECE_BIOLOGIA_BOTANICA_15
  .filter((q)=>numero(q)>=9&&numero(q)<=15)
  .map((q)=>({...q,reviewed:true}));

export const UECE_BIOLOGIA_LOTE_100_03=[
  ...BOTANICA_009_A_015,
  ...UECE_BIOLOGIA_BOTANICA_16_25,
  ...UECE_BIOLOGIA_BOTANICA_26_35,
  ...UECE_BIOLOGIA_BOTANICA_36_45,
  ...UECE_BIOLOGIA_BOTANICA_46_55,
  ...UECE_BIOLOGIA_BOTANICA_56_65,
  ...UECE_BIOLOGIA_CITOLOGIA_01_14,
  ...UECE_BIOLOGIA_CITOLOGIA_15_28,
  ...UECE_BIOLOGIA_CITOLOGIA_29_41_ECOLOGIA_01_02,
];
