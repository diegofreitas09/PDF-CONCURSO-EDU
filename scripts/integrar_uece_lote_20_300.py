#!/usr/bin/env python3
# Catraca lote 20: auditoria estrita de conteúdo, contexto, mídia, gabarito, assunto e origem.
from pathlib import Path
import os,re,json,urllib.request,fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'tmp_uece_11ed.pdf'
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
url=os.environ['UECE_PDF_URL']
OUT=ROOT/'src/data/questionSources'
MEDIA=ROOT/'public/question-media/uece/lote20'
OUT.mkdir(parents=True,exist_ok=True)
MEDIA.mkdir(parents=True,exist_ok=True)

if not PDF.exists():
    urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)

HDR='TURMA DO JOTA\nMade with Xodo PDF Reader and Editor'
TEXT_REF=re.compile(r'\b(?:no texto|neste texto|nesse texto|de acordo com (?:o |este |esse )?texto|com base (?:no|neste|nesse) texto|segundo (?:o |este |esse )?texto|a partir (?:do|deste|desse) texto|texto (?:acima|anterior|a seguir|seguinte)|leia (?:o |este |esse )?(?:texto|trecho|fragmento|poema|tirinha|notícia|noticia)|considere (?:o |este |esse )?(?:texto|trecho|fragmento)|observe (?:o |este |esse )?(?:texto|trecho|fragmento)|(?:no|neste|nesse) trecho(?!\s+(?:reto|curvo|inicial|final|horizontal|vertical|da estrada|da ferrovia|da rodovia|da via|da pista|da linha|do percurso|do trajeto))|parágrafo|paragrafo|autor(?:a)? do texto|ideia central do texto|texto-base|texto de apoio)\b',re.I)
MEDIA_REF=re.compile(r'(?:\b(?:observe|analise|considere|veja|examine)\s+(?:a|o)\s+(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\b)|(?:\b(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\s+(?:acima|abaixo|a seguir|seguinte|anterior|apresentad[oa]|mostrad[oa]|representad[oa])\b)|(?:\brepresentad[oa]\s+(?:na|no)\s+(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\b)',re.I)
CUE=re.compile(
    r'\b(?:'
    r'com base (?:no|neste|nesse|na|nesta|nessa) (?:texto|excerto|fragmento|citação|citacao|passagem|trecho)'
    r'|baseando-se (?:no|neste|nesse) (?:texto|excerto|fragmento|passagem|trecho)'
    r'|de acordo com (?:o|este|esse) (?:texto|excerto|fragmento|trecho|passagem)'
    r'|a partir (?:do|deste|desse|da|desta|dessa) (?:texto|excerto|fragmento|trecho|passagem|leitura)'
    r'|segundo (?:o|este|esse) (?:texto|excerto|fragmento|trecho|passagem)'
    r'|sobre (?:o|este|esse) (?:texto|excerto|fragmento|trecho|passagem)'
    r'|considerando (?:o|este|esse|a|esta|essa) (?:texto|excerto|fragmento|trecho|passagem|informação)'
    r'|conforme (?:o|este|esse) (?:texto|excerto|fragmento|trecho|passagem)'
    r'|levando em consideração (?:o|este|esse) (?:texto|excerto|fragmento|trecho|passagem)'
    r'|no texto acima|o texto acima|o trecho acima(?: citado)?|o trecho acima foi|o excerto acima'
    r'|sobre o trecho acima|a passagem acima|no trecho anterior|acima,\s+o primeiro texto'
    r')\b',re.I)

def raw(p):
    txt=d[p-1].get_text().replace(HDR,'')
    return re.sub(rf'(?m)^\s*{p}\s*$','',txt)

def clean(s):
    return re.sub(r'\s+',' ',str(s).replace(chr(2),' ')).replace(' .','.').strip()

def pages(a,b):
    return '\n'.join(raw(i) for i in range(a,b+1))

def amap(s,start=1):
    return {start+i:x for i,x in enumerate(s.split())}

def splitctx(s):
    s=clean(s)
    m=CUE.search(s)
    return (clean(s[:m.start()]),clean(s[m.start():])) if m and m.start()>=80 else ('',s)

def qpage(a,b,n):
    pat=re.compile(r'(?m)^\s*'+str(n)+r'\)?\s*\(?(UECE)')
    for p in range(a,b+1):
        if pat.search(raw(p)):
            return p
    return a

def media(p,discipline):
    dest=MEDIA/f'{discipline.lower()}-p{p}.png'
    if not dest.exists():
        d[p-1].get_pixmap(matrix=fitz.Matrix(1.35,1.35),alpha=False).save(dest)
    return {
        'type':'source-crop',
        'src':f'question-media/uece/lote20/{dest.name}',
        'title':'Página original da questão',
        'caption':f'Apostila UECE · página {p}',
        'originalCrop':True,
        'sourcePage':p
    }

