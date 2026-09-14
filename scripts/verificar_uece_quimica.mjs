import { UECE_QUIMICA_LOTE_500 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote = UECE_QUIMICA_LOTE_500;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 500) fail(`esperadas 500 questões, encontradas ${lote.length}`);

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
  ["Análise de espécies químicas",34],["Atomística",60],["Bioquímica",17],["Cinética Química",15],
  ["Química Ambiental",10],["Propriedades periódicas",18],["Coloides",6],["Eletrólise",9],
  ["Eletroquímica",18],["Equilíbrio Químico",20],["Estequiometria",24],["Forças intermoleculares",9],
  ["Gases",24],["Isomeria",13],["Materiais de Laboratório",13],["Leis Ponderais",11],
  ["Ligações Químicas",21],["Métodos de Separação de Misturas",9],["Polímeros",5],
  ["Propriedades Coligativas",11],["Química e Reações Inorgânicas",48],["Química e Reações Orgânicas",105],
]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 500 || identities.size !== 500) fail("unicidade do lote não fechou em 500/500");

const quinto = lote.slice(400);
if (quinto.length !== 100) fail(`lote 401–500 não fechou em 100 itens: ${quinto.length}`);
if (quinto.some(q => q.topic !== "Química e Reações Orgânicas")) fail("lote 401–500 contém tópico fora de Química e Reações Orgânicas");

const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);
const letras = "ABCD";
const chaveOrganica = (
  "DCACBDBACB" +
  "BDAACBABAD" +
  "CACBADDBCD" +
  "CDCBBABBDC" +
  "BCAACADCAC" +
  "ADABBCDDAC" +
  "BBBCCDAAAD" +
  "CBDCAACCDA" +
  "DDADB DCCDA".replace(/ /g,"") +
  "CDDADADCCA" +
  "BBCBDBBB" +
  "D"
);
if (chaveOrganica.length !== 109) fail(`chave oficial orgânica deveria ter 109 respostas, tem ${chaveOrganica.length}`);

for (let i=0;i<quinto.length;i++) {
  const q = quinto[i];
  const n = numero(q);
  const esperadoNumero = i + 6;
  if (n !== esperadoNumero) fail(`${q.id}: sequência esperada ${esperadoNumero}, encontrada ${n}`);
  const esperado = chaveOrganica[n-1];
  if (!esperado) fail(`${q.id}: sem chave oficial mapeada`);
  if (letras[q.answer] !== esperado) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${esperado})`);
}

const quintoVisuais = quinto.filter(q => q.media).length;
console.log(`UECE Química OK — ${lote.length}/500 | lote 401–500 ${quinto.length}/100 | IDs ${ids.size}/500 | fontes ${identities.size}/500 | visuais lote ${quintoVisuais} | visuais acumulados ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
