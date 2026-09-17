import { ChatCharacter, ChatMessage, MessageType } from '../types';
import { ChatMeta, compileChatHtml, compileChatCss } from './chatCompiler';

export interface ProjectArchiveData {
  version: string;
  timestamp: string;
  workTitle: string;
  authorName: string;
  chatMeta: ChatMeta;
  characters: ChatCharacter[];
  messages: ChatMessage[];
  css: string;
  html: string;
}

export interface ParseArchiveResult {
  success: boolean;
  isProjectArchive: boolean;
  data?: Partial<ProjectArchiveData>;
  errorMessage?: string;
  summary?: {
    workTitle?: string;
    authorName?: string;
    characterCount?: number;
    messageCount?: number;
    timestamp?: string;
    isRawHtmlOnly?: boolean;
    isDecompiledFromHtml?: boolean;
  };
}

const PRESET_FALLBACK_COLORS = [
  '#4f7cac',
  '#2e7d32',
  '#c0392b',
  '#555555',
  '#7b1fa2',
  '#d97706',
  '#0284c7',
  '#be185d',
  '#0f766e',
];

/**
 * Generate a standalone, offline-viewable HTML file that also embeds
 * the full project archive state in both JSON script and base64 attribute.
 */
export function generateHtmlArchive(data: {
  workTitle: string;
  authorName: string;
  chatMeta: ChatMeta;
  characters: ChatCharacter[];
  messages: ChatMessage[];
  css: string;
  html: string;
}): string {
  const archivePayload: ProjectArchiveData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    workTitle: data.workTitle || 'AO3 微信聊天作品',
    authorName: data.authorName || 'ArchiveAuthor',
    chatMeta: data.chatMeta,
    characters: data.characters,
    messages: data.messages,
    css: data.css,
    html: data.html,
  };

  const jsonArchiveStr = JSON.stringify(archivePayload);

  // Safe Base64 encoding to prevent any HTML/Script tag truncation
  let base64Archive = '';
  try {
    base64Archive = btoa(unescape(encodeURIComponent(jsonArchiveStr)));
  } catch (e) {
    console.warn('Base64 encoding notice:', e);
  }

  // Safe escape for script embedding
  const safeScriptContent = jsonArchiveStr.replace(/<\/script/gi, '<\\/script');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(data.workTitle || 'AO3微信排版存档')} - by ${escapeHtml(data.authorName || 'Author')}</title>
  <style>
    /* 离线预览基础容器与页面居中样式 */
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 24px 12px;
      background-color: #f2f2f2;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .archive-header {
      max-width: 480px;
      width: 100%;
      margin-bottom: 16px;
      padding: 12px 16px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
      font-size: 13px;
      color: #666;
    }
    .archive-header h1 {
      margin: 0 0 6px 0;
      font-size: 16px;
      color: #990000;
      font-family: Georgia, serif;
    }
    .archive-meta {
      display: flex;
      justify-content: space-between;
      color: #888;
      font-size: 12px;
    }
    .workskin-wrapper {
      max-width: 480px;
      width: 100%;
    }

    /* ========== AO3 Work Skin 完整样式 ========== */
${data.css}
  </style>
</head>
<body>
  <div class="archive-header">
    <h1>${escapeHtml(data.workTitle || 'AO3 微信聊天作品')}</h1>
    <div class="archive-meta">
      <span>作者: ${escapeHtml(data.authorName || 'ArchiveAuthor')}</span>
      <span>存档生成时间: ${new Date().toLocaleString()}</span>
    </div>
  </div>

  <div class="workskin-wrapper">
    <!-- AO3 Workskin 正文容器 -->
    <div id="workskin">
${data.html}
    </div>
  </div>

  <!-- AO3 WORKBENCH PROJECT ARCHIVE (DO NOT DELETE: 用于一键导入工作台继续编辑) -->
  <script id="ao3-workbench-archive" type="application/json" data-archive-base64="${base64Archive}">
${safeScriptContent}
  </script>
