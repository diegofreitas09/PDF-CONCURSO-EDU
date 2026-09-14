from pathlib import Path
import base64,lzma,sys

OUT=Path('src/data/questionSources/uecePortuguesLote100_07.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_07.mjs')

# Fonte reconstruída diretamente da apostila oficial do Google Drive durante
# a auditoria deste lote. Os oito fragmentos formam um único XZ validado.
parts=[]
for i in range(1,9):
    p=Path(f'scripts/uece_lote07_rebuild_{i}.b64')
    if not p.exists(): sys.exit(f'fragmento ausente: {p}')
    parts.append(p.read_text(encoding='utf-8').strip())
try:
    packed=base64.b64decode(''.join(parts),validate=True)
    raw=lzma.decompress(packed)
    text=raw.decode('utf-8')
except Exception as e:
    sys.exit(f'falha ao reconstruir lote 07 auditado: {e}')

# Nunca promova payload parcial/corrompido.
if 'export const UECE_PORTUGUES_LOTE_100_07' not in text:
    sys.exit('export esperado ausente')
if text.count('"id":"UECE-PORT-INT-') != 100:
    sys.exit(f'quantidade de IDs divergente: {text.count(chr(34)+"id"+chr(34)+":"+chr(34)+"UECE-PORT-INT-")}')
if 'UECE-PORT-INT-070' not in text or 'UECE-PORT-INT-169' not in text:
    sys.exit('limites 070–169 ausentes')
if 'Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf' not in text:
    sys.exit('referência à fonte oficial ausente')
if not text.rstrip().endswith('];'):
    sys.exit('fechamento sintático do lote ausente')
OUT.write_text(text,encoding='utf-8')

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
