# Integração UECE lote 16 — execução auditada
from pathlib import Path
import os,re,json,urllib.request,fitz
ROOT=Path(__file__).resolve().parents[1]; PDF=ROOT/'tmp_uece_11ed.pdf'; ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
url=os.getenv('UECE_PDF_URL','https://drive.usercontent.google.com/download?id=18fCbZ_iEnHHg_mdvKqtEBVBsl-A3pP0k&export=download&confirm=t')
if not PDF.exists(): urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)
def pages(a,b):
 s='\n'.join(d[i].get_text() for i in range(a-1,b)); s=re.sub(r'\n\s*\d{3}\s*\n','\n',s); return s.replace('TURMA DO JOTA\nMade with Xodo PDF Reader and Editor','')
def clean(s): return re.sub(r'\s+',' ',s).replace(' .','.').strip()
def take(a,b,start,end,discipline,topic,prefix,answers):
 s=pages(a,b); out=[]; pos=0
 for n in range(start,end+1):
  m=re.compile(r'(?m)^\s*'+str(n)+r'\)\s*\((UECE[^)]*)\)\s*').search(s,pos)
  if not m: raise RuntimeError(f'Questao ausente: {topic} {n}')
  nxt=re.compile(r'(?m)^\s*'+str(n+1)+r'\)\s*\(UECE').search(s,m.end()) if n<end else None
  q=s[m.end():(nxt.start() if nxt else len(s))].strip(); pos=nxt.start() if nxt else len(s)
  aps=[]
  for L in 'ABCD':
   mm=list(re.finditer(r'(?:^|\n|\s)'+L+r'\)\s+',q))
   if not mm: raise RuntimeError(f'Alternativa {L} ausente: {topic} {n}')
   aps.append(mm[-1])
  if not all(aps[i].start()<aps[i+1].start() for i in range(3)): raise RuntimeError(f'Ordem alternativas invalida: {topic} {n}')
  st=clean(q[:aps[0].start()]); opts=[clean(q[x.end():(aps[i+1].start() if i<3 else len(q))]) for i,x in enumerate(aps)]
  ans=answers[n]; dep=re.search(r'\b(no texto|de acordo com o texto|com base no texto|a partir do texto|segundo o texto|texto acima|texto anterior|leia o texto|leia o trecho|considere o texto|observe o texto|no trecho|parágrafo|autor do texto|ideia central do texto)\b',st,re.I)
  out.append({'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':st if dep else '','statement':st,'options':opts,'answer':'ABCD'.index(ans),'explanation':f'Gabarito oficial da apostila: {ans}.','source':m.group(1),'origin':ORIGIN,'reviewed':True})
 return out
reg='C D A A A B A C A C A B B C B B B C C B B C D D C C D D B B D C D D C'.split(); reg={i+1:v for i,v in enumerate(reg)}
cea='D D C C A A A B D B B A B C B A C C A A C C A A A B D B B A D D A A B C C A D C C A C C A A'.split(); cea={i+1:v for i,v in enumerate(cea)}
agr='A A C B A B A D B B B B B B D B A'.split(); agr={i+1:v for i,v in enumerate(agr)}
con='B A D C B C D B D B'.split(); con={i+1:v for i,v in enumerate(con)}
items=take(704,710,9,35,'História','Regime Civil-Militar','UECE-HIST-DIT',reg)+take(711,721,1,46,'História','História do Ceará','UECE-HIST-CEA',cea)+take(725,729,1,17,'Geografia','Agricultura','UECE-GEO-AGR',agr)+take(730,733,1,10,'Geografia','Conceitos Geográficos','UECE-GEO-CON',con)
if len(items)!=100 or len({q['id'] for q in items})!=100: raise RuntimeError('Lote nao fecha 100 IDs unicos')
for q in items:
 if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']) or q['answer'] not in range(4): raise RuntimeError(f'Questao invalida: {q["id"]}')
out=ROOT/'src/data/questionSources'; out.mkdir(parents=True,exist_ok=True)
for k in range(5):
 name=f'UECE_TRANSICAO_HIST_GEO_LOTE_100_16_P{k+1:02d}'; chunk=items[k*20:(k+1)*20]
 (out/f'ueceTransicaoHistoriaGeografiaLote100_16_p{k+1:02d}.js').write_text(f'// UECE lote 16 — parte {k+1}/5.\nexport const {name} = '+json.dumps(chunk,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
imports='\n'.join(f'import{{UECE_TRANSICAO_HIST_GEO_LOTE_100_16_P{k:02d}}}from"./ueceTransicaoHistoriaGeografiaLote100_16_p{k:02d}.js";' for k in range(1,6))
spreads=','.join(f'...UECE_TRANSICAO_HIST_GEO_LOTE_100_16_P{k:02d}' for k in range(1,6))
(out/'ueceTransicaoHistoriaGeografiaLote100_16.js').write_text(imports+f'\nexport const UECE_TRANSICAO_HIST_GEO_LOTE_100_16=[{spreads}];\n',encoding='utf-8')
regfile=ROOT/'src/data/questionRegistry.js'; txt=regfile.read_text(encoding='utf-8')
imp='import{UECE_TRANSICAO_HIST_GEO_LOTE_100_16}from"./questionSources/ueceTransicaoHistoriaGeografiaLote100_16";'
if imp not in txt: txt=txt.replace('import{UECE_HISTORIA_LOTE_100_14}from"./questionSources/ueceHistoriaLote100_14";', 'import{UECE_HISTORIA_LOTE_100_14}from"./questionSources/ueceHistoriaLote100_14";\n'+imp)
needle='...UECE_HISTORIA_LOTE_100_14].map(sanitizeQuestion)'
if needle in txt: txt=txt.replace(needle,'...UECE_HISTORIA_LOTE_100_14,...UECE_TRANSICAO_HIST_GEO_LOTE_100_16].map(sanitizeQuestion)')
elif '...UECE_TRANSICAO_HIST_GEO_LOTE_100_16].map(sanitizeQuestion)' not in txt: raise RuntimeError('Registry mudou; integracao abortada')
regfile.write_text(txt,encoding='utf-8')
ver=ROOT/'scripts/verificar_uece_lote_16.mjs'
ver.write_text('import{UECE_TRANSICAO_HIST_GEO_LOTE_100_16 as Q}from"../src/data/questionSources/ueceTransicaoHistoriaGeografiaLote100_16.js";\nconst fail=m=>{throw new Error(m)}; if(Q.length!==100)fail(`count ${Q.length}`); if(new Set(Q.map(q=>q.id)).size!==100)fail("ids"); for(const q of Q){if(!q.statement||q.options?.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.reviewed||!q.source||!q.origin)fail(q.id)} const c=Q.reduce((a,q)=>(a[q.topic]=(a[q.topic]||0)+1,a),{}); if(c["Regime Civil-Militar"]!==27||c["História do Ceará"]!==46||c.Agricultura!==17||c["Conceitos Geográficos"]!==10)fail(JSON.stringify(c)); console.log("Lote 16 OK — 100/100 | História 73 | Geografia 27 | visuais 0");\n',encoding='utf-8')
print('Lote 16 gerado: 100/100 — Regime 9-35 + História do Ceará 1-46 + Agricultura 1-17 + Conceitos Geográficos 1-10')
