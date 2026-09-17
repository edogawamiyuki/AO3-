import { WorkTemplate } from '../types';

export const WECHAT_TEMPLATE: WorkTemplate = {
  id: 'wechat-complete',
  title: '微信完整聊天生态 (WeChat Full Suite)',
  tag: '高仿微信 / 必备同人排版',
  description: '完整复刻微信聊天界面：左右文字气泡、引用回复、图片发送、红包、转账、语音条(带时长)、语音/视频通话、系统拉黑红色惊叹号感叹号提示、群聊多头像昵称等。严格遵循 AO3 CSS 白名单规范。',
  css: `#workskin .wx-container {
  max-width: 25em;
  margin: 1.8em auto;
  background-color: #ededed;
  border: 1px solid #d5d5d5;
  border-radius: 0.6em;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 0.95em;
  line-height: 1.45;
  color: #191919;
  overflow: hidden;
}

/* AO3 核心段落注入防御：消除 AO3 自动在 HTML 中插入 <p> 与 <br> 导致的气泡居中、错位与换行问题 */
#workskin .wx-container p,
#workskin .wx-row p,
#workskin .wx-main p,
#workskin .wx-topbar p,
#workskin .wx-card-packet p,
#workskin .wx-callscreen-card p {
  margin: 0 !important;
  padding: 0 !important;
  display: contents !important;
}

#workskin .wx-container br {
  display: none !important;
}

#workskin .wx-bubble br,
#workskin .wx-blocked-text br {
  display: block !important;
}

#workskin .wx-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7em 0.9em;
  background-color: #ededed;
  border-bottom: 1px solid #dcdcdc;
  font-weight: 500;
  font-size: 0.95em;
}

#workskin .wx-topbar-left {
  display: flex;
  align-items: center;
}

#workskin .wx-back-count {
  font-size: 0.85em;
  color: #191919;
  margin-left: 0.25em;
}

#workskin .wx-back-arrow {
  color: #191919;
  font-weight: bold;
  font-size: 1.1em;
}

#workskin .wx-chat-title {
  font-weight: 600;
  color: #191919;
  text-align: center;
}

#workskin .wx-chat-dots {
  color: #555555;
  font-weight: bold;
  letter-spacing: 0.15em;
}

#workskin .wx-body {
  padding: 1.2em 0.8em 1.6em 0.8em;
  background-color: #ededed;
}

#workskin .wx-time-stamp {
  text-align: center;
  margin: 0.9em 0;
}

#workskin .wx-time-text {
  display: inline-block;
  font-size: 0.72em;
  color: #8c8c8c;
  background-color: rgba(0, 0, 0, 0.04);
  padding: 0.2em 0.6em;
  border-radius: 0.3em;
}

#workskin .wx-system-notice {
  text-align: center;
  margin: 0.9em auto;
  max-width: 90%;
}

#workskin .wx-system-text,
#workskin .wx-system-notice-text {
  display: inline-block;
  font-size: 0.72em;
  color: #8c8c8c;
  line-height: 1.4;
  padding: 0.25em 0.7em;
  background-color: rgba(0, 0, 0, 0.04);
  border-radius: 0.3em;
}

#workskin .wx-row {
  display: flex;
  margin-bottom: 1em;
  align-items: flex-start;
}

#workskin .wx-row-left {
  flex-direction: row;
  justify-content: flex-start;
}

#workskin .wx-row-right {
  flex-direction: row-reverse;
  justify-content: flex-start;
}

#workskin .wx-avatar {
  width: 2.5em;
  height: 2.5em;
  border-radius: 0.3em;
  background-color: #c9cdd4;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.88em;
  flex-shrink: 0;
  user-select: none;
  overflow: hidden;
}

#workskin .wx-avatar img,
#workskin .wx-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  display: block;
}

#workskin .wx-avatar-sender {
  background-color: #4f7cac;
}

#workskin .wx-avatar-group1 {
  background-color: #6a9955;
}

#workskin .wx-avatar-group2 {
  background-color: #d16969;
}

#workskin .wx-avatar-me {
  background-color: #3b5998;
}

#workskin .wx-main {
  max-width: 72%;
  margin: 0 0.6em;
  display: flex;
  flex-direction: column;
}

#workskin .wx-row-left .wx-main {
  align-items: flex-start;
}

#workskin .wx-row-right .wx-main {
  align-items: flex-end;
}

#workskin .wx-nickname {
  font-size: 0.72em;
  color: #7b7b7b;
  margin-bottom: 0.25em;
  padding: 0 0.2em;
}

#workskin .wx-bubble {
  position: relative;
  padding: 0.6em 0.85em;
  border-radius: 0.4em;
  font-size: 0.95em;
  line-height: 1.45;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

#workskin .wx-bubble-left {
  background-color: #ffffff;
  color: #191919;
  border: 1px solid #e0e0e0;
}

#workskin .wx-bubble-right {
  background-color: #95ec69;
  color: #191919;
  border: 1px solid #82d45a;
}

#workskin .wx-quote-box {
  margin-top: 0.4em;
  padding: 0.35em 0.6em;
  background-color: rgba(0, 0, 0, 0.04);
  border-left: 2px solid #a8a8a8;
  border-radius: 0.2em;
  font-size: 0.8em;
  color: #666666;
  line-height: 1.35;
}

#workskin .wx-bubble-right .wx-quote-box {
  background-color: rgba(0, 0, 0, 0.05);
  border-left: 2px solid #5a943b;
}

#workskin .wx-quote-sender {
  font-weight: 500;
  color: #444444;
}

#workskin .wx-img-bubble {
  border-radius: 0.4em;
  overflow: hidden;
  max-width: 12em;
  border: 1px solid #d5d5d5;
  background-color: #e5e5e5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

#workskin .wx-img-bubble img,
#workskin .wx-img-content {
  max-width: 14em;
  border-radius: 0.4em;
  display: block;
}

#workskin .wx-img-size {
  font-size: 0.75em;
  color: #888888;
  margin-top: 0.3em;
  display: block;
}

#workskin .wx-img-placeholder {
  width: 12em;
  height: 9em;
  background-color: #dedede;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666666;
  font-size: 0.85em;
}

#workskin .wx-voice-row {
  display: flex;
  align-items: center;
}

#workskin .wx-voice-bubble {
  display: flex;
  align-items: center;
  padding: 0.55em 0.85em;
  border-radius: 0.4em;
  font-size: 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

#workskin .wx-voice-left {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  width: 7em;
  justify-content: space-between;
}

#workskin .wx-voice-right {
  background-color: #95ec69;
  border: 1px solid #82d45a;
  width: 10.5em;
  justify-content: space-between;
  flex-direction: row-reverse;
}

#workskin .wx-voice-icon {
  font-size: 1.1em;
  line-height: 1;
}

#workskin .wx-voice-unread,
#workskin .wx-voice-unread-dot {
  width: 0.45em;
  height: 0.45em;
  border-radius: 50%;
  background-color: #fa5151;
  margin-left: 0.4em;
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}

#workskin .wx-call-bubble {
  display: flex;
  align-items: center;
  padding: 0.65em 0.95em;
  border-radius: 0.4em;
  font-size: 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

#workskin .wx-call-left {
  background-color: #ffffff;
  color: #191919;
  border: 1px solid #e0e0e0;
}

#workskin .wx-call-right {
  background-color: #95ec69;
  color: #191919;
  border: 1px solid #82d45a;
}

#workskin .wx-call-icon {
  width: 1.25em;
  height: 0.9em;
  border-radius: 0.15em;
  background-color: currentColor;
  display: inline-block;
  position: relative;
  flex-shrink: 0;
  margin-right: 0.6em;
}

#workskin .wx-call-voice-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  line-height: 1;
  margin-left: 0.6em;
}

#workskin .wx-call-icon::after {
  content: "";
  position: absolute;
  right: -0.35em;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-top: 0.35em solid transparent;
  border-bottom: 0.35em solid transparent;
  border-right: 0.4em solid currentColor;
}

#workskin .wx-call-voice-icon {
  width: 1.1em;
  height: 1.1em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  line-height: 1;
}

/* 微信高仿真视频通话呼叫/接通大卡片 */
#workskin .wx-callscreen-card {
  max-width: 22em;
  margin: 1.2em auto;
  padding: 1.8em 1.4em 1.4em 1.4em;
  background-color: #232323;
  color: #ffffff;
  border-radius: 1em;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
  text-align: center;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

#workskin .wx-callscreen-status {
  font-size: 0.78em;
  color: #95ec69;
  letter-spacing: 0.05em;
  margin-bottom: 0.4em;
}

#workskin .wx-callscreen-time {
  font-size: 1.3em;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin-bottom: 1.4em;
}

#workskin .wx-callscreen-avatar-wrap {
  position: relative;
  width: 5.2em;
  height: 5.2em;
  margin: 0 auto 1em auto;
}

#workskin .wx-callscreen-avatar {
  width: 100%;
  height: 100%;
  border-radius: 0.8em;
  background-color: #4f7cac;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8em;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

#workskin .wx-callscreen-name {
  font-size: 1.05em;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2em;
}

#workskin .wx-callscreen-actions {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 0.8em;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

#workskin .wx-callscreen-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 0.7em;
  color: #b0b0b0;
}

#workskin .wx-callscreen-btn-circle {
  width: 3.2em;
  height: 3.2em;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1em;
  margin-bottom: 0.4em;
}

#workskin .wx-callscreen-btn-hangup {
  background-color: #fa5151;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(250, 81, 81, 0.4);
}

#workskin .wx-hangup-text {
  color: #fa5151;
  font-weight: bold;
}

#workskin .wx-card-packet {
  width: 13.5em;
  border-radius: 0.4em;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-size: 0.9em;
}

#workskin .wx-redpacket-top {
  background-color: #ea5f39;
  color: #ffffff;
  padding: 0.75em 0.85em;
  display: flex;
  align-items: center;
}

#workskin .wx-redpacket-icon {
  font-size: 1.8em;
  line-height: 1;
  margin-right: 0.65em;
  flex-shrink: 0;
}

#workskin .wx-redpacket-detail {
  line-height: 1.3;
}

#workskin .wx-redpacket-desc {
  font-weight: 500;
  font-size: 0.95em;
}

#workskin .wx-redpacket-status {
  font-size: 0.72em;
  opacity: 0.85;
}

#workskin .wx-redpacket-bot {
  background-color: #ffffff;
  color: #8c8c8c;
  font-size: 0.68em;
  padding: 0.35em 0.85em;
  border: 1px solid #e0e0e0;
  border-top: none;
}

#workskin .wx-transfer-top {
  background-color: #f99c32;
  color: #ffffff;
  padding: 0.75em 0.85em;
  display: flex;
  align-items: center;
}

#workskin .wx-transfer-bot {
  background-color: #ffffff;
  color: #8c8c8c;
  font-size: 0.68em;
  padding: 0.35em 0.85em;
  border: 1px solid #e0e0e0;
  border-top: none;
}

#workskin .wx-blocked-row {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
}

#workskin .wx-error-bang {
  width: 1.25em;
  height: 1.25em;
  border-radius: 50%;
  background-color: #fa5151;
  color: #ffffff;
  font-size: 0.75em;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 0.4em;
  cursor: default;
}

#workskin .wx-blocked-prompt {
  text-align: center;
  margin: 0.7em auto;
  max-width: 88%;
}

#workskin .wx-blocked-text {
  font-size: 0.75em;
  color: #8c8c8c;
  line-height: 1.5;
}

#workskin .wx-blocked-link {
  color: #576b95;
  text-decoration: underline;
}`,
  html: `<div class="wx-container">
  <!-- 微信顶部导航栏 -->
  <div class="wx-topbar">
    <div class="wx-topbar-left">
      <span class="wx-back-arrow">‹</span>
      <span class="wx-back-count">42</span>
    </div>
    <span class="wx-chat-title">特策小组执行群 (4)</span>
    <span class="wx-chat-dots">•••</span>
  </div>

  <div class="wx-body">
    <!-- 时间戳 -->
    <div class="wx-time-stamp"><span class="wx-time-text">昨天 23:15</span></div>

    <!-- 群聊他人消息：左侧带昵称与头像 -->
    <div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-group1">楚</div><div class="wx-main"><span class="wx-nickname">楚副队</span><div class="wx-bubble wx-bubble-left">各组注意，今晚的目标行动已经开始，随时待命。</div></div></div>

    <!-- 引用回复 (Quote Reply) -->
    <div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-sender">陆</div><div class="wx-main"><span class="wx-nickname">陆顾问</span><div class="wx-bubble wx-bubble-left">我已到达南门，无人机已升空。<div class="wx-quote-box"><span class="wx-quote-sender">楚副队：</span> 各组注意，今晚的目标行动已经开始...</div></div></div></div>

    <!-- 发送图片 / 现场照片 -->
    <div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-sender">陆</div><div class="wx-main"><span class="wx-nickname">陆顾问</span><div class="wx-img-bubble"><div class="wx-img-placeholder"><span>📷 [现场地形监控图.jpg]</span><span class="wx-img-size">1.8 MB</span></div></div></div></div>

    <!-- 微信红包 -->
    <div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-group2">林</div><div class="wx-main"><span class="wx-nickname">林技术员</span><div class="wx-card-packet"><div class="wx-redpacket-top"><div class="wx-redpacket-icon">🧧</div><div class="wx-redpacket-detail"><div class="wx-redpacket-desc">大吉大利，行动顺利！</div><div class="wx-redpacket-status">领取红包</div></div></div><div class="wx-redpacket-bot">微信红包</div></div></div></div>

    <!-- 微信转账 -->
    <div class="wx-row wx-row-right"><div class="wx-avatar wx-avatar-me">我</div><div class="wx-main"><div class="wx-card-packet"><div class="wx-transfer-top"><div class="wx-redpacket-icon">💰</div><div class="wx-redpacket-detail"><div class="wx-redpacket-desc">¥ 2,000.00</div><div class="wx-redpacket-status">备用差旅活动金</div></div></div><div class="wx-transfer-bot">微信转账</div></div></div></div>

    <!-- 语音消息条 (左侧未读 + 右侧发送) -->
    <div class="wx-row wx-row-left"><div class="wx-avatar wx-avatar-sender">陆</div><div class="wx-main"><span class="wx-nickname">陆顾问</span><div class="wx-voice-row"><div class="wx-voice-bubble wx-voice-left"><span class="wx-voice-icon">(((</span><span>12''</span></div><span class="wx-voice-unread-dot"></span></div></div></div>

    <!-- 逼真视频通话气泡 (微信右侧发起，带矢量摄像机机身镜头图标) -->
    <div class="wx-row wx-row-right"><div class="wx-avatar wx-avatar-me">我</div><div class="wx-main"><div class="wx-call-bubble wx-call-right"><span>视频通话已取消</span><span class="wx-call-icon"></span></div></div></div>

    <!-- 高仿真微信视频通话接通界面/卡片 (沉浸式深色全屏呼叫) -->
    <div class="wx-callscreen-card">
      <div class="wx-callscreen-status">● 视频通话进行中</div>
      <div class="wx-callscreen-time">18:42</div>
      <div class="wx-callscreen-avatar-wrap"><div class="wx-callscreen-avatar">陆</div></div>
      <div class="wx-callscreen-name">陆顾问</div>
      <div class="wx-callscreen-actions">
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle">🎤</div><span>静音</span></div>
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle wx-callscreen-btn-hangup">✕</div><span class="wx-hangup-text">挂断</span></div>
        <div class="wx-callscreen-btn"><div class="wx-callscreen-btn-circle">🔄</div><span>翻转</span></div>
      </div>
    </div>

    <div class="wx-time-stamp"><span class="wx-time-text">今天 01:24</span></div>

    <!-- 被拉黑 / 红色惊叹号感叹号报错 -->
    <div class="wx-row wx-row-right"><div class="wx-avatar wx-avatar-me">我</div><div class="wx-main"><div class="wx-blocked-row"><div class="wx-bubble wx-bubble-right">你在哪里？为什么不接电话？</div><span class="wx-error-bang" title="消息未送达">!</span></div></div></div>

    <!-- 系统提示：拉黑防打扰拒收 -->
    <div class="wx-blocked-prompt"><div class="wx-blocked-text">消息已发出，但被对方拒收了。</div></div>

    <!-- 系统提示：删除好友需验证 -->
    <div class="wx-blocked-prompt"><div class="wx-blocked-text">开启了朋友验证，你还不是他（她）朋友。请先发送朋友验证请求，对方验证通过后，才能聊天。<span class="wx-blocked-link">发送朋友验证</span></div></div>

  </div>
</div>`
};

export const WECHAT_SKIN_CSS = WECHAT_TEMPLATE.css;
