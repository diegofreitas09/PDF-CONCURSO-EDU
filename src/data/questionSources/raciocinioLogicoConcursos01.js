const base = {
  discipline: "Raciocínio Lógico",
  source: "Raciocínio Lógico para Concursos — módulo autoral baseado nos tópicos e gabaritos conceituais do material de estudo",
  reviewed: true,
};

const q = (id, topic, statement, options, answer, explanation) => ({
  ...base,
  id: `rl-concursos-01-${String(id).padStart(2, "0")}`,
  topic,
  statement,
  options,
  answer,
  explanation,
});

export const RACIOCINIO_LOGICO_CONCURSOS_01 = [
  q(1,"Proposições","Assinale a alternativa que representa uma proposição lógica.",[
    "Feche a porta, por favor.",
    "Que dia maravilhoso!",
    "O número 18 é divisível por 3.",
    "Qual é o seu nome?",
    "Tomara que chova amanhã."
  ],2,"Uma proposição é uma sentença declarativa que pode ser julgada verdadeira ou falsa. '18 é divisível por 3' possui valor lógico verdadeiro."),

  q(2,"Proposições","A expressão 'x + 4 = 10', sem informação sobre o valor de x, é classificada como:",[
    "proposição simples verdadeira",
    "proposição simples falsa",
    "sentença aberta",
    "tautologia",
    "contradição"
  ],2,"Como contém variável livre e não pode receber valor lógico sem atribuir valor a x, trata-se de sentença aberta."),

  q(3,"Princípios da Lógica","O princípio segundo o qual uma proposição não pode ser verdadeira e falsa ao mesmo tempo, sob o mesmo aspecto, é o princípio da:",[
    "identidade",
    "não contradição",
    "terceiro incluído",
    "equivalência",
    "dupla negação"
  ],1,"O princípio da não contradição impede que uma mesma proposição seja simultaneamente verdadeira e falsa no mesmo contexto."),

  q(4,"Conectivos Lógicos","Se p é verdadeira e q é falsa, o valor lógico de p ∧ q é:",[
    "verdadeiro",
    "falso",
    "indeterminado",
    "equivalente a q → p",
    "sempre verdadeiro"
  ],1,"A conjunção p ∧ q só é verdadeira quando p e q são ambas verdadeiras."),

  q(5,"Conectivos Lógicos","Se p é falsa e q é verdadeira, o valor lógico de p ∨ q é:",[
    "verdadeiro",
    "falso",
    "indeterminado",
    "contraditório",
    "não pode ser calculado"
  ],0,"Na disjunção inclusiva, basta que uma das proposições seja verdadeira para que a expressão seja verdadeira."),

  q(6,"Condicional","A proposição p → q é falsa somente quando:",[
    "p e q são verdadeiras",
    "p é falsa e q é verdadeira",
    "p é verdadeira e q é falsa",
    "p e q são falsas",
    "q é verdadeira, independentemente de p"
  ],2,"O condicional é falso apenas no caso em que o antecedente é verdadeiro e o consequente é falso."),

  q(7,"Bicondicional","A bicondicional p ↔ q é verdadeira quando:",[
    "p e q possuem valores lógicos diferentes",
    "p é sempre verdadeira",
    "q é sempre falsa",
    "p e q possuem o mesmo valor lógico",
    "ao menos uma delas é falsa"
  ],3,"O bicondicional é verdadeiro quando as duas proposições têm o mesmo valor lógico."),

  q(8,"Tabela-Verdade","Uma proposição composta formada por três proposições simples distintas possui, em sua tabela-verdade, quantas linhas?",[
    "4",
    "6",
    "8",
    "9",
    "12"
  ],2,"Com n proposições simples, a tabela-verdade possui 2^n linhas. Para n=3, são 8 linhas."),

  q(9,"Tautologia","Assinale a expressão que é uma tautologia.",[
    "p ∧ ¬p",
    "p ∨ ¬p",
    "p ∧ q",
    "p → ¬p",
    "p ↔ ¬p"
  ],1,"Pelo princípio do terceiro excluído, p ∨ ¬p é sempre verdadeira."),

  q(10,"Contradição","Assinale a expressão que é uma contradição.",[
    "p ∨ ¬p",
    "p → p",
    "p ∧ ¬p",
    "p ↔ p",
    "¬(p ∧ ¬p)"
  ],2,"p ∧ ¬p nunca pode ser verdadeira, portanto é uma contradição."),

  q(11,"Negação","A negação de 'Ana estuda e Bruno trabalha' é:",[
    "Ana não estuda e Bruno não trabalha",
    "Ana não estuda ou Bruno não trabalha",
    "Ana estuda ou Bruno trabalha",
    "Se Ana estuda, Bruno não trabalha",
    "Ana não estuda, então Bruno trabalha"
  ],1,"Pela lei de De Morgan, ¬(p ∧ q) equivale a ¬p ∨ ¬q."),

  q(12,"Negação","A negação de 'Carlos viaja ou Daniela permanece em casa' é:",[
    "Carlos não viaja ou Daniela não permanece em casa",
    "Carlos não viaja e Daniela não permanece em casa",
    "Carlos viaja e Daniela permanece em casa",
    "Se Carlos não viaja, Daniela permanece em casa",
    "Carlos viaja se, e somente se, Daniela permanece em casa"
  ],1,"Pela lei de De Morgan, ¬(p ∨ q) equivale a ¬p ∧ ¬q."),

  q(13,"Negação do Condicional","A negação de 'Se estudo, então serei aprovado' é logicamente equivalente a:",[
    "Não estudo e não serei aprovado",
    "Estudo e não serei aprovado",
    "Não estudo ou serei aprovado",
    "Estudo ou não serei aprovado",
    "Se não estudo, então não serei aprovado"
  ],1,"A negação de p → q é p ∧ ¬q."),

  q(14,"Equivalência","A proposição p → q é logicamente equivalente a:",[
    "p ∧ q",
    "¬p ∨ q",
    "p ∨ ¬q",
    "¬p ∧ q",
    "p ↔ q"
  ],1,"O condicional p → q equivale a ¬p ∨ q."),

  q(15,"Equivalência","A contrapositiva de 'Se chove, então a rua fica molhada' é:",[
    "Se não chove, então a rua não fica molhada",
    "Se a rua fica molhada, então chove",
    "Se a rua não fica molhada, então não chove",
    "Chove e a rua não fica molhada",
    "Não chove ou a rua fica molhada"
  ],2,"A contrapositiva de p → q é ¬q → ¬p e é logicamente equivalente ao condicional original."),

  q(16,"Argumentação","Considere: 'Todo servidor aprovado tomou posse. Lucas é servidor aprovado.' A conclusão válida é:",[
    "Lucas não tomou posse",
    "Lucas tomou posse",
    "Nenhum aprovado tomou posse",
    "Lucas pode ou não ter tomado posse, sem qualquer conclusão",
    "Somente Lucas tomou posse"
  ],1,"Trata-se de uma aplicação direta de raciocínio dedutivo: se todos os aprovados tomaram posse e Lucas pertence a esse conjunto, então Lucas tomou posse."),

  q(17,"Argumentação","Considere as premissas: 'Se o sistema está online, então o relatório é enviado.' e 'O sistema está online.' A conclusão correta é:",[
    "O relatório não é enviado",
    "O relatório é enviado",
    "O sistema está offline",
    "Nada pode ser concluído",
    "O relatório é enviado somente se houver falha"
  ],1,"É um caso de modus ponens: p → q e p, logo q."),

  q(18,"Argumentação","Considere: 'Se Pedro treinou, então melhorou seu tempo.' e 'Pedro não melhorou seu tempo.' Logo:",[
    "Pedro treinou",
    "Pedro não treinou",
    "Pedro venceu a prova",
    "Pedro treinou e venceu",
    "não é possível concluir"
  ],1,"É um caso de modus tollens: p → q e ¬q, logo ¬p."),

  q(19,"Diagramas Lógicos","Se todo professor é leitor e alguns leitores são músicos, é correto afirmar necessariamente que:",[
    "todo músico é professor",
    "algum professor é músico",
    "nenhum professor é músico",
    "todo professor pertence ao conjunto dos leitores",
    "nenhum leitor é professor"
  ],3,"A única conclusão necessária decorre diretamente da primeira premissa: o conjunto dos professores está contido no conjunto dos leitores."),

  q(20,"Quantificadores","A negação de 'Todos os candidatos entregaram o documento' é:",[
    "Nenhum candidato entregou o documento",
    "Todos os candidatos deixaram de entregar o documento",
    "Pelo menos um candidato não entregou o documento",
    "Pelo menos um candidato entregou o documento",
    "Somente um candidato não entregou o documento"
  ],2,"Negar uma afirmação universal exige apresentar ao menos um contraexemplo: existe candidato que não entregou o documento."),

  q(21,"Quantificadores","A negação de 'Existe pelo menos um aluno que acertou todas as questões' é:",[
    "Todos os alunos acertaram todas as questões",
    "Nenhum aluno acertou todas as questões",
    "Existe exatamente um aluno que errou",
    "Alguns alunos acertaram algumas questões",
    "Todos os alunos erraram todas as questões"
  ],1,"Negar uma existência significa afirmar que nenhum elemento satisfaz a propriedade."),

  q(22,"Verdades e Mentiras","João afirma: 'Maria está mentindo.' Maria afirma: 'João e eu estamos dizendo a verdade.' Sabendo que exatamente uma dessas afirmações é verdadeira, conclui-se que:",[
    "João diz a verdade e Maria mente",
    "Maria diz a verdade e João mente",
    "ambos dizem a verdade",
    "ambos mentem",
    "não há solução lógica"
  ],0,"Se João diz a verdade, Maria mente; a fala de Maria, que afirma que ambos dizem a verdade, é falsa. Assim há exatamente uma afirmação verdadeira."),

  q(23,"Associação Lógica","Três pessoas — Ana, Bia e Caio — ocupam, sem repetição, os cargos de analista, técnico e gestor. Ana não é gestora. Bia é técnica. Logo:",[
    "Ana é técnica",
    "Caio é técnico",
    "Caio é gestor",
    "Bia é gestora",
    "Ana é gestora"
  ],2,"Como Bia já ocupa o cargo de técnica e Ana não pode ser gestora, Ana só pode ser analista. Portanto Caio é gestor."),

  q(24,"Sequências","Qual é o próximo termo da sequência 2, 5, 8, 11, 14, ...?",[
    "15",
    "16",
    "17",
    "18",
    "19"
  ],2,"A sequência é uma progressão aritmética de razão 3. Assim, 14 + 3 = 17."),

  q(25,"Sequências","Observe a sequência 1, 2, 4, 8, 16, ... O próximo termo é:",[
    "18",
    "24",
    "30",
    "32",
    "34"
  ],3,"Cada termo é o dobro do anterior; portanto 16 × 2 = 32."),

  q(26,"Raciocínio Numérico","Em uma sala, 18 pessoas gostam de café, 12 gostam de chá e 5 gostam de ambos. Quantas gostam de pelo menos uma das duas bebidas?",[
    "25",
    "30",
    "35",
    "20",
    "17"
  ],0,"Pelo princípio da inclusão-exclusão: 18 + 12 - 5 = 25."),

  q(27,"Orientação Temporal","Se hoje é terça-feira, daqui a 10 dias será:",[
    "quinta-feira",
    "sexta-feira",
    "sábado",
    "domingo",
    "segunda-feira"
  ],1,"Dez dias correspondem a uma semana mais três dias. Três dias após terça-feira é sexta-feira."),

  q(28,"Orientação Espacial","Uma pessoa está voltada para o norte. Ela gira 90° para a direita e depois 180° para a esquerda. Ao final, estará voltada para:",[
    "norte",
    "sul",
    "leste",
    "oeste",
    "nordeste"
  ],3,"Do norte, 90° à direita leva ao leste. Depois, 180° à esquerda leva ao oeste."),

  q(29,"Problemas Lógicos","Um número natural é maior que 20, menor que 30, par e múltiplo de 3. Esse número é:",[
    "21",
    "22",
    "24",
    "26",
    "28"
  ],2,"Entre 21 e 29, o único número simultaneamente par e múltiplo de 3 é 24."),

  q(30,"Lógica Dedutiva","Se nenhum A é B e todo C é A, então é necessariamente verdadeiro que:",[
    "todo B é C",
    "algum C é B",
    "nenhum C é B",
    "todo A é C",
    "algum B é A"
  ],2,"Como todo C pertence a A e nenhum elemento de A pertence a B, nenhum elemento de C pode pertencer a B."),
];
