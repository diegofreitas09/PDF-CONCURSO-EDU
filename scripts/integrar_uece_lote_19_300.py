#!/usr/bin/env python3
from pathlib import Path
import os,re,json,urllib.request,fitz
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'tmp_uece_11ed.pdf'
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
url=os.environ['UECE_PDF_URL']
OUT=ROOT/'src/data/questionSources'
MEDIA=ROOT/'public/question-media/uece/lote19'
OUT.mkdir(parents=True,exist_ok=True); MEDIA.mkdir(parents=True,exist_ok=True)
if not PDF.exists(): urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)
HDR='TURMA DO JOTA\nMade with Xodo PDF Reader and Editor'
TD=re.compile(r'\b(?:no texto|de acordo com o texto|com base no texto|segundo o texto|a partir do texto|leia o texto|leia o trecho|texto acima|texto anterior|excerto acima|trecho acima)\b',re.I)
MD=re.compile(r'\b(?:figura|imagem|gráfico|grafico|mapa|charge|tirinha|quadro|diagrama|esquema|infográfico|infografico|fotografia|foto)\b',re.I)
CUE=re.compile(r'\b(?:com base (?:no|neste|nesse|na|nesta|nessa) (?:texto|excerto|fragmento|citação|citacao)|de acordo com (?:o|este|esse) (?:texto|excerto|fragmento)|a partir (?:do|deste|desse) (?:texto|excerto|fragmento)|segundo (?:o|este|esse) (?:texto|excerto|fragmento)|sobre (?:o|este|esse) (?:texto|excerto|fragmento)|considerando (?:o|este|esse) (?:texto|excerto|fragmento))\b',re.I)
def raw(p): return d[p-1].get_text().replace(HDR,'')
def clean(s): return re.sub(r'\s+',' ',s.replace(chr(2),' ')).replace(' .','.').strip()
def pages(a,b): return '\n'.join(raw(i) for i in range(a,b+1))
def amap(s,start=1): return {start+i:x for i,x in enumerate(s.split())}
def splitctx(s):
    s=clean(s); m=CUE.search(s)
    return (clean(s[:m.start()]),clean(s[m.start():])) if m and m.start()>=100 else ('',s)
def qpage(a,b,n):
    pat=re.compile(r'(?m)^\s*'+str(n)+r'\)?\s*\(?(UECE)')
    for p in range(a,b+1):
        if pat.search(raw(p)): return p
    return a
def media(p,discipline):
    dest=MEDIA/f'{discipline.lower()}-p{p}.png'
    if not dest.exists(): d[p-1].get_pixmap(matrix=fitz.Matrix(1.2,1.2),alpha=False).save(dest)
    return {'type':'source-crop','src':f'question-media/uece/lote19/{dest.name}','title':'Página original da questão','caption':f'Apostila UECE · página {p}','originalCrop':True,'sourcePage':p}
