import { UECE_FISICA_LOTE_100, UECE_FISICA_LOTE_001_100, UECE_FISICA_LOTE_101_200, UECE_FISICA_LOTE_201_300, UECE_FISICA_LOTE_301_400, UECE_FISICA_LOTE_100_AUDIT } from "../src/data/questionSources/ueceFisicaLote100.js";

const fail=(message)=>{console.error(`❌ UECE Física: ${message}`);process.exit(1)};
const all=UECE_FISICA_LOTE_100;
const ids=all.map(q=>q.id);
const uniqueIds=new Set(ids);
const sourceKeys=all.map(q=>`${q.topic}::${q.sourceQuestion}`);
const uniqueSources=new Set(sourceKeys);

if(UECE_FISICA_LOTE_001_100.length!==100)fail(`lote 001–100 possui ${UECE_FISICA_LOTE_001_100.length}; esperado 100`);
if(UECE_FISICA_LOTE_101_200.length!==100)fail(`lote 101–200 possui ${UECE_FISICA_LOTE_101_200.length}; esperado 100`);
if(UECE_FISICA_LOTE_201_300.length!==100)fail(`lote 201–300 possui ${UECE_FISICA_LOTE_201_300.length}; esperado 100`);
if(UECE_FISICA_LOTE_301_400.length!==100)fail(`lote 301–400 possui ${UECE_FISICA_LOTE_301_400.length}; esperado 100`);
if(all.length!==400)fail(`coleção possui ${all.length} itens; esperado 400`);
if(uniqueIds.size!==400)fail(`IDs únicos: ${uniqueIds.size}/400`);
if(uniqueSources.size!==400)fail(`identidades de fonte únicas: ${uniqueSources.size}/400`);
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
if(topics["Física elétrica e capacitores"]!==25)fail(`Capacitores: ${topics["Física elétrica e capacitores"]||0}/25`);
if(topics["Energia"]!==17)fail(`Energia: ${topics["Energia"]||0}/17`);
if(topics["Estática, eletrostática e trabalho"]!==41)fail(`Estática/eletrostática/trabalho: ${topics["Estática, eletrostática e trabalho"]||0}/41`);
if(topics["Gravitação"]!==18)fail(`Gravitação: ${topics["Gravitação"]||0}/18`);
if(topics["Hidrostática"]!==29)fail(`Hidrostática íntegra: ${topics["Hidrostática"]||0}/29`);
if(topics["Magnetismo e Eletromagnetismo"]!==22)fail(`Magnetismo íntegro: ${topics["Magnetismo e Eletromagnetismo"]||0}/22`);
if(topics["Ondulatória e Acústica"]!==27)fail(`Ondulatória/Acústica íntegra: ${topics["Ondulatória e Acústica"]||0}/27`);
if(topics["Óptica"]!==27)fail(`Óptica parcial íntegra: ${topics["Óptica"]||0}/27`);

console.log(`✅ UECE Física: 400/400 | lote 301–400 100/100 | IDs únicos ${uniqueIds.size} | fontes únicas ${uniqueSources.size} | mídias ${UECE_FISICA_LOTE_100_AUDIT.withMedia}`);
console.log(`   Composição 301–400: Hidrostática ${UECE_FISICA_LOTE_100_AUDIT.hidrostaticaRestante} | Magnetismo ${UECE_FISICA_LOTE_100_AUDIT.magnetismo} | Ondulatória/Acústica ${UECE_FISICA_LOTE_100_AUDIT.ondulatoriaAcustica} | Óptica ${UECE_FISICA_LOTE_100_AUDIT.opticaInicio}`);
