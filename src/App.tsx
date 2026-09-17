/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AO3_TEMPLATES } from './utils/presets';
import { validateAo3Css } from './utils/ao3Validator';
import { AO3Preview } from './components/AO3Preview';
import { ValidationPanel } from './components/ValidationPanel';
import { GuideModal } from './components/GuideModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ArchiveModal } from './components/ArchiveModal';
import { VisualWorkbench } from './components/VisualWorkbench';
import { compileChatHtml, compileChatCss, ChatMeta } from './utils/chatCompiler';
import {
  generateHtmlArchive,
  triggerFileDownload,
  ProjectArchiveData,
  decompileChatHtml,
} from './utils/archiveHelper';
import { ThemeMode, ViewportMode, WorkTemplate, ChatCharacter, ChatMessage } from './types';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  BookOpen,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Feather,
  Palette,
  SlidersHorizontal,
  Archive,
  Download,
  Upload,
  CheckCircle2,
} from 'lucide-react';

const INITIAL_CHARACTERS: ChatCharacter[] = [
  {
    id: 'char_me',
    name: '我',
    shortName: '我',
    color: '#2e7d32',
    isMe: true,
  },
  {
    id: 'char_lu',
    name: '陆顾问',
    shortName: '陆',
    color: '#4f7cac',
    isMe: false,
  },
  {
    id: 'char_chu',
    name: '楚副队',
    shortName: '楚',
    color: '#c0392b',
    isMe: false,
  },
  {
    id: 'char_lin',
    name: '林技术员',
    shortName: '林',
    color: '#7b1fa2',
    isMe: false,
  },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    type: 'time',
    senderId: 'char_chu',
    content: '昨天 21:15',
  },
  {
    id: 'msg_2',
    type: 'text',
    senderId: 'char_chu',
    content: '今晚行动代号已更新，所有人注意查收加密附件。',
  },
  {
    id: 'msg_3',
    type: 'transfer',
    senderId: 'char_lu',
    amount: '¥ 2,000.00',
    content: '备用差旅活动金',
  },
  {
    id: 'msg_4',
    type: 'text',
    senderId: 'char_me',
    content: '收到了，我正在赶往预定坐标。',
    quoteSender: '陆顾问',
    quoteText: '备用差旅活动金',
  },
  {
    id: 'msg_5',
    type: 'voice',
    senderId: 'char_lu',
    duration: "12''",
    isUnread: true,
  },
  {
    id: 'msg_6',
    type: 'video_call',
    senderId: 'char_me',
    callStatus: '视频通话已取消',
  },
  {
    id: 'msg_7',
    type: 'call_screen',
    senderId: 'char_lu',
    callStatus: '● 视频通话进行中',
    callDuration: '18:42',
  },
  {
    id: 'msg_8',
    type: 'time',
    senderId: 'char_me',
    content: '今天 01:24',
  },
  {
    id: 'msg_9',
    type: 'blocked',
    senderId: 'char_me',
    content: '你在哪里？为什么不接电话？',
  },
  {
    id: 'msg_10',
    type: 'system_notice',
    senderId: 'char_me',
    systemText: '你拍了拍“陆顾问”',
  },
];