</body>
</html>`;
}

/**
 * Reverse-engineers / decompiles WeChat chat HTML DOM into native
 * ChatCharacter[], ChatMessage[], and ChatMeta structures.
 */
export function decompileChatHtml(
  doc: Document,
  existingCss: string = ''
): {
  messages: ChatMessage[];
  characters: ChatCharacter[];
  chatMeta: ChatMeta;
} | null {
  const container = doc.querySelector('.wx-container, .wx-chat-container') || doc.body;
  const rows = container.querySelectorAll(
    '.wx-row, .wx-time-stamp, .wx-system-notice, .wx-blocked-prompt, .wx-callscreen-card'
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  // 1. Extract Chat Meta
  const titleEl = container.querySelector('.wx-chat-title, .wx-header-title');
  const backCountEl = container.querySelector('.wx-back-count, .wx-header-left');

  const chatMeta: ChatMeta = {
    title: titleEl?.textContent?.trim() || '微信对话',
    backCount:
      backCountEl?.textContent?.replace(/[^0-9]/g, '').trim() || '42',
  };

  // 2. Character Registry & Color map
  const colorMap = new Map<string, string>();
  // Try extracting colors from CSS
  const cssMatches = existingCss.matchAll(
    /\.wx-avatar-char-([a-zA-Z0-9_-]+)\s*\{[^}]*background-color:\s*([^;]+);/gi
  );
  for (const m of cssMatches) {
    if (m[1] && m[2]) {
      colorMap.set(m[1].trim(), m[2].trim());
    }
  }

  const charMap = new Map<string, ChatCharacter>();

  function getOrRegisterCharacter(params: {
    idHint?: string;
    name: string;
    shortName: string;
    isMe: boolean;
    avatarUrl?: string;
  }): ChatCharacter {
    let id = params.idHint;
    if (!id || id === 'unknown') {
      id = params.isMe ? 'char_me' : `char_${charMap.size + 1}`;
    }

    if (charMap.has(id)) {
      const existing = charMap.get(id)!;
      if (!existing.avatarUrl && params.avatarUrl) {
        existing.avatarUrl = params.avatarUrl;
      }
      return existing;
    }

    const assignedColor =
      colorMap.get(id) ||
      PRESET_FALLBACK_COLORS[charMap.size % PRESET_FALLBACK_COLORS.length];

    const newChar: ChatCharacter = {
      id,
      name: params.name || (params.isMe ? '我' : '对话人'),
      shortName:
        params.shortName || (params.name ? params.name.slice(0, 2) : '?'),
      color: assignedColor,
      isMe: params.isMe,
      avatarUrl: params.avatarUrl,
    };
    charMap.set(id, newChar);
    return newChar;
  }

  // Pre-seed "我"
  getOrRegisterCharacter({
    idHint: 'char_me',
    name: '我',
    shortName: '我',
    isMe: true,
  });

  // 3. Process Rows
  const messages: ChatMessage[] = [];
  let msgCounter = 1;

  rows.forEach((rowEl) => {
    const rowId = `msg_imported_${msgCounter++}_${Date.now()}`;

    // Timestamp
    if (rowEl.classList.contains('wx-time-stamp')) {
      const text = rowEl.textContent?.trim() || '今天 12:00';
      messages.push({
        id: rowId,
        senderId: 'char_me',
        type: 'time',
        content: text,
      });
      return;
    }

    // System Notice
    if (rowEl.classList.contains('wx-system-notice')) {
      const text = rowEl.textContent?.trim() || '系统提示';
      messages.push({
        id: rowId,
        senderId: 'char_me',
        type: 'system_notice',
        systemText: text,
      });
      return;
    }

    // Blocked / Friend verification prompt
    if (rowEl.classList.contains('wx-blocked-prompt')) {
      const text = rowEl.textContent?.trim() || '';
      if (text.includes('朋友验证')) {
        messages.push({
          id: rowId,
          senderId: 'char_me',
          type: 'friend_verify',
          content: '朋友验证',
        });
      }
      return;
    }

    // Call screen card
    if (rowEl.classList.contains('wx-callscreen-card')) {
      const callStatus =
        rowEl.querySelector('.wx-callscreen-status')?.textContent?.trim() ||
        '● 视频通话进行中';
      const callDuration =
        rowEl.querySelector('.wx-callscreen-time')?.textContent?.trim() ||
        '18:42';
      const senderName =
        rowEl.querySelector('.wx-callscreen-name')?.textContent?.trim() || '对方';
      const char = getOrRegisterCharacter({
        name: senderName,
        shortName: senderName.slice(0, 2),
        isMe: false,
      });
      messages.push({
        id: rowId,
        senderId: char.id,
        type: 'call_screen',
        callStatus,
        callDuration,
      });
      return;
    }

    // Standard Chat Row (.wx-row)
    if (rowEl.classList.contains('wx-row')) {
      const isRight = rowEl.classList.contains('wx-row-right');
      const avatarEl = rowEl.querySelector('.wx-avatar');

      let charIdHint = '';
      if (avatarEl) {
        for (const cls of Array.from(avatarEl.classList)) {
          if (cls.startsWith('wx-avatar-char-')) {
            charIdHint = cls.replace('wx-avatar-char-', '');
            break;
          }
        }
      }

      const imgEl = avatarEl?.querySelector('img');
      const avatarUrl = imgEl?.getAttribute('src') || undefined;
      const avatarText = avatarEl?.textContent?.trim() || (isRight ? '我' : '');
      const nicknameEl = rowEl.querySelector('.wx-nickname, .wx-sender-name');
      const senderName =
        nicknameEl?.textContent?.trim() ||
        (isRight ? '我' : avatarText || '朋友');

      const sender = getOrRegisterCharacter({
        idHint: charIdHint || (isRight ? 'char_me' : undefined),
        name: senderName,
        shortName: avatarText || senderName.slice(0, 2),
        isMe: isRight,
        avatarUrl,
      });

      // Check message types inside row:
      // 1. Blocked message (exclamation mark)
      if (rowEl.querySelector('.wx-blocked-row')) {
        const bubble = rowEl.querySelector('.wx-bubble');
        messages.push({
          id: rowId,
          senderId: sender.id,
          type: 'blocked',
          content: bubble?.textContent?.trim() || '',
        });
        return;
      }

      // 2. Call bubble (Voice or Video)
      const callBubble = rowEl.querySelector('.wx-call-bubble');
      if (callBubble) {
        const isVoiceCall =
          !!rowEl.querySelector('.wx-call-voice-icon') ||
          callBubble.textContent?.includes('📞') ||
          callBubble.textContent?.includes('通话时长');
        const callStatus =
          callBubble.querySelector('span')?.textContent?.trim() ||
          callBubble.textContent?.trim() ||
          '';
        messages.push({
          id: rowId,
          senderId: sender.id,
          type: isVoiceCall ? 'voice_call' : 'video_call',
          callStatus,
        });
        return;
      }

      // 3. Voice audio message
      const voiceBubble = rowEl.querySelector('.wx-voice-bubble');
      if (voiceBubble) {
        const durationText =
          voiceBubble.querySelector('span:last-child')?.textContent?.trim() ||
          "12''";
        const isUnread = !!rowEl.querySelector('.wx-voice-unread-dot');
        messages.push({
          id: rowId,
          senderId: sender.id,
          type: 'voice',
          duration: durationText,
          isUnread,
        });
        return;
      }

      // 4. Red Packet or Transfer Card
      const cardPacket = rowEl.querySelector('.wx-card-packet');
      if (cardPacket) {
        const isTransfer =
          cardPacket.textContent?.includes('微信转账') ||
          !!cardPacket.querySelector('.wx-transfer-top');
        const desc =
          cardPacket.querySelector('.wx-redpacket-desc')?.textContent?.trim() ||
          '';
        const detail =
          cardPacket
            .querySelector('.wx-redpacket-status')
            ?.textContent?.trim() || '';

        if (isTransfer) {
          messages.push({
            id: rowId,
            senderId: sender.id,
            type: 'transfer',
            amount: desc || '¥ 520.00',
            content: detail || '请查收转账',
          });
        } else {
          messages.push({
            id: rowId,
            senderId: sender.id,
            type: 'redpacket',
            packetDesc: desc || '恭喜发财，大吉大利',
            packetStatus: detail || '领取红包',
          });
        }
        return;
      }

      // 5. Image Bubble
      const imgBubble = rowEl.querySelector('.wx-img-bubble');
      if (imgBubble) {
        const picImg = imgBubble.querySelector('img');
        const picUrl = picImg?.getAttribute('src') || '';
        const descText =
          imgBubble.querySelector('.wx-img-placeholder span')?.textContent?.trim() ||
          '[图片]';
        messages.push({
          id: rowId,
          senderId: sender.id,
          type: 'image',
          mediaUrl: picUrl,
          mediaDesc: descText.replace(/^🖼️\s*/, ''),
          mediaSize: '1.5 MB',
        });
        return;
      }

      // 6. Regular Text Bubble
      const bubbleEl = rowEl.querySelector('.wx-bubble');
      if (bubbleEl) {
        // Check for quote
        let quoteSender = '';
        let quoteText = '';
        const quoteBox = bubbleEl.querySelector('.wx-quote-box');
        if (quoteBox) {
          quoteSender =
            quoteBox.querySelector('.wx-quote-sender')?.textContent?.replace(/[:：]/g, '').trim() || '';
          const fullQuote = quoteBox.textContent?.trim() || '';
          quoteText = fullQuote.replace(new RegExp(`^${quoteSender}[:：]?\\s*`), '');
          quoteBox.remove();
        }

        // Convert <br> to newline
        const brs = bubbleEl.querySelectorAll('br');
        brs.forEach((br) => br.replaceWith('\n'));
        const content = bubbleEl.textContent?.trim() || '';

        messages.push({
          id: rowId,
          senderId: sender.id,
          type: 'text',
          content,
          quoteSender: quoteSender || undefined,
          quoteText: quoteText || undefined,
        });
      }
    }
  });

  return {
    messages,
    characters: Array.from(charMap.values()),
    chatMeta,
  };
}

/**
 * Parses raw text from an uploaded file or pasteboard.
 * Supports:
 * 1. Base64 attribute in script tag
 * 2. Embedded JSON script in HTML
 * 3. Pure JSON project backup
 * 4. Raw AO3 / WeChat chat HTML with automatic full decompile into Workbench messages
 */
export function parseArchiveContent(rawContent: string): ParseArchiveResult {
  const trimmed = rawContent.trim();
  if (!trimmed) {
    return {
      success: false,
      isProjectArchive: false,
      errorMessage: '导入内容为空，请选择文件或粘贴 HTML/JSON 存档内容。',
    };
  }

  // 1. Check for pure JSON first
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed) as ProjectArchiveData;
      if (Array.isArray(parsed.messages) || Array.isArray(parsed.characters) || parsed.html) {
        return {
          success: true,
          isProjectArchive: true,
          data: parsed,
          summary: {
            workTitle: parsed.workTitle,
            authorName: parsed.authorName,
            characterCount: parsed.characters?.length || 0,
            messageCount: parsed.messages?.length || 0,
            timestamp: parsed.timestamp,
            isRawHtmlOnly: false,
          },
        };
      }
    } catch {
      // Continue to HTML parsing
    }
  }

  // 2. Parse using browser DOMParser for maximal robustness
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(trimmed, 'text/html');

    // Check script tag for Base64 or JSON
    const scriptEl =
      doc.getElementById('ao3-workbench-archive') ||
      doc.querySelector('script#ao3-workbench-archive') ||
      doc.querySelector('script[type="application/json"]');

    if (scriptEl) {
      // Attempt 1: Base64 data attribute (completely immune to tag breaking)
      const b64 = scriptEl.getAttribute('data-archive-base64');
      if (b64) {
        try {
          const decodedJson = decodeURIComponent(escape(atob(b64)));
          const parsed = JSON.parse(decodedJson) as ProjectArchiveData;
          if (parsed && (parsed.messages || parsed.characters)) {
            return {
              success: true,
              isProjectArchive: true,
              data: parsed,
              summary: {
                workTitle: parsed.workTitle,
                authorName: parsed.authorName,
                characterCount: parsed.characters?.length || 0,
                messageCount: parsed.messages?.length || 0,
                timestamp: parsed.timestamp,
                isRawHtmlOnly: false,
              },
            };
          }
        } catch (err) {
          console.warn('Base64 decode attempt failed, checking textContent:', err);
        }
      }

      // Attempt 2: TextContent of script tag
      const textContent = scriptEl.textContent?.trim();
      if (textContent) {
        try {
          const parsed = JSON.parse(textContent) as ProjectArchiveData;
          if (parsed && (parsed.messages || parsed.characters)) {
            return {
              success: true,
              isProjectArchive: true,
              data: parsed,
              summary: {
                workTitle: parsed.workTitle,
                authorName: parsed.authorName,
                characterCount: parsed.characters?.length || 0,
                messageCount: parsed.messages?.length || 0,
                timestamp: parsed.timestamp,
                isRawHtmlOnly: false,
              },
            };
          }
        } catch (err) {
          console.warn('Script textContent parse failed:', err);
        }
      }
    }

    // 3. Fallback: Decompile WeChat HTML into real messages and characters!
    // Extract CSS if style tags exist
    let extractedCss = '';
    const styleEls = doc.querySelectorAll('style');
    styleEls.forEach((st) => {
      extractedCss += st.textContent + '\n';
    });

    const decompiled = decompileChatHtml(doc, extractedCss);

    // Extract title & author from metadata if present
    const headerTitleEl = doc.querySelector('.archive-header h1');
    const docTitle = doc.title || '';
    const cleanDocTitle = docTitle.replace(/\s*-\s*by.*$/i, '').trim();
    const detectedTitle =
      headerTitleEl?.textContent?.trim() || cleanDocTitle || '导入的微信聊天';

    const authorMatch = trimmed.match(/作者:\s*([^<\n]+)/i);
    const detectedAuthor = authorMatch ? authorMatch[1].trim() : 'ArchiveAuthor';

    // Extract workskin HTML or full body
    let extractedHtml = trimmed;
    const workskinEl = doc.getElementById('workskin');
    if (workskinEl) {
      extractedHtml = workskinEl.innerHTML.trim();
    } else {
      const chatContainer = doc.querySelector('.wx-container, .wx-chat-container');
      if (chatContainer) {
        extractedHtml = chatContainer.outerHTML;
      }
    }

    if (decompiled && decompiled.messages.length > 0) {
      return {
        success: true,
        isProjectArchive: true,
        data: {
          workTitle: detectedTitle,
          authorName: detectedAuthor,
          chatMeta: decompiled.chatMeta,
          characters: decompiled.characters,
          messages: decompiled.messages,
          css: extractedCss.trim() || undefined,
          html: extractedHtml,
        },
        summary: {
          workTitle: detectedTitle,
          authorName: detectedAuthor,
          characterCount: decompiled.characters.length,
          messageCount: decompiled.messages.length,
          isRawHtmlOnly: false,
          isDecompiledFromHtml: true,
        },
      };
    }

    // 4. Raw HTML only (no chat bubbles detected)
    return {
      success: true,
      isProjectArchive: false,
      data: {
        html: extractedHtml,
        workTitle: detectedTitle,
      },
      summary: {
        workTitle: detectedTitle || '导入的正文 HTML',
        isRawHtmlOnly: true,
      },
    };
  } catch (err: any) {
    console.error('HTML archive parse error:', err);
    return {
      success: false,
      isProjectArchive: false,
      errorMessage: `解析失败: ${err?.message || '文件格式不正确'}`,
    };
  }
}

/**
 * Triggers a file download in the browser
 */
export function triggerFileDownload(content: string, filename: string, mimeType: string): boolean {
  try {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
    return true;
  } catch (err) {
    console.error('File download failed:', err);
    return false;
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
