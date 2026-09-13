import { UECE_FISICA_LOTE_100, UECE_FISICA_LOTE_100_AUDIT } from "../src/data/questionSources/ueceFisicaLote100.js";

const fail=(message)=>{console.error(`❌ UECE Física: ${message}`);process.exit(1)};
const ids=UECE_FISICA_LOTE_100.map(q=>q.id);
const uniqueIds=new Set(ids);
const sourceKeys=UECE_FISICA_LOTE_100.map(q=>`${q.topic}::${q.sourceQuestion}`);
const uniqueSources=new Set(sourceKeys);

if(UECE_FISICA_LOTE_100.length!==100)fail(`lote possui ${UECE_FISICA_LOTE_100.length} itens; esperado 100`);
if(uniqueIds.size!==100)fail(`IDs únicos: ${uniqueIds.size}/100`);
if(uniqueSources.size!==100)fail(`identidades de fonte únicas: ${uniqueSources.size}/100`);
if(UECE_FISICA_LOTE_100_AUDIT.missingRequired.length)fail(`campos obrigatórios ausentes em ${UECE_FISICA_LOTE_100_AUDIT.missingRequired.join(", ")}`);

for(const q of UECE_FISICA_LOTE_100){
  if(q.discipline!=="Física")fail(`${q.id}: disciplina inválida`);
  if(q.reviewed!==true)fail(`${q.id}: reviewed não confirmado`);
  if(!Number.isInteger(q.sourceQuestion)||q.sourceQuestion<1)fail(`${q.id}: sourceQuestion inválido`);
  if(!Array.isArray(q.options)||q.options.length!==4)fail(`${q.id}: alternativas inválidas`);
  if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);
  if(!q.explanation?.trim())fail(`${q.id}: comentário ausente`);
}

const topics=Object.fromEntries([...new Set(UECE_FISICA_LOTE_100.map(q=>q.topic))].map(topic=>[topic,UECE_FISICA_LOTE_100.filter(q=>q.topic===topic).length]));
if(topics["Análise dimensional"]!==32)fail(`Análise dimensional: ${topics["Análise dimensional"]||0}/32`);
if(topics["Cinemática"]!==55)fail(`Cinemática: ${topics["Cinemática"]||0}/55`);
if(topics["Dinâmica"]!==13)fail(`Dinâmica: ${topics["Dinâmica"]||0}/13`);

console.log(`✅ UECE Física: 100/100 | IDs únicos ${uniqueIds.size} | fontes únicas ${uniqueSources.size} | AD 32 | Cinemática 55 | Dinâmica 13 | mídias ${UECE_FISICA_LOTE_100_AUDIT.withMedia}`);
