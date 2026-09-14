import fs from "node:fs";
import { UECE_HISTORIA_LOTE_100_14 as lote } from "../src/data/questionSources/ueceHistoriaLote100_14.js";
const fail=m=>{console.error(`ERRO UECE lote 14: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const exp={"Atualidades":3,"Brasil Colonial":57,"Período Regencial":6,"Primeiro Reinado":17,"Segundo Reinado":17},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);
const ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes/itens duplicados');
for(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}
if(lote[0].id!=="UECE-HIST-ATU-020"||lote[2].id!=="UECE-HIST-ATU-022"||lote[3].id!=="UECE-HIST-COL-001"||lote[59].id!=="UECE-HIST-COL-057"||lote[60].id!=="UECE-HIST-REG-001"||lote[65].id!=="UECE-HIST-REG-006"||lote[66].id!=="UECE-HIST-PRI-001"||lote[82].id!=="UECE-HIST-PRI-017"||lote[83].id!=="UECE-HIST-SEG-001"||lote.at(-1).id!=="UECE-HIST-SEG-017")fail('limites divergentes');
const reg=fs.readFileSync(new URL('../src/data/questionRegistry.js',import.meta.url),'utf8');
if(!reg.includes('import{UECE_HISTORIA_LOTE_100_14}from"./questionSources/ueceHistoriaLote100_14";'))fail('import do lote 14 ausente no registry');
if(!reg.includes('...UECE_HISTORIA_LOTE_100_13,...UECE_HISTORIA_LOTE_100_14'))fail('lote 14 não conectado ao RAW_QUESTIONS');
console.log(`UECE lote 14 OK — 100/100 | conectado ao registry | IDs ${ids.size}/100 | fontes ${src.size}/100 | duplicidades internas 0 | visuais 0 | correções 2`);
