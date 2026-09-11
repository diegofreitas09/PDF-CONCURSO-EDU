#!/usr/bin/env python3
from pathlib import Path
import gzip, json

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "src/data/generated/uece-quimica-texto-integro.json.gz"
TARGET = ROOT / "src/data/questionSources/ueceQuimicaAutoLote175.js"

with gzip.open(SOURCE, "rt", encoding="utf-8") as fh:
    questions = json.load(fh)

required = {"id", "discipline", "topic", "statement", "options", "answer", "explanation", "source", "origin"}
seen = set()
for i, q in enumerate(questions, 1):
    missing = required - set(q)
    if missing:
        raise SystemExit(f"Questão {i} sem campos: {sorted(missing)}")
    if q["id"] in seen:
        raise SystemExit(f"ID duplicado no lote: {q['id']}")
    seen.add(q["id"])
    if not isinstance(q["options"], list) or len(q["options"]) != 4:
        raise SystemExit(f"{q['id']}: alternativas inválidas")
    if not isinstance(q["answer"], int) or not 0 <= q["answer"] < 4:
        raise SystemExit(f"{q['id']}: gabarito inválido")
    if not q["statement"].strip() or any(not str(o).strip() for o in q["options"]):
        raise SystemExit(f"{q['id']}: texto vazio")

payload = json.dumps(questions, ensure_ascii=False, separators=(",", ":"))
TARGET.write_text(
    "// GERADO AUTOMATICAMENTE de fonte auditada. Não editar manualmente.\n"
    f"export const UECE_QUIMICA_AUTO_LOTE_175 = {payload};\n",
    encoding="utf-8",
)
print(f"UECE Química: {len(questions)} questões geradas em {TARGET.relative_to(ROOT)}")
