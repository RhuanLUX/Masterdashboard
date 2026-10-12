"""Build the immutable V2 browser payload from the supplied DOCX sources.

This utility never writes inside RPG_Master_V2_Content_Handoff/originais.
It retains paragraph order, heading styles, rich runs, and tables so the UI
can render a safe, offline presentation of the source documents.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Iterator

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph
from docx.oxml.table import CT_Tbl
from docx.oxml.text.paragraph import CT_P
from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "RPG_Master_V2_Content_Handoff" / "originais"
OUTPUT = ROOT / "data" / "v2-content.js"


def iter_blocks(parent) -> Iterator[Paragraph | Table]:
    """Yield direct paragraphs and tables in their XML order."""
    parent_elm = parent.element.body if hasattr(parent, "element") and hasattr(parent.element, "body") else parent._element
    for child in parent_elm.iterchildren():
        if isinstance(child, CT_P):
            yield Paragraph(child, parent)
        elif isinstance(child, CT_Tbl):
            yield Table(child, parent)


def paragraph_block(paragraph: Paragraph) -> dict:
    runs = [
        {"text": run.text, "bold": bool(run.bold), "italic": bool(run.italic)}
        for run in paragraph.runs
        if run.text
    ]
    return {
        "type": "paragraph",
        "text": paragraph.text,
        "style": paragraph.style.name if paragraph.style else "Normal",
        "runs": runs,
    }


def document_payload(path: Path) -> dict:
    doc = Document(path)
    blocks = []
    headings = []
    for item in iter_blocks(doc):
        if isinstance(item, Paragraph):
            if not item.text and not item.runs:
                continue
            block = paragraph_block(item)
            blocks.append(block)
            style = block["style"]
            if style.lower().startswith("heading"):
                digits = "".join(c for c in style if c.isdigit())
                headings.append({
                    "label": block["text"],
                    "level": int(digits or 1),
                    "blockIndex": len(blocks) - 1,
                })
        else:
            rows = [[cell.text for cell in row.cells] for row in item.rows]
            blocks.append({"type": "table", "rows": rows, "style": "Table"})
    return {"source": path.name, "blocks": blocks, "headings": headings}


def main() -> None:
    groups = {
        "adventures": SOURCE / "aventuras",
        "rules": SOURCE / "regras",
        "documents": SOURCE / "cartas",
    }
    payload = {group: {} for group in groups}
    for group, directory in groups.items():
        for path in sorted(directory.glob("*.docx")):
            payload[group][path.name] = document_payload(path)

    item_dir = SOURCE / "itens"
    payload["documents"].update({path.name: document_payload(path) for path in sorted(item_dir.glob("*.docx"))})
    cities = PdfReader(SOURCE / "atlas" / "Cidades LOTR.pdf")
    city_blocks = []
    for number, page in enumerate(cities.pages, 1):
        city_blocks.append({"type": "paragraph", "text": f"Cidades LOTR — página {number}", "style": "Heading 1", "runs": [{"text": f"Cidades LOTR — página {number}", "bold": True, "italic": False}]})
        for line in (page.extract_text() or "").splitlines():
            line = line.strip()
            if line:
                city_blocks.append({"type": "paragraph", "text": line, "style": "Normal", "runs": [{"text": line, "bold": False, "italic": False}]})
    payload["atlasCities"] = {"source": "Cidades LOTR.pdf", "blocks": city_blocks, "headings": [{"label": b["text"], "level": 1, "blockIndex": i} for i, b in enumerate(city_blocks) if b["style"] == "Heading 1"]}
    OUTPUT.write_text("/* Gerado localmente a partir dos originais V2; não editar manualmente. */\nwindow.RPG_MASTER_V2_CONTENT = " + json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"Wrote {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
    for group, docs in payload.items():
        if group == "atlasCities":
            print(f"atlas: {docs['source']} — {len(docs['blocks'])} blocos, {len(docs['headings'])} páginas")
            continue
        for name, data in docs.items():
            print(f"{group}: {name} — {len(data['blocks'])} blocos, {len(data['headings'])} títulos")


if __name__ == "__main__":
    main()
