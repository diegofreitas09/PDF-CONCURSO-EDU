// UECE por Assunto — Química / Coloides (6 questões)
// Fonte: Apostila UECE por Assunto 11ª edição, p. 197. Gabaritos conferidos no quadro oficial.
const ORIGIN="Apostila UECE por Assunto 11ª edição — p. 197";
const q=(id,source,statement,options,answer,explanation)=>({
  id:`UECE-QUI-COL-${String(id).padStart(3,"0")}`,discipline:"Química",topic:"Coloides",
  statement:`(${source}) ${statement}`,options,answer,
  explanation:`Gabarito oficial: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,origin:ORIGIN,reviewed:true
});
export const UECE_QUIMICA_COLOIDES_LOTE_06=[
q(1,"UECE 2017.2 2ª Fase","Pacientes com deficiência nas funções renais utilizam a diálise, processo de purificação do sangue que é uma aplicação prática do conhecimento dos coloides. Assinale a opção que apresenta somente conceitos relacionados aos coloides.",[
  "Efeito estufa, adsorção e cataforese.",
  "Adsorção, movimento browniano e efeito Tyndall.",
  "Efeito Tyndall, difusão e cataforese.",
  "Movimento browniano, osmose reversa e efusão."
],1,"Adsorção, movimento browniano e efeito Tyndall são fenômenos clássicos associados a sistemas coloidais."),
q(2,"UECE 2019.1 2ª Fase","Em 1861 Thomas Graham observou o comportamento de determinados sistemas comparando-os com as soluções e classificou tais sistemas como coloides. No que diz respeito a coloides, é correto afirmar que",[
  "a diferença fundamental entre uma dispersão coloidal e uma solução verdadeira está na natureza das partículas.",
  "o fenômeno que ocorre quando um raio infravermelho atravessa uma dispersão coloidal é conhecido como efeito Doppler.",
  "o sol é um coloide constituído de partículas sólidas finamente divididas dispersas em meio líquido.",
  "as partículas dispersas apresentam sempre o mesmo tamanho e por isso o sistema coloidal é chamado monodisperso."
],2,"O gabarito oficial assinala C. O Sol pode ser tratado, no contexto apresentado pela questão, como sistema coloidal; as demais alternativas trazem definições ou fenômenos incorretos."),
q(3,"UECE 2021.1 2ª Fase","A gelatina derivada do colágeno é considerada um balão de água mantido dentro da rede através de uma força denominada",[
  "tensão superficial.","efeito Tyndall.","viscosidade.","ligações de hidrogênio."
],0,"A alternativa indicada no material é tensão superficial."),
q(4,"UECE 2022.2 2ª Fase","Thomas Graham dedicou suas pesquisas à difusão de gases e líquidos na química dos coloides. Atente para o que se afirma: I. A diferença fundamental entre uma dispersão coloidal e uma solução é a natureza das partículas. II. As suspensões coloidais são, geralmente, agregados de íons e moléculas. III. O movimento aleatório das partículas coloidais é denominado efeito Tyndall. IV. O carvão ativado tem uma enorme superfície e é utilizado para adsorver impurezas de líquidos ou gases. V. A diálise utiliza membranas que permitem a passagem de dispersões coloidais e evitam a passagem de soluções verdadeiras. É correto o que se afirma somente em",[
  "I, III e IV.","II e V.","I, III, V.","II e IV."
],3,"II e IV são as proposições consideradas corretas no gabarito oficial. Movimento aleatório é movimento browniano, e a diálise separa partículas coloidais das menores espécies dissolvidas."),
q(5,"UECE 2023.1 2ª Fase","Os coloides podem ser encontrados no corpo humano, nos cosméticos, nos alimentos e em várias indústrias. Marque a única alternativa que alinha corretamente a sequência meio dispersante – fase dispersa – nome – exemplo, identificando plenamente um coloide.",[
  "Gás – sólido – gel – nevoeiro.",
  "Sólido – sólido – espuma – isopor.",
  "Gás – sólido – aerossol – fumaça.",
  "Líquido – sólido – emulsão – leite de magnésia."
],2,"Fumaça é um aerossol com partículas sólidas dispersas em gás."),
q(6,"UECE 2025.2 2ª Fase","Dispersões coloidais são sistemas heterogêneos formados por um meio dispersante e outro disperso, com partículas entre 1 e 100 nanômetros. Considere: I. Maionese. II. Neblina. III. Sangue. IV. Óleo de soja. As opções que representam dispersões coloidais são somente",[
  "I, II e III.","II, III e IV.","I e IV.","II e III."
],0,"Maionese, neblina e sangue são exemplos de sistemas coloidais; óleo de soja homogêneo não é classificado como coloide nesse contexto.")
];
