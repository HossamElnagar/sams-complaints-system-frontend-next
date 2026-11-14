'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CheckCircleIcon } from '@/components/ui/icons';

interface TicketSuccessProps {
  ticketNumber: string;
  status: string;
  onReset: () => void;
}

export function TicketSuccess({ ticketNumber, status, onReset }: TicketSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    void navigator.clipboard.writeText(ticketNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white dark:bg-[#0c1c30] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircleIcon className="w-8 h-8" />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        تم استلام الشكوى بنجاح
      </h3>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
        تم تسجيل شكواك لدى الإدارة المركزية وتوليد رقم التتبع المرجعي الموحد. يرجى الاحتفاظ بالرقم لمتابعة مسار معالجة الشكوى.
      </p>

      {/* Ticket Number Card */}
      <div className="bg-slate-50 dark:bg-slate-900/90 border-2 border-dashed border-[#c59b27] rounded-xl p-5 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              رقم الشكوى المرجعي
            </span>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
              {status}
            </span>
          </div>
          <div className="text-2xl font-mono font-bold text-[#0a2240] dark:text-[#dfb136] tracking-wider" dir="ltr">
            {ticketNumber}
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-2"
        >
          {copied ? 'تم النسخ!' : 'نسخ الرقم'}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href={`/tickets/track?ticketNumber=${encodeURIComponent(ticketNumber)}`}
          className="px-6 py-3 font-semibold text-white bg-[#1b497e] hover:bg-[#12335c] rounded-xl shadow-md transition-all text-center"
        >
          متابعة حالة الشكوى الآن
        </Link>
        <button
          onClick={onReset}
          className="px-6 py-3 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
        >
          تقديم شكوى جديدة
        </button>
      </div>
    </div>
  );
}
