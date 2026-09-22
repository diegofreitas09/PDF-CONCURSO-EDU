import React, { useEffect, useMemo, useState } from "react";
import { Search, Bell, Wifi, WifiOff, X, CalendarRange, ListChecks, BookOpenText, ChartNoAxesCombined, LogOut, Sun, Moon, ArrowLeft } from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { resolveQuestionSearch, savePlatformSelection } from "../utils/platformCatalog";
import "../styles/theme.css";

const STORAGE_KEY = "pdf-concurso-edu-state-v1";
const THEME_KEY = "pdf-concurso-edu-theme";
function readState(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}catch{return {}}}
function readTheme(){const saved=localStorage.getItem(THEME_KEY);if(saved==="dark"||saved==="light")return saved;return window.matchMedia?.("(prefers-color-scheme: dark)").matches?"dark":"light"}

export default function Header(){
 const navigate=useNavigate(); const location=useLocation(); const {user,logout}=useAuth();
 const [online,setOnline]=useState(()=>navigator.onLine); const [notificationsOpen,setNotificationsOpen]=useState(false); const [search,setSearch]=useState(""); const [platformState,setPlatformState]=useState(readState); const [theme,setTheme]=useState(readTheme);
 const isDashboard=location.pathname==="/"||location.pathname==="/dashboard";
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme)},[theme]);
 useEffect(()=>{const key=e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();document.querySelector("[data-global-search]")?.focus()}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[]);
 useEffect(()=>{const on=()=>setOnline(true),off=()=>setOnline(false),sync=()=>setPlatformState(readState());window.addEventListener("online",on);window.addEventListener("offline",off);window.addEventListener("storage",sync);window.addEventListener("pdfedu-state",sync);return()=>{window.removeEventListener("online",on);window.removeEventListener("offline",off);window.removeEventListener("storage",sync);window.removeEventListener("pdfedu-state",sync)}},[]);
 const notifications=useMemo(()=>{const items=[];const pending=(platformState.schedule||[]).filter(i=>!i.done).length,answers=(platformState.answers||[]).length,completed=(platformState.completedTopics||[]).length;if(pending)items.push({icon:CalendarRange,title:`${pending} estudo${pending>1?"s":""} pendente${pending>1?"s":""}`,text:"Abra o cronograma para continuar sua rotina.",route:"/cronograma"});if(answers)items.push({icon:ChartNoAxesCombined,title:`${answers} questão${answers>1?"ões":""} respondida${answers>1?"s":""}`,text:"Confira seus acertos e pontos de atenção.",route:"/desempenho"});if(completed)items.push({icon:BookOpenText,title:`${completed} tópico${completed>1?"s":""} concluído${completed>1?"s":""}`,text:"Continue avançando na sua trilha de estudos.",route:"/estudos"});if(!items.length)items.push({icon:ListChecks,title:"Comece sua preparação",text:"Resolva questões ou abra uma trilha de estudos.",route:"/questoes"});return items},[platformState]);
 function goBack(){if(window.history.length>1)navigate(-1);else navigate("/dashboard")}
 function runSearch(){const raw=search.trim(),termo=raw.toLowerCase();if(!termo)return;const match=resolveQuestionSearch(raw);if(match){savePlatformSelection(match.discipline,match.topic);return navigate(match.route)}if(termo.includes("quest")||termo.includes("prova")||termo.includes("simulado"))return navigate("/questoes");if(termo.includes("cronograma")||termo.includes("agenda")||termo.includes("planejamento"))return navigate("/cronograma");if(termo.includes("flash"))return navigate("/flashcards");if(termo.includes("mapa"))return navigate("/mapas-mentais");if(termo.includes("desempenho")||termo.includes("acerto")||termo.includes("erro"))return navigate("/desempenho");if(termo.includes("config"))return navigate("/configuracoes");return navigate(`/biblioteca?busca=${encodeURIComponent(raw)}`)}
 async function handleLogout(){await logout();navigate("/login",{replace:true})}
 return <header className="top-header">
   <div className="header-left-zone">
    {!isDashboard&&<button type="button" className="back-button" onClick={goBack} aria-label="Voltar" title="Voltar"><ArrowLeft size={20}/><span>Voltar</span></button>}
    <div className="search-box"><button type="button" className="search-trigger" onClick={runSearch} aria-label="Buscar"><Search size={19}/></button><input data-global-search value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&runSearch()} placeholder="Buscar disciplina, assunto ou material..."/><span className="search-shortcut">Ctrl + K</span>{search&&<button type="button" className="search-clear" onClick={()=>setSearch("")}><X size={16}/></button>}</div>
   </div>
   <div className="header-actions"><div className="theme-switch"><button type="button" className={theme==="light"?"active":""} onClick={()=>setTheme("light")}><Sun size={15}/><span>Dia</span></button><button type="button" className={theme==="dark"?"active":""} onClick={()=>setTheme("dark")}><Moon size={15}/><span>Noite</span></button></div><button type="button" className={`api-status ${online?"online":"offline"}`} onClick={()=>setOnline(navigator.onLine)}>{online?<Wifi size={16}/>:<WifiOff size={16}/>}<span>{online?"Plataforma online":"Sem conexão"}</span></button><button type="button" className="icon-button" onClick={()=>setNotificationsOpen(o=>!o)}><Bell size={20}/>{notifications.length>0&&<span className="notification-dot"/>}</button><button type="button" className="icon-button" onClick={handleLogout} title={`Sair${user?.email?` — ${user.email}`:""}`}><LogOut size={20}/></button></div>
   {notificationsOpen&&<div className="notification-panel"><div className="notification-header"><strong>Notificações</strong><button type="button" onClick={()=>setNotificationsOpen(false)}><X size={16}/></button></div><div className="notification-list">{notifications.map(({icon:Icon,title,text,route})=><button type="button" className="notification-item" key={`${title}-${route}`} onClick={()=>{setNotificationsOpen(false);navigate(route)}}><span className="notification-item-icon"><Icon size={18}/></span><span><strong>{title}</strong><small>{text}</small></span></button>)}</div></div>}
 </header>
}
