import { WorkTemplate } from '../types';
import { WECHAT_TEMPLATE } from './wechatPreset';

export const AO3_TEMPLATES: WorkTemplate[] = [
  WECHAT_TEMPLATE,
  {
    id: 'sms-chat',
    title: '手机短信与聊天气泡 (Chat & SMS)',
    tag: '通讯录 / 对话体',
    description: '最受欢迎的 AO3 互动格式。包含左右气泡区分、发件人名字、时间戳以及未读指示，自适应手机与电脑屏幕。',
    css: `#workskin .chat-wrapper {
  max-width: 24em;
  margin: 1.5em auto;
  padding: 1.2em 1em;
  background-color: #f7f7f9;
  border: 1px solid #e1e4e8;
  border-radius: 1em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 0.95em;
  line-height: 1.4;
}

#workskin .chat-header {
  text-align: center;
  font-weight: bold;
  color: #555555;
  margin-bottom: 1em;
  padding-bottom: 0.5em;
  border-bottom: 1px dashed #d0d7de;
}

#workskin .chat-time {
  text-align: center;
  font-size: 0.75em;
  color: #8c959f;
  margin: 0.8em 0;
}

#workskin .chat-row-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 0.8em;
}

#workskin .chat-row-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-bottom: 0.8em;
}

#workskin .chat-sender {
  font-size: 0.75em;
  color: #6e7781;
  margin-bottom: 0.2em;
  padding: 0 0.5em;
}

#workskin .chat-bubble-left {
  max-width: 75%;
  background-color: #ffffff;
  color: #24292f;
  border: 1px solid #d0d7de;
  border-radius: 1em 1em 1em 0.2em;
  padding: 0.6em 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  word-break: break-word;
}

#workskin .chat-bubble-right {
  max-width: 75%;
  background-color: #0969da;
  color: #ffffff;
  border-radius: 1em 1em 0.2em 1em;
  padding: 0.6em 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}`,
    html: `<div class="chat-wrapper">
  <div class="chat-header">与 [联系人姓名] 的对话</div>
  <div class="chat-time">今天 21:42</div>

  <div class="chat-row-left">
    <span class="chat-sender">对方</span>
    <div class="chat-bubble-left">
      你今晚有空吗？我们之前聊到的那件事，需要尽快做个决定。
    </div>
  </div>

  <div class="chat-row-right">
    <div class="chat-bubble-right">
      我刚结束手头的事情。半小时后老地方见？
    </div>
  </div>

  <div class="chat-row-left">
    <span class="chat-sender">对方</span>
    <div class="chat-bubble-left">
      好，路上注意安全，我把资料带过去。
    </div>
  </div>
</div>`
  },
  {
    id: 'epistolary-letter',
    title: '古典书信与手账便签 (Epistolary Letter)',
    tag: '书信 / 日记',
    description: '复古泛黄羊皮纸质感、优雅衬线体、信头日期、倾斜落款与轻微内陷阴影，适合长信、日记或回忆录片段。',
    css: `#workskin .letter-paper {
  max-width: 32em;
  margin: 2em auto;
  padding: 2.2em 2.5em;
  background-color: #fcf9f2;
  border: 1px solid #e2dac9;
  box-shadow: 2px 3px 10px rgba(70, 50, 30, 0.08);
  border-radius: 0.3em;
  font-family: Georgia, "Songti SC", "SimSun", "Times New Roman", serif;
  color: #3b3228;
  line-height: 1.75;
  font-size: 1.05em;
}

#workskin .letter-date {
  text-align: right;
  font-style: italic;
  color: #7d6e5d;
  margin-bottom: 1.5em;
  font-size: 0.9em;
}

#workskin .letter-salutation {
  font-weight: bold;
  margin-bottom: 1em;
  display: block;
}

#workskin .letter-body {
  text-indent: 2em;
  margin-bottom: 1.2em;
}

#workskin .letter-sign {
  text-align: right;
  margin-top: 2em;
  font-style: italic;
  color: #534538;
}`,
    html: `<div class="letter-paper">
  <div class="letter-date">秋月十七日 夜</div>
  <span class="letter-salutation">见字如晤：</span>
  
  <p class="letter-body">
    展信舒颜。收到此信时，想必你已抵步南城。北地的初霜来得比往年更早些，案头的墨砚冻了三回，唯有炉火旁尚存微温。
  </p>
  <p class="letter-body">
    昔年约定的事，我未曾有一日相忘。待到春风融雪之时，且候君归。
  </p>

  <div class="letter-sign">
    —— 执笔人 谨上
  </div>
</div>`
  },
  {
    id: 'social-tweet',
    title: '社交网络动态贴文 (Social Feed / Tweet)',
    tag: '现代论坛 / 推特',
    description: '高度仿真的社交平台帖子排版，包含用户头像占位、认证角标、发布时间、转发与点赞计量器。',
    css: `#workskin .tweet-box {
  max-width: 28em;
  margin: 1.5em auto;
  padding: 1.2em 1.4em;
  border: 1px solid #cfd9de;
  border-radius: 0.9em;
  background-color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f1419;
  font-size: 0.95em;
}

#workskin .tweet-author-row {
  display: flex;
  align-items: center;
  margin-bottom: 0.8em;
}

#workskin .tweet-avatar {
  width: 2.6em;
  height: 2.6em;
  border-radius: 50%;
  background-color: #536471;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.9em;
  margin-right: 0.75em;
  flex-shrink: 0;
}

#workskin .tweet-names {
  line-height: 1.25;
}

#workskin .tweet-display-name {
  font-weight: bold;
  color: #0f1419;
}

#workskin .tweet-handle {
  color: #536471;
  font-size: 0.88em;
}

#workskin .tweet-content {
  line-height: 1.5;
  margin-bottom: 1em;
  word-break: break-word;
}

#workskin .tweet-metrics {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #eff3f4;
  padding-top: 0.6em;
  color: #536471;
  font-size: 0.82em;
}`,
    html: `<div class="tweet-box">
  <div class="tweet-author-row">
    <div class="tweet-avatar">★</div>
    <div class="tweet-names">
      <div class="tweet-display-name">官方通告频道 ✔</div>
      <div class="tweet-handle">@OfficialNotice • 10分钟前</div>
    </div>
  </div>

  <div class="tweet-content">
    【突发公告】全城能源系统目前正在进行紧急协同检修，预计将在未来两小时内恢复平稳供应。请市民不必恐慌，安心留在家中。
  </div>

  <div class="tweet-metrics">
    <span>💬 1,420 评论</span>
    <span>🔁 8,912 转发</span>
    <span>❤️ 3.5万 喜欢</span>
  </div>
</div>`
  },
  {
    id: 'sci-fi-terminal',
    title: '系统终端与科幻日志 (System Log / Terminal)',
    tag: '科幻 / 游戏系统',
    description: '全息绿/深黑底色、等宽字体、边框荧光与状态指示标签，适合 RPG 猎杀日志、AI 对白或星际飞船黑匣子。',
    css: `#workskin .terminal-card {
  max-width: 30em;
  margin: 1.8em auto;
  padding: 1.2em 1.5em;
  background-color: #0d1117;
  border: 1px solid #30363d;
  border-radius: 0.5em;
  color: #58a6ff;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
  font-size: 0.9em;
  line-height: 1.55;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

#workskin .terminal-header {
  color: #8b949e;
  border-bottom: 1px solid #21262d;
  padding-bottom: 0.5em;
  margin-bottom: 1em;
  font-size: 0.82em;
}

#workskin .terminal-prompt {
  color: #7ee787;
  font-weight: bold;
}

#workskin .terminal-warning {
  color: #f0883e;
  margin: 0.5em 0;
  padding: 0.4em 0.8em;
  background-color: rgba(240, 136, 62, 0.1);
  border-left: 3px solid #f0883e;
}

#workskin .terminal-success {
  color: #3fb950;
}`,
    html: `<div class="terminal-card">
  <div class="terminal-header">[LOG ARCHIVE // SECTOR-07] STATUS: ACTIVE</div>
  <p><span class="terminal-prompt">&gt; scan_environment --deep</span></p>
  <p>正在读取生物反应信号……</p>
  
  <div class="terminal-warning">
    [警告] 侦测到未授权神经连接，波段匹配度 98.7%！
  </div>

  <p><span class="terminal-prompt">&gt; bypass_override --force</span></p>
  <p class="terminal-success">[指令执行] 安全防火墙已解除。祝你好运，指挥官。</p>
</div>`
  },
  {
    id: 'newspaper-clip',
    title: '报纸专栏与公告头条 (Vintage Newspaper)',
    tag: '报刊 / 文档',
    description: '报纸双栏排版、醒目黑体标题、复古分割线与引言框，适合魔幻报刊（如预言家日报）或民国/架空新闻剪报。',
    css: `#workskin .newspaper-wrap {
  max-width: 32em;
  margin: 2em auto;
  padding: 1.6em 1.8em;
  background-color: #fdfbf7;
  border: 2px solid #2b2b2b;
  font-family: "Times New Roman", Times, "Songti SC", serif;
  color: #1a1a1a;
  line-height: 1.5;
}

#workskin .newspaper-title {
  text-align: center;
  font-size: 1.8em;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border-bottom: 3px double #2b2b2b;
  padding-bottom: 0.25em;
  margin-bottom: 0.5em;
}

#workskin .newspaper-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8em;
  color: #555555;
  border-bottom: 1px solid #777777;
  padding-bottom: 0.3em;
  margin-bottom: 1.2em;
}

#workskin .newspaper-headline {
  text-align: center;
  font-size: 1.2em;
  font-weight: bold;
  margin: 0.8em 0;
  line-height: 1.3;
}

#workskin .newspaper-columns {
  column-count: 2;
  text-align: justify;
  font-size: 0.9em;
}`,
    html: `<div class="newspaper-wrap">
  <div class="newspaper-title">晨 曦 日 报</div>
  <div class="newspaper-meta">
    <span>第 104 卷 • 第 88 期</span>
    <span>特别快讯版</span>
  </div>

  <div class="newspaper-headline">昨夜突发罕见流星群<br>天文学会称数十年来未见</div>

  <div class="newspaper-columns">
    据本报记者自现场发来的电报，昨日半夜子时，城东方向天空突现密集光痕，持续时间近半个时辰。
    众多市民走出寓所驻足仰望，数个观测站的数据记录均显示异常。官方表示目前暂无异动报道，提醒各界市民保持理性，勿听信街头谣言。
  </div>
</div>`
  }
];
