import React, { useState } from 'react';
import { Copy, Check, Plus, MessageSquare } from 'lucide-react';

interface WeChatSnippetHelperProps {
  onInsertHtml: (snippet: string) => void;
}

interface SnippetItem {
  id: string;
  name: string;
  category: string;
  snippet: string;
  description: string;
}

export const WECHAT_SNIPPETS: SnippetItem[] = [
  {
    id: 'text-left',
    name: '对方发文字',
    category: '基础消息',
    description: '白色气泡，带头像和昵称',
    snippet: `<!-- 对方发普通文字 -->
<div class="wx-row wx-row-left">
  <div class="wx-avatar wx-avatar-sender">陆</div>
  <div class="wx-main">
    <span class="wx-nickname">陆顾问</span>
    <div class="wx-bubble wx-bubble-left">
      这里输入对方发来的文字内容。
    </div>
  </div>
</div>`
  },
  {
    id: 'text-right',
    name: '我发文字',
    category: '基础消息',
    description: '经典微信绿色气泡',
    snippet: `<!-- 我方发文字 -->
<div class="wx-row wx-row-right">
  <div class="wx-avatar wx-avatar-me">我</div>
  <div class="wx-main">
    <div class="wx-bubble wx-bubble-right">
      好的，我知道了。
    </div>
  </div>
</div>`
  },
  {
    id: 'quote-reply',
    name: '引用回复消息',
    category: '互动功能',
    description: '气泡内嵌灰色灰色背景与灰色引用竖线',
    snippet: `<!-- 引用回复某条消息 -->
<div class="wx-row wx-row-left">
  <div class="wx-avatar wx-avatar-sender">陆</div>
  <div class="wx-main">
    <span class="wx-nickname">陆顾问</span>
    <div class="wx-bubble wx-bubble-left">
      这个安排很合理，就这么定。
      <div class="wx-quote-box">
        <span class="wx-quote-sender">楚副队：</span> 今晚八点老地方集合，各自准备好装备。
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'voice-msg',
    name: '语音消息条 (带时长+未读红点)',
    category: '语音通话',
    description: '左侧语音条带未读小红点与秒数',
    snippet: `<!-- 语音消息条 -->
<div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-sender">陆</div><div class="wx-main"><span class="wx-nickname">陆顾问</span><div class="wx-voice-row"><div class="wx-voice-bubble wx-voice-left"><span class="wx-voice-icon">(((</span><span>15''</span></div><span class="wx-voice-unread-dot"></span></div></div></div>`
  },
  {
    id: 'voice-call',
    name: '语音通话 / 视频通话',
    category: '语音通话',
    description: '通话时长或取消提示',
    snippet: `<!-- 通话状态 -->
<div class="wx-row wx-row-right">
  <div class="wx-avatar wx-avatar-me">我</div>
  <div class="wx-main">
    <div class="wx-call-bubble wx-call-right">
      <span>📹 视频通话时长 18:24</span>
    </div>
  </div>
</div>`
  },
  {
    id: 'redpacket',
    name: '微信红包 (🧧)',
    category: '交易与资产',
    description: '红橙色封皮、祝福语与底栏',
    snippet: `<!-- 微信红包 -->
<div class="wx-row wx-row-left">
  <div class="wx-avatar wx-avatar-group1">楚</div>
  <div class="wx-main">
    <span class="wx-nickname">楚副队</span>
    <div class="wx-card-packet">
      <div class="wx-redpacket-top">
        <div class="wx-redpacket-icon">🧧</div>
        <div class="wx-redpacket-detail">
          <div class="wx-redpacket-desc">恭喜发财，大吉大利</div>
          <div class="wx-redpacket-status">领取红包</div>
        </div>
      </div>
      <div class="wx-redpacket-bot">微信红包</div>
    </div>
  </div>
</div>`
  },
  {
    id: 'transfer',
    name: '微信转账 (💰)',
    category: '交易与资产',
    description: '黄色封皮转账卡片，金额与说明',
    snippet: `<!-- 微信转账 -->
<div class="wx-row wx-row-right">
  <div class="wx-avatar wx-avatar-me">我</div>
  <div class="wx-main">
    <div class="wx-card-packet">
      <div class="wx-transfer-top">
        <div class="wx-redpacket-icon">💰</div>
        <div class="wx-redpacket-detail">
          <div class="wx-redpacket-desc">¥ 520.00</div>
          <div class="wx-redpacket-status">请查收转账</div>
        </div>
      </div>
      <div class="wx-transfer-bot">微信转账</div>
    </div>
  </div>
</div>`
  },
  {
    id: 'image-msg',
    name: '图片发送 (照片/截图)',
    category: '媒体',
    description: '圆角图片外框与占位图',
    snippet: `<!-- 图片消息 -->
<div class="wx-row wx-row-left">
  <div class="wx-avatar wx-avatar-sender">陆</div>
  <div class="wx-main">
    <span class="wx-nickname">陆顾问</span>
    <div class="wx-img-bubble">
      <!-- 若有外链图片，将下方占位 div 替换为: <img src="https://..." class="wx-img-content" /> -->
      <div class="wx-img-placeholder">
        <span>📷 [点击查看原图]</span>
        <span class="wx-img-size">照片描述.jpg</span>
      </div>
    </div>
  </div>
</div>`
  },
  {
    id: 'blocked-error',
    name: '拉黑/拒收 (红色惊叹号 ❗)',
    category: '关系提示',
    description: '右侧消息带红色圆圈惊叹号，下方伴随拒收灰色提示',
    snippet: `<!-- 消息被拒收（红色感叹号） -->
<div class="wx-row wx-row-right">
  <div class="wx-avatar wx-avatar-me">我</div>
  <div class="wx-main">
    <div class="wx-blocked-row">
      <div class="wx-bubble wx-bubble-right">
        你为什么要删掉我？把话说清楚！
      </div>
      <span class="wx-error-bang" title="消息未送达">!</span>
    </div>
  </div>
</div>

<!-- 拒收系统灰字提示 -->
<div class="wx-blocked-prompt">
  <div class="wx-blocked-text">
    消息已发出，但被对方拒收了。
  </div>
</div>`
  },
  {
    id: 'friend-verify',
    name: '被删好友验证提示',
    category: '关系提示',
    description: '开启朋友验证提示与蓝色点击链接',
    snippet: `<!-- 非好友系统提示 -->
<div class="wx-blocked-prompt">
  <div class="wx-blocked-text">
    开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。<span class="wx-blocked-link">发送朋友验证</span>
  </div>
</div>`
  },
  {
    id: 'time-divider',
    name: '聊天时间戳 (居中灰底)',
    category: '辅助组件',
    description: '例如“昨天 22:30”或“今天 03:15”',
    snippet: `<!-- 居中时间戳 -->
<div class="wx-time-stamp">
  <span class="wx-time-text">今天 23:45</span>
</div>`
  }
];

