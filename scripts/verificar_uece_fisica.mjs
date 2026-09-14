import { UECE_FISICA_LOTE_100, UECE_FISICA_LOTE_001_100, UECE_FISICA_LOTE_101_200, UECE_FISICA_LOTE_201_300, UECE_FISICA_LOTE_301_400, UECE_FISICA_LOTE_401_500, UECE_FISICA_FECHAMENTO_501_510, UECE_FISICA_LOTE_100_AUDIT } from "../src/data/questionSources/ueceFisicaLote100.js";

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
if(UECE_FISICA_LOTE_401_500.length!==100)fail(`lote 401–500 possui ${UECE_FISICA_LOTE_401_500.length}; esperado 100`);
if(UECE_FISICA_FECHAMENTO_501_510.length!==10)fail(`fechamento 501–510 possui ${UECE_FISICA_FECHAMENTO_501_510.length}; esperado 10`);
if(all.length!==510)fail(`coleção possui ${all.length} itens; esperado 510`);
if(uniqueIds.size!==510)fail(`IDs únicos: ${uniqueIds.size}/510`);
if(uniqueSources.size!==510)fail(`identidades de fonte únicas: ${uniqueSources.size}/510`);
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
if(topics["Hidrostática"]!==32)fail(`Hidrostática íntegra: ${topics["Hidrostática"]||0}/32`);
if(topics["Magnetismo e Eletromagnetismo"]!==22)fail(`Magnetismo íntegro: ${topics["Magnetismo e Eletromagnetismo"]||0}/22`);
if(topics["Ondulatória e Acústica"]!==27)fail(`Ondulatória/Acústica íntegra: ${topics["Ondulatória e Acústica"]||0}/27`);
if(topics["Óptica"]!==46)fail(`Óptica completa: ${topics["Óptica"]||0}/46`);
if(topics["Movimento Harmônico Simples"]!==35)fail(`MHS completo: ${topics["Movimento Harmônico Simples"]||0}/35`);
if(topics["Calorimetria, Termologia e Calor"]!==37)fail(`Calorimetria/Termologia completa: ${topics["Calorimetria, Termologia e Calor"]||0}/37`);
if(topics["Momento Linear"]!==12)fail(`Momento Linear: ${topics["Momento Linear"]||0}/12`);
if(topics["Análise Vetorial e Escalar"]!==4)fail(`Análise Vetorial e Escalar: ${topics["Análise Vetorial e Escalar"]||0}/4`);

const expected401_500=[
  ["Óptica",25,46],
  ["Movimento Harmônico Simples",1,35],
  ["Calorimetria, Termologia e Calor",1,37],
  ["Momento Linear",1,6]
];
for(const [topic,min,max] of expected401_500){
  const nums=UECE_FISICA_LOTE_401_500.filter(q=>q.topic===topic).map(q=>q.sourceQuestion).sort((a,b)=>a-b);
  const expected=Array.from({length:max-min+1},(_,i)=>min+i);
  if(JSON.stringify(nums)!==JSON.stringify(expected))fail(`sequência de fonte inválida em ${topic}: ${nums.join(",")}`);
}

const expectedFinal=[
  ["Momento Linear",7,12],
  ["Análise Vetorial e Escalar",1,4]
];
for(const [topic,min,max] of expectedFinal){
  const nums=UECE_FISICA_FECHAMENTO_501_510.filter(q=>q.topic===topic).map(q=>q.sourceQuestion).sort((a,b)=>a-b);
  const expected=Array.from({length:max-min+1},(_,i)=>min+i);
  if(JSON.stringify(nums)!==JSON.stringify(expected))fail(`fechamento inválido em ${topic}: ${nums.join(",")}`);
}

console.log(`✅ UECE Física: 510/510 | cinco lotes 100/100 + fechamento 10/10 | IDs únicos ${uniqueIds.size} | fontes únicas ${uniqueSources.size} | mídias ${UECE_FISICA_LOTE_100_AUDIT.withMedia}`);
console.log(`   Fechamento 501–510: Momento Linear ${UECE_FISICA_LOTE_100_AUDIT.momentoLinearRestante} | Análise Vetorial/Escalar ${UECE_FISICA_LOTE_100_AUDIT.analiseVetorialEscalar}`);
