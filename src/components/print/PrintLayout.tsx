import React from "react";
import { PrintPage } from "./PrintPage.js";

interface Position {
  x: number;
  y: number;
}

export interface CardGroup {
  category: string;
  svgContents: string[];
}

export interface PrintLayoutProps {
  groups: CardGroup[];
  sheetWidthPt: number;
  sheetHeightPt: number;
  cardWidthPt: number;
  cardHeightPt: number;
  cols: number;
  rows: number;
  gutterPt: number;
  showCropMarks: boolean;
  dpi: number;
}

function pxToPt(px: number, dpi: number): number {
  return (px * 72.0) / dpi;
}

function computePositions(
  sheetW: number,
  sheetH: number,
  cardW: number,
  cardH: number,
  cols: number,
  rows: number,
  gutterPt: number,
): Position[] {
  const positions: Position[] = [];
  const totalW = cols * cardW + (cols - 1) * gutterPt;
  const totalH = rows * cardH + (rows - 1) * gutterPt;
  const x0 = (sheetW - totalW) / 2;
  const y0 = (sheetH - totalH) / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      positions.push({
        x: x0 + c * (cardW + gutterPt),
        y: y0 + r * (cardH + gutterPt),
      });
    }
  }

  return positions;
}

function paginateGroup(svgContents: string[], perPage: number): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < svgContents.length; i += perPage) {
    pages.push(svgContents.slice(i, i + perPage));
  }
  return pages;
}

export function PrintLayout({
  groups,
  sheetWidthPt,
  sheetHeightPt,
  cardWidthPt,
  cardHeightPt,
  cols,
  rows,
  gutterPt,
  showCropMarks,
  dpi,
}: PrintLayoutProps) {
  const positions = computePositions(
    sheetWidthPt,
    sheetHeightPt,
    cardWidthPt,
    cardHeightPt,
    cols,
    rows,
    gutterPt,
  );

  const perPage = cols * rows;
  const cropLengthPt = pxToPt(28, dpi);
  const cropOffsetPt = pxToPt(8, dpi);

  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @page { size: ${sheetWidthPt}pt ${sheetHeightPt}pt; margin: 0; }
              body, .page { margin: 0; padding: 0; }
              .category-break { break-before: page; page-break-before: always; }
            `,
          }}
        />
      </head>
      <body>
        {groups.map((group, gi) => {
          const pages = paginateGroup(group.svgContents, perPage);
          return (
            <div
              key={group.category}
              className={gi > 0 ? "category-break" : undefined}
            >
              {pages.map((pageSvgs, pi) => (
                <PrintPage
                  key={pi}
                  sheetWidthPt={sheetWidthPt}
                  sheetHeightPt={sheetHeightPt}
                  cardWidthPt={cardWidthPt}
                  cardHeightPt={cardHeightPt}
                  positions={positions}
                  svgContents={pageSvgs}
                  showCropMarks={showCropMarks}
                  cropLengthPt={cropLengthPt}
                  cropOffsetPt={cropOffsetPt}
                />
              ))}
            </div>
          );
        })}
      </body>
    </html>
  );
}
