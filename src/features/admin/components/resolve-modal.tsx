'use client';

import React, { useState } from 'react';
import { AdminTicket, resolveTicket, ResolvePayload } from '../lib/admin-api';
import { CloseIcon } from '@/components/ui/icons';

interface ResolveModalProps {
  ticket: AdminTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}

export function ResolveModal({
  ticket,
  isOpen,
  onClose,
  onSuccess,
  token,
}: ResolveModalProps) {
  const [resolutionStatus, setResolutionStatus] = useState<'تم الحل' | 'مرفوضة'>('تم الحل');
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (justification.trim().length < 10) {
      setError('يجب كتابة مبرر أو حيثيات قرار لا تقل عن 10 أحرف.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const payload: ResolvePayload = {
        status: resolutionStatus,
        justification: justification.trim(),
      };

      await resolveTicket(token, ticket._id, payload);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل تسجيل القرار';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 animate-in fade-in duration-200 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className={`w-3.5 h-3.5 rounded-full ${resolutionStatus === 'تم الحل' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              البت الإداري في الشكوى
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Ticket Summary */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm space-y-1.5">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>رقم الشكوى: #{ticket.ticketNumber || ticket._id}</span>
            <span className="text-[#c59b27] font-bold">{ticket.category}</span>
          </div>
          <p className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
            {ticket.title}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            مقدم الشكوى: {ticket.studentName} ({ticket.studentId})
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Decision Type */}
          <div>
            <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">
              قرار البت النهائي:
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResolutionStatus('تم الحل')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  resolutionStatus === 'تم الحل'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                تم الحل والمعالجة
              </button>

              <button
                type="button"
                onClick={() => setResolutionStatus('مرفوضة')}
                className={`py-3 px-4 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  resolutionStatus === 'مرفوضة'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
                رفض الشكوى
              </button>
            </div>
          </div>

          {/* Written Justification (Mandatory) */}
          <div>
            <label htmlFor="resolution-justification" className="block text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
              حيثيات ومبررات القرار الإداري (إلزامي - 10 أحرف كحد أدنى):
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              سيتم إدراج هذا القرار مع اسم الموظف والتوقيت في السجل الزمني التوثيقي للطالب.
            </p>
            <textarea
              id="resolution-justification"
              required
              rows={4}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder={
                resolutionStatus === 'تم الحل'
                  ? 'يرجى توضيح الإجراءات التنفيذية التي اتخذتها الكلية أو الإدارة لمعالجة شكوى الطالب...'
                  : 'يرجى توضيح السند اللائحي أو الأسباب الإدارية التي أدت لرفض الطلب...'
              }
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27] text-sm leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>الحد الأدنى: 10 أحرف</span>
              <span className={justification.length >= 10 ? 'text-emerald-500 font-bold' : 'text-amber-500'}>
                {justification.length} حرف
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-1/3 py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || justification.trim().length < 10}
              className={`w-2/3 py-2.5 px-4 font-bold text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 ${
                resolutionStatus === 'تم الحل'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'اعتماد القرار رسمياً'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
