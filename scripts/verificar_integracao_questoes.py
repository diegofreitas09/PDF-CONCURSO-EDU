#!/usr/bin/env python3
"""Verificador da integração de questões do PDF CONCURSO EDU.

Audita objetos literais e lotes compactos q(...), diferenciando erros bloqueantes
de avisos de legado. Itens UECE exigem maior rigor, mas referências históricas em
expressões (ex.: origin:src) são aceitas quando o campo está presente.
"""
from __future__ import annotations
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "data" / "questionSources"

QCALL_RE = re.compile(
    r'q\(\s*(?P<num>\d+)\s*,\s*"(?P<source>(?:[^"\\]|\\.)*)"\s*,\s*"(?P<statement>(?:[^"\\]|\\.)*)"\s*,\s*\[(?P<options>(?:\s*"(?:[^"\\]|\\.)*"\s*,?)*)\]\s*,\s*(?P<answer>\d+)\s*,\s*"(?P<explanation>(?:[^"\\]|\\.)*)"(?:\s*,\s*(?P<media>\{.*?\}))?\s*\)',
    re.S,
)
PREFIX_RE = re.compile(r'id:`(?P<prefix>[^$`]+)\$\{String\(id\)\.padStart\(3,"0"\)\}`')
QUOTED_RE = re.compile(r'(["\'`])(?:\\.|(?!\1).)*\1', re.S)


def field_value(name: str, body: str):
    """Lê string JS em aspas duplas, simples ou template literal."""
    m = re.search(rf'\b{name}:\s*(["\'`])((?:\\.|(?!\1).)*)\1', body, re.S)
    return m.group(2) if m else None


def iter_literal_objects(text: str):
    """Extrai objetos que começam com id:"..." respeitando chaves aninhadas."""
    start_re = re.compile(r'\{\s*id:\s*"(?P<id>[^"]+)"')
    for m in start_re.finditer(text):
        start = m.start()
        depth = 0
        quote = None
        escape = False
        end = None
        for i in range(start, len(text)):
            ch = text[i]
            if quote:
                if escape:
                    escape = False
                elif ch == "\\":
                    escape = True
                elif ch == quote:
                    quote = None
                continue
            if ch in ('"', "'", '`'):
                quote = ch
                continue
            if ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break
        if end:
            yield m.group('id'), text[start:end]


def count_strings(text: str):
    return len(QUOTED_RE.findall(text))


def count_options(body: str):
    # Ancora no campo answer para permitir alternativas entre crases e conteúdo
    # com colchetes textuais sem relaxar a exigência de exatamente 4 opções UECE.
    m = re.search(r'\boptions:\s*\[(?P<opts>.*?)\]\s*,\s*answer\s*:', body, re.S)
    return count_strings(m.group('opts')) if m else None


def answer_index(body: str):
    m = re.search(r'\banswer:\s*(\d+)', body)
    return int(m.group(1)) if m else None


def has_field(body: str, name: str) -> bool:
    return bool(re.search(rf'\b{name}\s*:\s*[^,}}]+', body, re.S))


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

        for qid, body in iter_literal_objects(text):
            total+=1; literal_total+=1; add_id(ids,qid,path.name)
            strict=is_uece(path,qid)

            for name in ("discipline","topic","statement"):
                value=field_value(name,body)
                if value is None or not value.strip():
                    issues.append({"id":qid,"arquivo":path.name,"erro":f"campo ausente/vazio: {name}"})

            explanation=field_value("explanation",body)
            if explanation is None or not explanation.strip():
                target=issues if strict else warnings
                target.append({"id":qid,"arquivo":path.name,"erro":"campo ausente/vazio: explanation"})

            if strict:
                for name in ("source","origin"):
                    if not has_field(body,name):
                        warnings.append({"id":qid,"arquivo":path.name,"erro":f"referência ausente: {name}"})

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
                media=match.group("media") or ""
                if media:
                    visual+=1
                    if not re.search(r'\b(src|url|latex|value|rows|data|items|nodes)\s*:',media):
                        issues.append({"id":qid,"arquivo":path.name,"erro":"media sem conteúdo utilizável"})

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
        "avisos":len(warnings),
        "status":"OK" if not issues else "REVISAR",
        "erros":issues[:500],
        "avisos_detalhados":warnings[:500],
    }
    (ROOT/"question-integration-report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps(report,ensure_ascii=False,indent=2))
    raise SystemExit(0 if not issues else 1)

if __name__=="__main__":
    main()
