#!/usr/bin/env python3
"""Verificador da integração de questões do PDF CONCURSO EDU.

Uso:
  python scripts/verificar_integracao_questoes.py

Audita tanto objetos literais `{id:...}` quanto lotes compactos criados pelo helper
`q(numero, fonte, enunciado, alternativas, gabarito, comentario)`.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "data" / "questionSources"

OBJ_RE = re.compile(r"\{id:\s*\"(?P<id>[^\"]+)\"(?P<body>.*?)\}\s*,?", re.S)
QCALL_RE = re.compile(
    r'q\(\s*(?P<num>\d+)\s*,\s*"(?P<source>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<statement>(?:[^"\\]|\\.)*)"\s*,\s*\[(?P<options>.*?)\]\s*,\s*(?P<answer>\d+)\s*,\s*"(?P<explanation>(?:[^"\\]|\\.)*)"\s*\)',
    re.S,
)
FIELD_STR = lambda name, body: re.search(rf'{name}:\s*\"([^\"]*)\"', body)


def count_strings(text: str):
    return len(re.findall(r'\"(?:[^\"\\]|\\.)*\"', text))


def count_options(body: str):
    m = re.search(r'options:\s*\[(.*?)\]\s*,\s*answer:', body, re.S)
    return count_strings(m.group(1)) if m else None


def answer_index(body: str):
    m = re.search(r'answer:\s*(\d+)', body)
    return int(m.group(1)) if m else None


def has_media(body: str):
    return bool(re.search(r'\bmedia\s*:', body))


def media_ok(body: str):
    return (not has_media(body)) or bool(re.search(r'\b(src|url|latex|value|rows|data|items|nodes)\s*:', body))


def local_media_paths(body: str):
    for m in re.finditer(r'(?:src|url):\s*\"([^\"]+)\"', body):
        value = m.group(1)
        if value.startswith(("http://", "https://", "data:")):
            continue
        yield value.lstrip("/")


def add_id(ids, qid, filename):
    ids.setdefault(qid, []).append(filename)


def main():
    issues=[]; ids={}; total=0; visual=0; literal_total=0; helper_total=0
    files=sorted(SRC.glob("*.js"))

    for path in files:
        text=path.read_text(encoding="utf-8", errors="ignore")

        # Objetos literais
        for match in OBJ_RE.finditer(text):
            qid=match.group("id"); body=match.group("body")
            total+=1; literal_total+=1; add_id(ids,qid,path.name)
            required={"discipline":FIELD_STR("discipline",body),"topic":FIELD_STR("topic",body),"statement":FIELD_STR("statement",body),"explanation":FIELD_STR("explanation",body)}
            for name,value in required.items():
                if not value or not value.group(1).strip(): issues.append({"id":qid,"arquivo":path.name,"erro":f"campo ausente/vazio: {name}"})
            nopt=count_options(body); ans=answer_index(body)
            if nopt!=4: issues.append({"id":qid,"arquivo":path.name,"erro":f"alternativas: {nopt}"})
            if ans is None or ans<0 or (nopt is not None and ans>=nopt): issues.append({"id":qid,"arquivo":path.name,"erro":f"gabarito inválido: {ans}"})
            if has_media(body):
                visual+=1
                if not media_ok(body): issues.append({"id":qid,"arquivo":path.name,"erro":"media sem conteúdo utilizável"})
                for rel in local_media_paths(body):
                    candidates=[ROOT/"public"/rel, ROOT/rel]
                    if not any(p.exists() for p in candidates): issues.append({"id":qid,"arquivo":path.name,"erro":f"mídia local não encontrada: {rel}"})

        # Lotes compactos q(...). O prefixo atualmente utilizado nesses arquivos é UECE-FIS-DIN.
        if 'id:`UECE-FIS-DIN-${String(id).padStart(3,"0")}`' in text:
            for match in QCALL_RE.finditer(text):
                num=int(match.group("num")); qid=f"UECE-FIS-DIN-{num:03d}"
                total+=1; helper_total+=1; add_id(ids,qid,path.name)
                statement=match.group("statement").strip(); explanation=match.group("explanation").strip()
                nopt=count_strings(match.group("options")); ans=int(match.group("answer"))
                if not statement: issues.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: statement"})
                if not explanation: issues.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: explanation"})
                if nopt!=4: issues.append({"id":qid,"arquivo":path.name,"erro":f"alternativas: {nopt}"})
                if ans<0 or ans>=nopt: issues.append({"id":qid,"arquivo":path.name,"erro":f"gabarito inválido: {ans}"})

    duplicates={k:v for k,v in ids.items() if len(v)>1}
    for qid,where in duplicates.items(): issues.append({"id":qid,"arquivo":", ".join(where),"erro":"id duplicado"})

    report={"arquivos_analisados":len(files),"questoes_detectadas":total,"objetos_literais":literal_total,"questoes_helper_q":helper_total,"questoes_com_media":visual,"ids_duplicados":len(duplicates),"pendencias":len(issues),"status":"OK" if not issues else "REVISAR","erros":issues[:500]}
    (ROOT/"question-integration-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if not issues else 1)

if __name__=="__main__": main()
