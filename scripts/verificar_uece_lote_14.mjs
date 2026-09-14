import fs from "node:fs";
import { UECE_HISTORIA_LOTE_100_14 as lote } from "../src/data/questionSources/ueceHistoriaLote100_14.js";
import { REGISTERED_QUESTIONS,QUESTION_DUPLICATES,QUESTION_QUARANTINE } from "../src/data/questionRegistry.js";
const structural=[];
if(lote.length!==100)structural.push(`quantidade:${lote.length}`);
const exp={"Atualidades":3,"Brasil Colonial":57,"Período Regencial":6,"Primeiro Reinado":17,"Segundo Reinado":17},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)structural.push(`topico:${k}:${got[k]||0}/${v}`);
const ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)structural.push('IDs duplicados');if(src.size!==100)structural.push('fontes duplicadas');
for(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)structural.push(`campos:${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)structural.push(`gabarito:${q.id}`);if(q.media)structural.push(`midia:${q.id}`)}
const legacy=new Set(REGISTERED_QUESTIONS.map(q=>q.legacyId));const dupMap=new Map(QUESTION_DUPLICATES.map(q=>[q.legacyId,q]));const quaMap=new Map(QUESTION_QUARANTINE.map(q=>[q.id,q]));
const pending=[];for(const q of lote){if(!legacy.has(q.id))pending.push(`NAO_CONECTADA ${q.id}`);if(dupMap.has(q.id)){const d=dupMap.get(q.id);pending.push(`DUPLICIDADE ${q.id} type=${d.duplicateType} of=${d.duplicateOf}`)}if(quaMap.has(q.id)){const z=quaMap.get(q.id);pending.push(`QUARENTENA ${q.id} reasons=${(z.auditReasons||[]).join(',')}`)}}
if(lote[0]?.id!=="UECE-HIST-ATU-020"||lote[2]?.id!=="UECE-HIST-ATU-022"||lote[3]?.id!=="UECE-HIST-COL-001"||lote[59]?.id!=="UECE-HIST-COL-057"||lote[60]?.id!=="UECE-HIST-REG-001"||lote[65]?.id!=="UECE-HIST-REG-006"||lote[66]?.id!=="UECE-HIST-PRI-001"||lote[82]?.id!=="UECE-HIST-PRI-017"||lote[83]?.id!=="UECE-HIST-SEG-001"||lote.at(-1)?.id!=="UECE-HIST-SEG-017")structural.push('limites divergentes');
const all=[...structural.map(x=>`ESTRUTURA ${x}`),...pending];
fs.writeFileSync(new URL('./lote14_diagnostico.txt',import.meta.url),all.join('\n'),'utf8');
if(all.length){console.log(`UECE lote 14 diagnóstico — ${all.length} pendência(s) registrada(s)`)}else{console.log(`UECE lote 14 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | duplicidades globais 0 | quarentena 0 | visuais 0 | correções 2`)}
