import { UECE_HISTORIA_LOTE_100_12 as lote } from "../src/data/questionSources/ueceHistoriaLote100_12.js";
const fail=m=>{console.error(`ERRO UECE lote 12: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const exp={"Idade Média":40,"Idade Moderna":50,"Idade Contemporânea":10},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);
const ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes duplicadas');
for(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}
if(lote[0].id!=="UECE-HIST-MED-012"||lote[39].id!=="UECE-HIST-MED-051"||lote[40].id!=="UECE-HIST-MOD-001"||lote[89].id!=="UECE-HIST-MOD-050"||lote[90].id!=="UECE-HIST-CONT-001"||lote.at(-1).id!=="UECE-HIST-CONT-010")fail('limites divergentes');
console.log(`UECE lote 12 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais 0`);
