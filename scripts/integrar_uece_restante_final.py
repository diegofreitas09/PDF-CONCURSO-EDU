import fitz,re,json,os,urllib.request
from functools import lru_cache
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
PDF=ROOT/'tmp_uece_11ed.pdf'
url=os.environ['UECE_PDF_URL']
if not PDF.exists(): urllib.request.urlretrieve(url,PDF)
d=fitz.open(PDF)
OUT=ROOT/'src/data/questionSources'
MEDIA=ROOT/'public/question-media/uece/final'
OUT.mkdir(parents=True,exist_ok=True); MEDIA.mkdir(parents=True,exist_ok=True)
HDR='TURMA DO JOTA\nMade with Xodo PDF Reader and Editor'
ORIGIN='Apostila da UECE por assuntos 11ed - Turma do Jot_260209_173948.pdf'

@lru_cache(maxsize=None)
def raw(p):
 t=d[p-1].get_text().replace(HDR,'').replace(chr(2),' ')
 t=re.sub(rf'(?m)^\s*{p}\s*$','',t)
 return t.strip()
def pages(a,b): return '\n\n'.join(raw(i) for i in range(a,b+1))
def clean(s): return re.sub(r'[ \t]+',' ',re.sub(r'\n{3,}','\n\n',str(s))).strip()

def parse_key(a,b,sections):
 text='\n'.join(raw(i) for i in range(a,b+1));out={}
 for idx,(label,count) in enumerate(sections):
  st=text.find(label)
  if st<0: raise RuntimeError('label '+label)
  en=len(text)
  for nl,_ in sections[idx+1:]:
   x=text.find(nl,st+len(label))
   if x>=0:en=min(en,x)
  toks=[x.strip() for x in text[st+len(label):en].splitlines() if re.fullmatch(r'\d+|[ABCD]',x.strip())]
  m={};i=0
  while i<len(toks) and len(m)<count:
   if not toks[i].isdigit():i+=1;continue
   nums=[]
   while i<len(toks) and toks[i].isdigit():nums.append(int(toks[i]));i+=1
   ans=[]
   while i<len(toks) and re.fullmatch(r'[ABCD]',toks[i]):ans.append(toks[i]);i+=1
   rel=[n for n in nums if n<=count]
   if len(ans)<len(rel): raise RuntimeError((label,nums,ans))
   for n,a in zip(rel,ans):m[n]=a
  if len(m)!=count:raise RuntimeError((label,len(m),sorted(set(range(1,count+1))-m.keys())))
  out[label]=m
 return out

TEXT_REF=re.compile(r'\b(?:no texto|neste texto|nesse texto|de acordo com (?:o |este |esse )?texto|com base (?:no|neste|nesse) texto|segundo (?:o |este |esse )?texto|a partir (?:do|deste|desse) texto|texto (?:acima|anterior|a seguir|seguinte)|leia (?:o |este |esse )?(?:texto|trecho|fragmento|poema|tirinha|notícia|noticia)|considere (?:o |este |esse )?(?:texto|trecho|fragmento)|observe (?:o |este |esse )?(?:texto|trecho|fragmento)|(?:no|neste|nesse) trecho(?!\s+(?:reto|curvo|inicial|final|horizontal|vertical|da estrada|da ferrovia|da rodovia|da via|da pista|da linha|do percurso|do trajeto))|parágrafo|paragrafo|autor(?:a)? do texto|ideia central do texto|texto-base|texto de apoio)\b',re.I)
MEDIA_REF=re.compile(r'(?:\b(?:observe|analise|considere|veja|examine)\s+(?:a|o)\s+(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\b)|(?:\b(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\s+(?:acima|abaixo|a seguir|seguinte|anterior|apresentad[oa]|mostrad[oa]|representad[oa])\b)|(?:\brepresentad[oa]\s+(?:na|no)\s+(?:figura|imagem|gráfico|grafico|tabela|mapa|charge|tirinha|quadro|diagrama|esquema)\b)',re.I)
PROMPT_CUE=re.compile(r'(?is)\b(?:considerando\s+(?:o\s+)?(?:texto\s+acima|exposto)|partindo\s+(?:do|deste|desse|dessa)\s+(?:exposto|compreensão)|com\s+base\s+(?:no|neste|nesse)\s+(?:texto|trecho)|de\s+acordo\s+com\s+(?:a\s+informação\s+no|o|este|esse)\s+texto|no\s+texto,\s+é\s+apresentada|nesse\s+trecho,|neste\s+trecho,)')

