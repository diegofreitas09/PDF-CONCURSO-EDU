import { UECE_QUIMICA_LOTE_100 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote = UECE_QUIMICA_LOTE_100;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 100) fail(`esperadas 100 questões, encontradas ${lote.length}`);

const required = ["id","discipline","topic","statement","options","answer","explanation","source","origin"];
const ids = new Set();
const identities = new Set();
const byTopic = new Map();
let withMedia = 0;

for (const [i,q] of lote.entries()) {
  for (const field of required) if (q[field] == null || (typeof q[field] === "string" && !q[field].trim())) fail(`${q.id || `posição ${i+1}`}: campo obrigatório vazio: ${field}`);
  if (q.discipline !== "Química") fail(`${q.id}: disciplina inválida`);
  if (!Array.isArray(q.options) || q.options.length !== 4 || q.options.some(o => !String(o).trim())) fail(`${q.id}: alternativas inválidas`);
  if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer > 3) fail(`${q.id}: gabarito inválido`);
  if (q.reviewed !== true) fail(`${q.id}: reviewed precisa ser true`);
  if (ids.has(q.id)) fail(`ID duplicado: ${q.id}`);
  ids.add(q.id);
  const identity = `${q.source}::${q.topic}::${q.statement}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();
  if (identities.has(identity)) fail(`fonte/enunciado duplicado: ${q.id}`);
  identities.add(identity);
  byTopic.set(q.topic,(byTopic.get(q.topic)||0)+1);
  if (q.media) withMedia++;
}

const expected = new Map([["Análise de espécies químicas",34],["Atomística",60],["Bioquímica",6]]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 100 || identities.size !== 100) fail("unicidade do lote não fechou em 100/100");

console.log(`UECE Química OK — ${lote.length}/100 | IDs ${ids.size}/100 | fontes ${identities.size}/100 | visuais ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
