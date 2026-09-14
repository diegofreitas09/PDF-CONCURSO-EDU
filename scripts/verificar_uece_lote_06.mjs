import { UECE_TRANSICAO_LOTE_100_06 } from "../src/data/questionSources/ueceTransicaoLote100_06.js";
const lote=UECE_TRANSICAO_LOTE_100_06;
const fail=m=>{console.error(`ERRO UECE lote 06: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const ids=new Set(),src=new Set(); let bio=0,port=0,media=0;
for(const q of lote){for(const f of ["id","discipline","topic","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas inválidas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.discipline}::${q.topic}::${q.statement}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);if(q.discipline==="Biologia")bio++;else if(q.discipline==="Português"){port++;if(!q.context)fail(`${q.id}: contexto ausente`)}else fail(`${q.id}: disciplina inesperada`);if(q.media)media++;}
if(bio!==31||port!==69)fail(`composição ${bio}+${port}`);
if(lote[0].id!=="UECE-BIO-HF-038"||lote.at(-1).id!=="UECE-PORT-INT-069")fail("limites do lote divergentes");
console.log(`UECE lote 06 OK — 100/100 | Biologia ${bio} | Português ${port} | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);
