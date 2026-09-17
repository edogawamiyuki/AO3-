import { ChatCharacter, ChatMessage } from '../types';
import { WECHAT_SKIN_CSS } from './wechatPreset';

export interface ChatMeta {
  title: string;
  backCount: string;
}

/**
 * 将可视化消息与角色列表编译为 AO3 正文 HTML
 */
export function compileChatHtml(
  messages: ChatMessage[],
  characters: ChatCharacter[],
  meta: ChatMeta
): string {
  const charMap = new Map<string, ChatCharacter>();
  characters.forEach((c) => charMap.set(c.id, c));

  const rowsHtml = messages
    .map((msg) => {
      const sender = charMap.get(msg.senderId) || {
        id: 'unknown',
        name: '未知人物',
        shortName: '?',
        color: '#666',
        isMe: false,
      };

      const isRight = sender.isMe;
      const avatarClass = `wx-avatar-char-${sender.id}`;
      const avatarContent = sender.avatarUrl
        ? `<img src="${sender.avatarUrl}" alt="${sender.name}" class="wx-avatar-img" />`
        : sender.shortName;

      switch (msg.type) {
        case 'time':
          return `    <div class="wx-time-stamp"><span class="wx-time-text">${escapeHtml(msg.content || '昨天 21:00')}</span></div>`;

        case 'system_notice':
          return `    <div class="wx-system-notice"><span class="wx-system-text">${escapeHtml(msg.systemText || msg.content || '系统提示')}</span></div>`;

        case 'friend_verify':
          return `    <div class="wx-blocked-prompt"><div class="wx-blocked-text">开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。<span class="wx-blocked-link">发送朋友验证</span></div></div>`;

        case 'blocked':
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-blocked-row"><div class="wx-bubble ${isRight ? 'wx-bubble-right' : 'wx-bubble-left'}">${escapeHtml(msg.content || '')}</div><span class="wx-error-bang" title="消息未送达">!</span></div></div></div>
    <div class="wx-blocked-prompt"><div class="wx-blocked-text">消息已发出，但被对方拒收了。</div></div>`;

        case 'text': {
          const formattedText = escapeHtml(msg.content || '').replace(/\n/g, '<br/>');
          let quoteHtml = '';
          if (msg.quoteSender && msg.quoteText) {
            quoteHtml = `<div class="wx-quote-box"><span class="wx-quote-sender">${escapeHtml(msg.quoteSender)}:</span> ${escapeHtml(msg.quoteText)}</div>`;
          }

          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-bubble ${isRight ? 'wx-bubble-right' : 'wx-bubble-left'}">${formattedText}${quoteHtml}</div></div></div>`;
        }

        case 'video_call': {
          const statusText = escapeHtml(msg.callStatus || '视频通话已取消');
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-call-bubble ${isRight ? 'wx-call-right' : 'wx-call-left'}"><span>${statusText}</span><span class="wx-call-icon"></span></div></div></div>`;
        }

        case 'voice_call': {
          const statusText = escapeHtml(msg.callStatus || '通话时长 05:21');
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-call-bubble ${isRight ? 'wx-call-right' : 'wx-call-left'}"><span>${statusText}</span><span class="wx-call-voice-icon">📞</span></div></div></div>`;
        }

        case 'call_screen': {
          // 逼真全屏/大卡片视频通话呼叫
          const callTitle = escapeHtml(msg.callStatus || '● 视频通话进行中');
          const duration = escapeHtml(msg.callDuration || '18:42');
          return `    <div class="wx-callscreen-card">
      <div class="wx-callscreen-status">${callTitle}</div>
      <div class="wx-callscreen-time">${duration}</div>
      <div class="wx-callscreen-avatar-wrap"><div class="wx-callscreen-avatar ${avatarClass}">${avatarContent}</div></div>
      <div class="wx-callscreen-name">${escapeHtml(sender.name)}</div>
      <div class="wx-callscreen-actions">
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle">🎤</div><span>静音</span></div>
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle wx-callscreen-btn-hangup">✕</div><span class="wx-hangup-text">挂断</span></div>
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle">🔄</div><span>翻转</span></div>
      </div>
    </div>`;
        }

        case 'voice': {
          const duration = escapeHtml(msg.duration || "12''");
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-voice-row"><div class="wx-voice-bubble ${isRight ? 'wx-voice-right' : 'wx-voice-left'}"><span class="wx-voice-icon">${isRight ? ')))' : '((('}</span><span>${duration}</span></div>${msg.isUnread && !isRight ? '<span class="wx-voice-unread-dot"></span>' : ''}</div></div></div>`;
        }

        case 'redpacket': {
          const desc = escapeHtml(msg.packetDesc || '恭喜发财，大吉大利');
          const status = escapeHtml(msg.packetStatus || '领取红包');
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-card-packet"><div class="wx-redpacket-top"><div class="wx-redpacket-icon">🧧</div><div class="wx-redpacket-detail"><div class="wx-redpacket-desc">${desc}</div><div class="wx-redpacket-status">${status}</div></div></div><div class="wx-redpacket-bot">微信红包</div></div></div></div>`;
        }

        case 'transfer': {
          const amount = escapeHtml(msg.amount || '¥ 520.00');
          const note = escapeHtml(msg.content || '请查收转账');
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-card-packet"><div class="wx-transfer-top"><div class="wx-redpacket-icon">💰</div><div class="wx-redpacket-detail"><div class="wx-redpacket-desc">${amount}</div><div class="wx-redpacket-status">${note}</div></div></div><div class="wx-transfer-bot">微信转账</div></div></div></div>`;
        }

        case 'image': {
          const desc = escapeHtml(msg.mediaDesc || '[图片]');
          const size = escapeHtml(msg.mediaSize || '1.4 MB');
          return `    <div class="wx-row ${isRight ? 'wx-row-right' : 'wx-row-left'}"><div class="wx-avatar ${avatarClass}">${avatarContent}</div><div class="wx-main">${!isRight ? `<span class="wx-nickname">${escapeHtml(sender.name)}</span>` : ''}<div class="wx-img-bubble">${
            msg.mediaUrl
              ? `<img src="${msg.mediaUrl}" alt="图片" class="wx-img-content" />`
              : `<div class="wx-img-placeholder"><span>🖼️ ${desc}</span><span class="wx-img-size">(${size})</span></div>`
          }</div></div></div>`;
        }

        default:
          return '';
      }
    })
    .join('\n');

  return `<div class="wx-container">
  <!-- 微信顶部导航栏 -->
  <div class="wx-topbar">
    <div class="wx-topbar-left">
      <span class="wx-back-arrow">‹</span>
      <span class="wx-back-count">${escapeHtml(meta.backCount || '42')}</span>
    </div>
    <div class="wx-chat-title">${escapeHtml(meta.title || '特策小组执行群 (4)')}</div>
    <div class="wx-chat-dots">•••</div>
  </div>

  <!-- 聊天主体记录流 -->
  <div class="wx-body">
${rowsHtml}
  </div>
</div>`;
}

/**
 * 编译完整的 Work Skin CSS，包含所有动态人物头像色彩类
 */
export function compileChatCss(characters: ChatCharacter[]): string {
  const dynamicAvatarRules = characters
    .map((c) => {
      return `#workskin .wx-avatar-char-${c.id} {
  background-color: ${c.color};
  color: #ffffff;
}`;
    })
    .join('\n\n');

  return `${WECHAT_SKIN_CSS}

/* ========== 动态角色预设头像配色 ========== */
${dynamicAvatarRules}
`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
