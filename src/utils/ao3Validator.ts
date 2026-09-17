import { ValidationIssue } from '../types';

const ALLOWED_FAMILIES = [
  'background',
  'border',
  'column',
  'cue',
  'flex',
  'font', // note: font shorthand itself is banned, but properties like font-size, font-weight are allowed
  'layer-background',
  'layout-grid',
  'list-style',
  'margin',
  'marker',
  'outline',
  'overflow',
  'padding',
  'page-break',
  'pause',
  'scrollbar',
  'text',
  'transform',
  'transition',
];

const ALLOWED_SPECIFIC_PROPERTIES = new Set([
  '-replace', '-use-link-source', 'accelerator', 'accent-color', 'align-content',
  'align-items', 'align-self', 'alignment-adjust', 'alignment-baseline', 'appearance',
  'aspect-ratio', 'azimuth', 'baseline-shift', 'behavior', 'binding', 'bookmark-label',
  'bookmark-level', 'bookmark-target', 'bottom', 'box-align', 'box-direction', 'box-flex',
  'box-flex-group', 'box-lines', 'box-orient', 'box-pack', 'box-shadow', 'box-sizing',
  'caption-side', 'clear', 'clip', 'color', 'color-profile', 'color-scheme', 'content',
  'counter-increment', 'counter-reset', 'crop', 'cue', 'cue-after', 'cue-before', 'cursor',
  'direction', 'display', 'dominant-baseline', 'drop-initial-after-adjust',
  'drop-initial-after-align', 'drop-initial-before-adjust', 'drop-initial-before-align',
  'drop-initial-size', 'drop-initial-value', 'elevation', 'empty-cells', 'fill',
  'fit', 'fit-position', 'float', 'float-offset', 'font-effect', 'font-emphasize',
  'font-emphasize-position', 'font-emphasize-style', 'font-family', 'font-size',
  'font-size-adjust', 'font-smooth', 'font-stretch', 'font-style', 'font-variant',
  'font-weight', 'grid-columns', 'grid-rows', 'hanging-punctuation', 'height',
  'hyphenate-after', 'hyphenate-before', 'hyphenate-character', 'hyphenate-lines',
  'hyphenate-resource', 'hyphens', 'icon', 'image-orientation', 'image-resolution',
  'ime-mode', 'include-source', 'inline-box-align', 'justify-content', 'layout-flow',
  'left', 'letter-spacing', 'line-break', 'line-height', 'line-stacking',
  'line-stacking-ruby', 'line-stacking-shift', 'line-stacking-strategy', 'mark',
  'mark-after', 'mark-before', 'marks', 'marquee-direction', 'marquee-play-count',
  'marquee-speed', 'marquee-style', 'max-height', 'max-width', 'min-height', 'min-width',
  'move-to', 'nav-down', 'nav-index', 'nav-left', 'nav-right', 'nav-up', 'opacity',
  'order', 'orphans', 'page', 'page-policy', 'phonemes', 'pitch', 'pitch-range',
  'play-during', 'position', 'presentation-level', 'punctuation-trim', 'quotes',
  'rendering-intent', 'resize', 'rest', 'rest-after', 'rest-before', 'richness',
  'right', 'rotation', 'rotation-point', 'ruby-align', 'ruby-overhang', 'ruby-position',
  'ruby-span', 'size', 'speak', 'speak-header', 'speak-numeral', 'speak-punctuation',
  'speech-rate', 'stress', 'stroke', 'stroke-width', 'string-set', 'tab-side',
  'table-layout', 'target', 'target-name', 'target-new', 'target-position', 'top',
  'unicode-bibi', 'unicode-bidi', 'user-select', 'vertical-align', 'visibility',
  'voice-balance', 'voice-duration', 'voice-family', 'voice-pitch', 'voice-pitch-range',
  'voice-rate', 'voice-stress', 'voice-volume', 'volume', 'white-space',
  'white-space-collapse', 'widows', 'width', 'word-break', 'word-spacing', 'word-wrap',
  'writing-mode', 'z-index'
]);

