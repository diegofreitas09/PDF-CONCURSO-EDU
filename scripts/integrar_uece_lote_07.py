from pathlib import Path
import json,re,subprocess,sys

PDF=Path('apostila_uece.pdf')
RAW=Path('/tmp/uece_port_357_420.txt')
OUT=Path('src/data/questionSources/uecePortuguesLote100_07.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_07.mjs')
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'

if not PDF.exists() or PDF.stat().st_size < 30_000_000:
    sys.exit(f'PDF fonte ausente ou incompleto: {PDF} ({PDF.stat().st_size if PDF.exists() else 0} bytes)')
subprocess.run(['pdftotext','-f','357','-l','420','-raw',str(PDF),str(RAW)],check=True)
lines=RAW.read_text(encoding='utf-8',errors='strict').splitlines()
clean=[]
for line in lines:
    t=line.strip()
    if t in {'TURMA DO JOTA','Made with Xodo PDF Reader and Editor'}: continue
    if re.fullmatch(r'\d{3}',t) and 350<=int(t)<=600: continue
    clean.append(t)
lines=clean
qstarts=[]
for i,line in enumerate(lines):
    m=re.match(r'^(\d+)\)\s*\(UECE',line)
    if m:qstarts.append((i,int(m.group(1))))

keystr='''70 D 71 C 72 D 73 A 74 B 75 C 76 B 77 C 78 A 79 C 80 B
81 D 82 B 83 C 84 C 85 B 86 A 87 B 88 C 89 C 90 B
91 A 92 A 93 B 94 C 95 B 96 D 97 B 98 D 99 B 100 A
101 A 102 A 103 C 104 C 105 A 106 C 107 B 108 D 109 B 110 B
111 A 112 C 113 B 114 A 115 D 116 C 117 A 118 C 119 D 120 C
121 C 122 B 123 B 124 B 125 A 126 D 127 B 128 A 129 C 130 D
131 B 132 C 133 C 134 A 135 A 136 B 137 C 138 B 139 D 140 A
141 C 142 A 143 D 144 C 145 A 146 D 147 A 148 A 149 B 150 B
151 C 152 C 153 C 154 B 155 A 156 B 157 C 158 D 159 A 160 C
161 D 162 B 163 C 164 A 165 B 166 D 167 D 168 B 169 B'''
toks=keystr.split(); key={int(toks[i]):toks[i+1] for i in range(0,len(toks),2)}
if set(key)!=set(range(70,170)): sys.exit('grade de gabaritos incompleta')

ctx='Interpretação de texto — apostila UECE por assuntos.'
parsed={}
for qi,(i,n) in enumerate(qstarts):
    prev=qstarts[qi-1][0] if qi else 0
    markers=[j for j in range(prev,i) if re.match(r'^Texto para',lines[j],re.I)]
    if markers:
        mp=markers[-1]
        ctx=' '.join(x for x in lines[mp:i] if x).strip()
    end=qstarts[qi+1][0] if qi+1<len(qstarts) else len(lines)
    block=[x for x in lines[i:end] if x]
    for k in range(1,len(block)):
        if re.match(r'^Texto para',block[k],re.I):
            block=block[:k]; break
    if not 70<=n<=169: continue
    sm=re.match(r'^\d+\)\s*(\(UECE[^)]*\))\s*(.*)$',block[0])
    if not sm: sys.exit(f'fonte não reconhecida q{n}: {block[0]}')
    source=sm.group(1).strip('()')
    full=re.sub(r'\s+',' ',' '.join([sm.group(2)]+block[1:])).strip()
    ms=list(re.finditer(r'(?<!\w)([ABCD])\)\s*',full))
    seq=None
    for a in range(len(ms)-3):
        if [ms[a+k].group(1) for k in range(4)]==list('ABCD'): seq=ms[a:a+4]
    if not seq: sys.exit(f'alternativas não reconhecidas q{n}')
    statement=full[:seq[0].start()].strip()
    options=[]
    for k,m in enumerate(seq):
        stop=seq[k+1].start() if k<3 else len(full)
        options.append(full[m.end():stop].strip())
    if not statement or len(options)!=4 or any(not x for x in options): sys.exit(f'campos incompletos q{n}')
    parsed[n]=(ctx,statement,options,source)

if set(parsed)!=set(range(70,170)):
    sys.exit('questões ausentes: '+','.join(map(str,sorted(set(range(70,170))-set(parsed)))))
items=[]; fps=set()
for n in range(70,170):
    context,statement,options,source=parsed[n]
    fp=re.sub(r'\s+',' ',(context+'::'+statement).lower()).strip()
    if fp in fps: sys.exit(f'duplicidade interna q{n}')
    fps.add(fp); letter=key[n]
    items.append({'id':f'UECE-PORT-INT-{n:03d}','discipline':'Português','topic':'Interpretação de texto','context':context,'statement':statement,'options':options,'answer':'ABCD'.index(letter),'explanation':f'Gabarito oficial da apostila: {letter}.','source':source,'origin':ORIGIN,'reviewed':True})

out=['// UECE por Assunto — Português / Interpretação de texto 70–169 (100 questões).',f'// Fonte: {ORIGIN}. Gabaritos conferidos na grade oficial do material.','export const UECE_PORTUGUES_LOTE_100_07 = [']
out += ['  '+json.dumps(q,ensure_ascii=False,separators=(',',':'))+',' for q in items]
out.append('];\n')
OUT.write_text('\n'.join(out),encoding='utf-8')

VERIFY.write_text('''import { UECE_PORTUGUES_LOTE_100_07 } from "../src/data/questionSources/uecePortuguesLote100_07.js";\nconst lote=UECE_PORTUGUES_LOTE_100_07, fail=m=>{console.error(`ERRO UECE lote 07: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst ids=new Set(),src=new Set();let media=0;\nfor(const q of lote){for(const f of ["id","discipline","topic","context","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(q.discipline!=="Português"||q.topic!=="Interpretação de texto")fail(`${q.id}: classificação`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas inválidas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.context}::${q.statement}`.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/\\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);if(q.media)media++;}\nif(lote[0].id!=="UECE-PORT-INT-070"||lote.at(-1).id!=="UECE-PORT-INT-169")fail("limites divergentes");\nconsole.log(`UECE lote 07 OK — 100/100 | Português 100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);\n''',encoding='utf-8')

reg=REG.read_text(encoding='utf-8')
imp='import{UECE_PORTUGUES_LOTE_100_07}from"./questionSources/uecePortuguesLote100_07";\n'
if 'UECE_PORTUGUES_LOTE_100_07' not in reg:
    anchor='import{UECE_TRANSICAO_LOTE_100_06}from"./questionSources/ueceTransicaoLote100_06";\n'
    if anchor not in reg: sys.exit('âncora import lote06 ausente')
    reg=reg.replace(anchor,anchor+imp,1)
old='...UECE_TRANSICAO_LOTE_100_06].map(sanitizeQuestion)'
new='...UECE_TRANSICAO_LOTE_100_06,...UECE_PORTUGUES_LOTE_100_07].map(sanitizeQuestion)'
if new not in reg:
    if old not in reg: sys.exit('âncora RAW lote06 ausente')
    reg=reg.replace(old,new,1)
REG.write_text(reg,encoding='utf-8')
print('LOTE07 GERADO — Português 70–169 — 100/100 | visuais 0')
