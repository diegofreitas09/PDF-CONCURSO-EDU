from pathlib import Path
import base64,lzma,sys,hashlib
OUT=Path('src/data/questionSources/uecePortuguesLote100_08.js'); REG=Path('src/data/questionRegistry.js'); VERIFY=Path('scripts/verificar_uece_lote_08.mjs'); DEPLOY=Path('.github/workflows/deploy-pages.yml')
expected='958c1a7d13720dd9b83bf3a74d6fb42cbc56f25f1fd534d733ceeb83197350a8'
parts=[]
for i in range(1,9):
 p=Path(f'scripts/uece_lote08_rebuild_{i}.b64')
 if not p.exists(): sys.exit(f'fragmento ausente: {p}')
 parts.append(p.read_text().strip())
enc=''.join(parts); raw=None
try:
 raw=lzma.decompress(base64.b64decode(enc,validate=True))
except Exception as original_error:
 # A auditoria localizou a corrupção na faixa comprimida 51776–51840 bytes.
 # Procuramos APENAS uma substituição Base64 pontual ao redor dessa faixa e
 # aceitamos o reparo exclusivamente se o conteúdo descompactado produzir o
 # SHA-256 original já registrado para o lote.
 alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
 center=(51776*4)//3
 start=max(0,center-128); end=min(len(enc),center+256)
 chars=list(enc); attempts=0
 print(f'recuperação controlada: faixa base64 {start}:{end}; erro original={original_error}')
 for pos in range(start,end):
  old=chars[pos]
  if old not in alphabet: continue
  for c in alphabet:
   if c==old: continue
   chars[pos]=c; attempts+=1
   try:
    candidate=lzma.decompress(base64.b64decode(''.join(chars),validate=True))
   except Exception:
    continue
   if hashlib.sha256(candidate).hexdigest()==expected:
    raw=candidate
    print(f'REPARO_SHA_OK pos={pos} {old}->{c} tentativas={attempts}')
    break
  chars[pos]=old
  if raw is not None: break
 if raw is None: sys.exit(f'falha reconstrução após {attempts} candidatos validados por XZ/SHA')
if hashlib.sha256(raw).hexdigest()!=expected: sys.exit('sha divergente após reconstrução')
try: text=raw.decode('utf-8')
except Exception as e: sys.exit(f'falha UTF-8 reconstrução: {e}')
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
if(Object.keys(topics).length!==Object.keys(expect).length)fail(`tópicos inesperados`);
if(lote[0].id!=="UECE-PORT-INT-170"||lote.at(-1).id!=="UECE-PORT-DISC-001")fail("limites divergentes");
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
