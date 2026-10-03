import React,{useEffect,useMemo,useRef,useState}from"react";
import{Camera,CameraOff,CheckCircle2,ScanLine,Upload}from"lucide-react";
import{readAnswerSheetImage}from"../../utils/answerSheet";

export default function AnswerSheetScanner({questions=80,answerKey=[],code="",paperType=1,onApply}){
 const input=useRef(null),video=useRef(null),stream=useRef(null),timer=useRef(null),busy=useRef(false);
 const[scan,setScan]=useState(null),[loading,setLoading]=useState(false),[error,setError]=useState(""),[cameraOn,setCameraOn]=useState(false),[frameState,setFrameState]=useState("idle");

 const grade=useMemo(()=>{
  const rows=scan?.answers||[];let correct=0,wrong=0,blank=0,review=0;
  const graded=rows.map((a,i)=>{let result="blank";if(a.status==="multiple"){result="wrong";wrong++}else if(a.status==="uncertain"){result="review";review++}else if(a.status==="marked"&&Number.isInteger(a.selected)){if(Number.isInteger(answerKey[i])){result=a.selected===answerKey[i]?"correct":"wrong";result==="correct"?correct++:wrong++}else result="marked"}else blank++;return{...a,result}});
  const pct=questions?Math.round(correct/questions*100):0;
  return{graded,correct,wrong,blank,review,pct};
 },[scan,answerKey,questions]);

 function stopCamera(){if(timer.current){clearInterval(timer.current);timer.current=null}if(stream.current){stream.current.getTracks().forEach(t=>t.stop());stream.current=null}setCameraOn(false);setFrameState("idle")}
 useEffect(()=>()=>stopCamera(),[]);

 async function analyze(file,{silent=false}={}){
  if(!file||busy.current)return;busy.current=true;if(!silent)setLoading(true);if(!silent)setError("");
  try{const result=await readAnswerSheetImage(file,{questions});setScan(result);setFrameState("good");setError("")}
  catch(err){setFrameState("bad");if(!silent)setError(err?.message||"Não foi possível ler o cartão. Enquadre a folha inteira, reta e com boa iluminação.")}
  finally{busy.current=false;if(!silent)setLoading(false)}
 }

 async function pick(e){const f=e.target.files?.[0];if(f)await analyze(f);e.target.value=""}

 async function scanVideoFrame(){
  const el=video.current;if(!el||!cameraOn||el.readyState<2||busy.current)return;
  const canvas=document.createElement("canvas"),max=1500,scale=Math.min(1,max/Math.max(el.videoWidth||1,el.videoHeight||1));
  canvas.width=Math.max(1,Math.round(el.videoWidth*scale));canvas.height=Math.max(1,Math.round(el.videoHeight*scale));
  canvas.getContext("2d").drawImage(el,0,0,canvas.width,canvas.height);
  const blob=await new Promise(ok=>canvas.toBlob(ok,"image/jpeg",.88));if(blob)await analyze(blob,{silent:true});
 }

 async function startCamera(){
  setError("");if(!navigator.mediaDevices?.getUserMedia){setError("A câmera ao vivo não é suportada neste navegador. Use a opção de tirar foto.");return}
  try{
   stopCamera();const s=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"},width:{ideal:1920},height:{ideal:1080}},audio:false});
   stream.current=s;setCameraOn(true);setFrameState("bad");requestAnimationFrame(()=>{if(video.current){video.current.srcObject=s;video.current.play().catch(()=>{})}});
   timer.current=setInterval(scanVideoFrame,1400);
  }catch(err){setError("Não foi possível abrir a câmera. Autorize o acesso ou use a opção de escolher uma foto.")}
 }

 function update(q,val){setScan(s=>({...s,answers:s.answers.map(a=>a.question===q?{...a,selected:val===""?null:Number(val),status:val===""?"blank":"marked"}:a)}))}

 const statusText=frameState==="good"?"Gabarito enquadrado — leitura atualizada":frameState==="bad"?"Ajuste a folha dentro do quadro":"Posicione o cartão dentro do quadro";

 return <div className="omr-scanner">
  <div className="omr-head"><ScanLine size={22}/><div><strong>Correção inteligente do cartão-resposta</strong><span>{code?("Código "+code+" · Tipo "+paperType+" · "):""}A câmera confere o enquadramento e atualiza a leitura automaticamente.</span></div></div>

  <div className="omr-actions">
   <button type="button" className="sim-download" onClick={cameraOn?stopCamera:startCamera}>{cameraOn?<CameraOff size={18}/>:<Camera size={18}/>} {cameraOn?"Fechar câmera":"Abrir câmera ao vivo"}</button>
   <input ref={input} hidden type="file" accept="image/*" capture="environment" onChange={pick}/>
   <button type="button" className="sim-download" disabled={loading} onClick={()=>input.current?.click()}><Upload size={18}/>{loading?"Analisando...":"Tirar foto / escolher imagem"}</button>
  </div>

  {cameraOn&&<div className={"omr-live "+frameState}>
    <video ref={video} playsInline muted className="omr-video"/>
    <div className="omr-guide"><i/><i/><i/><i/><span>{statusText}</span></div>
    {scan&&<div className="omr-live-score"><b>{grade.correct}/{questions}</b><span>{grade.pct}%</span></div>}
  </div>}

  {error&&<div className="sim-pdf-error">{error}</div>}

  {scan&&<>
   <div className="omr-scoreboard">
    <div className="correct"><span>Acertos</span><b>{grade.correct}</b></div>
    <div className="wrong"><span>Erros</span><b>{grade.wrong}</b></div>
    <div className="review"><span>Conferir</span><b>{grade.review}</b></div>
    <div className="blank"><span>Em branco</span><b>{grade.blank}</b></div>
    <div className="percent"><span>Percentual</span><b>{grade.pct}%</b></div>
   </div>
   {!cameraOn&&<div className="omr-preview-wrap"><img src={scan.preview} alt="Prévia do cartão-resposta fotografado" className="omr-preview"/><div className="omr-marker-status"><b>4 marcadores localizados</b><span>Confiança: {(scan.markerConfidence||[]).join("% · ")}%</span></div></div>}
   <div className="omr-grid">{grade.graded.map(a=><label className={"omr-item "+a.status+" "+a.result} key={a.question}><b>{String(a.question).padStart(2,"0")}</b><select value={a.selected??""} onChange={e=>update(a.question,e.target.value)}><option value="">—</option><option value="0">A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select><small>{a.result==="correct"?"acerto":a.result==="wrong"?"erro":a.result==="review"?"conferir":a.status==="blank"?"branco":"lido"}</small></label>)}</div>
   <button type="button" className="sim-generate" onClick={()=>onApply?.(scan.answers)}><CheckCircle2 size={18}/> Confirmar leitura e preencher simulado</button>
  </>}
 </div>
}