def take(a,b,start,end,discipline,topic,prefix,ans):
    s=pages(a,b)
    out=[]
    pos=0
    for n in range(start,end+1):
        m=re.compile(r'(?m)^\s*'+str(n)+r'\)?\s*\(?(UECE[^)\n]*)\)?\s*').search(s,pos)
        if not m:
            raise RuntimeError(f'ausente {discipline}/{topic} {n}')
        nx=re.compile(r'(?m)^\s*\d+\)?\s*\(?UECE').search(s,m.end())
        block=s[m.end():(nx.start() if nx else len(s))].strip()
        pos=nx.start() if nx else len(s)

        marks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\s*\)\s*',block))
        last={}
        for mm in marks:
            last[mm.group(1)]=mm
        if set(last)!={'A','B','C','D'}:
            raise RuntimeError(f'alternativas {discipline}/{topic} {n}: {sorted(last)}')

        chosen=sorted(last.values(),key=lambda x:x.start())
        rawst=clean(block[:chosen[0].start()])
        by={}
        for i,mm in enumerate(chosen):
            by[mm.group(1)]=clean(block[mm.end():(chosen[i+1].start() if i+1<len(chosen) else len(block))])

        ctx,st=splitctx(rawst)
        p=qpage(a,b,n)
        med=[]
        if MEDIA_REF.search(st):
            med=[media(p,discipline)]

        A=ans.get(n)
        if A not in 'ABCD':
            raise RuntimeError(f'gabarito {discipline}/{topic} {n}')

        item={
            'id':f'{prefix}-{n:03d}',
            'discipline':discipline,
            'topic':topic,
            'context':ctx,
            'statement':st,
            'options':[by[L] for L in 'ABCD'],
            'answer':'ABCD'.index(A),
            'explanation':f'Gabarito oficial da apostila: {A}.',
            'source':clean(m.group(1)),
            'origin':ORIGIN,
            'reviewed':True
        }
        if med:
            item['media']=med
        out.append(item)
    return out

pol=amap('A D C B B C A C C B B B D D C B B A B A D B B C C B D B D A D D B A D B C D D A D')
med=amap('B A B B C C A B D D D C D D B B B C A B A D C A A')
mod=amap('C A D A D D B C C C D D B C A A C D B B A A C B D B B A A A C B A C C D')
mit=amap('A C D A C A B')
lib=amap('D B D D C B D B B D')
ind=amap('C C D C B B B A B A D C D')
rat=amap('A C D D C A A A D A A A C B C A C B B C B B D A D B B C A A C A')
cie=amap('B')

sur=amap('D C C B B')
des=amap('B A A C D A A A B A B D B A B D B B D D C C B C B A B C D C')
fra=amap('C D D B C')
glo=amap('C B A B B C B A D B A A C C B D A B A B A B A B D A D B B A B B B D B C D C D D B B B A C A D D C D B')
juv=amap('D D C C A C C D D D C D C C C C B')
mov=amap('B A A B C B D B C C A C C A C A D A D')
rel=amap('C A D B A C B D C B C D C A B A A C C B B D C A C C A B D A D A B')

Q=[]
for spec in [
    (907,917,5,41,'Filosofia','Filosofia e política','UECE-FIL-POL',pol),
    (918,923,1,25,'Filosofia','Filosofia medieval','UECE-FIL-MED',med),
    (924,932,1,36,'Filosofia','Filosofia moderna','UECE-FIL-MOD',mod),
    (933,934,1,7,'Filosofia','Mitologia','UECE-FIL-MIT',mit),
    (935,937,1,10,'Filosofia','Liberalismo, silogismo e materialismo histórico','UECE-FIL-LIB',lib),
    (938,941,1,13,'Filosofia','Indústria cultural, estética e arte','UECE-FIL-IND',ind),
    (942,949,1,32,'Filosofia','Racionalismo, epistemologia e empirismo','UECE-FIL-RAT',rat),
    (950,950,1,1,'Filosofia','Filosofia da ciência','UECE-FIL-CIE',cie),
    (954,955,1,5,'Sociologia','Surgimento da sociologia','UECE-SOC-SUR',sur),
    (956,965,1,30,'Sociologia','Desigualdade e estratificação social','UECE-SOC-DES',des),
    (966,967,1,5,'Sociologia','Escola de Frankfurt','UECE-SOC-FRA',fra),
    (968,983,1,51,'Sociologia','Globalização e cultura','UECE-SOC-GLO',glo),
    (984,988,1,17,'Sociologia','Juventude, diversidade e violência','UECE-SOC-JUV',juv),
    (989,994,1,19,'Sociologia','Movimentos e problemas sociais','UECE-SOC-MOV',mov),
    (995,998,1,12,'Sociologia','Relações étnico-raciais e gênero','UECE-SOC-REL',rel),
]:
    Q+=take(*spec)

