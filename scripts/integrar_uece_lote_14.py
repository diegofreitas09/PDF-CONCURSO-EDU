import json, os, re, urllib.request
from pathlib import Path
import fitz

ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'uece_lote14_source.pdf'
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

ATU=list('CCBDCABBAC'+'BADDADDCBA'+'AA')
COL=list('CBBADCABDB'+'BBDBBCBCBA'+'BCBCDBBDCC'+'CADCCBCBCD'+'BABABABCAC'+'DBBDCDD')
REG=list('ABAABC')
PRI=list('DADDABDAAA'+'DCDCBCC')
SEG=list('BBDBADCABC'+'BAABACC')
assert [len(x) for x in (ATU,COL,REG,PRI,SEG)]==[22,57,6,17,17]

CTX={
 'UECE-HIST-COL-002':'Com base no trecho e no que se sabe sobre o contato',
 'UECE-HIST-COL-003':'O aspecto da colonização do Brasil tratado no trecho acima',
 'UECE-HIST-COL-018':'Com base no trecho acima e no que se sabe sobre o sistema escravista',
 'UECE-HIST-SEG-004':'De acordo com o texto acima, pode-se concluir acertadamente que',
}

def parse(a,b,topic,prefix,lo,hi,keys,sequence_fix=False):
    txt=pages(a,b)
    ms=list(re.finditer(r'(?m)^\s*(\d{1,2})\)\s*\((UECE[^)]*)\)\s*',txt,re.I))
    rows=[]
    for i,m in enumerate(ms):
        printed=int(m.group(1)); n=i+1 if sequence_fix else printed
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
        qid=f'{prefix}-{n:03d}'; context=''
        if qid in CTX:
            k=statement.find(CTX[qid])
            if k<0: raise SystemExit(f'marcador de contexto ausente: {qid}')
            context,statement=statement[:k].strip(),statement[k:].strip()
        letter=keys[n-1]
        q={'id':qid,'discipline':'História','topic':topic,'context':context,'statement':statement,'options':opts,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':re.sub(r'(\d{4})\.\s+(\d)',r'\1.\2',m.group(2).strip()),'origin':ORIGIN,'reviewed':True}
        if qid=='UECE-HIST-COL-016':
            if printed!=17: raise SystemExit('correção de numeração inesperada')
            q['sourceNote']='Numeração impressa na apostila: 17; normalizado para 16 pela sequência, pois há dois itens consecutivos impressos como 17.'
        rows.append(q)
    return rows

rows=[]
for args in [
 (650,653,'Atualidades','UECE-HIST-ATU',20,22,ATU,False),
 (654,667,'Brasil Colonial','UECE-HIST-COL',1,57,COL,True),
 (668,669,'Período Regencial','UECE-HIST-REG',1,6,REG,False),
 (670,673,'Primeiro Reinado','UECE-HIST-PRI',1,17,PRI,False),
 (674,677,'Segundo Reinado','UECE-HIST-SEG',1,17,SEG,False),
]: rows.extend(parse(*args))

if len(rows)!=100: raise SystemExit(f'lote incorreto: {len(rows)}/100')
if rows[0]['id']!='UECE-HIST-ATU-020' or rows[-1]['id']!='UECE-HIST-SEG-017': raise SystemExit('limites incorretos')
if len({q['id'] for q in rows})!=100: raise SystemExit('IDs duplicados')
if len({(q['source'],q['statement']) for q in rows})!=100: raise SystemExit('fontes/itens duplicados')
expected={'Atualidades':3,'Brasil Colonial':57,'Período Regencial':6,'Primeiro Reinado':17,'Segundo Reinado':17}; got={}
for q in rows: got[q['topic']]=got.get(q['topic'],0)+1
if got!=expected: raise SystemExit(f'distribuição incorreta: {got}')
visual=[]
for pn in range(650,678):
    n=len(doc[pn-1].get_images(full=True))
    if n>3: visual.append((pn,n))
if visual: raise SystemExit(f'visuais adicionais exigem mídia: {visual}')

src=ROOT/'src/data/questionSources'; src.mkdir(parents=True,exist_ok=True)
for i in range(5):
    part=rows[i*20:(i+1)*20]; name=f'UECE_HISTORIA_LOTE_100_14_P0{i+1}'
    (src/f'ueceHistoriaLote100_14_p0{i+1}.js').write_text(f'// UECE lote 14 — parte {i+1}/5 ({part[0]["id"]} a {part[-1]["id"]}).\nexport const {name} = '+json.dumps(part,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
agg=''.join([f'import{{UECE_HISTORIA_LOTE_100_14_P0{i}}}from"./ueceHistoriaLote100_14_p0{i}";\n' for i in range(1,6)])
agg+='export const UECE_HISTORIA_LOTE_100_14=[...UECE_HISTORIA_LOTE_100_14_P01,...UECE_HISTORIA_LOTE_100_14_P02,...UECE_HISTORIA_LOTE_100_14_P03,...UECE_HISTORIA_LOTE_100_14_P04,...UECE_HISTORIA_LOTE_100_14_P05];\n'
(src/'ueceHistoriaLote100_14.js').write_text(agg,encoding='utf-8')

ver=ROOT/'scripts/verificar_uece_lote_14.mjs'
ver.write_text('''import { UECE_HISTORIA_LOTE_100_14 as lote } from "../src/data/questionSources/ueceHistoriaLote100_14.js";\nimport { REGISTERED_QUESTIONS,QUESTION_DUPLICATES,QUESTION_QUARANTINE } from "../src/data/questionRegistry.js";\nconst fail=m=>{console.error(`ERRO UECE lote 14: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst exp={"Atualidades":3,"Brasil Colonial":57,"Período Regencial":6,"Primeiro Reinado":17,"Segundo Reinado":17},got={};for(const q of lote)got[q.topic]=(got[q.topic]||0)+1;for(const[k,v]of Object.entries(exp))if(got[k]!==v)fail(`${k}: ${got[k]||0}/${v}`);\nconst ids=new Set(lote.map(q=>q.id)),src=new Set(lote.map(q=>`${q.source}|${q.statement}`));if(ids.size!==100)fail('IDs duplicados');if(src.size!==100)fail('fontes duplicadas');\nfor(const q of lote){if(!q.id||q.discipline!=="História"||!q.topic||!q.statement||!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!x)||!Number.isInteger(q.answer)||q.answer<0||q.answer>3||!q.explanation||!q.source||q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf"||q.reviewed!==true)fail(`campos inválidos: ${q.id}`);if(q.explanation!==`Gabarito oficial da apostila: ${"ABCD"[q.answer]}.`)fail(`gabarito divergente: ${q.id}`);if(q.media)fail(`mídia inesperada: ${q.id}`)}\nconst legacy=new Set(REGISTERED_QUESTIONS.map(q=>q.legacyId));const dup=new Set(QUESTION_DUPLICATES.map(q=>q.legacyId));const qua=new Set(QUESTION_QUARANTINE.map(q=>q.id));for(const q of lote){if(!legacy.has(q.id))fail(`não conectado ao banco: ${q.id}`);if(dup.has(q.id))fail(`duplicidade global: ${q.id}`);if(qua.has(q.id))fail(`quarentena: ${q.id}`)}\nif(lote[0].id!=="UECE-HIST-ATU-020"||lote[2].id!=="UECE-HIST-ATU-022"||lote[3].id!=="UECE-HIST-COL-001"||lote[59].id!=="UECE-HIST-COL-057"||lote[60].id!=="UECE-HIST-REG-001"||lote[65].id!=="UECE-HIST-REG-006"||lote[66].id!=="UECE-HIST-PRI-001"||lote[82].id!=="UECE-HIST-PRI-017"||lote[83].id!=="UECE-HIST-SEG-001"||lote.at(-1).id!=="UECE-HIST-SEG-017")fail('limites divergentes');\nconsole.log(`UECE lote 14 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | duplicidades globais 0 | quarentena 0 | visuais 0 | correções 2`);\n''',encoding='utf-8')

reg=ROOT/'src/data/questionRegistry.js'; s=reg.read_text(encoding='utf-8')
prev='import{UECE_HISTORIA_LOTE_100_13}from"./questionSources/ueceHistoriaLote100_13";'; imp='import{UECE_HISTORIA_LOTE_100_14}from"./questionSources/ueceHistoriaLote100_14";'
if imp not in s:
    if prev not in s: raise SystemExit('âncora lote 13 não encontrada')
    s=s.replace(prev,prev+'\n'+imp)
    anchor='...UECE_HISTORIA_LOTE_100_13].map(sanitizeQuestion)'
    if anchor not in s: raise SystemExit('âncora RAW lote 13 não encontrada')
    s=s.replace(anchor,'...UECE_HISTORIA_LOTE_100_13,...UECE_HISTORIA_LOTE_100_14].map(sanitizeQuestion)')
reg.write_text(s,encoding='utf-8')
PDF.unlink(missing_ok=True)
print('UECE lote 14 gerado — 100/100 | Atualidades 20-22 + Brasil Colonial 1-57 + Período Regencial 1-6 + Primeiro Reinado 1-17 + Segundo Reinado 1-17 | correções 2 | visuais 0')
