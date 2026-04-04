import React from "react";
import { CropMarks } from "./CropMarks.js";

interface PrintPageProps {
  svgContents: string[];
  showCropMarks: boolean;
  pageBreak: boolean;
}

const CARD_WIDTH = "62mm";
const CARD_HEIGHT = "86mm";

export function PrintPage({
  svgContents,
  showCropMarks,
  pageBreak,
}: PrintPageProps) {
  return (
    <div
      style={{
        position: "relative",
        width: "210mm",
        height: "297mm",
        breakBefore: pageBreak ? "page" : undefined,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexWrap: "wrap",
          alignContent: "center",
          justifyContent: "center",
          gap: "5mm",
        }}
      >
        {svgContents.map((svgContent, j) => {
          const cleaned = svgContent
            .replace(/<\?xml[^?]*\?>\s*/, "")
            .replace(/width="[^"]*"/, `width="${CARD_WIDTH}"`)
            .replace(/height="[^"]*"/, `height="${CARD_HEIGHT}"`);

          const dataUri = `data:image/svg+xml;base64,${Buffer.from(cleaned).toString("base64")}`;

          return (
            <img
              key={j}
              src={dataUri}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
            />
          );
        })}
      </div>
      {showCropMarks && <CropMarks />}
    </div>
  );
}
