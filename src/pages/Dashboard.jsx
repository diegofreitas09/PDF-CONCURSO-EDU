import React,{useEffect,useMemo,useState}from"react";
import{ArrowRight,BookOpenText,Clock3,Database,FileText,ListChecks,PlayCircle,Target}from"lucide-react";
import{useNavigate}from"react-router";
import{ALL_QUESTIONS,QUESTION_AUDIT_STATS,QUESTION_SOURCE_STATS}from"../data/questionSources";
import{LIBRARY_MATERIALS}from"../data/libraryMaterials";
import"../styles/functions.css";

const STORAGE_KEY="pdf-concurso-edu-state-v1";
const DEFAULT_STATE={answers:[],studySeconds:0,simulations:0,completedTopics:[],settings:{name:"Diego",weeklyGoal:300}};
function loadState(){try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY));return{...DEFAULT_STATE,...(saved||{}),settings:{...DEFAULT_STATE.settings,...(saved?.settings||{})}}}catch{return DEFAULT_STATE}}

export default function Dashboard(){
 const navigate=useNavigate();
 const[state,setState]=useState(loadState);
 useEffect(()=>{const sync=()=>setState(loadState());window.addEventListener("storage",sync);window.addEventListener("pdfedu-state",sync);window.addEventListener("focus",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("pdfedu-state",sync);window.removeEventListener("focus",sync)}},[]);
 const totalAnswered=state.answers?.length||0;
 const correct=(state.answers||[]).filter(a=>a.correct).length;
 const accuracy=totalAnswered?Math.round(correct/totalAnswered*100):0;
 const studiedMinutes=Math.floor((state.studySeconds||0)/60);
 const publishedQuestions=ALL_QUESTIONS.length;
 const uniqueTopics=useMemo(()=>new Set(ALL_QUESTIONS.map(q=>`${q.discipline}::${q.topic}`).filter(Boolean)).size,[]);
 const uniqueDisciplines=useMemo(()=>new Set(ALL_QUESTIONS.map(q=>q.discipline).filter(Boolean)).size,[]);
 const completedCount=(state.completedTopics||[]).length;
 const progress=uniqueTopics?Math.min(100,Math.round(completedCount/uniqueTopics*100)):0;
 return <section className="page dashboard-page">
  <div className="dashboard-heading"><div><div className="page-eyebrow">PAINEL DE ESTUDOS</div><h1>Olá, {state.settings?.name||"Diego"}!</h1><p>Continue sua preparação para o seu concurso.</p></div><button className="primary-button" onClick={()=>navigate("/estudos")}><PlayCircle size={19}/>Iniciar estudo<ArrowRight size={18}/></button></div>
  <div className="stats-grid">
   <Stat icon={ListChecks} label="QUESTÕES RESPONDIDAS" value={totalAnswered} description={`Banco atual: ${publishedQuestions} disponíveis`}/>
   <Stat icon={Target} label="ACERTOS" value={`${accuracy}%`} description={`${correct} respostas corretas`}/>
   <Stat icon={FileText} label="SIMULADOS" value={state.simulations||0} description="Simulados realizados"/>
   <Stat icon={Clock3} label="TEMPO DE ESTUDO" value={`${studiedMinutes} min`} description="Tempo acumulado"/>
  </div>
  <div className="dashboard-grid">
   <div className="card study-card"><div className="card-heading"><div><div className="card-eyebrow">CONTINUE ESTUDANDO</div><h2>Trilha geral</h2><p>Conclua tópicos e acompanhe sua evolução geral.</p></div><BookOpenText size={27} strokeWidth={1.6}/></div><div className="progress-meta"><span>Tópicos concluídos</span><strong>{completedCount}/{uniqueTopics}</strong></div><div className="progress-meta"><span>Progresso</span><strong>{progress}%</strong></div><div className="progress-bar"><span style={{width:`${progress}%`}}/></div><button className="secondary-button" onClick={()=>navigate("/estudos")}>Abrir estudos<ArrowRight size={17}/></button></div>
   <div className="card"><div className="card-heading"><div><div className="card-eyebrow">BASE PDF CONCURSO EDU</div><h2>Base de conhecimento</h2></div><Database size={26} strokeWidth={1.6}/></div><div className="source-list">
    <button onClick={()=>navigate("/questoes")}><div><strong>01&nbsp;&nbsp; Base de Questões</strong><span>{publishedQuestions} questões publicadas · {uniqueDisciplines} disciplinas</span></div><ArrowRight size={17}/></button>
    <button onClick={()=>navigate("/biblioteca")}><div><strong>02&nbsp;&nbsp; Biblioteca de Pesquisa</strong><span>{LIBRARY_MATERIALS.length} materiais cadastrados</span></div><ArrowRight size={17}/></button>
    <button onClick={()=>navigate("/desempenho")}><div><strong>03&nbsp;&nbsp; Motor de Análise</strong><span>{totalAnswered} respostas registradas no histórico</span></div><ArrowRight size={17}/></button>
   </div><div style={{marginTop:14,fontSize:12,color:"var(--muted)",lineHeight:1.6}}>Auditoria do banco: {QUESTION_AUDIT_STATS?.raw??publishedQuestions} registros analisados · {QUESTION_AUDIT_STATS?.published??publishedQuestions} publicados · {(QUESTION_AUDIT_STATS?.quarantinedMissingContext||0)+(QUESTION_AUDIT_STATS?.quarantinedOversizedOption||0)} em revisão. Fontes integradas: {Object.keys(QUESTION_SOURCE_STATS||{}).filter(k=>k!=="total").length}.</div></div>
  </div>
 </section>
}
function Stat({icon:Icon,label,value,description}){return <div className="stat-card"><div className="stat-icon"><Icon size={21} strokeWidth={1.7}/></div><div><span>{label}</span><strong>{value}</strong><small>{description}</small></div></div>}
