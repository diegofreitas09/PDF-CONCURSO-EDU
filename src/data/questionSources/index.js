import "../../styles/questionAudit.css";
import { QUESTION_BANK as LEGACY_QUESTION_BANK } from "../questionBank";
import { SIMULADO_05_TEORIAS_PEDAGOGICAS } from "./simulado05TeoriasPedagogicas";
import { SEDUC_CONHECIMENTOS_GERAIS_MODULO_1 } from "./seducConhecimentosGeraisModulo1";
import { APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01 } from "./apostilaPresencialSeducPedagogicos01";
import { PORTUGUES_APOSTILA_PRESENCIAL } from "./portuguesApostilaPresencial";
import { INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL } from "./indicadoresEducacionaisApostilaPresencial";
import { ADMINISTRACAO_PUBLICA_SEDUC_01 } from "./administracaoPublicaSeduc01";
import { RACIOCINIO_LOGICO_CONCURSOS_01 } from "./raciocinioLogicoConcursos01";
import { RACIOCINIO_LOGICO_CONCURSOS_02 } from "./raciocinioLogicoConcursos02";

function cleanText(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/\*\*|__|`/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([([{])\s+/g, "$1")
    .replace(/\s+([)\]}])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n[ \t]+/g, "\n")
    .trim();
}
function getContext(q) {return cleanText(q?.context || q?.passage || q?.supportText || q?.texto || q?.textBase || q?.baseText || "");}
function dependsOnText(statement = "") {
  const s = cleanText(statement).toLowerCase();
  const patterns = [/\bno texto[\s:“\"']/,/\bno texto intitulado\b/,/\bde acordo com o texto\b/,/\bcom base no texto\b/,/\bcom base no trecho\b/,/\ba partir do texto\b/,/\bsegundo o texto\b/,/\btexto acima\b/,/\btexto anterior\b/,/\bleia o texto\b/,/\bleia o trecho\b/,/\bconsidere o texto\b/,/\bobserve o texto\b/,/\binterpretação coerente com o texto\b/,/\bideia central do texto\b/,/\bautor do texto\b/,/\bparágrafo\b/,/\bno trecho\b/,/\btrecho destacado\b/];
  return patterns.some(pattern => pattern.test(s));
}
function splitPassageFromOption(option = "") {
  const text = cleanText(option);const marker=/(?:\s|^)(?:\d{1,3}\s+)?TEXTO(?:\s+\d+)?\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/i;const match=marker.exec(text);if(!match)return null;
  const before=cleanText(text.slice(0,match.index)).replace(/\s+\d{1,3}\s*$/,"").trim();const rawPassage=cleanText(text.slice(match.index));const passage=rawPassage.replace(/^\d{1,3}\s+TEXTO(?:\s+\d+)?\s+/i,"").replace(/^TEXTO(?:\s+\d+)?\s+/i,"").trim();if(!before||passage.length<120)return null;return{option:before,passage};
}
function normalizeQuestion(q, sourceIndex, inheritedContext = "", inheritedFromOCR = false) {
  const options=Array.isArray(q?.options)?q.options.map(cleanText):[];const explicitContext=getContext(q);const context=explicitContext||inheritedContext||"";const originalStatement=cleanText(q?.statement);const shouldShowContext=Boolean(context&&(inheritedFromOCR||explicitContext||dependsOnText(originalStatement)));const statement=shouldShowContext?`TEXTO-BASE\n${context}\n\nQUESTÃO\n${originalStatement}`:originalStatement;const suspiciousOversizedOption=options.some(option=>option.length>900);const missingContext=dependsOnText(originalStatement)&&!context;
  return{...q,id:q?.id??`audit-${sourceIndex}`,originalStatement,statement,context,options,explanation:cleanText(q?.explanation),auditStatus:missingContext?"missing-context":(suspiciousOversizedOption?"oversized-option":(q?.auditStatus||"ok"))};
}
function recoverLegacyQuestions(questions) {
  let activeContext="",activeContextFromOCR=false,recoveredPassages=0;const recovered=[];
  questions.forEach((raw,index)=>{const cloned={...raw,options:Array.isArray(raw?.options)?[...raw.options]:[]};const normalized=normalizeQuestion(cloned,index,activeContext,activeContextFromOCR);let nextContext=activeContext,nextContextFromOCR=activeContextFromOCR;const cleanedOptions=[];for(const option of normalized.options){const split=splitPassageFromOption(option);if(split){cleanedOptions.push(split.option);nextContext=split.passage;nextContextFromOCR=true;recoveredPassages+=1}else cleanedOptions.push(option)}const stillOversized=cleanedOptions.some(o=>o.length>900);recovered.push({...normalized,options:cleanedOptions,auditStatus:dependsOnText(normalized.originalStatement)&&!normalized.context?"missing-context":(stillOversized?"oversized-option":"ok")});activeContext=nextContext;activeContextFromOCR=nextContextFromOCR;});
  return{questions:recovered,recoveredPassages};
}
function normalizeAuthoredSource(questions,prefix){return questions.map((q,i)=>normalizeQuestion(q,`${prefix}-${i}`));}
const LEGACY_RECOVERY=recoverLegacyQuestions(LEGACY_QUESTION_BANK);
const RAW_QUESTIONS=[...LEGACY_RECOVERY.questions,...normalizeAuthoredSource(SIMULADO_05_TEORIAS_PEDAGOGICAS,"sim05"),...normalizeAuthoredSource(SEDUC_CONHECIMENTOS_GERAIS_MODULO_1,"seduc1"),...normalizeAuthoredSource(APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01,"ped01"),...normalizeAuthoredSource(PORTUGUES_APOSTILA_PRESENCIAL,"port"),...normalizeAuthoredSource(INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL,"ind"),...normalizeAuthoredSource(ADMINISTRACAO_PUBLICA_SEDUC_01,"adm"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_01,"rl1"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_02,"rl2")];
export const AUDITED_QUESTIONS=RAW_QUESTIONS;
export const QUARANTINED_QUESTIONS=AUDITED_QUESTIONS.filter(q=>q.auditStatus==="missing-context"||q.auditStatus==="oversized-option");
export const ALL_QUESTIONS=AUDITED_QUESTIONS.filter(q=>q.auditStatus!=="missing-context"&&q.auditStatus!=="oversized-option");
export const QUESTION_AUDIT_STATS={raw:AUDITED_QUESTIONS.length,published:ALL_QUESTIONS.length,recoveredPassagesFromOptions:LEGACY_RECOVERY.recoveredPassages,quarantinedMissingContext:AUDITED_QUESTIONS.filter(q=>q.auditStatus==="missing-context").length,quarantinedOversizedOption:AUDITED_QUESTIONS.filter(q=>q.auditStatus==="oversized-option").length};
export const QUESTION_SOURCE_STATS={legado:LEGACY_QUESTION_BANK.length,simulado05TeoriasPedagogicas:SIMULADO_05_TEORIAS_PEDAGOGICAS.length,seducConhecimentosGeraisModulo1:SEDUC_CONHECIMENTOS_GERAIS_MODULO_1.length,apostilaPresencialSeducPedagogicos01:APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01.length,portuguesApostilaPresencial:PORTUGUES_APOSTILA_PRESENCIAL.length,indicadoresEducacionaisApostilaPresencial:INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL.length,administracaoPublicaSeduc01:ADMINISTRACAO_PUBLICA_SEDUC_01.length,raciocinioLogicoConcursos01:RACIOCINIO_LOGICO_CONCURSOS_01.length,raciocinioLogicoConcursos02:RACIOCINIO_LOGICO_CONCURSOS_02.length,total:ALL_QUESTIONS.length};
