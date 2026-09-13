#!/usr/bin/env python3
"""Auditoria de identidade das questões UECE de Matemática.

Valida IDs e, principalmente, duplicidades da questão-fonte usando
(tópico canônico, sourceQuestion). Isso evita inflar o banco ao reinserir
uma mesma questão com outro UECE-MAT-XXX.
"""
from __future__ import annotations
import json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "data" / "questionSources"

# Reinserções confirmadas pela auditoria de 2026-09-13.
# Permanecem nos arquivos históricos para rastreabilidade, mas não fazem parte
# do banco efetivo e não entram na contagem de identidade.
RETIRED_IDS = {
    "UECE-MAT-509", "UECE-MAT-510", "UECE-MAT-511",
    "UECE-MAT-541", "UECE-MAT-542", "UECE-MAT-543", "UECE-MAT-544", "UECE-MAT-545", "UECE-MAT-546", "UECE-MAT-547", "UECE-MAT-548",
    "UECE-MAT-550", "UECE-MAT-551", "UECE-MAT-552", "UECE-MAT-553", "UECE-MAT-554", "UECE-MAT-555", "UECE-MAT-556", "UECE-MAT-557", "UECE-MAT-558", "UECE-MAT-559", "UECE-MAT-560",
    "UECE-MAT-562", "UECE-MAT-563", "UECE-MAT-564", "UECE-MAT-565", "UECE-MAT-566", "UECE-MAT-567", "UECE-MAT-568", "UECE-MAT-569", "UECE-MAT-570", "UECE-MAT-571", "UECE-MAT-572", "UECE-MAT-573", "UECE-MAT-574", "UECE-MAT-575", "UECE-MAT-576", "UECE-MAT-577", "UECE-MAT-578", "UECE-MAT-579", "UECE-MAT-580", "UECE-MAT-581", "UECE-MAT-582", "UECE-MAT-583", "UECE-MAT-584",
}


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def canonical_topic(topic: str) -> str:
    t = norm(topic)
    rules = [
        ("aritmetica", "ARITMETICA"),
        ("analise combinatoria", "ANALISE_COMBINATORIA"),
        ("conjuntos", "CONJUNTOS"),
        ("funcao e equacao do 1", "FUNCAO_1_GRAU"),
        ("funcao e equacao do 2", "FUNCAO_2_GRAU"),
        ("funcoes", "FUNCOES"),
        ("geometria analitica", "GEOMETRIA_ANALITICA"),
        ("geometria espacial", "GEOMETRIA_ESPACIAL"),
        ("geometria plana", "GEOMETRIA_PLANA"),
        ("progressao aritmetica", "PA"),
        ("progressao geometrica", "PG"),
        ("matematica financeira", "MATEMATICA_FINANCEIRA"),
        ("razao", "RAZAO_PROPORCAO"),
        ("operacoes basicas", "OPERACOES_BASICAS"),
        ("sistemas e sequencias", "SISTEMAS_SEQUENCIAS"),
        ("logarit", "LOGARITMO"),
        ("polinom", "POLINOMIOS_COMPLEXOS"),
        ("trigonom", "TRIGONOMETRIA"),
        ("matrizes", "MATRIZES_DETERMINANTES"),
        ("expressao algebrica", "EXPRESSAO_ALGEBRICA"),
        ("inequacao", "INEQUACAO_IRRACIONAIS"),
        ("produtos notaveis", "PRODUTOS_NOTAVEIS"),
    ]
    for token, label in rules:
        if token in t:
            return label
    return t.upper().replace(" ", "_")


def iter_objects(text: str):
    start_re = re.compile(r'\{\s*(?:"id"|id)\s*:\s*"(?P<id>UECE-MAT-[^"]+)"')
    for m in start_re.finditer(text):
        start = m.start(); depth = 0; quote = None; escape = False
        for i in range(start, len(text)):
            ch = text[i]
            if quote:
                if escape: escape = False
                elif ch == "\\": escape = True
                elif ch == quote: quote = None
                continue
            if ch in ('"', "'", '`'): quote = ch; continue
            if ch == '{': depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    yield m.group('id'), text[start:i+1]
                    break


def field_str(body: str, name: str):
    m = re.search(rf'(?:"{re.escape(name)}"|\b{re.escape(name)})\s*:\s*"([^"]*)"', body)
    return m.group(1) if m else None


def field_int(body: str, name: str):
    m = re.search(rf'(?:"{re.escape(name)}"|\b{re.escape(name)})\s*:\s*(\d+)', body)
    return int(m.group(1)) if m else None


def main():
    records=[]
    retired_seen=[]
    for path in sorted(SRC.glob('ueceMatematica*.js')):
        text=path.read_text(encoding='utf-8', errors='ignore')
        for qid, body in iter_objects(text):
            if qid in RETIRED_IDS:
                retired_seen.append({'id': qid, 'file': path.name})
                continue
            records.append({
                'id': qid,
                'file': path.name,
                'topic': field_str(body,'topic'),
                'sourcePage': field_int(body,'sourcePage'),
                'sourceQuestion': field_int(body,'sourceQuestion'),
            })

    by_id={}
    by_source={}
    missing_source=[]
    for r in records:
        by_id.setdefault(r['id'],[]).append(r)
        if r['topic'] and r['sourceQuestion'] is not None:
            key=(canonical_topic(r['topic']), r['sourceQuestion'])
            by_source.setdefault(key,[]).append(r)
        else:
            missing_source.append(r)

    dup_ids={k:v for k,v in by_id.items() if len(v)>1}
    dup_source={f'{k[0]}#{k[1]}':v for k,v in by_source.items() if len(v)>1}
    unique_source=len(by_source)
    status = 'OK' if not dup_ids and not dup_source and not missing_source else 'REVISAR'

    report={
        'arquivos_matematica': len(list(SRC.glob('ueceMatematica*.js'))),
        'registros_ativos_uece_mat': len(records),
        'ids_aposentados_por_duplicidade': len(retired_seen),
        'ids_unicos_ativos': len(by_id),
        'fontes_unicas_topic_sourceQuestion': unique_source,
        'ids_duplicados': len(dup_ids),
        'fontes_duplicadas': len(dup_source),
        'sem_referencia_topic_sourceQuestion': len(missing_source),
        'duplicidades_id': dup_ids,
        'duplicidades_fonte': dup_source,
        'ids_aposentados': retired_seen,
        'sem_referencia': missing_source,
        'status': status,
    }
    (ROOT/'uece-matematica-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['status']=='OK' else 1)

if __name__=='__main__':
    main()
