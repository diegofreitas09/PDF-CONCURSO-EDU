import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote12_source.pdf'
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
        rows.append({'id':f'{prefix}-{n:03d}','discipline':'História','topic':topic,'context':'','statement':statement,'options':opts,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2).strip()),'origin':ORIGIN,'reviewed':True})
    return rows

MED=list('BAACACCADA'+'ABCBDBADDC'+'BBBDBCD BDB'.replace(' ','')+'DAADACABCD'+'BCBD BADAB'.replace(' ',''))
# Grade oficial completa da Idade Média (1-51); o lote usa 12-51.
MED=list('BAACACCADA'+'AABCBDBADDC'+'BBBDBCD BDB'.replace(' ','')+'DAADACABCD'+'BCBDBADAB'.replace(' ',''))
MOD=list('DDCDADC DCB'.replace(' ','')+'DADCB DABAD'.replace(' ','')+'BABBAADADD'+'CBBBABBAAC'+'CDAACCBBAD')
CONT=list('DCDBABBCCD')
if len(MED)!=51: raise SystemExit(f'gabarito Idade Média inválido: {len(MED)}')
if len(MOD)!=50: raise SystemExit(f'gabarito Idade Moderna inválido: {len(MOD)}')
if len(CONT)!=10: raise SystemExit(f'gabarito Idade Contemporânea inválido: {len(CONT)}')

sections=[
    (609,618,'Idade Média','UECE-HIST-MED',12,51,MED),
    (619,628,'Idade Moderna','UECE-HIST-MOD',1,50,MOD),
    (629,631,'Idade Contemporânea','UECE-HIST-CONT',1,10,CONT),
]
rows=[]
for args in sections: rows.extend(parse(*args))
if len(rows)!=100: raise SystemExit(f'lote incorreto: {len(rows)}/100')
if rows[0]['id']!='UECE-HIST-MED-012' or rows[-1]['id']!='UECE-HIST-CONT-010': raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('fontes/itens duplicados')
expected={'Idade Média':40,'Idade Moderna':50,'Idade Contemporânea':10}
actual={}
for q in rows: actual[q['topic']]=actual.get(q['topic'],0)+1
if actual!=expected: raise SystemExit(f'distribuição incorreta: {actual}')
# O PDF usa três imagens estruturais repetidas por página (identidade visual). Acima disso exige mídia de questão.
visual_pages=[]
for pn in range(609,632):
    if len(doc[pn-1].get_images(full=True))>3: visual_pages.append((pn,len(doc[pn-1].get_images(full=True))))
if visual_pages: raise SystemExit(f'visuais adicionais exigem mídia: {visual_pages}')

out=ROOT/'src/data/questionSources/ueceHistoriaLote100_12.js'
head='// UECE por Assunto — lote 12 (100 questões): História.\n// História: Idade Média 12–51; Idade Moderna 1–50; Idade Contemporânea 1–10.\n// Fonte: '+ORIGIN+'. Gabaritos conferidos na grade oficial do material.\n'
out.write_text(head+'export const UECE_HISTORIA_LOTE_100_12 = '+json.dumps(rows,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_12.mjs'
ver.write_text('''import { UECE_HISTORIA_LOTE_100_12 as lote } from "../src/data/questionSources/ueceHistoriaLote100_12.js";\nconst fail=m=>{console.error(`ERRO UECE lote 12: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst exp={"Idade Média":40,"Idade Moderna":50,"Idade Contemporânea":10},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes duplicadas');\nfor(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}\nif(lote[0].id!=="UECE-HIST-MED-012"||lote[39].id!=="UECE-HIST-MED-051"||lote[40].id!=="UECE-HIST-MOD-001"||lote[89].id!=="UECE-HIST-MOD-050"||lote[90].id!=="UECE-HIST-CONT-001"||lote.at(-1).id!=="UECE-HIST-CONT-010")fail('limites divergentes');\nconsole.log(`UECE lote 12 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais 0`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'
s=reg.read_text(encoding='utf-8')
prev='import{UECE_TRANSICAO_EDF_HIST_LOTE_100_11}from"./questionSources/ueceTransicaoEducacaoFisicaHistoriaLote100_11";'
imp='import{UECE_HISTORIA_LOTE_100_12}from"./questionSources/ueceHistoriaLote100_12";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora lote 11 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_TRANSICAO_EDF_HIST_LOTE_100_11].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 11 não encontrada')
    s=s.replace(anchor,'...UECE_TRANSICAO_EDF_HIST_LOTE_100_11,...UECE_HISTORIA_LOTE_100_12].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')

wf=ROOT/'.github/workflows/deploy-pages.yml'
w=wf.read_text(encoding='utf-8')
w=w.replace('# UECE lote 11 auditado e conectado','# UECE lote 12 auditado e conectado')
step='''\n      - name: Auditar lote UECE Historia 76-175\n        run: node scripts/verificar_uece_lote_12.mjs\n'''
if 'verificar_uece_lote_12.mjs' not in w:
    anchor='      - name: Build\n        run: npm run build\n'
    if anchor not in w: raise SystemExit('âncora Build não encontrada')
    w=w.replace(anchor,step+'\n'+anchor)
wf.write_text(w,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE lote 12 gerado — História Idade Média 12-51 + Idade Moderna 1-50 + Idade Contemporânea 1-10 | 100/100 | IDs 100/100 | fontes 100/100 | visuais 0')
