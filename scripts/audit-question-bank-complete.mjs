import fs from "node:fs";
import { REGISTERED_QUESTIONS, QUESTION_QUARANTINE, QUESTION_DUPLICATES, QUESTION_BANK_STATS } from "../src/data/questionRegistry.js";

const clean=v=>String(v??"").replace(/\s+/g," ").trim();
const sev={critical:0,warning:0,info:0};
const issueCounts=new Map();
const rows=[];
const add=(q,type,severity,detail="")=>{
  sev[severity]=(sev[severity]||0)+1;
  issueCounts.set(type,(issueCounts.get(type)||0)+1);
  rows.push({id:q.id,legacyId:q.legacyId||q.originalId||"",discipline:q.discipline||"",topic:q.topic||"",source:q.source||"",type,severity,detail});
};
const hasMedia=m=>!!m&&(Array.isArray(m)?m.some(hasMedia):typeof m==="string"?!!clean(m):typeof m==="object"&&Object.values(m).some(v=>Array.isArray(v)?v.length:typeof v==="object"?v&&Object.keys(v).length:!!clean(v)));
const mediaRef=/\b(figura|imagem|gr[aá]fico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\b/i;
const textRef=/\b(no texto|de acordo com o texto|com base no texto|segundo o texto|texto acima|texto anterior|texto a seguir|leia o texto|leia o trecho|no trecho|par[aá]grafo|autor(?:a)? do texto|texto-base|texto de apoio)\b/i;
const embeddedNext=/(?:^|\s)(?:\d{1,3})\)\s*\(UECE\b/gi;
const leakedOptions=/\bA\)\s+.{3,}?\bB\)\s+.{3,}?\bC\)/is;
const badChars=/[�\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const splitWord=/\b(?:n\s+ão|pa\s+rte|te\s+mperaturas|pos\s+sí­?vel|serv\s+iço|mom\s+ento|hu\s+mana|ve\s+getação|organi\s+zação|condiçõe\s+s)\b/i;
const danglingCommand=/(?:\bque|\bde|\bdo|\bda|\bem|\bcom|\bpara|\bpor|\bseja|\bé|\bsão|\btem|\bpossui|\bcorresponde)\s*$/i;
const commandCue=/(?:assinale|marque|indique|afirme|identifique|determine|calcule|considere|analise|observe|julgue|é correto|é incorreto|pode-se afirmar|corresponde|equivale|resulta|vale|igual a|sequência correta|alternativa correta|opção correta)/i;
const onlyKeyComment=/^gabarito(?: oficial)?(?: da apostila)?:?\s*[A-D](?:\.|,)?$/i;

for(const q of REGISTERED_QUESTIONS){
  const s=clean(q.statement||q.originalStatement);
  const ctx=clean(q.context);
  const opts=Array.isArray(q.options)?q.options.map(clean):[];
  const exp=clean(q.explanation||q.commentary||q.comment||q.resolution);
  if(!s) add(q,"statement-empty","critical");
  if(opts.length!==4) add(q,"options-not-four","critical",String(opts.length));
  if(opts.some(x=>!x)) add(q,"option-empty","critical");
  if(new Set(opts.map(x=>x.toLocaleLowerCase("pt-BR"))).size!==opts.length) add(q,"options-duplicate","critical");
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>=opts.length) add(q,"answer-invalid","critical",String(q.answer));
  if(!clean(q.discipline)||!clean(q.topic)) add(q,"classification-missing","critical");
  if(/UECE/i.test([q.id,q.source,q.origin].filter(Boolean).join(" "))&&!clean(q.source||q.origin)) add(q,"origin-missing","critical");
  if(textRef.test(s)&&!ctx) add(q,"context-reference-without-context","critical");
  if(mediaRef.test(s)&&!hasMedia(q.media)) add(q,"media-reference-without-media","critical");
  const embedded=[...s.matchAll(embeddedNext)];
  if(embedded.length>1 || (embedded.length===1 && !s.startsWith(embedded[0][0].trim()))) add(q,"multiple-questions-concatenated","critical",`${embedded.length} marcas UECE no enunciado`);
  if(leakedOptions.test(s)) add(q,"options-leaked-into-statement","critical");
  if(badChars.test(s+" "+ctx+" "+opts.join(" "))) add(q,"invalid-control-or-replacement-char","critical");
  if(splitWord.test(s+" "+ctx+" "+opts.join(" "))) add(q,"ocr-split-word","warning");
  if(danglingCommand.test(s)) add(q,"command-truncated","critical",s.slice(-90));
  if(s.length<18) add(q,"statement-too-short","warning",String(s.length));
  if(!commandCue.test(s) && !/[?!.:]$/.test(s)) add(q,"command-structure-suspicious","warning",s.slice(-100));
  if(opts.some(o=>/^\s*[A-D][).:-]\s*/i.test(o))) add(q,"option-has-embedded-label","warning");
  if(!exp) add(q,"comment-missing","critical");
  else {
    if(exp.length<35) add(q,"comment-too-short","warning",String(exp.length));
    if(onlyKeyComment.test(exp)||/^gabarito oficial da apostila:/i.test(exp)&&exp.length<55) add(q,"comment-only-repeats-key","warning",exp);
    if(!/[.!?]$/.test(exp)) add(q,"comment-format-no-final-punctuation","info");
  }
  if(q.media && !hasMedia(q.media)) add(q,"media-object-empty","critical");
  const latex=JSON.stringify(q.media||{}).match(/"latex":"([^"]*)"/g)||[];
  for(const token of latex){const body=token.replace(/^"latex":"/,"").slice(0,-1); if((body.match(/\{/g)||[]).length!==(body.match(/\}/g)||[]).length)add(q,"latex-unbalanced-braces","critical",body.slice(0,120));}
  if(/[=<>±×÷√πωαβγΔΣ]\s*$/.test(s)) add(q,"formula-or-symbol-truncated-at-end","critical",s.slice(-80));
}

for(const q of QUESTION_QUARANTINE) add(q,"already-quarantined","critical",(q.auditReasons||q.auditIssues||[]).join(","));
for(const q of QUESTION_DUPLICATES) add(q,"duplicate-question","warning",q.duplicateOf||"");

const byDiscipline={};
for(const q of REGISTERED_QUESTIONS){
  const d=q.discipline||"Sem disciplina"; byDiscipline[d]??={total:0,issues:0,critical:0,warning:0}; byDiscipline[d].total++;
}
for(const r of rows){const d=r.discipline||"Sem disciplina";byDiscipline[d]??={total:0,issues:0,critical:0,warning:0};byDiscipline[d].issues++; if(r.severity==="critical")byDiscipline[d].critical++; if(r.severity==="warning")byDiscipline[d].warning++;}

const summary={
  generatedAt:new Date().toISOString(),
  bankStats:QUESTION_BANK_STATS,
  publishedAudited:REGISTERED_QUESTIONS.length,
  quarantine:QUESTION_QUARANTINE.length,
  duplicates:QUESTION_DUPLICATES.length,
  issueEvents:rows.length,
  severity:sev,
  issueCounts:Object.fromEntries([...issueCounts.entries()].sort((a,b)=>b[1]-a[1])),
  byDiscipline
};
fs.mkdirSync("audit",{recursive:true});
fs.writeFileSync("audit/question-bank-full-audit.json",JSON.stringify({summary,issues:rows},null,2));
let md=`# Auditoria integral do banco de questões\n\nGerada em: ${summary.generatedAt}\n\n## Resumo\n\n- Publicadas analisadas: **${summary.publishedAudited}**\n- Quarentena atual: **${summary.quarantine}**\n- Duplicidades registradas: **${summary.duplicates}**\n- Ocorrências críticas: **${summary.severity.critical}**\n- Alertas: **${summary.severity.warning}**\n- Informativos: **${summary.severity.info}**\n\n## Ocorrências por tipo\n\n| Tipo | Quantidade |\n|---|---:|\n`;
for(const [k,v] of Object.entries(summary.issueCounts)) md+=`| ${k} | ${v} |\n`;
md+="\n## Por disciplina\n\n| Disciplina | Questões | Ocorrências | Críticas | Alertas |\n|---|---:|---:|---:|---:|\n";
for(const [d,v] of Object.entries(byDiscipline).sort((a,b)=>b[1].total-a[1].total)) md+=`| ${d.replace(/\|/g,"/")} | ${v.total} | ${v.issues} | ${v.critical} | ${v.warning} |\n`;
md+="\n## Primeiras ocorrências críticas\n\n";
for(const r of rows.filter(x=>x.severity==="critical").slice(0,300)) md+=`- **${r.id}** · ${r.discipline} / ${r.topic} · \`${r.type}\`${r.detail?` — ${r.detail.replace(/\n/g," ")}`:""}\n`;
fs.writeFileSync("audit/question-bank-full-audit.md",md);
console.log(JSON.stringify(summary,null,2));
if(summary.severity.critical>0){console.error(`AUDIT_FAIL: ${summary.severity.critical} ocorrências críticas`);process.exitCode=2;}
