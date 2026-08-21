import { QUESTION_BANK } from './src/data/questionBank.js';

const state = {
  page: location.hash.replace('#/','') || 'dashboard',
  discipline: '', topic: '', index: 0, selected: null, checked: false,
  answers: JSON.parse(localStorage.getItem('pdf-concurso-answers') || '[]')
};

const root = document.getElementById('root');
const esc = (s='') => String(s).replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m]));
const disciplines = [...new Set(QUESTION_BANK.map(q=>q.discipline).filter(Boolean))].sort();

function save(){ localStorage.setItem('pdf-concurso-answers', JSON.stringify(state.answers)); }
function nav(page){ state.page=page; state.index=0; state.selected=null; state.checked=false; location.hash='#/'+page; render(); }
window.addEventListener('hashchange',()=>{ state.page=location.hash.replace('#/','')||'dashboard'; render(); });

function sidebar(){
  const items=[['dashboard','▦','Dashboard'],['estudos','▤','Estudos'],['questoes','☷','Questões'],['desempenho','▥','Desempenho'],['cronograma','▣','Cronograma'],['biblioteca','▧','Biblioteca'],['flashcards','◈','Flashcards'],['mapas-mentais','⌘','Mapas Mentais']];
  return `<aside class="sidebar"><div class="brand"><img src="./logo-pdf-concurso.png" onerror="this.onerror=null;this.src='./public/logo-pdf-concurso.png'" alt="PDF Concurso EDU"><div><strong>PDF</strong><span>CONCURSO EDU</span></div></div><div class="nav-title">PLATAFORMA</div><nav>${items.map(([p,i,l])=>`<button class="nav ${state.page===p?'active':''}" data-nav="${p}"><b>${i}</b>${l}</button>`).join('')}</nav><div class="nav-title sys">SISTEMA</div><button class="nav ${state.page==='configuracoes'?'active':''}" data-nav="configuracoes"><b>⚙</b>Configurações</button><div class="side-foot">PDF Concurso EDU<br><small>Plataforma de estudos</small></div></aside>`;
}
function header(){ return `<header class="top"><div class="search"><span>⌕</span><input id="globalSearch" placeholder="Buscar questões, temas, conteúdos..."></div><div class="api"><span>⌁</span> Site online</div></header>`; }
function shell(content){ root.innerHTML=`<div class="shell">${sidebar()}<div class="main">${header()}<main>${content}</main></div></div>`; bindCommon(); }
function bindCommon(){
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  const gs=document.getElementById('globalSearch'); if(gs) gs.onkeydown=e=>{ if(e.key==='Enter'&&gs.value.trim()){ state.page='questoes'; location.hash='#/questoes'; state.query=gs.value.trim(); render(); }};
}
function title(eyebrow,h1,p){ return `<div class="eyebrow">${eyebrow}</div><h1>${h1}</h1><p class="lead">${p}</p>`; }
function dashboard(){
  const total=state.answers.length, hits=state.answers.filter(a=>a.correct).length, acc=total?Math.round(hits/total*100):0;
  const counts=disciplines.map(d=>[d,QUESTION_BANK.filter(q=>q.discipline===d).length]).sort((a,b)=>b[1]-a[1]);
  shell(`${title('PAINEL DE ESTUDOS','Olá, Diego!','Continue sua preparação para o seu concurso.')}<button class="primary" data-nav="questoes">▶ Iniciar estudo <span>→</span></button><div class="stats"><div><span>QUESTÕES</span><strong>${QUESTION_BANK.length}</strong><small>Questões disponíveis</small></div><div><span>ACERTOS</span><strong>${hits}</strong><small>${total} respondida(s)</small></div><div><span>APROVEITAMENTO</span><strong>${acc}%</strong><small>Seu desempenho</small></div><div><span>DISCIPLINAS</span><strong>${disciplines.length}</strong><small>Banco organizado</small></div></div><div class="dash-grid"><section class="card big"><div class="eyebrow">CONTINUE ESTUDANDO</div><h2>Banco SEDUC organizado</h2><p>Pratique as questões classificadas por disciplina e assunto.</p><div class="progress-row"><span>Questões disponíveis</span><b>${QUESTION_BANK.length}</b></div><div class="bar"><i style="width:${Math.min(100,total/QUESTION_BANK.length*100)}%"></i></div><button class="secondary" data-nav="questoes">Abrir questões →</button></section><section><div class="eyebrow">BASE PDF CONCURSO EDU</div><h2>Base de conhecimento</h2><div class="knowledge">${counts.slice(0,5).map(([d,c],i)=>`<button onclick="window.openQuestions('${encodeURIComponent(d)}')"><b>0${i+1}</b><span><strong>${esc(d)}</strong><small>${c} questões</small></span><em>→</em></button>`).join('')}</div></section></div>`);
  bindCommon();
}
window.openQuestions=(d)=>{state.discipline=decodeURIComponent(d);state.topic='';state.page='questoes';location.hash='#/questoes';render();};

