import React from "react";

/**
 * Places an × at each of the 4 gap-intersection points around a card.
 * When adjacent cards overlap their marks, a single × appears at each
 * intersection — the cut target.
 */

const GAP_CENTER = "0.25cm"; // half of 0.5cm flex gap

function XMark({ x, y }: { x: string; y: string }) {
  return (
    <div className="crop-x" style={{ left: x, top: y }}>
      <div className="crop-mark crop-line crop-line-v" />
      <div className="crop-mark crop-line crop-line-h" />
    </div>
  );
}

export function CropMarks() {
  return (
    <>
      <XMark x={`-${GAP_CENTER}`} y={`-${GAP_CENTER}`} />
      <XMark x={`calc(100% + ${GAP_CENTER})`} y={`-${GAP_CENTER}`} />
      <XMark x={`-${GAP_CENTER}`} y={`calc(100% + ${GAP_CENTER})`} />
      <XMark x={`calc(100% + ${GAP_CENTER})`} y={`calc(100% + ${GAP_CENTER})`} />
    </>
  );
}
