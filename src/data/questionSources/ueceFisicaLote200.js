// UECE por Assunto — Física — 200 questões integradas em ordem da fonte.
// Lote 101–200: Dinâmica (itens íntegros restantes já auditados) + Eletrodinâmica 1–37 + Termodinâmica 1–25 + Capacitores 1–6.
import { UECE_FISICA_LOTE_100 } from "./ueceFisicaLote100.js";
import { UECE_FISICA_DINAMICA_LOTE_17 } from "./ueceFisicaDinamicaLote17.js";
import { UECE_FISICA_DINAMICA_LOTE_22 } from "./ueceFisicaDinamicaLote22.js";
import { UECE_FISICA_ELETRODINAMICA_LOTE_20 } from "./ueceFisicaEletrodinamicaLote20.js";
import { UECE_FISICA_ELETRODINAMICA_LOTE_17 } from "./ueceFisicaEletrodinamicaLote17.js";
import { UECE_FISICA_TERMODINAMICA_LOTE_25 } from "./ueceFisicaTermodinamicaLote25.js";
import { UECE_FISICA_ELETRICA_CAPACITORES_LOTE_25 } from "./ueceFisicaEletricaCapacitoresLote25.js";

const sourceNumber=q=>Number(q.sourceQuestion || String(q.id||"").match(/(\d+)$/)?.[1] || 0);
const orderedUnique=(items)=>{
  const seen=new Set();
  return [...items]
    .filter(q=>{ if(seen.has(q.id)) return false; seen.add(q.id); return true; })
    .sort((a,b)=>sourceNumber(a)-sourceNumber(b));
};
const enrich=(q)=>({...q,sourceQuestion:q.sourceQuestion||sourceNumber(q),reviewed:q.reviewed===true});

// A apostila contém posições de Dinâmica que não estão disponíveis como itens íntegros nos arquivos auditados.
// Não são reconstruídas nem inventadas; seguimos apenas com os itens completos já conferidos no material.
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
  .filter(q=>sourceNumber(q)<=6)
  .map(enrich);

export const UECE_FISICA_LOTE_101_200=[
  ...DINAMICA_RESTANTE,
  ...ELETRODINAMICA,
  ...TERMODINAMICA,
  ...CAPACITORES_INICIO
];

export const UECE_FISICA_LOTE_200=[...UECE_FISICA_LOTE_100,...UECE_FISICA_LOTE_101_200];

export const UECE_FISICA_LOTE_200_AUDIT={
  total:UECE_FISICA_LOTE_200.length,
  loteNovo:UECE_FISICA_LOTE_101_200.length,
  dinamicaRestante:DINAMICA_RESTANTE.length,
  eletrodinamica:ELETRODINAMICA.length,
  termodinamica:TERMODINAMICA.length,
  capacitoresInicio:CAPACITORES_INICIO.length,
  uniqueIds:new Set(UECE_FISICA_LOTE_200.map(q=>q.id)).size,
  uniqueSources:new Set(UECE_FISICA_LOTE_200.map(q=>`${q.topic}::${q.sourceQuestion}`)).size,
  reviewed:UECE_FISICA_LOTE_200.filter(q=>q.reviewed===true).length,
  withMedia:UECE_FISICA_LOTE_200.filter(q=>q.media).length,
  missingRequired:UECE_FISICA_LOTE_200.filter(q=>!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation).map(q=>q.id)
};
