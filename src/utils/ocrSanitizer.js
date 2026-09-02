const CONTROL=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const FIXES=[
 [/\bf atores\b/gi,"fatores"],[/\balt as\b/gi,"altas"],[/\bte mpo\b/gi,"tempo"],[/\baç ões\b/gi,"ações"],[/\bop eram\b/gi,"operam"],[/\bigua ldade\b/gi,"igualdade"],[/\bCOR RETAMENTE\b/g,"CORRETAMENTE"],[/\bobst áculo\b/gi,"obstáculo"],[/\bne cessári/gi,"necessári"],[/\baq uel/gi,"aquel"],[/\bap rendiz/gi,"aprendiz"],[/\bco mo\b/gi,"como"],[/\be ntre\b/gi,"entre"],
 [/\bte mperaturas\b/gi,"temperaturas"],[/\bhá\s+pouco\b/gi,"há pouco"],[/\bsecreta rio\b/gi,"secretário"],[/\bra pido\b/gi,"rápido"],[/\bmea dos\b/gi,"meados"],[/\bclima ticas\b/gi,"climáticas"],[/\bve getação\b/gi,"vegetação"],[/\bdim inuir\b/gi,"diminuir"],[/\bnacionai s\b/gi,"nacionais"],[/\bI sso\b/g,"Isso"],[/\bs ignifica\b/gi,"significa"],[/\bgeren ciamento\b/gi,"gerenciamento"],
 [/\bpos sível\b/gi,"possível"],[/\bserv iço\b/gi,"serviço"],[/\bhu mana\b/gi,"humana"],[/\bmom ento\b/gi,"momento"],[/\befic iente\b/gi,"eficiente"],[/\bdesastrosas\b/gi,"desastrosas"],[/\bpre viamente\b/gi,"previamente"],[/\bprod uziu\b/gi,"produziu"],[/\balcanc e\b/gi,"alcance"],[/\bpsicointelectua is\b/gi,"psicointelectuais"],[/\bco mparação\b/gi,"comparação"],[/\bafeti vo\b/gi,"afetivo"],[/\bapres entadas\b/gi,"apresentadas"]
];
export function sanitizeOCRText(value=""){
 let s=String(value??"").replace(CONTROL," ").replace(/\u00ad/g,"").replace(/\uFFFD/g,"");
 for(const[r,to]of FIXES)s=s.replace(r,to);
 return s.replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2").replace(/\s+([,.;:!?])/g,"$1").replace(/([([{])\s+/g,"$1").replace(/\s+([)\]}])/g,"$1").replace(/[ \t]{2,}/g," ").replace(/\n[ \t]+/g,"\n").trim();
}
export function ocrRiskScore(value=""){
 const s=String(value??"");let score=0;
 if(CONTROL.test(s))score+=3;
 if(/\uFFFD|�/.test(s))score+=4;
 if(/\b[A-Za-zÀ-ÿ]{2,12}\s+[a-zà-ÿ]{1,3}\b/.test(s))score+=1;
 if(/\b\d{1,3}\s+(?=[A-ZÁÉÍÓÚÂÊÔÃÕÇ][a-zà-ÿ])/g.test(s)&&s.length>500)score+=1;
 if(/\bTEXTO(?:-BASE)?\b[\s\S]{900,}\bQUESTÃO\b/i.test(s))score+=2;
 return score;
}
export function sanitizeQuestionOCR(q={}){
 const context=sanitizeOCRText(q.context||q.passage||q.supportText||q.texto||q.textBase||q.baseText||"");
 const originalStatement=sanitizeOCRText(q.originalStatement||q.statement||"").replace(/^TEXTO-BASE\s+[\s\S]*?\s+QUESTÃO\s+/i,"");
 const options=Array.isArray(q.options)?q.options.map(sanitizeOCRText):[];
 const explanation=sanitizeOCRText(q.explanation||"");
 const combined=[context,originalStatement,...options].join(" "),ocrRisk=ocrRiskScore(combined);
 return{...q,context,originalStatement,statement:originalStatement,options,explanation,ocrRisk,ocrReviewed:ocrRisk===0};
}
export function sanitizeQuestionBank(list=[]){return list.map(sanitizeQuestionOCR)}
