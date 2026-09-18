#!/usr/bin/env python3
from pathlib import Path
import os,re,json,urllib.request,fitz
ROOT=Path(__file__).resolve().parents[1]; PDF=ROOT/'tmp_uece_11ed.pdf'
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
url=os.environ['UECE_PDF_URL']; OUT=ROOT/'src/data/questionSources'; MEDIA=ROOT/'public/question-media/uece/geografia/lote18'
OUT.mkdir(parents=True,exist_ok=True); MEDIA.mkdir(parents=True,exist_ok=True)
if not PDF.exists(): urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)
HDR='TURMA DO JOTA\nMade with Xodo PDF Reader and Editor'
TD=re.compile(r'\\b(?:no texto|de acordo com o texto|com base no texto|segundo o texto|a partir do texto|leia o texto|leia o trecho|texto acima|texto anterior)\\b',re.I)
MD=re.compile(r'\\b(?:figura|imagem|gráfico|grafico|mapa|charge|tirinha|quadro|diagrama|esquema|infográfico|infografico|fotografia|foto)\\b',re.I)
CUE=re.compile(r'\\b(?:com base (?:no|neste|nesse) (?:texto|excerto|fragmento)|de acordo com (?:o|este|esse) (?:texto|excerto|fragmento)|a partir (?:do|deste|desse) (?:texto|excerto|fragmento)|segundo (?:o|este|esse) (?:texto|excerto|fragmento))\\b',re.I)
def raw(p): return d[p-1].get_text().replace(HDR,'')
def clean(s): return re.sub(r'\\s+',' ',s.replace(chr(2),' ')).replace(' .','.').strip()
def pages(a,b): return '\n'.join(raw(i) for i in range(a,b+1))
def amap(s): return {i+1:x for i,x in enumerate(s.split())}
def splitctx(s):
 s=clean(s); m=CUE.search(s)
 return (clean(s[:m.start()]),clean(s[m.start():])) if m and m.start()>=100 else ('',s)
def qpage(a,b,n):
 pat=re.compile(r'(?m)^\\s*'+str(n)+r'\\)\\s*\\(UECE')
 for p in range(a,b+1):
  if pat.search(raw(p)): return p
 return a
def media(p):
 f=MEDIA/f'p{p}.png'
 if not f.exists(): d[p-1].get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False).save(f)
 return {'type':'source-crop','src':f'question-media/uece/geografia/lote18/p{p}.png','title':'Página original da questão','caption':f'Apostila UECE · página {p}','originalCrop':True,'sourcePage':p}
def take(a,b,start,end,topic,prefix,ans):
 s=pages(a,b); out=[]; pos=0
 for n in range(start,end+1):
  m=re.compile(r'(?m)^\\s*'+str(n)+r'\\)\\s*\\((UECE[^)]*)\\)\\s*').search(s,pos)
  if not m: raise RuntimeError(f'ausente {topic} {n}')
  nx=re.compile(r'(?m)^\\s*'+str(n+1)+r'\\)\\s*\\(UECE').search(s,m.end()) if n<end else None
  q=s[m.end():(nx.start() if nx else len(s))].strip(); pos=nx.start() if nx else len(s)
  ms=list(re.finditer(r'(?:^|\\n|\\s)([ABCD])\\)\\s+',q)); last={}
  for x in ms:last[x.group(1)]=x
  if set(last)!={'A','B','C','D'}: raise RuntimeError(f'alternativas {topic} {n}')
  ch=sorted(last.values(),key=lambda x:x.start()); st0=clean(q[:ch[0].start()]); by={}
  for i,x in enumerate(ch): by[x.group(1)]=clean(q[x.end():(ch[i+1].start() if i+1<len(ch) else len(q))])
  ctx,st=splitctx(st0); p=qpage(a,b,n); med=[]
  if TD.search(st) and not ctx:
   ctx='Texto-base integral disponível na reprodução da página original anexada.'; med=[media(p)]
   if p<b: med.append(media(p+1))
  elif MD.search(st0):
   med=[media(p)]
   if p<b: med.append(media(p+1))
  A=ans[n]; item={'id':f'{prefix}-{n:03d}','discipline':'Geografia','topic':topic,'context':ctx,'statement':st,'options':[by[L] for L in 'ABCD'],'answer':'ABCD'.index(A),'explanation':f'Gabarito oficial da apostila: {A}.','source':m.group(1),'origin':ORIGIN,'reviewed':True}
  if med:item['media']=med
  out.append(item)
 return out
