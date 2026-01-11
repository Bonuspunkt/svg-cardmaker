#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Collect & Print Sheets for SVG Cards (Magic-size) — Python-only (Workflow 3)
- Reads individual SVG card files
- Renders them as vectors with svglib + reportlab (no Inkscape)
- Packs them 3x3 per A4 page
- Optional crop marks
- Writes a multi-page PDF

Notes:
- The SVG support of svglib is not 100% (CSS, filters, masks can be problematic).
- This pipeline keeps vector graphics as vector in the output PDF.

Usage example:
python collect_and_print_v3.py --cards ./cards \
  --add "Sword_of_the_Autumn_Wolf=10" \
  --add "Potion_of_Brightmind=5" \
  --out sheets/cards_print.pdf --dpi 300 --crop
"""

import argparse
from pathlib import Path
from typing import List, Tuple

from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.graphics import renderPDF
from svglib.svglib import svg2rlg


# -----------------------------
# Helpers: units / page sizes
# -----------------------------

def px_to_pt(px: float, dpi: int) -> float:
    # px at dpi -> inches -> points
    return px * 72.0 / float(dpi)

def a4_size_pt(orientation: str) -> Tuple[float, float]:
    # A4 in points
    # A4: 210mm × 297mm
    w_pt = 595.2755906
    h_pt = 841.8897638
    if orientation == "a4portrait":
        return w_pt, h_pt
    return h_pt, w_pt  # landscape

def layout_positions_pt(
    sheet_w_pt: float,
    sheet_h_pt: float,
    card_w_pt: float,
    card_h_pt: float,
    cols: int,
    rows: int,
    gutter_pt: float,
) -> List[Tuple[float, float]]:
    """
    Returns bottom-left positions (x, y) for each card slot, row-major (top row first).
    We center the whole grid on the sheet.
    """
    positions = []

    total_w = cols * card_w_pt + (cols - 1) * gutter_pt
    total_h = rows * card_h_pt + (rows - 1) * gutter_pt

    x0 = (sheet_w_pt - total_w) / 2.0
    y0_top = (sheet_h_pt + total_h) / 2.0  # top edge of the grid in pt

    for r in range(rows):
        for c in range(cols):
            x = x0 + c * (card_w_pt + gutter_pt)
            # convert top-based row index to bottom-left y
            y_top = y0_top - r * (card_h_pt + gutter_pt)
            y = y_top - card_h_pt
            positions.append((x, y))

    return positions

def draw_crop_marks(
    c: canvas.Canvas,
    x: float,
    y: float,
    w: float,
    h: float,
    len_pt: float = 8.0,
    offset_pt: float = 2.0,
    line_width: float = 0.5,
):
    """
    Draw crop marks around a rectangle placed at (x,y) with size (w,h).
    (x,y) is bottom-left in PDF coordinates.
    """
    c.setLineWidth(line_width)

    # bottom-left corner
    c.line(x - offset_pt - len_pt, y - offset_pt, x - offset_pt, y - offset_pt)
    c.line(x - offset_pt, y - offset_pt - len_pt, x - offset_pt, y - offset_pt)

    # bottom-right
    c.line(x + w + offset_pt, y - offset_pt, x + w + offset_pt + len_pt, y - offset_pt)
    c.line(x + w + offset_pt, y - offset_pt - len_pt, x + w + offset_pt, y - offset_pt)

    # top-left
    c.line(x - offset_pt - len_pt, y + h + offset_pt, x - offset_pt, y + h + offset_pt)
    c.line(x - offset_pt, y + h + offset_pt, x - offset_pt, y + h + offset_pt + len_pt)

    # top-right
    c.line(x + w + offset_pt, y + h + offset_pt, x + w + offset_pt + len_pt, y + h + offset_pt)
    c.line(x + w + offset_pt, y + h + offset_pt, x + w + offset_pt, y + h + offset_pt + len_pt)


# -----------------------------
# Card collection
# -----------------------------

def collect_files(cards_dir: Path, requests: List[Tuple[str, int]]) -> List[Path]:
    index = {}
    for p in cards_dir.glob("*.svg"):
        index[p.stem.lower()] = p

    out: List[Path] = []
    for base, count in requests:
        key = base.lower()
        if key not in index:
            raise FileNotFoundError(f"Card SVG '{base}.svg' not found in {cards_dir}")
        out.extend([index[key]] * count)
    return out

def parse_adds(add_list: List[str]) -> List[Tuple[str, int]]:
    out = []
    for item in add_list:
        if "=" not in item:
            raise ValueError(f"--add expects 'Name=count', got: {item}")
        name, cnt = item.split("=", 1)
        cnt = int(cnt)
        if cnt <= 0:
            continue
        out.append((name.strip(), cnt))
    return out


# -----------------------------
# Rendering: SVG -> PDF sheets
# -----------------------------

def load_svg_drawing(svg_path: Path):
    drawing = svg2rlg(str(svg_path))
    if drawing is None:
        raise RuntimeError(f"Failed to parse SVG: {svg_path}")
    return drawing

def place_svg_scaled(
    c: canvas.Canvas,
    drawing,
    x: float,
    y: float,
    target_w_pt: float,
    target_h_pt: float,
):
    """
    Scales the svglib drawing to fit exactly into (target_w_pt, target_h_pt),
    then draws it at (x,y).
    """
    dw = float(getattr(drawing, "width", 0) or 0)
    dh = float(getattr(drawing, "height", 0) or 0)
    if dw <= 0 or dh <= 0:
        # fallback: some SVGs may not provide width/height; this is rare but possible
        # We still try to draw unscaled (could be wrong).
        renderPDF.draw(drawing, c, x, y)
        return

    sx = target_w_pt / dw
    sy = target_h_pt / dh

    # Use a copy-like approach by transforming the drawing itself.
    # svglib Drawings support scale/translate.
    drawing = drawing.copy()
    drawing.scale(sx, sy)

    # After scaling, draw at x,y
    renderPDF.draw(drawing, c, x, y)

def make_sheets(
    svg_paths: List[Path],
    out_pdf: Path,
    dpi: int = 300,
    orientation: str = "a4portrait",
    cols: int = 3,
    rows: int = 3,
    margin_px: int = 60,   # kept for CLI compatibility (px at sheet DPI)
    gutter_px: int = 18,   # kept for CLI compatibility (px at sheet DPI)
    card_w: int = 744,     # kept for CLI compatibility (px at sheet DPI)
    card_h: int = 1039,    # kept for CLI compatibility (px at sheet DPI)
    add_crop: bool = False,
):
    out_pdf.parent.mkdir(parents=True, exist_ok=True)

    # Convert “px at dpi” to points
    margin_pt = px_to_pt(margin_px, dpi)
    gutter_pt = px_to_pt(gutter_px, dpi)
    card_w_pt = px_to_pt(card_w, dpi)
    card_h_pt = px_to_pt(card_h, dpi)

    sheet_w_pt, sheet_h_pt = a4_size_pt(orientation)

    # positions are centered; margin_pt currently not used as hard constraint
    # (same as your original code: margin was not used in centering math either)
    positions = layout_positions_pt(sheet_w_pt, sheet_h_pt, card_w_pt, card_h_pt, cols, rows, gutter_pt)
    per_page = cols * rows

    c = canvas.Canvas(str(out_pdf), pagesize=(sheet_w_pt, sheet_h_pt))

    # Crop marks sizing: keep your “feel” similar to len_px=28 offset=8
    crop_len_pt = px_to_pt(28, dpi)
    crop_offset_pt = px_to_pt(8, dpi)

    for i in range(0, len(svg_paths), per_page):
        chunk = svg_paths[i:i + per_page]

        for svg, (x, y) in zip(chunk, positions):
            drawing = load_svg_drawing(svg)
            place_svg_scaled(c, drawing, x, y, card_w_pt, card_h_pt)

            if add_crop:
                draw_crop_marks(
                    c, x, y, card_w_pt, card_h_pt,
                    len_pt=crop_len_pt,
                    offset_pt=crop_offset_pt,
                    line_width=0.5
                )

        c.showPage()

    c.save()


# -----------------------------
# CLI
# -----------------------------

def main():
    ap = argparse.ArgumentParser(description="Collect & Print Sheets for SVG Cards (Magic-size) — Python-only (svglib+reportlab)")
    ap.add_argument("--cards", type=str, default="cards", help="Directory with SVG cards")
    ap.add_argument("--add", action="append", default=[], help="Add 'Name=count' (use base filename without .svg). Can repeat.")
    ap.add_argument("--out", type=str, default="cards_print.pdf", help="Output PDF path")
    ap.add_argument("--dpi", type=int, default=300, help="Interpretation DPI for px-based inputs (default 300)")
    ap.add_argument("--orientation", choices=["a4portrait", "a4landscape"], default="a4portrait", help="Sheet orientation")
    ap.add_argument("--cols", type=int, default=3, help="Columns per page")
    ap.add_argument("--rows", type=int, default=3, help="Rows per page")
    ap.add_argument("--margin", type=int, default=60, help="Outer margin in px (at sheet DPI) [currently informational]")
    ap.add_argument("--gutter", type=int, default=18, help="Gap between cards in px (at sheet DPI)")
    ap.add_argument("--card-w", type=int, default=744, help="Card width in px (at sheet DPI interpretation)")
    ap.add_argument("--card-h", type=int, default=1039, help="Card height in px (at sheet DPI interpretation)")
    ap.add_argument("--crop", action="store_true", help="Add crop marks around each card")

    args = ap.parse_args()

    cards_dir = Path(args.cards)
    requests = parse_adds(args.add)
    if not requests:
        ap.error("Please add at least one --add 'Name=count'")

    svg_list = collect_files(cards_dir, requests)

    make_sheets(
        svg_list,
        Path(args.out),
        dpi=args.dpi,
        orientation=args.orientation,
        cols=args.cols,
        rows=args.rows,
        margin_px=args.margin,
        gutter_px=args.gutter,
        card_w=args.card_w,
        card_h=args.card_h,
        add_crop=args.crop,
    )

    print(f"Created: {args.out}")


if __name__ == "__main__":
    main()
