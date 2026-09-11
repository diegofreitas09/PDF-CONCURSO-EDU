#!/usr/bin/env python3
"""Verificador da integração de questões do PDF CONCURSO EDU.

Uso:
  python scripts/verificar_integracao_questoes.py

Regras principais:
- UECE: auditoria estrita de campos, 4 alternativas, gabarito, comentário e mídia.
- Demais bancos legados: aceita 4 ou 5 alternativas; ausência de comentário vira aviso,
  não bloqueio, para não impedir o deploy por material histórico já publicado.
- Lotes compactos q(...): detectados de forma genérica pelo prefixo do template de id.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "data" / "questionSources"

OBJ_RE = re.compile(r'\{\s*id:\s*"(?P<id>[^"]+)"(?P<body>.*?)\}\s*,?', re.S)
QCALL_RE = re.compile(
    r'q\(\s*(?P<num>\d+)\s*,\s*"(?P<source>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<statement>(?:[^"\\]|\\.)*)"\s*,\s*\[(?P<options>.*?)\]\s*,\s*(?P<answer>\d+)\s*,\s*"(?P<explanation>(?:[^"\\]|\\.)*)"\s*\)',
    re.S,
)
PREFIX_RE = re.compile(r'id:`(?P<prefix>[^$`]+)\$\{String\(id\)\.padStart\(3,"0"\)\}`')
FIELD_STR = lambda name, body: re.search(rf'{name}:\s*"([^"]*)"', body)


def count_strings(text: str):
    return len(re.findall(r'"(?:[^"\\]|\\.)*"', text))


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
    for m in re.finditer(r'(?:src|url):\s*"([^"]+)"', body):
        value = m.group(1)
        if value.startswith(("http://", "https://", "data:")):
            continue
        yield value.lstrip("/")


def add_id(ids, qid, filename):
    ids.setdefault(qid, []).append(filename)


def is_uece(path: Path, qid: str = "") -> bool:
    return path.name.lower().startswith("uece") or str(qid).upper().startswith("UECE-")


def check_options(issues, qid, filename, nopt, strict_uece):
    valid = (nopt == 4) if strict_uece else (nopt in {4, 5})
    if not valid:
        expected = "4" if strict_uece else "4 ou 5"
        issues.append({"id": qid, "arquivo": filename, "erro": f"alternativas: {nopt} (esperado {expected})"})


def main():
    issues=[]; warnings=[]; ids={}; total=0; visual=0; literal_total=0; helper_total=0
    files=sorted(SRC.glob("*.js"))

    for path in files:
        text=path.read_text(encoding="utf-8", errors="ignore")

        # Objetos literais
        for match in OBJ_RE.finditer(text):
            qid=match.group("id"); body=match.group("body")
            total+=1; literal_total+=1; add_id(ids,qid,path.name)
            strict=is_uece(path,qid)

            required=("discipline","topic","statement")
            for name in required:
                value=FIELD_STR(name,body)
                if not value or not value.group(1).strip():
                    issues.append({"id":qid,"arquivo":path.name,"erro":f"campo ausente/vazio: {name}"})

            explanation=FIELD_STR("explanation",body)
            if not explanation or not explanation.group(1).strip():
                target=issues if strict else warnings
                target.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: explanation"})

            if strict:
                for name in ("source","origin"):
                    value=FIELD_STR(name,body)
                    if not value or not value.group(1).strip():
                        issues.append({"id":qid,"arquivo":path.name,"erro":f"campo ausente/vazio: {name}"})

            nopt=count_options(body); ans=answer_index(body)
            check_options(issues,qid,path.name,nopt,strict)
            if ans is None or ans<0 or (nopt is not None and ans>=nopt):
                issues.append({"id":qid,"arquivo":path.name,"erro":f"gabarito inválido: {ans}"})

            if has_media(body):
                visual+=1
                if not media_ok(body):
                    issues.append({"id":qid,"arquivo":path.name,"erro":"media sem conteúdo utilizável"})
                for rel in local_media_paths(body):
                    candidates=[ROOT/"public"/rel, ROOT/rel]
                    if not any(p.exists() for p in candidates):
                        issues.append({"id":qid,"arquivo":path.name,"erro":f"mídia local não encontrada: {rel}"})

        # Lotes compactos q(...), com prefixo inferido do helper id:`PREFIX-${String(id)...}`
        prefix_match=PREFIX_RE.search(text)
        if prefix_match:
            prefix=prefix_match.group("prefix")
            strict=path.name.lower().startswith("uece") or prefix.upper().startswith("UECE-")
            for match in QCALL_RE.finditer(text):
                num=int(match.group("num")); qid=f"{prefix}{num:03d}"
                total+=1; helper_total+=1; add_id(ids,qid,path.name)
                statement=match.group("statement").strip(); explanation=match.group("explanation").strip()
                nopt=count_strings(match.group("options")); ans=int(match.group("answer"))
                if not statement:
                    issues.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: statement"})
                if not explanation:
                    target=issues if strict else warnings
                    target.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: explanation"})
                check_options(issues,qid,path.name,nopt,strict)
                if ans<0 or ans>=nopt:
                    issues.append({"id":qid,"arquivo":path.name,"erro":f"gabarito inválido: {ans}"})

    duplicates={k:v for k,v in ids.items() if len(v)>1}
    for qid,where in duplicates.items():
        issues.append({"id":qid,"arquivo":", ".join(where),"erro":"id duplicado"})

    report={
        "arquivos_analisados":len(files),
        "questoes_detectadas":total,
        "objetos_literais":literal_total,
        "questoes_helper_q":helper_total,
        "questoes_com_media":visual,
        "ids_duplicados":len(duplicates),
        "pendencias_bloqueantes":len(issues),
        "avisos_legado":len(warnings),
        "status":"OK" if not issues else "REVISAR",
        "erros":issues[:500],
        "avisos":warnings[:500],
    }
    (ROOT/"question-integration-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if not issues else 1)

if __name__=="__main__":
    main()
