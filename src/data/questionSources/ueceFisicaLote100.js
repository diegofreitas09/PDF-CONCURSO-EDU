// UECE por Assunto — Física — primeiro lote de 100 questões em ordem da fonte.
// Composição: Análise Dimensional 1–32 + Cinemática 1–55 + Dinâmica 1–13.
import { UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27 } from "./ueceFisicaAnaliseDimensionalLote27.js";
import { UECE_FISICA_ANALISE_DIMENSIONAL_COMPLEMENTO_05 } from "./ueceFisicaAnaliseDimensionalComplemento05.js";
import { UECE_FISICA_CINEMATICA_LOTE_18 } from "./ueceFisicaCinematicaLote18.js";
import { UECE_FISICA_CINEMATICA_LOTE_09 } from "./ueceFisicaCinematicaLote09.js";
import { UECE_FISICA_DINAMICA_VISUAL_01 } from "./ueceFisicaDinamicaVisual01.js";
import { UECE_FISICA_CINEMATICA_COMPLEMENTO_23 } from "./ueceFisicaCinematicaComplemento23.js";
import { UECE_FISICA_CINEMATICA_COMPLEMENTO_VISUAL_04 } from "./ueceFisicaCinematicaComplementoVisual04.js";
import { UECE_FISICA_DINAMICA_COMPLEMENTO_01 } from "./ueceFisicaDinamicaComplemento01.js";
import { UECE_FISICA_DINAMICA_LOTE_03 } from "./ueceFisicaDinamicaLote03.js";
import { UECE_FISICA_DINAMICA_LOTE_02 } from "./ueceFisicaDinamicaLote02.js";
import { UECE_FISICA_DINAMICA_LOTE_22 } from "./ueceFisicaDinamicaLote22.js";

const sourceNumber=q=>Number(String(q.id||"").match(/(\d+)$/)?.[1]||0);
const ordered=(items)=>[...items].sort((a,b)=>sourceNumber(a)-sourceNumber(b));
const enrich=(q)=>({...q,sourceQuestion:q.sourceQuestion||sourceNumber(q),reviewed:q.reviewed===true});

const ANALISE_DIMENSIONAL=ordered([
  ...UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27,
  ...UECE_FISICA_ANALISE_DIMENSIONAL_COMPLEMENTO_05
]).map(enrich);

const CINEMATICA=ordered([
  ...UECE_FISICA_CINEMATICA_LOTE_18,
  ...UECE_FISICA_CINEMATICA_LOTE_09,
  ...UECE_FISICA_DINAMICA_VISUAL_01,
  ...UECE_FISICA_CINEMATICA_COMPLEMENTO_23,
  ...UECE_FISICA_CINEMATICA_COMPLEMENTO_VISUAL_04
]).map(enrich);

const DINAMICA_1_13=ordered([
  ...UECE_FISICA_DINAMICA_COMPLEMENTO_01,
  ...UECE_FISICA_DINAMICA_LOTE_03,
  ...UECE_FISICA_DINAMICA_LOTE_02,
  ...UECE_FISICA_DINAMICA_LOTE_22
].filter(q=>sourceNumber(q)<=13)).map(enrich);

export const UECE_FISICA_LOTE_100=[...ANALISE_DIMENSIONAL,...CINEMATICA,...DINAMICA_1_13];

export const UECE_FISICA_LOTE_100_AUDIT={
  total:UECE_FISICA_LOTE_100.length,
  analiseDimensional:ANALISE_DIMENSIONAL.length,
  cinematica:CINEMATICA.length,
  dinamica:DINAMICA_1_13.length,
  uniqueIds:new Set(UECE_FISICA_LOTE_100.map(q=>q.id)).size,
  reviewed:UECE_FISICA_LOTE_100.filter(q=>q.reviewed===true).length,
  withMedia:UECE_FISICA_LOTE_100.filter(q=>q.media).length,
  missingRequired:UECE_FISICA_LOTE_100.filter(q=>!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation).map(q=>q.id)
};
