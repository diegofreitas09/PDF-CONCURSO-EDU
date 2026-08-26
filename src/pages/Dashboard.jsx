import React,{useEffect,useMemo,useState}from"react";
import{ArrowRight,BookOpenText,Clock3,Database,FileText,ListChecks,PlayCircle,Target,TrendingUp,Sparkles,ShieldCheck}from"lucide-react";
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
 const reviewCount=(QUESTION_AUDIT_STATS?.quarantinedMissingContext||0)+(QUESTION_AUDIT_STATS?.quarantinedOversizedOption||0);
 const goal=Number(state.settings?.weeklyGoal||300);const goalPct=Math.min(100,Math.round(studiedMinutes/Math.max(1,goal)*100));
 return <section className="page dashboard-page dashboard-pro">
  <div className="dashboard-hero">
   <div className="dashboard-hero-copy"><div className="page-eyebrow">CENTRAL DE PREPARAÇÃO</div><h1>Olá, {state.settings?.name||"Diego"}.</h1><p>Seu estudo, suas questões e sua evolução em um único painel.</p><div className="hero-actions"><button className="primary-button" onClick={()=>navigate("/questoes")}><PlayCircle size={19}/>Resolver questões<ArrowRight size={17}/></button><button className="hero-secondary" onClick={()=>navigate("/simulados")}><FileText size={18}/>Criar simulado</button></div></div>
   <div className="hero-focus"><div className="hero-focus-icon"><Sparkles size={22}/></div><div><span>FOCO DA SESSÃO</span><strong>{totalAnswered?`${accuracy}% de aproveitamento`:`Comece pelas questões`}</strong><small>{totalAnswered?`${correct} acertos em ${totalAnswered} respostas registradas`:`Use o banco para gerar seu primeiro diagnóstico.`}</small></div></div>
  </div>
  <div className="stats-grid stats-pro">
   <Stat icon={ListChecks} label="QUESTÕES" value={totalAnswered} description={`${publishedQuestions} disponíveis`} tone="blue"/>
   <Stat icon={Target} label="APROVEITAMENTO" value={`${accuracy}%`} description={`${correct} respostas corretas`} tone="green"/>
   <Stat icon={FileText} label="SIMULADOS" value={state.simulations||0} description="realizados até agora" tone="red"/>
   <Stat icon={Clock3} label="TEMPO DE ESTUDO" value={`${studiedMinutes} min`} description={`${goalPct}% da meta semanal`} tone="amber"/>
  </div>
  <div className="dashboard-main-grid">
   <div className="dashboard-column">
    <div className="card study-card pro-card"><div className="card-heading"><div><div className="card-eyebrow">PLANO DE EVOLUÇÃO</div><h2>Trilha geral</h2><p>Avance por tópicos e transforme estudo em progresso mensurável.</p></div><div className="card-icon-soft"><BookOpenText size={23}/></div></div><div className="progress-hero"><div><strong>{progress}%</strong><span>concluído</span></div><small>{completedCount} de {uniqueTopics} tópicos</small></div><div className="progress-bar pro-progress"><span style={{width:`${progress}%`}}/></div><div className="study-mini-grid"><div><span>Meta semanal</span><strong>{goal} min</strong></div><div><span>Estudado</span><strong>{studiedMinutes} min</strong></div><div><span>Disciplinas</span><strong>{uniqueDisciplines}</strong></div></div><button className="secondary-button card-action" onClick={()=>navigate("/estudos")}>Continuar trilha<ArrowRight size={17}/></button></div>
    <div className="card pro-card quick-card"><div className="card-heading"><div><div className="card-eyebrow">ATALHOS INTELIGENTES</div><h2>Próxima ação</h2></div><TrendingUp size={23}/></div><div className="quick-actions"><button onClick={()=>navigate("/questoes")}><ListChecks size={19}/><div><strong>Treinar por questões</strong><span>Filtre disciplina e assunto</span></div><ArrowRight size={16}/></button><button onClick={()=>navigate("/simulados")}><FileText size={19}/><div><strong>Sortear simulado</strong><span>Prova personalizada e aleatória</span></div><ArrowRight size={16}/></button><button onClick={()=>navigate("/desempenho")}><Target size={19}/><div><strong>Analisar desempenho</strong><span>Veja seus pontos fortes e fracos</span></div><ArrowRight size={16}/></button></div></div>
   </div>
   <div className="dashboard-column">
    <div className="card pro-card knowledge-card"><div className="card-heading"><div><div className="card-eyebrow">BASE PDF CONCURSO EDU</div><h2>Seu ambiente de preparação</h2><p>Conteúdo centralizado e pronto para prática.</p></div><div className="card-icon-soft"><Database size={23}/></div></div><div className="knowledge-number"><strong>{publishedQuestions}</strong><span>questões publicadas</span></div><div className="source-list pro-source-list"><button onClick={()=>navigate("/questoes")}><div className="source-index">01</div><div><strong>Banco de Questões</strong><span>{uniqueDisciplines} disciplinas integradas</span></div><ArrowRight size={17}/></button><button onClick={()=>navigate("/biblioteca")}><div className="source-index">02</div><div><strong>Biblioteca</strong><span>{LIBRARY_MATERIALS.length} materiais cadastrados</span></div><ArrowRight size={17}/></button><button onClick={()=>navigate("/desempenho")}><div className="source-index">03</div><div><strong>Motor de Análise</strong><span>{totalAnswered} respostas no histórico</span></div><ArrowRight size={17}/></button></div></div>
    <div className="card pro-card audit-card"><div className="audit-status"><div className="audit-icon"><ShieldCheck size={21}/></div><div><span>QUALIDADE DO BANCO</span><strong>{reviewCount?`${reviewCount} itens em revisão`:`Base auditada`}</strong><small>{QUESTION_AUDIT_STATS?.published??publishedQuestions} questões liberadas para estudo</small></div></div><div className="audit-meta"><span>{Object.keys(QUESTION_SOURCE_STATS||{}).filter(k=>k!=="total").length} fontes integradas</span><span>{QUESTION_AUDIT_STATS?.raw??publishedQuestions} registros analisados</span></div></div>
   </div>
  </div>
 </section>
}
function Stat({icon:Icon,label,value,description,tone}){return <div className={`stat-card stat-pro stat-${tone}`}><div className="stat-icon"><Icon size={20} strokeWidth={1.8}/></div><div className="stat-copy"><span>{label}</span><strong>{value}</strong><small>{description}</small></div></div>}
