from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    from pypdf import PdfReader
except ImportError:
    print("Instale a dependência com: python -m pip install pypdf")
    raise


def clean_text(text: str) -> str:
    text = text.replace("\x00", " ").replace("\x02", "")
    text = text.replace("\u00ad", "")
    text = text.replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf_text(path: Path) -> str:
    reader = PdfReader(str(path))
    pages = []
    for i, page in enumerate(reader.pages, 1):
        try:
            pages.append(page.extract_text() or "")
        except Exception as exc:
            print(f"[aviso] falha ao ler página {i} de {path.name}: {exc}")
            pages.append("")
    return clean_text("\n".join(pages))


def parse_answer_key(text: str) -> dict[int, str]:
    match = re.search(r"\bGABARITO\b(.*)$", text, flags=re.I | re.S)
    if not match:
        return {}

    raw = match.group(1)
    lines = [re.sub(r"\s+", " ", ln).strip() for ln in raw.splitlines() if ln.strip()]
    answers: dict[int, str] = {}

    # formato direto: 1 A / 001 A
    for qn, letter in re.findall(r"(?<!\d)(\d{1,4})\s*[-.:)]?\s*([A-E])\b", raw, flags=re.I):
        answers[int(qn)] = letter.upper()

    # formato em tabela: linha de números e linha seguinte com letras
    for i in range(len(lines) - 1):
        nums = [int(x) for x in re.findall(r"\b\d{1,4}\b", lines[i])]
        letters = re.findall(r"\b[A-E]\b", lines[i + 1], flags=re.I)
        if nums and letters and len(nums) == len(letters):
            for n, ltr in zip(nums, letters):
                answers[n] = ltr.upper()

    return answers


def split_question_blocks(text: str) -> list[tuple[int, str]]:
    # remove a parte do gabarito antes de segmentar as questões
    body = re.split(r"\bGABARITO\b", text, maxsplit=1, flags=re.I)[0]

    marker = re.compile(r"(?m)^\s*(\d{3,4})\s+(?=\S)")
    matches = list(marker.finditer(body))
    blocks: list[tuple[int, str]] = []

    for idx, m in enumerate(matches):
        n = int(m.group(1))
        start = m.end()
        end = matches[idx + 1].start() if idx + 1 < len(matches) else len(body)
        block = clean_text(body[start:end])
        # evita números de página: uma questão válida precisa ter alternativas
        if re.search(r"(?m)^\s*A\)", block) and re.search(r"(?m)^\s*B\)", block) and re.search(r"(?m)^\s*C\)", block):
            blocks.append((n, block))

    return blocks


def parse_question(number: int, block: str, answers: dict[int, str], source: str) -> dict | None:
    first_option = re.search(r"(?m)^\s*A\)\s*", block)
    if not first_option:
        return None

    statement = clean_text(block[: first_option.start()])
    options_text = block[first_option.start() :]

    opt_matches = list(re.finditer(r"(?m)^\s*([A-E])\)\s*", options_text))
    options: list[str] = []
    letters: list[str] = []

    for i, m in enumerate(opt_matches):
        end = opt_matches[i + 1].start() if i + 1 < len(opt_matches) else len(options_text)
        option = clean_text(options_text[m.end() : end])
        letters.append(m.group(1).upper())
        options.append(option)

    if len(options) < 3 or not statement:
        return None

    correct_letter = answers.get(number)
    answer_index = letters.index(correct_letter) if correct_letter in letters else None

    upper = source.upper()
    if "TEND" in upper:
        discipline = "Conhecimentos Pedagógicos"
        topic = "Tendências Pedagógicas"
    elif "300" in upper:
        discipline = "Conhecimentos Pedagógicos"
        topic = "Banco SEDUC — 300 questões"
    elif "1300" in upper:
        discipline = "Banco Geral SEDUC"
        topic = "Banco SEDUC — 1300 questões"
    else:
        discipline = "Banco Geral SEDUC"
        topic = Path(source).stem

    return {
        "source": source,
        "sourceQuestion": number,
        "discipline": discipline,
        "topic": topic,
        "statement": statement,
        "options": options,
        "answer": answer_index,
        "explanation": "Questão importada do banco PDF. O comentário detalhado poderá ser acrescentado posteriormente.",
    }


def dedupe(questions: list[dict]) -> list[dict]:
    seen = set()
    out = []
    for q in questions:
        key = re.sub(r"\W+", "", q["statement"].lower())[:240]
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(q)
    return out


def write_js(questions: list[dict], output: Path) -> None:
    for idx, q in enumerate(questions, 1):
        q["id"] = idx

    payload = json.dumps(questions, ensure_ascii=False, indent=2)
    content = "export const QUESTION_BANK = " + payload + ";\n"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(content, encoding="utf-8")


def main() -> int:
    script = Path(__file__).resolve()
    project_root = script.parents[1]
    concurso_root = script.parents[3]
    default_source = concurso_root / "QUESTOES"
    source_dir = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else default_source
    output = project_root / "src" / "data" / "questionBank.js"

    if not source_dir.exists():
        print(f"Pasta não encontrada: {source_dir}")
        return 1

    pdfs = sorted(source_dir.glob("*.pdf"))
    if not pdfs:
        print(f"Nenhum PDF encontrado em: {source_dir}")
        return 1

    all_questions: list[dict] = []
    print(f"Lendo {len(pdfs)} PDF(s) de {source_dir}")

    for pdf in pdfs:
        print(f"\n== {pdf.name} ==")
        text = extract_pdf_text(pdf)
        if len(text) < 500:
            print("[aviso] pouco ou nenhum texto extraído. Este PDF pode ser digitalizado como imagem e precisar de OCR.")
            continue

        answers = parse_answer_key(text)
        blocks = split_question_blocks(text)
        parsed = []
        for number, block in blocks:
            q = parse_question(number, block, answers, pdf.name)
            if q:
                parsed.append(q)

        with_key = sum(1 for q in parsed if q["answer"] is not None)
        print(f"Questões identificadas: {len(parsed)} | com gabarito: {with_key}")
        all_questions.extend(parsed)

    all_questions = dedupe(all_questions)
    write_js(all_questions, output)
    print(f"\nTOTAL IMPORTADO: {len(all_questions)} questões")
    print(f"Arquivo gerado: {output}")
    print("\nSe algum PDF aparecer como imagem/sem texto, ele precisará passar por OCR antes da importação.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
