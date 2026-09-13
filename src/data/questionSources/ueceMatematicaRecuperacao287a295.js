// UECE Matemática — recuperação visual auditada de lacunas anteriores
// Questões UECE-MAT-287 a UECE-MAT-295. Fonte: Apostila UECE por Assunto 11ª ed., pp.12, 64, 66-67 e 70-72; gabaritos pp.77-78.
// Itens recuperados somente após conferência visual no PDF original. A questão 52 de Polinômios permanece fora por inconsistência entre expressão impressa, alternativas e gabarito.
export const UECE_MATEMATICA_RECUPERACAO_287_295 = [
  {
    id:"UECE-MAT-287", discipline:"Matemática", topic:"Análise Combinatória e Probabilidade",
    statement:"(UECE 2025.1 1ª Fase) Se L = {a, b, c, d} e N é o número de subconjuntos de L, então C(N,3) é igual a",
    options:["560.","1120.","480.","840."], answer:0,
    explanation:"Gabarito oficial da apostila: A. N = 2⁴ = 16 e C(16,3) = 560.",
    source:"UECE 2025.1 1ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 12", sourcePage:12, sourceQuestion:27, reviewed:true,
    media:{type:"formula",latex:"N=2^4=16,\\qquad \\binom{N}{3}=\\binom{16}{3}"}
  },
  {
    id:"UECE-MAT-288", discipline:"Matemática", topic:"Polinômios e Complexos",
    statement:"(UECE 2020.2 2ª Fase) Para o número complexo w = x + iy (x e y são números reais e i é tal que i² = −1), define-se o módulo de w por |w| = √(x² + y²) e o conjugado de w por w̄ = x − iy. Se w é tal que w + |w| = 4 e se w² + (|w|)² = −10, então o valor de |w| é igual a",
    options:["√5.","√11.","√7.","√13."], answer:3,
    explanation:"Gabarito oficial da apostila: D. Enunciado e notação conferidos visualmente na página 64.",
    source:"UECE 2020.2 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 64", sourcePage:64, sourceQuestion:23, reviewed:true,
    media:{type:"formula",latex:"w=x+iy,\\quad |w|=\\sqrt{x^2+y^2},\\quad \\overline w=x-iy,\\quad w+|w|=4,\\quad w^2+|w|^2=-10"}
  },
  {
    id:"UECE-MAT-289", discipline:"Matemática", topic:"Polinômios e Complexos",
    statement:"(UECE 2023.1 2ª Fase) No desenvolvimento de (1/x + ∛x)¹⁶, a soma do coeficiente de x⁴ com o termo independente de x é",
    options:["1836.","1823.","1830.","1828."], answer:0,
    explanation:"Gabarito oficial da apostila: A. Expressão conferida visualmente na página 66.",
    source:"UECE 2023.1 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 66", sourcePage:66, sourceQuestion:37, reviewed:true,
    media:{type:"formula",latex:"\\left(\\frac{1}{x}+\\sqrt[3]{x}\\right)^{16}"}
  },
  {
    id:"UECE-MAT-290", discipline:"Matemática", topic:"Polinômios e Complexos",
    statement:"(UECE 2025.2 2ª Fase) Seja i o número complexo cujo quadrado é igual a −1, e w = (1+2i)/(3+4i) + (2−i)/(5i). Se z é o número complexo tal que w·z = 1, então z é igual a",
    options:["3/2 + 2i.","2/3 + 2i.","2/3 − 2i.","3/2 − 2i."], answer:0,
    explanation:"Gabarito oficial da apostila: A. Frações complexas conferidas visualmente na página 67.",
    source:"UECE 2025.2 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 67", sourcePage:67, sourceQuestion:48, reviewed:true,
    media:{type:"formula",latex:"w=\\frac{1+2i}{3+4i}+\\frac{2-i}{5i},\\qquad wz=1"}
  },
  {
    id:"UECE-MAT-291", discipline:"Matemática", topic:"Trigonometria",
    statement:"(UECE 2020.2 2ª Fase) Se u é um número real tal que os valores trigonométricos da sec(u) e cossec(u) estão definidos, então o valor numérico da expressão (a² + b² − a²b²)/(a²b²), para a = sec(u) e b = cossec(u), é igual a",
    options:["2.","0.","4.","1."], answer:1,
    explanation:"Gabarito oficial da apostila: B. Expressão conferida visualmente na página 70.",
    source:"UECE 2020.2 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 70", sourcePage:70, sourceQuestion:25, reviewed:true,
    media:{type:"formula",latex:"\\frac{a^2+b^2-a^2b^2}{a^2b^2},\\qquad a=\\sec u,\\ b=\\csc u"}
  },
  {
    id:"UECE-MAT-292", discipline:"Matemática", topic:"Trigonometria",
    statement:"(UECE 2021.1 1ª Fase) No plano, com o sistema de coordenadas cartesianas usual, a interseção dos gráficos das funções reais f(x)=sen(x) e g(x)=cos(x) são, para cada número inteiro k, os pontos P(xₖ,yₖ). Então, os possíveis valores para yₖ são",
    options:["√2/2 e −√2/2.","√2/3 e −√2/3.","√3/2 e −√3/2.","√3/3 e −√3/3."], answer:0,
    explanation:"Gabarito oficial da apostila: A. Alternativas com radicais conferidas visualmente na página 70.",
    source:"UECE 2021.1 1ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 70", sourcePage:70, sourceQuestion:27, reviewed:true,
    media:{type:"formula",latex:"\\sin x=\\cos x\\;\\Longrightarrow\\; y_k=\\pm\\frac{\\sqrt2}{2}"}
  },
  {
    id:"UECE-MAT-293", discipline:"Matemática", topic:"Trigonometria",
    statement:"(UECE 2021.1 2ª Fase) No triângulo XYZ, a mediatriz do lado YZ contém a mediana relativa ao vértice X, a medida desta mediana é igual a 2 cm e a medida do lado XY é igual a 3 cm. Se P é o ponto da reta que contém o lado XY tal que ZP é perpendicular a esta reta, então, a medida, em cm², da área do triângulo PYZ é igual a",
    options:["20√5/3.","20√5/9.","20√3/9.","20√3/3."], answer:1,
    explanation:"Gabarito oficial da apostila: B. Enunciado geométrico e frações com radicais conferidos visualmente na página 70.",
    source:"UECE 2021.1 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 70", sourcePage:70, sourceQuestion:28, reviewed:true,
    media:{type:"formula",latex:"XY=3,\\quad XM=2,\\quad ZP\\perp XY"}
  },
  {
    id:"UECE-MAT-294", discipline:"Matemática", topic:"Trigonometria",
    statement:"(UECE 2023.1 2ª Fase) Se a “soma infinita” 1 + x + x² + x³ + ... + xⁿ + ... é igual a 2 e se x = sen α, com 0° < α < 90°, então podemos afirmar corretamente que a medida do ângulo α é",
    options:["45 graus.","60 graus.","15 graus.","30 graus."], answer:3,
    explanation:"Gabarito oficial da apostila: D. Série geométrica e condição angular conferidas visualmente na página 71.",
    source:"UECE 2023.1 2ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 71", sourcePage:71, sourceQuestion:37, reviewed:true,
    media:{type:"formula",latex:"1+x+x^2+x^3+\\cdots=2,\\qquad x=\\sin\\alpha,\\quad 0^\\circ<\\alpha<90^\\circ"}
  },
  {
    id:"UECE-MAT-295", discipline:"Matemática", topic:"Trigonometria",
    statement:"(UECE 2025.2 1ª Fase) Uma circunferência com centro no ponto O está inscrita no quadrado XYZW, cuja medida do lado é igual a 10 m. Se N e M são pontos da circunferência que estão respectivamente nos lados XW e YZ do quadrado, seja I no interior do quadrado a interseção do segmento XM com a circunferência. Se P, em NM, é o pé da perpendicular a NM que passa por I, então a medida, em metros, do segmento IP é igual a",
    options:["3,5.","3,0.","4,0.","4,5."], answer:2,
    explanation:"Gabarito oficial da apostila: C. Enunciado espacial conferido integralmente nas páginas 72; o item não traz desenho, apenas a construção descrita e uma nota de apoio.",
    source:"UECE 2025.2 1ª Fase", origin:"Apostila UECE por Assunto 11ª edição — p. 72", sourcePage:72, sourceQuestion:48, reviewed:true
  }
];
