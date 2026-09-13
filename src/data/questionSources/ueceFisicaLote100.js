// UECE por Assunto — Física — coleção integrada em ordem da fonte.
// Compatibilidade: o nome histórico UECE_FISICA_LOTE_100 é preservado para o banco principal,
// mas agora aponta para 200 questões auditadas (lotes 001–100 e 101–200).
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
import { UECE_FISICA_DINAMICA_LOTE_17 } from "./ueceFisicaDinamicaLote17.js";
import { UECE_FISICA_ELETRODINAMICA_LOTE_20 } from "./ueceFisicaEletrodinamicaLote20.js";
import { UECE_FISICA_ELETRODINAMICA_LOTE_17 } from "./ueceFisicaEletrodinamicaLote17.js";
import { UECE_FISICA_TERMODINAMICA_LOTE_25 } from "./ueceFisicaTermodinamicaLote25.js";
import { UECE_FISICA_ELETRICA_CAPACITORES_LOTE_25 } from "./ueceFisicaEletricaCapacitoresLote25.js";

const sourceNumber=q=>Number(q.sourceQuestion || String(q.id||"").match(/(\d+)$/)?.[1] || 0);
const ordered=(items)=>[...items].sort((a,b)=>sourceNumber(a)-sourceNumber(b));
const orderedUnique=(items)=>{
  const seen=new Set();
  return ordered(items).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return true;});
};
const enrich=(q)=>({...q,sourceQuestion:q.sourceQuestion||sourceNumber(q),reviewed:q.reviewed===true});

const ANALISE_DIMENSIONAL=orderedUnique([
  ...UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27,
  ...UECE_FISICA_ANALISE_DIMENSIONAL_COMPLEMENTO_05
]).map(enrich);

const CINEMATICA=orderedUnique([
  ...UECE_FISICA_CINEMATICA_LOTE_18,
  ...UECE_FISICA_CINEMATICA_LOTE_09,
  ...UECE_FISICA_DINAMICA_VISUAL_01,
  ...UECE_FISICA_CINEMATICA_COMPLEMENTO_23,
  ...UECE_FISICA_CINEMATICA_COMPLEMENTO_VISUAL_04
]).map(enrich);

const DINAMICA_BASE=orderedUnique([
  ...UECE_FISICA_DINAMICA_COMPLEMENTO_01,
  ...UECE_FISICA_DINAMICA_LOTE_03,
  ...UECE_FISICA_DINAMICA_LOTE_02,
  ...UECE_FISICA_DINAMICA_LOTE_22
].filter(q=>sourceNumber(q)<=13)).map(enrich);

export const UECE_FISICA_LOTE_001_100=[...ANALISE_DIMENSIONAL,...CINEMATICA,...DINAMICA_BASE];

// Somente itens íntegros já conferidos no material. Posições ausentes nos arquivos auditados
// não são reconstruídas nem inventadas; a sequência avança ao próximo item íntegro da fonte.
const DINAMICA_RESTANTE=orderedUnique([
  ...UECE_FISICA_DINAMICA_LOTE_17,
  ...UECE_FISICA_DINAMICA_LOTE_22
]).filter(q=>sourceNumber(q)>13).map(enrich);

const ELETRODINAMICA=orderedUnique([
  ...UECE_FISICA_ELETRODINAMICA_LOTE_20,
  ...UECE_FISICA_ELETRODINAMICA_LOTE_17
]).map(enrich);
const TERMODINAMICA=orderedUnique(UECE_FISICA_TERMODINAMICA_LOTE_25).map(enrich);
const CAPACITORES_INICIO=orderedUnique(UECE_FISICA_ELETRICA_CAPACITORES_LOTE_25)
  .filter(q=>sourceNumber(q)<=6).map(enrich);

export const UECE_FISICA_LOTE_101_200=[
  ...DINAMICA_RESTANTE,
  ...ELETRODINAMICA,
  ...TERMODINAMICA,
  ...CAPACITORES_INICIO
];

// Alias histórico consumido pelo banco principal.
export const UECE_FISICA_LOTE_100=[...UECE_FISICA_LOTE_001_100,...UECE_FISICA_LOTE_101_200];

export const UECE_FISICA_LOTE_100_AUDIT={
  total:UECE_FISICA_LOTE_100.length,
  loteInicial:UECE_FISICA_LOTE_001_100.length,
  loteNovo:UECE_FISICA_LOTE_101_200.length,
  analiseDimensional:ANALISE_DIMENSIONAL.length,
  cinematica:CINEMATICA.length,
  dinamicaBase:DINAMICA_BASE.length,
  dinamicaRestante:DINAMICA_RESTANTE.length,
  eletrodinamica:ELETRODINAMICA.length,
  termodinamica:TERMODINAMICA.length,
  capacitoresInicio:CAPACITORES_INICIO.length,
  uniqueIds:new Set(UECE_FISICA_LOTE_100.map(q=>q.id)).size,
  uniqueSources:new Set(UECE_FISICA_LOTE_100.map(q=>`${q.topic}::${q.sourceQuestion}`)).size,
  reviewed:UECE_FISICA_LOTE_100.filter(q=>q.reviewed===true).length,
  withMedia:UECE_FISICA_LOTE_100.filter(q=>q.media).length,
  missingRequired:UECE_FISICA_LOTE_100.filter(q=>!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation).map(q=>q.id)
};
