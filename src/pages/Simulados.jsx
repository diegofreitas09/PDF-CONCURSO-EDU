import React,{useMemo,useState}from"react";
import{ArrowLeft,ArrowRight,CheckCircle2,ClipboardList,Download,Play,RotateCcw,Trophy}from"lucide-react";
import{ALL_QUESTIONS}from"../data/questionSources";
import"../styles/simulados.css";

const STORAGE_KEY="pdf-concurso-edu-state-v1";
const DRAW_KEY="pdf-concurso-edu-simulation-draw-v2";
const JSPDF_CDN="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js";
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function loadPlatform(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return{}}}
function loadDrawState(){try{return JSON.parse(localStorage.getItem(DRAW_KEY))||{usedByDiscipline:{},lastExamSignature:""}}catch{return{usedByDiscipline:{},lastExamSignature:""}}}
function saveDrawState(value){localStorage.setItem(DRAW_KEY,JSON.stringify(value))}
function formatDuration(seconds=0){const s=Math.max(0,Math.round(seconds));const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${h}h ${m}min ${sec}s`:m?`${m}min ${sec}s`:`${sec}s`}
function saveSimulation(result){const s=loadPlatform();const now=new Date().toISOString();const answers=[...(s.answers||[]),...result.answers.map(a=>({...a,at:now,simulation:true}))];const history=[...(s.simulationHistory||[]),{id:Date.now(),at:now,total:result.total,correct:result.correct,accuracy:result.accuracy,durationSeconds:result.durationSeconds,byDiscipline:result.byDiscipline,questionIds:result.answers.map(a=>a.questionId)}];localStorage.setItem(STORAGE_KEY,JSON.stringify({...s,answers,simulations:Number(s.simulations||0)+1,simulationHistory:history}));window.dispatchEvent(new Event("pdfedu-state"))}
function loadJsPDF(){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve(window.jspdf.jsPDF);const existing=document.querySelector(`script[src="${JSPDF_CDN}"]`);if(existing){existing.addEventListener("load",()=>resolve(window.jspdf.jsPDF),{once:true});existing.addEventListener("error",reject,{once:true});return}const script=document.createElement("script");script.src=JSPDF_CDN;script.async=true;script.onload=()=>window.jspdf?.jsPDF?resolve(window.jspdf.jsPDF):reject(new Error("Biblioteca PDF não carregada"));script.onerror=()=>reject(new Error("Falha ao carregar gerador de PDF"));document.head.appendChild(script)})}

function permuteOptions(question){
 const indexed=(question.options||[]).map((text,originalIndex)=>({text,originalIndex}));
 let mixed=shuffle(indexed);
 if(mixed.length>1&&mixed.every((item,i)=>item.originalIndex===i)) mixed=[...mixed.slice(1),mixed[0]];
 const newAnswer=mixed.findIndex(item=>item.originalIndex===question.answer);
 return{...question,originalAnswer:question.answer,options:mixed.map(item=>item.text),answer:newAnswer,optionPermutation:mixed.map(item=>item.originalIndex),instanceId:`${question.id}-${Date.now()}-${Math.random().toString(36).slice(2,9)}`};
}

function drawDisciplineQuestions(discipline,count,drawState){
 const pool=ALL_QUESTIONS.filter(q=>q.discipline===discipline);
 const used=new Set(drawState.usedByDiscipline?.[discipline]||[]);
 let fresh=shuffle(pool.filter(q=>!used.has(String(q.id))));
 const selected=[];
 while(selected.length<count){
   if(!fresh.length){
     used.clear();
     const selectedIds=new Set(selected.map(q=>String(q.id)));
     fresh=shuffle(pool.filter(q=>!selectedIds.has(String(q.id))));
     if(!fresh.length)break;
   }
   const q=fresh.shift();
   if(!q)break;
   selected.push(q);
   used.add(String(q.id));
 }
 const allIds=new Set(pool.map(q=>String(q.id)));
 const usedValid=[...used].filter(id=>allIds.has(id));
 return{selected,usedIds:usedValid};
}

function buildRandomExam(disciplines,counts){
 const previous=loadDrawState();
 const nextUsed={...(previous.usedByDiscipline||{})};
 let selected=[];
 for(const d of disciplines){
   const n=Number(counts[d]||0);
   if(!n)continue;
   const drawn=drawDisciplineQuestions(d,n,{usedByDiscipline:nextUsed});
   nextUsed[d]=drawn.usedIds;
   selected.push(...drawn.selected);
 }
 selected=selected.map(permuteOptions);
 let mixed=shuffle(selected);
 let signature=mixed.map(q=>String(q.id)).join("|");
 if(mixed.length>1&&signature===previous.lastExamSignature){mixed=[...mixed.slice(1),mixed[0]];signature=mixed.map(q=>String(q.id)).join("|")}
 saveDrawState({usedByDiscipline:nextUsed,lastExamSignature:signature});
 return mixed;
}

export default function Simulados(){
 const disciplines=useMemo(()=>[...new Set(ALL_QUESTIONS.map(q=>q.discipline).filter(Boolean))].sort(),[]);
 const available=useMemo(()=>Object.fromEntries(disciplines.map(d=>[d,ALL_QUESTIONS.filter(q=>q.discipline===d).length])),[disciplines]);
 const [counts,setCounts]=useState({});const [exam,setExam]=useState([]);const [answers,setAnswers]=useState({});const [index,setIndex]=useState(0);const [finished,setFinished]=useState(false);const [saved,setSaved]=useState(false);const [startedAt,setStartedAt]=useState(null);const [finishedAt,setFinishedAt]=useState(null);const [pdfLoading,setPdfLoading]=useState(false);const [pdfError,setPdfError]=useState("");
 const totalRequested=Object.values(counts).reduce((a,b)=>a+(Number(b)||0),0);
 function setCount(d,value){const n=Math.max(0,Math.min(Number(value)||0,available[d]||0));setCounts(c=>({...c,[d]:n}))}
 function generate(){const selected=buildRandomExam(disciplines,counts);if(!selected.length)return;setExam(selected);setAnswers({});setIndex(0);setFinished(false);setSaved(false);setStartedAt(Date.now());setFinishedAt(null);setPdfError("")}
 function choose(i){if(!finished)setAnswers(a=>({...a,[exam[index].instanceId]:i}))}
 function finish(){if(!exam.length)return;const end=Date.now();setFinishedAt(end);setFinished(true);const result=buildResult(end);saveSimulation(result);setSaved(true);window.scrollTo({top:0,behavior:"smooth"})}
 function buildResult(endTime=finishedAt||Date.now()){const answerRows=exam.map(q=>({questionId:q.id,instanceId:q.instanceId,discipline:q.discipline,topic:q.topic,selected:answers[q.instanceId],answer:q.answer,correct:answers[q.instanceId]===q.answer,optionPermutation:q.optionPermutation}));const correct=answerRows.filter(a=>a.correct).length;const byDiscipline={};answerRows.forEach(a=>{byDiscipline[a.discipline]??={total:0,correct:0};byDiscipline[a.discipline].total++;if(a.correct)byDiscipline[a.discipline].correct++});const durationSeconds=startedAt?Math.max(0,Math.round((endTime-startedAt)/1000)):0;return{answers:answerRows,total:exam.length,correct,accuracy:exam.length?Math.round(correct/exam.length*100):0,byDiscipline,durationSeconds}}
 async function downloadReport(){if(!finished||!exam.length)return;setPdfLoading(true);setPdfError("");try{const jsPDF=await loadJsPDF();const doc=new jsPDF({unit:"mm",format:"a4"});const result=buildResult();const platform=loadPlatform();const name=platform?.settings?.name||"Aluno";const date=new Date(finishedAt||Date.now());const margin=16,pageW=210,pageH=297,usable=pageW-margin*2;let y=18;const ensure=(need=12)=>{if(y+need>pageH-16){doc.addPage();y=18}};const addText=(text,size=10,bold=false,space=4)=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);const lines=doc.splitTextToSize(String(text||""),usable);ensure(lines.length*(size*.38)+space);doc.text(lines,margin,y);y+=lines.length*(size*.38)+space};doc.setFillColor(20,31,48);doc.rect(0,0,210,38,"F");doc.setTextColor(255,255,255);doc.setFont("helvetica","bold");doc.setFontSize(20);doc.text("PDF CONCURSO EDU",margin,17);doc.setFontSize(12);doc.text("Relatório de Simulado",margin,27);doc.setTextColor(20,31,48);y=48;addText(`Aluno: ${name}`,11,true,2);addText(`Data: ${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}`,10,false,2);addText(`Duração: ${formatDuration(result.durationSeconds)}`,10,false,5);doc.setFillColor(245,247,250);doc.roundedRect(margin,y,usable,28,3,3,"F");doc.setFont("helvetica","bold");doc.setFontSize(16);doc.text(`${result.correct}/${result.total} acertos`,margin+6,y+10);doc.setFontSize(12);doc.text(`Desempenho geral: ${result.accuracy}%`,margin+6,y+20);y+=36;addText("Desempenho por disciplina",13,true,4);Object.entries(result.byDiscipline).forEach(([d,r])=>addText(`${d}: ${r.correct}/${r.total} acertos — ${Math.round(r.correct/r.total*100)}%`,10,false,2));y+=4;addText("Detalhamento das questões",13,true,5);exam.forEach((q,i)=>{const selected=answers[q.instanceId],ok=selected===q.answer;ensure(32);doc.setDrawColor(ok?70:190,ok?150:70,ok?90:70);doc.setLineWidth(.5);doc.line(margin,y,margin+usable,y);y+=5;addText(`Questão ${i+1} — ${q.discipline} · ${q.topic||"Sem tópico"}`,11,true,3);if(q.context){addText("TEXTO-BASE",9,true,2);addText(q.context,8.5,false,3)}addText(q.statement,10,false,3);q.options.forEach((o,oi)=>{const letter=String.fromCharCode(65+oi);let prefix=`${letter}) `;if(oi===selected)prefix+="[MARCADA] ";if(oi===q.answer)prefix+="[GABARITO] ";addText(prefix+o,9,false,2)});addText(`Resposta do aluno: ${selected===undefined?"Não respondida":String.fromCharCode(65+selected)} | Gabarito: ${String.fromCharCode(65+q.answer)} | ${ok?"ACERTOU":"ERROU"}`,9.5,true,3);if(q.explanation)addText(`Comentário: ${q.explanation}`,8.5,false,4)});ensure(20);doc.setDrawColor(180);doc.line(margin,y,margin+usable,y);y+=6;addText("Relatório gerado automaticamente pela plataforma PDF Concurso EDU.",8,false,2);addText("A ordem das questões e das alternativas é sorteada a cada novo simulado.",8,false,2);const safeDate=date.toISOString().slice(0,10);doc.save(`Relatorio_Simulado_PDF_Concurso_${safeDate}.pdf`)}catch(e){setPdfError(e?.message||"Não foi possível gerar o PDF.")}finally{setPdfLoading(false)}}
 const result=finished?buildResult():null;const current=exam[index];
 if(!exam.length)return <section className="page sim-page"><div className="sim-heading"><div><div className="page-eyebrow">GERADOR DE SIMULADOS</div><h1>Simulado aleatório</h1><p>Escolha as disciplinas e quantas questões deseja em cada uma. O sistema prioriza questões que ainda não saíram e embaralha também as alternativas.</p></div><div className="sim-heading-icon"><ClipboardList size={28}/></div></div><div className="sim-builder"><div className="sim-builder-head"><div><strong>Monte seu simulado</strong><span>{ALL_QUESTIONS.length} questões auditadas disponíveis · sorteio rotativo</span></div><div className="sim-total"><span>Total escolhido</span><strong>{totalRequested}</strong></div></div><div className="sim-discipline-list">{disciplines.map(d=><div className="sim-discipline-row" key={d}><div><strong>{d}</strong><span>{available[d]} disponíveis</span></div><input type="number" min="0" max={available[d]} value={counts[d]||""} placeholder="0" onChange={e=>setCount(d,e.target.value)}/></div>)}</div><div className="sim-builder-actions"><button type="button" className="sim-clear" onClick={()=>setCounts({})}><RotateCcw size={17}/> Limpar</button><button type="button" className="sim-generate" disabled={!totalRequested} onClick={generate}><Play size={18}/> Sortear simulado ({totalRequested})</button></div></div></section>;
 if(finished)return <section className="page sim-page"><div className="sim-result-hero"><Trophy size={34}/><div><div className="page-eyebrow">RESULTADO DO SIMULADO</div><h1>{result.correct}/{result.total} acertos</h1><p>Desempenho geral: <strong>{result.accuracy}%</strong> · Tempo: <strong>{formatDuration(result.durationSeconds)}</strong>{saved?" · resultado salvo no Dashboard":""}</p></div></div><div className="sim-report-actions"><button className="sim-download" onClick={downloadReport} disabled={pdfLoading}><Download size={18}/>{pdfLoading?"Gerando relatório...":"Baixar relatório completo em PDF"}</button>{pdfError&&<span className="sim-pdf-error">{pdfError}</span>}</div><div className="sim-result-grid">{Object.entries(result.byDiscipline).map(([d,r])=><div className="sim-result-card" key={d}><strong>{d}</strong><span>{r.correct}/{r.total} acertos</span><b>{Math.round(r.correct/r.total*100)}%</b></div>)}</div><div className="sim-review-list">{exam.map((q,i)=>{const selected=answers[q.instanceId],ok=selected===q.answer;return <article className={`sim-review ${ok?"ok":"wrong"}`} key={q.instanceId}><header><strong>Questão {i+1}</strong><span>{q.discipline} · {q.topic}</span></header>{q.context&&<div className="sim-context">{q.context}</div>}<p>{q.statement}</p><div className="sim-review-answer"><span>Você marcou: {selected===undefined?"Não respondida":String.fromCharCode(65+selected)}</span><strong>Gabarito: {String.fromCharCode(65+q.answer)}</strong></div>{q.explanation&&<small>{q.explanation}</small>}</article>})}</div><button className="sim-new" onClick={()=>{setExam([]);setFinished(false);setAnswers({});setStartedAt(null);setFinishedAt(null)}}><RotateCcw size={17}/> Sortear próximo simulado</button></section>;
 const answeredCount=Object.keys(answers).length;
 return <section className="page sim-page"><div className="sim-running-head"><button onClick={()=>setExam([])}><ArrowLeft size={17}/> Sair</button><div><strong>Simulado em andamento</strong><span>{answeredCount}/{exam.length} respondidas</span></div><button className="sim-finish" onClick={finish}>Finalizar</button></div><article className="sim-question-card"><header><div><strong>Questão {index+1} de {exam.length}</strong><span>{current.discipline} · {current.topic}</span></div><span>{Math.round(((index+1)/exam.length)*100)}%</span></header>{current.context&&<div className="sim-context"><b>TEXTO-BASE</b><p>{current.context}</p></div>}<div className="sim-statement">{current.statement}</div><div className="sim-options">{current.options.map((o,i)=><button type="button" key={`${current.instanceId}-${i}`} onClick={()=>choose(i)} className={answers[current.instanceId]===i?"selected":""}><span>{String.fromCharCode(65+i)}</span><p>{o}</p>{answers[current.instanceId]===i&&<CheckCircle2 size={19}/>}</button>)}</div><div className="sim-nav"><button disabled={index===0} onClick={()=>setIndex(i=>Math.max(0,i-1))}><ArrowLeft size={17}/> Anterior</button><div>{exam.map((q,i)=><button key={q.instanceId} className={`${i===index?"current":""} ${answers[q.instanceId]!==undefined?"answered":""}`} onClick={()=>setIndex(i)}>{i+1}</button>)}</div><button disabled={index===exam.length-1} onClick={()=>setIndex(i=>Math.min(exam.length-1,i+1))}>Próxima <ArrowRight size={17}/></button></div></article></section>
}
