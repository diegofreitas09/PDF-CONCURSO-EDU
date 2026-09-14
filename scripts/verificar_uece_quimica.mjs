import { UECE_QUIMICA_LOTE_537 } from "../src/data/questionSources/ueceQuimica537Snapshot.js";

const lote = UECE_QUIMICA_LOTE_537;
const fail = (msg) => { console.error(`ERRO UECE Química: ${msg}`); process.exit(1); };
if (lote.length !== 537) fail(`esperadas 537 questões, encontradas ${lote.length}`);

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
  ["Propriedades Coligativas",11],["Química e Reações Inorgânicas",48],["Química e Reações Orgânicas",109],
  ["Reações Químicas",14],["Termoquímica",19],
]);
for (const [topic,count] of expected) if (byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
if (ids.size !== 537 || identities.size !== 537) fail("unicidade do lote não fechou em 537/537");

const letras = "ABCD";
const numero = (q) => Number(String(q.id).match(/(\d+)$/)?.[1]);
const chaveOrganica = "DCACBDBACBBDAACBABADCACBADDBCDCDCBBABBDCBCAACADCACADABBCDDACBBBCCDAAADCBDCAACCDADDADBDCCDACDDADADCCABBCBDBBBD";
if (chaveOrganica.length !== 109) fail(`chave oficial orgânica deveria ter 109 respostas, tem ${chaveOrganica.length}`);
for (const q of lote.filter(q=>q.topic==="Química e Reações Orgânicas")) {
  const n=numero(q), esperado=chaveOrganica[n-1];
  if (!esperado || letras[q.answer]!==esperado) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${esperado||"sem chave"})`);
}
const validarChave=(topic,chave)=>{
  const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
  if(itens.length!==chave.length) fail(`${topic}: chave ${chave.length}, itens ${itens.length}`);
  itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência de ${topic} esperada ${i+1}`); if(letras[q.answer]!==chave[i]) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${chave[i]})`);});
};
validarChave("Reações Químicas","DACAAADDCCBCDA");
validarChave("Termoquímica","DAADABCABCBCBBABBCC");

const fechamento=lote.slice(500);
if(fechamento.length!==37) fail(`fechamento de Química deveria ter 37 itens, tem ${fechamento.length}`);
const visuaisFechamento=fechamento.filter(q=>q.media).length;
console.log(`UECE Química OK — ${lote.length}/537 | fechamento 501–537 ${fechamento.length}/37 | IDs ${ids.size}/537 | fontes ${identities.size}/537 | visuais fechamento ${visuaisFechamento} | visuais acumulados ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
