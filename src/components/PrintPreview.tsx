import React from 'react';
import Page from './Page';

interface PrintPreviewProps {
  text: string;
  primaryFont: string;
  secondaryFont: string;
  posJitter: number;
  angleJitter: number;
  sizeJitter: number;
  titleImage: string | null;
  titleText: string;
  titleFontSize: number;
  titleFontFamily: string;
  enableFooterRight: boolean;
  footerRightText: string;
  footerRightFontSize: number;
  footerRightFontFamily: string;
  gridRows: number;
  gridCols: number;
  cellSizeMode: 'auto' | 'fixed';
  cellWidth: number;
  cellHeight: number;
  enableOuterBorder: boolean;
  outerBorderPadding: number;
  enableRowSpacing: boolean;
  rowSpacing: number;
  pageWidth: number;
  pageHeight: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  footerText: string;
  footerFontSize: number;
  footerFontFamily: string;
  isPrimaryBold: boolean;
  isSecondaryBold: boolean;
  enableGrid: boolean;
  enableFooter: boolean;
  enableTitle: boolean;
  backgroundImage: string | null;
  backgroundOpacity: number;
}

const processText = (text: string, gridCols: number): string[] => {
  const cells: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '\n') {
      const remainder = cells.length % gridCols;
      const fillCount = gridCols - remainder;
      for (let j = 0; j < fillCount; j++) {
        cells.push('');
      }
    } else if (char !== '\r') {
      cells.push(char);
    }
  }
  return cells;
};

export default function PrintPreview({ 
  text, 
  primaryFont, 
  secondaryFont, 
  posJitter, 
  angleJitter, 
  sizeJitter, 
  titleImage,
  titleText,
  titleFontSize,
  titleFontFamily,
  enableFooterRight,
  footerRightText,
  footerRightFontSize,
  footerRightFontFamily,
  gridRows,
  gridCols,
  cellSizeMode,
  cellWidth,
  cellHeight,
  enableOuterBorder,
  outerBorderPadding,
  enableRowSpacing,
  rowSpacing,
  pageWidth,
  pageHeight,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  footerText,
  footerFontSize,
  footerFontFamily,
  isPrimaryBold,
  isSecondaryBold,
  enableGrid,
  enableFooter,
  enableTitle,
  backgroundImage,
  backgroundOpacity
}: PrintPreviewProps) {
  const cells = processText(text, gridCols);
  const cellsPerPage = gridRows * gridCols;
  const pages: string[][] = [];

  for (let i = 0; i < cells.length; i += cellsPerPage) {
    pages.push(cells.slice(i, i + cellsPerPage));
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  pages.forEach((page) => {
    while (page.length < cellsPerPage) {
      page.push('');
    }
  });

  return (
    <div className="flex flex-col gap-8 items-center print:gap-0">
      <style>{`
        @media print {
          @page {
            size: ${pageWidth}mm ${pageHeight}mm;
          }
        }
      `}</style>
      {pages.map((pageCells, index) => (
        <React.Fragment key={index}>
          <Page
            cells={pageCells}
            pageNumber={index + 1}
            totalPages={pages.length}
            primaryFont={primaryFont}
            secondaryFont={secondaryFont}
            startIndex={index * cellsPerPage}
            posJitter={posJitter}
            angleJitter={angleJitter}
            sizeJitter={sizeJitter}
            titleImage={titleImage}
            titleText={titleText}
            titleFontSize={titleFontSize}
            titleFontFamily={titleFontFamily}
            enableFooterRight={enableFooterRight}
            footerRightText={footerRightText}
            footerRightFontSize={footerRightFontSize}
            footerRightFontFamily={footerRightFontFamily}
            gridRows={gridRows}
            gridCols={gridCols}
            cellSizeMode={cellSizeMode}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            enableOuterBorder={enableOuterBorder}
            outerBorderPadding={outerBorderPadding}
            enableRowSpacing={enableRowSpacing}
            rowSpacing={rowSpacing}
            pageWidth={pageWidth}
            pageHeight={pageHeight}
            marginTop={marginTop}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            marginRight={marginRight}
            footerText={footerText}
            footerFontSize={footerFontSize}
            footerFontFamily={footerFontFamily}
            isPrimaryBold={isPrimaryBold}
            isSecondaryBold={isSecondaryBold}
            enableGrid={enableGrid}
            enableFooter={enableFooter}
            enableTitle={enableTitle}
            backgroundImage={backgroundImage}
            backgroundOpacity={backgroundOpacity}
          />
        </React.Fragment>
      ))}
    </div>
  );
}
