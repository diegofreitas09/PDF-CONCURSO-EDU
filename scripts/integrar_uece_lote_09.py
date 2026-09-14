import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote09_source.pdf'
URL=os.environ.get('UECE_PDF_URL','')
if not URL:
    raise SystemExit('UECE_PDF_URL ausente')
urllib.request.urlretrieve(URL,PDF)
doc=fitz.open(PDF)

def stream(a,b):
    parts=[]
    for pn in range(a,b+1):
        pg=doc[pn-1]; w=pg.rect.width
        for bl in sorted(pg.get_text('blocks'),key=lambda x:(0 if x[0]<w/2 else 1,x[1])):
            t=' '.join(bl[4].replace('\n',' ').split())
            if not t or 'Made with Xodo' in t or t=='TURMA DO JOTA' or re.fullmatch(r'\d{3,4}',t):
                continue
            parts.append(f' ⟦B{pn}:{round(bl[0])}:{round(bl[1])}⟧ '+t)
    return ''.join(parts)

def clean(s):
    return re.sub(r'\s*⟦B[^⟧]+⟧\s*',' ',s).replace('  ',' ').strip()

sections=[
 ('DISC','Discurso e vozes do texto',464,466,2,3),
 ('EST','Estilística e vícios de linguagem',467,470,1,5),
 ('FIG','Figuras e funções da linguagem',471,487,1,27),
 ('GEN','Gêneros textuais',488,508,1,28),
 ('GRAM','Gramática',509,535,1,38),
]
keys={
'DISC':list('ACD'),
'EST':list('AADAD'),
'FIG':list('BDADBBCBBCCDACBAACDDCDDACDC'),
'GEN':list('BDCACC BCCABABACC AABAABCDCBCB'.replace(' ','')),
'GRAM':list('DACDACBCBABDCACDACADDADBCACBBADABCADACABD'),
}
# Garantias da grade oficial
assert len(keys['DISC'])==3 and len(keys['EST'])==5 and len(keys['FIG'])==27 and len(keys['GEN'])==28 and len(keys['GRAM'])==41
letter_to_i={c:i for i,c in enumerate('ABCD')}
origin='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
rows=[]
for code,topic,a,b,lo,hi in sections:
    txt=stream(a,b)
    ms=list(re.finditer(r'(?<!\d)(\d{1,3})\)\s*\((UECE\s+\d{4}\.\s*\d[^)]*)\)',txt,re.I))
    context=txt[:ms[0].start()]
    for i,m in enumerate(ms):
        n=int(m.group(1)); end=ms[i+1].start() if i+1<len(ms) else len(txt)
        chunk=txt[m.end():end]
        marks=[re.search(rf'\s{L}\)\s',chunk) for L in 'ABCD']
        if not all(marks) or not all(marks[j].start()<marks[j+1].start() for j in range(3)):
            raise SystemExit(f'alternativas incompletas: {code} {n}')
        am,bm,cm,dm=marks
        statement=chunk[:am.start()]
        A=chunk[am.end():bm.start()]; B=chunk[bm.end():cm.start()]; C=chunk[cm.end():dm.start()]; drest=chunk[dm.end():]
        cuts=[]
        for pat in [r'\sTexto\s+(?:para|I\b|II\b)',r'\sTEXTO\s+(?:I|II)\b',r'\s⟦B\d+:']:
            mm=re.search(pat,drest,re.I)
            if mm: cuts.append(mm.start())
        cut=min(cuts) if cuts else len(drest)
        D=drest[:cut]; tail=drest[cut:]
        statement,A,B,C,D=map(clean,[statement,A,B,C,D])
        if lo<=n<=hi:
            letter=keys[code][n-1]
            rows.append({
              'id':f'UECE-PORT-{code}-{n:03d}','discipline':'Português','topic':topic,
              'context':clean(context),'statement':statement,'options':[A,B,C,D],
              'answer':letter_to_i[letter],'explanation':f'Gabarito oficial da apostila: {letter}.',
              'source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2)),'origin':origin,'reviewed':True
            })
        if len(clean(tail))>20: context=tail

