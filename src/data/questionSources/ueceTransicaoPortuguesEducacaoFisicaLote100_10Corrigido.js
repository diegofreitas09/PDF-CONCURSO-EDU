import { UECE_TRANSICAO_PORT_EDF_LOTE_100_10 as RAW } from "./ueceTransicaoPortuguesEducacaoFisicaLote100_10.js";

const ANSWERS={
  "UECE-PORT-GRAM-039":"A","UECE-PORT-GRAM-040":"B","UECE-PORT-GRAM-041":"D",
  ...Object.fromEntries("ADDDCABCABAABABDCBADBCC".split("").map((a,i)=>[`UECE-PORT-MORF-${String(i+1).padStart(3,"0")}`,a])),
  ...Object.fromEntries("ABCDABCBBA".split("").map((a,i)=>[`UECE-PORT-PONT-${String(i+1).padStart(3,"0")}`,a])),
  ...Object.fromEntries("ADAADBDDAAACABBD".split("").map((a,i)=>[`UECE-PORT-SEM-${String(i+1).padStart(3,"0")}`,a])),
  ...Object.fromEntries("ACAACDABACCCA".split("").map((a,i)=>[`UECE-PORT-SINT-${String(i+1).padStart(3,"0")}`,a])),
  ...Object.fromEntries("CCBAA".split("").map((a,i)=>[`UECE-PORT-VERB-${String(i+1).padStart(3,"0")}`,a]))
};
const SAUDE_KEYS=["C","B","A","A","A","A","A","A","B","A","D","D","A","C","A","C","C","A","B","A","B"];
const ESP_KEYS=["D","B","D","B","A","D","C","D","D"];
for(let i=0;i<SAUDE_KEYS.length;i++) ANSWERS[`UECE-EDF-SAUDE-${String(i+1).padStart(3,"0")}`]=SAUDE_KEYS[i];
for(let i=0;i<ESP_KEYS.length;i++) ANSWERS[`UECE-EDF-ESP-${String(i+1).padStart(3,"0")}`]=ESP_KEYS[i];

const byId=Object.fromEntries(RAW.map(q=>[q.id,q]));
const cartasPrefix=byId["UECE-PORT-MORF-010"].options[3].replace(/^parassíntese e sufixação\.\s*/,"");
const cartasTail=" mal dormia na véspera, de tanta ansiedade. Como era gostoso tê-la em casa nos mimando. Sempre trazia na mala presentes para os netos, fazia doces deliciosos para todos, cuidava para que ninguém brigasse. O que eu mais gostava era ter você comigo, trançando meus cabelos. Todas as vezes que você ia embora, eu chorava. Até hoje despedidas são difíceis pra mim. Nunca consegui perguntar a você como foi criar sete filhos com meu avô. Como foi ser a mãe da Edna, do João, do José Roberto, da Erani Benedita, do Avelino, do Edson e do Edmilson. Como foi ser a esposa de José dos Santos. Como você se sentiu ao construir uma boa casa depois de uma vida inteira trabalhando fora, em casa de família. Como foi ser a matriarca de uma das poucas famílias negras de São Dimas, bairro que depois se tornaria de classe média. Como você lidava com o racismo. Será que pensava sobre isso ou foi forçada a naturalizá-lo? Eu não tive tempo de lhe perguntar nada disso. Quais eram os seus sonhos, seus medos. Um bicho-barbeiro te picou, e você precisou colocar um marca-passo. Com a saúde muito fragilizada, aos 68 anos você nos deixou, com muito ainda para viver. [...] (RIBEIRO, Djamila. Cartas para minha avó. São Paulo: Companhia das Letras, 2021, p.9-11. Trecho. Texto adaptado.)";

const OPTION_FIXES={
  "UECE-PORT-GRAM-041":{3:"partícula apassivadora, pois o sujeito sofre a ação do verbo."},
  "UECE-PORT-PONT-007":{3:"“O cenário social, econômico e cultural diversificado em todas as regiões do Brasil desempenha um papel fundamental na formação de comportamentos de saúde [...]”."},
  "UECE-PORT-SEM-001":{3:"“Sabemos que estamos falando de um assunto delicado. No entanto, insistimos: escolha cuidar de você, da sua saúde mental e da sua qualidade de vida em primeiro lugar.” (linhas 228-232)"},
  "UECE-PORT-SEM-014":{3:"“Consequentemente, compreender e abordar os comportamentos de risco durante a adolescência são cruciais para melhorar os resultados de saúde [...].” (linhas 49-52) – EXPLICAÇÃO."},
  "UECE-PORT-SINT-005":{3:"“A necessidade de enfrentamento da pobreza e redução das desigualdades incorpora urgência ao tratamento do problema da pobreza menstrual e seu impacto nas futuras gerações.” (linhas 131-136) — objeto direto"},
  "UECE-PORT-VERB-001":{3:"“O toque do interfone quando se aguarda ansiosamente a chegada do namorado” (linhas 49-50), em que a expressão “a chegada’ deveria vir com o acento indicativo de crase, já que o verbo “aguardar” exige complemento com a preposição “a”, bem como o artigo que acompanha o substantivo é do gênero feminino."},
  "UECE-PORT-VERB-002":{3:"está indicando uma ação passada que ocorreu antes de outra, também no passado, idêntico ao sentido do uso do verbo em destaque na oração “Eram quatro da manhã quando seu pai sofreu um colapso cardíaco”. (linhas 01-02)"},
  "UECE-PORT-VERB-005":{3:"“A minha voz ainda ecoa / versos perplexos de sangue” (linhas 53-55) – Verbo de ligação"}
};

export const UECE_TRANSICAO_PORT_EDF_LOTE_100_10_CORRIGIDO=RAW.map(q=>{
  const options=[...q.options];
  if(q.id==="UECE-PORT-MORF-010") options[3]="parassíntese e sufixação.";
  const fixes=OPTION_FIXES[q.id]; if(fixes) for(const [i,v] of Object.entries(fixes)) options[Number(i)]=v;
  let context=q.context||"";
  if(q.id==="UECE-PORT-MORF-011") context=cartasPrefix+cartasTail;
  if(q.id==="UECE-PORT-SINT-006" && context.includes("Texto para a próxima questão ")) context=context.split("Texto para a próxima questão ").slice(1).join("Texto para a próxima questão ");
  const letter=ANSWERS[q.id];
  if(!letter) throw new Error(`Sem gabarito oficial mapeado: ${q.id}`);
  const answer="ABCD".indexOf(letter);
  return {...q,options,context,answer,explanation:`Gabarito oficial da apostila: ${letter}.`,reviewed:true};
});
