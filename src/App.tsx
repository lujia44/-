import React, { useState, useEffect, useRef } from 'react';
import { Printer, FileText, Upload, ChevronDown, ChevronUp, Eye, Settings, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PrintPreview from './components/PrintPreview';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-200 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center py-2 text-left font-medium text-gray-700 hover:text-indigo-600 transition-colors"
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  const [text, setText] = useState('');
  const [primaryFont, setPrimaryFont] = useState('KaiTi, STKaiti, serif');
  const [secondaryFont, setSecondaryFont] = useState('');
  const [titleImage, setTitleImage] = useState<string | null>(null);
  const [titleText, setTitleText] = useState('');
  const [titleFontSize, setTitleFontSize] = useState(24);
  const [titleFontFamily, setTitleFontFamily] = useState('SimHei, "Microsoft YaHei", sans-serif');
  const [enableFooterRight, setEnableFooterRight] = useState(true);
  const [footerRightText, setFooterRightText] = useState('    年  月  日 第 {page} 页');
  const [footerRightFontSize, setFooterRightFontSize] = useState(14);
  const [footerRightFontFamily, setFooterRightFontFamily] = useState('SimSun, "Songti SC", serif');
  const [gridRows, setGridRows] = useState(20);
  const [gridCols, setGridCols] = useState(20);
  const [cellSizeMode, setCellSizeMode] = useState<'auto' | 'fixed'>('auto');
  const [cellWidth, setCellWidth] = useState(15);
  const [cellHeight, setCellHeight] = useState(15);
  const [enableOuterBorder, setEnableOuterBorder] = useState(true);
  const [outerBorderPadding, setOuterBorderPadding] = useState(2);
  const [enableRowSpacing, setEnableRowSpacing] = useState(true);
  const [rowSpacing, setRowSpacing] = useState(4);
  const [pageSize, setPageSize] = useState('A4');
  const [pageWidth, setPageWidth] = useState(210);
  const [pageHeight, setPageHeight] = useState(297);
  const [marginTop, setMarginTop] = useState(12);
  const [marginBottom, setMarginBottom] = useState(15);
  const [marginLeft, setMarginLeft] = useState(15);
  const [marginRight, setMarginRight] = useState(15);
  const [posJitter, setPosJitter] = useState(0);
  const [angleJitter, setAngleJitter] = useState(0);
  const [sizeJitter, setSizeJitter] = useState(0);
  const [footerText, setFooterText] = useState('社会热点心得体会专用纸张');
  const [footerFontSize, setFooterFontSize] = useState(16);
  const [footerFontFamily, setFooterFontFamily] = useState('SimHei, "Microsoft YaHei", sans-serif');
  const [isPrimaryBold, setIsPrimaryBold] = useState(false);
  const [isSecondaryBold, setIsSecondaryBold] = useState(false);
  const [enableGrid, setEnableGrid] = useState(true);
  const [enableFooter, setEnableFooter] = useState(true);
  const [enableTitle, setEnableTitle] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.2);
  const [fonts, setFonts] = useState([
    { label: '楷体 (KaiTi)', value: 'KaiTi, STKaiti, serif' },
    { label: '宋体 (SimSun)', value: 'SimSun, "Songti SC", serif' },
    { label: '黑体 (SimHei)', value: 'SimHei, "Microsoft YaHei", sans-serif' },
    { label: '仿宋 (FangSong)', value: 'FangSong, STFangsong, serif' },
    { label: '系统默认 (System Default)', value: 'sans-serif' },
  ]);

  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSaving, setIsSaving] = useState(false);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const printPreviewRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Calculate page count for height adjustment
  const gridColsNum = gridCols || 20;
  const gridRowsNum = gridRows || 20;
  const cellsPerPage = gridRowsNum * gridColsNum;
  
  const processTextForCount = (t: string, cols: number) => {
    let count = 0;
    for (let i = 0; i < t.length; i++) {
      const char = t[i];
      if (char === '\n') {
        const remainder = count % cols;
        count += (cols - remainder);
      } else if (char !== '\r') {
        count++;
      }
    }
    return count;
  };

  const totalCells = processTextForCount(text, gridColsNum);
  const pageCount = Math.max(1, Math.ceil(totalCells / cellsPerPage));

  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth - (window.innerWidth < 768 ? 0 : 32); 
        const paperWidthPx = (pageWidth * 96) / 25.4; 
        if (containerWidth < paperWidthPx) {
          setPreviewScale(containerWidth / paperWidthPx);
        } else {
          setPreviewScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pageWidth, activeTab]);

  const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fontUrl = URL.createObjectURL(file);
    const fontName = `CustomFont_${Date.now()}`;

    const newStyle = document.createElement('style');
    newStyle.appendChild(
      document.createTextNode(`
        @font-face {
          font-family: '${fontName}';
          src: url('${fontUrl}');
        }
      `)
    );
    document.head.appendChild(newStyle);

    const newFont = { label: `自定义: ${file.name}`, value: `'${fontName}', sans-serif` };
    setFonts((prev) => [...prev, newFont]);
    
    // Auto-select the newly uploaded font
    if (!secondaryFont && primaryFont !== 'KaiTi, STKaiti, serif') {
      setSecondaryFont(newFont.value);
    } else {
      setPrimaryFont(newFont.value);
    }
    
    // Reset input value so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleTitleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setTitleImage(imageUrl);
    e.target.value = '';
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setBackgroundImage(imageUrl);
    e.target.value = '';
  };

  const handleSave = async (format: 'pdf' | 'png') => {
    if (!printPreviewRef.current) return;
    
    setIsSaving(true);
    try {
      const pages = printPreviewRef.current.querySelectorAll('.break-after-page');
      if (pages.length === 0) return;

      if (format === 'pdf') {
        const pdf = new jsPDF({
          orientation: pageWidth > pageHeight ? 'landscape' : 'portrait',
          unit: 'mm',
          format: [pageWidth, pageHeight]
        });

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          const canvas = await html2canvas(page, {
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          if (i > 0) pdf.addPage([pageWidth, pageHeight], pageWidth > pageHeight ? 'l' : 'p');
          pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
        }
        
        pdf.save(`handwriting_${Date.now()}.pdf`);
      } else {
        // Save all pages as individual PNGs
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i] as HTMLElement;
          const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          const link = document.createElement('a');
          link.download = `handwriting_${Date.now()}_page${i + 1}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          // Small delay to ensure browser handles multiple downloads
          if (pages.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
    } catch (error) {
      console.error('Failed to save:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header for the app (not printed) */}
      <header className="bg-white shadow-sm p-4 print:hidden flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 md:w-6 md:h-6 text-indigo-600" />
          <span className="hidden sm:inline">Grid Paper Generator</span>
          <span className="sm:hidden">Grid Gen</span>
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex md:hidden bg-gray-100 rounded-lg p-1 mr-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`p-1.5 rounded-md transition-all ${activeTab === 'edit' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`p-1.5 rounded-md transition-all ${activeTab === 'preview' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500'}`}
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave('pdf')}
              disabled={isSaving}
              className="bg-indigo-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-indigo-700 flex items-center gap-2 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">保存为 PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>

            <button
              onClick={() => handleSave('png')}
              disabled={isSaving}
              className="bg-emerald-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-md hover:bg-emerald-700 flex items-center gap-2 transition-colors text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span className="hidden sm:inline">保存为图片</span>
              <span className="sm:hidden">图片</span>
            </button>
            
            <button
              onClick={handlePrint}
              className="bg-gray-100 text-gray-600 p-1.5 md:p-2 rounded-md hover:bg-gray-200 transition-colors print:hidden"
              title="打印 (Print)"
            >
              <Printer className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row p-0 md:p-4 gap-0 md:gap-6 overflow-hidden print:p-0 print:block">
        {/* Input area */}
        <div className={`w-full md:w-1/3 flex flex-col gap-4 print:hidden h-full overflow-y-auto px-4 py-4 md:pr-2 md:pb-2 ${activeTab === 'preview' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex flex-col gap-4">
            <CollapsibleSection title="字体设置 (Fonts)" defaultOpen={true}>
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12 shrink-0">字体 1:</span>
                  <select
                    value={primaryFont}
                    onChange={(e) => setPrimaryFont(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {fonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                    <input type="checkbox" checked={isPrimaryBold} onChange={(e) => setIsPrimaryBold(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    加粗
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12 shrink-0">字体 2:</span>
                  <select
                    value={secondaryFont}
                    onChange={(e) => setSecondaryFont(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value="">无 (None)</option>
                    {fonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                    <input type="checkbox" checked={isSecondaryBold} onChange={(e) => setIsSecondaryBold(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                    加粗
                  </label>
                </div>
                <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm">上传新字体</span>
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    className="hidden"
                    onChange={handleFontUpload}
                  />
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="标题设置 (Title)">
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={titleText} 
                  onChange={(e) => setTitleText(e.target.value)} 
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="标题文本 (可选)"
                />
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12 shrink-0">字体:</span>
                  <select
                    value={titleFontFamily}
                    onChange={(e) => setTitleFontFamily(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    {fonts.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-12 shrink-0">字号:</span>
                  <input 
                    type="number" 
                    value={titleFontSize} 
                    onChange={(e) => setTitleFontSize(Number(e.target.value))} 
                    className="w-20 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    min="12" max="72"
                  />
                  <span className="text-sm text-gray-600">px</span>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-gray-600">标题图片:</label>
                  <div className="flex gap-2 items-center">
                    <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                      <Upload className="w-4 h-4" />
                      <span className="text-sm">上传图片</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleTitleUpload} />
                    </label>
                    {titleImage && (
                      <button onClick={() => setTitleImage(null)} className="text-sm text-red-600 hover:text-red-700 underline">清除</button>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="背景设置 (Background)">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap flex-1 justify-center">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">上传背景</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleBackgroundUpload} />
                  </label>
                  {backgroundImage && (
                    <button onClick={() => setBackgroundImage(null)} className="text-sm text-red-600 hover:text-red-700 underline">清除</button>
                  )}
                </div>
                {backgroundImage && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm text-gray-600 flex justify-between">
                      <span>透明度</span>
                      <span>{Math.round(backgroundOpacity * 100)}%</span>
                    </label>
                    <input type="range" min="0" max="1" step="0.05" value={backgroundOpacity} onChange={(e) => setBackgroundOpacity(Number(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                )}
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="内容输入 (Content)" defaultOpen={text.length === 0}>
              <div className="flex flex-col gap-2">
                <textarea
                  id="text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y font-sans min-h-[150px] text-sm"
                  placeholder="在此输入文字，换行将开始新的一行..."
                />
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="显示控制 (Visibility)">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={enableTitle} onChange={(e) => setEnableTitle(e.target.checked)} className="rounded text-indigo-600" />
                  显示标题 (Show Title)
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={enableGrid} onChange={(e) => setEnableGrid(e.target.checked)} className="rounded text-indigo-600" />
                  显示格子 (Show Grid)
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={enableOuterBorder} onChange={(e) => setEnableOuterBorder(e.target.checked)} className="rounded text-indigo-600" />
                  外边框 (Outer Border)
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={enableRowSpacing} onChange={(e) => setEnableRowSpacing(e.target.checked)} className="rounded text-indigo-600" />
                  行间隔 (Row Spacing)
                </label>
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <input type="checkbox" checked={enableFooter} onChange={(e) => setEnableFooter(e.target.checked)} className="rounded text-indigo-600" />
                  显示页脚 (Show Footer)
                </label>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="网格参数 (Grid Params)">
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm text-gray-600">行数:</label>
                    <input type="number" min="5" max="50" value={gridRows} onChange={(e) => setGridRows(Number(e.target.value) || 20)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-sm text-gray-600">列数:</label>
                    <input type="number" min="5" max="50" value={gridCols} onChange={(e) => setGridCols(Number(e.target.value) || 20)} className="w-full p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
                {enableOuterBorder && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">外边距 (mm):</span>
                    <input type="number" step="0.5" value={outerBorderPadding} onChange={(e) => setOuterBorderPadding(Number(e.target.value))} className="w-16 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                )}
                {enableRowSpacing && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">行距 (mm):</span>
                    <input type="number" step="0.5" value={rowSpacing} onChange={(e) => setRowSpacing(Number(e.target.value))} className="w-16 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-gray-700 font-medium">格子大小:</span>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="radio" checked={cellSizeMode === 'auto'} onChange={() => setCellSizeMode('auto')} /> 自动
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input type="radio" checked={cellSizeMode === 'fixed'} onChange={() => setCellSizeMode('fixed')} /> 自定义
                    </label>
                  </div>
                  {cellSizeMode === 'fixed' && (
                    <div className="flex gap-2 pl-6">
                      <input type="number" step="0.5" value={cellWidth} onChange={(e) => setCellWidth(Number(e.target.value))} className="w-16 p-1 border border-gray-300 rounded-md text-sm" placeholder="宽" />
                      <input type="number" step="0.5" value={cellHeight} onChange={(e) => setCellHeight(Number(e.target.value))} className="w-16 p-1 border border-gray-300 rounded-md text-sm" placeholder="高" />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="页面设置 (Page)">
              <div className="flex flex-col gap-3">
                <div className="flex gap-2 items-center">
                  <span className="text-sm text-gray-600 w-16 shrink-0">纸张:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPageSize(val);
                      if (val === 'A4') { setPageWidth(210); setPageHeight(297); }
                      else if (val === 'A3') { setPageWidth(297); setPageHeight(420); }
                      else if (val === 'B5') { setPageWidth(176); setPageHeight(250); }
                      else if (val === 'Letter') { setPageWidth(216); setPageHeight(279); }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="A4">A4</option>
                    <option value="A3">A3</option>
                    <option value="B5">B5</option>
                    <option value="Letter">Letter</option>
                    <option value="Custom">自定义</option>
                  </select>
                </div>
                {pageSize === 'Custom' && (
                  <div className="flex gap-2">
                    <input type="number" value={pageWidth} onChange={(e) => setPageWidth(Number(e.target.value))} className="flex-1 p-2 border border-gray-300 rounded-md text-sm" placeholder="宽(mm)" />
                    <input type="number" value={pageHeight} onChange={(e) => setPageHeight(Number(e.target.value))} className="flex-1 p-2 border border-gray-300 rounded-md text-sm" placeholder="高(mm)" />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 w-8">上:</span>
                    <input type="number" value={marginTop} onChange={(e) => setMarginTop(Number(e.target.value))} className="flex-1 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 w-8">下:</span>
                    <input type="number" value={marginBottom} onChange={(e) => setMarginBottom(Number(e.target.value))} className="flex-1 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 w-8">左:</span>
                    <input type="number" value={marginLeft} onChange={(e) => setMarginLeft(Number(e.target.value))} className="flex-1 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 w-8">右:</span>
                    <input type="number" value={marginRight} onChange={(e) => setMarginRight(Number(e.target.value))} className="flex-1 p-1 border border-gray-300 rounded-md text-sm" />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="手写模拟 (Simulation)">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600 flex justify-between">
                    <span>位置扰动</span>
                    <span>{posJitter}px</span>
                  </label>
                  <input type="range" min="0" max="20" step="0.5" value={posJitter} onChange={(e) => setPosJitter(Number(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600 flex justify-between">
                    <span>角度扰动</span>
                    <span>{angleJitter}°</span>
                  </label>
                  <input type="range" min="0" max="45" step="1" value={angleJitter} onChange={(e) => setAngleJitter(Number(e.target.value))} className="w-full accent-indigo-600" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-gray-600 flex justify-between">
                    <span>大小扰动</span>
                    <span>{sizeJitter}%</span>
                  </label>
                  <input type="range" min="0" max="50" step="1" value={sizeJitter} onChange={(e) => setSizeJitter(Number(e.target.value))} className="w-full accent-indigo-600" />
                </div>
              </div>
            </CollapsibleSection>

            <CollapsibleSection title="页脚内容 (Footer Content)">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3">
                  <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" placeholder="页脚文本" />
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600 w-12 shrink-0">字体:</span>
                    <select value={footerFontFamily} onChange={(e) => setFooterFontFamily(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded-md text-sm">
                      {fonts.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-12 shrink-0">大小:</span>
                    <input type="number" value={footerFontSize} onChange={(e) => setFooterFontSize(Number(e.target.value))} className="w-20 p-2 border border-gray-300 rounded-md text-sm" />
                  </div>
                  <label className="text-sm text-gray-700 flex items-center gap-2">
                    <input type="checkbox" checked={enableFooterRight} onChange={(e) => setEnableFooterRight(e.target.checked)} className="rounded text-indigo-600" />
                    页脚右侧信息
                  </label>
                  {enableFooterRight && (
                    <textarea value={footerRightText} onChange={(e) => setFooterRightText(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm" rows={2} />
                  )}
                </div>
              </div>
            </CollapsibleSection>

            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="text-input" className="font-medium text-gray-700">内容输入 (Text Input):</label>
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y font-sans min-h-[150px] text-sm"
                placeholder="在此输入文字，换行将开始新的一行..."
              />
            </div>
          </div>
        </div>

        {/* Preview area */}
        <div 
          ref={previewContainerRef}
          className={`w-full md:w-2/3 bg-gray-200 md:rounded-lg overflow-auto p-0 md:p-4 flex justify-center print:w-full print:p-0 print:bg-white print:overflow-visible ${activeTab === 'edit' ? 'hidden md:flex' : 'flex'}`}
        >
          <div 
            style={{ 
              transform: `scale(${previewScale})`, 
              transformOrigin: 'top center',
              width: previewScale < 1 ? 'fit-content' : '100%',
              height: previewScale < 1 ? `${(pageHeight + 20) * pageCount * previewScale}mm` : 'auto' 
            }}
            className="print:transform-none print:w-full print:h-auto"
            ref={printPreviewRef}
          >
            <PrintPreview 
              text={text} 
              primaryFont={primaryFont} 
              secondaryFont={secondaryFont}
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
          </div>
        </div>
      </main>
    </div>
  );
}
