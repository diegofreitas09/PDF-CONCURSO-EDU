// UECE por Assunto — Química — lote cumulativo auditado 001–200.
// 001–100: Análise de espécies químicas (34), Atomística (60), Bioquímica (1–6).
// 101–200: Bioquímica restante (11), Cinética Química (15), Química Ambiental (10),
// Propriedades periódicas (18), Coloides (6), Eletrólise (9), Eletroquímica (18)
// e Equilíbrio Químico (1–13). Itens incompletos permanecem fora; nada é reconstruído.
import { UECE_QUIMICA_ANALISE_ESPECIES_LOTE_09 } from "./ueceQuimicaAnaliseEspeciesLote09.js";
import { UECE_QUIMICA_ANALISE_ESPECIES_LOTE_25 } from "./ueceQuimicaAnaliseEspeciesLote25.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_09 } from "./ueceQuimicaAtomisticaLote09.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_10B } from "./ueceQuimicaAtomisticaLote10b.js";
import { UECE_QUIMICA_ATOMISTICA_LOTE_40C } from "./ueceQuimicaAtomisticaLote40c.js";
import { UECE_QUIMICA_BIOQUIMICA_LOTE_01 } from "./ueceQuimicaBioquimicaLote01.js";
import { UECE_QUIMICA_BIOQUIMICA_VISUAIS_02 } from "./ueceQuimicaBioquimicaVisuais02.js";
import { UECE_QUIMICA_CINETICA_LOTE_15 } from "./ueceQuimicaCineticaLote15.js";
import { UECE_QUIMICA_AMBIENTAL_LOTE_10 } from "./ueceQuimicaAmbientalLote10.js";
import { UECE_QUIMICA_PROPRIEDADES_PERIODICAS_LOTE_18 } from "./ueceQuimicaPropriedadesPeriodicasLote18.js";
import { UECE_QUIMICA_COLOIDES_LOTE_06 } from "./ueceQuimicaColoidesLote06.js";
import { UECE_QUIMICA_ELETROLISE_LOTE_09 } from "./ueceQuimicaEletroliseLote09.js";
import { UECE_QUIMICA_ELETROQUIMICA_LOTE_18 } from "./ueceQuimicaEletroquimicaLote18.js";
import { UECE_QUIMICA_EQUILIBRIO_LOTE_20 } from "./ueceQuimicaEquilibrioLote20.js";

const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);

const BIOQUIMICA_001_A_006 = UECE_QUIMICA_BIOQUIMICA_LOTE_01.filter((q) => {
  const n = numero(q);
  return Number.isInteger(n) && n >= 1 && n <= 6;
});

const BIOQUIMICA_007_A_017 = [
  ...UECE_QUIMICA_BIOQUIMICA_LOTE_01.filter((q) => numero(q) >= 7),
  ...UECE_QUIMICA_BIOQUIMICA_VISUAIS_02,
].sort((a, b) => numero(a) - numero(b));

const EQUILIBRIO_001_A_013 = UECE_QUIMICA_EQUILIBRIO_LOTE_20.filter((q) => {
  const n = numero(q);
  return Number.isInteger(n) && n >= 1 && n <= 13;
});

export const UECE_QUIMICA_LOTE_200 = [
  ...UECE_QUIMICA_ANALISE_ESPECIES_LOTE_09,
  ...UECE_QUIMICA_ANALISE_ESPECIES_LOTE_25,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_09,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_10B,
  ...UECE_QUIMICA_ATOMISTICA_LOTE_40C,
  ...BIOQUIMICA_001_A_006,
  ...BIOQUIMICA_007_A_017,
  ...UECE_QUIMICA_CINETICA_LOTE_15,
  ...UECE_QUIMICA_AMBIENTAL_LOTE_10,
  ...UECE_QUIMICA_PROPRIEDADES_PERIODICAS_LOTE_18,
  ...UECE_QUIMICA_COLOIDES_LOTE_06,
  ...UECE_QUIMICA_ELETROLISE_LOTE_09,
  ...UECE_QUIMICA_ELETROQUIMICA_LOTE_18,
  ...EQUILIBRIO_001_A_013,
];

// Compatibilidade com o agregador principal já conectado no projeto.
export const UECE_QUIMICA_LOTE_100 = UECE_QUIMICA_LOTE_200;
