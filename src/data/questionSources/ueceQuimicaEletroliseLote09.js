// UECE por Assunto — Química / Eletrólise (9 questões)
// Fonte: Apostila UECE por Assunto 11ª edição, p. 198. Gabaritos conferidos no quadro oficial.
const ORIGIN="Apostila UECE por Assunto 11ª edição — p. 198";
const q=(id,source,statement,options,answer,explanation)=>({
  id:`UECE-QUI-ELT-${String(id).padStart(3,"0")}`,discipline:"Química",topic:"Eletrólise",
  statement:`(${source}) ${statement}`,options,answer,
  explanation:`Gabarito oficial: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,origin:ORIGIN,reviewed:true
});
export const UECE_QUIMICA_ELETROLISE_LOTE_09=[
q(1,"UECE 2015.2 2ª Fase","Duas células galvânicas ligadas em série contêm, respectivamente, íons $\\mathrm{Cu^{2+}}$ e $\\mathrm{Au^{3+}}$. No cátodo da primeira são depositados 0,0686 g de cobre. A massa de ouro que será depositada, ao mesmo tempo, no cátodo da outra célula, em gramas, será, aproximadamente,",[
  "0,140.","0,280.","0,430.","0,520."
],0,"Em série, a mesma quantidade de carga atravessa as células. Pela lei de Faraday, a massa depositada é proporcional à massa molar dividida pelo número de elétrons; o valor obtido é aproximadamente 0,140 g."),
q(2,"UECE 2017.2 2ª Fase","Na eletrólise da água, que ocorre com a participação do ácido sulfúrico, obtém-se, no cátodo, um gás que é",[
  "comburente.","inflamável.","irritante.","corrosivo."
],1,"No cátodo ocorre redução e formação de hidrogênio, gás inflamável."),
q(3,"UECE 2019.2 1ª Fase","Usando uma solução de nitrato de prata e uma corrente de 2 amperes em uma eletrodeposição, o tempo que um ourives gasta para produzir 48 g de prata é, em horas, aproximadamente",[
  "4.","3.","6.","5."
],2,"Aplicando a lei de Faraday para $\\mathrm{Ag^+ + e^- \\rightarrow Ag}$, obtém-se aproximadamente 6 horas."),
q(4,"UECE 2020.2 2ª Fase","Empregado em processos de cromação, o trióxido de crômio pode produzir crômio segundo $\\mathrm{CrO_3(aq)+6H^+(aq)+6e^- \\rightarrow Cr(s)+3H_2O}$. Considerando a reação, a massa, em g, de crômio depositada por 24.125 C é, aproximadamente,",[
  "2,17.","3,14.","4,32.","1,8."
],0,"24.125 C correspondem a 0,25 mol de elétrons; como 6 mol de elétrons depositam 1 mol de Cr, a massa é aproximadamente 2,17 g."),
q(5,"UECE 2020.2 2ª Fase","O gás cloro pode ser obtido através da eletrólise ígnea do cloreto de sódio. Considerando a constante de Faraday igual a 96.500 C, o tempo, em minutos, necessário para produzir 0,10 mol de $\\mathrm{Cl_2}$ utilizando uma corrente de 4 ampères é, aproximadamente,",[
  "100.","80.","90.","70."
],1,"Para formar 0,10 mol de Cl2 são necessários 0,20 mol de elétrons. A carga é 19.300 C; com 4 A, o tempo é cerca de 4.825 s, aproximadamente 80 min."),
q(6,"UECE 2023.1 2ª Fase","Um vazamento de gás tóxico foi atribuído ao gás cloro. Sobre o cloro, marque a alternativa verdadeira.",[
  "Em condições ambientes, apresenta-se no estado gasoso e é um agente redutor forte e inflamável.",
  "É extraído em larga escala por eletrólise aquosa do cloreto de sódio.",
  "É um elemento pouco reativo, muito tóxico e de baixa eletronegatividade.",
  "É o principal responsável pela chuva ácida e pelo efeito estufa."
],1,"O cloro é produzido industrialmente em larga escala pela eletrólise aquosa de soluções de cloreto de sódio."),
q(7,"UECE 2023.1 2ª Fase","Na eletrólise de uma solução aquosa de $\\mathrm{H_2SO_4}$, os produtos formados são",[
  "$\\mathrm{H_2(g)}$ e $\\mathrm{OH^-(aq)}$.",
  "$\\mathrm{H_2(g)}$ e $\\mathrm{O_2(g)}$.",
  "$\\mathrm{H_2(g)}$ e $\\mathrm{SO_3(g)}$.",
  "$\\mathrm{H^+(aq)}$ e $\\mathrm{OH^-(aq)}$."
],1,"A água é eletrolisada, produzindo H2 no cátodo e O2 no ânodo; o ácido atua como eletrólito."),
q(8,"UECE 2023.1 2ª Fase","Duas células eletrolíticas ligadas em série são submetidas a uma corrente contínua. Um dos eletrólitos é uma solução de nitrato de prata, e o outro é uma solução de sulfato de cobre(II). Quando são depositados 0,60 g de prata metálica, depositam-se de cobre, aproximadamente,",[
  "0,18 g.","0,90 g.","0,48 g.","0,24 g."
],0,"Em série, a mesma carga atravessa as células. Comparando os equivalentes eletroquímicos de Ag+/Ag e Cu2+/Cu, obtém-se aproximadamente 0,18 g de cobre."),
q(9,"UECE 2025.1 2ª Fase","A deposição por eletrólise de uma substância X ocorre de acordo com $\\mathrm{X^{3+}+3e^- \\rightarrow X}$. Considerando que a massa de X obtida foi de 3,6 g em uma hora e que a massa molar de X é 30 g/mol, pode-se afirmar corretamente que o valor da corrente elétrica usada nesta deposição é igual a",[
  "96,5 A.","45,3 A.","4,53 A.","9,65 A."
],3,"3,6 g correspondem a 0,12 mol de X, exigindo 0,36 mol de elétrons. A carga é 34.740 C e, em 3.600 s, a corrente é 9,65 A.")
];
