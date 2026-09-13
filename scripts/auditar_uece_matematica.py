#!/usr/bin/env python3
from __future__ import annotations
import json, re, unicodedata
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/'src'/'data'/'questionSources'
REFS=SRC/'ueceMatematicaReferenciasLegadas.js'

RETIRED_IDS={
'UECE-MAT-209','UECE-MAT-210','UECE-MAT-211','UECE-MAT-212','UECE-MAT-213','UECE-MAT-214','UECE-MAT-215','UECE-MAT-217','UECE-MAT-218','UECE-MAT-219','UECE-MAT-220','UECE-MAT-221','UECE-MAT-222','UECE-MAT-223','UECE-MAT-224','UECE-MAT-225','UECE-MAT-226','UECE-MAT-227',
'UECE-MAT-509','UECE-MAT-510','UECE-MAT-511','UECE-MAT-541','UECE-MAT-542','UECE-MAT-543','UECE-MAT-544','UECE-MAT-545','UECE-MAT-546','UECE-MAT-547','UECE-MAT-548','UECE-MAT-550','UECE-MAT-551','UECE-MAT-552','UECE-MAT-553','UECE-MAT-554','UECE-MAT-555','UECE-MAT-556','UECE-MAT-557','UECE-MAT-558','UECE-MAT-559','UECE-MAT-560','UECE-MAT-562','UECE-MAT-563','UECE-MAT-564','UECE-MAT-565','UECE-MAT-566','UECE-MAT-567','UECE-MAT-568','UECE-MAT-569','UECE-MAT-570','UECE-MAT-571','UECE-MAT-572','UECE-MAT-573','UECE-MAT-574','UECE-MAT-575','UECE-MAT-576','UECE-MAT-577','UECE-MAT-578','UECE-MAT-579','UECE-MAT-580','UECE-MAT-581','UECE-MAT-582','UECE-MAT-583','UECE-MAT-584'}

# Contagem oficial lida no quadro de gabaritos das pp. 77-78 da apostila.
EXPECTED_MAX={
'ARITMETICA':10,'ANALISE_COMBINATORIA':36,'CONJUNTOS':9,'FUNCAO_1_GRAU':14,'FUNCAO_2_GRAU':23,'FUNCOES':32,
'GEOMETRIA_ANALITICA':43,'GEOMETRIA_ESPACIAL':49,'GEOMETRIA_PLANA':75,'PA':16,'PG':16,'MATEMATICA_FINANCEIRA':24,
'RAZAO_PROPORCAO':13,'OPERACOES_BASICAS':22,'SISTEMAS_SEQUENCIAS':19,'LOGARITMO':23,'POLINOMIOS_COMPLEXOS':54,
'TRIGONOMETRIA':53,'MATRIZES_DETERMINANTES':25,'EXPRESSAO_ALGEBRICA':3,'INEQUACAO_IRRACIONAIS':3,'PRODUTOS_NOTAVEIS':3}
# Matrizes q22 não possui resposta no quadro oficial; logo não integra.
EXPECTED_EXCLUDE={'MATRIZES_DETERMINANTES':{22}}

