import React from "react";
import { PrintPage } from "./PrintPage.js";

export interface CardGroup {
  category: string;
  svgContents: string[];
}

export interface PrintLayoutProps {
  groups: CardGroup[];
  showCropMarks: boolean;
}

const CARDS_PER_PAGE = 9; // 3×3 on A4

function paginateGroup(svgContents: string[], perPage: number): string[][] {
  const pages: string[][] = [];
  for (let i = 0; i < svgContents.length; i += perPage) {
    pages.push(svgContents.slice(i, i + perPage));
  }
  return pages;
}

export function PrintLayout({ groups, showCropMarks }: PrintLayoutProps) {
  return (
    <html>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @page { size: A4; margin: 0; }
              * { margin: 0; padding: 0; box-sizing: border-box; }
              @media screen { .crop-mark { display: none; } }
            `,
          }}
        />
      </head>
      <body>
        {groups.map((group, gi) => {
          const pages = paginateGroup(group.svgContents, CARDS_PER_PAGE);
          return pages.map((pageSvgs, pi) => (
            <PrintPage
              key={`${group.category}-${pi}`}
              svgContents={pageSvgs}
              showCropMarks={showCropMarks}
              pageBreak={gi > 0 || pi > 0}
            />
          ));
        })}
      </body>
    </html>
  );
}
