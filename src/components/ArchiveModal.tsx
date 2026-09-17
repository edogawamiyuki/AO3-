import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Download,
  Upload,
  FileCode,
  FileJson,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  Users,
  MessageSquare,
  Clock,
  Archive,
  ArrowRight,
} from 'lucide-react';
import { ChatCharacter, ChatMessage } from '../types';
import { ChatMeta } from '../utils/chatCompiler';
import {
  generateHtmlArchive,
  parseArchiveContent,
  triggerFileDownload,
  ProjectArchiveData,
  ParseArchiveResult,
} from '../utils/archiveHelper';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import';
  workTitle: string;
  authorName: string;
  chatMeta: ChatMeta;
  characters: ChatCharacter[];
  messages: ChatMessage[];
  css: string;
  html: string;
  onImportArchive: (data: Partial<ProjectArchiveData>) => void;
}

export const ArchiveModal: React.FC<ArchiveModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'export',
  workTitle,
  authorName,
  chatMeta,
  characters,
  messages,
  css,
  html,
  onImportArchive,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [importText, setImportText] = useState('');
  const [parseResult, setParseResult] = useState<ParseArchiveResult | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setParseResult(null);
      setImportText('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  // Handle Export HTML
  const handleExportHtml = () => {
    const fullHtml = generateHtmlArchive({
      workTitle,
      authorName,
      chatMeta,
      characters,
      messages,
      css,
      html,
    });
    const filename = `${workTitle || 'AO3聊天排版'}-存档-${new Date().toISOString().slice(0, 10)}.html`;
    triggerFileDownload(fullHtml, filename, 'text/html');
  };

  // Handle Export JSON
  const handleExportJson = () => {
    const payload: ProjectArchiveData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      workTitle,
      authorName,
      chatMeta,
      characters,
      messages,
      css,
      html,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const filename = `${workTitle || 'AO3聊天排版'}-工程数据-${new Date().toISOString().slice(0, 10)}.json`;
    triggerFileDownload(jsonStr, filename, 'application/json');
  };

  // Handle Copy Archive
  const handleCopyArchive = async () => {
    const fullHtml = generateHtmlArchive({
      workTitle,
      authorName,
      chatMeta,
      characters,
      messages,
      css,
      html,
    });
    try {
      await navigator.clipboard.writeText(fullHtml);
      setCopiedType('html');
      setTimeout(() => setCopiedType(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  // Handle file drop / select
  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setImportText(content);
      const res = parseArchiveContent(content);
      setParseResult(res);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextChange = (text: string) => {
    setImportText(text);
    if (text.trim()) {
      const res = parseArchiveContent(text);
      setParseResult(res);
    } else {
      setParseResult(null);
    }
  };

  // Commit imported archive
  const handleConfirmImport = () => {
    if (!parseResult?.data) return;
    onImportArchive(parseResult.data);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-xs">
              <Archive className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                HTML 存档管理中心
              </h3>
              <p className="text-[11px] text-stone-500">
                一键导出独立离线网页或导入历史工程记录
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

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-100/70 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white border-rose-700 text-rose-800 shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-rose-700" />
            <span>导出 HTML 存档</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2 rounded-t-lg text-xs font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white border-blue-700 text-blue-800 shadow-2xs'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-blue-700" />
            <span>导入 HTML 存档</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'export' ? (
            <div className="space-y-4">
              {/* Current Archive Summary */}
              <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>当前存档数据概览</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-stone-200 text-stone-600 font-mono">
                    准备就绪
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 text-[10px] block">作品章节</span>
                    <span className="font-bold text-stone-800 truncate block">
                      {workTitle || '未命名作品'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 text-[10px] block">署名作者</span>
                    <span className="font-bold text-stone-800 truncate block">
                      {authorName || 'ArchiveAuthor'}
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 text-[10px] block">对话角色</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {characters.length} 个角色
                    </span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 text-[10px] block">聊天记录</span>
                    <span className="font-bold text-blue-700 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {messages.length} 条消息
                    </span>
                  </div>
                </div>
              </div>

              {/* Explanatory Box */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold mb-1 flex items-center gap-1">
                  💡 为什么要导出 HTML 存档？
                </p>
                <ul className="list-disc list-inside space-y-1 text-stone-600">
                  <li>
                    <strong>双击即看的离线网页：</strong>导出的 <code>.html</code> 文件内置了完整排版样式与聊天容器，双击直接用任意浏览器即可离线欣赏。
                  </li>
                  <li>
                    <strong>随时一键恢复工程：</strong>文件底部内嵌了完整的工作台角色与消息数据，下次写作时直接点击「导入 HTML 存档」即可继续编辑！
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleExportHtml}
                  className="py-3 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <Download className="w-4 h-4" />
                    <span>下载 HTML 存档</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">
                    (.html 离线浏览 + 工程数据)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold shadow-sm transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    <FileJson className="w-4 h-4 text-amber-400" />
                    <span>导出 JSON 备份</span>
                  </div>
                  <span className="text-[10px] font-normal opacity-90">
                    (.json 纯数据工程包)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyArchive}
                  className="py-3 px-4 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold shadow-xs transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <div className="flex items-center gap-1.5 text-sm">
                    {copiedType === 'html' ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-stone-500" />
                    )}
                    <span>{copiedType === 'html' ? '已复制到剪贴板' : '复制存档代码'}</span>
                  </div>
                  <span className="text-[10px] font-normal text-stone-500">
                    (直接复制源码文本)
                  </span>
                </button>
              </div>
            </div>
          ) : (
            /* Import Tab */
            <div className="space-y-3.5">
              {/* Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 mx-auto mb-2 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-stone-800 mb-1">
                  拖拽 .html 或 .json 存档文件到此处，或点击选择文件
                </div>
                <div className="text-[11px] text-stone-500">
                  支持本工具导出的 HTML 存档、工程 JSON、或任意 AO3 章节正文 HTML
                </div>
              </div>

              {/* Pasteboard input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-stone-700">
                  或者直接在此粘贴存档源码 / 正文 HTML:
                </label>
                <textarea
                  value={importText}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="在此粘贴 <!DOCTYPE html> 存档文件内容，或粘贴从 AO3 复制的章节正文 HTML..."
                  className="w-full h-24 p-2.5 rounded-lg border border-stone-300 font-mono text-[11px] text-stone-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 resize-none"
                />
              </div>

              {/* Parsed Result Preview */}
              {parseResult && (
                <div
                  className={`rounded-xl border p-3 text-xs ${
                    parseResult.success
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}
                >
                  {parseResult.success ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>
                            {parseResult.summary?.isDecompiledFromHtml
                              ? '✨ 已从微信 HTML 智能反解析出对话与角色！'
                              : parseResult.isProjectArchive
                              ? '识别到完整工作台工程存档！'
                              : '识别到正文 HTML 内容'}
                          </span>
                        </span>
                        {parseResult.summary?.timestamp && (
                          <span className="text-[10px] text-emerald-700 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(parseResult.summary.timestamp).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white/70 p-2 rounded-lg border border-emerald-200/80">
                        <div>
                          <span className="text-stone-500 block">作品名</span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {parseResult.summary?.workTitle || '未命名'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">作者</span>
                          <span className="font-semibold text-stone-800 truncate block">
                            {parseResult.summary?.authorName || '未标明'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">恢复角色数</span>
                          <span className="font-semibold text-emerald-700">
                            {parseResult.summary?.characterCount ?? '无'}
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 block">恢复对话条数</span>
                          <span className="font-semibold text-blue-700">
                            {parseResult.summary?.messageCount ?? '无'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-800">
                          {parseResult.summary?.messageCount
                            ? `已就绪，导入后将直接载入可视化工作台 (${parseResult.summary.messageCount} 条记录)`
                            : '将载入正文 HTML'}
                        </span>
                        <button
                          type="button"
                          onClick={handleConfirmImport}
                          className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                        >
                          <span>确认导入并恢复到工作台</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{parseResult.errorMessage || '解析失败，请检查文件格式。'}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <div className="text-[11px] text-stone-500">
            {activeTab === 'import' && parseResult?.success
              ? `已准备好导入 ${parseResult.summary?.messageCount || 0} 条对话记录`
              : '提示：存档文件可直接在离线浏览器双击预览'}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
            >
              取消
            </button>
            {activeTab === 'import' && parseResult?.success && (
              <button
                type="button"
                onClick={handleConfirmImport}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>立即导入工作台</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
