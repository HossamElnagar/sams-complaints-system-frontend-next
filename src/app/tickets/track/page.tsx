'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchTicketByNumber, TicketDetails } from '@/features/tickets/lib/ticket-api';
import { AiAdvisoryCard } from '@/features/tickets/components/ai-advisory-card';

function TrackTicketContent() {
  const searchParams = useSearchParams();
  const queryTicketNumber = searchParams.get('ticketNumber') || '';

  const [ticketNumber, setTicketNumber] = useState(queryTicketNumber);
  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    if (queryTicketNumber) {
      fetchTicketByNumber(queryTicketNumber.trim())
        .then((data) => {
          if (!ignore) {
            setTicket(data);
            setError('');
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            const message = err instanceof Error ? err.message : 'لم يتم العثور على شكوى مسجلة بهذا الرقم.';
            setError(message);
            setTicket(null);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [queryTicketNumber]);

  const handleManualSearch = async (numToSearch: string) => {
    const trimmed = numToSearch.trim();
    if (!trimmed) {
      setError('يرجى إدخال رقم الشكوى');
      return;
    }

    setIsLoading(true);
    setError('');
    setTicket(null);

    try {
      const data = await fetchTicketByNumber(trimmed);
      setTicket(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'لم يتم العثور على شكوى مسجلة بهذا الرقم. يرجى التأكد من الرمز.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'تم الحل':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';
      case 'قيد المعالجة':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'مرفوضة':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300';
    }
  };

  return (
    <div className="py-12 lg:py-16 bg-slate-50 dark:bg-[#06111f] min-h-[calc(100vh-80px)]">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/40 text-[#a47f1c] dark:text-[#dfb136] text-xs font-bold mb-3">
            استعلام وتتبع إلكتروني
          </div>
          <h1 className="text-3xl font-extrabold text-[#0a2240] dark:text-slate-100 mb-2">
            متابعة مسار الشكوى
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            أدخل الرقم المرجعي الموحد الذي استلمته عند تقديم الشكوى (مثال: TCK-A1B2C3D4E5)
          </p>
        </div>

        {/* Search Input Box */}
        <div className="bg-white dark:bg-[#0c1c30] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleManualSearch(ticketNumber);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <input
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="اكتب رقم الشكوى هنا (مثال: TCK-...)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27] font-mono"
              dir="ltr"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'جاري البحث...' : 'استعلام'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}
        </div>

        {/* Ticket Details Result */}
        {ticket && (
          <div className="bg-white dark:bg-[#0c1c30] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 mb-6">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">
                  رقم الشكوى
                </span>
                <h3 className="text-xl sm:text-2xl font-mono font-bold text-[#0a2240] dark:text-[#dfb136]" dir="ltr">
                  {ticket.ticketNumber}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs">
              <div>
                <span className="block text-slate-400 mb-0.5">الفرع</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.branch || 'غير محدد'}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">التصنيف</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.category}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">الأولوية</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{ticket.priority}</span>
              </div>
              <div>
                <span className="block text-slate-400 mb-0.5">تاريخ التقديم</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>

            {/* Subject & Description */}
            <div className="mb-8">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
                {ticket.subject}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-50/60 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                {ticket.description}
              </p>
            </div>

            {/* AI Advisory Analysis Card */}
            {ticket.aiAnalysis && (
              <div className="mb-8">
                <AiAdvisoryCard analysis={ticket.aiAnalysis} />
              </div>
            )}

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c59b27]" />
                سجل مراحل المتابعة والقرارات
              </h4>

              {ticket.timeline && ticket.timeline.length > 0 ? (
                <div className="space-y-4 border-r-2 border-slate-200 dark:border-slate-800 pr-4 mr-2">
                  {ticket.timeline.map((entry: { action: string; note?: string; timestamp: string }, idx: number) => (
                    <div key={idx} className="relative">
                      <div className="absolute -right-[23px] top-1 w-3 h-3 rounded-full bg-[#c59b27] ring-4 ring-white dark:ring-[#0c1c30]" />
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {entry.action}
                      </div>
                      {entry.note && (
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                          {entry.note}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 mt-1">
                        {new Date(entry.timestamp).toLocaleString('ar-EG')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  الشكوى قيد المراجعة والفحص الإداري الأولي.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/" className="text-sm font-semibold text-[#1b497e] dark:text-[#dfb136] hover:underline">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">جاري التحميل...</div>}>
      <TrackTicketContent />
    </Suspense>
  );
}
