from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "src" / "data" / "questionSources"
PUBLIC = ROOT / "public"

REF_RE = re.compile(r'(?:src|url)\s*:\s*["\']([^"\']+)["\']')
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".svg"}
issues = []
checked = 0


def validate_image(path: Path):
    global checked
    checked += 1
    if not path.exists():
        issues.append(f"arquivo inexistente: {path.relative_to(ROOT)}")
        return
    data = path.read_bytes()
    if len(data) < 64:
        issues.append(f"arquivo pequeno/invalido: {path.relative_to(ROOT)} ({len(data)} bytes)")
        return
    ext = path.suffix.lower()
    if ext == ".png" and not data.startswith(b"\x89PNG\r\n\x1a\n"):
        issues.append(f"PNG invalido: {path.relative_to(ROOT)}")
    elif ext in {".jpg", ".jpeg"} and not data.startswith(b"\xff\xd8\xff"):
        issues.append(f"JPEG invalido: {path.relative_to(ROOT)}")
    elif ext == ".webp" and not (data.startswith(b"RIFF") and data[8:12] == b"WEBP"):
        issues.append(f"WEBP invalido: {path.relative_to(ROOT)}")
    elif ext == ".svg" and b"<svg" not in data[:4096].lower():
        issues.append(f"SVG invalido: {path.relative_to(ROOT)}")


for js in SOURCES.glob("*.js"):
    text = js.read_text(encoding="utf-8", errors="replace")
    for ref in REF_RE.findall(text):
        if ref.startswith(("http://", "https://", "data:")):
            continue
        clean = ref.split("?", 1)[0].lstrip("/")
        if Path(clean).suffix.lower() not in IMAGE_EXTS:
            continue
        candidate = PUBLIC / clean
        validate_image(candidate)

if issues:
    print("Falhas de midia encontradas:")
    for item in sorted(set(issues)):
        print(f"- {item}")
    sys.exit(1)

print(f"Midias das questoes verificadas com sucesso: {checked} referencia(s) local(is).")
