import{jsPDF}from"jspdf";

function robustDownload(doc,filename){
 const safe=String(filename||"documento.pdf").replace(/[\\/:*?"<>|]+/g,"_");
 const blob=doc.output("blob");
 const url=URL.createObjectURL(blob);
 const a=document.createElement("a");
 a.href=url;
 a.download=safe;
 a.rel="noopener";
 a.style.position="fixed";
 a.style.left="-9999px";
 document.body.appendChild(a);
 a.click();
 window.setTimeout(()=>{try{a.remove()}catch{}try{URL.revokeObjectURL(url)}catch{}},30000);
 return true;
}

export function downloadPdfDocument(doc,filename){
 try{return robustDownload(doc,filename)}catch(error){
  const native=jsPDF.API.__pdfeduNativeSave;
  if(typeof native==="function")return native.call(doc,filename);
  throw error;
 }
}

// Instala uma única vez um save robusto. Assim relatórios e outros PDFs antigos
// que ainda chamam doc.save() também passam pelo mesmo mecanismo de download.
if(!jsPDF.API.__pdfeduNativeSave){
 jsPDF.API.__pdfeduNativeSave=jsPDF.API.save;
 jsPDF.API.save=function(filename){
  try{return robustDownload(this,filename)}catch(error){
   return jsPDF.API.__pdfeduNativeSave.call(this,filename);
  }
 };
}
