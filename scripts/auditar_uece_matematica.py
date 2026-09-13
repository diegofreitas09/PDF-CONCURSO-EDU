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
    for path in sorted(SRC.glob('ueceMatematica*.js')):
        text=path.read_text(encoding='utf-8', errors='ignore')
        for qid, body in iter_objects(text):
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

    report={
        'arquivos_matematica': len(list(SRC.glob('ueceMatematica*.js'))),
        'registros_literais_uece_mat': len(records),
        'ids_unicos': len(by_id),
        'fontes_unicas_topic_sourceQuestion': unique_source,
        'ids_duplicados': len(dup_ids),
        'fontes_duplicadas': len(dup_source),
        'sem_referencia_topic_sourceQuestion': len(missing_source),
        'duplicidades_id': dup_ids,
        'duplicidades_fonte': dup_source,
        'sem_referencia': missing_source,
        'status': 'OK' if not dup_ids and not dup_source else 'REVISAR',
    }
    (ROOT/'uece-matematica-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if report['status']=='OK' else 1)

if __name__=='__main__':
    main()
