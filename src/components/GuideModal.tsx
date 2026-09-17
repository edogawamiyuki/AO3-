import React from 'react';
import { X, BookOpen, ExternalLink, Check, AlertTriangle } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-rose-800" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              AO3 Work Skin (作品皮肤) 使用全指南
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-stone-700 leading-relaxed">
          {/* Step 1 */}
          <div className="space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs">
                1
              </span>
              在 AO3 中创建 Work Skin
            </div>
            <p className="text-stone-600 pl-7">
              登录 AO3，点击右上角个人主页菜单 <code>Hi, [用户名]</code> →{' '}
              <code>My Dashboard (个人控制面板)</code> → 左侧侧边栏{' '}
              <code>Skins (皮肤)</code> → 点击右上角 <code>Create Skin (创建皮肤)</code> → 选择{' '}
              <strong className="text-rose-900">Work Skin (作品皮肤)</strong>。
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs">
                2
              </span>
              填写皮肤名称与 CSS 代码
            </div>
            <p className="text-stone-600 pl-7">
              给皮肤起一个英文或字母标题（如 <code>Chat Skin Chapter 1</code>）。
              在 <code>CSS</code> 输入框中，粘贴在下方编辑器中生成的 CSS 代码。然后点击{' '}
              <code>Submit (提交)</code> 保存。
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs">
                3
              </span>
              在文章发布页关联该皮肤
            </div>
            <p className="text-stone-600 pl-7">
              在发布新文章（<code>Post New Work</code>）或编辑已有章节时，找到中间的{' '}
              <strong>Associations (关联项)</strong> 部分，在 <code>Select Work Skin</code>{' '}
              下拉框中选中刚才创建的皮肤名称。
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2">
            <div className="font-bold text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-800 text-white flex items-center justify-center text-xs">
                4
              </span>
              在正文中以 HTML 模式粘贴内容
            </div>
            <p className="text-stone-600 pl-7">
              在正文输入框顶部，确保点击切换为 <strong className="text-rose-900">HTML</strong> 按钮（
              <span className="text-amber-700">千万不要用 Rich Text 富文本模式，否则 AO3 会吞掉自定义的 class 和 div 结构</span>
              ）。把带有 class 类名的正文 HTML 粘贴进去即可！
            </p>
          </div>

          {/* AO3 Key Traps and Rules */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>AO3 CSS 核心限制与易踩坑点速记</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-amber-900">
              <li>
                <strong>严禁使用 gap 与 object-fit 属性:</strong> AO3 皮肤白名单彻底拒绝 <code>gap</code>（包括 <code>row-gap</code>、<code>column-gap</code>）以及 <code>object-fit</code>、<code>object-position</code> 和 <code>calc()</code> 函数，否则会报错 <em>"We don't currently allow the CSS property object-fit / gap"</em> 导致无法保存。图片等比裁剪请使用包含盒的 <code>overflow: hidden</code> 结合 <code>width: 100%; height: 100%</code>。
              </li>
              <li>
                <strong>禁用简写 font:</strong> 必须拆成 <code>font-size</code>、<code>font-family</code>、<code>font-weight</code> 等，写 <code>font: 14px Arial;</code> 会被直接滤除。
              </li>
              <li>
                <strong>同规则同属性只留最后一条:</strong> AO3 解析器在单个花括号 <code>{`{ ... }`}</code> 内对于同名属性（如不同的浏览器渐变前缀）只保留最后一条。若要写渐变前缀，必须拆成多个独立的规则集。
              </li>
              <li>
                <strong>禁用 @font-face:</strong> 无法在线加载 Google Fonts 等网络字体，只支持访问读者本地安装的字体（务必设置 Arial, Georgia, "PingFang SC" 等后备字体）。
              </li>
              <li>
                <strong>不支持 CSS 变量:</strong> <code>var(--color)</code> 仅能在全站皮肤 (Site Skin) 生效，在作品皮肤 (Work Skin) 中无效。
              </li>
              <li>
                <strong>选择器加 #workskin 前缀:</strong> AO3 会自动把你的 CSS 挂在 <code>#workskin</code> 容器下，推荐类名统一写成 <code>#workskin .your-class</code> 以保证权重与隔离。
              </li>
              <li>
                <strong>注释被清空:</strong> 保存后所有 <code>/* 注释 */</code> 会被自动剥离，无需保留过多注释。
              </li>
              <li>
                <strong>严禁内联 style 属性:</strong> AO3 会无情剔除所有 <code>style="..."</code> 属性！所有头像、间距、字体色彩必须使用 CSS 类名配合皮肤生效。
              </li>
              <li>
                <strong>AO3 自动注入 &lt;p&gt; 与 &lt;br&gt;:</strong> AO3 解析器在保存文章时会在 HTML 每行空隙强行塞入 <code>&lt;p&gt;</code> 标签导致布局错位。本工具已通过 <code>display: contents !important</code> 防御规则与紧凑代码彻底化解该问题，使 AO3 最终展示效果与实时预览 100% 吻合。
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-stone-800 text-white text-xs font-medium hover:bg-stone-900 transition-colors"
          >
            我知道了，返回排版
          </button>
        </div>
      </div>
    </div>
  );
};
