import{jsPDF}from"jspdf";

const clean=value=>String(value??"")
 .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"")
 .replace(/\u00ad/g,"")
 .replace(/\s+([,.;:!?])/g,"$1")
 .replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2")
 .replace(/\s{2,}/g," ")
 .trim();
const contextKey=value=>clean(value).toLowerCase().replace(/\s+/g," ").slice(0,1600);
const letter=i=>String.fromCharCode(65+i);

export function generateExamPdf({exam=[],code="",mode="official",official=null}){
 if(!exam.length)throw new Error("Nenhuma questão disponível para gerar a prova.");
 const doc=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
 const pageW=210,margin=16,usable=178,bottom=276;
 let y=16,page=1,currentBlock=null,lastContextKey="";
 const font=(size=9,bold=false)=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(20,20,20)};
 const footer=()=>{font(7,false);doc.setDrawColor(185);doc.line(margin,282,pageW-margin,282);doc.text(`PDF CONCURSO EDU · ${code||"SIMULADO"}`,margin,287);doc.text(`Página ${page}`,pageW-margin,287,{align:"right"})};
 const header=()=>{font(7.4,true);doc.text("SIMULADO PARA CONCURSO PÚBLICO",margin,10);font(7,false);doc.text(code||"",pageW-margin,10,{align:"right"});doc.setDrawColor(175);doc.line(margin,12,pageW-margin,12)};
 const newPage=(continuation="")=>{footer();doc.addPage();page++;y=18;header();if(continuation){font(7.2,true);doc.text(`${continuation} (continuação)`,margin,y);y+=5}};
 const ensure=h=>{if(y+h>bottom)newPage()};
 const flow=(value,{size=8.8,bold=false,space=2.5,width=usable,x=margin,justify=true,continuation=""}={})=>{const t=clean(value);if(!t)return;doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(20,20,20);const lines=doc.splitTextToSize(t,width),lh=size*.39+1.05;lines.forEach((line,i)=>{if(y+lh>bottom)newPage(continuation);const last=i===lines.length-1;doc.text(String(line),x,y,justify&&!last?{align:"justify",maxWidth:width}:{align:"left"});y+=lh});y+=space};
 const rule=()=>{ensure(5);doc.setDrawColor(215);doc.line(margin,y,pageW-margin,y);y+=4};
 const section=label=>{ensure(15);doc.setFillColor(239,241,244);doc.rect(margin,y,usable,10,"F");font(9,true);doc.text(clean(label).toUpperCase(),margin+4,y+6.5);y+=14;lastContextKey=""};
 const renderTable=m=>{const headers=m.headers||[],rows=m.rows||[];if(!headers.length)return;const cols=headers.length,cw=usable/cols,rowH=8,totalH=8+rows.length*rowH+9;ensure(Math.min(totalH,45));font(8,true);if(m.title){flow(m.title,{size:8.2,bold:true,justify:false,space:2})}const drawRow=(cells,isHead=false)=>{if(y+rowH>bottom)newPage("Tabela");cells.forEach((cell,c)=>{if(isHead)doc.setFillColor(238,240,243),doc.rect(margin+c*cw,y,cw,rowH,"FD");else doc.rect(margin+c*cw,y,cw,rowH);font(7.2,isHead);const lines=doc.splitTextToSize(clean(cell),cw-4).slice(0,2);doc.text(lines,margin+c*cw+2,y+4.7)});y+=rowH};drawRow(headers,true);rows.forEach(r=>drawRow(r,false));if(m.caption)flow(m.caption,{size:6.8,justify:false,space:2});y+=2};
 const renderBar=m=>{const data=(m.data||[]).filter(d=>Number.isFinite(Number(d.value)));if(!data.length)return;const h=48;ensure(h+12);if(m.title)flow(m.title,{size:8.2,bold:true,justify:false,space:2});const x0=margin+12,w=usable-20,base=y+37,max=Math.max(...data.map(d=>Number(d.value)),1),gap=w/data.length,bw=Math.min(20,gap*.55);doc.setDrawColor(90);doc.line(x0,y+2,x0,base);doc.line(x0,base,x0+w,base);data.forEach((d,i)=>{const v=Number(d.value),bh=32*v/max,x=x0+i*gap+(gap-bw)/2;doc.setFillColor(90,98,108);doc.rect(x,base-bh,bw,bh,"F");font(6.8,true);doc.text(String(d.displayValue??d.value),x+bw/2,base-bh-1.5,{align:"center"});font(6.5,false);doc.text(clean(d.label),x+bw/2,base+4,{align:"center",maxWidth:gap-2})});y=base+8;if(m.caption)flow(m.caption,{size:6.8,justify:false,space:2});y+=2};
 const renderMedia=m=>{if(!m)return;if(m.type==="table")renderTable(m);else if(m.type==="bar-chart"||m.type==="bar")renderBar(m);else if(m.type==="statements"||m.type==="key"){ensure(18);doc.setDrawColor(180);doc.rect(margin,y,usable,6+(m.items||m.statements||[]).length*6);y+=5;(m.items||m.statements||[]).forEach((s,i)=>flow(`${i+1}. ${s}`,{size:7.6,width:usable-8,x:margin+4,justify:true,space:1}));y+=3}else if(m.type==="flow"){const items=m.items||m.steps||[];items.forEach((s,i)=>{ensure(12);doc.setDrawColor(160);doc.roundedRect(margin+15,y,usable-30,9,1,1);font(7.5,true);doc.text(clean(s.label||s),105,y+5.8,{align:"center",maxWidth:usable-36});y+=12;if(i<items.length-1){doc.line(105,y-3,105,y);y+=2}})}};

 // CAPA
 doc.setFillColor(26,36,50);doc.rect(0,0,pageW,34,"F");doc.setTextColor(255);doc.setFont("helvetica","bold");doc.setFontSize(19);doc.text("PDF CONCURSO EDU",105,14,{align:"center"});doc.setFontSize(11);doc.text("CADERNO DE PROVA · SIMULADO",105,23,{align:"center"});doc.setFontSize(8);doc.text("Modelo padronizado para treinamento de concurso público",105,29,{align:"center"});
 y=44;font(12,true);doc.text(mode==="official"?(official?.title||"SIMULADO OFICIAL"):"SIMULADO PERSONALIZADO",105,y,{align:"center"});y+=7;font(9,false);doc.text(official?.edital||"",105,y,{align:"center"});y+=8;
 doc.setDrawColor(120);doc.rect(margin,y,usable,24);font(8.8,true);doc.text(`CÓDIGO DA PROVA: ${code}`,margin+5,y+7);font(8.1,false);doc.text("Nome: ______________________________________________",margin+5,y+14);doc.text("Assinatura: _________________________________________",margin+5,y+20);doc.text("Data: ____/____/______",pageW-margin-5,y+14,{align:"right"});y+=31;
 flow("INSTRUÇÕES PARA A REALIZAÇÃO DA PROVA",{size:11,bold:true,justify:false,space:4});
 const instructions=[`Este caderno contém ${exam.length} questões objetivas, com quatro alternativas (A, B, C e D) e uma única resposta correta.`,`Confira a numeração e a integridade gráfica do caderno antes de iniciar.`,`Transfira suas respostas para o cartão-resposta e marque somente uma alternativa por questão.`,`Tempo configurado para esta simulação: ${official?.duration||"conforme planejamento do candidato"}.`,`O código deste caderno deve coincidir com o código do cartão-resposta.`,`Reserve os minutos finais para a conferência das marcações.`];
 instructions.forEach((t,i)=>flow(`${i+1}. ${t}`,{size:8.5,justify:true,space:1.6}));
 if(mode==="official"&&official?.blocks?.length){y+=2;flow("DISTRIBUIÇÃO DAS QUESTÕES",{size:10.2,bold:true,justify:false,space:3});official.blocks.forEach((b,i)=>{ensure(8);if(i%2===0){doc.setFillColor(247,248,249);doc.rect(margin,y-4.5,usable,7,"F")}font(7.7,false);doc.text(clean(b.label),margin+3,y);doc.text(`${b.count} questões`,pageW-margin-31,y,{align:"right"});doc.text(`mín. ${b.min}`,pageW-margin-3,y,{align:"right"});y+=7});flow(`P1: mínimo ${official.p1Min}/30 · P2: mínimo ${official.p2Min}/50 · Total: mínimo ${official.totalMin}/80`,{size:8.1,bold:true,justify:false,space:2})}
 footer();doc.addPage();page++;y=18;header();

 exam.forEach((q,i)=>{
  const block=q.officialLabel||q.discipline||"Questões";
  if(block!==currentBlock){section(block);currentBlock=block}
  const ctx=clean(q.context),key=contextKey(ctx);
  if(ctx&&key!==lastContextKey){ensure(14);font(8,true);doc.text("TEXTO-BASE",margin,y);y+=4.5;flow(ctx,{size:8.25,justify:true,space:4,continuation:"TEXTO-BASE"});lastContextKey=key}
  if(q.media)renderMedia(q.media);
  ensure(24);font(9.4,true);doc.text(`${String(i+1).padStart(2,"0")}.`,margin,y);const qx=margin+9;
  flow(q.originalStatement||q.statement,{size:9.05,width:usable-9,x:qx,justify:true,space:2});
  (q.options||[]).slice(0,4).forEach((o,oi)=>flow(`${letter(oi)}) ${o}`,{size:8.7,width:usable-9,x:qx,justify:true,space:1.2}));
  y+=2;rule();
 });
 footer();doc.save(`Prova_${code||"Simulado"}.pdf`);
}