function estudos(){
  shell(`${title('PREPARAÇÃO','Estudos','Organize sua preparação por disciplinas, conteúdos e trilhas de aprendizagem.')}<div class="study-grid">${disciplines.map(d=>{const qs=QUESTION_BANK.filter(q=>q.discipline===d);const topics=[...new Set(qs.map(q=>q.topic).filter(Boolean))];return `<section class="study card"><h2>${esc(d)}</h2><p>${qs.length} questões em ${topics.length} tópico(s).</p><div class="chips">${topics.slice(0,8).map(t=>`<span>${esc(t)}</span>`).join('')}</div><button class="secondary" onclick="window.openQuestions('${encodeURIComponent(d)}')">Praticar questões →</button></section>`}).join('')}</div>`);
}
function filteredQuestions(){
  const query=(state.query||'').toLowerCase();
  return QUESTION_BANK.filter(q=>(!state.discipline||q.discipline===state.discipline)&&(!state.topic||q.topic===state.topic)&&(!query||`${q.statement} ${q.topic} ${q.discipline}`.toLowerCase().includes(query)));
}
function questoes(){
  const filtered=filteredQuestions(); if(state.index>=filtered.length) state.index=0; const q=filtered[state.index];
  const topics=[...new Set(QUESTION_BANK.filter(x=>!state.discipline||x.discipline===state.discipline).map(x=>x.topic).filter(Boolean))].sort();
  const filters=`<div class="filters"><select id="discipline"><option value="">Todas as disciplinas (${QUESTION_BANK.length})</option>${disciplines.map(d=>`<option ${state.discipline===d?'selected':''} value="${esc(d)}">${esc(d)} (${QUESTION_BANK.filter(q=>q.discipline===d).length})</option>`).join('')}</select><select id="topic"><option value="">Todos os tópicos</option>${topics.map(t=>`<option ${state.topic===t?'selected':''}>${esc(t)}</option>`).join('')}</select><span>${filtered.length} questão(ões)</span></div>`;
  let body='<div class="empty card"><h2>Nenhuma questão encontrada</h2><p>Altere os filtros para continuar.</p></div>';
  if(q){ const letters='ABCDE'; body=`<section class="question card"><div class="qtop"><div><span>${esc(q.discipline)}</span><span>${esc(q.topic)}</span></div><b>${state.index+1}/${filtered.length}</b></div><h2>${esc(q.statement)}</h2><div class="options">${q.options.map((o,i)=>{let cls=state.selected===i?'selected':''; if(state.checked){if(i===q.answer)cls+=' correct';else if(state.selected===i)cls+=' wrong';}return `<button class="option ${cls}" data-opt="${i}"><b>${letters[i]||i+1}</b>${esc(o)}</button>`}).join('')}</div>${state.checked?`<div class="feedback ${state.selected===q.answer?'ok':'bad'}"><strong>${state.selected===q.answer?'Resposta correta!':'Resposta incorreta.'}</strong><span>Gabarito: ${letters[q.answer]||q.answer+1}. ${esc(q.explanation||'')}</span></div>`:''}<div class="qactions"><button class="secondary" id="correctBtn">Corrigir questão</button><button class="primary" id="nextBtn">Próxima →</button></div></section>`; }
  shell(`${title('BANCO DE QUESTÕES','Questões','Filtre, responda e acompanhe seus resultados.')}${filters}${body}<p class="history">Respondidas nesta sessão/histórico: <b>${state.answers.length}</b></p>`);
  document.getElementById('discipline').onchange=e=>{state.discipline=e.target.value;state.topic='';state.index=0;state.selected=null;state.checked=false;state.query='';render();};
  document.getElementById('topic').onchange=e=>{state.topic=e.target.value;state.index=0;state.selected=null;state.checked=false;render();};
  document.querySelectorAll('.option').forEach(b=>b.onclick=()=>{if(!state.checked){state.selected=+b.dataset.opt;render();}});
  const cb=document.getElementById('correctBtn'); if(cb) cb.onclick=()=>{if(state.selected==null)return; if(!state.checked){state.checked=true;state.answers.push({questionId:q.id,correct:state.selected===q.answer,discipline:q.discipline,topic:q.topic,at:new Date().toISOString()});save();render();}};
  const nb=document.getElementById('nextBtn'); if(nb) nb.onclick=()=>{state.index=(state.index+1)%filtered.length;state.selected=null;state.checked=false;render();};
}
function desempenho(){
  const total=state.answers.length,hits=state.answers.filter(a=>a.correct).length,acc=total?Math.round(hits/total*100):0;
  const rows=disciplines.map(d=>{const a=state.answers.filter(x=>x.discipline===d),h=a.filter(x=>x.correct).length,p=a.length?Math.round(h/a.length*100):0;return [d,a.length,p]}).filter(x=>x[1]);
  shell(`${title('ANÁLISE','Desempenho','Acompanhe acertos, erros e pontos que precisam de reforço.')}<div class="kpis"><div><span>Questões respondidas</span><strong>${total}</strong></div><div><span>Acertos</span><strong>${hits}</strong></div><div><span>Aproveitamento</span><strong>${acc}%</strong></div></div><section class="card perf">${rows.length?rows.map(([d,n,p])=>`<div class="perfrow"><span><b>${esc(d)}</b><small>${n} resposta(s)</small></span><div class="bar"><i style="width:${p}%"></i></div><strong>${p}%</strong></div>`).join(''):'<p>Responda questões para visualizar seu desempenho.</p>'}</section>`);
}
function simplePage(name,eyebrow,text){ shell(`${title(eyebrow,name,text)}<section class="card placeholder"><div class="bigicon">✦</div><h2>${name}</h2><p>Área preparada para evolução da plataforma PDF Concurso EDU.</p><button class="secondary" data-nav="questoes">Ir para questões →</button></section>`); }
function render(){
  if(state.page==='dashboard')return dashboard(); if(state.page==='estudos')return estudos(); if(state.page==='questoes')return questoes(); if(state.page==='desempenho')return desempenho();
  const pages={cronograma:['PLANEJAMENTO','Planejamento semanal da sua preparação.'],biblioteca:['BIBLIOTECA','Materiais e fontes de pesquisa.'],flashcards:['REVISÃO','Revise conceitos importantes por recuperação ativa.'],'mapas-mentais':['VISUALIZAÇÃO','Organize conteúdos em mapas mentais.'],configuracoes:['SISTEMA','Preferências e informações da plataforma.']}; const [e,t]=pages[state.page]||['PDF CONCURSO EDU','Plataforma de preparação.']; simplePage(state.page.split('-').map(x=>x[0].toUpperCase()+x.slice(1)).join(' '),e,t);
}
render();
