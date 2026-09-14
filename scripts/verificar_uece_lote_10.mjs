import { UECE_TRANSICAO_PORT_EDF_LOTE_100_10_CORRIGIDO as lote } from "../src/data/questionSources/ueceTransicaoPortuguesEducacaoFisicaLote100_10Corrigido.js";
const fail=m=>{console.error(`ERRO UECE lote 10: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const expect={"Gramática":3,"Morfologia textual":23,"Pontuação":10,"Semântica":16,"Sintaxe":13,"Verbo":5,"Saúde":21,"Esporte e manifestação cultural":9}; const topics={}; for(const q of lote)topics[q.topic]=(topics[q.topic]||0)+1; for(const[k,v]of Object.entries(expect))if(topics[k]!==v)fail(`tópico ${k}: ${topics[k]||0}/${v}`);
const ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`)); if(ids.size!==100)fail('IDs duplicados'); if(src.size!==100)fail('itens duplicados');
for(const q of lote){if(!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||!q.origin||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`)}
const exact={
"UECE-PORT-GRAM-041":"partícula apassivadora, pois o sujeito sofre a ação do verbo.",
"UECE-PORT-PONT-007":"“O cenário social, econômico e cultural diversificado em todas as regiões do Brasil desempenha um papel fundamental na formação de comportamentos de saúde [...]”.",
"UECE-PORT-SEM-001":"“Sabemos que estamos falando de um assunto delicado. No entanto, insistimos: escolha cuidar de você, da sua saúde mental e da sua qualidade de vida em primeiro lugar.” (linhas 228-232)",
"UECE-PORT-SEM-014":"“Consequentemente, compreender e abordar os comportamentos de risco durante a adolescência são cruciais para melhorar os resultados de saúde [...].” (linhas 49-52) – EXPLICAÇÃO.",
"UECE-PORT-SINT-005":"“A necessidade de enfrentamento da pobreza e redução das desigualdades incorpora urgência ao tratamento do problema da pobreza menstrual e seu impacto nas futuras gerações.” (linhas 131-136) — objeto direto",
"UECE-PORT-VERB-005":"“A minha voz ainda ecoa / versos perplexos de sangue” (linhas 53-55) – Verbo de ligação"};
for(const[id,v]of Object.entries(exact)){const q=lote.find(x=>x.id===id);if(!q||!q.options.includes(v))fail(`integridade textual: ${id}`)}
if(lote.find(q=>q.id==="UECE-PORT-MORF-010")?.options[3]!=="parassíntese e sufixação.")fail("MORF-010 contaminada por texto-base");
if(!lote.find(q=>q.id==="UECE-PORT-MORF-011")?.context.includes("Cartas para minha avó"))fail("MORF-011 sem texto-base completo");
if(lote.find(q=>q.id==="UECE-PORT-SINT-006")?.context.startsWith("tratamento do problema"))fail("SINT-006 contaminada por alternativa anterior");
const suspicious=/\b(?:do|da|de|dos|das|o|a|os|as|com|sem|para|por|em|no|na|ao|à|um|uma|e|ou|que|se|pelo|pela)\s*$/i;for(const q of lote)for(const [i,o]of q.options.entries())if(suspicious.test(o.trim()))fail(`alternativa possivelmente truncada: ${q.id} ${"ABCD"[i]}`);
if(lote[0].id!=="UECE-PORT-GRAM-039"||lote.at(-1).id!=="UECE-EDF-ESP-009")fail('limites divergentes'); const media=lote.filter(q=>q.media).length; console.log(`UECE lote 10 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media} | integridade textual OK`);
