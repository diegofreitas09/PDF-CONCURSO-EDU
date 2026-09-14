import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote10_source.pdf'
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

# 70 questões finais de Português + 30 primeiras de Educação Física.
# As chaves abaixo foram transcritas da grade GABARITOS da própria apostila.
sections=[
 ('PORT','GRAM','Gramática',509,535,39,41,list('DACDACBCBABDCACDACADDADBCACBBADABCADACABD')),
 ('PORT','MORF','Morfologia textual',536,548,1,23,list('ADDDCABCABAABABDCBADBCC')),
 ('PORT','PONT','Pontuação',549,556,1,10,list('ABCDABCBBA')),
 ('PORT','SEM','Semântica',557,564,1,16,list('ADAADBDDAAACABBD')),
 ('PORT','SINT','Sintaxe',565,574,1,13,list('ACAACDABACCCA')),
 ('PORT','VERB','Verbo',575,579,1,5,list('CCBAA')),
 ('EDF','SAUDE','Saúde',581,585,1,21,list('CBAAAAAABADDACACCABAB')),
 ('EDF','ESP','Esporte e manifestação cultural',586,590,1,9,list('DBDBADCDD')),
]
expected_key_lengths={'GRAM':41,'MORF':23,'PONT':10,'SEM':16,'SINT':13,'VERB':5,'SAUDE':21,'ESP':9}
for _,code,_,_,_,_,_,keys in sections:
    if len(keys)!=expected_key_lengths[code]:
        raise SystemExit(f'grade oficial inconsistente: {code} {len(keys)}/{expected_key_lengths[code]}')

