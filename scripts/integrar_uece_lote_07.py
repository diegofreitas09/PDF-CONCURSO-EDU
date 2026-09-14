from pathlib import Path
import base64,lzma,sys,subprocess,tempfile
OUT=Path('src/data/questionSources/uecePortuguesLote100_07.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_07.mjs')

parts=[Path(f'scripts/uece_lote07_final_{i}.b64').read_text().strip() for i in range(1,8)]
raw=None
errors=[]
encoded=''.join(parts)
try:
    packed=base64.b64decode(encoded, validate=True)
except Exception as e:
    sys.exit(f'base64 inválido no lote 07: {e}')
try:
    raw=lzma.decompress(packed)
except Exception as e:
    errors.append(f'lzma={e}')
# Se o payload estiver íntegro e apenas o checksum XZ tiver sido corrompido,
# o xz --ignore-check recupera o conteúdo sem alterar os dados comprimidos.
if raw is None:
    try:
        proc=subprocess.run(['xz','--decompress','--stdout','--ignore-check'],input=packed,stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False)
        if proc.returncode==0 and proc.stdout:
            raw=proc.stdout
        else:
            errors.append('xz-ignore-check='+proc.stderr.decode('utf-8','replace').strip())
    except Exception as e:
        errors.append(f'xz-ignore-check={e}')
if raw is None:
    details=[]
    for i,p in enumerate(parts,1):
        pad=len(p)-len(p.rstrip('='))
        details.append(f'{i}:len={len(p)},mod4={len(p)%4},pad={pad},tail={p[-8:]}')
    sys.exit('falha ao reconstruir lote 07: '+' | '.join(errors)+' | '+'; '.join(details))
# Não promova recuperação parcial: valide a estrutura básica antes de escrever.
text=raw.decode('utf-8')
if 'export const UECE_PORTUGUES_LOTE_100_07' not in text:
    sys.exit('payload recuperado não contém o export esperado')
if text.count('id:"UECE-PORT-INT-') != 100:
    sys.exit(f'payload recuperado não contém 100 IDs: {text.count(chr(105)+chr(100)+chr(58)+chr(34)+"UECE-PORT-INT-")}')
if 'UECE-PORT-INT-070' not in text or 'UECE-PORT-INT-169' not in text:
    sys.exit('payload recuperado não contém os limites 070–169')
OUT.write_text(text,encoding='utf-8')
VERIFY.write_text('''import { UECE_PORTUGUES_LOTE_100_07 } from "../src/data/questionSources/uecePortuguesLote100_07.js";\nconst lote=UECE_PORTUGUES_LOTE_100_07;\nconst fail=m=>{console.error(`ERRO UECE lote 07: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst ids=new Set(),src=new Set(); let media=0;\nfor(const q of lote){for(const f of ["id","discipline","topic","context","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(q.discipline!=="Português"||q.topic!=="Interpretação de texto")fail(`${q.id}: classificação`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas inválidas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.discipline}::${q.topic}::${q.context}::${q.statement}`.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/\\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);if(q.media)media++;}\nif(lote[0].id!=="UECE-PORT-INT-070"||lote.at(-1).id!=="UECE-PORT-INT-169")fail("limites do lote divergentes");\nconsole.log(`UECE lote 07 OK — 100/100 | Português 100 | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);\n''',encoding='utf-8')
reg=REG.read_text(encoding='utf-8')
imp='import{UECE_PORTUGUES_LOTE_100_07}from"./questionSources/uecePortuguesLote100_07";\n'
if 'UECE_PORTUGUES_LOTE_100_07' not in reg:
    anchor='import{UECE_TRANSICAO_LOTE_100_06}from"./questionSources/ueceTransicaoLote100_06";\n'
    if anchor not in reg: sys.exit('ancora import lote06 ausente')
    reg=reg.replace(anchor,anchor+imp,1)
old='...UECE_TRANSICAO_LOTE_100_06].map(sanitizeQuestion)'
new='...UECE_TRANSICAO_LOTE_100_06,...UECE_PORTUGUES_LOTE_100_07].map(sanitizeQuestion)'
if new not in reg:
    if old not in reg: sys.exit('ancora RAW lote06 ausente')
    reg=reg.replace(old,new,1)
REG.write_text(reg,encoding='utf-8')
print('LOTE07 GERADO — Portugues 70-169 — 100/100')
