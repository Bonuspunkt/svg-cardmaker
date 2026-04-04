import React from "react";
import { CropMarks } from "./CropMarks.js";

interface Position {
  x: number;
  y: number;
}

interface PrintPageProps {
  sheetWidthPt: number;
  sheetHeightPt: number;
  cardWidthPt: number;
  cardHeightPt: number;
  positions: Position[];
  svgContents: string[];
  showCropMarks: boolean;
  cropLengthPt: number;
  cropOffsetPt: number;
}

export function PrintPage({
  sheetWidthPt,
  sheetHeightPt,
  cardWidthPt,
  cardHeightPt,
  positions,
  svgContents,
  showCropMarks,
  cropLengthPt,
  cropOffsetPt,
}: PrintPageProps) {
  return (
    <div
      className="page"
      style={{
        position: "relative",
        width: `${sheetWidthPt}pt`,
        height: `${sheetHeightPt}pt`,
        breakAfter: "page",
      }}
    >
      {svgContents.map((svgContent, j) => {
        const { x, y } = positions[j];
        const cleaned = svgContent
          .replace(/<\?xml[^?]*\?>\s*/, "")
          .replace(/width="[^"]*"/, `width="${cardWidthPt}pt"`)
          .replace(/height="[^"]*"/, `height="${cardHeightPt}pt"`);

        return (
          <React.Fragment key={j}>
            <div
              style={{
                position: "absolute",
                left: `${x}pt`,
                top: `${y}pt`,
                width: `${cardWidthPt}pt`,
                height: `${cardHeightPt}pt`,
                overflow: "hidden",
              }}
              dangerouslySetInnerHTML={{ __html: cleaned }}
            />
            {showCropMarks && (
              <CropMarks
                x={x}
                y={y}
                width={cardWidthPt}
                height={cardHeightPt}
                lengthPt={cropLengthPt}
                offsetPt={cropOffsetPt}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
