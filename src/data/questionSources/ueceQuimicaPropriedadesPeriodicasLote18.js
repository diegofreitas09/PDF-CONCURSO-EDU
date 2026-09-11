// UECE por Assunto — Química / Propriedades Periódicas (18 questões)
// Fonte: Apostila UECE por Assunto 11ª edição, pp. 194-196. Gabaritos conferidos no quadro oficial.
const ORIGIN="Apostila UECE por Assunto 11ª edição — pp. 194-196";
const q=(id,source,statement,options,answer,explanation,media=null)=>({
  id:`UECE-QUI-PER-${String(id).padStart(3,"0")}`,discipline:"Química",topic:"Propriedades periódicas",
  statement:`(${source}) ${statement}`,options,answer,
  explanation:`Gabarito oficial: ${String.fromCharCode(65+answer)}. ${explanation}`,
  source,origin:ORIGIN,reviewed:true,...(media?{media}:{})
});

export const UECE_QUIMICA_PROPRIEDADES_PERIODICAS_LOTE_18=[
q(1,"UECE 2018.1 2ª Fase","Considerando a primeira energia de ionização, assinale a afirmação verdadeira.",[
  "Nos períodos, ela cresce sempre da esquerda para a direita.",
  "Sofre influência do número de nêutrons do átomo.",
  "É mais fácil remover um elétron 2s do $\\mathrm{Be^+}$ do que remover um elétron 1s do $\\mathrm{Li^+}$.",
  "A primeira energia de ionização do enxofre é maior que a primeira energia de ionização do oxigênio."
],2,"O elétron 2s de Be+ está mais externo e menos fortemente ligado que o elétron 1s de Li+."),
q(2,"UECE 2018.1 2ª Fase","O subnível d de um átomo, em seu estado fundamental, tem 4 elétrons desemparelhados. O número de elétrons que existem no nível a que pertence esse subnível é",[
  "13 ou 14.","12 ou 15.","12 ou 14.","13 ou 15."
],2,"Um subnível d com quatro elétrons desemparelhados pode corresponder a d4 ou d6; a contagem no nível principal leva às possibilidades da alternativa C."),
q(3,"UECE 2019.1 2ª Fase","Considerando uma espécie química monoatômica que tem 78 prótons, 117 nêutrons e 74 elétrons, analise as seguintes afirmações: I. É um metal de transição do bloco d. II. Essa espécie química é um cátion, com estado de oxidação +4. III. O número de massa do elemento é 117. IV. Essa espécie química é um ânion, com estado de oxidação -4. Está correto somente o que se afirma em",[
  "I e IV.","II e III.","I e II.","III e IV."
],2,"Z=78 identifica a platina, metal de transição. Como há 78 prótons e 74 elétrons, a espécie possui carga +4. O número de massa é 195."),
q(4,"UECE 2020.1 1ª Fase","A 15ª edição da Escola de Verão de Química da UECE (16-20/09/2019) teve como tema central “150 anos da Tabela Periódica dos Elementos Químicos”. Sobre o trabalho de Dmitri Ivanovich Mendeleev, assinale a afirmação verdadeira.",[
  "Deixou lacunas na tabela que seriam preenchidas posteriormente pelos gases nobres.",
  "Descobriu vários elementos novos, entre eles, o germânio, o frâncio e o escândio.",
  "Estabeleceu a primeira lei periódica conhecida como lei das oitavas baseada na escala musical.",
  "Priorizou, no alinhamento dos elementos, as propriedades químicas em detrimento da ordem de massas atômicas."
],3,"Mendeleev priorizou a coerência das propriedades químicas, chegando a contrariar a ordem estrita de massas quando necessário."),
q(5,"UECE 2020.1 2ª Fase","Segundo a revista Superinteressante de novembro de 2019, o cigarro libera diversas substâncias tóxicas e cancerígenas. Considerando as substâncias mencionadas no texto, é correto afirmar que",[
  "níquel e cádmio são metais de transição e fazem parte da mesma família na tabela periódica.",
  "arsênio e fósforo estão localizados no mesmo período da tabela periódica.",
  "a acroleína, a nicotina e as cetonas são compostos orgânicos de diferentes funções.",
  "o polônio é um metal de transição pertencente à família do oxigênio."
],2,"Acroleína, nicotina e cetonas pertencem a funções orgânicas distintas."),
q(6,"UECE 2020.2 2ª Fase","Um telefone celular típico contém metais como cobre, prata, ouro, paládio e platina. Atente para as proposições: I. O ouro é altamente resistente à corrosão devido ao seu potencial de oxidação muito positivo. II. O material retardante tem como objetivo diminuir o risco de explosões no celular. III. Pertencente ao bloco f da tabela periódica, o paládio é usado nos capacitores dos celulares. IV. O cobre é bom condutor de eletricidade. V. A prata é o melhor condutor metálico de corrente elétrica em temperatura normal. Está correto somente o que se afirma em",[
  "I, III e IV.","III e V.","I e II.","II, IV e V."
],3,"II, IV e V são verdadeiras. O paládio pertence ao bloco d, e a afirmação I está formulada incorretamente."),
q(7,"UECE 2020.2 2ª Fase","Atente para as seguintes proposições a respeito da Tabela Periódica, e assinale com V as verdadeiras e com F as falsas: ( ) Em geral, nos elementos representativos, o número de elétrons de valência cresce da esquerda para a direita. ( ) Os elementos do grupo 2 são denominados alcalino-terrosos ou terras raras. ( ) À medida que a carga nuclear efetiva aumenta, o raio atômico diminui desde o sódio até o cloro. ( ) Uma afinidade eletrônica grande e positiva significa que o ânion é muito estável porque o átomo tende a aceitar um elétron. ( ) Os elementos do grupo 18 possuem energia de ionização zero. A sequência correta, de cima para baixo, é:",[
  "V, F, V, V, F.","F, V, V, F, V.","F, V, F, V, F.","V, F, F, F, V."
],0,"A sequência correta é V, F, V, V, F. Os gases nobres não possuem energia de ionização zero."),
q(8,"UECE 2020.2 2ª Fase","Considere o átomo de magnésio (Z=12), que apresenta as distribuições eletrônicas $1s^2\\,2s^2\\,2p^6\\,3s^2$ e $1s^2\\,2s^2\\,2p^6\\,3s^1\\,3p^1$. Atente para o que se afirma: I. Ocorre liberação de energia na passagem da primeira distribuição para a segunda. II. Ocorre perda de um elétron na passagem da segunda distribuição para a primeira. III. Na passagem da primeira distribuição para a segunda, ocorre absorção de energia. IV. A primeira distribuição eletrônica representa a configuração do estado excitado. É correto o que se afirma somente em",[
  "I e II.","III.","II e IV.","I, III e IV."
],1,"A segunda configuração representa estado excitado; sua formação a partir do estado fundamental exige absorção de energia."),
q(9,"UECE 2020.2 2ª Fase","Os halogênios, pertencentes à família 17 da tabela periódica, possuem essa denominação porque são formadores de sais inorgânicos. Considerando a estrutura, propriedades e usos dos halogênios, assinale a afirmação verdadeira.",[
  "Normalmente, por meio da ligação iônica, resultam em ânions divalentes denominados íons haletos.",
  "São fortes redutores e reagem, principalmente, com os metais alcalinos.",
  "A carência do bromo para o ser humano pode gerar aumento da glândula tireoide.",
  "Apresentam 7 elétrons na última camada eletrônica com a presença da configuração eletrônica $np^5$."
],3,"Halogênios possuem sete elétrons de valência, com configuração externa típica ns²np⁵."),
q(10,"UECE Transferência 2021","Atente para as seguintes afirmações a respeito dos óxidos: I. Os óxidos são compostos binários formados por dois elementos químicos, sendo um deles o oxigênio e o outro um elemento da tabela periódica de menor eletronegatividade. II. Normalmente, o outro elemento ligado ao oxigênio pode ser metálico ou não metálico. Considerando as proposições, é correto afirmar que",[
  "I é verdadeira e II é falsa.","ambas são falsas.","ambas são verdadeiras.","I é falsa e II é verdadeira."
],2,"As duas proposições estão corretas segundo a definição usual de óxidos adotada no material."),
q(11,"UECE Transferência 2021","Visualize o esquema em relação aos metais e não metais pertencentes aos elementos representativos da tabela periódica (grupos 1, 2, 13, 14, 15, 16 e 17). Considerando os termos I, II, III e IV do esquema, assinale a opção que descreve corretamente a energia de ionização e a afinidade eletrônica.",[
  "I: baixa energia de ionização; II: baixa afinidade eletrônica.",
  "I: alta energia de ionização; IV: alta afinidade eletrônica.",
  "II: alta afinidade eletrônica; III: baixa energia de ionização.",
  "III: baixa energia de ionização; IV: alta afinidade eletrônica."
],0,"Metais tendem a apresentar baixa energia de ionização e baixa afinidade eletrônica, favorecendo a formação de cátions.",{type:"source-crop",src:"questions/uece/quimica/propriedades-periodicas/q11-diagrama.jpg",title:"Esquema original — metais e não metais",caption:"UECE Transferência 2021 · Apostila p. 195",alt:"Esquema relacionando metais e não metais à formação de cátions e ânions, com marcadores I, II, III e IV",originalCrop:true,sourcePage:195}),
q(12,"UECE 2022.2 2ª Fase","Considere 4 elementos químicos representados por L, M, Q e R: I. L e M são não metais e apresentam números atômicos consecutivos. II. Q é um halogênio do 3º período e R é um metal de transição do bloco d, pertencente ao grupo 6 do 4º período. III. O número atômico de L é igual a 7 e M é um calcogênio. Assim, é correto concluir-se que",[
  "os elementos M e L apresentam eletronegatividades idênticas por estarem no mesmo período.",
  "o composto $R_2M_3$ apresenta ligações covalentes em sua estrutura.",
  "a ordem das eletronegatividades dos elementos L, R e Q é L > R > Q.",
  "um dos compostos formados por M e Q é molecular e sua fórmula química é $QM_2$."
],3,"L=N, M=O, Q=Cl e R=Cr; a alternativa D é a única compatível com essas identificações."),
q(13,"UECE 2022.2 1ª Fase","As tatuagens podem usar pigmentos como sais de cobalto, crômio, ferro, cádmio e óxido de titânio. Considerando a possibilidade de tatuar a bandeira brasileira, os tipos de pigmentos empregados seriam os sais dos metais de transição específicos do bloco d, pertencentes aos grupos",[
  "4, 6, 8 e 9.","6, 8, 9 e 12.","4, 8 e 9; e óxido de titânio.","6, 9 e 12; e óxido de titânio."
],3,"Cr pertence ao grupo 6, Co ao 9 e Cd ao 12; o branco pode ser obtido com óxido de titânio."),
q(14,"UECE 2022.2 2ª Fase","O processo representado por $\\mathrm{Na(g) \\rightarrow Na^+(g)+e^-}$ caracteriza a",[
  "afinidade eletrônica.","energia de ligação.","energia de ionização.","eletronegatividade."
],2,"A energia de ionização corresponde à remoção de elétron de uma espécie gasosa, formando cátion."),
q(15,"UECE 2023.1 1ª Fase","Na comparação entre as famílias dos halogênios e dos metais alcalinos, os halogênios apresentam valores mais altos de",[
  "poder redutor.","ponto de fusão.","afinidade eletrônica.","densidade."
],2,"Halogênios apresentam maior tendência a receber elétrons e, portanto, maior afinidade eletrônica."),
q(16,"UECE 2024.1 2ª Fase","Considerando as propriedades dos elementos de transição, assinale a proposição verdadeira.",[
  "Os compostos dos elementos de transição são incolores devido às transições eletrônicas.",
  "Todos os compostos de elementos de transição são diamagnéticos.",
  "Apresentam apenas um estado de oxidação.",
  "Geralmente são dúcteis e maleáveis, bons condutores de calor e eletricidade."
],3,"Elementos de transição são tipicamente metálicos, dúcteis, maleáveis e bons condutores."),
q(17,"UECE 2025.2 2ª Fase","Analise o trecho e complete os espaços: Também chamada de ________, trata-se da energia mínima necessária de um elemento químico para se transformar em um ânion, ou seja, a afinidade eletrônica indica a quantidade de energia ________ no momento em que um elétron é ________ por um átomo. Observe que esse átomo instável se encontra sozinho e no estado gasoso. Com essa propriedade, ele adquire ________ quando recebe o elétron. Em contraposição ao raio atômico, a eletroafinidade dos elementos da tabela periódica ________ da esquerda para a direita, na horizontal. Já no sentido vertical, ele ________ de baixo para cima.",[
  "eletroafinidade, absorvida, recebido, estabilidade, cresce, diminui.",
  "eletroafinidade, liberada, recebido, estabilidade, diminui, aumenta.",
  "energia de ionização, liberada, recebido, estabilidade, cresce, aumenta.",
  "eletroafinidade, liberada, recebido, estabilidade, cresce, aumenta."
],3,"A afinidade eletrônica também é chamada eletroafinidade; a tendência cresce, em geral, para a direita e para cima."),
q(18,"UECE 2026.1 1ª Fase","Uma das ferramentas essenciais da química é a tabela periódica. Avalie: I. O que existe no planeta Terra é constituído pelos elementos químicos, classificados e organizados na tabela periódica. Atualmente são 118 elementos químicos, distribuídos em 18 períodos e 7 grupos ou famílias. II. A classificação dos elementos da tabela periódica é baseada em várias propriedades, que incluem número atômico, configuração eletrônica, propriedades químicas e propriedades físicas. III. A tabela periódica é considerada uma das mais importantes conquistas da ciência, não apenas da química, mas também da medicina e da biologia. É correto o que se afirma em",[
  "I e II apenas.","I e III apenas.","II e III apenas.","I, II e III."
],2,"A afirmação I inverte a quantidade de períodos e grupos; a tabela possui 7 períodos e 18 grupos. II e III estão corretas.")
];
