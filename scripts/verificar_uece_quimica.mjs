import { UECE_QUIMICA_LOTE_400 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote = UECE_QUIMICA_LOTE_400;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 400) fail(`esperadas 400 questões, encontradas ${lote.length}`);

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
  ["Forças intermoleculares",9],
  ["Gases",24],
  ["Isomeria",13],
  ["Materiais de Laboratório",13],
  ["Leis Ponderais",11],
  ["Ligações Químicas",21],
  ["Métodos de Separação de Misturas",9],
  ["Polímeros",5],
  ["Propriedades Coligativas",11],
  ["Química e Reações Inorgânicas",48],
  ["Química e Reações Orgânicas",5],
]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 400 || identities.size !== 400) fail("unicidade do lote não fechou em 400/400");

const quarto = lote.slice(300);
if (quarto.length !== 100) fail(`lote 301–400 não fechou em 100 itens: ${quarto.length}`);
const quartoTopics = new Map();
for (const q of quarto) quartoTopics.set(q.topic,(quartoTopics.get(q.topic)||0)+1);
const expectedQuarto = new Map([
  ["Isomeria",13],
  ["Materiais de Laboratório",13],
  ["Leis Ponderais",11],
  ["Ligações Químicas",21],
  ["Métodos de Separação de Misturas",9],
  ["Polímeros",5],
  ["Propriedades Coligativas",11],
  ["Química e Reações Inorgânicas",12],
  ["Química e Reações Orgânicas",5],
]);
for (const [topic,count] of expectedQuarto) if (quartoTopics.get(topic)!==count) fail(`lote 301–400 / ${topic}: esperado ${count}, encontrado ${quartoTopics.get(topic)||0}`);

const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);
const letras = "ABCD";
const chaves = new Map([
  ["Isomeria","CDACCDACCDBCD"],
  ["Materiais de Laboratório","CBCABACDCDAAC"],
  ["Leis Ponderais","ACBCDBCACDC"],
  ["Ligações Químicas","CBDBCAABDCCBCADACCCAA"],
  ["Métodos de Separação de Misturas","DCBDBDDCB"],
  ["Polímeros","DDBAD"],
  ["Propriedades Coligativas","BDCBBABDBBC"],
  ["Química e Reações Orgânicas","DCACB"],
]);
const chaveInorganica = new Map([[37,"A"],[38,"A"],[39,"B"],[40,"C"],[41,"D"],[42,"C"],[43,"C"],[44,"D"],[45,"A"],[46,"B"],[47,"D"],[48,"B"]]);
for (const q of quarto) {
  const n = numero(q);
  let esperado = null;
  if (q.topic === "Química e Reações Inorgânicas") esperado = chaveInorganica.get(n);
  else if (chaves.has(q.topic)) esperado = chaves.get(q.topic)[n-1];
  if (!esperado) fail(`${q.id}: sem chave oficial mapeada para auditoria do lote 301–400`);
  if (letras[q.answer] !== esperado) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${esperado})`);
}

const quartoVisuais = quarto.filter(q => q.media).length;
console.log(`UECE Química OK — ${lote.length}/400 | lote 301–400 ${quarto.length}/100 | IDs ${ids.size}/400 | fontes ${identities.size}/400 | visuais lote ${quartoVisuais} | visuais acumulados ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
