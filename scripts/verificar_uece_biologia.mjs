import { UECE_BIOLOGIA_LOTE_163 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote=UECE_BIOLOGIA_LOTE_163;
const fail=(msg)=>{console.error(`ERRO UECE Biologia: ${msg}`);process.exit(1);};
if(lote.length!==163) fail(`esperadas 163 questões, encontradas ${lote.length}`);
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
const expected=new Map([
  ["Origem da Vida",30],
  ["Taxonomia, Sistemática e Evolução",28],
  ["Microbiologia",37],
  ["Seres vivos e reprodução",25],
  ["Bioquímica",35],
  ["Botânica",8],
]);
for(const [topic,count] of expected) if(byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
const letras="ABCD";
const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);
const validarChave=(topic,chave)=>{
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==chave.length) fail(`${topic}: chave ${chave.length}, itens ${itens.length}`);
 itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência esperada ${i+1}`);if(letras[q.answer]!==chave[i]) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${chave[i]})`);});
};
// Chaves oficiais já confrontadas diretamente com o quadro da apostila nos blocos anteriores.
validarChave("Origem da Vida","DCDBDDCAABBACBADDCBABDDDACCADC");
validarChave("Taxonomia, Sistemática e Evolução","BCDABDDDACBDCABBBBBDABDDACDB");
// Para os assuntos adicionados neste lote, cada fonte individual foi produzida com gabarito oficial
// conferido nas páginas 352–353; aqui auditamos integralidade, sequência, letra registrada e comentário.
for(const [topic,total] of [["Microbiologia",37],["Seres vivos e reprodução",25],["Bioquímica",35],["Botânica",8]]){
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==total) fail(`${topic}: sequência incompleta`);
 itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência esperada ${i+1}`);});
}
if(ids.size!==163||identities.size!==163) fail("unicidade não fechou em 163/163");
console.log(`UECE Biologia OK — ${lote.length}/163 | IDs ${ids.size}/163 | fontes ${identities.size}/163 | visuais ${withMedia}`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
