import { UECE_BIOLOGIA_LOTE_463 } from "../src/data/questionSources/ueceQuimicaLote100.js";

const lote=UECE_BIOLOGIA_LOTE_463;
const fail=(msg)=>{console.error(`ERRO UECE Biologia: ${msg}`);process.exit(1);};
if(lote.length!==463) fail(`esperadas 463 questões, encontradas ${lote.length}`);
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
  ["Ecologia",66],
  ["Genética",43],
  ["Parasitologia",13],
  ["Zoologia",44],
  ["Histologia e Fisiologia",36],
]);
for(const [topic,count] of expected) if(byTopic.get(topic)!==count) fail(`${topic}: esperado ${count}, encontrado ${byTopic.get(topic)||0}`);
const letras="ABCD";
const numero=(q)=>Number(String(q.id).match(/(\d+)$/)?.[1]);
const validarChave=(topic,chave)=>{
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==chave.length) fail(`${topic}: chave ${chave.length}, itens ${itens.length}`);
 itens.forEach((q,i)=>{if(numero(q)!==i+1) fail(`${q.id}: sequência esperada ${i+1}`);if(letras[q.answer]!==chave[i]) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${chave[i]})`);});
};
const validarSelecionados=(topic,chaveCompleta,numeros)=>{
 const itens=lote.filter(q=>q.topic===topic).sort((a,b)=>numero(a)-numero(b));
 if(itens.length!==numeros.length) fail(`${topic}: esperados ${numeros.length} itens selecionados, encontrados ${itens.length}`);
 itens.forEach((q,i)=>{
   const n=numeros[i];
   if(numero(q)!==n) fail(`${q.id}: número esperado ${n}`);
   const esperado=chaveCompleta[n-1];
   if(letras[q.answer]!==esperado) fail(`${q.id}: gabarito ${letras[q.answer]} diverge da apostila (${esperado})`);
 });
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
const ECOLOGIA="CDCACBCBCCAACDCACBBDCACABBABCCACCBDDACCCBBDADCDAADACBDABBAABCAACDA";
const GENETICA="CAABACADDDCDBCABDACACBAABCBBCACCCBCDBACAACB";
const PARASITOLOGIA="CDDADABBDABCD";
const ZOOLOGIA="BADBDAABCCAADAAADBABABCABABBBABCDCDABBCDADDBB";
const HISTOLOGIA="BDBACDBADCCBADBBD AABBDCBBADCCBCCACBB".replace(/\s/g,"");
validarChave("Botânica",BOTANICA);
validarChave("Citologia",CITOLOGIA);
validarChave("Ecologia",ECOLOGIA);
validarChave("Genética",GENETICA);
validarChave("Parasitologia",PARASITOLOGIA);
validarSelecionados("Zoologia",ZOOLOGIA,[...Array.from({length:27},(_,i)=>i+1),...Array.from({length:17},(_,i)=>i+29)]);
validarSelecionados("Histologia e Fisiologia",HISTOLOGIA,[1,2,3,4,...Array.from({length:32},(_,i)=>i+6)]);
const lote005=lote.slice(363);
if(lote005.length!==100) fail(`lote 364–463 deveria ter 100 questões, encontrou ${lote005.length}`);
const esperadoLote005=GENETICA.slice(36)+PARASITOLOGIA+ZOOLOGIA.slice(0,27)+ZOOLOGIA.slice(28)+HISTOLOGIA.slice(0,4)+HISTOLOGIA.slice(5,37);
if(esperadoLote005.length!==100) fail(`chave do lote 364–463 inválida: ${esperadoLote005.length}`);
lote005.forEach((q,i)=>{if(letras[q.answer]!==esperadoLote005[i]) fail(`${q.id}: gabarito do lote 364–463 diverge da apostila (${esperadoLote005[i]})`);});
if(lote.some(q=>q.id==="UECE-BIO-ZOO-028"||q.id==="UECE-BIO-HF-005")) fail("item incompleto não deveria ter sido integrado");
if(ids.size!==463||identities.size!==463) fail("unicidade não fechou em 463/463");
console.log(`UECE Biologia OK — ${lote.length}/463 | IDs ${ids.size}/463 | fontes ${identities.size}/463 | visuais ${withMedia}`);
console.log(`Lote 364–463 OK — 100/100 | Genética 37–43: 7 | Parasitologia 1–13: 13 | Zoologia 1–27 e 29–45: 44 | Histologia/Fisiologia 1–4 e 6–37: 36`);
console.log([...byTopic.entries()].map(([k,v])=>`${k}: ${v}`).join(" | "));
