from __future__ import annotations
import base64,gzip,json,re,sys
from pathlib import Path

OUT=Path('src/data/questionSources/ueceTransicaoLote100_06.js')
REG=Path('src/data/questionRegistry.js')
VERIFY=Path('scripts/verificar_uece_lote_06.mjs')

encoded=''.join(Path(f'scripts/uece_lote06_source_{i}.b64').read_text(encoding='utf-8').strip() for i in range(1,5))
try:
 source_text=gzip.decompress(base64.b64decode(encoded)).decode('utf-8')
except Exception as e:
 sys.exit(f'Falha ao reconstruir fonte UECE incorporada: {e}')
parts=re.split(r'\n<<<PAGE:(\d+)>>>\n',source_text)
page_map={int(parts[i]):parts[i+1] for i in range(1,len(parts)-1,2)}
needed=set(range(345,354))|set(range(357,384))
missing=sorted(needed-set(page_map))
if missing:
 sys.exit(f'Páginas-fonte ausentes: {missing}')

BOILER={'TURMA DO JOTA','Made with Xodo PDF Reader and Editor'}
def pages_text(a:int,b:int)->str:
 out=[]
 for pno in range(a,b+1):
  lines=[]
  for line in page_map[pno].splitlines():
   s=line.strip()
   if s in BOILER or s==str(pno): continue
   lines.append(line)
  out.append('\n'.join(lines))
 return '\n'.join(out)

def clean(s:str)->str:
 return re.sub(r'\s+',' ',s.replace('\u00ad','')).strip()

marker=re.compile(r'(?m)^\s*(\d+)\)\s*\((UECE[^)]*)\)')
def parse_section(text,start,end,discipline,topic,prefix,key,with_context=False):
 ms=list(marker.finditer(text)); rows=[]
 if not ms: raise RuntimeError(f'sem marcadores em {topic}')
 current_context=clean(text[:ms[0].start()]) if with_context else ''
 if with_context:
  current_context=re.sub(r'^PORTUGUÊS\s+INTERPRETAÇÃO DE TEXTO\s*','',current_context,flags=re.I).strip()
 for idx,m in enumerate(ms):
  n=int(m.group(1)); nxt=ms[idx+1] if idx+1<len(ms) else None
  if n<start or n>end: continue
  block=text[m.end():nxt.start() if nxt else len(text)]
  labs=[re.search(rf'(?<![A-Za-zÀ-ÿ0-9]){L}\)\s*',block) for L in 'ABCD']
  if any(x is None for x in labs) or not all(labs[j].start()<labs[j+1].start() for j in range(3)):
   raise RuntimeError(f'{topic} {n}: alternativas A-D não puderam ser isoladas')
  statement=clean(block[:labs[0].start()]); opts=[]
  for j in range(4):
   st=labs[j].end(); en=labs[j+1].start() if j<3 else len(block); opts.append(clean(block[st:en]))
  d=opts[3]; cue=None
  for pat in [r'\bTexto para (?:a|as) próxima',r'\bTexto \d+',r'\bTEXTO \d+',r'\bLeia o texto']:
   mm=re.search(pat,d,re.I)
   if mm and (cue is None or mm.start()<cue.start()): cue=mm
  if cue:
   current_next=clean(d[cue.start():]); opts[3]=clean(d[:cue.start()])
  else: current_next=None
  if not statement or any(not x for x in opts): raise RuntimeError(f'{topic} {n}: item incompleto')
  ans=key.get(n)
  if ans not in 'ABCD': raise RuntimeError(f'{topic} {n}: gabarito ausente')
  q={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'statement':statement,'options':opts,'answer':'ABCD'.index(ans),'explanation':f'Gabarito oficial da apostila: {ans}. Alternativa conferida no material-fonte.','source':m.group(2).strip(),'origin':'Apostila UECE por Assunto 11ª edição — material original do Google Drive; gabarito oficial conferido.','reviewed':True}
  if with_context and current_context: q['context']=current_context
  rows.append(q)
  if current_next: current_context=current_next
 return rows

hf_letters=['A','A','A','C','B','C','B','A','D','C','B','A','B','A','A','A','D','B','C','C','C','D','A','C','A','A','B','B','A','B','C']
hf_key={38+i:v for i,v in enumerate(hf_letters)}
pt_letters='BADADABDBB'+'CACCACBDBD'+'BCDDBBCBDA'+'CBDDACADBD'+'ADDABDDCDA'+'CDCCBADBBB'+'CACADBBDA'
pt_key={i+1:v for i,v in enumerate(pt_letters)}
hf=parse_section(pages_text(345,353),38,68,'Biologia','Histologia e Fisiologia','UECE-BIO-HF',hf_key,False)
pt=parse_section(pages_text(357,383),1,69,'Português','Interpretação de texto','UECE-PORT-INT',pt_key,True)
rows=hf+pt
if len(hf)!=31 or len(pt)!=69 or len(rows)!=100: sys.exit(f'lote não fechou 100: HF={len(hf)} PT={len(pt)}')
ids=[q['id'] for q in rows]
if len(set(ids))!=100: sys.exit('IDs duplicados no novo lote')
for q in rows:
 if len(q['options'])!=4 or q['answer'] not in range(4) or not q['reviewed']: sys.exit(f'estrutura inválida: {q["id"]}')
 if q['discipline']=='Português' and not q.get('context'): sys.exit(f'Português sem texto-base: {q["id"]}')

