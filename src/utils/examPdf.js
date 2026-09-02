import{jsPDF}from"jspdf";

const clean=value=>String(value??"")
 .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,"")
 .replace(/\u00ad/g,"")
 .replace(/\s+([,.;:!?])/g,"$1")
 .replace(/([A-Za-zÀ-ÿ])\s+-\s+([A-Za-zÀ-ÿ])/g,"$1-$2")
 .replace(/\s{2,}/g," ")
 .trim();
const contextKey=value=>clean(value).toLowerCase().replace(/\s+/g," ").slice(0,1200);
const letter=i=>String.fromCharCode(65+i);

export function generateExamPdf({exam=[],code="",mode="official",official=null}){
 if(!exam.length)throw new Error("Nenhuma questão disponível para gerar a prova.");
 const doc=new jsPDF({unit:"mm",format:"a4",orientation:"portrait"});
 const pageW=210,pageH=297,margin=16,usable=178,bottom=276;
 let y=16,page=1,currentBlock=null,lastContextKey="";
 const font=(size=9,bold=false)=>{doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(20,20,20)};
 const footer=()=>{font(7.5,false);doc.setDrawColor(185);doc.line(margin,282,pageW-margin,282);doc.text(`PDF CONCURSO EDU · ${code||"SIMULADO"}`,margin,287);doc.text(`Página ${page}`,pageW-margin,287,{align:"right"})};
 const header=()=>{font(7.5,true);doc.text("SIMULADO PARA CONCURSO PÚBLICO",margin,10);font(7.2,false);doc.text(code||"",pageW-margin,10,{align:"right"});doc.setDrawColor(175);doc.line(margin,12,pageW-margin,12)};
 const newPage=(withHeader=true)=>{footer();doc.addPage();page++;y=18;if(withHeader)header()};
 const ensure=h=>{if(y+h>bottom)newPage(true)};
 const write=(value,size=9,bold=false,space=2.5,width=usable,x=margin,align="left")=>{const t=clean(value);if(!t)return;doc.setFont("helvetica",bold?"bold":"normal");doc.setFontSize(size);doc.setTextColor(20,20,20);const lines=doc.splitTextToSize(t,width);const lineH=size*.39+1.05;ensure(lines.length*lineH+space);doc.text(lines,x,y,{align});y+=lines.length*lineH+space};
 const rule=()=>{ensure(5);doc.setDrawColor(210);doc.line(margin,y,pageW-margin,y);y+=4};
 const section=label=>{ensure(14);doc.setFillColor(239,241,244);doc.rect(margin,y,usable,10,"F");font(9.2,true);doc.text(clean(label).toUpperCase(),margin+4,y+6.5);y+=14;lastContextKey=""};

 // CAPA
 doc.setFillColor(26,36,50);doc.rect(0,0,pageW,34,"F");doc.setTextColor(255);doc.setFont("helvetica","bold");doc.setFontSize(19);doc.text("PDF CONCURSO EDU",105,14,{align:"center"});doc.setFontSize(11);doc.text("CADERNO DE PROVA · SIMULADO",105,23,{align:"center"});doc.setFontSize(8);doc.text(mode==="official"?"Estrutura inspirada no padrão de cadernos de concursos da CEV/UECE":"Simulado personalizado",105,29,{align:"center"});
 y=44;font(12,true);doc.text(mode==="official"?(official?.title||"SIMULADO OFICIAL"):"SIMULADO PERSONALIZADO",105,y,{align:"center"});y+=7;font(9,false);doc.text(official?.edital||"",105,y,{align:"center"});y+=8;
 doc.setDrawColor(120);doc.rect(margin,y,usable,22);font(8.8,true);doc.text(`CÓDIGO DA PROVA: ${code}`,margin+5,y+7);font(8.3,false);doc.text("Nome do candidato: _________________________________________________",margin+5,y+14);doc.text("Data: ____/____/______",pageW-margin-5,y+14,{align:"right"});y+=30;
 write("INSTRUÇÕES PARA A REALIZAÇÃO DA PROVA",11,true,4);
 const instructions=[
  `Este caderno contém ${exam.length} questões objetivas, cada uma com quatro alternativas (A, B, C e D), das quais apenas uma deve ser marcada.`,
  "Antes de iniciar, confira a numeração das questões e a integridade gráfica do caderno.",
  "Use o cartão-resposta como documento principal de marcação. Preencha completamente apenas uma bolha por questão.",
  "Questões com dupla marcação, ausência de marcação ou marcação duvidosa devem ser conferidas antes da correção eletrônica.",
  `Tempo configurado para esta simulação: ${official?.duration||"conforme planejamento do candidato"}.`,
  "O código deste caderno identifica o gabarito correspondente e deve coincidir com o cartão-resposta.",
  "Reserve tempo ao final para revisar suas respostas e conferir o cartão-resposta."
 ];
 instructions.forEach((t,i)=>write(`${i+1}. ${t}`,8.6,false,2.2));
 if(mode==="official"&&official?.blocks?.length){y+=2;write("DISTRIBUIÇÃO DAS QUESTÕES",10.5,true,3);doc.setDrawColor(170);let ty=y;official.blocks.forEach((b,i)=>{ensure(9);if(i%2===0){doc.setFillColor(247,248,249);doc.rect(margin,ty,usable,8,"F")}font(7.8,false);doc.text(clean(b.label),margin+3,ty+5.2);doc.text(String(b.count),pageW-margin-30,ty+5.2,{align:"right"});doc.text(`mín. ${b.min}`,pageW-margin-3,ty+5.2,{align:"right"});ty+=8;y=ty});y+=3;write(`P1: mínimo ${official.p1Min}/30 · P2: mínimo ${official.p2Min}/50 · Total: mínimo ${official.totalMin}/80`,8.3,true,2)}
 footer();

 // QUESTÕES
 doc.addPage();page++;y=18;header();
 exam.forEach((q,i)=>{
  const block=q.officialLabel||q.discipline||"Questões";
  if(block!==currentBlock){section(block);currentBlock=block}
  const ctx=clean(q.context);const key=contextKey(ctx);
  if(ctx&&key!==lastContextKey){
   ensure(18);font(8.2,true);doc.text("TEXTO-BASE",margin,y);y+=4.2;write(ctx,8.4,false,3);lastContextKey=key;
  }
  ensure(22);
  font(9.4,true);doc.text(`${String(i+1).padStart(2,"0")}.`,margin,y);const qx=margin+9;
  const statement=clean(q.originalStatement||q.statement);const stLines=doc.splitTextToSize(statement,usable-9);doc.setFont("helvetica","normal");doc.setFontSize(9.2);doc.text(stLines,qx,y);y+=stLines.length*4.5+2;
  (q.options||[]).slice(0,4).forEach((o,oi)=>{const opt=clean(o);const optLines=doc.splitTextToSize(`${letter(oi)}) ${opt}`,usable-9);ensure(optLines.length*4.25+1.8);doc.setFont("helvetica","normal");doc.setFontSize(8.9);doc.text(optLines,qx,y);y+=optLines.length*4.25+1.4});
  y+=2.5;rule();
 });
 footer();
 doc.save(`Prova_${code||"Simulado"}.pdf`);
}
