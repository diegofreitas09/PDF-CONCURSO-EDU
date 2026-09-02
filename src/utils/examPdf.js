import{jsPDF}from"jspdf";

const clean=value=>String(value??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"").replace(/\u00ad/g,"").replace(/\s+([,.;:!?])/g,"$1").replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2").replace(/\s{2,}/g," ").trim();
const contextKey=value=>clean(value).toLowerCase().replace(/\s+/g," ").slice(0,1600);
const letter=i=>String.fromCharCode(65+i);
export function generateExamPdf({exam=[],code="",mode="official",official=null,paperType=1}){
 if(!exam.length)throw new Error("Nenhuma questão disponível para gerar a prova.");
 const type=Math.min(4,Math.max(1,Number(paperType)||1)),doc=new jsPDF({unit:"mm",format:"a4"}),W=210,M=16,U=178,TOP=18,BOT=277;
 let y=TOP,page=1,currentBlock=null,lastContext="";
 const font=(s=9,b=false)=>{doc.setFont("helvetica",b?"bold":"normal");doc.setFontSize(s);doc.setTextColor(20)};
 const header=()=>{font(7.2,true);doc.text("SIMULADO PARA CONCURSO PÚBLICO",M,10);font(6.8,false);doc.text(`${code} · TIPO ${type}`,W-M,10,{align:"right"});doc.setDrawColor(190);doc.line(M,12,W-M,12)};
 const footer=()=>{font(6.5,false);doc.setDrawColor(205);doc.line(M,282,W-M,282);doc.text(`PDF CONCURSO EDU · ${code||"SIMULADO"} · TIPO ${type}`,M,287);doc.text(`Página ${page}`,W-M,287,{align:"right"})};
 const next=()=>{footer();doc.addPage();page++;y=TOP;header()};
 const ensure=h=>{if(y+h>BOT)next()};
 const lines=(text,size,width)=>{doc.setFontSize(size);return doc.splitTextToSize(clean(text),width)};
 const write=(text,{size=8.7,bold=false,width=U,x=M,space=2,justify=false}={})=>{const ls=lines(text,size,width),lh=size*.38+1;ls.forEach((ln,i)=>{if(y+lh>BOT)next();font(size,bold);doc.text(ln,x,y,justify&&i<ls.length-1?{align:"justify",maxWidth:width}:undefined);y+=lh});y+=space};
 const section=label=>{ensure(14);doc.setFillColor(239,241,244);doc.rect(M,y,U,9,"F");font(8.8,true);doc.text(clean(label).toUpperCase(),M+4,y+6);y+=13;lastContext=""};
 const renderTable=m=>{if(!m?.headers?.length)return;const cols=m.headers.length,cw=U/cols,rh=9;if(m.title)write(m.title,{size:8,bold:true,space:2});const row=(cells,head=false)=>{ensure(rh+2);cells.forEach((v,c)=>{if(head){doc.setFillColor(240);doc.rect(M+c*cw,y,cw,rh,"FD")}else doc.rect(M+c*cw,y,cw,rh);font(6.8,head);doc.text(lines(v,6.8,cw-4).slice(0,2),M+c*cw+2,y+4)});y+=rh};row(m.headers,true);(m.rows||[]).forEach(r=>row(r));y+=3};
 const renderBar=m=>{const d=(m.data||[]).filter(a=>Number.isFinite(+a.value));if(!d.length)return;ensure(55);if(m.title)write(m.title,{size:8,bold:true});const x0=M+12,w=U-20,base=y+34,max=Math.max(...d.map(a=>+a.value),1),gap=w/d.length,bw=Math.min(18,gap*.55);doc.line(x0,y,x0,base);doc.line(x0,base,x0+w,base);d.forEach((a,i)=>{const bh=29*(+a.value/max),x=x0+i*gap+(gap-bw)/2;doc.setFillColor(90);doc.rect(x,base-bh,bw,bh,"F");font(6.4,true);doc.text(String(a.displayValue??a.value),x+bw/2,base-bh-1,{align:"center"});font(6,false);doc.text(clean(a.label),x+bw/2,base+4,{align:"center",maxWidth:gap-2})});y=base+9};
 const media=m=>{if(!m)return;if(m.type==="table")renderTable(m);else if(m.type==="bar-chart"||m.type==="bar")renderBar(m);else if(m.type==="statements"||m.type==="key")(m.items||m.statements||[]).forEach((s,i)=>write(`${i+1}. ${s}`,{size:7.5,x:M+4,width:U-8,space:1}));};
 // capa
 doc.setFillColor(26,36,50);doc.rect(0,0,W,30,"F");doc.setTextColor(255);doc.setFont("helvetica","bold");doc.setFontSize(18);doc.text("PDF CONCURSO EDU",105,12,{align:"center"});doc.setFontSize(10.5);doc.text("CADERNO DE PROVA · SIMULADO",105,20,{align:"center"});doc.setFontSize(8);doc.text(`PROVA TIPO ${type}`,105,26,{align:"center"});
 y=40;font(12,true);doc.text(mode==="official"?(official?.title||"SIMULADO OFICIAL"):"SIMULADO PERSONALIZADO",105,y,{align:"center"});y+=7;font(8,false);doc.text(official?.edital||"",105,y,{align:"center"});y+=7;doc.setDrawColor(120);doc.rect(M,y,U,31);font(8,true);doc.text(`TIPO ${type}`,M+5,y+7);doc.text(`CÓDIGO ${code}`,W-M-5,y+7,{align:"right"});font(7.8,false);doc.text("Nome: ______________________________________________",M+5,y+15);doc.text("Assinatura: __________________________________________",M+5,y+22);doc.text(`Duração: ${official?.duration||"—"}`,W-M-5,y+15,{align:"right"});doc.text("Data: ____/____/______",W-M-5,y+22,{align:"right"});y+=39;
 write("INSTRUÇÕES",{size:10.5,bold:true,space:3});[`Este caderno contém ${exam.length} questões objetivas, com quatro alternativas e uma única resposta correta.`,`Confira o tipo e o código do caderno antes de iniciar.`,`Verifique a integridade das páginas, textos, tabelas e gráficos.`,`Marque somente uma alternativa por questão no cartão-resposta.`,`Tempo previsto: ${official?.duration||"conforme planejamento"}.`].forEach((t,i)=>write(`${i+1}. ${t}`,{size:8.2,space:1}));
 if(mode==="official"&&official?.blocks){y+=3;write("DISTRIBUIÇÃO DAS QUESTÕES",{size:9.5,bold:true});official.blocks.forEach(b=>{ensure(7);font(7.4);doc.text(clean(b.label),M+3,y);doc.text(String(b.count),W-M-3,y,{align:"right"});y+=6})}
 footer();doc.addPage();page++;y=TOP;header();
 exam.forEach((q,i)=>{
  const block=q.officialLabel||q.discipline||"Questões";if(block!==currentBlock){section(block);currentBlock=block}
  const ctx=clean(q.context),ck=contextKey(ctx);if(ctx&&ck!==lastContext){ensure(18);font(7.5,true);doc.text("TEXTO-BASE",M,y);y+=5;write(ctx,{size:7.8,space:5,justify:false});lastContext=ck}
  media(q.media);
  const statement=clean(q.originalStatement||q.statement),opts=(q.options||[]).slice(0,4);
  // nunca deixa só o número/enunciado no fim da página; reserva espaço para enunciado + primeira alternativa
  const stLines=lines(statement,8.65,U-10),firstLines=lines(opts[0]||"",8.2,U-10),needed=Math.min(48,7+stLines.length*4.3+Math.max(1,firstLines.length)*4+5);ensure(needed);
  font(8.8,true);doc.text(`${String(i+1).padStart(2,"0")}.`,M,y);const x=M+9;write(statement,{size:8.65,width:U-9,x,space:2,justify:false});
  opts.forEach((o,oi)=>write(`${letter(oi)}) ${o}`,{size:8.2,width:U-9,x,space:1.2,justify:false}));y+=2;ensure(4);doc.setDrawColor(220);doc.line(M,y,W-M,y);y+=5;
 });
 footer();doc.save(`Prova_${code||"Simulado"}_Tipo_${type}.pdf`);
}
