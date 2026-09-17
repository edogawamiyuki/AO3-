import React, { useMemo, useRef, useState } from 'react';
import { ThemeMode, ViewportMode } from '../types';
import { Monitor, Smartphone, Sun, Moon, Download, Loader2, Check, AlertCircle } from 'lucide-react';
import { captureElementToImage, downloadImageFile } from '../utils/imageExporter';
import { ImageExportModal } from './ImageExportModal';

interface AO3PreviewProps {
  css: string;
  html: string;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  viewport: ViewportMode;
  onViewportChange: (viewport: ViewportMode) => void;
  workTitle?: string;
  authorName?: string;
}

export const AO3Preview: React.FC<AO3PreviewProps> = ({
  css,
  html,
  theme,
  onThemeChange,
  viewport,
  onViewportChange,
  workTitle = '【章节标题】午夜信笺与街角回音',
  authorName = 'ArchiveAuthor_99',
}) => {
  const exportCardRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportMode, setExportMode] = useState<'full' | 'chat_only'>('full');

  // Modal for generated image
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [exportedImage, setExportedImage] = useState<{
    dataUrl: string;
    blob: Blob;
    filename: string;
  } | null>(null);

  // Ensure CSS is safely scoped or injected
  const sanitizedCss = useMemo(() => {
    return css;
  }, [css]);

  const isReversi = theme === 'reversi';

  const handleExportImage = async () => {
    if (!exportCardRef.current || isExporting) return;

    try {
      setIsExporting(true);
      setExportError(null);

      // Determine the target element based on exportMode
      let targetElement: HTMLElement = exportCardRef.current;
      if (exportMode === 'chat_only') {
        const chatContainer = exportCardRef.current.querySelector(
          '.wx-container, .wx-chat-container'
        ) as HTMLElement;
        if (chatContainer) {
          targetElement = chatContainer;
        } else {
          const workskinEl = exportCardRef.current.querySelector('#workskin') as HTMLElement;
          if (workskinEl) {
            targetElement = workskinEl;
          }
        }
      }

      const timestamp = new Date().toISOString().slice(0, 10);
      const cleanTitle = (workTitle || 'AO3聊天').replace(/[\\/:*?"<>|]/g, '_');
      const filename = `${cleanTitle}-${exportMode === 'chat_only' ? '微信对话' : '全篇排版'}-${timestamp}.png`;
      const bg = exportMode === 'chat_only' ? '#ededed' : isReversi ? '#1e1e1e' : '#ffffff';

      const result = await captureElementToImage({
        element: targetElement,
        filename,
        backgroundColor: bg,
        pixelRatio: 2,
      });

      // 1. Attempt programmatic browser download
      downloadImageFile(result.dataUrl, filename);

      // 2. Also open preview modal so user can view & save directly
      setExportedImage(result);
      setIsImageModalOpen(true);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    } catch (err: any) {
      console.error('Failed to export long image:', err);
      setExportError(err?.message || '导出长图失败，请稍后重试。');
      setTimeout(() => setExportError(null), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-stone-100 rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2.5 bg-stone-50 border-b border-stone-200 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-700 inline-block" />
          <span className="text-xs font-semibold uppercase tracking-wider text-stone-700">
            AO3 读者视角实时预览
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200 text-stone-600 font-mono hidden sm:inline">
            #workskin
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Export Long Image Button */}
          <div className="flex items-center bg-white rounded-lg border border-stone-300 p-0.5 shadow-xs">
            <select
              value={exportMode}
              onChange={(e) => setExportMode(e.target.value as 'full' | 'chat_only')}
              className="text-xs text-stone-700 bg-transparent px-1.5 py-1 border-r border-stone-200 focus:outline-none"
              title="选择长图导出范围"
            >
              <option value="full">全页面长图</option>
              <option value="chat_only">仅聊天框</option>
            </select>
            <button
              type="button"
              onClick={handleExportImage}
              disabled={isExporting}
              className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                exportSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
              } disabled:opacity-50`}
              title="一键导出高清长图 (PNG)"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>导出中...</span>
                </>
              ) : exportSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已保存</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>导出长图</span>
                </>
              )}
            </button>
          </div>

          {/* Viewport switch */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg border border-stone-300">
            <button
              type="button"
              onClick={() => onViewportChange('desktop')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewport === 'desktop'
                  ? 'bg-white text-stone-800 shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="电脑宽屏模式"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">宽屏</span>
            </button>
            <button
              type="button"
              onClick={() => onViewportChange('mobile')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                viewport === 'mobile'
                  ? 'bg-white text-stone-800 shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="手机窄屏模式 (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">手机</span>
            </button>
          </div>

          {/* Theme switch */}
          <div className="flex items-center bg-stone-200/80 p-0.5 rounded-lg border border-stone-300">
            <button
              type="button"
              onClick={() => onThemeChange('default')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                theme === 'default'
                  ? 'bg-white text-stone-800 shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="AO3 原生默认浅色 (Default)"
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden lg:inline">默认白</span>
            </button>
            <button
              type="button"
              onClick={() => onThemeChange('reversi')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                theme === 'reversi'
                  ? 'bg-stone-800 text-stone-100 shadow-xs font-medium'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="AO3 官方深色皮肤 (Reversi)"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden lg:inline">夜间</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulator canvas background */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center bg-stone-200/60">
        <div
          ref={exportCardRef}
          className={`transition-all duration-300 shadow-md rounded-lg overflow-hidden flex flex-col ${
            viewport === 'mobile'
              ? 'w-full max-w-[390px] border-4 border-stone-400/40 rounded-3xl min-h-[640px]'
              : 'w-full max-w-4xl'
          } ${isReversi ? 'bg-[#1e1e1e] text-[#e0e0e0]' : 'bg-[#ffffff] text-[#2a2a2a]'}`}
          style={{
            fontFamily:
              'Lucida Grande, "Lucida Sans Unicode", "GNU Unifont", Verdana, Helvetica, sans-serif',
          }}
        >
          {/* Dynamic User CSS injection */}
          <style>{sanitizedCss}</style>

          {/* AO3 Header Mock */}
          <div
            className={`border-b px-6 py-4 ${
              isReversi
                ? 'bg-[#292929] border-[#3d3d3d]'
                : 'bg-[#f3f3f3] border-[#ddd]'
            }`}
          >
            <div className="text-center">
              <h2
                className={`text-xl font-serif font-bold tracking-tight mb-1 ${
                  isReversi ? 'text-[#ffcccc]' : 'text-[#900]'
                }`}
              >
                {workTitle}
              </h2>
              <div
                className={`text-xs ${
                  isReversi ? 'text-[#aaa]' : 'text-[#666]'
                }`}
              >
                by{' '}
                <span className="underline font-medium hover:text-[#900] cursor-pointer">
                  {authorName}
                </span>
              </div>
            </div>

            {/* Tags / Meta block */}
            <div
              className={`mt-3 pt-2.5 border-t text-[11px] grid grid-cols-2 gap-y-1 ${
                isReversi
                  ? 'border-[#3d3d3d] text-[#888]'
                  : 'border-[#e5e5e5] text-[#777]'
              }`}
            >
              <div>分级: General Audiences</div>
              <div>警告: No Archive Warnings Apply</div>
              <div>配对: Character A/Character B</div>
              <div>章节: 1/1 • 语言: 中文-普通话</div>
            </div>
          </div>

          {/* Simulated Chapter Summary and Note */}
          <div
            className={`px-6 py-3 text-xs border-b italic ${
              isReversi
                ? 'bg-[#242424] border-[#383838] text-[#aaa]'
                : 'bg-[#fafafa] border-[#eee] text-[#555]'
            }`}
          >
            <span className="font-semibold not-italic text-[#900]">作者的话：</span>{' '}
            本章包含特殊排版（Work Skin 渲染效果已启用）。可在下方正文中阅读。
          </div>

          {/* The Actual AO3 Work Body Wrapped in #workskin */}
          <div className="p-6 sm:p-8 flex-1">
            <div
              id="workskin"
              className="ao3-workskin-container leading-relaxed"
              style={{
                fontFamily:
                  'Georgia, "Songti SC", "SimSun", "Times New Roman", serif',
                fontSize: '16px',
              }}
            >
              {/* Sample prologue narration before custom styled element */}
              <p
                className="mb-4 text-stone-700 dark:text-stone-300"
                style={{ textIndent: '2em', textAlign: 'justify' }}
              >
                窗外的夜雨淅淅沥沥地下着，桌边的终端屏幕突然闪烁了一下，跳出了一条新的提醒提示。
              </p>

              {/* Injected Story HTML */}
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    html ||
                    '<div class="text-stone-400 italic text-sm text-center py-6">（正文 HTML 暂为空，请在左侧编辑器中输入 HTML 代码）</div>',
                }}
              />

              {/* Sample epilogue narration */}
              <p
                className="mt-6 text-stone-700 dark:text-stone-300"
                style={{ textIndent: '2em', textAlign: 'justify' }}
              >
                关上通讯记录，室内的光线重归于寂静。唯有指针在墙壁上一下接一下地跳动着。
              </p>
            </div>
          </div>

          {/* AO3 Footer Mock */}
          <div
            className={`border-t px-6 py-3 text-[11px] flex items-center justify-between ${
              isReversi
                ? 'bg-[#292929] border-[#3d3d3d] text-[#777]'
                : 'bg-[#f7f7f7] border-[#e5e5e5] text-[#888]'
            }`}
          >
            <span>Top ↑ • Kudos (赞) • Bookmark (收藏) • Comments (评论)</span>
            <span>Archive of Our Own</span>
          </div>
        </div>
      </div>

      {/* Export Error Banner */}
      {exportError && (
        <div className="bg-rose-50 border-t border-rose-200 px-4 py-2 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{exportError}</span>
          </div>
          <button
            type="button"
            onClick={() => setExportError(null)}
            className="text-rose-600 hover:text-rose-900 font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* High-Res Image Preview & Direct Save Modal */}
      <ImageExportModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        dataUrl={exportedImage?.dataUrl || null}
        blob={exportedImage?.blob || null}
        filename={exportedImage?.filename || 'ao3-preview.png'}
      />
    </div>
  );
};
