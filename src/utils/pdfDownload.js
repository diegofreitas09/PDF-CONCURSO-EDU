export function downloadPdfDocument(doc,filename){
 const safe=String(filename||"documento.pdf").replace(/[\\/:*?"<>|]+/g,"_");
 try{
  const blob=doc.output("blob");
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  a.href=url;a.download=safe;a.style.display="none";
  document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),15000);
  return true;
 }catch(error){
  try{doc.save(safe);return true}catch{throw error}
 }
}
