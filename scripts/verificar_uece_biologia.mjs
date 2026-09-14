import { UECE_BIOLOGIA_LOTE_100_05 } from "../src/data/questionSources/ueceBiologiaLote100_05.js";

const lote=UECE_BIOLOGIA_LOTE_100_05;
const fail=(msg)=>{console.error(`ERRO UECE Biologia: ${msg}`);process.exit(1);};
if(lote.length!==100) fail(`lote 364–463 deveria ter 100 questões, encontrou ${lote.length}`);
const required=["id","discipline","topic","statement","options","answer","explanation","source","origin"];
const ids=new Set(), identities=new Set();
const byTopic=new Map();
let withMedia=0;
for(const [i,q] of lote.entries()){
  for(const field of required) if(q[field]==null||(typeof q[field]==="string"&&!q[field].trim())) fail(`${q.id||`posição ${i+1}`}: campo obrigatório vazio: ${field}`);
  if(q.discipline!=="Biologia") fail(`${q.id}: disciplina inválida`);
  if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(o=>!String(o).trim())) fail(`${q.id}: alternativas inválidas`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3) fail(`${q.id}: gabarito inválido`);
  if(q.reviewed!==true) fail(`${q.id}: reviewed precisa ser true`);
  if(ids.has(q.id)) fail(`ID duplicado: ${q.id}`); ids.add(q.id);
  const identity=`${q.source}::${q.topic}::${q.statement}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
  if(identities.has(identity)) fail(`fonte/enunciado duplicado: ${q.id}`); identities.add(identity);
  const letra=String.fromCharCode(65+q.answer);
  if(!String(q.explanation).includes(`Gabarito oficial da apostila: ${letra}`)) fail(`${q.id}: comentário não confirma o gabarito ${letra}`);
  if(!/Apostila UECE por Assunto 11ª edição/.test(String(q.origin))) fail(`${q.id}: origem inválida`);
  byTopic.set(q.topic,(byTopic.get(q.topic)||0)+1); if(q.media) withMedia++;
}
const esperadoTopicos=new Map([["Genética",7],["Parasitologia",13],["Zoologia",44],["Histologia e Fisiologia",36]]);
for(const [topic,count] of esperadoTopicos) if(byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if(lote[0]?.id!=="UECE-BIO-GEN-037") fail(`primeiro ID inesperado: ${lote[0]?.id}`);
if(lote.at(-1)?.id!=="UECE-BIO-HF-037") fail(`último ID inesperado: ${lote.at(-1)?.id}`);
if(lote.some(q=>q.id==="UECE-BIO-ZOO-028"||q.id==="UECE-BIO-HF-005")) fail("item incompleto não deveria ter sido integrado");
if(ids.size!==100||identities.size!==100) fail("unicidade não fechou em 100/100");
console.log(`UECE Biologia lote 364–463 OK — 100/100 | IDs ${ids.size}/100 | fontes ${identities.size}/100 | visuais ${withMedia}`);
console.log(`Gabaritos conferidos na chave oficial p. 354 durante a montagem do lote.`);
console.log(`Genética 37–43: 7 | Parasitologia 1–13: 13 | Zoologia 1–27 e 29–45: 44 | Histologia/Fisiologia 1–4 e 6–37: 36`);
