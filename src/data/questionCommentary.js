const PLACEHOLDER_PATTERNS=[
  "comentário detalhado poderá ser acrescentado",
  "comentario detalhado podera ser acrescentado",
  "comentário detalhado será acrescentado",
  "comentario detalhado sera acrescentado"
];

function clean(value=""){return String(value||"").replace(/\s+/g," ").trim()}
function useful(text=""){
  const normalized=clean(text).toLowerCase();
  return Boolean(normalized)&&!PLACEHOLDER_PATTERNS.some(p=>normalized.includes(p));
}
function letter(index){return Number.isInteger(index)&&index>=0?String.fromCharCode(65+index):"?"}
function clip(text,max=360){const t=clean(text);return t.length<=max?t:`${t.slice(0,max-1).trim()}…`}
function isNegativeCommand(statement=""){return /\b(incorreta|incorreto|exceto|não corresponde|não está|não se aplica)\b/i.test(statement)}

function disciplineGuidance(q){
  const d=clean(q?.discipline).toLowerCase();
  const topic=clean(q?.topic)||"o conteúdo cobrado";
  if(d.includes("portugu")) return `Em Língua Portuguesa, o ponto central é ${topic}. A resolução deve observar o valor semântico, a função sintática ou a regra de uso efetivamente presente no enunciado, sem decidir apenas pela aparência da frase.`;
  if(d.includes("racioc")) return `Em Raciocínio Lógico, o ponto central é ${topic}. A estratégia é transformar as informações do enunciado em relações objetivas e conferir qual alternativa satisfaz todas elas ao mesmo tempo.`;
  if(d.includes("pedag")) return `Em Conhecimentos Pedagógicos, o ponto central é ${topic}. A alternativa correta é a que mantém coerência com a concepção pedagógica, o conceito ou a diretriz indicada no enunciado, evitando generalizações que alterem seu sentido.`;
  if(d.includes("admin")) return `Em Administração Pública, o ponto central é ${topic}. A leitura deve separar conceitos próximos e verificar exatamente a condição apresentada no comando da questão.`;
  if(d.includes("indicador")) return `Em Indicadores Educacionais, o ponto central é ${topic}. Compare os dados e conceitos do enunciado com a função de cada indicador antes de escolher a alternativa.`;
  return `O ponto central desta questão é ${topic}. A resposta deve ser conferida a partir das condições expressas no enunciado e da correspondência exata entre essas condições e a alternativa escolhida.`;
}

export function getEditorialComment(q){
  const authored=clean(q?.explanation||q?.comment);
  if(useful(authored)) return authored;
  const options=Array.isArray(q?.options)?q.options:[];
  const answer=Number.isInteger(q?.answer)?q.answer:-1;
  const correct=answer>=0&&answer<options.length?clip(options[answer]):"a alternativa indicada no gabarito";
  const negative=isNegativeCommand(q?.originalStatement||q?.statement||"");
  const commandNote=negative
    ? "Atenção ao comando: a questão pede a exceção ou a alternativa incorreta. Por isso, o item marcado no gabarito é justamente o que não atende ao critério adotado pelas demais alternativas."
    : "A alternativa indicada no gabarito é a que atende integralmente ao comando da questão; as demais apresentam incompatibilidade, excesso, omissão ou desvio em relação ao conceito cobrado.";
  return `Gabarito: ${letter(answer)} — “${correct}”. ${commandNote} ${disciplineGuidance(q)}`;
}

export function hasEditorialComment(q){return Boolean(getEditorialComment(q))}
