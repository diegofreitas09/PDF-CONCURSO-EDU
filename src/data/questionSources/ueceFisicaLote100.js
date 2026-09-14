// UECE por Assunto — Física — coleção integrada em ordem da fonte.
// Compatibilidade: o nome histórico UECE_FISICA_LOTE_100 é preservado para o banco principal,
// e agora aponta para 500 questões auditadas (lotes 001–100, 101–200, 201–300, 301–400 e 401–500).
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
import { UECE_FISICA_ENERGIA_LOTE_17 } from "./ueceFisicaEnergiaLote17.js";
import { UECE_FISICA_ESTATICA_ELETROSTATICA_TRABALHO_LOTE_08 } from "./ueceFisicaEstaticaEletrostaticaTrabalhoLote08.js";
import { UECE_FISICA_ESTATICA_ELETROSTATICA_TRABALHO_LOTE_33 } from "./ueceFisicaEstaticaEletrostaticaTrabalhoLote33.js";
import { UECE_FISICA_GRAVITACAO_LOTE_18 } from "./ueceFisicaGravitacaoLote18.js";
import { UECE_FISICA_HIDROSTATICA_LOTE_32 } from "./ueceFisicaHidrostaticaLote32.js";
import { UECE_FISICA_MAGNETISMO_LOTE_22 } from "./ueceFisicaMagnetismoLote22.js";
import { UECE_FISICA_ONDULATORIA_ACUSTICA_LOTE_27 } from "./ueceFisicaOndulatoriaAcusticaLote27.js";
import { UECE_FISICA_OPTICA_LOTE_11 } from "./ueceFisicaOpticaLote11.js";
import { UECE_FISICA_OPTICA_LOTE_09 } from "./ueceFisicaOpticaLote09.js";
import { UECE_FISICA_OPTICA_VISUAL_03 } from "./ueceFisicaOpticaVisual03.js";
import { UECE_FISICA_OPTICA_LOTE_23 } from "./ueceFisicaOpticaLote23.js";
import { UECE_FISICA_MHS_LOTE_29 } from "./ueceFisicaMhsLote29.js";
import { UECE_FISICA_MHS_COMPLEMENTO_VISUAL_06 } from "./ueceFisicaMhsComplementoVisual06.js";
import { UECE_FISICA_CALORIMETRIA_LOTE_36 } from "./ueceFisicaCalorimetriaLote36.js";
import { UECE_FISICA_CALORIMETRIA_VISUAL_01 } from "./ueceFisicaCalorimetriaVisual01.js";
import { UECE_FISICA_MOMENTO_LINEAR_LOTE_12 } from "./ueceFisicaMomentoLinearLote12.js";

const sourceNumber=q=>Number(q.sourceQuestion || String(q.id||"").match(/(\d+)$/)?.[1] || 0);
const ordered=(items)=>[...items].sort((a,b)=>sourceNumber(a)-sourceNumber(b));
const orderedUnique=(items)=>{const seen=new Set();return ordered(items).filter(q=>{if(seen.has(q.id))return false;seen.add(q.id);return true;});};
const enrich=(q)=>({...q,sourceQuestion:q.sourceQuestion||sourceNumber(q),reviewed:q.reviewed===true});

const ANALISE_DIMENSIONAL=orderedUnique([...UECE_FISICA_ANALISE_DIMENSIONAL_LOTE_27,...UECE_FISICA_ANALISE_DIMENSIONAL_COMPLEMENTO_05]).map(enrich);
const CINEMATICA=orderedUnique([...UECE_FISICA_CINEMATICA_LOTE_18,...UECE_FISICA_CINEMATICA_LOTE_09,...UECE_FISICA_DINAMICA_VISUAL_01,...UECE_FISICA_CINEMATICA_COMPLEMENTO_23,...UECE_FISICA_CINEMATICA_COMPLEMENTO_VISUAL_04]).map(enrich);
const DINAMICA_BASE=orderedUnique([...UECE_FISICA_DINAMICA_COMPLEMENTO_01,...UECE_FISICA_DINAMICA_LOTE_03,...UECE_FISICA_DINAMICA_LOTE_02,...UECE_FISICA_DINAMICA_LOTE_22].filter(q=>sourceNumber(q)<=13)).map(enrich);
export const UECE_FISICA_LOTE_001_100=[...ANALISE_DIMENSIONAL,...CINEMATICA,...DINAMICA_BASE];

const DINAMICA_RESTANTE=orderedUnique([...UECE_FISICA_DINAMICA_LOTE_17,...UECE_FISICA_DINAMICA_LOTE_22]).filter(q=>sourceNumber(q)>13).map(enrich);
const ELETRODINAMICA=orderedUnique([...UECE_FISICA_ELETRODINAMICA_LOTE_20,...UECE_FISICA_ELETRODINAMICA_LOTE_17]).map(enrich);
const TERMODINAMICA=orderedUnique(UECE_FISICA_TERMODINAMICA_LOTE_25).map(enrich);
const CAPACITORES=orderedUnique(UECE_FISICA_ELETRICA_CAPACITORES_LOTE_25).map(enrich);
const CAPACITORES_INICIO=CAPACITORES.filter(q=>sourceNumber(q)<=6);
export const UECE_FISICA_LOTE_101_200=[...DINAMICA_RESTANTE,...ELETRODINAMICA,...TERMODINAMICA,...CAPACITORES_INICIO];

