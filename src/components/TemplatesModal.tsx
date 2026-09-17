import React from 'react';
import { WorkTemplate } from '../types';
import { AO3_TEMPLATES } from '../utils/presets';
import { X, Sparkles, Check, ArrowRight } from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: WorkTemplate) => void;
  activeTemplateId?: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  activeTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-lg text-stone-900">
              AO3 经典同人排版模板库
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-stone-500">
            精选经过 100% AO3 语法与属性白名单检验的常用排版样式。点击即可一键载入到左侧编辑器并即时预览。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AO3_TEMPLATES.map(tmpl => {
              const isSelected = activeTemplateId === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                    isSelected
                      ? 'border-rose-700 bg-rose-50/40 ring-1 ring-rose-700'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {tmpl.tag}
                      </span>
                      {isSelected && (
                        <span className="text-[11px] font-medium text-rose-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> 已加载
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-stone-900 text-sm mb-1">
                      {tmpl.title}
                    </h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-rose-800 font-medium">
                    <span>应用此模板</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-100 transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};
