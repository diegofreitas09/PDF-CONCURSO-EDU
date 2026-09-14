import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote13_source.pdf'
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
        if not t or t=='TURMA DO JOTA' or t.startswith('Made with Xodo') or re.fullmatch(r'\d{3,4}',t): continue
        lines.append(t)
    return re.sub(r'\s+',' ',' '.join(lines)).strip()

def parse(a,b,topic,prefix,lo,hi,keys):
    txt=pages(a,b)
    ms=list(re.finditer(r'(?m)^\s*(\d{1,2})\)\s*\((UECE[^)]*)\)\s*',txt,re.I))
    nums=[int(m.group(1)) for m in ms]
    missing=[n for n in range(lo,hi+1) if n not in nums]
    if missing: raise SystemExit(f'itens ausentes em {topic}: {missing}')
    rows=[]
    for i,m in enumerate(ms):
        n=int(m.group(1))
        if not lo<=n<=hi: continue
        end=ms[i+1].start() if i+1<len(ms) else len(txt)
        chunk=txt[m.end():end]
        source_raw=m.group(2).strip()
        # No item 22, o PDF perdeu o ')' do cabeçalho da prova e da alternativa A na extração textual.
        # O conteúdo original está íntegro no próprio PDF; separamos apenas o trecho engolido pelo cabeçalho.
        if prefix=='UECE-HIST-CONT' and n==22 and ' Atente para as seguintes' in source_raw:
            source_raw, swallowed=source_raw.split(' Atente para as seguintes',1)
            swallowed='Atente para as seguintes'+swallowed
            swallowed=re.sub(r'\s*A\s*$','',swallowed)
            chunk=swallowed+'\nA) '+chunk
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
        if any('TURMA DO JOTA' in x or 'Made with Xodo' in x for x in [statement,*opts]): raise SystemExit(f'contaminação de cabeçalho: {prefix} {n}')
        letter=keys[n-1]
        rows.append({'id':f'{prefix}-{n:03d}','discipline':'História','topic':topic,'context':'','statement':statement,'options':opts,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',source_raw),'origin':ORIGIN,'reviewed':True})
    return rows

# Gabaritos oficiais completos das duas seções, conferidos na grade da apostila.
CONT=list('DCDBABBCCD'+'BACDBCBCAA'+'CBCBBAADAA'+'DACBDCBCCD'+'DDCABBBDAB'+'CADCADBDDD'+'CDCBACCCDA'+'CBADDBBBCC'+'BCADCCACCC'+'B')
ATU=list('CCBDCABBAC'+'BADDADDCBA'+'AA')
if len(CONT)!=91: raise SystemExit(f'gabarito Idade Contemporânea inválido: {len(CONT)}')
if len(ATU)!=22: raise SystemExit(f'gabarito Atualidades inválido: {len(ATU)}')

sections=[
    (629,649,'Idade Contemporânea','UECE-HIST-CONT',11,91,CONT),
    (650,653,'Atualidades','UECE-HIST-ATU',1,19,ATU),
]
rows=[]
for args in sections: rows.extend(parse(*args))
if len(rows)!=100: raise SystemExit(f'lote incorreto: {len(rows)}/100')
if rows[0]['id']!='UECE-HIST-CONT-011' or rows[-1]['id']!='UECE-HIST-ATU-019': raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados no lote')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('fontes/itens duplicados no lote')
expected={'Idade Contemporânea':81,'Atualidades':19}
actual={}
for q in rows: actual[q['topic']]=actual.get(q['topic'],0)+1
if actual!=expected: raise SystemExit(f'distribuição incorreta: {actual}')

# O PDF repete imagens estruturais de identidade visual. Qualquer excesso bloqueia o lote até tratamento de mídia.
visual_pages=[]
for pn in range(629,654):
    if len(doc[pn-1].get_images(full=True))>3: visual_pages.append((pn,len(doc[pn-1].get_images(full=True))))
if visual_pages: raise SystemExit(f'visuais adicionais exigem mídia/recorte original: {visual_pages}')

out=ROOT/'src/data/questionSources/ueceHistoriaLote100_13.js'
head='// UECE por Assunto — lote 13 (100 questões): História.\n// História: Idade Contemporânea 11–91; Atualidades 1–19.\n// Fonte: '+ORIGIN+'. Gabaritos conferidos na grade oficial do material.\n'
out.write_text(head+'export const UECE_HISTORIA_LOTE_100_13 = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_13.mjs'
ver.write_text('''import { UECE_HISTORIA_LOTE_100_13 as lote } from "../src/data/questionSources/ueceHistoriaLote100_13.js";\nimport { REGISTERED_QUESTIONS, QUESTION_DUPLICATES, QUESTION_QUARANTINE } from "../src/data/questionRegistry.js";\nconst fail=m=>{console.error(`ERRO UECE lote 13: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst exp={"Idade Contemporânea":81,"Atualidades":19},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes duplicadas');\nfor(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}\nif(lote[0].id!=="UECE-HIST-CONT-011"||lote[80].id!=="UECE-HIST-CONT-091"||lote[81].id!=="UECE-HIST-ATU-001"||lote.at(-1).id!=="UECE-HIST-ATU-019")fail('limites divergentes');\nconst loteIds=new Set(lote.map(q=>q.id));const connected=REGISTERED_QUESTIONS.filter(q=>loteIds.has(q.legacyId));const dup=QUESTION_DUPLICATES.filter(q=>loteIds.has(q.legacyId));const qua=QUESTION_QUARANTINE.filter(q=>loteIds.has(String(q.id)));if(connected.length!==100)fail(`conectadas ao registry: ${connected.length}/100`);if(dup.length)fail(`duplicidades contra banco: ${dup.map(q=>q.legacyId).join(', ')}`);if(qua.length)fail(`quarentena: ${qua.map(q=>q.id).join(', ')}`);\nconsole.log(`UECE lote 13 OK — 100/100 | conectadas ${connected.length}/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | duplicidades 0 | quarentena 0 | visuais 0`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'
s=reg.read_text(encoding='utf-8')
prev='import{UECE_HISTORIA_LOTE_100_12}from"./questionSources/ueceHistoriaLote100_12";'
imp='import{UECE_HISTORIA_LOTE_100_13}from"./questionSources/ueceHistoriaLote100_13";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora lote 12 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_HISTORIA_LOTE_100_12].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 12 não encontrada')
    s=s.replace(anchor,'...UECE_HISTORIA_LOTE_100_12,...UECE_HISTORIA_LOTE_100_13].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')

wf=ROOT/'.github/workflows/deploy-pages.yml'
w=wf.read_text(encoding='utf-8')
w=w.replace('# UECE lote 12 auditado e conectado','# UECE lote 13 auditado e conectado')
step='''\n      - name: Auditar lote UECE Historia 176-275\n        run: node scripts/verificar_uece_lote_13.mjs\n'''
if 'verificar_uece_lote_13.mjs' not in w:
    anchor='      - name: Build\n        run: npm run build\n'
    if anchor not in w: raise SystemExit('âncora Build não encontrada')
    w=w.replace(anchor,step+'\n'+anchor)
wf.write_text(w,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE lote 13 gerado — História Idade Contemporânea 11-91 + Atualidades 1-19 | 100/100 | IDs 100/100 | fontes 100/100 | aguardando auditor registry/mídias/build')
