// UECE por Assunto — Química / Eletroquímica (18 questões)
// Fonte: Apostila UECE por Assunto 11ª edição, p. 199-201. Gabaritos conferidos no quadro oficial.
const ORIGIN="Apostila UECE por Assunto 11ª edição — p. 199-201";
const q=(id,source,statement,options,answer,explanation,media=null)=>({
  id:`UECE-QUI-ELQ-${String(id).padStart(3,"0")}`,discipline:"Química",topic:"Eletroquímica",
  statement:`(${source}) ${statement}`,options,answer,
  explanation:`Gabarito oficial: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,origin:ORIGIN,reviewed:true,...(media?{media}: {})
});

const Q1_TABLE={
  type:"table",
  title:"Potenciais padrão de redução",
  headers:["Metal","Semirreação de redução","E° (V)"],
  rows:[
    ["Cobre","$\\mathrm{Cu^{2+}+2e^-\\rightarrow Cu}$","+0,34"],
    ["Ferro","$\\mathrm{Fe^{2+}+2e^-\\rightarrow Fe}$","-0,44"],
    ["Magnésio","$\\mathrm{Mg^{2+}+2e^-\\rightarrow Mg}$","-2,37"],
    ["Potássio","$\\mathrm{K^+ + e^-\\rightarrow K}$","-2,93"],
    ["Cádmio","$\\mathrm{Cd^{2+}+2e^-\\rightarrow Cd}$","-0,40"]
  ],
  caption:"Tabela reconstruída fielmente a partir da questão original da apostila UECE."
};

export const UECE_QUIMICA_ELETROQUIMICA_LOTE_18=[
q(1,"UECE 2017.1 2ª Fase","Para preservar o casco de ferro dos navios contra os efeitos danosos da corrosão, além da pintura são introduzidas placas ou cravos de certo material conhecido como ‘metal de sacrifício’. A função do metal de sacrifício é sofrer oxidação no lugar do ferro. Considerando seus conhecimentos de química e a tabela de potenciais de redução abaixo, assinale a opção que apresenta o metal mais adequado para esse fim.",[
  "Potássio.","Cádmio.","Cobre.","Magnésio."
],3,"O metal de sacrifício deve oxidar-se mais facilmente que o ferro. Entre as opções, o magnésio tem potencial padrão de redução suficientemente mais negativo e é o material adequado para proteção catódica do casco.",Q1_TABLE),

q(2,"UECE 2017.2 2ª Fase","Atente às seguintes proposições: 1. Eletrólise é um processo não espontâneo que consome energia externa fornecida por um gerador. 2. A pilha se esgota quando entra em equilíbrio, e não quando algum dos seus reagentes se esgota. Considerando as proposições acima, é correto afirmar que",[
  "1 é falsa e 2 é verdadeira.","2 é falsa e 1 é verdadeira.","ambas são falsas.","ambas são verdadeiras."
],3,"A eletrólise requer energia externa e é não espontânea. A pilha deixa de fornecer corrente quando atinge o equilíbrio eletroquímico; por isso, no tratamento idealizado da questão, as duas proposições são verdadeiras."),

q(3,"UECE 2017.2 2ª Fase","Os hidrocarbonetos fazem parte de uma classe de compostos orgânicos presente na natureza e diretamente em nossa vida. Na análise de uma amostra cuidadosamente purificada de determinado hidrocarboneto, foram obtidos os dados percentuais em massa %C = 87,1 e %H = 12,9. Sabendo-se que sua massa molecular é 124, é correto afirmar que aproximadamente o hidrocarboneto em questão é um",[
  "alcano.","cicloalcano.","alcino.","hidrocarboneto aromático."
],2,"A composição percentual conduz aproximadamente à fórmula molecular $\\mathrm{C_9H_{16}}$ (M = 124 g/mol), compatível com a fórmula geral dos alcinos $\\mathrm{C_nH_{2n-2}}$."),

q(4,"UECE 2019.1 1ª Fase","Uma pilha de alumínio e prata foi montada e, após algum tempo, constatou-se que o eletrodo de alumínio perdeu 135 mg desse metal. O número de elétrons transferidos de um eletrodo para outro durante esse tempo foi de",[
  "$6,02\\times10^{23}$.","$6,02\\times10^{21}$.","$9,03\\times10^{21}$.","$9,03\\times10^{23}$."
],2,"135 mg = 0,135 g de Al, isto é, 0,005 mol. Como $\\mathrm{Al\\rightarrow Al^{3+}+3e^-}$, são transferidos 0,015 mol de elétrons, aproximadamente $9,03\\times10^{21}$ elétrons."),

q(5,"UECE 2019.2 2ª Fase","Considerando a reação na pilha de Daniell, $\\mathrm{Zn + CuSO_4 \\rightarrow ZnSO_4 + Cu}$, pode-se afirmar com absoluta segurança que",[
  "a concentração da solução de sulfato de cobre diminui com o funcionamento da pilha.","o fluxo de elétrons vai da placa de cobre para a placa de zinco.","o ânodo da pilha é a placa de cobre.","o íon $\\mathrm{Zn^{2+}}$ funciona como oxidante."
],0,"Na pilha de Daniell, $\\mathrm{Cu^{2+}}$ é reduzido a Cu, de modo que a concentração de sulfato de cobre diminui durante o funcionamento."),

q(6,"UECE 2020.1 2ª Fase","Quando se fala em corrosão, é comum vir à mente a corrosão de metais, principalmente a do ferro, que gera a ferrugem. Porém, outros materiais podem sofrer corrosão. No que diz respeito a esse assunto, assinale a afirmação verdadeira.",[
  "A ferrugem é um exemplo de corrosão eletroquímica. Nesse processo, o ferro é oxidado quando exposto ao ar úmido, formando o polo positivo da pilha.",
  "Enquanto os cátions $\\mathrm{Fe^{2+}}$ migram para o polo positivo (ânodo), os ânions $\\mathrm{OH^-}$ migram para o polo negativo (cátodo) e ocorre a formação de $\\mathrm{Fe(OH)_2}$.",
  "Concreto armado pode sofrer corrosão por ácidos conforme $\\mathrm{3CaO\\cdot2SiO_2\\cdot3H_2O + 2NH_3 \\rightarrow 3CaO + 2SiO_2 + 6H_2O + N_2}$.",
  "Na presença de oxigênio, $\\mathrm{Fe(OH)_2}$ é oxidado a $\\mathrm{Fe(OH)_3}$, que depois perde água e se transforma no óxido de ferro(III) mono-hidratado $\\mathrm{Fe_2O_3\\cdot H_2O}$, de coloração castanho-avermelhada."
],3,"Na formação da ferrugem, espécies de ferro(II) são posteriormente oxidadas a ferro(III), originando produtos hidratados de coloração castanho-avermelhada; a alternativa D descreve corretamente essa etapa."),

q(7,"UECE 2020.1 2ª Fase","Entre as diversas aplicações da eletrólise, encontra-se a galvanização. Considerando o processo de galvanização, analise as proposições: I. É a aplicação de uma camada de cobre ou ligas de cobre sobre aço ou ferro. II. A finalidade é formar uma capa protetora que evite a corrosão do metal. III. O método mais usado é o de imersão a quente. IV. O metal utilizado é conhecido como metal de sacrifício e tem maior poder de redução que o metal a ser protegido. São verdadeiras somente as proposições",[
  "I e III.","I e IV.","II e IV.","II e III."
],3,"A galvanização usual protege o ferro/aço contra corrosão e o processo industrial mais comum é a imersão a quente em zinco. Assim, II e III são verdadeiras."),

q(8,"UECE 2021.1 2ª Fase","Na limpeza de sua casa, para remover uma sujeira mais intensa, Lindalva precisa usar ácido muriático ($\\mathrm{HCl}$ concentrado). Para preparar sua solução de limpeza, dispõe de vasilhames de prata, zinco, chumbo e alumínio. Considere os potenciais padrão de redução: $\\mathrm{Ag^+/Ag}=+0,80$ V; $\\mathrm{Zn^{2+}/Zn}=-0,76$ V; $\\mathrm{2H^+/H_2}=0,00$ V; $\\mathrm{Pb^{2+}/Pb}=-0,13$ V; $\\mathrm{Al^{3+}/Al}=-1,66$ V. É correto afirmar que Lindalva deve escolher o vasilhame de",[
  "chumbo, porque este metal não é atacado pelo ácido.","prata, porque não é oxidada pelo ácido.","zinco, porque desloca o hidrogênio da solução e é reduzido.","alumínio, porque possui o menor potencial padrão de redução."
],1,"Metais com potencial de redução menor que o par H+/H2 tendem a ser oxidados pelo ácido. A prata, com E° = +0,80 V, não é oxidada por H+ nessas condições."),

q(9,"UECE 2022.1 2ª Fase","As baterias recarregáveis possuem a característica de prolongar sua vida útil. A bateria de chumbo usada nos carros possui seis células, cada uma gerando 2,0 V, e a reação celular geral $\\mathrm{Pb(s)+PbO_2(s)+2H_2SO_4(aq)\\rightarrow 2PbSO_4(s)+2H_2O(l)}$. Sobre essa reação, é correto afirmar que",[
  "o ânodo é feito de Pb, o cátodo de $\\mathrm{PbO_2}$ e o eletrólito é uma solução concentrada de $\\mathrm{H_2SO_4}$.",
  "o cátodo é o $\\mathrm{PbSO_4}$, o ânodo é feito de Pb e o eletrólito é uma solução concentrada de $\\mathrm{H_2SO_4}$.",
  "o ânodo é feito de Pb, o cátodo de $\\mathrm{PbO_2}$ e o eletrólito é o $\\mathrm{PbSO_4}$.",
  "o cátodo é feito de Pb, o ânodo $\\mathrm{PbO_2}$ e o eletrólito é o $\\mathrm{PbSO_4}$."
],0,"Na descarga da bateria chumbo-ácido, Pb atua como ânodo, PbO2 como cátodo e o ácido sulfúrico aquoso é o eletrólito."),

q(10,"UECE 2022.2 2ª Fase","O cloreto de potássio usado na produção de fertilizantes e suplemento dietético sofre eletrólise em solução aquosa com eletrodos inertes. Durante a eletrólise ocorre, no cátodo da célula, a",[
  "formação de gás hidrogênio.","produção de cloro gasoso.","produção de íons potássio.","liberação de oxigênio."
],0,"Em solução aquosa, a redução da água é favorecida em relação à redução de K+, produzindo $\\mathrm{H_2}$ no cátodo."),

q(11,"UECE 2022.2 2ª Fase","O tempo gasto para obter-se 14,8 g de cobre, sabendo que a constante de Faraday é 96.500 C e utilizando uma corrente elétrica de 5 ampères é, aproximadamente,",[
  "2,0 horas.","3,0 horas.","2,5 horas.","3,5 horas."
],2,"Pela lei de Faraday para $\\mathrm{Cu^{2+}+2e^-\\rightarrow Cu}$, 14,8 g correspondem a cerca de 0,233 mol de Cu e 0,466 mol de elétrons. Com 5 A, o tempo é aproximadamente 2,5 h."),

q(12,"UECE 2023.1 2ª Fase","Para minimizar os efeitos da corrosão, as chapas do casco de um navio são presas às cavernas por rebites de magnésio, que têm como função sofrer corrosão no lugar do ferro contido no aço. Isso é possível porque, certamente, o magnésio tem",[
  "maior potencial de ionização.","maior potencial de redução.","maior potencial de oxidação.","maior afinidade eletrônica."
],2,"O magnésio se oxida preferencialmente ao ferro e, portanto, apresenta maior tendência à oxidação (maior potencial de oxidação) no contexto da proteção catódica."),

q(13,"UECE 2025.1 1ª Fase","Para que uma pilha funcione, é necessário que a reação de oxidação-redução seja espontânea. Considere as semirreações de redução: I. $\\mathrm{Co^{3+}+e^-\\rightarrow Co^{2+}}$ E°=1,82 V; II. $\\mathrm{Cu^{2+}+2e^-\\rightarrow Cu}$ E°=0,34 V; III. $\\mathrm{Sn^{2+}+2e^-\\rightarrow Sn}$ E°=-0,14 V; IV. $\\mathrm{Na^+ +e^-\\rightarrow Na}$ E°=-2,71 V. Assinale a opção em que a reação de oxidação-redução é espontânea.",[
  "$\\mathrm{Cu + Sn^{2+} \\rightarrow Cu^{2+}+Sn}$.",
  "$\\mathrm{Co^{2+}+Na^+ \\rightarrow Co^{3+}+Na}$.",
  "$\\mathrm{2Co^{3+}+Sn \\rightarrow 2Co^{2+}+Sn^{2+}}$.",
  "$\\mathrm{Cu+2Na^+ \\rightarrow Cu^{2+}+2Na}$ ."
],2,"Na alternativa C, Co3+ é reduzido e Sn é oxidado. A diferença entre os potenciais de redução é positiva, tornando a reação espontânea."),

q(14,"UECE 2025.2 1ª Fase","A reação de oxirredução é necessária para que uma pilha funcione. Considere as semirreações: I. $\\mathrm{Co^{3+}+e^-\\rightarrow Co^{2+}}$ E°=1,82 V; II. $\\mathrm{Ag^+ +e^-\\rightarrow Ag}$ E°=0,80 V; III. $\\mathrm{Zn^{2+}+2e^-\\rightarrow Zn}$ E°=-0,76 V; IV. $\\mathrm{Na^+ +e^-\\rightarrow Na}$ E°=-2,71 V. Assinale a reação espontânea.",[
  "$\\mathrm{2Ag+Zn^{2+}\\rightarrow 2Ag^+ +Zn}$.",
  "$\\mathrm{Co^{2+}+Na^+\\rightarrow Co^{3+}+Na}$.",
  "$\\mathrm{2Co^{3+}+Zn\\rightarrow 2Co^{2+}+Zn^{2+}}$.",
  "$\\mathrm{Ag+Na^+\\rightarrow Ag^+ +Na}$ ."
],2,"Co3+ apresenta o maior potencial de redução e Zn pode ser oxidado; a combinação da alternativa C fornece E° da pilha positivo."),

q(15,"UECE 2025.2 2ª Fase","Em uma pilha eletroquímica, dois eletrodos metálicos são mergulhados em soluções contendo seus respectivos íons. As semirreações são $\\mathrm{Cd^{2+}+2e^-\\rightarrow Cd}$, E°=-0,40 V, e $\\mathrm{Hg^{2+}+2e^-\\rightarrow Hg}$, E°=+0,85 V. A diferença de potencial da pilha formada é",[
  "+0,45 V.","+1,25 V.","-1,25 V.","-0,45 V."
],1,"Hg2+/Hg funciona como cátodo e Cd2+/Cd como ânodo. Logo, E°pilha = 0,85 - (-0,40) = +1,25 V."),

q(16,"UECE 2026.1 2ª Fase","Atente para as afirmações sobre reações de oxirredução: I. Envolvem transferência de elétrons entre espécies químicas. II. A espécie que perde elétrons sofre oxidação e atua como agente redutor. III. A espécie que ganha elétrons sofre redução e atua como agente oxidante. IV. A semirreação que envolve perda de elétrons é denominada redução. Está correto o que se afirma em",[
  "I, II e IV apenas.","III e IV apenas.","I, II e III apenas.","I, II, III e IV."
],2,"I, II e III estão corretas. A afirmação IV é falsa porque perda de elétrons caracteriza oxidação."),

q(17,"UECE 2026.1 2ª Fase","Em processos metalúrgicos industriais, como na produção de metais a partir de seus minérios, é comum o uso de substâncias capazes de reduzir íons metálicos e, assim, liberar o metal puro. Considere os elementos, em ordem crescente de potencial de redução padrão: Ca, Na, Zn, Fe, Cu, Hg, Ag, Au. Pode-se afirmar corretamente que o metal com maior tendência a atuar como agente redutor é o",[
  "Ca.","Fe.","Cu.","Au."
],0,"Quanto menor o potencial padrão de redução, maior a tendência do metal a sofrer oxidação e atuar como agente redutor. Entre os apresentados, o cálcio é o mais redutor."),

q(18,"UECE 2026.1 2ª Fase","Em processos industriais de galvanoplastia e recuperação de metais, uma célula galvânica é construída com eletrodos de ferro e cobre imersos em suas soluções. Dados: $\\mathrm{Fe^{2+}+2e^-\\rightarrow Fe}$ E°=-0,44 V e $\\mathrm{Cu^{2+}+2e^-\\rightarrow Cu}$ E°=+0,34 V. A semirreação que ocorre no ânodo é",[
  "$\\mathrm{Fe\\rightarrow Fe^{2+}+2e^-}$.",
  "$\\mathrm{Cu^{2+}+2e^-\\rightarrow Cu}$.",
  "$\\mathrm{Fe^{2+}+2e^-\\rightarrow Fe}$.",
  "$\\mathrm{Cu\\rightarrow Cu^{2+}+2e^-}$ ."
],0,"O ânodo é o eletrodo em que ocorre oxidação. Como Fe tem menor potencial de redução, ele é oxidado: $\\mathrm{Fe\\rightarrow Fe^{2+}+2e^-}$." )
];
