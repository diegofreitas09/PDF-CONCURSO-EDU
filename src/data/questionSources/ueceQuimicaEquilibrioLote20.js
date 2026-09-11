// UECE por Assunto — Química / Equilíbrio Químico (20 questões)
// Fonte: Apostila UECE por Assunto 11ª edição, p. 202-204. Gabaritos conferidos no quadro oficial.
const ORIGIN="Apostila UECE por Assunto 11ª edição — p. 202-204";
const q=(id,source,statement,options,answer,explanation,media=null)=>({
  id:`UECE-QUI-EQU-${String(id).padStart(3,"0")}`,discipline:"Química",topic:"Equilíbrio Químico",
  statement:`(${source}) ${statement}`,options,answer,
  explanation:`Gabarito oficial: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,origin:ORIGIN,reviewed:true,...(media?{media}: {})
});
const Q8_MEDIA={type:"table",title:"Relação entre massa, mol e número de partículas",headers:["Operação","Sentido indicado","Afirmação"],rows:[
  ["I","massa → quantidade de matéria","multiplicar por $6,02\\times10^{23}$"],
  ["II","quantidade de matéria → massa","dividir pela massa molar"],
  ["III","quantidade de matéria → número de partículas","multiplicar pela massa molar"],
  ["IV","número de partículas → quantidade de matéria","dividir por $6,02\\times10^{23}$"]
],caption:"Relação reconstruída a partir do esquema original da apostila."};
export const UECE_QUIMICA_EQUILIBRIO_LOTE_20=[
q(1,"UECE 2017.1 2ª Fase","Um estudante de química retirou água do sistema em equilíbrio $\\mathrm{2NO_2(g)+CH_4(g)\\rightleftharpoons CO_2(g)+2H_2O(l)+N_2(g)}$. Em seguida, constatou acertadamente que",[
  "a concentração de metano diminuiu.","o equilíbrio se desloca para a esquerda.","a concentração do dióxido de carbono diminuiu.","a concentração do nitrogênio gasoso diminuiu."
],0,"A retirada de água, produto da reação, desloca o equilíbrio para a direita para repô-la, consumindo metano; portanto sua concentração diminui."),
q(2,"UECE 2017.2 2ª Fase","Uma mistura de monóxido de carbono e gás hidrogênio, produto exclusivo da reação reversível do metano gasoso com vapor d’água, tem variação de entalpia positiva. Sobre essa reação, é correto afirmar que",[
  "aumentando a temperatura, aumenta a produção de hidrogênio.","o aumento de pressão desloca o equilíbrio para a direita.","a diminuição da concentração de monóxido de carbono desloca o equilíbrio para a esquerda.","é espontânea independentemente da temperatura."
],0,"Como a reação direta é endotérmica, o aumento da temperatura favorece os produtos e aumenta a produção de H2."),
q(3,"UECE 2017.2 2ª Fase","Uma massa de 0,81 g de brometo de hidrogênio é dissolvida para formar 1,0 L de solução. O pOH desta solução será",["11.","10.","13.","12."],3,"HBr é ácido forte. 0,81 g correspondem a aproximadamente 0,01 mol em 1 L, logo pH≈2 e pOH≈12."),
q(4,"UECE 2018.1 2ª Fase","Considere o equilíbrio $\\mathrm{HCO_3^-(aq)+H^+(aq)\\rightleftharpoons CO_2(g)+H_2O(l)}$. Para aumentar a produção de água, com a temperatura constante, deve-se",[
  "acrescentar CO2.","retirar parte do HCO3-.","acrescentar um catalisador.","acrescentar um pouco de HCl."
],3,"A adição de HCl aumenta [H+], deslocando o equilíbrio para a direita e aumentando a formação de água."),
q(5,"UECE 2019.1 2ª Fase","Quatro fatores afetam o equilíbrio químico de um sistema, mas apenas um deles modifica o valor da constante. Esse fator é o(a)",["temperatura.","pressão.","concentração.","volume."],0,"A constante de equilíbrio depende da temperatura; mudanças de pressão, concentração ou volume deslocam o equilíbrio sem alterar K à temperatura fixa."),
q(6,"UECE 2019.1 2ª Fase","O dióxido de carbono pode ser formado pela reação não balanceada $\\mathrm{CO(g)+O_2(g)\\rightarrow CO_2(g)}$. Assinale o efeito provocado pela retirada de dióxido de carbono.",[
  "A concentração de CO aumenta mais do que a de O2.","A concentração de CO diminui mais do que a de O2.","As concentrações de CO e O2 não se alteram.","As concentrações de CO e O2 diminuem igualmente."
],1,"A retirada de produto desloca o equilíbrio para a direita. Na equação balanceada, $2CO+O_2\\rightarrow2CO_2$, CO é consumido em proporção maior que O2."),
q(7,"UECE 2019.2 2ª Fase","A uma determinada temperatura, encontram-se em equilíbrio X mol de pentacloreto de fósforo, 1 mol de tricloreto de fósforo e 1 mol de cloro em recipiente de 10 L. Sabendo que a constante de equilíbrio é 0,02, a quantidade de mols de pentacloreto de fósforo é",["5.","3.","4.","2."],0,"Para $PCl_5\\rightleftharpoons PCl_3+Cl_2$, $K_c=[PCl_3][Cl_2]/[PCl_5]=0,02$. Com 0,1 mol/L de cada produto, [PCl5]=0,5 mol/L, correspondendo a 5 mol em 10 L."),
q(8,"UECE 2019.2 2ª Fase","Considere a relação massa ⇄ quantidade de matéria (mol) ⇄ número de partículas e as operações I, II, III e IV apresentadas no quadro. Está correto somente o que se diz sobre",[
  "IV.","I, II e III.","II.","I, III e IV."
],0,"Somente IV está correta: para converter número de partículas em mol, divide-se por $6,02\\times10^{23}$. As demais operações estão associadas aos sentidos errados.",Q8_MEDIA),
q(9,"UECE 2020.2 2ª Fase","No que se refere a sistemas em equilíbrio químico, assinale a afirmação verdadeira.",[
  "Somente uma mudança na temperatura pode alterar o valor da constante de equilíbrio.","Um sistema químico apresenta um único estado de equilíbrio à mesma temperatura.","O catalisador sempre altera o equilíbrio da reação.","As variações de pressão nunca afetam as concentrações das espécies reacionais."
],0,"A temperatura é o fator que altera o valor da constante de equilíbrio. Catalisadores apenas aceleram o estabelecimento do equilíbrio."),
q(10,"UECE 2022.1 2ª Fase","Em relação ao pH, assinale a afirmação verdadeira.",[
  "Quanto maior a concentração de H+, maior é o pH.","Uma amostra de chuva com pH 4,0 é dez vezes mais ácida do que chuva com pH 5,0.","Na escala de pH, se a acidez diminui, o número de pH também diminui.","Quando o pH aumenta em uma unidade, a concentração de H+ aumenta em um fator de dez."
],1,"A escala de pH é logarítmica; uma diferença de uma unidade corresponde a fator 10 na concentração de H+. Logo pH 4 é dez vezes mais ácido que pH 5."),
q(11,"UECE 2022.1 2ª Fase","Considerando a constante de equilíbrio K, assinale a afirmação verdadeira.",[
  "A constante de equilíbrio é a razão entre as constantes de velocidade da reação direta e da reação inversa.","Quando uma reação é a soma de duas reações, a constante total é a soma das constantes individuais.","O valor de K independe da forma como a equação química é balanceada.","Apenas as concentrações de sólidos puros são constantes e não são consideradas no cálculo de K."
],0,"Para uma reação elementar reversível no tratamento cinético correspondente, K pode ser expresso pela razão entre as constantes de velocidade direta e inversa. As demais afirmativas estão incorretas."),
q(12,"UECE Transferência 2021","Com relação ao equilíbrio químico, considere: I. Em um gás, o aumento da pressão desloca o equilíbrio no sentido em que o número de mols de gás aumenta. II. Quando um sistema em equilíbrio sofre uma alteração, ocorre deslocamento no sentido de compensá-la. III. Catalisadores não alteram a composição do equilíbrio, mas permitem que ele se estabeleça em menor tempo. É correto o que se afirma em",[
  "I e II apenas.","I e III apenas.","II e III apenas.","I, II e III."
],2,"I é falsa: o aumento de pressão favorece o lado de menor quantidade de matéria gasosa. II e III são verdadeiras."),
q(13,"UECE Transferência 2019","Analise: I. Maior concentração de oxigênio diminui as reações de queima. II. A pressão de um gás é diretamente proporcional à sua concentração em mol/L. III. É mais fácil acender fogão a lenha com toras do que com lascas, pois as toras, devido ao maior volume, pegam fogo mais rapidamente. Está correto somente o que se afirma em",[
  "I e II.","II.","III.","I e III."
],1,"Somente II é correta para gás ideal a temperatura constante, pois P=cRT. Maior concentração de O2 favorece combustão e lascas queimam mais facilmente pela maior área de contato."),
q(14,"UECE Transferência 2019","Complete corretamente: Equilíbrio químico é uma reação __________ na qual a velocidade da reação direta é __________ à velocidade da reação inversa.",[
  "reversível; igual.","irreversível; superior.","irreversível; igual.","reversível; inferior."
],0,"No equilíbrio químico dinâmico, a reação é reversível e as velocidades direta e inversa são iguais."),
q(15,"UECE Transferência 2018","Atente para o balanceamento da redução da hematita por monóxido de carbono: $\\mathrm{Fe_2O_3 + aCO \\rightarrow 2Fe + bCO_2}$. Os valores de a e b são, respectivamente,",[
  "1 e 3.","3 e 3.","3 e 1.","2 e 2."
],1,"O balanceamento é $\\mathrm{Fe_2O_3+3CO\\rightarrow2Fe+3CO_2}$; portanto a=3 e b=3."),
q(16,"UECE 2023.2 2ª Fase","Se o pH do estômago é 2 e o pH do suco de laranja é 4, considerando a relação das concentrações de íons hidrônio, é correto dizer que a concentração",[
  "do suco de laranja é 1000 vezes menor que a do estômago.","do estômago é 100 vezes maior que a do suco de laranja.","do suco de laranja é duas vezes maior que a do estômago.","do estômago é 10 vezes maior que a do suco de laranja."
],1,"A diferença de 2 unidades de pH corresponde a fator $10^2=100$ em [H3O+]; o estômago tem concentração 100 vezes maior."),
q(17,"UECE 2023.2 2ª Fase","Considerando o sistema $\\mathrm{H_2(g)+Cl_2(g)\\rightleftharpoons2HCl(g)}$ no equilíbrio e introduzindo-se gás neônio, é correto dizer que",[
  "aumentará a concentração de hidrogênio.","aumentará a produção de cloro.","aumentará a produção de cloreto de hidrogênio.","não haverá alteração das concentrações no equilíbrio do sistema."
],3,"A adição de gás inerte, nas condições usuais de volume constante, não altera as pressões parciais dos reagentes e produtos nem desloca o equilíbrio."),
q(18,"UECE 2024.2 1ª Fase","Ao estudar uma reação em equilíbrio, consideram-se Kc e Kp. Assinale a reação em que Kc = Kp.",[
  "$\\mathrm{2NO(g)+Cl_2(g)\\rightleftharpoons2NOCl(g)}$.","$\\mathrm{PCl_5(g)\\rightleftharpoons PCl_3(g)+Cl_2(g)}$.","$\\mathrm{N_2(g)+O_2(g)\\rightleftharpoons2NO(g)}$.","$\\mathrm{CaO(s)+CO_2(g)\\rightleftharpoons CaCO_3(s)}$."
],2,"Como $K_p=K_c(RT)^{\\Delta n}$, Kp=Kc quando Δn gasoso=0. Em N2+O2⇄2NO, há 2 mol gasosos em ambos os lados."),
q(19,"UECE 2024.2 2ª Fase","De acordo com o princípio de Le Chatelier, assinale a afirmação verdadeira sobre deslocamento do equilíbrio.",[
  "Diminuindo a temperatura, a reação endotérmica é favorecida.","Aumentando a quantidade de uma substância, o equilíbrio se desloca produzindo mais dessa substância.","Diminuindo a pressão total, o equilíbrio tende a deslocar-se para o sentido do maior volume.","Ao adicionar catalisador, ocorre alteração nas concentrações e deslocamento do equilíbrio."
],2,"A diminuição da pressão favorece o lado com maior número de mols gasosos, isto é, maior volume. Catalisador não desloca o equilíbrio."),
q(20,"UECE 2025.1 2ª Fase","Complete: O equilíbrio químico acontece nas reações químicas __________ entre reagentes e produtos. Para ocorrer equilíbrio, é necessário que a __________ seja constante e o sistema não tenha trocas com o ambiente. No equilíbrio, tem-se a __________ das reações direta e inversa __________. O equilíbrio é medido por duas grandezas: a __________ e o grau de equilíbrio.",[
  "irreversíveis; temperatura; concentração; diferentes; variação de equilíbrio.","reversíveis; temperatura; velocidade; iguais; constante de equilíbrio.","irreversíveis; concentração; velocidade; diferentes; constante de equilíbrio.","reversíveis; concentração; constante de equilíbrio; iguais; variação de equilíbrio."
],1,"Equilíbrio químico ocorre em reações reversíveis, com temperatura constante; as velocidades direta e inversa tornam-se iguais, e a constante de equilíbrio caracteriza o sistema." )
];