def split_simple_context(s):
 s=clean(s)
 m=re.match(r'(?is)^Complete\s+os\s+espaços\s+no\s+texto\s+a\s+seguir\.\s*(.+?)\s+(Assinale\s+a\s+alternativa.+)

def qpage(a,b,n):
 pat=re.compile(r'(?m)^\s*0*'+str(n)+r'\s*[\)\.]?\s*\(UECE')
 for p in range(a,b+1):
  if pat.search(raw(p)):return p
 return a

def media(p,discipline):
 dest=MEDIA/f"{discipline.lower()}-p{p}.png"
 if not dest.exists(): d[p-1].get_pixmap(matrix=fitz.Matrix(1.35,1.35),alpha=False).save(dest)
 return {"type":"source-crop","src":f"question-media/uece/final/{dest.name}","title":"Página original da questão","caption":f"Apostila UECE · página {p}","originalCrop":True,"sourcePage":p}

def take_simple(a,b,start,end,discipline,topic,prefix,ans):
 s=pages(a,b);out=[];pos=0
 for n in range(start,end+1):
  m=re.compile(r'(?m)^\s*0*'+str(n)+r'\s*\)?\s*\(?(UECE[^)\n]*)\)?\s*').search(s,pos)
  if not m:raise RuntimeError(('missing',topic,n))
  nx=re.compile(r'(?m)^\s*\d+\s*\)?\s*\(?UECE').search(s,m.end())
  block=s[m.end():(nx.start() if nx else len(s))].strip();pos=nx.start() if nx else len(s)
  marks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\)\s+',block));last={}
  for z in marks:last[z.group(1)]=z
  if set(last)!={'A','B','C','D'}:raise RuntimeError(('opts',topic,n,block[:1200]))
  chosen=sorted(last.values(),key=lambda x:x.start());rawst=clean(block[:chosen[0].start()]);opts=[]
  for i,z in enumerate(chosen):opts.append(clean(block[z.end():(chosen[i+1].start() if i+1<len(chosen) else len(block))]))
  ctx,st=split_simple_context(rawst)
  p=qpage(a,b,n)
  item={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':ctx,'statement':st,'options':opts,'answer':'ABCD'.index(ans[n]),'explanation':f'Gabarito oficial da apostila: {ans[n]}.','source':clean(m.group(1)),'origin':ORIGIN,'reviewed':True,'sourcePage':p}
  if MEDIA_REF.search(st): item['media']=media(p,discipline)
  out.append(item)
 return out

def split_d_tail(txt):
 candidates=[]
 m=re.search(r'(?im)^\s*Texto para a próxima questão\s*',txt)
 if m:candidates.append((m.start(),'marker',m.end()))
 m=re.search(r'\n\s*\n+',txt)
 if m:candidates.append((m.start(),'blank',m.end()))
 m=re.search(r'(?m)^\s*(?:1\.|01\s+)\s*\S',txt)
 if m:candidates.append((m.start(),'line1',m.start()))
 if not candidates:return clean(txt),''
 pos,kind,endpos=min(candidates,key=lambda x:x[0])
 if kind=='blank': return clean(txt[:pos]),clean(txt[endpos:])
 return clean(txt[:pos]),clean(txt[pos:])

def parse_lang(a,b,max_n,discipline,topic,prefix,answers,missing_numbers=None):
 missing_numbers=set(missing_numbers or [])
 s=pages(a,b)
 s=re.sub(r'^\s*(?:'+re.escape(discipline)+r'\s*)?(?:'+re.escape(topic)+r')\s*','',s,flags=re.I)
 qre=re.compile(r'(?m)^\s*0*(\d+)\s*[\)\.]?\s*\(UECE[\s\S]{0,90}?\)\s*')
 rawms=list(qre.finditer(s));ms=[];expected=1
 for m in rawms:
  src=int(m.group(1))
  if src>max_n:continue
  if expected in missing_numbers and src==expected+1:expected+=1
  norm=src;note=None
  if discipline=='Inglês' and topic=='Gramática' and expected==39 and src==36:
   norm=39;note='No PDF, a questão está numerada novamente como 36; normalizada para 39 pela sequência do material e do gabarito.'
  elif discipline=='Inglês' and topic=='Gramática' and expected==46 and src==70:
   norm=46;note='No PDF, a questão está numerada como 70; normalizada para 46 pela posição entre as questões 45 e 47 e pela sequência do gabarito.'
  elif src!=expected:
   if src<expected:continue
   raise RuntimeError(('unexpected',discipline,topic,expected,src))
  ms.append((m,norm,src,note));expected=norm+1
 expected_set=set(range(1,max_n+1))-missing_numbers
 got={n for _,n,_,_ in ms}
 if got!=expected_set:raise RuntimeError(('seq',discipline,topic,sorted(expected_set-got),sorted(got-expected_set)))
 active=clean(s[:ms[0][0].start()]);out=[]
 for i,(m,n,srcnum,note) in enumerate(ms):
  end=ms[i+1][0].start() if i+1<len(ms) else len(s);block=s[m.end():end].strip()
  rmarks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\)\s+',block));last={}
  for z in rmarks:last[z.group(1)]=z
  if set(last)!={'A','B','C','D'}:raise RuntimeError(('opts',discipline,topic,n,block[:1600]))
  chosen=sorted(last.values(),key=lambda x:x.start());statement=clean(block[:chosen[0].start()]);opts=[];tail=''
  for k,z in enumerate(chosen):
   z_end=chosen[k+1].start() if k+1<len(chosen) else len(block);txt=block[z.end():z_end]
   if k==3:
    od,tail=split_d_tail(txt);opts.append(od)
   else:opts.append(clean(txt))
  p=qpage(a,b,srcnum)
  answer_letter=answers.get(n)
  item={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':active,'statement':statement,'options':opts,'answer':('ABCD'.index(answer_letter) if answer_letter else None),'explanation':(f'Gabarito oficial da apostila: {answer_letter}.' if answer_letter else ''),'source':re.sub(r'\s+',' ',m.group(0).split('(',1)[1].rsplit(')',1)[0]).strip(),'origin':ORIGIN,'reviewed':bool(answer_letter),'sourcePage':p,'sourceQuestionNumber':srcnum}
  if note:item['sourceNumberingNote']=note
  out.append(item)
  if tail and (len(tail)>80 or re.search(r'Texto para|(?m)^\s*(?:1\.|01\s+)\s*\S',tail)):
   tail=re.sub(r'(?is)^Texto para a próxima questão\s*','',tail)
   active=clean(tail)
 return out

# Chaves oficiais e extração das questões restantes
soc_secs=[('RELAÇÕES ÉTNICO-RACIAIS E GÊNERO',33),('SOCIOLOGIA AMBIENTAL',7),('SOCIEDADE, ESTADO E PODER',68),('SOCIOLOGIA BRASILEIRA',22),('TEÓRICOS DA SOCIOLOGIA',61),('TRABALHO E CIDADANIA',23),('SOCIOLOGIA DA RELIGIÃO',6)]
soc=parse_key(1060,1061,soc_secs)
eng=parse_key(1135,1135,[('INTERPRETAÇÃO DE TEXTO',125),('GRAMÁTICA',90)])
spa=parse_key(1187,1187,[('INTERPRETAÇÃO DE TEXTO',183),('GRAMÁTICA',152)])

Q=[]
Q+=take_simple(998,1004,13,33,'Sociologia','Relações étnico-raciais e gênero','UECE-SOC-REL',soc['RELAÇÕES ÉTNICO-RACIAIS E GÊNERO'])
Q+=take_simple(1005,1006,1,7,'Sociologia','Sociologia ambiental','UECE-SOC-AMB',soc['SOCIOLOGIA AMBIENTAL'])
Q+=take_simple(1007,1026,1,68,'Sociologia','Sociedade, Estado e poder','UECE-SOC-EST',soc['SOCIEDADE, ESTADO E PODER'])
Q+=take_simple(1027,1033,1,22,'Sociologia','Sociologia brasileira','UECE-SOC-BRA',soc['SOCIOLOGIA BRASILEIRA'])
Q+=take_simple(1034,1050,1,61,'Sociologia','Teóricos da sociologia','UECE-SOC-TEO',soc['TEÓRICOS DA SOCIOLOGIA'])
Q+=take_simple(1051,1057,1,23,'Sociologia','Trabalho e cidadania','UECE-SOC-TRA',soc['TRABALHO E CIDADANIA'])
Q+=take_simple(1058,1059,1,6,'Sociologia','Sociologia da religião','UECE-SOC-RELIG',soc['SOCIOLOGIA DA RELIGIÃO'])
EI=parse_lang(1093,1117,133,'Inglês','Interpretação de texto','UECE-ING-INT',eng['INTERPRETAÇÃO DE TEXTO'],{84})
EG=parse_lang(1118,1134,90,'Inglês','Gramática','UECE-ING-GRA',eng['GRAMÁTICA'])
SI=parse_lang(1137,1163,183,'Espanhol','Interpretação de texto','UECE-ESP-INT',spa['INTERPRETAÇÃO DE TEXTO'])
SG=parse_lang(1164,1186,152,'Espanhol','Gramática','UECE-ESP-GRA',spa['GRAMÁTICA'])

blocked=[{'id':'UECE-ING-INT-084','reason':'missing-statement','detail':'O PDF salta da questão 83 para a 85; o gabarito traz a posição 84, mas não há enunciado/alternativas no material.'}]
blocked += [{'id':x['id'],'reason':'missing-answer','sourcePage':x.get('sourcePage',1117),'detail':'Questão presente no PDF, mas sem resposta preenchida no gabarito oficial da apostila.'} for x in EI if x['answer'] is None]
published=Q+[x for x in EI if x['answer'] is not None]+EG+SI+SG

if len(Q)!=208 or len(EI)!=132 or len(EG)!=90 or len(SI)!=183 or len(SG)!=152: raise RuntimeError('contagens de origem divergentes')
if len(published)!=757 or len(blocked)!=9: raise RuntimeError(f'fechamento divergente: published={len(published)} blocked={len(blocked)}')
if len({q['id'] for q in published})!=757: raise RuntimeError('IDs duplicados no restante')
for q in published:
 if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']) or not isinstance(q['answer'],int) or q['answer'] not in range(4) or not q['discipline'] or not q['topic'] or not q['source'] or not q['origin']:
  raise RuntimeError('catraca básica: '+q['id'])
 if TEXT_REF.search(q['statement']) and not q['context']: raise RuntimeError('contexto ausente: '+q['id'])
 if MEDIA_REF.search(q['statement']) and not q.get('media'): raise RuntimeError('mídia ausente: '+q['id'])

lots=[published[:300],published[300:600],published[600:]]
names=[('UECE_RESTANTE_LOTE_300_21','ueceRestanteLote300_21'),('UECE_RESTANTE_LOTE_300_22','ueceRestanteLote300_22'),('UECE_RESTANTE_LOTE_FINAL_23','ueceRestanteLoteFinal_23')]
for arr,(const,base) in zip(lots,names):
 chunks=[]
 for k in range(0,len(arr),20):
  part=arr[k:k+20]; pc=f'{const}_P{k//20+1:02d}'; fn=f'{base}_p{k//20+1:02d}.js'
  (OUT/fn).write_text('export const '+pc+'='+json.dumps(part,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
  chunks.append((pc,fn[:-3]))
 imports='\n'.join(f'import{{{pc}}}from"./{mod}.js";' for pc,mod in chunks)
 spreads=','.join('...'+pc for pc,_ in chunks)
 (OUT/f'{base}.js').write_text(imports+f'\nexport const {const}=[{spreads}];\n',encoding='utf-8')

(ROOT/'docs/UECE_PENDENCIAS_FINAIS.json').write_text(json.dumps({'blocked':blocked,'publishedRemaining':757,'sourcePositionsRemaining':766},ensure_ascii=False,indent=2),encoding='utf-8')

r=ROOT/'src/data/questionRegistry.js'; t=r.read_text(encoding='utf-8')
anchor='import{UECE_FIL_SOC_LOTE_300_20}from"./questionSources/ueceFilosofiaSociologiaLote300_20";'
imports='\n'.join([
'import{UECE_RESTANTE_LOTE_300_21}from"./questionSources/ueceRestanteLote300_21";',
'import{UECE_RESTANTE_LOTE_300_22}from"./questionSources/ueceRestanteLote300_22";',
'import{UECE_RESTANTE_LOTE_FINAL_23}from"./questionSources/ueceRestanteLoteFinal_23";'])
if 'UECE_RESTANTE_LOTE_300_21' not in t:
 if anchor not in t: raise RuntimeError('âncora lote 20 ausente')
 t=t.replace(anchor,anchor+'\n'+imports)
needle='...UECE_FIL_SOC_LOTE_300_20].map(sanitizeQuestion)'
replacement='...UECE_FIL_SOC_LOTE_300_20,...UECE_RESTANTE_LOTE_300_21,...UECE_RESTANTE_LOTE_300_22,...UECE_RESTANTE_LOTE_FINAL_23].map(sanitizeQuestion)'
if needle in t: t=t.replace(needle,replacement)
elif replacement not in t: raise RuntimeError('registry mudou')
r.write_text(t,encoding='utf-8')

ver='import{UECE_RESTANTE_LOTE_300_21 as A}from"../src/data/questionSources/ueceRestanteLote300_21.js";\nimport{UECE_RESTANTE_LOTE_300_22 as B}from"../src/data/questionSources/ueceRestanteLote300_22.js";\nimport{UECE_RESTANTE_LOTE_FINAL_23 as C}from"../src/data/questionSources/ueceRestanteLoteFinal_23.js";\nimport{auditQuestionBank}from"../src/data/questionAuditEngine.js";\nconst lots=[["21",A,300],["22",B,300],["23",C,157]];let all=[];for(const[n,q,c]of lots){if(q.length!==c)throw new Error("lote "+n+": "+q.length);const a=auditQuestionBank(q);if(a.stats.published!==c||a.stats.quarantined||a.stats.duplicates){console.error(a.quarantined.map(x=>({id:x.id,issues:x.auditIssues})));throw new Error("catraca lote "+n+": "+JSON.stringify(a.stats))}all.push(...q)}if(new Set(all.map(q=>q.id)).size!==757)throw new Error("ids");const d=all.reduce((a,q)=>(a[q.discipline]=(a[q.discipline]||0)+1,a),{});if(d.Sociologia!==208||d["Inglês"]!==214||d.Espanhol!==335)throw new Error(JSON.stringify(d));console.log("Restante UECE OK — lote21 300 | lote22 300 | lote23 157 | total 757 | bloqueadas na fonte 9");\n'
(ROOT/'scripts/verificar_uece_restante_final.mjs').write_text(ver,encoding='utf-8')
print('Restante preparado: 757 publicáveis em 300 + 300 + 157; 9 bloqueadas por ausência na fonte/gabarito.')
,s)
 if m:return clean(m.group(1)),clean('Complete os espaços no texto a seguir. '+m.group(2))
 matches=list(PROMPT_CUE.finditer(s))
 if matches:
  m=matches[-1]
  if m.start()>=80:return clean(s[:m.start()]),clean(s[m.start():])
 # Alguns itens trazem o texto-base e só no fim iniciam o comando que referencia "trecho/texto anterior".
 # Se o sufixo depende explicitamente do texto e há conteúdo substancial antes, separa sem inventar conteúdo.
 for pat in [r'(?is)\bConsiderando\b',r'(?is)\bAssinale\b',r'(?is)\bCom\s+base\b',r'(?is)\bDe\s+acordo\b']:
  found=list(re.finditer(pat,s))
  if found:
   m=found[-1]
   suffix=clean(s[m.start():])
   if m.start()>=120 and TEXT_REF.search(suffix):
    return clean(s[:m.start()]),suffix
 return '',s

def qpage(a,b,n):
 pat=re.compile(r'(?m)^\s*0*'+str(n)+r'\s*[\)\.]?\s*\(UECE')
 for p in range(a,b+1):
  if pat.search(raw(p)):return p
 return a

def media(p,discipline):
 dest=MEDIA/f"{discipline.lower()}-p{p}.png"
 if not dest.exists(): d[p-1].get_pixmap(matrix=fitz.Matrix(1.35,1.35),alpha=False).save(dest)
 return {"type":"source-crop","src":f"question-media/uece/final/{dest.name}","title":"Página original da questão","caption":f"Apostila UECE · página {p}","originalCrop":True,"sourcePage":p}

def take_simple(a,b,start,end,discipline,topic,prefix,ans):
 s=pages(a,b);out=[];pos=0
 for n in range(start,end+1):
  m=re.compile(r'(?m)^\s*0*'+str(n)+r'\s*\)?\s*\(?(UECE[^)\n]*)\)?\s*').search(s,pos)
  if not m:raise RuntimeError(('missing',topic,n))
  nx=re.compile(r'(?m)^\s*\d+\s*\)?\s*\(?UECE').search(s,m.end())
  block=s[m.end():(nx.start() if nx else len(s))].strip();pos=nx.start() if nx else len(s)
  marks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\)\s+',block));last={}
  for z in marks:last[z.group(1)]=z
  if set(last)!={'A','B','C','D'}:raise RuntimeError(('opts',topic,n,block[:1200]))
  chosen=sorted(last.values(),key=lambda x:x.start());rawst=clean(block[:chosen[0].start()]);opts=[]
  for i,z in enumerate(chosen):opts.append(clean(block[z.end():(chosen[i+1].start() if i+1<len(chosen) else len(block))]))
  ctx,st=split_simple_context(rawst)
  p=qpage(a,b,n)
  item={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':ctx,'statement':st,'options':opts,'answer':'ABCD'.index(ans[n]),'explanation':f'Gabarito oficial da apostila: {ans[n]}.','source':clean(m.group(1)),'origin':ORIGIN,'reviewed':True,'sourcePage':p}
  if MEDIA_REF.search(st): item['media']=media(p,discipline)
  out.append(item)
 return out

def split_d_tail(txt):
 candidates=[]
 m=re.search(r'(?im)^\s*Texto para a próxima questão\s*',txt)
 if m:candidates.append((m.start(),'marker',m.end()))
 m=re.search(r'\n\s*\n+',txt)
 if m:candidates.append((m.start(),'blank',m.end()))
 m=re.search(r'(?m)^\s*(?:1\.|01\s+)\s*\S',txt)
 if m:candidates.append((m.start(),'line1',m.start()))
 if not candidates:return clean(txt),''
 pos,kind,endpos=min(candidates,key=lambda x:x[0])
 if kind=='blank': return clean(txt[:pos]),clean(txt[endpos:])
 return clean(txt[:pos]),clean(txt[pos:])

def parse_lang(a,b,max_n,discipline,topic,prefix,answers,missing_numbers=None):
 missing_numbers=set(missing_numbers or [])
 s=pages(a,b)
 s=re.sub(r'^\s*(?:'+re.escape(discipline)+r'\s*)?(?:'+re.escape(topic)+r')\s*','',s,flags=re.I)
 qre=re.compile(r'(?m)^\s*0*(\d+)\s*[\)\.]?\s*\(UECE[\s\S]{0,90}?\)\s*')
 rawms=list(qre.finditer(s));ms=[];expected=1
 for m in rawms:
  src=int(m.group(1))
  if src>max_n:continue
  if expected in missing_numbers and src==expected+1:expected+=1
  norm=src;note=None
  if discipline=='Inglês' and topic=='Gramática' and expected==39 and src==36:
   norm=39;note='No PDF, a questão está numerada novamente como 36; normalizada para 39 pela sequência do material e do gabarito.'
  elif discipline=='Inglês' and topic=='Gramática' and expected==46 and src==70:
   norm=46;note='No PDF, a questão está numerada como 70; normalizada para 46 pela posição entre as questões 45 e 47 e pela sequência do gabarito.'
  elif src!=expected:
   if src<expected:continue
   raise RuntimeError(('unexpected',discipline,topic,expected,src))
  ms.append((m,norm,src,note));expected=norm+1
 expected_set=set(range(1,max_n+1))-missing_numbers
 got={n for _,n,_,_ in ms}
 if got!=expected_set:raise RuntimeError(('seq',discipline,topic,sorted(expected_set-got),sorted(got-expected_set)))
 active=clean(s[:ms[0][0].start()]);out=[]
 for i,(m,n,srcnum,note) in enumerate(ms):
  end=ms[i+1][0].start() if i+1<len(ms) else len(s);block=s[m.end():end].strip()
  rmarks=list(re.finditer(r'(?:^|\n|\s)([ABCD])\)\s+',block));last={}
  for z in rmarks:last[z.group(1)]=z
  if set(last)!={'A','B','C','D'}:raise RuntimeError(('opts',discipline,topic,n,block[:1600]))
  chosen=sorted(last.values(),key=lambda x:x.start());statement=clean(block[:chosen[0].start()]);opts=[];tail=''
  for k,z in enumerate(chosen):
   z_end=chosen[k+1].start() if k+1<len(chosen) else len(block);txt=block[z.end():z_end]
   if k==3:
    od,tail=split_d_tail(txt);opts.append(od)
   else:opts.append(clean(txt))
  p=qpage(a,b,srcnum)
  answer_letter=answers.get(n)
  item={'id':f'{prefix}-{n:03d}','discipline':discipline,'topic':topic,'context':active,'statement':statement,'options':opts,'answer':('ABCD'.index(answer_letter) if answer_letter else None),'explanation':(f'Gabarito oficial da apostila: {answer_letter}.' if answer_letter else ''),'source':re.sub(r'\s+',' ',m.group(0).split('(',1)[1].rsplit(')',1)[0]).strip(),'origin':ORIGIN,'reviewed':bool(answer_letter),'sourcePage':p,'sourceQuestionNumber':srcnum}
  if note:item['sourceNumberingNote']=note
  out.append(item)
  if tail and (len(tail)>80 or re.search(r'Texto para|(?m)^\s*(?:1\.|01\s+)\s*\S',tail)):
   tail=re.sub(r'(?is)^Texto para a próxima questão\s*','',tail)
   active=clean(tail)
 return out

# Chaves oficiais e extração das questões restantes
soc_secs=[('RELAÇÕES ÉTNICO-RACIAIS E GÊNERO',33),('SOCIOLOGIA AMBIENTAL',7),('SOCIEDADE, ESTADO E PODER',68),('SOCIOLOGIA BRASILEIRA',22),('TEÓRICOS DA SOCIOLOGIA',61),('TRABALHO E CIDADANIA',23),('SOCIOLOGIA DA RELIGIÃO',6)]
soc=parse_key(1060,1061,soc_secs)
eng=parse_key(1135,1135,[('INTERPRETAÇÃO DE TEXTO',125),('GRAMÁTICA',90)])
spa=parse_key(1187,1187,[('INTERPRETAÇÃO DE TEXTO',183),('GRAMÁTICA',152)])

Q=[]
Q+=take_simple(998,1004,13,33,'Sociologia','Relações étnico-raciais e gênero','UECE-SOC-REL',soc['RELAÇÕES ÉTNICO-RACIAIS E GÊNERO'])
Q+=take_simple(1005,1006,1,7,'Sociologia','Sociologia ambiental','UECE-SOC-AMB',soc['SOCIOLOGIA AMBIENTAL'])
Q+=take_simple(1007,1026,1,68,'Sociologia','Sociedade, Estado e poder','UECE-SOC-EST',soc['SOCIEDADE, ESTADO E PODER'])
Q+=take_simple(1027,1033,1,22,'Sociologia','Sociologia brasileira','UECE-SOC-BRA',soc['SOCIOLOGIA BRASILEIRA'])
Q+=take_simple(1034,1050,1,61,'Sociologia','Teóricos da sociologia','UECE-SOC-TEO',soc['TEÓRICOS DA SOCIOLOGIA'])
Q+=take_simple(1051,1057,1,23,'Sociologia','Trabalho e cidadania','UECE-SOC-TRA',soc['TRABALHO E CIDADANIA'])
Q+=take_simple(1058,1059,1,6,'Sociologia','Sociologia da religião','UECE-SOC-RELIG',soc['SOCIOLOGIA DA RELIGIÃO'])
EI=parse_lang(1093,1117,133,'Inglês','Interpretação de texto','UECE-ING-INT',eng['INTERPRETAÇÃO DE TEXTO'],{84})
EG=parse_lang(1118,1134,90,'Inglês','Gramática','UECE-ING-GRA',eng['GRAMÁTICA'])
SI=parse_lang(1137,1163,183,'Espanhol','Interpretação de texto','UECE-ESP-INT',spa['INTERPRETAÇÃO DE TEXTO'])
SG=parse_lang(1164,1186,152,'Espanhol','Gramática','UECE-ESP-GRA',spa['GRAMÁTICA'])

blocked=[{'id':'UECE-ING-INT-084','reason':'missing-statement','detail':'O PDF salta da questão 83 para a 85; o gabarito traz a posição 84, mas não há enunciado/alternativas no material.'}]
blocked += [{'id':x['id'],'reason':'missing-answer','sourcePage':x.get('sourcePage',1117),'detail':'Questão presente no PDF, mas sem resposta preenchida no gabarito oficial da apostila.'} for x in EI if x['answer'] is None]
published=Q+[x for x in EI if x['answer'] is not None]+EG+SI+SG

if len(Q)!=208 or len(EI)!=132 or len(EG)!=90 or len(SI)!=183 or len(SG)!=152: raise RuntimeError('contagens de origem divergentes')
if len(published)!=757 or len(blocked)!=9: raise RuntimeError(f'fechamento divergente: published={len(published)} blocked={len(blocked)}')
if len({q['id'] for q in published})!=757: raise RuntimeError('IDs duplicados no restante')
for q in published:
 if not q['statement'] or len(q['options'])!=4 or any(not x for x in q['options']) or not isinstance(q['answer'],int) or q['answer'] not in range(4) or not q['discipline'] or not q['topic'] or not q['source'] or not q['origin']:
  raise RuntimeError('catraca básica: '+q['id'])
 if TEXT_REF.search(q['statement']) and not q['context']: raise RuntimeError('contexto ausente: '+q['id'])
 if MEDIA_REF.search(q['statement']) and not q.get('media'): raise RuntimeError('mídia ausente: '+q['id'])

lots=[published[:300],published[300:600],published[600:]]
names=[('UECE_RESTANTE_LOTE_300_21','ueceRestanteLote300_21'),('UECE_RESTANTE_LOTE_300_22','ueceRestanteLote300_22'),('UECE_RESTANTE_LOTE_FINAL_23','ueceRestanteLoteFinal_23')]
for arr,(const,base) in zip(lots,names):
 chunks=[]
 for k in range(0,len(arr),20):
  part=arr[k:k+20]; pc=f'{const}_P{k//20+1:02d}'; fn=f'{base}_p{k//20+1:02d}.js'
  (OUT/fn).write_text('export const '+pc+'='+json.dumps(part,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
  chunks.append((pc,fn[:-3]))
 imports='\n'.join(f'import{{{pc}}}from"./{mod}.js";' for pc,mod in chunks)
 spreads=','.join('...'+pc for pc,_ in chunks)
 (OUT/f'{base}.js').write_text(imports+f'\nexport const {const}=[{spreads}];\n',encoding='utf-8')

(ROOT/'docs/UECE_PENDENCIAS_FINAIS.json').write_text(json.dumps({'blocked':blocked,'publishedRemaining':757,'sourcePositionsRemaining':766},ensure_ascii=False,indent=2),encoding='utf-8')

r=ROOT/'src/data/questionRegistry.js'; t=r.read_text(encoding='utf-8')
anchor='import{UECE_FIL_SOC_LOTE_300_20}from"./questionSources/ueceFilosofiaSociologiaLote300_20";'
imports='\n'.join([
'import{UECE_RESTANTE_LOTE_300_21}from"./questionSources/ueceRestanteLote300_21";',
'import{UECE_RESTANTE_LOTE_300_22}from"./questionSources/ueceRestanteLote300_22";',
'import{UECE_RESTANTE_LOTE_FINAL_23}from"./questionSources/ueceRestanteLoteFinal_23";'])
if 'UECE_RESTANTE_LOTE_300_21' not in t:
 if anchor not in t: raise RuntimeError('âncora lote 20 ausente')
 t=t.replace(anchor,anchor+'\n'+imports)
needle='...UECE_FIL_SOC_LOTE_300_20].map(sanitizeQuestion)'
replacement='...UECE_FIL_SOC_LOTE_300_20,...UECE_RESTANTE_LOTE_300_21,...UECE_RESTANTE_LOTE_300_22,...UECE_RESTANTE_LOTE_FINAL_23].map(sanitizeQuestion)'
if needle in t: t=t.replace(needle,replacement)
elif replacement not in t: raise RuntimeError('registry mudou')
r.write_text(t,encoding='utf-8')

ver='import{UECE_RESTANTE_LOTE_300_21 as A}from"../src/data/questionSources/ueceRestanteLote300_21.js";\nimport{UECE_RESTANTE_LOTE_300_22 as B}from"../src/data/questionSources/ueceRestanteLote300_22.js";\nimport{UECE_RESTANTE_LOTE_FINAL_23 as C}from"../src/data/questionSources/ueceRestanteLoteFinal_23.js";\nimport{auditQuestionBank}from"../src/data/questionAuditEngine.js";\nconst lots=[["21",A,300],["22",B,300],["23",C,157]];let all=[];for(const[n,q,c]of lots){if(q.length!==c)throw new Error("lote "+n+": "+q.length);const a=auditQuestionBank(q);if(a.stats.published!==c||a.stats.quarantined||a.stats.duplicates){console.error(a.quarantined.map(x=>({id:x.id,issues:x.auditIssues})));throw new Error("catraca lote "+n+": "+JSON.stringify(a.stats))}all.push(...q)}if(new Set(all.map(q=>q.id)).size!==757)throw new Error("ids");const d=all.reduce((a,q)=>(a[q.discipline]=(a[q.discipline]||0)+1,a),{});if(d.Sociologia!==208||d["Inglês"]!==214||d.Espanhol!==335)throw new Error(JSON.stringify(d));console.log("Restante UECE OK — lote21 300 | lote22 300 | lote23 157 | total 757 | bloqueadas na fonte 9");\n'
(ROOT/'scripts/verificar_uece_restante_final.mjs').write_text(ver,encoding='utf-8')
print('Restante preparado: 757 publicáveis em 300 + 300 + 157; 9 bloqueadas por ausência na fonte/gabarito.')
