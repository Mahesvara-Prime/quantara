"""Parse multi-lesson Markdown files (title from H1, body from subsequent text)."""

from __future__ import annotations

import re
from pathlib import Path

LESSON_SPLIT = re.compile(r"^\s*---\s*$", re.MULTILINE)
H1_SPLIT = re.compile(r"^#\s+(.+)$", re.MULTILINE)
HR_LINE = re.compile(r"^\s*---\s*$", re.MULTILINE)
IMPORTED_TITLE_RE = re.compile(
    r"^(?:Leçon\s+\d+\s+—\s+)?(\[[^\]]+\]\s+.+\s+—\s+partie\s+(\d{3}))$"
)


def _clean_body(text: str) -> str:
    """Remove horizontal-rule separators and trim."""
    lines = [line for line in text.splitlines() if not HR_LINE.match(line)]
    return "\n".join(lines).strip()


def _normalize_title(title: str) -> str:
    """Normalize imported lesson heading labels."""
    match = IMPORTED_TITLE_RE.match(title.strip())
    if not match:
        return title.strip()
    raw_tail = match.group(1)
    lesson_n = int(match.group(2))
    return f"Leçon {lesson_n} — {raw_tail}"


def parse_lesson_markdown(text: str) -> list[tuple[str, str]]:
    text = text.strip()
    if not text:
        raise ValueError("Invalid lesson markdown: empty content.")

    h1_matches = list(H1_SPLIT.finditer(text))
    if h1_matches:
        out: list[tuple[str, str]] = []
        for idx, match in enumerate(h1_matches):
            title = _normalize_title(match.group(1))
            start = match.end()
            end = h1_matches[idx + 1].start() if idx + 1 < len(h1_matches) else len(text)
            body = _clean_body(text[start:end])
            if not title or not body:
                raise ValueError(f"Invalid lesson chunk (missing title or body): {title!r}")
            out.append((title, body))
        return out

    # Legacy fallback for old corpus files still separated by '---'.
    chunks = [c.strip() for c in LESSON_SPLIT.split(text) if c.strip()]
    out: list[tuple[str, str]] = []
    for chunk in chunks:
        lines = chunk.split("\n", 1)
        title_line = lines[0].strip()
        if title_line.startswith("#"):
            title = _normalize_title(title_line.lstrip("#"))
        else:
            title = _normalize_title(title_line)
        body = _clean_body(lines[1] if len(lines) > 1 else "")
        if not title or not body:
            raise ValueError(f"Invalid lesson chunk (missing title or body): {chunk[:80]!r}…")
        out.append((title, body))
    return out


def word_count_french(text: str) -> int:
    """Approximate word tokens (Latin letters, digits, accented letters, hyphenated)."""
    return len(
        re.findall(
            r"\b[\wÀ-ÿ]+(?:-[\wÀ-ÿ]+)*\b",
            text,
            flags=re.UNICODE,
        )
    )


def load_course_file(rel_name: str) -> list[tuple[str, str]]:
    path = Path(__file__).resolve().parent / "markdown" / rel_name
    return parse_lesson_markdown(path.read_text(encoding="utf-8"))
