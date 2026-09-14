import { UECE_QUIMICA_LOTE_300 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote = UECE_QUIMICA_LOTE_300;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 300) fail(`esperadas 300 questões, encontradas ${lote.length}`);

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
  ["Equilíbrio Químico",20],
  ["Estequiometria",24],
  ["Forças Intermoleculares",9],
  ["Gases",24],
  ["Química e Reações Inorgânicas",36],
]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 300 || identities.size !== 300) fail("unicidade do lote não fechou em 300/300");

const terceiro = lote.slice(200);
if (terceiro.length !== 100) fail(`lote 201–300 não fechou em 100 itens: ${terceiro.length}`);
const terceiroTopics = new Map();
for (const q of terceiro) terceiroTopics.set(q.topic,(terceiroTopics.get(q.topic)||0)+1);
const expectedTerceiro = new Map([
  ["Equilíbrio Químico",7],
  ["Estequiometria",24],
  ["Forças Intermoleculares",9],
  ["Gases",24],
  ["Química e Reações Inorgânicas",36],
]);
for (const [topic,count] of expectedTerceiro) if (terceiroTopics.get(topic)!==count) fail(`lote 201–300 / ${topic}: esperado ${count}, encontrado ${terceiroTopics.get(topic)||0}`);

console.log(`UECE Química OK — ${lote.length}/300 | lote 201–300 ${terceiro.length}/100 | IDs ${ids.size}/300 | fontes ${identities.size}/300 | visuais ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
