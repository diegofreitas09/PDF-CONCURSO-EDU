import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote11_source.pdf'
URL=os.environ.get('UECE_PDF_URL','')
if not URL: raise SystemExit('UECE_PDF_URL ausente')
urllib.request.urlretrieve(URL,PDF)
doc=fitz.open(PDF)
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'

def pages(a,b):
    return '\n'.join(doc[p-1].get_text('text') for p in range(a,b+1))

def clean(s):
    lines=[]
    for line in s.splitlines():
        t=line.strip()
        if not t or t=='TURMA DO JOTA' or t.startswith('Made with Xodo') or re.fullmatch(r'\d{3}',t): continue
        lines.append(t)
    return re.sub(r'\s+',' ',' '.join(lines)).strip()

def parse(a,b,disc,topic,prefix,lo,hi,keys):
    txt=pages(a,b)
    ms=list(re.finditer(r'(?m)^\s*(\d+)\)\s*\((UECE[^)]*)\)\s*',txt,re.I))
    nums=[int(m.group(1)) for m in ms]
    missing=[n for n in range(lo,hi+1) if n not in nums]
    if missing: raise SystemExit(f'itens ausentes em {topic}: {missing}')
    rows=[]
    for i,m in enumerate(ms):
        n=int(m.group(1))
        if not lo<=n<=hi: continue
        end=ms[i+1].start() if i+1<len(ms) else len(txt)
        chunk=txt[m.end():end]
        marks=list(re.finditer(r'(?<!\w)([ABCD])\)\s*',chunk))
        chosen=[]; pos=0
        for mark in marks:
            if mark.group(1)=='ABCD'[pos]:
                chosen.append(mark); pos+=1
                if pos==4: break
        if len(chosen)!=4: raise SystemExit(f'alternativas incompletas: {prefix} {n}')
        statement=clean(chunk[:chosen[0].start()])
        opts=[]
        for j,mark in enumerate(chosen):
            oe=chosen[j+1].start() if j<3 else len(chunk)
            opts.append(clean(chunk[mark.end():oe]))
        if not statement or any(not x for x in opts): raise SystemExit(f'item não íntegro: {prefix} {n}')
        letter=keys[n-1]
        rows.append({'id':f'{prefix}-{n:03d}','discipline':disc,'topic':topic,'context':'','statement':statement,'options':opts,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2).strip()),'origin':ORIGIN,'reviewed':True})
    return rows

SPORT=list('DBDBADCDDB'+'CBDACCCADD'+'DACCCDBD')
SOC=list('AADADC')
HISTORIO=list('DACBCBBDACADAD')
ANT=list('ACDBADDBBA'+'DBDCAACDAA'+'DACDCDCCDC'+'ABCCBCCDDD'+'BADBACACDC')
MED=list('BAACACCADA'+'A')
sections=[
    (586,590,'Educação Física','Esporte e manifestação cultural','UECE-EDF-ESP',10,28,SPORT),
    (591,592,'Educação Física','Sociedade e causas sociais','UECE-EDF-SOC',1,6,SOC),
    (595,597,'História','Historiografia e pré-história','UECE-HIST-HISTORIO',1,14,HISTORIO),
    (598,607,'História','Idade Antiga','UECE-HIST-ANT',1,50,ANT),
    (608,610,'História','Idade Média','UECE-HIST-MED',1,11,MED),
]
rows=[]
for args in sections: rows.extend(parse(*args))
if len(rows)!=100: raise SystemExit(f'lote incorreto: {len(rows)}/100')
if rows[0]['id']!='UECE-EDF-ESP-010' or rows[-1]['id']!='UECE-HIST-MED-011': raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('fontes/itens duplicados')
expected={'Esporte e manifestação cultural':19,'Sociedade e causas sociais':6,'Historiografia e pré-história':14,'Idade Antiga':50,'Idade Média':11}
actual={}
for q in rows: actual[q['topic']]=actual.get(q['topic'],0)+1
if actual!=expected: raise SystemExit(f'distribuição incorreta: {actual}')
# O PDF contém 3 imagens estruturais repetidas por página (cabeçalho/logos). Qualquer quantidade maior exige mídia específica.
visual_pages=[]
for pn in list(range(586,593))+list(range(595,611)):
    if len(doc[pn-1].get_images(full=True))>3: visual_pages.append((pn,len(doc[pn-1].get_images(full=True))))
if visual_pages: raise SystemExit(f'visuais adicionais exigem mídia: {visual_pages}')

out=ROOT/'src/data/questionSources/ueceTransicaoEducacaoFisicaHistoriaLote100_11.js'
head='// UECE por Assunto — lote 11 (100 questões): Educação Física 25 finais + História 75 iniciais.\n// Educação Física: Esporte e manifestação cultural 10–28; Sociedade e causas sociais 1–6.\n// História: Historiografia e pré-história 1–14; Idade Antiga 1–50; Idade Média 1–11.\n// Fonte: '+ORIGIN+'. Gabaritos conferidos na grade oficial do material.\n'
out.write_text(head+'export const UECE_TRANSICAO_EDF_HIST_LOTE_100_11 = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_11.mjs'
ver.write_text('''import { UECE_TRANSICAO_EDF_HIST_LOTE_100_11 as lote } from "../src/data/questionSources/ueceTransicaoEducacaoFisicaHistoriaLote100_11.js";\nconst fail=m=>{console.error(`ERRO UECE lote 11: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst exp={"Esporte e manifestação cultural":19,"Sociedade e causas sociais":6,"Historiografia e pré-história":14,"Idade Antiga":50,"Idade Média":11}, got={}; for(const q of lote)got[q.topic]=(got[q.topic]||0)+1; for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`)); if(ids.size!==100)fail('IDs duplicados'); if(src.size!==100)fail('fontes duplicadas');\nfor(const q of lote){if(!q.id||!q.discipline||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`)}\nif(lote[0].id!=="UECE-EDF-ESP-010"||lote.at(-1).id!=="UECE-HIST-MED-011")fail('limites divergentes'); console.log(`UECE lote 11 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais 0`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'
s=reg.read_text(encoding='utf-8')
prev='import{UECE_TRANSICAO_PORT_EDF_LOTE_100_10_CORRIGIDO}from"./questionSources/ueceTransicaoPortuguesEducacaoFisicaLote100_10Corrigido";'
imp='import{UECE_TRANSICAO_EDF_HIST_LOTE_100_11}from"./questionSources/ueceTransicaoEducacaoFisicaHistoriaLote100_11";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora lote 10 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_TRANSICAO_PORT_EDF_LOTE_100_10_CORRIGIDO].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 10 não encontrada')
    s=s.replace(anchor,'...UECE_TRANSICAO_PORT_EDF_LOTE_100_10_CORRIGIDO,...UECE_TRANSICAO_EDF_HIST_LOTE_100_11].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')

wf=ROOT/'.github/workflows/deploy-pages.yml'
w=wf.read_text(encoding='utf-8')
step='''\n      - name: Auditar lote UECE transicao Educacao Fisica-Historia\n        run: node scripts/verificar_uece_lote_11.mjs\n'''
if 'verificar_uece_lote_11.mjs' not in w:
    anchor='      - name: Build\n        run: npm run build\n'
    if anchor not in w: raise SystemExit('âncora Build não encontrada')
    w=w.replace(anchor,step+'\n'+anchor)
wf.write_text(w,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE lote 11 gerado — Educação Física 31–55 + História 1–75 | 100/100 | IDs 100/100 | fontes 100/100 | visuais 0')
