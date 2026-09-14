import { UECE_BIOLOGIA_LOTE_263 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote=UECE_BIOLOGIA_LOTE_263;
const fail=(msg)=>{console.error(`ERRO UECE Biologia: ${msg}`);process.exit(1);};
if(lote.length!==263) fail(`esperadas 263 questões, encontradas ${lote.length}`);
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
  ["Botânica",65],
  ["Citologia",41],
  ["Ecologia",2],
]);
for(const [topic,count] of expected) if(byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
const letras="ABCD";
const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);
const validarChave=(topic,chave)=>{
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==chave.length) fail(`${topic}: chave ${chave.length}, itens ${itens.length}`);
 itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência esperada ${i+1}`);if(letras[q.answer]!==chave[i]) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${chave[i]})`);});
};
validarChave("Origem da Vida","DCDBDDCAABBACBADDCBABDDDACCADC");
validarChave("Taxonomia, Sistemática e Evolução","BCDABDDDACBDCABBBBBDABDDACDB");
for(const [topic,total] of [["Microbiologia",37],["Seres vivos e reprodução",25],["Bioquímica",35]]){
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==total) fail(`${topic}: sequência incompleta`);
 itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência esperada ${i+1}`);});
}
const BOTANICA="DBACDCABACBABAABADDCBDBDBADCBADABABADCBBDDACDDABCBDBBCCBBCBACABCA";
const CITOLOGIA="DBCBDCCACCABABDCBADABBBACBCACCCBBBDCBDADB";
validarChave("Botânica",BOTANICA);
validarChave("Citologia",CITOLOGIA);
validarChave("Ecologia","CD");
const lote003=lote.slice(163);
if(lote003.length!==100) fail(`lote 164–263 deveria ter 100 questões, encontrou ${lote003.length}`);
const esperadoLote003=BOTANICA.slice(8)+CITOLOGIA+"CD";
if(esperadoLote003.length!==100) fail(`chave do lote 164–263 inválida: ${esperadoLote003.length}`);
lote003.forEach((q,i)=>{if(letras[q.answer]!==esperadoLote003[i]) fail(`${q.id}: gabarito do lote 164–263 diverge da apostila (${esperadoLote003[i]})`);});
const faixa=(topic,a,b)=>lote003.filter(q=>q.topic===topic&&numero(q)>=a&&numero(q)<=b).length;
if(faixa("Botânica",9,65)!==57) fail("lote 164–263: Botânica 9–65 incompleta");
if(faixa("Citologia",1,41)!==41) fail("lote 164–263: Citologia 1–41 incompleta");
if(faixa("Ecologia",1,2)!==2) fail("lote 164–263: Ecologia 1–2 incompleta");
if(ids.size!==263||identities.size!==263) fail("unicidade não fechou em 263/263");
console.log(`UECE Biologia OK — ${lote.length}/263 | IDs ${ids.size}/263 | fontes ${identities.size}/263 | visuais ${withMedia}`);
console.log(`Lote 164–263 OK — 100/100 | Botânica 9–65: 57 | Citologia 1–41: 41 | Ecologia 1–2: 2`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