if len(Q)!=300 or len({q['id'] for q in Q})!=300:
    raise RuntimeError(f'count {len(Q)}')

for q in Q:
    if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']):
        raise RuntimeError('conteúdo incompleto '+q['id'])
    if q['answer'] not in range(4) or not q['discipline'] or not q['topic'] or not q['source'] or not q['origin']:
        raise RuntimeError('metadados incompletos '+q['id'])
    if TEXT_REF.search(q['statement']) and not q['context']:
        raise RuntimeError('texto-base ausente '+q['id'])
    if MEDIA_REF.search(q['statement']) and not q.get('media'):
        raise RuntimeError('mídia ausente '+q['id'])

for k in range(15):
    name=f'UECE_FIL_SOC_LOTE_300_20_P{k+1:02d}'
    chunk=Q[k*20:(k+1)*20]
    (OUT/f'ueceFilosofiaSociologiaLote300_20_p{k+1:02d}.js').write_text(
        'export const '+name+'='+json.dumps(chunk,ensure_ascii=False,separators=(',',':'))+';\n',
        encoding='utf-8'
    )

imports='\n'.join(
    f'import{{UECE_FIL_SOC_LOTE_300_20_P{k:02d}}}from"./ueceFilosofiaSociologiaLote300_20_p{k:02d}.js";'
    for k in range(1,16)
)
spreads=','.join(f'...UECE_FIL_SOC_LOTE_300_20_P{k:02d}' for k in range(1,16))
(OUT/'ueceFilosofiaSociologiaLote300_20.js').write_text(
    imports+f'\nexport const UECE_FIL_SOC_LOTE_300_20=[{spreads}];\n',
    encoding='utf-8'
)

r=ROOT/'src/data/questionRegistry.js'
t=r.read_text(encoding='utf-8')
imp='import{UECE_FIL_SOC_LOTE_300_20}from"./questionSources/ueceFilosofiaSociologiaLote300_20";'
anchor='import{UECE_GEO_FIL_LOTE_300_19}from"./questionSources/ueceGeografiaFilosofiaLote300_19";'
if imp not in t:
    if anchor not in t:
        raise RuntimeError('âncora lote 19 ausente')
    t=t.replace(anchor,anchor+'\n'+imp)

needle='...UECE_GEO_FIL_LOTE_300_19].map(sanitizeQuestion)'
if needle in t:
    t=t.replace(needle,'...UECE_GEO_FIL_LOTE_300_19,...UECE_FIL_SOC_LOTE_300_20].map(sanitizeQuestion)')
elif '...UECE_FIL_SOC_LOTE_300_20].map(sanitizeQuestion)' not in t:
    raise RuntimeError('registry mudou')
r.write_text(t,encoding='utf-8')

VERIFIER = 'import { UECE_FIL_SOC_LOTE_300_20 as Q } from "../src/data/questionSources/ueceFilosofiaSociologiaLote300_20.js";\nimport { auditQuestionBank } from "../src/data/questionAuditEngine.js";\n\nif (Q.length !== 300) throw new Error(`count ${Q.length}`);\nif (new Set(Q.map(q=>q.id)).size !== 300) throw new Error("ids duplicados");\n\nconst c=Q.reduce((a,q)=>(a[q.discipline]=(a[q.discipline]||0)+1,a),{});\nif(c.Filosofia!==161||c.Sociologia!==139) throw new Error(JSON.stringify(c));\n\nconst audit=auditQuestionBank(Q);\nif(audit.stats.raw!==300||audit.stats.published!==300||audit.stats.quarantined!==0||audit.stats.duplicates!==0){\n  console.error(audit.quarantined.map(q=>({id:q.id,issues:q.auditIssues})));\n  console.error(audit.duplicates.map(q=>({id:q.id,duplicateOf:q.duplicateOf})));\n  throw new Error(`catraca falhou: ${JSON.stringify(audit.stats)}`);\n}\n\nconsole.log("Lote 20 OK — 300/300 | Filosofia 161 | Sociologia 139 | quarentena 0 | duplicadas 0");\n'
(ROOT/'scripts/verificar_uece_lote_20_300.mjs').write_text(VERIFIER,encoding='utf-8')

print('Lote 20 preparado: 300/300 — Filosofia 161 + Sociologia 139')
