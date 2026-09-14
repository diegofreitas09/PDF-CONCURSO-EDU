// UECE por Assunto — Física / Calorimetria — recuperação visual do item 4 com fórmulas em KaTeX.
const src="Apostila UECE por Assunto 11ª edição";
const q=(id,source,statement,options,answer,explanation)=>({id:`UECE-FIS-CAL-${String(id).padStart(3,"0")}`,discipline:"Física",topic:"Calorimetria, Termologia e Calor",statement:`(${source}) ${statement}`,options,answer,explanation:`Gabarito: ${String.fromCharCode(65+answer)}. ${explanation}`,source,origin:src,reviewed:true});

export const UECE_FISICA_CALORIMETRIA_VISUAL_01=[
q(4,"UECE 2017.2 1ª Fase","Considere a dilatação térmica de duas barras longas e finas, feitas de mesmo material. Uma delas tem o dobro do comprimento da outra: $L_1=2L_2$. Nos dois casos, as barras sofrem uma mesma mudança de temperatura, $\\Delta T$, e dilatam $\\Delta L_1$ e $\\Delta L_2$. Assim,",["$\\frac{\\Delta L_2}{L_2}=2\\frac{\\Delta L_1}{L_1}$.","$\\frac{\\Delta L_2}{L_2}=\\frac{\\Delta L_1}{L_1}$.","$2\\frac{\\Delta L_2}{L_2}=\\frac{\\Delta L_1}{L_1}$.","$\\frac{\\Delta L_2}{L_2}=3\\frac{\\Delta L_1}{L_1}$."],1,"Para o mesmo material e a mesma variação de temperatura, a dilatação relativa é $\\Delta L/L=\\alpha\\Delta T$ para ambas as barras. Portanto, $\\Delta L_2/L_2=\\Delta L_1/L_1$.")
];
