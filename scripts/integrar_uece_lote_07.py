from pathlib import Path
import base64,lzma,sys,subprocess
OUT=Path('src/data/questionSources/uecePortuguesLote100_07.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_07.mjs')

# A parte 2 atual sofreu alteração posterior e o fluxo XZ passou a corromper no
# interior do stream. Testamos primeiro o conjunto atual e, se ele falhar,
# recuperamos a versão original da parte 2 diretamente do histórico Git.
def load_parts(use_historical_p2=False):
    parts=[]
    for i in range(1,8):
        if i==2 and use_historical_p2:
            p=subprocess.run(
                ['git','show','0a0499d8fc1c7e535834faad1ed127549362c204:scripts/uece_lote07_final_2.b64'],
                stdout=subprocess.PIPE,stderr=subprocess.PIPE,check=False,text=True
            )
            if p.returncode!=0 or not p.stdout.strip():
                raise RuntimeError('não foi possível recuperar parte 2 histórica: '+p.stderr.strip())
            parts.append(p.stdout.strip())
        else:
            parts.append(Path(f'scripts/uece_lote07_final_{i}.b64').read_text().strip())
    return parts

def decode_candidate(parts,label):
    errors=[]
    encoded=''.join(parts)
    try:
        packed=base64.b64decode(encoded, validate=True)
    except Exception as e:
        return None,[f'{label}: base64 inválido: {e}']
    try:
        raw=lzma.decompress(packed)
        return raw,errors
    except Exception as e:
        errors.append(f'{label}: lzma={e}')
    # Diagnóstico/recuperação conservadora: pode provar onde há dano, mas só
    # será aceita se todo o JS sobreviver às validações completas abaixo.
    try:
        dec=lzma.LZMADecompressor(format=lzma.FORMAT_XZ)
        recovered=[]
        for pos,b in enumerate(packed):
            try:
                chunk=dec.decompress(bytes((b,)))
                if chunk: recovered.append(chunk)
            except lzma.LZMAError as e:
                errors.append(f'{label}: incremental-pos={pos}:{e}')
                break
        candidate=b''.join(recovered)
        if candidate:
            errors.append(f'{label}: incremental-bytes={len(candidate)}')
            return candidate,errors
    except Exception as e:
        errors.append(f'{label}: incremental={e}')
    return None,errors

def validate_text(raw,label,errors):
    if raw is None: return None
    try:
        text=raw.decode('utf-8')
    except UnicodeDecodeError as e:
        errors.append(f'{label}: UTF-8 inválido: {e}')
        return None
    if 'export const UECE_PORTUGUES_LOTE_100_07' not in text:
        errors.append(f'{label}: export esperado ausente'); return None
    count_ids=text.count('id:"UECE-PORT-INT-')
    if count_ids!=100:
        errors.append(f'{label}: IDs={count_ids}/100'); return None
    if 'UECE-PORT-INT-070' not in text or 'UECE-PORT-INT-169' not in text:
        errors.append(f'{label}: limites 070–169 ausentes'); return None
    if '];' not in text[-500:]:
        errors.append(f'{label}: fechamento do lote ausente'); return None
    return text

all_errors=[]
text=None
for historical,label in [(False,'atual'),(True,'p2-historica')]:
    try:
        parts=load_parts(historical)
        raw,errs=decode_candidate(parts,label)
        all_errors.extend(errs)
        text=validate_text(raw,label,all_errors)
        if text is not None:
            print(f'Fonte escolhida: {label}')
            break
    except Exception as e:
        all_errors.append(f'{label}: {e}')

if text is None:
    sys.exit('falha ao reconstruir lote 07 com validação integral | '+' | '.join(all_errors))

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