def take(a,b,start,end,discipline,topic,prefix,ans):
    s=pages(a,b); out=[]; pos=0
    for n in range(start,end+1):
        m=re.compile(r'(?m)^\s*'+str(n)+r'\)?\s*\(?(UECE[^)\n]*)\)?\s*').search(s,pos)
        if not m: raise RuntimeError(f'ausente {discipline}/{topic} {n}')
        nx=re.compile(r'(?m)^\s*\d+\)?\s*\(?UECE').search(s,m.end())
        block=s[m.end():(nx.start() if nx else len(s))].strip()
        pos=nx.start() if nx else len(s)
        marks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\)\s+',block)); last={}
        for mm in marks:last[mm.group(1)]=mm
        if set(last)!={'A','B','C','D'}: raise RuntimeError(f'alternativas {discipline}/{topic} {n}')
        chosen=sorted(last.values(),key=lambda x:x.start())
        rawst=clean(block[:chosen[0].start()]); by={}
        for i,mm in enumerate(chosen):
            by[mm.group(1)]=clean(block[mm.end():(chosen[i+1].start() if i+1<len(chosen) else len(block))])
        ctx,st=splitctx(rawst); p=qpage(a,b,n); med=[]
        if TD.search(st) and not ctx:
            ctx='Texto-base integral disponível na reprodução da página original anexada.'
            med=[media(p,discipline)]
            if p<b: med.append(media(p+1,discipline))
        elif MD.search(rawst):
            med=[media(p,discipline)]
            if p<b: med.append(media(p+1,discipline))
        A=ans.get(n)
        if A not in 'ABCD': raise RuntimeError(f'gabarito {discipline}/{topic} {n}')
        item={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':ctx,'statement':st,'options':[by[L] for L in 'ABCD'],'answer':'ABCD'.index(A),'explanation':f'Gabarito oficial da apostila: {A}.','source':clean(m.group(1)),'origin':ORIGIN,'reviewed':True}
        if med:item['media']=med
        out.append(item)
    return out

rel=amap('C A B C B B A C C',20)
geo=amap('B A D A D C C B D A C A D B D B D D D D B A A D B B A D C B C D B B D A A C A A B D A C A D')
veg=amap('B C A B C A A D D A A C D A D B C A A C')
cea=amap('C C C A C A A C B C D D B B B C A D C A C D C D B C B B A C B B A C C D A')

sur=amap('A D B A A C C B B B A B A A C D A')
cla=amap('A D A B C A C C B C D A B B D C C B D B C C A B C C C C D B B D C B D A B A C C A C D A C B D C B A B B D B B A')
con=amap('C D C D B A C D A A A C C D C C D B B C A')
dh=amap('C D B B A D A B A C D C C D B C A A C C A D C A C B')
fra=amap('C D B B A C D A C C')
fc=amap('A A C C B D A D C C B B B B C A C B B D C D C D B C A B C A A B D B C A B D D B A A C C B B C A')
pod=amap('A B A D D C')
pol=amap('A D C B B C A C C B B B D D C B B A B A D B B C C B D B D A D D B A D B C D D A D')

Q=[]
for spec in [
    (824,830,20,28,'Geografia','Relevo','UECE-GEO-REL',rel),
    (830,838,1,46,'Geografia','Geologia e geomorfologia','UECE-GEO-GEO',geo),
    (838,843,1,20,'Geografia','Vegetação e biomas','UECE-GEO-VEG',veg),
    (843,854,1,37,'Geografia','Geografia do Ceará','UECE-GEO-CEA',cea),
    (854,859,1,17,'Filosofia','Surgimento da filosofia','UECE-FIL-SUR',sur),
    (859,873,1,56,'Filosofia','Filosofia clássica','UECE-FIL-CLA',cla),
    (873,879,1,21,'Filosofia','Contratualismo','UECE-FIL-CON',con),
    (879,887,1,26,'Filosofia','Direitos humanos e movimentos sociais','UECE-FIL-DH',dh),
    (887,890,1,10,'Filosofia','Escola de Frankfurt','UECE-FIL-FRA',fra),
    (890,904,1,48,'Filosofia','Filosofia contemporânea','UECE-FIL-CONT',fc),
    (904,906,1,6,'Filosofia','Filosofia e poder','UECE-FIL-POD',pod),
    (906,908,1,4,'Filosofia','Filosofia e política','UECE-FIL-POL',pol),
]: Q+=take(*spec)
if len(Q)!=300 or len({q['id'] for q in Q})!=300: raise RuntimeError(f'count {len(Q)}')
for q in Q:
    if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']) or q['answer'] not in range(4) or not q['source'] or not q['origin']:
        raise RuntimeError('inválida '+q['id'])
    if TD.search(q['statement']) and not q['context']: raise RuntimeError('context '+q['id'])
    if MD.search(q['statement']) and not q.get('media'): raise RuntimeError('media '+q['id'])

for k in range(15):
    name=f'UECE_GEO_FIL_LOTE_300_19_P{k+1:02d}'; chunk=Q[k*20:(k+1)*20]
    (OUT/f'ueceGeografiaFilosofiaLote300_19_p{k+1:02d}.js').write_text('export const '+name+'='+json.dumps(chunk,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
imports='\n'.join(f'import{{UECE_GEO_FIL_LOTE_300_19_P{k:02d}}}from"./ueceGeografiaFilosofiaLote300_19_p{k:02d}.js";' for k in range(1,16))
spreads=','.join(f'...UECE_GEO_FIL_LOTE_300_19_P{k:02d}' for k in range(1,16))
(OUT/'ueceGeografiaFilosofiaLote300_19.js').write_text(imports+f'\nexport const UECE_GEO_FIL_LOTE_300_19=[{spreads}];\n',encoding='utf-8')

r=ROOT/'src/data/questionRegistry.js'; t=r.read_text(encoding='utf-8')
imp='import{UECE_GEO_FIL_LOTE_300_19}from"./questionSources/ueceGeografiaFilosofiaLote300_19";'
anchor='import{UECE_GEOGRAFIA_LOTE_300_18}from"./questionSources/ueceGeografiaLote300_18";'
if imp not in t:
    if anchor not in t: raise RuntimeError('âncora lote 18 ausente')
    t=t.replace(anchor,anchor+'\n'+imp)
needle='...UECE_GEOGRAFIA_LOTE_300_18].map(sanitizeQuestion)'
if needle in t:t=t.replace(needle,'...UECE_GEOGRAFIA_LOTE_300_18,...UECE_GEO_FIL_LOTE_300_19].map(sanitizeQuestion)')
elif '...UECE_GEO_FIL_LOTE_300_19].map(sanitizeQuestion)' not in t: raise RuntimeError('registry mudou')
r.write_text(t,encoding='utf-8')
(ROOT/'scripts/verificar_uece_lote_19_300.mjs').write_text('import{UECE_GEO_FIL_LOTE_300_19 as Q}from"../src/data/questionSources/ueceGeografiaFilosofiaLote300_19.js";if(Q.length!==300)throw new Error("count "+Q.length);if(new Set(Q.map(q=>q.id)).size!==300)throw new Error("ids");const c=Q.reduce((a,q)=>(a[q.discipline]=(a[q.discipline]||0)+1,a),{});if(c.Geografia!==112||c.Filosofia!==188)throw new Error(JSON.stringify(c));for(const q of Q){if(!q.statement||q.options?.length!==4||!Number.isInteger(q.answer)||!q.source||!q.origin)throw new Error(q.id)}console.log("Lote 19 OK — 300/300 | Geografia 112 | Filosofia 188");\n',encoding='utf-8')
print('Lote 19 preparado: 300/300 — Geografia 112 + Filosofia 188')