export default function App() {
  // Visual Studio state
  const [characters, setCharacters] = useState<ChatCharacter[]>(INITIAL_CHARACTERS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [chatMeta, setChatMeta] = useState<ChatMeta>({
    title: '特策小组执行群 (4)',
    backCount: '42',
  });

  // Left panel view mode: 'visual' (visual workbench) or 'code' (raw CSS/HTML editor)
  const [leftPanelMode, setLeftPanelMode] = useState<'visual' | 'code'>('visual');

  // Underlying CSS & HTML
  const [css, setCss] = useState<string>(() => compileChatCss(INITIAL_CHARACTERS));
  const [html, setHtml] = useState<string>(() =>
    compileChatHtml(INITIAL_MESSAGES, INITIAL_CHARACTERS, {
      title: '特策小组执行群 (4)',
      backCount: '42',
    })
  );

  const [activeTemplateId, setActiveTemplateId] = useState<string>('wechat_chat');
  const [activeEditorTab, setActiveEditorTab] = useState<'css' | 'html'>('html');
  const [theme, setTheme] = useState<ThemeMode>('default');
  const [viewport, setViewport] = useState<ViewportMode>('mobile'); // Default to mobile for realistic chat view
  const [workTitle, setWorkTitle] = useState<string>('【排版预览】午夜信笺与街角回音');
  const [authorName, setAuthorName] = useState<string>('ArchiveAuthor');

  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState<boolean>(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);
  const [archiveModalTab, setArchiveModalTab] = useState<'export' | 'import'>('export');
  const [copiedType, setCopiedType] = useState<'css' | 'html' | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  const handleOpenArchiveModal = (tab: 'export' | 'import' = 'export') => {
    setArchiveModalTab(tab);
    setIsArchiveModalOpen(true);
  };

  // Sync from visual studio to HTML & CSS whenever visual studio changes
  useEffect(() => {
    if (leftPanelMode === 'visual') {
      const generatedHtml = compileChatHtml(messages, characters, chatMeta);
      const generatedCss = compileChatCss(characters);
      setHtml(generatedHtml);
      setCss(generatedCss);
    }
  }, [messages, characters, chatMeta, leftPanelMode]);

  // Validate CSS against AO3 requirements
  const issues = useMemo(() => {
    return validateAo3Css(css);
  }, [css]);

  const hasErrors = issues.some((i) => i.type === 'error');
  const hasWarnings = issues.some((i) => i.type === 'warning');

  // Handle template selection
  const handleSelectTemplate = useCallback((template: WorkTemplate) => {
    setCss(template.css);
    setHtml(template.html);
    setActiveTemplateId(template.id);
  }, []);

  // Copy to clipboard helper
  const handleCopy = async (type: 'css' | 'html') => {
    const textToCopy = type === 'css' ? css : html;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Direct 1-click HTML archive download
  const handleDirectExportHtml = () => {
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
    setImportNotice('已成功导出 HTML 存档文件！双击可离线浏览，随时可再次导入本工作台恢复编辑。');
    setTimeout(() => setImportNotice(null), 6000);
  };

  // Handle Archive Import
  const handleImportArchive = (data: Partial<ProjectArchiveData>) => {
    let finalMessages = data.messages;
    let finalCharacters = data.characters;
    let finalChatMeta = data.chatMeta;

    // Fallback: If messages are missing or empty, attempt decompile from HTML
    if ((!finalMessages || finalMessages.length === 0) && data.html) {
      try {
        const doc = new DOMParser().parseFromString(data.html, 'text/html');
        const decompiled = decompileChatHtml(doc, data.css || '');
        if (decompiled && decompiled.messages.length > 0) {
          finalMessages = decompiled.messages;
          finalCharacters = decompiled.characters;
          finalChatMeta = decompiled.chatMeta;
        }
      } catch (err) {
        console.warn('Decompile fallback in App.tsx:', err);
      }
    }

    if (finalCharacters && Array.isArray(finalCharacters) && finalCharacters.length > 0) {
      setCharacters(finalCharacters);
    }
    if (finalMessages && Array.isArray(finalMessages) && finalMessages.length > 0) {
      setMessages(finalMessages);
    }
    if (finalChatMeta) {
      setChatMeta(finalChatMeta);
    }
    if (data.workTitle) {
      setWorkTitle(data.workTitle);
    }
    if (data.authorName) {
      setAuthorName(data.authorName);
    }
    if (data.css) {
      setCss(data.css);
    }
    if (data.html) {
      setHtml(data.html);
    }

    // Auto-switch mode based on imported structure
    if (finalMessages && finalMessages.length > 0) {
      setLeftPanelMode('visual');
      const msgCount = finalMessages.length;
      const charCount = finalCharacters?.length || 0;
      setImportNotice(`存档导入成功！已成功在可视化工作台恢复 ${charCount} 位角色及 ${msgCount} 条聊天对话记录。`);
    } else if (data.html) {
      setLeftPanelMode('code');
      setActiveEditorTab('html');
      setImportNotice('已成功导入正文 HTML，已自动为您开启代码审查与微调视图。');
    }
    setTimeout(() => setImportNotice(null), 6000);
  };

  // Reset to initial story
  const handleResetPresetStory = () => {
    setCharacters(INITIAL_CHARACTERS);
    setMessages(INITIAL_MESSAGES);
    setChatMeta({
      title: '特策小组执行群 (4)',
      backCount: '42',
    });
  };

  return (
    <div className="min-h-screen bg-stone-100/80 text-stone-900 flex flex-col font-sans antialiased">
      {/* Top Application Bar */}
      <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-800 text-white flex items-center justify-center font-serif font-black text-sm shadow-inner tracking-tighter">
              AO3
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                  AO3 排版写作工作台
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-mono hidden sm:inline-block">
                  可视化点选免代码
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenArchiveModal('import')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-xs font-medium text-emerald-300 border border-emerald-800/90 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="一键导入 HTML 或 JSON 存档到工作台"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>导入存档</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenArchiveModal('export')}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-emerald-400 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="一键导出离线可浏览的 HTML 存档"
            >
              <Archive className="w-3.5 h-3.5 text-emerald-400" />
              <span>HTML 存档</span>
            </button>

            <button
              type="button"
              onClick={() => setIsTemplatesOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-amber-300 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">排版模板库</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGuideOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 border border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-stone-400" />
              <span className="hidden sm:inline">AO3 规范</span>
            </button>

            {/* Quick Copy / Download Group */}
            <div className="flex items-center gap-1 pl-2 border-l border-stone-800">
              <button
                type="button"
                onClick={handleDirectExportHtml}
                className="px-2.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                title="一键导出离线可读且可恢复工程的 .html 存档文件"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden md:inline">导出 HTML 存档</span>
                <span className="md:hidden">导出存档</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy('css')}
                className="px-2.5 py-1.5 rounded-md bg-rose-800 hover:bg-rose-700 text-white text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                title="复制用于粘贴到 AO3 Work Skin 的 CSS"
              >
                {copiedType === 'css' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'css' ? '已复制 CSS' : '复制皮肤 CSS'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy('html')}
                className="px-2.5 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-100 text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                title="复制用于粘贴到 AO3 章节正文的 HTML"
              >
                {copiedType === 'html' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                ) : (
                  <Code2 className="w-3.5 h-3.5" />
                )}
                <span>{copiedType === 'html' ? '已复制 HTML' : '复制正文 HTML'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Global Import/Export Notification */}
      {importNotice && (
        <div className="bg-emerald-800 text-white text-xs font-medium px-4 py-2 flex items-center justify-between shadow-xs border-b border-emerald-900 animate-in fade-in duration-150">
          <div className="max-w-7xl mx-auto w-full flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
            <span>{importNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setImportNotice(null)}
            className="text-emerald-200 hover:text-white font-bold ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-3.5">
        {/* Top Control Bar: Mode Switch & Work Title */}
        <div className="bg-white rounded-xl border border-stone-200 p-2.5 sm:p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Left Panel Mode Selector */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                type="button"
                onClick={() => setLeftPanelMode('visual')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  leftPanelMode === 'visual'
                    ? 'bg-rose-700 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>可视化工作台（免代码）</span>
              </button>

              <button
                type="button"
                onClick={() => setLeftPanelMode('code')}
                className={`px-3 py-1.5 rounded-md font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  leftPanelMode === 'code'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>代码审查与微调</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-stone-500 font-medium">
              <Feather className="w-3.5 h-3.5 text-rose-800" />
              <span>章节标题:</span>
              <input
                type="text"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                className="px-2 py-1 bg-stone-50 border border-stone-300 rounded font-serif text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-800 w-44 sm:w-56"
              />
            </div>
            <div className="flex items-center gap-1.5 text-stone-500 font-medium hidden sm:flex">
              <span>作者:</span>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="px-2 py-1 bg-stone-50 border border-stone-300 rounded text-stone-800 focus:outline-none focus:ring-1 focus:ring-rose-800 w-24"
              />
            </div>
          </div>
        </div>

        {/* Dual Panel Split: Left Workspace vs Right Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch">
          {/* Left Column: Visual Workbench OR Code Editor (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col min-h-[560px]">
            {leftPanelMode === 'visual' ? (
              <VisualWorkbench
                characters={characters}
                onUpdateCharacters={setCharacters}
                messages={messages}
                onUpdateMessages={setMessages}
                chatMeta={chatMeta}
                onUpdateChatMeta={setChatMeta}
                onLoadPresetStory={handleResetPresetStory}
                onOpenArchiveModal={handleOpenArchiveModal}
                onImportArchive={handleImportArchive}
              />
            ) : (
              /* Code Editor Mode */
              <div className="flex flex-col gap-3 h-full">
                <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col overflow-hidden flex-1 min-h-[460px]">
                  {/* Tab Header */}
                  <div className="flex items-center justify-between border-b border-stone-200 bg-stone-50 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setActiveEditorTab('html')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          activeEditorTab === 'html'
                            ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>正文 HTML (文章内容)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveEditorTab('css')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                          activeEditorTab === 'css'
                            ? 'bg-white text-rose-900 shadow-xs border border-stone-200'
                            : 'text-stone-500 hover:text-stone-800'
                        }`}
                      >
                        <FileCode className="w-3.5 h-3.5 text-rose-700" />
                        <span>Work Skin CSS</span>
                        {hasErrors ? (
                          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                        ) : hasWarnings ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        )}
                      </button>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      {activeEditorTab === 'css' ? (
                        <span className="font-mono">{css.split('\n').length} 行 CSS</span>
                      ) : (
                        <span className="font-mono">{html.split('\n').length} 行 HTML</span>
                      )}
                    </div>
                  </div>

                  {/* Editor Workspace */}
                  <div className="flex-1 p-3 flex flex-col bg-stone-950 text-stone-200 font-mono text-xs">
                    {activeEditorTab === 'css' ? (
                      <div className="flex flex-col flex-1 relative">
                        <div className="text-[11px] text-stone-400 mb-1.5 flex items-center justify-between pb-1 border-b border-stone-800">
                          <span>/* 请将选择器限定在 #workskin 下，避免污染全站 */</span>
                          <span className="text-stone-500">AO3 规范检查已开启</span>
                        </div>
                        <textarea
                          value={css}
                          onChange={(e) => setCss(e.target.value)}
                          spellCheck={false}
                          className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-rose-900/60 selection:text-white p-1"
                          placeholder="#workskin .custom-style { ... }"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-col flex-1 relative">
                        <div className="text-[11px] text-stone-400 mb-1.5 flex items-center justify-between pb-1 border-b border-stone-800">
                          <span>&lt;!-- 发布到 AO3 时请确保切换为 HTML 模式粘贴 --&gt;</span>
                          <span className="text-stone-500">支持原生 HTML 标签</span>
                        </div>
                        <textarea
                          value={html}
                          onChange={(e) => setHtml(e.target.value)}
                          spellCheck={false}
                          className="w-full flex-1 bg-transparent text-amber-200 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-rose-900/60 selection:text-white p-1"
                          placeholder="<div class=&quot;custom-style&quot;>这里是正文...</div>"
                        />
                      </div>
                    )}
                  </div>

                  {/* Editor Bottom Bar */}
                  <div className="px-3 py-2 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      {activeEditorTab === 'css' ? (
                        hasErrors ? (
                          <span className="text-rose-700 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" /> 存在 AO3 不支持的语法
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> CSS 符合 AO3 白名单
                          </span>
                        )
                      ) : (
                        <span className="text-stone-500">
                          提示：AO3 会自动过滤 script、iframe 等不安全标签。
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(activeEditorTab)}
                      className="px-2.5 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium transition-colors flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>复制当前代码</span>
                    </button>
                  </div>
                </div>

                {/* Validation Panel */}
                <ValidationPanel issues={issues} />
              </div>
            )}
          </div>

          {/* Right Column: AO3 Live Reader Preview + Export Long Image (6 cols on lg) */}
          <div className="lg:col-span-6 flex flex-col min-h-[560px]">
            <AO3Preview
              css={css}
              html={html}
              theme={theme}
              onThemeChange={setTheme}
              viewport={viewport}
              onViewportChange={setViewport}
              workTitle={workTitle}
              authorName={authorName}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        activeTemplateId={activeTemplateId}
      />
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        initialTab={archiveModalTab}
        workTitle={workTitle}
        authorName={authorName}
        chatMeta={chatMeta}
        characters={characters}
        messages={messages}
        css={css}
        html={html}
        onImportArchive={handleImportArchive}
      />
    </div>
  );
}
