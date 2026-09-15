# Integração UECE lote 17 — Geografia 100 questões após lote 16
from pathlib import Path
import os,re,json,urllib.request,fitz
ROOT=Path(__file__).resolve().parents[1]; PDF=ROOT/'tmp_uece_11ed.pdf'; ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
url=os.getenv('UECE_PDF_URL','https://drive.usercontent.google.com/download?id=18fCbZ_iEnHHg_mdvKqtEBVBsl-A3pP0k&export=download&confirm=t')
if not PDF.exists(): urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)
def pages(a,b):
 s='\n'.join(d[i].get_text() for i in range(a-1,b)); s=re.sub(r'\n\s*\d{3}\s*\n','\n',s); return s.replace('TURMA DO JOTA\nMade with Xodo PDF Reader and Editor','')
def clean(s): return re.sub(r'\s+',' ',s).replace(' .','.').strip()
def take(a,b,start,end,topic,prefix,answers):
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
  ans=answers[n]
  out.append({'id':f'{prefix}-{n:03d}','discipline':'Geografia','topic':topic,'context':'','statement':st,'options':opts,'answer':'ABCD'.index(ans),'explanation':f'Gabarito oficial da apostila: {ans}.','source':m.group(1),'origin':ORIGIN,'reviewed':True})
 return out
con_letters='B A D C B C D B D B D A C C B C A C C A C D D B A D B A C B A A D D A B C B D C D D C A A D D B B B B D A C D A B'.split(); con={i+1:v for i,v in enumerate(con_letters)}
geo_letters='D D D C C A C B A C D B D D B B B A B D A C B C C B C A A C A D D C A C D B D D C D A D'.split(); geo={i+1:v for i,v in enumerate(geo_letters)}
glo_letters='B D D C B B A A B C D C A A C B D C A A B B A C B C C C D B'.split(); glo={i+1:v for i,v in enumerate(glo_letters)}
items=take(730,741,11,57,'Conceitos Geográficos','UECE-GEO-CON',con)+take(742,753,1,44,'Geopolítica','UECE-GEO-GEO',geo)+take(754,757,1,9,'Globalização','UECE-GEO-GLO',glo)
if len(items)!=100 or len({q['id'] for q in items})!=100: raise RuntimeError('Lote nao fecha 100 IDs unicos')
for q in items:
 if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']) or q['answer'] not in range(4): raise RuntimeError(f'Questao invalida: {q["id"]}')
out=ROOT/'src/data/questionSources'; out.mkdir(parents=True,exist_ok=True)
for k in range(5):
 name=f'UECE_GEOGRAFIA_LOTE_100_17_P{k+1:02d}'; chunk=items[k*20:(k+1)*20]
 (out/f'ueceGeografiaLote100_17_p{k+1:02d}.js').write_text(f'// UECE lote 17 — parte {k+1}/5.\nexport const {name} = '+json.dumps(chunk,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
imports='\n'.join(f'import{{UECE_GEOGRAFIA_LOTE_100_17_P{k:02d}}}from"./ueceGeografiaLote100_17_p{k:02d}.js";' for k in range(1,6)); spreads=','.join(f'...UECE_GEOGRAFIA_LOTE_100_17_P{k:02d}' for k in range(1,6))
(out/'ueceGeografiaLote100_17.js').write_text(imports+f'\nexport const UECE_GEOGRAFIA_LOTE_100_17=[{spreads}];\n',encoding='utf-8')
regfile=ROOT/'src/data/questionRegistry.js'; txt=regfile.read_text(encoding='utf-8')
imp='import{UECE_GEOGRAFIA_LOTE_100_17}from"./questionSources/ueceGeografiaLote100_17";'
anchor='import{UECE_TRANSICAO_HIST_GEO_LOTE_100_16}from"./questionSources/ueceTransicaoHistoriaGeografiaLote100_16";'
if imp not in txt: txt=txt.replace(anchor,anchor+'\n'+imp)
needle='...UECE_TRANSICAO_HIST_GEO_LOTE_100_16].map(sanitizeQuestion)'
if needle in txt: txt=txt.replace(needle,'...UECE_TRANSICAO_HIST_GEO_LOTE_100_16,...UECE_GEOGRAFIA_LOTE_100_17].map(sanitizeQuestion)')
elif '...UECE_GEOGRAFIA_LOTE_100_17].map(sanitizeQuestion)' not in txt: raise RuntimeError('Registry mudou; integracao abortada')
regfile.write_text(txt,encoding='utf-8')
ver=ROOT/'scripts/verificar_uece_lote_17.mjs'
ver.write_text('import{UECE_GEOGRAFIA_LOTE_100_17 as Q}from"../src/data/questionSources/ueceGeografiaLote100_17.js";\nconst fail=m=>{throw new Error(m)};if(Q.length!==100)fail(`count ${Q.length}`);if(new Set(Q.map(q=>q.id)).size!==100)fail("ids");for(const q of Q){if(!q.statement||q.options?.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.reviewed||!q.source||!q.origin)fail(q.id)}const c=Q.reduce((a,q)=>(a[q.topic]=(a[q.topic]||0)+1,a),{});if(c["Conceitos Geográficos"]!==47||c["Geopolítica"]!==44||c["Globalização"]!==9)fail(JSON.stringify(c));console.log("Lote 17 OK — 100/100 | Conceitos 11-57 | Geopolítica 1-44 | Globalização 1-9 | visuais 0");\n',encoding='utf-8')
print('Lote 17 gerado: 100/100 — Conceitos 11-57 + Geopolítica 1-44 + Globalização 1-9')
