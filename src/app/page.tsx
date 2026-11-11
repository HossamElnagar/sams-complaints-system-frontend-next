import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TicketForm } from '@/features/tickets/components/ticket-form';

export default function HomePage() {
  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* 1. Hero Banner with Campus Gate Background */}
      <section className="relative w-full py-24 lg:py-32 overflow-hidden flex items-center justify-center">
        {/* Background Image: Academy Campus Gate */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/صورة الاكاديمية SAMS.jpg"
            alt="مبنى وبوابة أكاديمية السادات للعلوم الإدارية"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Institutional Gradient Transparency Overlay */}
          <div className="absolute inset-0 sams-gradient-hero backdrop-blur-2xs" />
        </div>

        {/* Hero Content */}
        <div className="container relative z-10 mx-auto px-4 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#c59b27]/20 border border-[#c59b27]/60 text-[#dfb136] text-xs sm:text-sm font-semibold mb-6">
            <span>🏛️</span>
            <span>بوابة الشكاوى والمقترحات الموحدة لجميع الفروع</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight max-w-4xl mx-auto mb-6">
            صوت الطالب مسموع.. نحو بيئة أكاديمية متطورة وشفافة
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            منظومة رقمية متكاملة مدعومة بأحدث تقنيات التحليل الذكي تضمن وصول مقترحاتكم وشكواكم بدقة وسرعة إلى القيادات الأكاديمية المختصة.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#submit-ticket"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-[#07182c] bg-[#c59b27] hover:bg-[#dfb136] rounded-xl shadow-lg transition-all"
            >
              تقديم شكوى أو مقترح الآن
            </Link>
            <Link
              href="/tickets/track"
              className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md rounded-xl shadow-lg transition-all"
            >
              متابعة شكوى سابقة بالرقم
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Institutional Leadership Spotlight (Dean Portrait) */}
      <section className="py-16 bg-slate-50 dark:bg-[#07182c]/60 border-b border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="bg-white dark:bg-[#0c1c30] rounded-3xl p-8 lg:p-12 shadow-xl border border-slate-200 dark:border-slate-700/80 max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 lg:gap-12">
            {/* Dean Portrait Card with Gold Accent */}
            <div className="relative shrink-0">
              <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-[#c59b27]/80">
                <Image
                  src="/images/العميد.jpg"
                  alt="عميد أكاديمية السادات للعلوم الإدارية"
                  fill
                  className="object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-4 right-1/2 translate-x-1/2 bg-[#0a2240] text-[#dfb136] border border-[#c59b27]/40 text-xs font-bold py-1 px-4 rounded-full shadow-md whitespace-nowrap">
                القيادة الأكاديمية
              </div>
            </div>

            {/* Leadership Message */}
            <div className="flex-1 text-right">
              <div className="inline-block text-xs font-bold tracking-wider text-[#c59b27] uppercase mb-2">
                كلمة قيادة الأكاديمية
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0a2240] dark:text-slate-100 mb-4">
                «أبناؤنا وبناتنا الطلاب هم ركيزة الأكاديمية ومحور تطورها»
              </h2>
              <blockquote className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 border-r-4 border-[#c59b27] pr-4 italic">
                ”إن إطلاق بوابة الشكاوى المركزية والتوجيه الذكي يأتي تجسيداً لالتزام أكاديمية السادات للعلوم الإدارية بمبادئ الحوكمة والعدالة والشفافية. نحرص دائماً على أن تكون قنوات التواصل مفتوحة ومباشرة لتذليل كافة العقبات الأكاديمية والإدارية أمام مسيرتكم التعليمية المتميزة.“
              </blockquote>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                إدارة أكاديمية السادات للعلوم الإدارية
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                المقر الرئيسي - المعادي وفروع الأكاديمية
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Operational Pillars */}
      <section className="py-16 bg-white dark:bg-[#06111f]">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0a2240] dark:text-slate-100 mb-3">
              مميزات المنظومة الأكاديمية الذكية
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              معايير رقمية صارمة تضمن الدقة، السرعة، والعدالة التامة في متابعة كل شكوى.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-[#c59b27]/20 text-[#c59b27] flex items-center justify-center text-2xl mb-4 font-bold">
                ⚡
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                توجيه ذكي استشاري
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                تحليل محتوى الشكوى بالذكاء الاصطناعي لاقتراح الفرع والقسم المختص مع احتفاظ الإدارة المركزية بالقرار البشري النهائي.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-[#1b497e]/20 text-[#1b497e] dark:text-blue-400 flex items-center justify-center text-2xl mb-4 font-bold">
                🔒
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                سرية وتتبع رقمي مشفر
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                رمز مرجعي مشفر لكل شكوى يتيح للطالب متابعة كافة مراحل المعالجة وقرارات اللجان لحظة بلحظة.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl mb-4 font-bold">
                🌐
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">
                تغطية شاملة لكافة الفروع
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                ربط إلكتروني موحد يجمع فروع القاهرة، الإسكندرية، بورسعيد، المنصورة، طنطا، أسيوط، والمنيا تحت مظلة واحدة.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ticket Submission Form Anchor Section */}
      <section id="submit-ticket" className="py-20 bg-slate-50 dark:bg-[#07182c]/40 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <TicketForm />
        </div>
      </section>
    </div>
  );
}