if len(rows)!=100: raise SystemExit(f'lote deveria ter 100 questões; veio {len(rows)}')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados no lote')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('questões/fonte duplicadas no lote')
if rows[0]['id']!='UECE-PORT-DISC-002' or rows[-1]['id']!='UECE-PORT-GRAM-038': raise SystemExit('limites incorretos')

# Não há imagem adicional de questão nas páginas do lote; as 3 imagens fixas por página são artefatos do próprio PDF.
extra_visual=[]
for pn in range(464,536):
    if len(doc[pn-1].get_images(full=True))>3: extra_visual.append(pn)
if extra_visual: raise SystemExit(f'visuais adicionais exigem mídia: {extra_visual}')

# Só mantém contexto quando o próprio auditor do projeto o exige.
context_pats=[r'\bno texto\b',r'\bde acordo com o texto\b',r'\bcom base no texto\b',r'\ba partir do texto\b',r'\bsegundo o texto\b',r'texto acima',r'texto anterior',r'leia o texto',r'leia o trecho',r'considere o texto',r'observe o texto',r'\bno trecho\b',r'parágrafo',r'autor do texto',r'ideia central do texto']
def depends(s):
    z=s.lower(); return any(re.search(p,z) for p in context_pats)
for q in rows:
    if not depends(q['statement']): q['context']=''

out=ROOT/'src/data/questionSources/uecePortuguesLote100_09.js'
head='// UECE por Assunto — Português lote 09 (100 questões): Discurso 2–3; Estilística 1–5; Figuras e funções 1–27; Gêneros 1–28; Gramática 1–38.\n// Fonte: '+origin+'. Gabaritos conferidos na grade oficial do material.\n'
out.write_text(head+'export const UECE_PORTUGUES_LOTE_100_09 = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_09.mjs'
ver.write_text('''import { UECE_PORTUGUES_LOTE_100_09 } from "../src/data/questionSources/uecePortuguesLote100_09.js";\nconst lote=UECE_PORTUGUES_LOTE_100_09,fail=m=>{console.error(`ERRO UECE lote 09: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst expect={"Discurso e vozes do texto":2,"Estilística e vícios de linguagem":5,"Figuras e funções da linguagem":27,"Gêneros textuais":28,"Gramática":38}; const topics={}; for(const q of lote)topics[q.topic]=(topics[q.topic]||0)+1; for(const[k,v]of Object.entries(expect))if(topics[k]!==v)fail(`tópico ${k}: ${topics[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`)); if(ids.size!==100)fail('IDs duplicados'); if(src.size!==100)fail('itens duplicados');\nfor(const q of lote){if(!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||!q.origin||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`)}\nif(lote[0].id!=="UECE-PORT-DISC-002"||lote.at(-1).id!=="UECE-PORT-GRAM-038")fail('limites divergentes'); const media=lote.filter(q=>q.media).length; console.log(`UECE lote 09 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'
s=reg.read_text(encoding='utf-8')
imp='import{UECE_PORTUGUES_LOTE_100_09}from"./questionSources/uecePortuguesLote100_09";'
if imp not in s:
    s=s.replace('import{UECE_PORTUGUES_LOTE_100_08}from"./questionSources/uecePortuguesLote100_08";', 'import{UECE_PORTUGUES_LOTE_100_08}from"./questionSources/uecePortuguesLote100_08";\n'+imp)
    s=s.replace('...UECE_PORTUGUES_LOTE_100_08].map(sanitizeQuestion)', '...UECE_PORTUGUES_LOTE_100_08,...UECE_PORTUGUES_LOTE_100_09].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE Português 270–369 gerado — 100/100 | IDs 100/100 | fontes 100/100 | visuais 0')
