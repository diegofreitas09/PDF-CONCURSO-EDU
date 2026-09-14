import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote15_source.pdf'
URL=os.environ.get('UECE_PDF_URL','')
if not URL: raise SystemExit('UECE_PDF_URL ausente')
urllib.request.urlretrieve(URL,PDF)
doc=fitz.open(PDF)
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'

def pages(a,b): return '\n'.join(doc[p-1].get_text('text') for p in range(a,b+1))
def clean(s):
    lines=[]
    for line in s.splitlines():
        t=line.strip()
        if not t or t=='TURMA DO JOTA' or t.startswith('Made with Xodo') or re.fullmatch(r'\d{3,4}',t): continue
        lines.append(t)
    return re.sub(r'\s+',' ',' '.join(lines)).strip().replace('Detalhe ObraFor m.do','DetalheObraForm.do')

REP=list('DACCBDCDBD'+'CBBDCCDDAC'+'BDBDCCBCBD'+'BCBDADCBBC'+'DCCDCCBCAA'+'ADBBBDBBCB'+'ACDB')
VAR=list('BAACDBCDBA'+'CBCDBCDDCC'+'BAACDDBB')
DIT=list('CDAAABAC')
assert [len(x) for x in (REP,VAR,DIT)]==[64,28,8]

def parse(a,b,topic,prefix,lo,hi,keys):
    txt=pages(a,b)
    ms=list(re.finditer(r'(?m)^\s*(\d{1,2})\)\s*\((UECE[^)]*)\)\s*',txt,re.I))
    rows=[]
    for i,m in enumerate(ms):
        n=int(m.group(1))
        if not lo<=n<=hi: continue
        end=ms[i+1].start() if i+1<len(ms) else len(txt)
        chunk=txt[m.end():end]
        marks=list(re.finditer(r'(?<!\w)([ABCD])\)\s*',chunk)); chosen=[]; pos=0
        for mark in marks:
            if mark.group(1)=='ABCD'[pos]:
                chosen.append(mark); pos+=1
                if pos==4: break
        if len(chosen)!=4: raise SystemExit(f'alternativas incompletas: {prefix}-{n:03d}')
        statement=clean(chunk[:chosen[0].start()])
        opts=[clean(chunk[chosen[j].end():(chosen[j+1].start() if j<3 else len(chunk))]) for j in range(4)]
        if not statement or any(not x for x in opts): raise SystemExit(f'item não íntegro: {prefix}-{n:03d}')
        letter=keys[n-1]
        rows.append({'id':f'{prefix}-{n:03d}','discipline':'História','topic':topic,'context':'','statement':statement,'options':opts,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2).strip()),'origin':ORIGIN,'reviewed':True})
    return rows

rows=[]
rows.extend(parse(678,694,'Brasil República','UECE-HIST-REP',1,64,REP))
rows.extend(parse(695,701,'Era Vargas','UECE-HIST-VAR',1,28,VAR))
rows.extend(parse(702,710,'Ditadura','UECE-HIST-DIT',1,8,DIT))
if len(rows)!=100: raise SystemExit(f'lote incorreto: {len(rows)}/100')
if rows[0]['id']!='UECE-HIST-REP-001' or rows[-1]['id']!='UECE-HIST-DIT-008': raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('fontes/itens duplicados')
expected={'Brasil República':64,'Era Vargas':28,'Ditadura':8}; got={}
for q in rows: got[q['topic']]=got.get(q['topic'],0)+1
if got!=expected: raise SystemExit(f'distribuição incorreta: {got}')
visual=[]
for pn in range(678,711):
    n=len(doc[pn-1].get_images(full=True))
    if n>3: visual.append((pn,n))
if visual: raise SystemExit(f'visuais adicionais exigem mídia: {visual}')

src=ROOT/'src/data/questionSources'; src.mkdir(parents=True,exist_ok=True)
for i in range(5):
    part=rows[i*20:(i+1)*20]; name=f'UECE_HISTORIA_LOTE_100_15_P0{i+1}'
    (src/f'ueceHistoriaLote100_15_p0{i+1}.js').write_text(f'// UECE lote 15 — parte {i+1}/5 ({part[0]["id"]} a {part[-1]["id"]}).\nexport const {name} = '+json.dumps(part,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
agg=''.join([f'import{{UECE_HISTORIA_LOTE_100_15_P0{i}}}from"./ueceHistoriaLote100_15_p0{i}";\n' for i in range(1,6)])
agg+='export const UECE_HISTORIA_LOTE_100_15=[...UECE_HISTORIA_LOTE_100_15_P01,...UECE_HISTORIA_LOTE_100_15_P02,...UECE_HISTORIA_LOTE_100_15_P03,...UECE_HISTORIA_LOTE_100_15_P04,...UECE_HISTORIA_LOTE_100_15_P05];\n'
(src/'ueceHistoriaLote100_15.js').write_text(agg,encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_15.mjs'
ver.write_text('''import fs from "node:fs";\nimport { UECE_HISTORIA_LOTE_100_15 as lote } from "../src/data/questionSources/ueceHistoriaLote100_15.js";\nconst fail=m=>{console.error(`ERRO UECE lote 15: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst exp={"Brasil República":64,"Era Vargas":28,"Ditadura":8},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes/itens duplicados');\nfor(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}\nif(lote[0].id!=="UECE-HIST-REP-001"||lote[63].id!=="UECE-HIST-REP-064"||lote[64].id!=="UECE-HIST-VAR-001"||lote[91].id!=="UECE-HIST-VAR-028"||lote[92].id!=="UECE-HIST-DIT-001"||lote.at(-1).id!=="UECE-HIST-DIT-008")fail('limites divergentes');\nconst reg=fs.readFileSync(new URL('../src/data/questionRegistry.js',import.meta.url),'utf8');\nif(!reg.includes('import{UECE_HISTORIA_LOTE_100_15}from"./questionSources/ueceHistoriaLote100_15";'))fail('import do lote 15 ausente no registry');\nif(!reg.includes('...UECE_HISTORIA_LOTE_100_14,...UECE_HISTORIA_LOTE_100_15].map(sanitizeQuestion)'))fail('lote 15 não conectado ao RAW_QUESTIONS');\nconsole.log(`UECE lote 15 OK — 100/100 | conectado ao registry | IDs ${ids.size}/100 | fontes ${src.size}/100 | duplicidades internas 0 | visuais 0 | correções 0`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'; s=reg.read_text(encoding='utf-8')
prev='import{UECE_HISTORIA_LOTE_100_14}from"./questionSources/ueceHistoriaLote100_14";'; imp='import{UECE_HISTORIA_LOTE_100_15}from"./questionSources/ueceHistoriaLote100_15";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora lote 14 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_HISTORIA_LOTE_100_14].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 14 não encontrada')
    s=s.replace(anchor,'...UECE_HISTORIA_LOTE_100_14,...UECE_HISTORIA_LOTE_100_15].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE lote 15 gerado — 100/100 | Brasil República 1-64 + Era Vargas 1-28 + Ditadura 1-8 | correções 0 | visuais 0')
