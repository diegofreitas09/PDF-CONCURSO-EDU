import { UECE_FISICA_LOTE_100, UECE_FISICA_LOTE_001_100, UECE_FISICA_LOTE_101_200, UECE_FISICA_LOTE_100_AUDIT } from "../src/data/questionSources/ueceFisicaLote100.js";

const fail=(message)=>{console.error(`❌ UECE Física: ${message}`);process.exit(1)};
const all=UECE_FISICA_LOTE_100;
const ids=all.map(q=>q.id);
const uniqueIds=new Set(ids);
const sourceKeys=all.map(q=>`${q.topic}::${q.sourceQuestion}`);
const uniqueSources=new Set(sourceKeys);

if(UECE_FISICA_LOTE_001_100.length!==100)fail(`lote inicial possui ${UECE_FISICA_LOTE_001_100.length}; esperado 100`);
if(UECE_FISICA_LOTE_101_200.length!==100)fail(`lote novo possui ${UECE_FISICA_LOTE_101_200.length}; esperado 100`);
if(all.length!==200)fail(`coleção possui ${all.length} itens; esperado 200`);
if(uniqueIds.size!==200)fail(`IDs únicos: ${uniqueIds.size}/200`);
if(uniqueSources.size!==200)fail(`identidades de fonte únicas: ${uniqueSources.size}/200`);
if(UECE_FISICA_LOTE_100_AUDIT.missingRequired.length)fail(`campos obrigatórios ausentes em ${UECE_FISICA_LOTE_100_AUDIT.missingRequired.join(", ")}`);

for(const q of all){
  if(q.discipline!=="Física")fail(`${q.id}: disciplina inválida`);
  if(q.reviewed!==true)fail(`${q.id}: reviewed não confirmado`);
  if(!Number.isInteger(q.sourceQuestion)||q.sourceQuestion<1)fail(`${q.id}: sourceQuestion inválido`);
  if(!Array.isArray(q.options)||q.options.length!==4)fail(`${q.id}: alternativas inválidas`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);
  if(!q.explanation?.trim())fail(`${q.id}: comentário ausente`);
}

const topics=Object.fromEntries([...new Set(all.map(q=>q.topic))].map(topic=>[topic,all.filter(q=>q.topic===topic).length]));
if(topics["Análise dimensional"]!==32)fail(`Análise dimensional: ${topics["Análise dimensional"]||0}/32`);
if(topics["Cinemática"]!==55)fail(`Cinemática: ${topics["Cinemática"]||0}/55`);
if(topics["Dinâmica"]!==45)fail(`Dinâmica íntegra: ${topics["Dinâmica"]||0}/45`);
if(topics["Eletrodinâmica"]!==37)fail(`Eletrodinâmica: ${topics["Eletrodinâmica"]||0}/37`);
if(topics["Termodinâmica"]!==25)fail(`Termodinâmica: ${topics["Termodinâmica"]||0}/25`);
if(topics["Física elétrica e capacitores"]!==6)fail(`Capacitores: ${topics["Física elétrica e capacitores"]||0}/6`);

console.log(`✅ UECE Física: 200/200 | lote 101–200 100/100 | IDs únicos ${uniqueIds.size} | fontes únicas ${uniqueSources.size} | mídias ${UECE_FISICA_LOTE_100_AUDIT.withMedia}`);
console.log(`   Composição nova: Dinâmica ${UECE_FISICA_LOTE_100_AUDIT.dinamicaRestante} | Eletrodinâmica ${UECE_FISICA_LOTE_100_AUDIT.eletrodinamica} | Termodinâmica ${UECE_FISICA_LOTE_100_AUDIT.termodinamica} | Capacitores ${UECE_FISICA_LOTE_100_AUDIT.capacitoresInicio}`);
