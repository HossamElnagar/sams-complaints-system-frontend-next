'use client';

import React, { useState } from 'react';
import { submitTicket, TicketResponse } from '../lib/ticket-api';
import { TicketSuccess } from './ticket-success';

const BRANCH_OPTIONS = [
  'القاهرة',
  'الاسكندرية',
  'اسيوط',
  'المنصورة',
  'طنطا',
  'بورسعيد',
  'المنيا',
];

const CATEGORY_OPTIONS = [
  'أكاديمي',
  'مالي',
  'إداري',
  'خدمات وتجهيزات',
  'أخرى',
];

const PRIORITY_OPTIONS = [
  'منخفضة',
  'متوسطة',
  'عالية',
  'عاجلة',
];

export function TicketForm() {
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[0]);
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [priority, setPriority] = useState(PRIORITY_OPTIONS[1]);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdResult, setCreatedResult] = useState<TicketResponse | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await submitTicket({
        studentName,
        studentEmail,
        studentPhone,
        branch,
        category,
        priority,
        subject,
        description,
      });

      setCreatedResult(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل إرسال الشكوى. يرجى مراجعة البيانات.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setBranch(BRANCH_OPTIONS[0]);
    setCategory(CATEGORY_OPTIONS[0]);
    setPriority(PRIORITY_OPTIONS[1]);
    setSubject('');
    setDescription('');
    setCreatedResult(null);
    setError('');
  };

  if (createdResult) {
    return (
      <TicketSuccess
        ticketNumber={createdResult.ticketNumber}
        status={createdResult.status}
        onReset={handleReset}
      />
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c1c30] rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700/80 p-6 md:p-10">
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-5">
        <h3 className="text-2xl font-bold text-[#0a2240] dark:text-slate-100 flex items-center gap-2">
          <span className="w-2.5 h-6 rounded-full bg-[#c59b27]" />
          نموذج تقديم شكوى أو مقترح رسمي
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          يرجى استيفاء البيانات بدقة ليتمكن النظام من توجيه طلبك آلياً إلى جهة الاختصاص بأكاديمية السادات.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Student Name */}
          <div>
            <label htmlFor="student-name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              اسم الطالب الثلاثي / الرباعي *
            </label>
            <input
              id="student-name"
              type="text"
              required
              minLength={3}
              maxLength={100}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="مثال: أحمد محمد علي حسن"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            />
          </div>

          {/* Student Email */}
          <div>
            <label htmlFor="student-email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              البريد الإلكتروني للتواصل *
            </label>
            <input
              id="student-email"
              type="email"
              required
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            />
          </div>

          {/* Student Phone */}
          <div>
            <label htmlFor="student-phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الهاتف (مصر) *
            </label>
            <input
              id="student-phone"
              type="tel"
              required
              value={studentPhone}
              onChange={(e) => setStudentPhone(e.target.value)}
              placeholder="+201012345678"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
              dir="ltr"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Branch */}
          <div>
            <label htmlFor="student-branch" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              الفرع التابع له الطالب *
            </label>
            <select
              id="student-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="ticket-category" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              تصنيف الشكوى
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="ticket-priority" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              درجة الأولوية
            </label>
            <select
              id="ticket-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="ticket-subject" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            عنوان الشكوى أو موضوع المقترح *
          </label>
          <input
            id="ticket-subject"
            type="text"
            required
            minLength={5}
            maxLength={120}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="موجز يصف جوهر الشكوى أو الطلب"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="ticket-description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            التفاصيل الكاملة للشكوى *
          </label>
          <textarea
            id="ticket-description"
            required
            rows={5}
            minLength={10}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب كافة الوقائع والتفاصيل والتواريخ المرتبطة بالشكوى بوضوح..."
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-base flex items-center gap-2"
          >
            {isSubmitting ? 'جاري الإرسال والمعالجة...' : 'إرسال الشكوى رسمياً'}
          </button>
        </div>
      </form>
    </div>
  );
}
