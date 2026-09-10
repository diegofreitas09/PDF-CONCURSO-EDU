import React,{useEffect,useMemo,useState}from"react";
import{ChartNoAxesCombined,Target,Trophy,ListChecks}from"lucide-react";
import{REGISTERED_QUESTIONS}from"../data/questionRegistry";
import{DisciplineIcon}from"../utils/disciplineIcons";
import"../styles/functions.css";

const STORAGE_KEY="pdf-concurso-edu-state-v1";
function loadState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{answers:[]}}catch{return{answers:[]}}}
export default function Desempenho(){
 const[state,setState]=useState(loadState);
 useEffect(()=>{const sync=()=>setState(loadState());window.addEventListener("storage",sync);window.addEventListener("pdfedu-state",sync);window.addEventListener("focus",sync);return()=>{window.removeEventListener("storage",sync);window.removeEventListener("pdfedu-state",sync);window.removeEventListener("focus",sync)}},[]);
 const disciplines=useMemo(()=>[...new Set(REGISTERED_QUESTIONS.map(q=>q.discipline).filter(Boolean))].sort((a,b)=>a.localeCompare(b,"pt-BR")),[]);
 const total=(state.answers||[]).length,correct=(state.answers||[]).filter(a=>a.correct).length,accuracy=total?Math.round(correct/total*100):0;
 const byDiscipline=useMemo(()=>disciplines.map(title=>{const bank=REGISTERED_QUESTIONS.filter(q=>q.discipline===title),answers=(state.answers||[]).filter(a=>a.discipline===title),hits=answers.filter(a=>a.correct).length;return{title,bank:bank.length,total:answers.length,hits,accuracy:answers.length?Math.round(hits/answers.length*100):0}}),[disciplines,state.answers]);
 return <section className="page"><div className="page-header"><div><div className="page-eyebrow">ANÁLISE</div><h1>Desempenho</h1><p>Todas as disciplinas do banco sincronizado aparecem aqui, mesmo antes da primeira resposta.</p></div><div className="page-icon"><ChartNoAxesCombined size={28}/></div></div>
 <div className="performance-kpis"><div><ListChecks size={19}/><span>Questões respondidas</span><strong>{total}</strong></div><div><Trophy size={19}/><span>Acertos</span><strong>{correct}</strong></div><div><Target size={19}/><span>Aproveitamento</span><strong>{accuracy}%</strong></div></div>
 <div className="performance-list">{byDiscipline.map(item=><div className="performance-row" key={item.title}><div style={{display:"flex",alignItems:"center",gap:10}}><span className="discipline-choice-icon"><DisciplineIcon name={item.title} size={18}/></span><div><strong>{item.title}</strong><span>{item.total} resposta(s) · {item.bank} questões no banco</span></div></div><div className="performance-bar"><span style={{width:`${item.accuracy}%`}}/></div><strong>{item.accuracy}%</strong></div>)}</div>
 </section>;
}
