// UECE por Assunto — Biologia — lote 264–363 (100 questões íntegras).
// Ordem: Ecologia 3–66 (64) + Genética 1–36 (36).
import { UECE_BIOLOGIA_ECOLOGIA_20 } from "./ueceBiologiaEcologia20.js";
import { UECE_BIOLOGIA_ECOLOGIA_20_COMPLEMENTO } from "./ueceBiologiaEcologia20Complemento.js";
import { UECE_BIOLOGIA_ECOLOGIA_26_COMPLEMENTO_FINAL } from "./ueceBiologiaEcologia26ComplementoFinal.js";
import { UECE_BIOLOGIA_GENETICA_28 } from "./ueceBiologiaGenetica28.js";
import { UECE_BIOLOGIA_GENETICA_29_36 } from "./ueceBiologiaGenetica29a36.js";

const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);

const ECOLOGIA_003_A_020=UECE_BIOLOGIA_ECOLOGIA_20.filter((q)=>numero(q)>=3&&numero(q)<=20);
const ECOLOGIA_003_A_066=[
  ...ECOLOGIA_003_A_020,
  ...UECE_BIOLOGIA_ECOLOGIA_20_COMPLEMENTO,
  ...UECE_BIOLOGIA_ECOLOGIA_26_COMPLEMENTO_FINAL,
].sort((a,b)=>numero(a)-numero(b));

const GENETICA_001_A_036=[
  ...UECE_BIOLOGIA_GENETICA_28,
  ...UECE_BIOLOGIA_GENETICA_29_36,
].sort((a,b)=>numero(a)-numero(b));

export const UECE_BIOLOGIA_LOTE_100_04=[
  ...ECOLOGIA_003_A_066,
  ...GENETICA_001_A_036,
];