contexts=[]
for q in rows:
 c=q.get('context')
 if c and c not in contexts: contexts.append(c)
lines=['// UECE por Assunto — lote de transição 464–563: Histologia/Fisiologia 38–68 (31) + Português/Interpretação 1–69 (69).','// Fonte: Apostila UECE por Assunto 11ª edição (Google Drive). Gabaritos oficiais conferidos nas grades do próprio material.']
for i,c in enumerate(contexts,1): lines.append(f'const CTX_{i:02d}={json.dumps(c,ensure_ascii=False)};')
lines.append('export const UECE_TRANSICAO_LOTE_100_06=[')
for q0 in rows:
 q=dict(q0); c=q.pop('context',None); parts=[]
 for k,v in q.items(): parts.append(f'{k}:{json.dumps(v,ensure_ascii=False,separators=(",",":"))}')
 if c: parts.insert(3,f'context:CTX_{contexts.index(c)+1:02d}')
 lines.append('{'+','.join(parts)+'},')
lines.append('];'); OUT.write_text('\n'.join(lines)+'\n',encoding='utf-8')

reg=REG.read_text(encoding='utf-8')
imports='import{UECE_BIOLOGIA_LOTE_100_04}from"./questionSources/ueceBiologiaLote100_04";\nimport{UECE_BIOLOGIA_LOTE_100_05}from"./questionSources/ueceBiologiaLote100_05";\nimport{UECE_TRANSICAO_LOTE_100_06}from"./questionSources/ueceTransicaoLote100_06";\n'
anchor='import{UECE_BIOLOGIA_ZOOLOGIA_31_A_40}from"./questionSources/ueceBiologiaZoologia31a40";\n'
if 'UECE_TRANSICAO_LOTE_100_06' not in reg:
 if anchor not in reg: sys.exit('âncora de imports não encontrada no registry')
 reg=reg.replace(anchor,anchor+imports,1)
raw_anchor='...UECE_BIOLOGIA_ZOOLOGIA_31_A_40].map(sanitizeQuestion)'
raw_new='...UECE_BIOLOGIA_ZOOLOGIA_31_A_40,...UECE_BIOLOGIA_LOTE_100_04,...UECE_BIOLOGIA_LOTE_100_05,...UECE_TRANSICAO_LOTE_100_06].map(sanitizeQuestion)'
if '...UECE_TRANSICAO_LOTE_100_06].map(sanitizeQuestion)' not in reg:
 if raw_anchor not in reg: sys.exit('âncora RAW não encontrada no registry')
 reg=reg.replace(raw_anchor,raw_new,1)
REG.write_text(reg,encoding='utf-8')

VERIFY.write_text('''import { UECE_TRANSICAO_LOTE_100_06 } from "../src/data/questionSources/ueceTransicaoLote100_06.js";\nconst lote=UECE_TRANSICAO_LOTE_100_06;\nconst fail=m=>{console.error(`ERRO UECE lote 06: ${m}`);process.exit(1)};\nif(lote.length!==100)fail(`esperado 100, veio ${lote.length}`);\nconst ids=new Set(),src=new Set(); let bio=0,port=0,media=0;\nfor(const q of lote){for(const f of ["id","discipline","topic","statement","options","answer","explanation","source","origin"])if(q[f]==null||(typeof q[f]==="string"&&!q[f].trim()))fail(`${q.id}: ${f} vazio`);if(!Array.isArray(q.options)||q.options.length!==4||q.options.some(x=>!String(x).trim()))fail(`${q.id}: alternativas inválidas`);if(!Number.isInteger(q.answer)||q.answer<0||q.answer>3)fail(`${q.id}: gabarito inválido`);if(q.reviewed!==true)fail(`${q.id}: reviewed`);if(ids.has(q.id))fail(`ID duplicado ${q.id}`);ids.add(q.id);const fp=`${q.discipline}::${q.topic}::${q.statement}`.normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/\\s+/g," ").trim();if(src.has(fp))fail(`fonte duplicada ${q.id}`);src.add(fp);const letra=String.fromCharCode(65+q.answer);if(!q.explanation.includes(`Gabarito oficial da apostila: ${letra}`))fail(`${q.id}: comentário/gabarito`);if(q.discipline==="Biologia")bio++;else if(q.discipline==="Português"){port++;if(!q.context)fail(`${q.id}: contexto ausente`)}else fail(`${q.id}: disciplina inesperada`);if(q.media)media++;}\nif(bio!==31||port!==69)fail(`composição ${bio}+${port}`);\nif(lote[0].id!=="UECE-BIO-HF-038"||lote.at(-1).id!=="UECE-PORT-INT-069")fail("limites do lote divergentes");\nconsole.log(`UECE lote 06 OK — 100/100 | Biologia ${bio} | Português ${port} | IDs ${ids.size}/100 | fontes ${src.size}/100 | visuais ${media}`);\n''',encoding='utf-8')
print(f'LOTE_OK 100/100 | Biologia {len(hf)} | Português {len(pt)} | contextos {len(contexts)} | arquivo {OUT}')
