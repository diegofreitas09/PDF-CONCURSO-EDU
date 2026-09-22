import React,{useEffect,useMemo,useState}from"react";
import{ChartNoAxesCombined,Target,Trophy,ListChecks,AlertCircle,Database,ArrowRight}from"lucide-react";
import{useNavigate,useSearchParams}from"react-router";
import{REGISTERED_QUESTIONS}from"../data/questionRegistry";
import{DisciplineIcon}from"../utils/disciplineIcons";
import{DISCIPLINES,topicsFor,questionCount,answeredCoverage,buildQuestionsRoute,savePlatformSelection}from"../utils/platformCatalog";
import"../styles/functions.css";

const STORAGE_KEY="pdf-concurso-edu-state-v1";
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{answers:[]}}catch{return{answers:[]}}}

export default function Desempenho(){
 const navigate=useNavigate(),[params,setParams]=useSearchParams(),[state,setState]=useState(loadState);
 const discipline=params.get("disciplina")||"",topic=params.get("topico")||"";
 useEffect(()=>{const sync=()=>setState(loadState());window.addEventListener("storage",sync);window.addEventListener("pdfedu-state",sync);window.addEventListener("focus",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("pdfedu-state",sync);window.removeEventListener("focus",sync)}},[]);
 useEffect(()=>{savePlatformSelection(discipline,topic)},[discipline,topic]);

 const topics=useMemo(()=>topicsFor(discipline),[discipline]);
 const answers=useMemo(()=>(state.answers||[]).filter(a=>(!discipline||a.discipline===discipline)&&(!topic||a.topic===topic)),[state.answers,discipline,topic]);
 const total=answers.length,correct=answers.filter(a=>a.correct).length,incorrect=total-correct,accuracy=total?Math.round(correct/total*100):0;
 const coverage=useMemo(()=>answeredCoverage(state.answers||[],discipline,topic),[state.answers,discipline,topic]);

 const rows=useMemo(()=>{
   if(discipline){
     return topicsFor(discipline).map(name=>{
       const bank=questionCount(discipline,name),rows=(state.answers||[]).filter(a=>a.discipline===discipline&&a.topic===name),hits=rows.filter(a=>a.correct).length,unique=new Set(rows.map(a=>a.questionId).filter(Boolean)).size;
       return{key:`${discipline}::${name}`,title:name,discipline,topic:name,bank,total:rows.length,hits,errors:rows.length-hits,accuracy:rows.length?Math.round(hits/rows.length*100):0,coverage:bank?Math.min(100,Math.round(unique/bank*100)):0};
     });
   }
   return DISCIPLINES.map(name=>{
     const bank=questionCount(name),rows=(state.answers||[]).filter(a=>a.discipline===name),hits=rows.filter(a=>a.correct).length,unique=new Set(rows.map(a=>a.questionId).filter(Boolean)).size;
     return{key:name,title:name,discipline:name,topic:"",bank,total:rows.length,hits,errors:rows.length-hits,accuracy:rows.length?Math.round(hits/rows.length*100):0,coverage:bank?Math.min(100,Math.round(unique/bank*100)):0};
   });
 },[discipline,state.answers]);

 function updateDiscipline(v){const n=new URLSearchParams(params);v?n.set("disciplina",v):n.delete("disciplina");n.delete("topico");setParams(n)}
 function updateTopic(v){const n=new URLSearchParams(params);v?n.set("topico",v):n.delete("topico");setParams(n)}

 return <section className="page performance-page">
  <div className="page-header"><div><div className="page-eyebrow">ANÁLISE INTEGRADA</div><h1>Desempenho</h1><p>Indicadores calculados sobre o mesmo banco usado em Questões, Estudos e Simulados.</p></div><div className="page-icon"><ChartNoAxesCombined size={28}/></div></div>

  <div className="performance-filters">
   <select value={discipline} onChange={e=>updateDiscipline(e.target.value)}><option value="">Todas as disciplinas</option>{DISCIPLINES.map(d=><option key={d} value={d}>{d} ({questionCount(d)})</option>)}</select>
   <select value={topic} disabled={!discipline} onChange={e=>updateTopic(e.target.value)}><option value="">Todos os assuntos</option>{topics.map(t=><option key={t} value={t}>{t} ({questionCount(discipline,t)})</option>)}</select>
   <button type="button" onClick={()=>navigate(buildQuestionsRoute(discipline,topic))}>Treinar este recorte <ArrowRight size={16}/></button>
  </div>

  <div className="performance-kpis performance-kpis-advanced">
   <div><Database size={19}/><span>Banco no recorte</span><strong>{coverage.bank}</strong><small>questões disponíveis</small></div>
   <div><ListChecks size={19}/><span>Respostas</span><strong>{total}</strong><small>{coverage.uniqueAnswered} questões únicas</small></div>
   <div><Trophy size={19}/><span>Acertos</span><strong>{correct}</strong><small>{incorrect} erro(s)</small></div>
   <div><Target size={19}/><span>Aproveitamento</span><strong>{accuracy}%</strong><small>sobre as respostas</small></div>
   <div><ChartNoAxesCombined size={19}/><span>Cobertura</span><strong>{coverage.coverage}%</strong><small>do banco já praticado</small></div>
   <div><AlertCircle size={19}/><span>Pontos de atenção</span><strong>{incorrect}</strong><small>respostas incorretas</small></div>
  </div>

  <div className="performance-list">{rows.map(item=><button type="button" className="performance-row performance-row-button" key={item.key} onClick={()=>navigate(buildQuestionsRoute(item.discipline,item.topic))}><div style={{display:"flex",alignItems:"center",gap:10}}><span className="discipline-choice-icon"><DisciplineIcon name={item.discipline} size={18}/></span><div><strong>{item.title}</strong><span>{item.total} resposta(s) · {item.bank} no banco · {item.errors} erro(s)</span></div></div><div className="performance-bar" title={`${item.coverage}% do banco praticado`}><span style={{width:`${item.accuracy}%`}}/></div><div className="performance-row-metrics"><strong>{item.accuracy}%</strong><small>{item.coverage}% coberto</small></div></button>)}</div>
 </section>;
}
