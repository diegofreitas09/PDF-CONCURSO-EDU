import{jsPDF}from"jspdf";

export const OMR={questions:80,choices:4,cols:4,rows:20};
export function generateAnswerSheetPdf({title="SEDUC/CE 2026 — PROFESSOR",subtitle="PDF CONCURSO EDU",questions=80}={}){
 const doc=new jsPDF({unit:"mm",format:"a4"}),letters=["A","B","C","D"],colX=[18,67,116,165],startY=67,rowH=9.6;
 doc.setDrawColor(0);doc.setTextColor(0);doc.setLineWidth(.25);
 [[7,7],[199,7],[7,286],[199,286]].forEach(([x,y])=>doc.rect(x,y,4,4,"F"));
 doc.setFont("helvetica","bold");doc.setFontSize(16);doc.text(subtitle,105,15,{align:"center"});
 doc.setFontSize(11);doc.text(title,105,22,{align:"center",maxWidth:170});
 doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.text("CARTÃO-RESPOSTA · DOCUMENTO DE CORREÇÃO",105,28,{align:"center"});
 doc.line(15,32,195,32);
 doc.setFontSize(8);doc.text("NOME DO CANDIDATO",15,39);doc.line(15,46,128,46);doc.text("DATA",137,39);doc.line(137,46,164,46);doc.text("ASSINATURA",171,39);doc.line(171,46,195,46);
 doc.setFont("helvetica","bold");doc.setFontSize(7.5);doc.text("INSTRUÇÕES DE PREENCHIMENTO",15,53);
 doc.setFont("helvetica","normal");doc.setFontSize(6.8);doc.text("Use caneta azul ou preta. Preencha totalmente apenas uma bolha por questão. Não rasure, dobre, molhe ou recorte esta folha.",15,58,{maxWidth:180});
 // Exemplo visual de marcação correta/incorreta.
 doc.setFontSize(6.5);doc.text("CORRETO",151,53);doc.circle(166,51.8,2.1);doc.circle(166,51.8,1.45,"F");doc.text("INCORRETO",174,53);doc.circle(191,51.8,2.1);doc.line(189.5,50.3,192.5,53.3);doc.line(192.5,50.3,189.5,53.3);
 doc.line(15,62,195,62);
 for(let c=0;c<4;c++){
  doc.setFont("helvetica","bold");doc.setFontSize(6.8);letters.forEach((l,i)=>doc.text(l,colX[c]+15+i*7.1,startY-4,{align:"center"}));
  for(let r=0;r<20;r++){
   const n=c*20+r+1;if(n>questions)continue;const y=startY+r*rowH;
   doc.setFont("helvetica","bold");doc.setFontSize(6.8);doc.text(String(n).padStart(2,"0"),colX[c],y+.9);
   letters.forEach((l,i)=>{const x=colX[c]+15+i*7.1;doc.circle(x,y,2.3);doc.setFont("helvetica","normal");doc.setFontSize(5.2);doc.text(l,x,y+.85,{align:"center"})});
  }
 }
 doc.line(15,264,195,264);doc.setFont("helvetica","bold");doc.setFontSize(6.7);doc.text("ATENÇÃO",15,270);doc.setFont("helvetica","normal");doc.text("A correção considera somente uma alternativa por questão. Marcações múltiplas devem ser conferidas antes do envio da imagem.",30,270,{maxWidth:165});
 doc.setFontSize(6.2);doc.text("Não escreva nem cubra os quatro marcadores pretos dos cantos: eles auxiliam a leitura digital do cartão-resposta.",105,278,{align:"center",maxWidth:180});
 doc.setFont("helvetica","bold");doc.setFontSize(6);doc.text("PDF CONCURSO EDU · CARTÃO-RESPOSTA PADRONIZADO",105,287,{align:"center"});
 doc.save("Cartao_Resposta_SEDUC_2026.pdf");
}
function gray(data,i){return(data[i]+data[i+1]+data[i+2])/3}
export async function readAnswerSheetImage(file,{questions=80}={}){const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas"),max=1400,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const img=ctx.getImageData(0,0,canvas.width,canvas.height),W=canvas.width,H=canvas.height;
 // Geometria relativa sincronizada com o cartão padronizado. A conferência humana continua obrigatória antes de aplicar a leitura.
 const colCenters=[.157,.390,.624,.857],letterOffsets=[-.050,-.017,.017,.050],top=.2255,row=.03235;const answers=[];
 for(let q=0;q<questions;q++){const c=Math.floor(q/20),r=q%20,cy=(top+r*row)*H;const scores=[];for(let a=0;a<4;a++){const cx=(colCenters[c]+letterOffsets[a])*W,rad=Math.max(5,Math.min(W,H)*.008);let dark=0,total=0;for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++){if(x<0||y<0||x>=W||y>=H)continue;const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy>rad*rad*.7)continue;const i=(y*W+x)*4;total++;if(gray(img.data,i)<150)dark++}scores.push(total?dark/total:0)}const ranked=scores.map((s,i)=>({s,i})).sort((a,b)=>b.s-a.s),best=ranked[0],second=ranked[1];let status="blank",selected=null;if(best.s>=.28){if(second.s>=.24&&best.s-second.s<.10)status="multiple";else{status=best.s<.36?"uncertain":"marked";selected=best.i}}answers.push({question:q+1,selected,status,scores})}return{answers,preview:canvas.toDataURL("image/jpeg",.82)}}