const CONTROL=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const FIXES=[
 [/\bf atores\b/gi,"fatores"],[/\balt as\b/gi,"altas"],[/\bte mpo\b/gi,"tempo"],[/\baç ões\b/gi,"ações"],[/\bop eram\b/gi,"operam"],[/\bigua ldade\b/gi,"igualdade"],[/\bCOR RETAMENTE\b/g,"CORRETAMENTE"],[/\bobst áculo\b/gi,"obstáculo"],[/\bne cessári/gi,"necessári"],[/\baq uel/gi,"aquel"],[/\bap rendiz/gi,"aprendiz"],[/\bco mo\b/gi,"como"],[/\be ntre\b/gi,"entre"],
 [/\bte mperaturas\b/gi,"temperaturas"],[/\bhá\s+pouco\b/gi,"há pouco"],[/\bsecreta rio\b/gi,"secretário"],[/\bra pido\b/gi,"rápido"],[/\bmea dos\b/gi,"meados"],[/\bclima ticas\b/gi,"climáticas"],[/\bve getação\b/gi,"vegetação"],[/\bdim inuir\b/gi,"diminuir"],[/\bnacionai s\b/gi,"nacionais"],[/\bI sso\b/g,"Isso"],[/\bs ignifica\b/gi,"significa"],[/\bgeren ciamento\b/gi,"gerenciamento"],
 [/\bpos sível\b/gi,"possível"],[/\bserv iço\b/gi,"serviço"],[/\bhu mana\b/gi,"humana"],[/\bmom ento\b/gi,"momento"],[/\befic iente\b/gi,"eficiente"],[/\bpre viamente\b/gi,"previamente"],[/\bprod uziu\b/gi,"produziu"],[/\balcanc e\b/gi,"alcance"],[/\bpsicointelectua is\b/gi,"psicointelectuais"],[/\bco mparação\b/gi,"comparação"],[/\bafeti vo\b/gi,"afetivo"],[/\bapres entadas\b/gi,"apresentadas"],
 [/\bdocumen to\b/gi,"documento"],[/\bcondiçõe s\b/gi,"condições"],[/\bfede rais\b/gi,"federais"],[/\borgani zação\b/gi,"organização"],[/\bn ão\b/gi,"não"],[/\bpa rte\b/gi,"parte"],[/\bcom prometem\b/gi,"comprometem"],[/\btorna\s+-se\b/gi,"torna-se"],[/\btrata\s+-se\b/gi,"trata-se"],[/\bTCE\s+-SP\b/g,"TCE-SP"]
];
const TEXT_DEPENDENCY=[/\bno texto\b/i,/\bde acordo com o texto\b/i,/\bcom base no texto\b/i,/\ba partir do texto\b/i,/\bsegundo o texto\b/i,/\btexto acima\b/i,/\btexto anterior\b/i,/\bleia o texto\b/i,/\bleia o trecho\b/i,/\bconsidere o texto\b/i,/\bobserve o texto\b/i,/\bno trecho\b/i,/\bparágrafo\b/i,/\bautor do texto\b/i,/\bideia central do texto\b/i];
export function sanitizeOCRText(value=""){
 let s=String(value??"").replace(CONTROL," ").replace(/\u00ad/g,"").replace(/\uFFFD/g,"");
 for(const[r,to]of FIXES)s=s.replace(r,to);
 if(s.length>900)s=s.replace(/\s(?:18|23|38|45|53|54)\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ])/g," ");
 return s.replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2").replace(/\s+([,.;:!?])/g,"$1").replace(/([([{])\s+/g,"$1").replace(/\s+([)\]}])/g,"$1").replace(/[ \t]{2,}/g," ").replace(/\n[ \t]+/g,"\n").trim();
}
export function dependsOnSupportText(value=""){const s=sanitizeOCRText(value);return TEXT_DEPENDENCY.some(re=>re.test(s))}
export function ocrRiskScore(value=""){
 const raw=String(value??""),s=sanitizeOCRText(raw);let score=0;
 if(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(raw))score+=3;
 if(/\uFFFD|�/.test(raw))score+=4;
 if(/\b(?:pos sível|serv iço|hu mana|mom ento|efic iente|nacionai s|s ignifica|geren ciamento|dim inuir|ve getação|documen to|condiçõe s|fede rais|organi zação|te mperaturas|pa rte|n ão|com prometem)\b/i.test(raw))score+=3;
 if(/\bTEXTO(?:-BASE)?\b[\s\S]{900,}\bQUESTÃO\b/i.test(raw))score+=3;
 if(/\[object Object\]/i.test(raw))score+=5;
 if(/Disponível em:\s*\./i.test(s))score+=2;
 return score;
}
export function sanitizeQuestionOCR(q={}){
 const rawStatement=q.originalStatement||q.statement||"";
 const wrapped=/^TEXTO-BASE\s+([\s\S]*?)\s+QUESTÃO\s+([\s\S]+)$/i.exec(sanitizeOCRText(rawStatement));
 const originalStatement=sanitizeOCRText(wrapped?wrapped[2]:rawStatement);
 const rawContext=q.context||q.passage||q.supportText||q.texto||q.textBase||q.baseText||wrapped?.[1]||"";
 const context=dependsOnSupportText(originalStatement)?sanitizeOCRText(rawContext):"";
 const options=Array.isArray(q.options)?q.options.map(sanitizeOCRText):[];
 const explanation=sanitizeOCRText(q.explanation||"");
 const combined=[context,originalStatement,...options].join(" "),ocrRisk=ocrRiskScore([rawContext,rawStatement,...(q.options||[])].join(" "));
 const duplicateOptions=new Set(options.map(x=>x.toLowerCase())).size!==options.length;
 const structurallyValid=Boolean(originalStatement)&&options.length>=2&&options.every(Boolean)&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<options.length&&!duplicateOptions;
 return{...q,context,originalStatement,statement:originalStatement,options,explanation,ocrRisk,ocrReviewed:ocrRisk===0,structurallyValid};
}
export function sanitizeQuestionBank(list=[]){return list.map(sanitizeQuestionOCR)}
