import React from 'react';
import {
  CompassIcon,
  FileCheckIcon,
  AlertTriangleIcon,
  ClockIcon,
} from '@/components/ui/icons';

export interface AiAnalysisData {
  summary?: string;
  recommendedBranch?: string;
  recommendedDepartment?: string;
  confidence?: number;
  analyzedAt?: string;
}

interface AiAdvisoryCardProps {
  analysis?: AiAnalysisData;
}

export function AiAdvisoryCard({ analysis }: AiAdvisoryCardProps) {
  if (!analysis || (!analysis.summary && !analysis.recommendedBranch)) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-center">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
          <ClockIcon className="w-4 h-4 text-slate-400 animate-spin" />
          <span>تحليل التوجيه الاستشاري الذكي قيد المعالجة عبر نماذج PyTorch...</span>
        </div>
      </div>
    );
  }

  const confidenceScore = analysis.confidence ?? 0;
  const confidencePercent = Math.round(confidenceScore * 100);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.85) return 'bg-emerald-500';
    if (score >= 0.7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="rounded-2xl border border-[#c59b27]/40 bg-white dark:bg-[#0c1c30] p-6 shadow-md relative overflow-hidden">
      {/* Decorative top accent badge */}
      <div className="absolute top-0 right-0 bg-gradient-to-l from-[#c59b27] to-[#0a2240] h-1.5 w-full" />

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#c59b27]/15 flex items-center justify-center">
            <CompassIcon className="w-5 h-5 text-[#c59b27]" />
          </div>
          <div>
            <h4 className="font-bold text-base text-[#0a2240] dark:text-slate-100">
              بطاقة التوجيه والتحليل الاستشاري
            </h4>
            <span className="text-xs text-[#c59b27] font-medium">
              النماذج الاستشارية (Arabic Summarizer & Routing Classifier)
            </span>
          </div>
        </div>

        {analysis.analyzedAt && (
          <span className="text-[11px] text-slate-400">
            تم التحليل: {new Date(analysis.analyzedAt).toLocaleDateString('ar-EG')}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Model 1: Summary */}
        {analysis.summary && (
          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <FileCheckIcon className="w-4 h-4 text-[#c59b27]" />
              <span>الموجز الاستشاري لمحتوى الشكوى (Model 1):</span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/80 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 leading-relaxed">
              {analysis.summary}
            </p>
          </div>
        )}

        {/* Model 2: Routing Prediction */}
        {(analysis.recommendedBranch || analysis.recommendedDepartment) && (
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
              <CompassIcon className="w-4 h-4 text-[#1b497e] dark:text-blue-400" />
              <span>توصية جهة الاختصاص المقترحة (Model 2):</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">الفرع الموصى به:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {analysis.recommendedBranch || 'غير محدد'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">القسم / الإدارة المقترحة:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {analysis.recommendedDepartment || 'غير محدد'}
                </span>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  مستوى ثقة التنبؤ:
                </span>
                <span className="font-bold font-mono text-slate-800 dark:text-slate-200" dir="ltr">
                  {confidencePercent}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getConfidenceColor(confidenceScore)}`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Advisory Warning Banner - Standard 4 Strict Requirement */}
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
          <AlertTriangleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>تنبيه إداري استشاري:</strong> مخرجات الذكاء الاصطناعي استشارية واسترشادية فقط ولا تملك أي سلطة تقريرية أو توجيه تلقائي. القرار النهائي يعود حصراً لرئيسة الإدارة المركزية وموظفي الأقسام المختصة.
          </p>
        </div>
      </div>
    </div>
  );
}