def norm(s):
    return re.sub(r'[^a-z0-9]+',' ',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip()
def canonical_topic(topic):
    t=norm(topic)
    rules=[('aritmetica','ARITMETICA'),('analise combinatoria','ANALISE_COMBINATORIA'),('conjuntos','CONJUNTOS'),('funcao e equacao do 1','FUNCAO_1_GRAU'),('funcao e equacao do 2','FUNCAO_2_GRAU'),('funcoes','FUNCOES'),('geometria analitica','GEOMETRIA_ANALITICA'),('geometria espacial','GEOMETRIA_ESPACIAL'),('geometria plana','GEOMETRIA_PLANA'),('progressao aritmetica','PA'),('progressao geometrica','PG'),('matematica financeira','MATEMATICA_FINANCEIRA'),('razao','RAZAO_PROPORCAO'),('operacoes basicas','OPERACOES_BASICAS'),('sistemas e sequencias','SISTEMAS_SEQUENCIAS'),('logarit','LOGARITMO'),('polinom','POLINOMIOS_COMPLEXOS'),('trigonom','TRIGONOMETRIA'),('matrizes','MATRIZES_DETERMINANTES'),('expressao algebrica','EXPRESSAO_ALGEBRICA'),('inequacao','INEQUACAO_IRRACIONAIS'),('produtos notaveis','PRODUTOS_NOTAVEIS')]
    for token,label in rules:
        if token in t:return label
    return t.upper().replace(' ','_')
def iter_objects(text):
    pat=re.compile(r'\{\s*(?:"id"|id)\s*:\s*"(?P<id>UECE-MAT-[^"]+)"')
    for m in pat.finditer(text):
        start=m.start();depth=0;quote=None;esc=False
        for i in range(start,len(text)):
            ch=text[i]
            if quote:
                if esc:esc=False
                elif ch=='\\':esc=True
                elif ch==quote:quote=None
                continue
            if ch in ('"',"'",'`'):quote=ch;continue
            if ch=='{':depth+=1
            elif ch=='}':
                depth-=1
                if depth==0:yield m.group('id'),text[start:i+1];break
def field_str(body,name):
    m=re.search(rf'(?:"{re.escape(name)}"|\b{re.escape(name)})\s*:\s*"([^"]*)"',body);return m.group(1) if m else None
def field_int(body,name):
    m=re.search(rf'(?:"{re.escape(name)}"|\b{re.escape(name)})\s*:\s*(\d+)',body);return int(m.group(1)) if m else None
def load_refs():
    if not REFS.exists():return {}
    text=REFS.read_text(encoding='utf-8',errors='ignore');out={}
    for m in re.finditer(r'"(?P<id>UECE-MAT-\d+)"\s*:\s*\{(?P<body>[^}]*)\}',text):
        b=m.group('body');out[m.group('id')]={'sourceQuestion':field_int(b,'sourceQuestion'),'sourcePage':field_int(b,'sourcePage'),'origin':field_str(b,'origin')}
    return out
def main():
    ov=load_refs();records=[];ret=[]
    for path in sorted(SRC.glob('ueceMatematica*.js')):
        if path==REFS:continue
        text=path.read_text(encoding='utf-8',errors='ignore')
        for qid,body in iter_objects(text):
            if qid in RETIRED_IDS:ret.append({'id':qid,'file':path.name});continue
            o=ov.get(qid,{})
            records.append({'id':qid,'file':path.name,'topic':field_str(body,'topic'),'sourcePage':field_int(body,'sourcePage') or o.get('sourcePage'),'sourceQuestion':field_int(body,'sourceQuestion') or o.get('sourceQuestion'),'origin':field_str(body,'origin') or o.get('origin')})
    by_id={};by_source={};missing=[];missing_origin=[];present={}
    for r in records:
        by_id.setdefault(r['id'],[]).append(r)
        if r['topic'] and r['sourceQuestion'] is not None:
            ct=canonical_topic(r['topic']);key=(ct,r['sourceQuestion']);by_source.setdefault(key,[]).append(r);present.setdefault(ct,set()).add(r['sourceQuestion'])
        else:missing.append(r)
        if not r.get('origin'):missing_origin.append(r)
    dup_ids={k:v for k,v in by_id.items() if len(v)>1};dup_source={f'{k[0]}#{k[1]}':v for k,v in by_source.items() if len(v)>1}
    lacunas={}
    for topic,maxn in EXPECTED_MAX.items():
        expected=set(range(1,maxn+1))-EXPECTED_EXCLUDE.get(topic,set())
        miss=sorted(expected-present.get(topic,set()))
        if miss:lacunas[topic]=miss
    expected_total=sum(EXPECTED_MAX.values())-sum(len(x) for x in EXPECTED_EXCLUDE.values())
    status='OK' if not dup_ids and not dup_source and not missing else 'REVISAR'
    report={'registros_ativos_uece_mat':len(records),'ids_aposentados_por_duplicidade':len(ret),'ids_unicos_ativos':len(by_id),'fontes_unicas_topic_sourceQuestion':len(by_source),'total_oficial_com_gabarito':expected_total,'total_lacunas_oficiais':sum(len(v) for v in lacunas.values()),'lacunas_por_assunto':lacunas,'ids_duplicados':len(dup_ids),'fontes_duplicadas':len(dup_source),'sem_referencia_topic_sourceQuestion':len(missing),'sem_origin':len(missing_origin),'status':status}
    (ROOT/'uece-matematica-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8');print(json.dumps(report,ensure_ascii=False,indent=2));raise SystemExit(0 if status=='OK' else 1)
if __name__=='__main__':main()
