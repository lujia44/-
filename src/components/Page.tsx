import React from 'react';

interface PageProps {
  cells: string[];
  pageNumber: number;
  totalPages: number;
  primaryFont: string;
  secondaryFont: string;
  startIndex: number;
  posJitter: number;
  angleJitter: number;
  sizeJitter: number;
  titleImage: string | null;
  titleText: string;
  titleFontSize: number;
  titleFontFamily: string;
  gridRows: number;
  gridCols: number;
  cellSizeMode: 'auto' | 'fixed';
  cellWidth: number;
  cellHeight: number;
  enableFooterRight: boolean;
  footerRightText: string;
  footerRightFontSize: number;
  footerRightFontFamily: string;
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

export default function Page(props: PageProps) {
  const { 
    cells, 
    pageNumber, 
    totalPages, 
    primaryFont, 
    secondaryFont, 
    startIndex, 
    posJitter, 
    angleJitter, 
    sizeJitter, 
    titleImage,
    titleText,
    titleFontSize,
    titleFontFamily,
    gridRows,
    gridCols,
    cellSizeMode,
    cellWidth,
    cellHeight,
    enableFooterRight,
    footerRightText,
    footerRightFontSize,
    footerRightFontFamily,
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
  } = props;
  const rows = [];
  for (let i = 0; i < gridRows; i++) {
    rows.push(cells.slice(i * gridCols, (i + 1) * gridCols));
  }

  const getTransform = (char: string, index: number) => {
    if (!char || char.trim() === '') return {};
    
    // Deterministic pseudo-random based on the absolute index of the character
    const seed = startIndex + index;
    
    const r1 = Math.sin(seed) * 10000;
    const rand1 = (r1 - Math.floor(r1)) * 2 - 1; // -1 to 1
    
    const r2 = Math.sin(seed + 1000) * 10000;
    const rand2 = (r2 - Math.floor(r2)) * 2 - 1;
    
    const r3 = Math.sin(seed + 2000) * 10000;
    const rand3 = (r3 - Math.floor(r3)) * 2 - 1;
    
    const r4 = Math.sin(seed + 3000) * 10000;
    const rand4 = (r4 - Math.floor(r4)) * 2 - 1;

    const tx = rand1 * posJitter;
    const ty = rand2 * posJitter;
    const rot = rand3 * angleJitter;
    const scale = 1 + rand4 * (sizeJitter / 100);

    return {
      transform: `translate(${tx}px, ${ty}px) rotate(${rot}deg) scale(${scale})`,
      display: 'inline-block'
    };
  };

  const getFontFamily = (index: number) => {
    if (!secondaryFont) return { fontFamily: primaryFont, fontWeight: isPrimaryBold ? 'bold' : 'normal' };
    
    // Deterministic pseudo-random for font selection
    const seed = startIndex + index + 5000;
    const r = Math.sin(seed) * 10000;
    const rand = r - Math.floor(r);
    
    if (rand > 0.5) {
      return { fontFamily: secondaryFont, fontWeight: isSecondaryBold ? 'bold' : 'normal' };
    } else {
      return { fontFamily: primaryFont, fontWeight: isPrimaryBold ? 'bold' : 'normal' };
    }
  };

  return (
    <div className="bg-white shadow-lg print:shadow-none mx-auto relative flex flex-col break-after-page"
         style={{ 
           width: `${pageWidth}mm`, 
           height: `${pageHeight}mm`, 
           padding: `${marginTop}mm ${marginRight}mm ${marginBottom}mm ${marginLeft}mm` 
         }}>
      
      {/* Background Image */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 pointer-events-none z-0"
          style={{ 
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: backgroundOpacity
          }}
        />
      )}
      
      {/* Header */}
      {enableTitle && (titleText || titleImage) && (
        <div className="flex flex-col justify-center items-center mb-4 gap-2 z-10">
          {titleText && (
            <div 
              style={{ 
                fontFamily: titleFontFamily, 
                fontSize: `${titleFontSize}px`,
                fontWeight: 'bold',
                textAlign: 'center',
                lineHeight: 1.2
              }}
            >
              {titleText}
            </div>
          )}
          {titleImage && (
            <img src={titleImage} alt="Title" className="h-10 max-w-[80%] object-contain" referrerPolicy="no-referrer" />
          )}
        </div>
      )}

      {/* Grid */}
      {enableGrid && (
        <div 
          className={`flex flex-col z-10 ${enableOuterBorder ? 'border border-black' : ''} ${cellSizeMode === 'fixed' ? 'w-fit mx-auto' : ''}`}
          style={{ 
            padding: enableOuterBorder ? `${outerBorderPadding}mm` : '0',
            gap: enableRowSpacing ? `${rowSpacing}mm` : '0'
          }}
        >
          {rows.map((rowCells, rowIndex) => (
            <div 
              key={rowIndex} 
              className="grid" 
              style={{ 
                gridTemplateColumns: cellSizeMode === 'fixed' ? `repeat(${gridCols}, ${cellWidth}mm)` : `repeat(${gridCols}, minmax(0, 1fr))`,
                borderTop: (enableRowSpacing || rowIndex === 0) ? '1px solid black' : 'none',
                borderBottom: '1px solid black',
                borderLeft: '1px solid black',
                borderRight: '1px solid black',
              }}
            >
              {rowCells.map((char, colIndex) => {
                const cellIndex = rowIndex * gridCols + colIndex;
                return (
                  <div
                    key={colIndex}
                    className={`flex items-center justify-center text-xl ${cellSizeMode === 'auto' ? 'aspect-square' : ''}`}
                    style={{
                      height: cellSizeMode === 'fixed' ? `${cellHeight}mm` : undefined,
                      borderRight: colIndex < gridCols - 1 ? '1px solid black' : 'none',
                      ...getFontFamily(cellIndex)
                    }}
                  >
                    <span style={getTransform(char, cellIndex)}>{char}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Text only if grid is disabled */}
      {!enableGrid && (
        <div className="flex-1 z-10 overflow-hidden" style={{ padding: '0 5mm' }}>
          {cells.map((char, index) => (
            <span key={index} style={{ ...getFontFamily(index), ...getTransform(char, index), fontSize: '20px', margin: '2px' }}>
              {char === '' ? ' ' : char}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      {enableFooter && (
        <div className="mt-2 relative flex justify-between items-end text-sm font-medium text-gray-800 z-10" style={{ fontFamily: 'SimSun, "Songti SC", serif' }}>
          <span>{gridCols}×{gridRows}={gridCols * gridRows}</span>
          <span className="absolute left-1/2 -translate-x-1/2 font-bold tracking-widest whitespace-nowrap" style={{ fontFamily: footerFontFamily, fontSize: `${footerFontSize}px`, bottom: 0 }}>{footerText}</span>
          
          {enableFooterRight && (
            <span 
              className="whitespace-pre-wrap text-right pr-4"
              style={{ 
                fontFamily: footerRightFontFamily,
                fontSize: `${footerRightFontSize}px`,
                lineHeight: 1.5
              }}
            >
              {footerRightText.replace(/{page}/g, String(pageNumber)).replace(/{total}/g, String(totalPages))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