const CAPACITORES_RESTANTE=CAPACITORES.filter(q=>sourceNumber(q)>6);
const ENERGIA=orderedUnique(UECE_FISICA_ENERGIA_LOTE_17).map(enrich);
const ESTATICA_ELETROSTATICA_TRABALHO=orderedUnique([...UECE_FISICA_ESTATICA_ELETROSTATICA_TRABALHO_LOTE_08,...UECE_FISICA_ESTATICA_ELETROSTATICA_TRABALHO_LOTE_33]).map(enrich);
const GRAVITACAO=orderedUnique(UECE_FISICA_GRAVITACAO_LOTE_18).map(enrich);
const HIDROSTATICA=orderedUnique(UECE_FISICA_HIDROSTATICA_LOTE_32).map(enrich);
const HIDROSTATICA_INICIO=HIDROSTATICA.slice(0,5);
export const UECE_FISICA_LOTE_201_300=[...CAPACITORES_RESTANTE,...ENERGIA,...ESTATICA_ELETROSTATICA_TRABALHO,...GRAVITACAO,...HIDROSTATICA_INICIO];

const HIDROSTATICA_RESTANTE=HIDROSTATICA.slice(5);
const MAGNETISMO=orderedUnique(UECE_FISICA_MAGNETISMO_LOTE_22).map(enrich);
const ONDULATORIA_ACUSTICA=orderedUnique(UECE_FISICA_ONDULATORIA_ACUSTICA_LOTE_27).map(enrich);
const OPTICA=orderedUnique([...UECE_FISICA_OPTICA_LOTE_11,...UECE_FISICA_OPTICA_LOTE_09,...UECE_FISICA_OPTICA_VISUAL_03,...UECE_FISICA_OPTICA_LOTE_23]).map(enrich);
const OPTICA_INICIO=OPTICA.slice(0,24);
export const UECE_FISICA_LOTE_301_400=[...HIDROSTATICA_RESTANTE,...MAGNETISMO,...ONDULATORIA_ACUSTICA,...OPTICA_INICIO];

const OPTICA_RESTANTE=OPTICA.slice(24);
const MHS=orderedUnique([...UECE_FISICA_MHS_LOTE_29,...UECE_FISICA_MHS_COMPLEMENTO_VISUAL_06]).map(enrich);
const CALORIMETRIA=orderedUnique([...UECE_FISICA_CALORIMETRIA_LOTE_36,...UECE_FISICA_CALORIMETRIA_VISUAL_01]).map(enrich);
const MOMENTO_LINEAR=orderedUnique(UECE_FISICA_MOMENTO_LINEAR_LOTE_12).map(enrich);
const MOMENTO_LINEAR_INICIO=MOMENTO_LINEAR.slice(0,6);
export const UECE_FISICA_LOTE_401_500=[...OPTICA_RESTANTE,...MHS,...CALORIMETRIA,...MOMENTO_LINEAR_INICIO];

export const UECE_FISICA_LOTE_100=[...UECE_FISICA_LOTE_001_100,...UECE_FISICA_LOTE_101_200,...UECE_FISICA_LOTE_201_300,...UECE_FISICA_LOTE_301_400,...UECE_FISICA_LOTE_401_500];

export const UECE_FISICA_LOTE_100_AUDIT={
 total:UECE_FISICA_LOTE_100.length,loteInicial:UECE_FISICA_LOTE_001_100.length,loteSegundo:UECE_FISICA_LOTE_101_200.length,loteTerceiro:UECE_FISICA_LOTE_201_300.length,loteQuarto:UECE_FISICA_LOTE_301_400.length,loteQuinto:UECE_FISICA_LOTE_401_500.length,
 analiseDimensional:ANALISE_DIMENSIONAL.length,cinematica:CINEMATICA.length,dinamicaBase:DINAMICA_BASE.length,dinamicaRestante:DINAMICA_RESTANTE.length,eletrodinamica:ELETRODINAMICA.length,termodinamica:TERMODINAMICA.length,capacitoresInicio:CAPACITORES_INICIO.length,capacitoresRestante:CAPACITORES_RESTANTE.length,energia:ENERGIA.length,estaticaEletrostaticaTrabalho:ESTATICA_ELETROSTATICA_TRABALHO.length,gravitacao:GRAVITACAO.length,hidrostaticaInicio:HIDROSTATICA_INICIO.length,hidrostaticaRestante:HIDROSTATICA_RESTANTE.length,magnetismo:MAGNETISMO.length,ondulatoriaAcustica:ONDULATORIA_ACUSTICA.length,opticaInicio:OPTICA_INICIO.length,opticaRestante:OPTICA_RESTANTE.length,opticaTotalIntegra:OPTICA.length,mhs:MHS.length,calorimetria:CALORIMETRIA.length,momentoLinearInicio:MOMENTO_LINEAR_INICIO.length,momentoLinearTotalIntegra:MOMENTO_LINEAR.length,
 uniqueIds:new Set(UECE_FISICA_LOTE_100.map(q=>q.id)).size,uniqueSources:new Set(UECE_FISICA_LOTE_100.map(q=>`${q.topic}::${q.sourceQuestion}`)).size,reviewed:UECE_FISICA_LOTE_100.filter(q=>q.reviewed===true).length,withMedia:UECE_FISICA_LOTE_100.filter(q=>q.media).length,withMediaNovo:UECE_FISICA_LOTE_401_500.filter(q=>q.media).length,
 missingRequired:UECE_FISICA_LOTE_100.filter(q=>!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation).map(q=>q.id)
};
