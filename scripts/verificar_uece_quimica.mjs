import { UECE_QUIMICA_LOTE_200 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote = UECE_QUIMICA_LOTE_200;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 200) fail(`esperadas 200 questões, encontradas ${lote.length}`);

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

const expected = new Map([
  ["Análise de espécies químicas",34],
  ["Atomística",60],
  ["Bioquímica",17],
  ["Cinética Química",15],
  ["Química Ambiental",10],
  ["Propriedades periódicas",18],
  ["Coloides",6],
  ["Eletrólise",9],
  ["Eletroquímica",18],
  ["Equilíbrio Químico",13],
]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 200 || identities.size !== 200) fail("unicidade do lote não fechou em 200/200");

const segundo = lote.slice(100);
if (segundo.length !== 100) fail(`lote 101–200 não fechou em 100 itens: ${segundo.length}`);
const segundoTopics = new Map();
for (const q of segundo) segundoTopics.set(q.topic,(segundoTopics.get(q.topic)||0)+1);
const expectedSegundo = new Map([
  ["Bioquímica",11],
  ["Cinética Química",15],
  ["Química Ambiental",10],
  ["Propriedades periódicas",18],
  ["Coloides",6],
  ["Eletrólise",9],
  ["Eletroquímica",18],
  ["Equilíbrio Químico",13],
]);
for (const [topic,count] of expectedSegundo) if (segundoTopics.get(topic)!==count) fail(`lote 101–200 / ${topic}: esperado ${count}, encontrado ${segundoTopics.get(topic)||0}`);

console.log(`UECE Química OK — ${lote.length}/200 | lote 101–200 ${segundo.length}/100 | IDs ${ids.size}/200 | fontes ${identities.size}/200 | visuais ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
