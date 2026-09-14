from pathlib import Path
import base64,lzma,sys,hashlib
OUT=Path('src/data/questionSources/uecePortuguesLote100_08.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_08.mjs')
DEPLOY=Path('.github/workflows/deploy-pages.yml')
expected_parts={1:'2aced375201fe01dfe1f200386db520629596575209d37d980532c51b95cfc63',2:'3f656f2a17a2e2e0bc9e12f23aa25a0ad926b34fb51690cee9c1f2f6fe17ce62',3:'ec41716447613505c305a713074d7bbfc3ad92a6d65a8cd3b3aa1ada6c1d3b36',4:'cde46f56a4372473745b034bb059f9db5e0746a46faa178c0ab3e9af180db5a5',5:'db311c9e00be68eb7f0ce0e371bbaf6dde0adcc1cea44e4261e4472d867cd19f',6:'ce837dd6eea41ee237cae6b03b4f6ebab99a34123c31e079e7a7efa6c65bb8bb',7:'28742bd8809be66ad8872ecea1e73b14ecb9a509aaf15bf6c0250e651b11f301',8:'b4e916a75aa2784c9531351e120e9964f23d48b23a2002ae09acbd230e255093'}
parts=[]
for i in range(1,9):
    p=Path(f'scripts/uece_lote08_rebuild_{i}.b64')
    if not p.exists(): sys.exit(f'fragmento ausente: {p}')
    s=p.read_text().strip()
    if i==3:
        bad='WFOpGM7ntiBG'; good='WFOpGM7ktiBG'
        if bad in s:
            if s.count(bad)!=1: sys.exit('assinatura de reparo ambígua')
            s=s.replace(bad,good,1); p.write_text(s)
            print('parte 3: reparo de transporte aplicado n→k')
    h=hashlib.sha256(s.encode()).hexdigest()
    if len(s)!=10603 or h!=expected_parts[i]: sys.exit(f'fragmento divergente parte {i}: len={len(s)} sha={h}')
    parts.append(s)
try:
    raw=lzma.decompress(base64.b64decode(''.join(parts),validate=True)); text=raw.decode('utf-8')
except Exception as e: sys.exit(f'falha reconstrução: {e}')
expected='99d96744d3688e18e4e6164ffe407d4bd6118119ef35afaec1a6f0fbd6ac4b9d'
sha=hashlib.sha256(raw).hexdigest()
if sha!=expected: sys.exit(f'sha divergente {sha}')
if text.count('"id":"UECE-PORT-')!=100: sys.exit('quantidade divergente')
if 'UECE-PORT-INT-170' not in text or 'UECE-PORT-DISC-001' not in text: sys.exit('limites ausentes')
OUT.write_text(text,encoding='utf-8')
VERIFY.write_text(r'''import { UECE_PORTUGUES_LOTE_100_08 } from "../src/data/questionSources/uecePortuguesLote100_08.js";
const lote=UECE_PORTUGUES_LOTE_100_08, fail=m=>{console.error(`ERRO UECE lote 08: ${m}`);process.exit(1)};
if(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);
const expect={"Interpretação de texto":11,"Literatura":25,"Linguística e aspectos da linguagem":8,"Estrutura e tipologia textual":3,"Coesão textual":52,"Discurso e vozes do texto":1};
const ids=new Set(),src=new Set(),topics={};let media=0;
for(const q of lote){for(const f of ["id","discipline","topic","context","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(q.discipline!=="Português")fail(`${q.id}: disciplina`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(q.origin!=="Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf")fail(`${q.id}: origem`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.context}::${q.statement}`.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);topics[q.topic]=(topics[q.topic]||0)+1;if(q.media)media++;}
for(const [k,v] of Object.entries(expect))if(topics[k]!==v)fail(`${k}: esperado ${v}, veio ${topics[k]||0}`);
if(Object.keys(topics).length!==Object.keys(expect).length)fail('tópicos inesperados');
if(lote[0].id!=="UECE-PORT-INT-170"||lote.at(-1).id!=="UECE-PORT-DISC-001")fail('limites divergentes');
console.log(`UECE lote 08 OK — 100/100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);
''',encoding='utf-8')
reg=REG.read_text()
imp='import{UECE_PORTUGUES_LOTE_100_08}from"./questionSources/uecePortuguesLote100_08";\n'; anchor='import{UECE_PORTUGUES_LOTE_100_07}from"./questionSources/uecePortuguesLote100_07";\n'
if imp not in reg:
    if anchor not in reg: sys.exit('âncora import ausente')
    reg=reg.replace(anchor,anchor+imp,1)
old='...UECE_PORTUGUES_LOTE_100_07].map(sanitizeQuestion)'; new='...UECE_PORTUGUES_LOTE_100_07,...UECE_PORTUGUES_LOTE_100_08].map(sanitizeQuestion)'
if new not in reg:
    if old not in reg: sys.exit('âncora RAW ausente')
    reg=reg.replace(old,new,1)
REG.write_text(reg)
if DEPLOY.exists():
    d=DEPLOY.read_text()
    if 'verificar_uece_lote_08.mjs' not in d:
        needle='      - name: Auditar lote UECE Português 70-169\n        run: node scripts/verificar_uece_lote_07.mjs\n'
        if needle in d: d=d.replace(needle,needle+'      - name: Auditar lote UECE Português 170-269\n        run: node scripts/verificar_uece_lote_08.mjs\n',1)
        else:
            needle='        run: node scripts/verificar_uece_lote_07.mjs\n'
            if needle not in d: sys.exit('âncora deploy ausente')
            d=d.replace(needle,needle+'      - name: Auditar lote UECE Português 170-269\n        run: node scripts/verificar_uece_lote_08.mjs\n',1)
        DEPLOY.write_text(d)
print('LOTE08 GERADO — Português +100 — 100/100 | visuais 0')