export const WeChatSnippetHelper: React.FC<WeChatSnippetHelperProps> = ({ onInsertHtml }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopySnippet = async (item: SnippetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(item.snippet);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 font-semibold text-stone-800">
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>微信常用消息片段快捷插入库</span>
        </div>
        <span className="text-[11px] text-stone-500">点击「+ 插入」直接追加到正文末尾</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
        {WECHAT_SNIPPETS.map(snip => (
          <div
            key={snip.id}
            className="p-2 bg-white rounded-lg border border-stone-200 hover:border-emerald-500 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="font-medium text-stone-900 flex items-center justify-between gap-1">
                <span className="truncate">{snip.name}</span>
              </div>
              <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                {snip.description}
              </p>
            </div>

            <div className="mt-2 pt-1.5 border-t border-stone-100 flex items-center justify-between gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onInsertHtml(snip.snippet)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                title="插入到编辑器正文"
              >
                <Plus className="w-3 h-3" />
                <span>插入</span>
              </button>

              <button
                type="button"
                onClick={e => handleCopySnippet(snip, e)}
                className="text-stone-400 hover:text-stone-700 flex items-center gap-0.5"
                title="复制代码片段"
              >
                {copiedId === snip.id ? (
                  <Check className="w-3 h-3 text-emerald-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
