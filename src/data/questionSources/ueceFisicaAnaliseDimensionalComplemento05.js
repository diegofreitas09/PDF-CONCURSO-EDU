// UECE por Assunto — Física / Análise Dimensional — complemento das lacunas 17, 18, 30, 31 e 32.
// Fonte: Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf, pp. 81–84.
// Enunciados, fórmulas e gabaritos conferidos diretamente no material original.
const src="Apostila UECE por Assunto 11ª edição";
const q=(id,source,statement,options,answer,explanation)=>({
  id:`UECE-FIS-AD-${String(id).padStart(3,"0")}`,
  discipline:"Física",
  topic:"Análise dimensional",
  statement:`(${source}) ${statement}`,
  options,
  answer,
  explanation:`Gabarito: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,
  origin:src,
  sourcePage:id===17?81:id===18?82:84,
  sourceQuestion:id,
  reviewed:true
});

export const UECE_FISICA_ANALISE_DIMENSIONAL_COMPLEMENTO_05=[
  q(17,"UECE 2021.1 2ª Fase","O sangue movendo-se através dos vasos pode ser considerado um fluido real. A análise de turbulência pode ser feita pelo número de Reynolds, $Re=\\frac{vD\\rho}{\\eta}$, em que $v$ é a velocidade média do fluido, $D$ o diâmetro do tubo, $\\rho$ a densidade do fluido e $\\eta$ a viscosidade. Sabendo que $Re$ é adimensional, a dimensão de $\\eta$ no Sistema Internacional é",["$\\frac{kg}{m\\,s}$.","$\\frac{kg\\,m}{s}$.","$\\frac{kg\\,s}{m}$.","$\\frac{kg}{m^2\\,s}$."],0,"Como $Re$ é adimensional, $[\\eta]=[v][D][\\rho]=(m/s)\\cdot m\\cdot(kg/m^3)=kg/(m\\,s)$; coincide com a alternativa A e com o quadro oficial de respostas."),
  q(18,"UECE 2022.1 1ª Fase","A velocidade $v$ de propagação de ondas na água do mar, com boa aproximação, depende da aceleração da gravidade $g$, de uma constante adimensional $k$ e do comprimento de onda $\\lambda$. A expressão dimensionalmente correta é",["$v=k\\sqrt{\\frac{g}{\\lambda}}$.","$v=k\\sqrt{g\\lambda}$.","$v=kg\\lambda$.","$v=k\\frac{g}{\\lambda}$."],1,"Velocidade tem dimensão $L/T$. Como $[g\\lambda]=(L/T^2)\\cdot L=L^2/T^2$, sua raiz quadrada tem dimensão $L/T$. Portanto, a alternativa correta é B, conforme o gabarito da apostila."),
  q(30,"UECE 2025.2 2ª Fase","A força de Casimir por unidade de área entre duas superfícies condutoras é proporcional a $h^Xc^Yr^Z$, em que $h$ é a constante de Planck, $c$ a velocidade da luz e $r$ a distância média entre os condutores. Sabendo que $[h]=[energia][tempo]$, o módulo do produto $XY/Z$ é",["$1/4$.","$1$.","$1/3$.","$1/2$."],0,"A análise dimensional do termo que representa força por área fixa os expoentes do produto em $X=1$, $Y=1$ e $Z=-4$; assim, $|XY/Z|=|1\\cdot1/(-4)|=1/4$. O quadro oficial marca A."),
  q(31,"UECE 2026.1 1ª Fase","Em um sistema coerente de unidades, comprimento, massa e tempo são representados por $L$, $M$ e $T$, e a unidade de trabalho por $W$. Em um segundo sistema, as novas unidades fundamentais correspondem a $2L$, $3M$ e $2T$. A razão $W'/W$ é",["3.","12.","2.","10."],0,"Trabalho tem dimensão $ML^2T^{-2}$. Logo, $W'/W=3\\cdot2^2/2^2=3$. A resposta oficial é A."),
  q(32,"UECE 2026.1 2ª Fase","Na Física de Partículas, adota-se às vezes o sistema de unidades naturais em que $c=\\hbar=1$, fazendo com que todas as grandezas sejam expressas em potências de energia ou massa. A constante de gravitação universal $G$ de Newton possui, nesse sistema, dimensão",["$1/M^2$.","$1/M$.","$1/M^3$.","$M^2$."],0,"No SI, $[G]=L^3M^{-1}T^{-2}$. Com $c=1$, comprimento e tempo têm a mesma dimensão; com $\\hbar=1$, energia (e massa) é inversa ao comprimento. Assim $[G]=M^{-2}$. O quadro oficial marca A.")
];
