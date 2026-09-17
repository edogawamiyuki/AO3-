import React from 'react';
import { ValidationIssue } from '../types';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ValidationPanelProps {
  issues: ValidationIssue[];
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({ issues }) => {
  const errors = issues.filter(i => i.type === 'error');
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');

  const isAllValid = errors.length === 0 && warnings.length === 0;

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-4 flex flex-col gap-3">
      {/* Status Bar */}
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div className="flex items-center gap-2">
          {isAllValid ? (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>100% 符合 AO3 Work Skin 规范</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>检测到 {errors.length} 处错误 / {warnings.length} 项警告</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            错误: {errors.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            警告: {warnings.length}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />
            提示: {infos.length}
          </span>
        </div>
      </div>

      {/* Rules summary quick pill */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
        <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 text-stone-600">
          <div className="font-semibold text-stone-800">🚫 严禁 font 简写</div>
          <div>必须拆分 font-size / font-family 等</div>
        </div>
        <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 text-stone-600">
          <div className="font-semibold text-stone-800">🚫 严禁 @font-face</div>
          <div>只能使用操作系统本地及安全字体</div>
        </div>
        <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 text-stone-600">
          <div className="font-semibold text-stone-800">⚠️ 同规则同属性单值</div>
          <div>同块写多次只保留最后一条（需拆多块）</div>
        </div>
        <div className="bg-stone-50 p-2 rounded-lg border border-stone-100 text-stone-600">
          <div className="font-semibold text-stone-800">⚠️ 变量仅限站点皮肤</div>
          <div>var() 在 Work Skin 中完全无效</div>
        </div>
      </div>

      {/* Issues list */}
      {issues.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {issues.map(issue => (
            <div
              key={issue.id}
              className={`p-2.5 rounded-lg border text-xs flex gap-2.5 items-start ${
                issue.type === 'error'
                  ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                  : issue.type === 'warning'
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-blue-50/70 border-blue-200 text-blue-900'
              }`}
            >
              {issue.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : issue.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-semibold flex items-center gap-2">
                  <span>{issue.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/70 border border-current font-normal opacity-80">
                    {issue.rule}
                  </span>
                </div>
                <p className="mt-1 leading-relaxed opacity-90">{issue.message}</p>
                {issue.fixSuggestion && (
                  <div className="mt-1.5 p-1.5 rounded bg-white/80 border border-current font-mono text-[11px] text-stone-800">
                    💡 修复建议: {issue.fixSuggestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-2 text-center text-xs text-stone-500 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>当前 CSS 代码语法完全符合 AO3 审核与解析器标准，可安全保存至 Work Skin。</span>
        </div>
      )}
    </div>
  );
};
