import{jsPDF}from"jspdf";

export const OMR={questions:80,choices:4,cols:4,rows:20};
export function generateAnswerSheetPdf({title="SEDUC/CE 2026 — PROFESSOR",subtitle="PDF CONCURSO EDU",questions=80,code="",paperType=1}={}){
 const doc=new jsPDF({unit:"mm",format:"a4"}),letters=["A","B","C","D"],colX=[18,67,116,165],startY=70,rowH=9.35,type=Math.min(4,Math.max(1,Number(paperType)||1));
 doc.setDrawColor(0);doc.setTextColor(0);doc.setLineWidth(.25);
 [[7,7],[199,7],[7,286],[199,286]].forEach(([x,y])=>doc.rect(x,y,4,4,"F"));
 doc.setFont("helvetica","bold");doc.setFontSize(16);doc.text(subtitle,105,15,{align:"center"});
 doc.setFontSize(11);doc.text(title,105,22,{align:"center",maxWidth:170});
 doc.setFont("helvetica","normal");doc.setFontSize(7.5);doc.text("CARTÃO-RESPOSTA · DOCUMENTO DE CORREÇÃO",105,28,{align:"center"});
 doc.line(15,32,195,32);
 doc.setFont("helvetica","bold");doc.setFontSize(8.2);doc.text(`PROVA TIPO ${type}`,15,38);doc.text(`CÓDIGO: ${code||"________________"}`,70,38);doc.text("DATA: ____/____/______",195,38,{align:"right"});
 doc.setFont("helvetica","normal");doc.setFontSize(7.8);doc.text("NOME DO CANDIDATO",15,45);doc.line(15,51,129,51);doc.text("ASSINATURA",137,45);doc.line(137,51,195,51);
 doc.setFont("helvetica","bold");doc.setFontSize(7.2);doc.text("INSTRUÇÕES",15,57);
 doc.setFont("helvetica","normal");doc.setFontSize(6.7);doc.text("Confira o TIPO DA PROVA e o CÓDIGO antes de preencher. Use caneta azul ou preta e marque totalmente apenas uma bolha por questão.",15,62,{maxWidth:178});
 doc.setFontSize(6.4);doc.text("CORRETO",151,57);doc.circle(166,55.8,2.1);doc.circle(166,55.8,1.45,"F");doc.text("INCORRETO",174,57);doc.circle(191,55.8,2.1);doc.line(189.5,54.3,192.5,57.3);doc.line(192.5,54.3,189.5,57.3);
 doc.line(15,66,195,66);
 for(let c=0;c<4;c++){
  doc.setFont("helvetica","bold");doc.setFontSize(6.8);letters.forEach((l,i)=>doc.text(l,colX[c]+15+i*7.1,startY-4,{align:"center"}));
  for(let r=0;r<20;r++){
   const n=c*20+r+1;if(n>questions)continue;const y=startY+r*rowH;
   doc.setFont("helvetica","bold");doc.setFontSize(6.8);doc.text(String(n).padStart(2,"0"),colX[c],y+.9);
   letters.forEach((l,i)=>{const x=colX[c]+15+i*7.1;doc.circle(x,y,2.3);doc.setFont("helvetica","normal");doc.setFontSize(5.2);doc.text(l,x,y+.85,{align:"center"})});
  }
 }
 doc.line(15,262,195,262);doc.setFont("helvetica","bold");doc.setFontSize(6.7);doc.text("ATENÇÃO",15,268);doc.setFont("helvetica","normal");doc.text("A correção depende do tipo de prova informado. Marcações múltiplas, rasuras ou tipo incorreto podem alterar o resultado.",30,268,{maxWidth:165});
 doc.setFontSize(6.1);doc.text("Não cubra os quatro marcadores pretos dos cantos: eles auxiliam a leitura digital do cartão-resposta.",105,276,{align:"center",maxWidth:180});
 doc.setFont("helvetica","bold");doc.setFontSize(6);doc.text(`PDF CONCURSO EDU · PROVA TIPO ${type} · ${code||"SEM CÓDIGO"}`,105,287,{align:"center"});
 doc.save(`Cartao_Resposta_${code||"SEDUC_2026"}_Tipo_${type}.pdf`);
}
function gray(data,i){return(data[i]+data[i+1]+data[i+2])/3}
export async function readAnswerSheetImage(file,{questions=80}={}){const bitmap=await createImageBitmap(file);const canvas=document.createElement("canvas"),max=1400,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height));canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);const ctx=canvas.getContext("2d",{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);const img=ctx.getImageData(0,0,canvas.width,canvas.height),W=canvas.width,H=canvas.height;
 const colCenters=[.157,.390,.624,.857],letterOffsets=[-.050,-.017,.017,.050],top=.2357,row=.03148;const answers=[];
 for(let q=0;q<questions;q++){const c=Math.floor(q/20),r=q%20,cy=(top+r*row)*H;const scores=[];for(let a=0;a<4;a++){const cx=(colCenters[c]+letterOffsets[a])*W,rad=Math.max(5,Math.min(W,H)*.008);let dark=0,total=0;for(let y=Math.floor(cy-rad);y<=cy+rad;y++)for(let x=Math.floor(cx-rad);x<=cx+rad;x++){if(x<0||y<0||x>=W||y>=H)continue;const dx=x-cx,dy=y-cy;if(dx*dx+dy*dy>rad*rad*.7)continue;const i=(y*W+x)*4;total++;if(gray(img.data,i)<150)dark++}scores.push(total?dark/total:0)}const ranked=scores.map((s,i)=>({s,i})).sort((a,b)=>b.s-a.s),best=ranked[0],second=ranked[1];let status="blank",selected=null;if(best.s>=.28){if(second.s>=.24&&best.s-second.s<.10)status="multiple";else{status=best.s<.36?"uncertain":"marked";selected=best.i}}answers.push({question:q+1,selected,status,scores})}return{answers,preview:canvas.toDataURL("image/jpeg",.82)}}