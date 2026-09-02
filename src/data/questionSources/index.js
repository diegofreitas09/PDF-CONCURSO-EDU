import "../../styles/questionAudit.css";
import { QUESTION_BANK as LEGACY_QUESTION_BANK } from "../questionBank";
import { SIMULADO_05_TEORIAS_PEDAGOGICAS } from "./simulado05TeoriasPedagogicas";
import { SEDUC_CONHECIMENTOS_GERAIS_MODULO_1 } from "./seducConhecimentosGeraisModulo1";
import { APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01 } from "./apostilaPresencialSeducPedagogicos01";
import { PORTUGUES_APOSTILA_PRESENCIAL } from "./portuguesApostilaPresencial";
import { PORTUGUES_CONCURSOS_02 } from "./portuguesConcursos02";
import { PORTUGUES_CONCURSOS_03 } from "./portuguesConcursos03";
import { PORTUGUES_CONCURSOS_04 } from "./portuguesConcursos04";
import { INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL } from "./indicadoresEducacionaisApostilaPresencial";
import { ADMINISTRACAO_PUBLICA_SEDUC_01 } from "./administracaoPublicaSeduc01";
import { RACIOCINIO_LOGICO_CONCURSOS_01 } from "./raciocinioLogicoConcursos01";
import { RACIOCINIO_LOGICO_CONCURSOS_02 } from "./raciocinioLogicoConcursos02";
import { RACIOCINIO_LOGICO_CONCURSOS_03 } from "./raciocinioLogicoConcursos03";
import { RACIOCINIO_LOGICO_CONCURSOS_04 } from "./raciocinioLogicoConcursos04";
import { RACIOCINIO_LOGICO_CONCURSOS_05 } from "./raciocinioLogicoConcursos05";
import { RACIOCINIO_LOGICO_CONCURSOS_06 } from "./raciocinioLogicoConcursos06";
import { RACIOCINIO_LOGICO_CONCURSOS_07 } from "./raciocinioLogicoConcursos07";
import { RACIOCINIO_LOGICO_CONCURSOS_08 } from "./raciocinioLogicoConcursos08";
import { RACIOCINIO_LOGICO_CONCURSOS_09 } from "./raciocinioLogicoConcursos09";

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
  return{...q,id:q?.id??`audit-${sourceIndex}`,originalStatement,statement,context,options,explanation:cleanText(q?.explanation || q?.comment),auditStatus:missingContext?"missing-context":(suspiciousOversizedOption?"oversized-option":(q?.auditStatus||"ok"))};
}
function recoverLegacyQuestions(questions) {
  let activeContext="",activeContextFromOCR=false,recoveredPassages=0;const recovered=[];
  questions.forEach((raw,index)=>{const cloned={...raw,options:Array.isArray(raw?.options)?[...raw.options]:[]};const normalized=normalizeQuestion(cloned,index,activeContext,activeContextFromOCR);let nextContext=activeContext,nextContextFromOCR=activeContextFromOCR;const cleanedOptions=[];for(const option of normalized.options){const split=splitPassageFromOption(option);if(split){cleanedOptions.push(split.option);nextContext=split.passage;nextContextFromOCR=true;recoveredPassages+=1}else cleanedOptions.push(option)}const stillOversized=cleanedOptions.some(o=>o.length>900);recovered.push({...normalized,options:cleanedOptions,auditStatus:dependsOnText(normalized.originalStatement)&&!normalized.context?"missing-context":(stillOversized?"oversized-option":"ok")});activeContext=nextContext;activeContextFromOCR=nextContextFromOCR;});
  return{questions:recovered,recoveredPassages};
}
function normalizeAuthoredSource(questions,prefix){return questions.map((q,i)=>normalizeQuestion(q,`${prefix}-${i}`));}
function fingerprintText(value="") {
  return cleanText(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}
function questionFingerprint(q) {
  const context=fingerprintText(q?.context||"");
  const statement=fingerprintText(q?.originalStatement||q?.statement||"");
  const options=(Array.isArray(q?.options)?q.options:[]).map(fingerprintText).sort().join("||");
  return `${fingerprintText(q?.discipline||"")}::${context}::${statement}::${options}`;
}
function dedupeQuestions(questions) {
  const seen=new Map();const unique=[];const duplicates=[];
  for(const q of questions){const key=questionFingerprint(q);if(!key||key.endsWith("::::")){unique.push(q);continue;}if(seen.has(key)){duplicates.push({...q,auditStatus:"duplicate",duplicateOf:seen.get(key)});continue;}seen.set(key,q.id);unique.push(q);}
  return{unique,duplicates};
}
const LEGACY_RECOVERY=recoverLegacyQuestions(LEGACY_QUESTION_BANK);
const RAW_QUESTIONS=[...LEGACY_RECOVERY.questions,...normalizeAuthoredSource(SIMULADO_05_TEORIAS_PEDAGOGICAS,"sim05"),...normalizeAuthoredSource(SEDUC_CONHECIMENTOS_GERAIS_MODULO_1,"seduc1"),...normalizeAuthoredSource(APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01,"ped01"),...normalizeAuthoredSource(PORTUGUES_APOSTILA_PRESENCIAL,"port"),...normalizeAuthoredSource(PORTUGUES_CONCURSOS_02,"port2"),...normalizeAuthoredSource(PORTUGUES_CONCURSOS_03,"port3"),...normalizeAuthoredSource(PORTUGUES_CONCURSOS_04,"port4"),...normalizeAuthoredSource(INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL,"ind"),...normalizeAuthoredSource(ADMINISTRACAO_PUBLICA_SEDUC_01,"adm"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_01,"rl1"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_02,"rl2"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_03,"rl3"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_04,"rl4"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_05,"rl5"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_06,"rl6"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_07,"rl7"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_08,"rl8"),...normalizeAuthoredSource(RACIOCINIO_LOGICO_CONCURSOS_09,"rl9")];
export const AUDITED_QUESTIONS=RAW_QUESTIONS;
export const QUARANTINED_QUESTIONS=AUDITED_QUESTIONS.filter(q=>q.auditStatus==="missing-context"||q.auditStatus==="oversized-option");
const VALID_QUESTIONS=AUDITED_QUESTIONS.filter(q=>q.auditStatus!=="missing-context"&&q.auditStatus!=="oversized-option");
const DEDUPE_RESULT=dedupeQuestions(VALID_QUESTIONS);
export const DUPLICATE_QUESTIONS=DEDUPE_RESULT.duplicates;
export const ALL_QUESTIONS=DEDUPE_RESULT.unique;
export const QUESTION_AUDIT_STATS={raw:AUDITED_QUESTIONS.length,published:ALL_QUESTIONS.length,recoveredPassagesFromOptions:LEGACY_RECOVERY.recoveredPassages,quarantinedMissingContext:AUDITED_QUESTIONS.filter(q=>q.auditStatus==="missing-context").length,quarantinedOversizedOption:AUDITED_QUESTIONS.filter(q=>q.auditStatus==="oversized-option").length,duplicatesRemoved:DUPLICATE_QUESTIONS.length};
export const QUESTION_SOURCE_STATS={legado:LEGACY_QUESTION_BANK.length,simulado05TeoriasPedagogicas:SIMULADO_05_TEORIAS_PEDAGOGICAS.length,seducConhecimentosGeraisModulo1:SEDUC_CONHECIMENTOS_GERAIS_MODULO_1.length,apostilaPresencialSeducPedagogicos01:APOSTILA_PRESENCIAL_SEDUC_PEDAGOGICOS_01.length,portuguesApostilaPresencial:PORTUGUES_APOSTILA_PRESENCIAL.length,portuguesConcursos02:PORTUGUES_CONCURSOS_02.length,portuguesConcursos03:PORTUGUES_CONCURSOS_03.length,portuguesConcursos04:PORTUGUES_CONCURSOS_04.length,indicadoresEducacionaisApostilaPresencial:INDICADORES_EDUCACIONAIS_APOSTILA_PRESENCIAL.length,administracaoPublicaSeduc01:ADMINISTRACAO_PUBLICA_SEDUC_01.length,raciocinioLogicoConcursos01:RACIOCINIO_LOGICO_CONCURSOS_01.length,raciocinioLogicoConcursos02:RACIOCINIO_LOGICO_CONCURSOS_02.length,raciocinioLogicoConcursos03:RACIOCINIO_LOGICO_CONCURSOS_03.length,raciocinioLogicoConcursos04:RACIOCINIO_LOGICO_CONCURSOS_04.length,raciocinioLogicoConcursos05:RACIOCINIO_LOGICO_CONCURSOS_05.length,raciocinioLogicoConcursos06:RACIOCINIO_LOGICO_CONCURSOS_06.length,raciocinioLogicoConcursos07:RACIOCINIO_LOGICO_CONCURSOS_07.length,raciocinioLogicoConcursos08:RACIOCINIO_LOGICO_CONCURSOS_08.length,raciocinioLogicoConcursos09:RACIOCINIO_LOGICO_CONCURSOS_09.length,total:ALL_QUESTIONS.length};
