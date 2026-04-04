import React from "react";

interface CropMarksProps {
  x: number;
  y: number;
  width: number;
  height: number;
  lengthPt: number;
  offsetPt: number;
}

const markStyle: React.CSSProperties = {
  position: "absolute",
  background: "#000",
};

function Mark({ style }: { style: React.CSSProperties }) {
  return <div style={{ ...markStyle, ...style }} />;
}

export function CropMarks({
  x,
  y,
  width: w,
  height: h,
  lengthPt,
  offsetPt,
}: CropMarksProps) {
  return (
    <>
      {/* Top-left corner */}
      <Mark
        style={{
          left: `${x - offsetPt - lengthPt}pt`,
          top: `${y - offsetPt}pt`,
          width: `${lengthPt}pt`,
          height: "0.5pt",
        }}
      />
      <Mark
        style={{
          left: `${x - offsetPt}pt`,
          top: `${y - offsetPt - lengthPt}pt`,
          width: "0.5pt",
          height: `${lengthPt}pt`,
        }}
      />

      {/* Top-right corner */}
      <Mark
        style={{
          left: `${x + w + offsetPt}pt`,
          top: `${y - offsetPt}pt`,
          width: `${lengthPt}pt`,
          height: "0.5pt",
        }}
      />
      <Mark
        style={{
          left: `${x + w + offsetPt}pt`,
          top: `${y - offsetPt - lengthPt}pt`,
          width: "0.5pt",
          height: `${lengthPt}pt`,
        }}
      />

      {/* Bottom-left corner */}
      <Mark
        style={{
          left: `${x - offsetPt - lengthPt}pt`,
          top: `${y + h + offsetPt}pt`,
          width: `${lengthPt}pt`,
          height: "0.5pt",
        }}
      />
      <Mark
        style={{
          left: `${x - offsetPt}pt`,
          top: `${y + h + offsetPt}pt`,
          width: "0.5pt",
          height: `${lengthPt}pt`,
        }}
      />

      {/* Bottom-right corner */}
      <Mark
        style={{
          left: `${x + w + offsetPt}pt`,
          top: `${y + h + offsetPt}pt`,
          width: `${lengthPt}pt`,
          height: "0.5pt",
        }}
      />
      <Mark
        style={{
          left: `${x + w + offsetPt}pt`,
          top: `${y + h + offsetPt}pt`,
          width: "0.5pt",
          height: `${lengthPt}pt`,
        }}
      />
    </>
  );
}
