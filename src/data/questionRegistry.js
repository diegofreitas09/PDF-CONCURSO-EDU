import{ALL_QUESTIONS}from"./questionSources";
import{INDICADORES_VISUAIS_SEDUC_2026}from"./questionSources/indicadoresVisuaisSeduc2026";

const STOCK_PREFIXES=[
 /^assinale a alternativa correta\.?\s*/i,
 /^considerando o conteúdo previsto no edital, assinale a alternativa correta\.?\s*/i,
 /^em uma revisão direcionada à prova, assinale a alternativa correta\.?\s*/i,
 /^para fins de preparação para a seduc\/ce 2026, identifique a alternativa correta\.?\s*/i,
 /^à luz dos conceitos cobrados no concurso, assinale a alternativa correta\.?\s*/i,
 /^em uma situação de prova, marque a alternativa correta\.?\s*/i,
 /^com base no conteúdo programático oficial, assinale a alternativa correta\.?\s*/i,
 /^na preparação para a prova objetiva, identifique a opção correta\.?\s*/i,
 /^sobre o tema indicado, assinale a alternativa correta\.?\s*/i,
 /^considerando a abordagem típica de concurso, marque a resposta correta\.?\s*/i
];
function norm(v=""){return String(v??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/<[^>]*>/g," ").replace(/\s+/g," ").replace(/[^a-z0-9%+\-/. ]+/g," ").replace(/\s+/g," ").trim()}
function coreStatement(v=""){let s=String(v??"").trim();for(const re of STOCK_PREFIXES)s=s.replace(re,"");return norm(s)}
function hash32(v=""){let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)}return(h>>>0).toString(36).toUpperCase().padStart(7,"0")}
function canonicalSignature(q){const opts=(q.options||[]).map(norm).filter(Boolean).sort().join("||"),media=q.media?norm(JSON.stringify(q.media)):"",ctx=norm(q.context||"");return[norm(q.discipline),norm(q.topic),coreStatement(q.originalStatement||q.statement),opts,ctx,media].join("::")}
function exactSignature(q){const opts=(q.options||[]).map(norm).filter(Boolean).sort().join("||");return[norm(q.discipline),norm(q.context||""),norm(q.originalStatement||q.statement),opts].join("::")}
const RAW=[...ALL_QUESTIONS,...INDICADORES_VISUAIS_SEDUC_2026];
const exactSeen=new Map(),conceptSeen=new Map(),unique=[],duplicates=[];
for(const q of RAW){const canonical=canonicalSignature(q),exact=exactSignature(q),bankId=`Q-${hash32(canonical)}`,legacyId=String(q.id??"");const enriched={...q,legacyId,bankId,canonicalId:bankId,contentHash:hash32(exact)};if(exactSeen.has(exact)){duplicates.push({...enriched,duplicateType:"exact",duplicateOf:exactSeen.get(exact)});continue}if(conceptSeen.has(canonical)){duplicates.push({...enriched,duplicateType:"conceptual",duplicateOf:conceptSeen.get(canonical)});continue}exactSeen.set(exact,bankId);conceptSeen.set(canonical,bankId);unique.push(enriched)}
export const REGISTERED_QUESTIONS=unique;
export const QUESTION_DUPLICATES=duplicates;
export const QUESTION_REGISTRY_STATS={raw:RAW.length,unique:unique.length,duplicates:duplicates.length,exactDuplicates:duplicates.filter(q=>q.duplicateType==="exact").length,conceptualDuplicates:duplicates.filter(q=>q.duplicateType==="conceptual").length};
export function getQuestionById(id){const k=String(id);return REGISTERED_QUESTIONS.find(q=>q.bankId===k||q.legacyId===k)||null}
export function getQuestionRegistryReport(){return{...QUESTION_REGISTRY_STATS,duplicates:QUESTION_DUPLICATES.map(q=>({bankId:q.bankId,legacyId:q.legacyId,duplicateOf:q.duplicateOf,type:q.duplicateType,discipline:q.discipline,topic:q.topic,statement:q.originalStatement||q.statement}))}}
