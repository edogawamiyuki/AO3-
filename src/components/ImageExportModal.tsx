import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataUrl: string | null;
  blob: Blob | null;
  filename: string;
}

export const ImageExportModal: React.FC<ImageExportModalProps> = ({
  isOpen,
  onClose,
  dataUrl,
  blob,
  filename,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !dataUrl) return null;

  const handleDownloadAgain = () => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 500);
  };

  const handleCopyImage = async () => {
    if (!blob) return;
    try {
      if (navigator.clipboard && (window as any).ClipboardItem) {
        await navigator.clipboard.write([
          new (window as any).ClipboardItem({
            'image/png': blob,
          }),
        ]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        alert('当前浏览器环境不支持直接写入剪贴板图片，请使用右侧「下载图片」按钮或在图片上右键保存。');
      }
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      alert('写入剪贴板失败，建议直接使用「下载图片」或右键长按保存图片。');
    }
  };

  const handleOpenInNewTab = () => {
    const win = window.open();
    if (win) {
      win.document.write(
        `<body style="margin:0;background:#1e1e1e;display:flex;justify-content:center;padding:20px;"><img src="${dataUrl}" style="max-width:100%;box-shadow:0 4px 20px rgba(0,0,0,0.5);" /></body>`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center shadow-xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                <span>高清长图生成成功</span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                  2x Retina
                </span>
              </h3>
              <p className="text-[11px] text-stone-500 truncate max-w-sm sm:max-w-md">
                文件名称: {filename}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="px-5 py-2.5 bg-stone-100/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadAgain}
              className="px-3.5 py-1.5 rounded-lg bg-rose-700 hover:bg-rose-800 text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 PNG 图片</span>
            </button>

            <button
              type="button"
              onClick={handleCopyImage}
              className="px-3 py-1.5 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="复制图片到剪贴板以便直接粘贴到社交软件"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制图片' : '复制图片'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="px-2.5 py-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors hidden sm:flex items-center gap-1"
              title="在新标签页单独查看高分辨率原图"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>新标签查看</span>
            </button>
          </div>

          <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
            💡 提示：亦可直接在长图上右键或长按选择「图片另存为」
          </div>
        </div>

        {/* Image Preview Canvas Box */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-900/5 flex justify-center items-start">
          <div className="max-w-md w-full shadow-lg rounded-xl overflow-hidden border border-stone-200 bg-white">
            <img
              src={dataUrl}
              alt="导出的排版长图预览"
              className="w-full h-auto block select-auto"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-900 transition-colors"
          >
            完成并返回
          </button>
        </div>
      </div>
    </div>
  );
};
