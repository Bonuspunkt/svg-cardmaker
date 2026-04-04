import React from "react";

const CARD_W = 62; // mm
const CARD_H = 86;
const GAP = 5;
const COLS = 3;
const ROWS = 3;
const PAGE_W = 210;
const PAGE_H = 297;

const GRID_W = COLS * CARD_W + (COLS - 1) * GAP; // 196
const GRID_H = ROWS * CARD_H + (ROWS - 1) * GAP; // 268
const MARGIN_X = (PAGE_W - GRID_W) / 2; // 7
const MARGIN_Y = (PAGE_H - GRID_H) / 2; // 14.5

const MARK_ARM = 5; // mm
const THICKNESS = "0.2mm";

function mm(v: number) {
  return `${v}mm`;
}

const markBase: React.CSSProperties = {
  position: "absolute",
  background: "#000",
};

function HLine({ x, y, width }: { x: number; y: number; width: number }) {
  return (
    <div
      className="crop-mark"
      style={{
        ...markBase,
        left: mm(x),
        top: mm(y),
        width: mm(width),
        height: THICKNESS,
      }}
    />
  );
}

function VLine({ x, y, height }: { x: number; y: number; height: number }) {
  return (
    <div
      className="crop-mark"
      style={{
        ...markBase,
        left: mm(x),
        top: mm(y),
        width: THICKNESS,
        height: mm(height),
      }}
    />
  );
}

/** Gap-crossing center x for the gap after column c */
function gapCenterX(c: number) {
  return MARGIN_X + (c + 1) * CARD_W + c * GAP + GAP / 2;
}

/** Gap-crossing center y for the gap after row r */
function gapCenterY(r: number) {
  return MARGIN_Y + (r + 1) * CARD_H + r * GAP + GAP / 2;
}

export function CropMarks() {
  const marks: React.ReactNode[] = [];

  // Interior gap crossings: cross at each point where 4 cards meet
  for (let c = 0; c < COLS - 1; c++) {
    for (let r = 0; r < ROWS - 1; r++) {
      const cx = gapCenterX(c);
      const cy = gapCenterY(r);
      marks.push(
        <HLine key={`ih-${c}-${r}`} x={cx - GAP / 2} y={cy} width={GAP} />,
        <VLine key={`iv-${c}-${r}`} x={cx} y={cy - GAP / 2} height={GAP} />,
      );
    }
  }

  // Top edge: vertical marks where column gaps meet the top margin
  for (let c = 0; c < COLS - 1; c++) {
    const cx = gapCenterX(c);
    marks.push(
      <VLine
        key={`et-${c}`}
        x={cx}
        y={MARGIN_Y - MARK_ARM}
        height={MARK_ARM}
      />,
    );
  }

  // Bottom edge
  for (let c = 0; c < COLS - 1; c++) {
    const cx = gapCenterX(c);
    marks.push(
      <VLine
        key={`eb-${c}`}
        x={cx}
        y={MARGIN_Y + GRID_H}
        height={MARK_ARM}
      />,
    );
  }

  // Left edge: horizontal marks where row gaps meet the left margin
  for (let r = 0; r < ROWS - 1; r++) {
    const cy = gapCenterY(r);
    marks.push(
      <HLine
        key={`el-${r}`}
        x={MARGIN_X - MARK_ARM}
        y={cy}
        width={MARK_ARM}
      />,
    );
  }

  // Right edge
  for (let r = 0; r < ROWS - 1; r++) {
    const cy = gapCenterY(r);
    marks.push(
      <HLine
        key={`er-${r}`}
        x={MARGIN_X + GRID_W}
        y={cy}
        width={MARK_ARM}
      />,
    );
  }

  // Corner marks at the 4 corners of the grid
  // Top-left
  marks.push(
    <HLine key="ctl-h" x={MARGIN_X - MARK_ARM} y={MARGIN_Y} width={MARK_ARM} />,
    <VLine key="ctl-v" x={MARGIN_X} y={MARGIN_Y - MARK_ARM} height={MARK_ARM} />,
  );
  // Top-right
  marks.push(
    <HLine key="ctr-h" x={MARGIN_X + GRID_W} y={MARGIN_Y} width={MARK_ARM} />,
    <VLine key="ctr-v" x={MARGIN_X + GRID_W} y={MARGIN_Y - MARK_ARM} height={MARK_ARM} />,
  );
  // Bottom-left
  marks.push(
    <HLine key="cbl-h" x={MARGIN_X - MARK_ARM} y={MARGIN_Y + GRID_H} width={MARK_ARM} />,
    <VLine key="cbl-v" x={MARGIN_X} y={MARGIN_Y + GRID_H} height={MARK_ARM} />,
  );
  // Bottom-right
  marks.push(
    <HLine key="cbr-h" x={MARGIN_X + GRID_W} y={MARGIN_Y + GRID_H} width={MARK_ARM} />,
    <VLine key="cbr-v" x={MARGIN_X + GRID_W} y={MARGIN_Y + GRID_H} height={MARK_ARM} />,
  );

  return <>{marks}</>;
}
