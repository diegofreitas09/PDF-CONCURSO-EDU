import{jsPDF}from"jspdf";

const clean=value=>String(value??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").replace(/\u00ad/g,"").replace(/\s+([,.;:!?])/g,"$1").replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2").replace(/\s{2,}/g," ").trim();
const contextKey=value=>clean(value).toLowerCase().replace(/[^a-zà-ÿ0-9]+/gi," ").replace(/\s+/g," ").trim();
const letter=i=>String.fromCharCode(65+i);
export function generateExamPdf({exam=[],code="",mode="official",official=null,paperType=1}){
 if(!exam.length)throw new Error("Nenhuma questão disponível para gerar a prova.");
 const type=Math.min(4,Math.max(1,Number(paperType)||1)),doc=new jsPDF({unit:"mm",format:"a4"}),W=210,M=18,U=174,TOP=18,BOT=276;
 let y=TOP,page=1,currentBlock=null,lastContext="";
 const font=(s=9,b=false)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(s);doc.setTextColor(25)};
 const header=()=>{font(7.2,true);doc.text("SIMULADO PARA CONCURSO PÚBLICO",M,10);font(6.8,false);doc.text(`${code} · TIPO ${type}`,W-M,10,{align:"right"});doc.setDrawColor(190);doc.line(M,12,W-M,12)};
 const footer=()=>{font(6.5,false);doc.setDrawColor(205);doc.line(M,282,W-M,282);doc.text(`PDF CONCURSO EDU · ${code||"SIMULADO"} · TIPO ${type}`,M,287);doc.text(`Página ${page}`,W-M,287,{align:"right"})};
 const next=()=>{footer();doc.addPage();page++;y=TOP;header()};
 const ensure=h=>{if(y+h>BOT)next()};
 const lines=(text,size,width)=>{doc.setFontSize(size);return doc.splitTextToSize(clean(text),width)};
 const measure=(text,size,width,lh)=>Math.max(1,lines(text,size,width).length)*lh;
 const write=(text,{size=8.8,bold=false,width=U,x=M,space=2,lh=4.15}={})=>{const ls=lines(text,size,width);font(size,bold);ls.forEach(ln=>{if(y+lh>BOT)next();doc.text(ln,x,y);y+=lh});y+=space};
 const section=label=>{ensure(15);doc.setFillColor(239,241,244);doc.rect(M,y,U,9,"F");font(8.7,true);doc.text(clean(label).toUpperCase(),M+4,y+6);y+=14;lastContext=""};
 const renderTable=m=>{if(!m?.headers?.length)return;const cols=m.headers.length,cw=U/cols,rh=9;if(m.title)write(m.title,{size:8.2,bold:true,space:2});const totalH=((m.rows||[]).length+1)*rh+4;ensure(Math.min(totalH,55));const row=(cells,head=false)=>{ensure(rh+1);cells.forEach((v,c)=>{if(head){doc.setFillColor(240);doc.rect(M+c*cw,y,cw,rh,"FD")}else doc.rect(M+c*cw,y,cw,rh);font(6.8,head);doc.text(lines(v,6.8,cw-4).slice(0,2),M+c*cw+2,y+4)});y+=rh};row(m.headers,true);(m.rows||[]).forEach(r=>row(r));y+=4};
 const renderBar=m=>{const d=(m.data||[]).filter(a=>Number.isFinite(+a.value));if(!d.length)return;ensure(58);if(m.title)write(m.title,{size:8.2,bold:true});const x0=M+12,w=U-20,base=y+34,max=Math.max(...d.map(a=>+a.value),1),gap=w/d.length,bw=Math.min(18,gap*.55);doc.setDrawColor(150);doc.line(x0,y,x0,base);doc.line(x0,base,x0+w,base);d.forEach((a,i)=>{const bh=29*(+a.value/max),x=x0+i*gap+(gap-bw)/2;doc.setFillColor(90);doc.rect(x,base-bh,bw,bh,"F");font(6.5,true);doc.text(String(a.displayValue??a.value),x+bw/2,base-bh-1,{align:"center"});font(6.2,false);doc.text(clean(a.label),x+bw/2,base+4,{align:"center",maxWidth:gap-2})});y=base+10};
 const media=m=>{if(!m)return;if(m.type==="table")renderTable(m);else if(m.type==="bar-chart"||m.type==="bar")renderBar(m);else if(m.type==="statements"||m.type==="key")(m.items||m.statements||[]).forEach((s,i)=>write(`${i+1}. ${s}`,{size:8,x:M+5,width:U-5,space:1,lh:3.9}));};
 const contextGroups=new Map();exam.forEach((q,i)=>{const k=contextKey(q.context);if(k){if(!contextGroups.has(k))contextGroups.set(k,[]);contextGroups.get(k).push(i+1)}});
 const contextLabel=k=>{const nums=contextGroups.get(k)||[];if(nums.length>1)return`TEXTO PARA AS QUESTÕES ${nums[0]} A ${nums[nums.length-1]}`;return"TEXTO-BASE"};
 // capa
 doc.setFillColor(26,36,50);doc.rect(0,0,W,30,"F");doc.setTextColor(255);doc.setFont("helvetica","bold");doc.setFontSize(18);doc.text("PDF CONCURSO EDU",105,12,{align:"center"});doc.setFontSize(10.5);doc.text("CADERNO DE PROVA · SIMULADO",105,20,{align:"center"});doc.setFontSize(8);doc.text(`PROVA TIPO ${type}`,105,26,{align:"center"});
 y=40;font(12,true);doc.text(mode==="official"?(official?.title||"SIMULADO OFICIAL"):"SIMULADO PERSONALIZADO",105,y,{align:"center"});y+=7;font(8,false);doc.text(official?.edital||"",105,y,{align:"center"});y+=7;doc.setDrawColor(120);doc.rect(M,y,U,31);font(8,true);doc.text(`TIPO ${type}`,M+5,y+7);doc.text(`CÓDIGO ${code}`,W-M-5,y+7,{align:"right"});font(7.8,false);doc.text("Nome: ______________________________________________",M+5,y+15);doc.text("Assinatura: __________________________________________",M+5,y+22);doc.text(`Duração: ${official?.duration||"—"}`,W-M-5,y+15,{align:"right"});doc.text("Data: ____/____/______",W-M-5,y+22,{align:"right"});y+=39;
 write("INSTRUÇÕES",{size:10.5,bold:true,space:3});[`Este caderno contém ${exam.length} questões objetivas, com quatro alternativas e uma única resposta correta.`,`Confira o tipo e o código do caderno antes de iniciar.`,`Verifique a integridade das páginas, textos, tabelas e gráficos.`,`Marque somente uma alternativa por questão no cartão-resposta.`,`Tempo previsto: ${official?.duration||"conforme planejamento"}.`].forEach((t,i)=>write(`${i+1}. ${t}`,{size:8.2,space:1,lh:3.8}));
 if(mode==="official"&&official?.blocks){y+=3;write("DISTRIBUIÇÃO DAS QUESTÕES",{size:9.5,bold:true});official.blocks.forEach(b=>{ensure(7);font(7.4);doc.text(clean(b.label),M+3,y);doc.text(String(b.count),W-M-3,y,{align:"right"});y+=6})}
 footer();doc.addPage();page++;y=TOP;header();
 exam.forEach((q,i)=>{
  const block=q.officialLabel||q.discipline||"Questões";if(block!==currentBlock){section(block);currentBlock=block}
  const ctx=clean(q.context),ck=contextKey(ctx);
  if(ctx&&ck!==lastContext){const ctxLines=lines(ctx,8.35,U-4),preview=Math.min(ctxLines.length,7)*4.15+13;ensure(preview);font(8.1,true);doc.text(contextLabel(ck),M,y);y+=5.5;write(ctx,{size:8.35,width:U-4,x:M+2,space:5,lh:4.15});lastContext=ck}
  media(q.media);
  const statement=clean(q.originalStatement||q.statement),opts=(q.options||[]).slice(0,4),x=M+9;
  const stH=measure(statement,8.8,U-9,4.25),opHs=opts.map(o=>measure(`${letter(0)}) ${o}`,8.35,U-9,4.05)),questionH=7+stH+opHs.reduce((a,b)=>a+b+1.2,0)+5;
  // Questões que cabem em uma página nunca são divididas. Questões excepcionalmente longas começam em página nova.
  if(questionH<=BOT-TOP){ensure(questionH)}else if(y>TOP+8)next();
  font(8.8,true);doc.text(`${String(i+1).padStart(2,"0")}.`,M,y);write(statement,{size:8.8,width:U-9,x,space:2.4,lh:4.25});
  opts.forEach((o,oi)=>write(`${letter(oi)}) ${o}`,{size:8.35,width:U-9,x,space:1.35,lh:4.05}));
  y+=2;ensure(4);doc.setDrawColor(220);doc.line(M,y,W-M,y);y+=5;
 });
 footer();doc.save(`Prova_${code||"Simulado"}_Tipo_${type}.pdf`);
}