export function validateAo3Css(css: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!css.trim()) {
    return issues;
  }

  // Check for @font-face
  if (/@font-face/i.test(css)) {
    issues.push({
      id: 'rule-font-face',
      type: 'error',
      title: '禁止使用 @font-face',
      message: 'AO3 出于安全原因不允许使用 @font-face 引入自定义网络字体。请使用系统安全字体（如 Georgia, Arial, Times New Roman, "PingFang SC" 等）及其 fallback 回退列表。',
      rule: 'AO3 字体规则',
      fixSuggestion: '请删除 @font-face 规则，改用 font-family 并提供通用后备字体族。',
    });
  }

  // Check for CSS comments
  if (/\/\*[\s\S]*?\*\//.test(css)) {
    issues.push({
      id: 'rule-comments',
      type: 'info',
      title: '注释将被自动移除',
      message: 'AO3 在保存 Work Skin 时会自动清空所有 CSS 注释 (/* ... */)。在本地编写时可留存，但发布到 AO3 后注释会丢失。',
      rule: 'AO3 注释规则',
    });
  }

  // Check for CSS variables / var()
  if (/var\s*\(/i.test(css) || /--[a-zA-Z0-9_-]+\s*:/i.test(css)) {
    issues.push({
      id: 'rule-css-vars',
      type: 'error',
      title: 'Work Skin 不支持 CSS 自定义变量 (var())',
      message: 'AO3 规定 CSS 变量 (--var) 和 var() 函数仅在 Site Skin (全站皮肤) 中生效，在 Work Skin (作品皮肤) 中会被忽略或失效。',
      rule: 'AO3 自定义属性规则',
      fixSuggestion: '请把 var(--xxx) 替换为直接的具体数值（例如颜色十六进制或 em 单位）。',
    });
  }

  // Parse rulesets to inspect selectors and declarations
  // Clean comments for parsing
  const strippedCss = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const rulesetRegex = /([^{]+)\{([^}]+)\}/g;
  let match;

  let ruleIndex = 0;
  while ((match = rulesetRegex.exec(strippedCss)) !== null) {
    ruleIndex++;
    const selector = match[1].trim();
    const body = match[2].trim();

    // Check selector scoping
    if (!selector.includes('#workskin') && !selector.startsWith('@')) {
      // Optional tip: AO3 prepends #workskin, but writing #workskin .class is standard best practice
      // We flag as info if not present
    }

    // Check for font shorthand in body
    const declarations = body.split(';').map(d => d.trim()).filter(Boolean);
    const seenProperties = new Map<string, number>();

    for (const decl of declarations) {
      const colonIndex = decl.indexOf(':');
      if (colonIndex === -1) continue;

      const prop = decl.substring(0, colonIndex).trim().toLowerCase();
      const val = decl.substring(colonIndex + 1).trim();

      // Check font shorthand rule: "Unfortunately, you cannot use the font shorthand in your CSS. All font properties have to be specified separately"
      if (prop === 'font') {
        issues.push({
          id: `font-shorthand-${ruleIndex}`,
          type: 'error',
          title: `禁止使用 font 简写属性（选择器: ${selector}）`,
          message: `AO3 明确禁止使用简写 "font: ..."！所有字体属性必须拆开单列，例如 font-size: 1.1em; font-weight: bold; font-family: Cambria, Georgia, serif; line-height: 1.6;`,
          rule: 'AO3 Font 简写规则',
          fixSuggestion: '将 font 拆解为 font-size、font-family、font-weight、line-height 等独立属性。',
        });
      }

      // Check duplicate property within the SAME ruleset
      // "The CSS parser we use retains only one declaration for each property... split each one into its own ruleset"
      const count = seenProperties.get(prop) || 0;
      seenProperties.set(prop, count + 1);

      // Check gap property specifically
      if (prop === 'gap' || prop.endsWith('-gap') || prop.includes('gap')) {
        issues.push({
          id: `banned-gap-${ruleIndex}`,
          type: 'error',
          title: `禁止使用 ${prop} 属性（选择器: ${selector}）`,
          message: `AO3 严格禁止 CSS 中的 "${prop}" 属性！提交时 AO3 会直接拒绝保存并报错：“Sorry! We couldn't save this skin because: We don't currently allow the CSS property ${prop}”。`,
          rule: 'AO3 禁止 gap 属性规则',
          fixSuggestion: '请删除 gap 声明，改在子元素上使用 margin（如 margin-right 或 margin-bottom）或 padding 控制间距。',
        });
        continue;
      }

      // Check object-fit / object-position specifically
      if (prop === 'object-fit' || prop === 'object-position') {
        issues.push({
          id: `banned-object-fit-${ruleIndex}`,
          type: 'error',
          title: `禁止使用 ${prop} 属性（选择器: ${selector}）`,
          message: `AO3 严格禁止 CSS 中的 "${prop}" 属性！提交时 AO3 会报错：“Sorry! We couldn't save this skin because: We don't currently allow the CSS property ${prop}”。`,
          rule: 'AO3 禁止 object-fit 属性规则',
          fixSuggestion: '请删除该属性。在包含头像或图片的父容器设置固定的宽高与 overflow: hidden，子元素 img 设置 width: 100%; height: 100% 即可实现等比自适应遮罩。',
        });
        continue;
      }

      // Check for disallowed CSS functions (calc, clamp, color-mix, attr)
      const funcMatch = val.match(/\b(calc|clamp|color-mix|attr)\s*\(/i);
      if (funcMatch) {
        issues.push({
          id: `banned-func-${funcMatch[1]}-${ruleIndex}`,
          type: 'error',
          title: `禁止使用 ${funcMatch[1]}() 函数（选择器: ${selector}）`,
          message: `AO3 Work Skin 解析器不支持 ${funcMatch[1]}() 等动态函数，会导致皮肤保存失败。`,
          rule: 'AO3 属性值白名单规则',
          fixSuggestion: '请将计算表达式替换为固定的数值或颜色值（如 em、px、rem、百分比或十六进制色值）。',
        });
      }

      // Check if property is allowed
      const isAllowed = isPropertyAllowedInAo3(prop);
      if (!isAllowed) {
        issues.push({
          id: `disallowed-prop-${prop}-${ruleIndex}`,
          type: 'error',
          title: `AO3 不允许的 CSS 属性 "${prop}"（选择器: ${selector}）`,
          message: `AO3 Work Skin 严格执行属性白名单。遇到未许可属性时，AO3 会报错：“Sorry! We couldn't save this skin because: We don't currently allow the CSS property ${prop}” 并阻止保存。`,
          rule: 'AO3 属性白名单规则',
          fixSuggestion: `请移除 "${prop}" 属性，或使用受支持的标准 CSS 属性替代。`,
        });
      }

      // Check image format in url()
      const urlMatch = val.match(/url\s*\(([^)]+)\)/i);
      if (urlMatch) {
        const rawUrl = urlMatch[1].replace(/['"]/g, '').trim();
        const extMatch = rawUrl.match(/\.(jpg|jpeg|png|gif)(\?.*)?$/i);
        if (!extMatch && !rawUrl.startsWith('data:')) {
          issues.push({
            id: `url-format-${ruleIndex}`,
            type: 'warning',
            title: `图片 URL 格式需注意（${prop}）`,
            message: 'AO3 仅支持 JPG、GIF 和 PNG 格式的外链图片。此外，包含外部图片的 Work Skin 无法申请公开皮肤。',
            rule: 'AO3 图片外链规则',
          });
        }
      }
    }

    // Report duplicates in this ruleset
    for (const [prop, count] of seenProperties.entries()) {
      if (count > 1) {
        issues.push({
          id: `duplicate-prop-${prop}-${ruleIndex}`,
          type: 'warning',
          title: `单条规则集中多次定义了 "${prop}"（选择器: ${selector}）`,
          message: `AO3 解析器对同一规则集中的同名属性只会保留【最后一条】，前面的会被全部丢弃！如果你是写浏览器前缀（如 -webkit- / -moz-）或渐变回退，请拆分成多条独立的规则集，例如：\n${selector} { ${prop}: 方案1; }\n${selector} { ${prop}: 方案2; }`,
          rule: 'AO3 单条规则单属性声明机制',
          fixSuggestion: '将同名属性声明拆分为多个同选择器的规则集。',
        });
      }
    }
  }

  return issues;
}

function isPropertyAllowedInAo3(prop: string): boolean {
  // AO3 strictly forbids gap, object-fit, object-position
  if (prop === 'gap' || prop.includes('gap') || prop.startsWith('object-')) {
    return false;
  }

  if (ALLOWED_SPECIFIC_PROPERTIES.has(prop)) {
    return true;
  }

  // Check prefix or variation in allowed families
  for (const family of ALLOWED_FAMILIES) {
    if (prop === family || prop.startsWith(`${family}-`)) {
      return true;
    }
  }

  // Also vendor prefixes of allowed ones
  if (prop.startsWith('-webkit-') || prop.startsWith('-moz-') || prop.startsWith('-ms-') || prop.startsWith('-o-')) {
    const unprefix = prop.replace(/^-(webkit|moz|ms|o)-/, '');
    if (ALLOWED_SPECIFIC_PROPERTIES.has(unprefix)) return true;
    for (const family of ALLOWED_FAMILIES) {
      if (unprefix === family || unprefix.startsWith(`${family}-`)) return true;
    }
  }

  return false;
}