glo=amap('B D D C B B A A B C D C A A C B D C A A B B A C B C C C D B')
mei=amap('C C D A C D D A D B C D C A B B A D C A C D B A C D D C D B D A B A B A B D A B A A A')
pop=amap('B C A A A A B C D C B A B B C A A D'); tra=amap('B A D B D D')
urb=amap('B A C A C B A C A D D C D B D A B D C C B C C B C D B A D C D D D C D D B B B D B C A A C C A')
car=amap('C B B A C A A C D A C C A A B A D A B D A C C B D D D D D B A C A B C C D A C C C')
cli=amap('A A B A B D A B A A D C B D D A D B D A A C A A A B A A B A C C B B A D B D')
hid=amap('D A C A B D D A A A A B D A A C B A D C B C C D C A B A D C D A D A A C A C C C B')
ene=amap('B B B D D D B B D C A D A C'); reg=amap('D A D B A A B C C D A D')
rel=amap('C B A D C A B A A D C B A D C C B C D C A B C B B A C C')
Q=[]
for x in [
 (754,761,10,30,'Globalização','UECE-GEO-GLO',glo),(762,773,1,43,'Meio ambiente','UECE-GEO-MEI',mei),
 (774,778,1,18,'População','UECE-GEO-POP',pop),(779,780,1,6,'Transporte','UECE-GEO-TRA',tra),
 (781,792,1,47,'Urbanização','UECE-GEO-URB',urb),(793,800,1,41,'Cartografia','UECE-GEO-CAR',car),
 (801,808,1,38,'Climatologia','UECE-GEO-CLI',cli),(809,816,1,41,'Hidrografia','UECE-GEO-HID',hid),
 (817,820,1,14,'Fontes de energia','UECE-GEO-ENE',ene),(821,823,1,12,'Regiões','UECE-GEO-REG',reg),
 (824,829,1,19,'Relevo','UECE-GEO-REL',rel)]: Q+=take(*x)
if len(Q)!=300 or len({q['id'] for q in Q})!=300: raise RuntimeError(f'count {len(Q)}')
for q in Q:
 if not q['statement'] or len(q['options'])!=4 or q['answer'] not in range(4): raise RuntimeError(q['id'])
 if TD.search(q['statement']) and not q['context']: raise RuntimeError('context '+q['id'])
 if MD.search(q['statement']) and not q.get('media'): raise RuntimeError('media '+q['id'])
for k in range(15):
 name=f'UECE_GEOGRAFIA_LOTE_300_18_P{k+1:02d}'; chunk=Q[k*20:(k+1)*20]
 (OUT/f'ueceGeografiaLote300_18_p{k+1:02d}.js').write_text(f'export const {name}='+json.dumps(chunk,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
imports='\n'.join(f'import{{UECE_GEOGRAFIA_LOTE_300_18_P{k:02d}}}from"./ueceGeografiaLote300_18_p{k:02d}.js";' for k in range(1,16))
spreads=','.join(f'...UECE_GEOGRAFIA_LOTE_300_18_P{k:02d}' for k in range(1,16))
(OUT/'ueceGeografiaLote300_18.js').write_text(imports+f'\nexport const UECE_GEOGRAFIA_LOTE_300_18=[{spreads}];\n',encoding='utf-8')
r=ROOT/'src/data/questionRegistry.js'; t=r.read_text(encoding='utf-8')
imp='import{UECE_GEOGRAFIA_LOTE_300_18}from"./questionSources/ueceGeografiaLote300_18";'; anchor='import{UECE_GEOGRAFIA_LOTE_100_17}from"./questionSources/ueceGeografiaLote100_17";'
if imp not in t:t=t.replace(anchor,anchor+'\n'+imp)
t=t.replace('...UECE_GEOGRAFIA_LOTE_100_17].map(sanitizeQuestion)','...UECE_GEOGRAFIA_LOTE_100_17,...UECE_GEOGRAFIA_LOTE_300_18].map(sanitizeQuestion)')
r.write_text(t,encoding='utf-8')
(ROOT/'scripts/verificar_uece_lote_18_300.mjs').write_text('import{UECE_GEOGRAFIA_LOTE_300_18 as Q}from"../src/data/questionSources/ueceGeografiaLote300_18.js";if(Q.length!==300)throw new Error("count "+Q.length);if(new Set(Q.map(q=>q.id)).size!==300)throw new Error("ids");for(const q of Q){if(!q.statement||q.options?.length!==4||!Number.isInteger(q.answer)||!q.source||!q.origin)throw new Error(q.id)}console.log("Lote 18 OK 300/300");\n',encoding='utf-8')
print('Lote 18 preparado: 300/300')
