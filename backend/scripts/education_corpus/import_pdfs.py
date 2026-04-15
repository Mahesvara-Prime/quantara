"""
Extraire le texte des PDF et produire des cours Markdown (leçons >= MIN_CHUNK_WORDS mots).

Sources scannées (racine du dépôt Quantara) :
  - backend/scripts/education_corpus/source_pdfs/
  - Trading/
  - Cryptomonnaies/
  - Blockchain/
  - Investissement/

Usage (depuis le dossier backend) :

    pip install -r requirements.txt
    python -m scripts.education_corpus.import_pdfs
    python -m scripts.seed_education
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[2]
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

from pypdf import PdfReader

from scripts.education_corpus.parse import word_count_french

HERE = Path(__file__).resolve().parent
REPO_ROOT = Path(__file__).resolve().parents[3]
SOURCE = HERE / "source_pdfs"
MD = HERE / "markdown"
MANIFEST = MD / "imported_manifest.json"

MIN_CHUNK_WORDS = 10_000


def _pedagogical_description(folder: str) -> str:
    folder_l = folder.strip().lower()
    if folder_l == "trading":
        return (
            "Parcours pratique pour apprendre à lire le marché, construire un plan de trading, "
            "gérer le risque et améliorer la discipline d’exécution."
        )
    if folder_l == "cryptomonnaies":
        return (
            "Cours pour comprendre l’écosystème crypto : fonctionnement des actifs, usages concrets, "
            "risques majeurs et bonnes pratiques de décision."
        )
    if folder_l == "blockchain":
        return (
            "Introduction structurée à la blockchain : principes techniques, cas d’usage, limites "
            "et impacts pour les marchés et les entreprises."
        )
    if folder_l == "investissement":
        return (
            "Parcours pour acquérir des bases solides en investissement : analyse, allocation, "
            "gestion du risque et construction d’une stratégie durable."
        )
    return (
        "Cours pédagogique pour développer des bases solides, comprendre les concepts clés, "
        "et les appliquer pas à pas dans un cadre pratique."
    )


def _slug(name: str) -> str:
    s = re.sub(r"[^\w\s-]", "", name, flags=re.UNICODE)
    s = re.sub(r"[-\s]+", "_", s.strip().lower())
    return s[:100] or "document"


def _collect_pdfs() -> list[Path]:
    dirs = [
        SOURCE,
        REPO_ROOT / "Trading",
        REPO_ROOT / "Cryptomonnaies",
        REPO_ROOT / "Blockchain",
        REPO_ROOT / "Investissement",
    ]
    seen: set[Path] = set()
    out: list[Path] = []
    for d in dirs:
        if not d.is_dir():
            continue
        for pdf in sorted(d.glob("*.pdf")):
            rp = pdf.resolve()
            if rp in seen:
                continue
            seen.add(rp)
            out.append(pdf)
    return sorted(out, key=lambda p: (p.parent.name.lower(), p.name.lower()))


def _extract_pdf_text(path: Path) -> str:
    try:
        reader = PdfReader(str(path))
    except Exception as exc:  # noqa: BLE001
        print(f"Erreur ouverture {path.name}: {exc}")
        return ""
    parts: list[str] = []
    for page in reader.pages:
        try:
            t = page.extract_text() or ""
        except Exception:  # noqa: BLE001
            t = ""
        parts.append(t)
    raw = "\n\n".join(parts)
    raw = re.sub(r"[ \t]+\n", "\n", raw)
    raw = re.sub(r"\n{3,}", "\n\n", raw)
    return raw.strip()


def _chunk_by_words(text: str, min_words: int) -> list[str]:
    tokens = re.findall(r"\b[\wÀ-ÿ]+(?:-[\wÀ-ÿ]+)*\b", text, flags=re.UNICODE)
    if not tokens:
        return []
    chunks: list[str] = []
    buf: list[str] = []
    for w in tokens:
        buf.append(w)
        if len(buf) >= min_words:
            chunks.append(" ".join(buf))
            buf = []
    if buf:
        tail = " ".join(buf)
        if chunks and word_count_french(tail) < min_words:
            chunks[-1] = chunks[-1] + " " + tail
        else:
            chunks.append(tail)
    while len(chunks) >= 2 and word_count_french(chunks[-1]) < min_words:
        chunks[-2] = chunks[-2] + " " + chunks[-1]
        chunks.pop()
    return chunks


def _paragraphize(chunk: str) -> str:
    words = chunk.split()
    paras: list[str] = []
    cur: list[str] = []
    for w in words:
        cur.append(w)
        if len(cur) >= 180:
            paras.append(" ".join(cur))
            cur = []
    if cur:
        paras.append(" ".join(cur))
    return "\n\n".join(paras)


def main() -> None:
    SOURCE.mkdir(parents=True, exist_ok=True)
    MD.mkdir(parents=True, exist_ok=True)
    pdfs = _collect_pdfs()
    if not pdfs:
        print(
            "Aucun PDF trouvé. Vérifie : source_pdfs/, Trading/, Cryptomonnaies/, "
            "Blockchain/, Investissement/ à la racine du dépôt."
        )
        return

    manifest_courses: list[dict[str, str | bool]] = []
    for pdf in pdfs:
        stem = pdf.stem
        folder = pdf.parent.name
        slug = _slug(f"{folder}_{stem}")
        try:
            text = _extract_pdf_text(pdf)
        except Exception as exc:  # noqa: BLE001
            print(f"Skip (erreur) {pdf}: {exc}")
            continue
        if not text:
            print(f"Skip (pas de texte extractible — PDF scanné ou protégé ?) : {pdf}")
            continue
        chunks = _chunk_by_words(text, MIN_CHUNK_WORDS)
        if not chunks:
            continue
        lessons_md: list[str] = []
        needs_padding = False
        for idx, ch in enumerate(chunks):
            title = f"Leçon {idx + 1} — [{folder}] {stem} — partie {idx + 1:03d}"
            body = _paragraphize(ch)
            wc = word_count_french(body)
            if wc < MIN_CHUNK_WORDS:
                print(f"Attention {pdf.name} partie {idx + 1}: {wc} mots (< {MIN_CHUNK_WORDS}).")
                needs_padding = True
            lessons_md.append(f"# {title}\n\n{body}\n")
        out_name = f"imported__{slug}.md"
        (MD / out_name).write_text("\n\n".join(lessons_md), encoding="utf-8")
        desc = _pedagogical_description(folder)
        manifest_courses.append(
            {
                "title": f"{folder} — {stem}",
                "description": desc,
                "level": "intermediate",
                "markdown_file": out_name,
                "allow_padding": needs_padding,
            }
        )
        print(f"OK {folder}/{pdf.name} -> {out_name} ({len(chunks)} leçon(s))")

    MANIFEST.write_text(
        json.dumps({"courses": manifest_courses}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Manifeste : {len(manifest_courses)} cours importés -> {MANIFEST}")


if __name__ == "__main__":
    main()