letter_to_i={c:i for i,c in enumerate('ABCD')}
origin='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'
rows=[]
for disc,code,topic,a,b,lo,hi,keys in sections:
    txt=stream(a,b)
    ms=list(re.finditer(r'(?<!\d)(\d{1,3})\)\s*\((UECE\s+\d{4}\.\s*\d[^)]*)\)',txt,re.I))
    nums=[int(m.group(1)) for m in ms]
    missing=[n for n in range(lo,hi+1) if n not in nums]
    if missing:
        raise SystemExit(f'itens ausentes/incompletos em {code}: {missing}')
    context=txt[:ms[0].start()]
    for i,m in enumerate(ms):
        n=int(m.group(1)); end=ms[i+1].start() if i+1<len(ms) else len(txt)
        chunk=txt[m.end():end]
        marks=[re.search(rf'\s{L}\)\s',chunk) for L in 'ABCD']
        if not all(marks) or not all(marks[j].start()<marks[j+1].start() for j in range(3)):
            if lo<=n<=hi: raise SystemExit(f'alternativas incompletas: {code} {n}')
            continue
        am,bm,cm,dm=marks
        statement=chunk[:am.start()]
        A=chunk[am.end():bm.start()]; B=chunk[bm.end():cm.start()]; C=chunk[cm.end():dm.start()]; drest=chunk[dm.end():]
        cuts=[]
        for pat in [r'\sTexto\s+(?:para|I\b|II\b)',r'\sTEXTO\s+(?:I|II)\b',r'\sTexto-base\b',r'\sGABARITOS\b',r'\sMORFOLOGIA TEXTUAL\b',r'\sPONTUAÇÃO\b',r'\sSEMÂNTICA\b',r'\sSINTAXE\b',r'\sVERBO\b',r'\sEDUCAÇÃO FÍSICA\b',r'\sSAÚDE\b',r'\sESPORTE E MANIFESTA',r'\s⟦B\d+:']:
            mm=re.search(pat,drest,re.I)
            if mm: cuts.append(mm.start())
        cut=min(cuts) if cuts else len(drest)
        D=drest[:cut]; tail=drest[cut:]
        statement,A,B,C,D=map(clean,[statement,A,B,C,D])
        if lo<=n<=hi:
            if not statement or any(not x for x in (A,B,C,D)):
                raise SystemExit(f'item não íntegro: {code} {n}')
            letter=keys[n-1]
            prefix='UECE-PORT' if disc=='PORT' else 'UECE-EDF'
            rows.append({'id':f'{prefix}-{code}-{n:03d}','discipline':'Português' if disc=='PORT' else 'Educação Física','topic':topic,'context':clean(context),'statement':statement,'options':[A,B,C,D],'answer':letter_to_i[letter],'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2)),'origin':origin,'reviewed':True})
        if len(clean(tail))>20: context=tail

context_pats=[r'\bno texto\b',r'\bde acordo com o texto\b',r'\bcom base no texto\b',r'\ba partir do texto\b',r'\bsegundo o texto\b',r'texto acima',r'texto anterior',r'leia o texto',r'leia o trecho',r'considere o texto',r'observe o texto',r'\bno trecho\b',r'parágrafo',r'autor do texto',r'ideia central do texto']
def depends(s):
    z=s.lower(); return any(re.search(p,z) for p in context_pats)
for q in rows:
    if not depends(q['statement']): q['context']=''

expected_topics={'Gramática':3,'Morfologia textual':23,'Pontuação':10,'Semântica':16,'Sintaxe':13,'Verbo':5,'Saúde':21,'Esporte e manifestação cultural':9}
actual={}
for q in rows: actual[q['topic']]=actual.get(q['topic'],0)+1
if len(rows)!=100 or actual!=expected_topics:
    raise SystemExit(f'lote incorreto: total={len(rows)} tópicos={actual}')
if rows[0]['id']!='UECE-PORT-GRAM-039' or rows[-1]['id']!='UECE-EDF-ESP-009':
    raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100:
    raise SystemExit('IDs duplicados no lote')
if len({(q['source'],q['statement']) for q in rows})!=100:
    raise SystemExit('questões/fonte duplicadas no lote')

extra_visual=[]
for a,b in [(509,579),(581,590)]:
    for pn in range(a,b+1):
        if len(doc[pn-1].get_images(full=True))>3: extra_visual.append((pn,len(doc[pn-1].get_images(full=True))))
if extra_visual:
    raise SystemExit(f'visuais adicionais exigem mídia: {extra_visual}')

out=ROOT/'src/data/questionSources/ueceTransicaoPortuguesEducacaoFisicaLote100_10.js'
head='// UECE por Assunto — lote 10 (100 questões): Português 70 finais + Educação Física 30 iniciais.\n// Português: Gramática 39–41; Morfologia textual 1–23; Pontuação 1–10; Semântica 1–16; Sintaxe 1–13; Verbo 1–5. Educação Física: Saúde 1–21; Esporte e manifestação cultural 1–9.\n// Fonte: '+origin+'. Gabaritos conferidos na grade oficial do material.\n'
out.write_text(head+'export const UECE_TRANSICAO_PORT_EDF_LOTE_100_10 = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_10.mjs'
ver.write_text('''import { UECE_TRANSICAO_PORT_EDF_LOTE_100_10 } from "../src/data/questionSources/ueceTransicaoPortuguesEducacaoFisicaLote100_10.js";\nconst lote=UECE_TRANSICAO_PORT_EDF_LOTE_100_10,fail=m=>{console.error(`ERRO UECE lote 10: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst expect={"Gramática":3,"Morfologia textual":23,"Pontuação":10,"Semântica":16,"Sintaxe":13,"Verbo":5,"Saúde":21,"Esporte e manifestação cultural":9}; const topics={}; for(const q of lote)topics[q.topic]=(topics[q.topic]||0)+1; for(const[k,v]of Object.entries(expect))if(topics[k]!==v)fail(`tópico ${k}: ${topics[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`)); if(ids.size!==100)fail('IDs duplicados'); if(src.size!==100)fail('itens duplicados');\nfor(const q of lote){if(!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||!q.origin||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`)}\nif(lote[0].id!=="UECE-PORT-GRAM-039"||lote.at(-1).id!=="UECE-EDF-ESP-009")fail('limites divergentes'); const media=lote.filter(q=>q.media).length; console.log(`UECE lote 10 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'
s=reg.read_text(encoding='utf-8')
prev='import{UECE_PORTUGUES_LOTE_100_09}from"./questionSources/uecePortuguesLote100_09";'
imp='import{UECE_TRANSICAO_PORT_EDF_LOTE_100_10}from"./questionSources/ueceTransicaoPortuguesEducacaoFisicaLote100_10";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora de import lote 09 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_PORTUGUES_LOTE_100_09].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 09 não encontrada')
    s=s.replace(anchor,'...UECE_PORTUGUES_LOTE_100_09,...UECE_TRANSICAO_PORT_EDF_LOTE_100_10].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')

wf=ROOT/'.github/workflows/deploy-pages.yml'
w=wf.read_text(encoding='utf-8')
w=w.replace('# UECE lote 09 auditado e conectado','# UECE lote 10 auditado e conectado')
step='''\n      - name: Auditar lote UECE transicao Portugues-Educacao Fisica\n        run: node scripts/verificar_uece_lote_10.mjs\n'''
if 'verificar_uece_lote_10.mjs' not in w:
    anchor='      - name: Build\n        run: npm run build\n'
    if anchor not in w: raise SystemExit('âncora Build do Pages não encontrada')
    w=w.replace(anchor,step+'\n'+anchor)
wf.write_text(w,encoding='utf-8')

PDF.unlink(missing_ok=True)
print('UECE lote 10 gerado — Português 370–439 + Educação Física 1–30 | 100/100 | IDs 100/100 | fontes 100/100 | visuais 0')
