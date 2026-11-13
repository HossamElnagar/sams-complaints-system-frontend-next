'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  AdminUser,
  AdminTicket,
} from '@/features/admin/lib/admin-api';
import {
  ExecutiveSummary,
  BranchAnalytics,
  CategoryAnalytics,
  fetchExecutiveSummary,
  fetchBranchBreakdown,
  fetchCategoryBreakdown,
  fetchPresidentEscalations,
  downloadCsvReport,
} from '@/features/analytics/lib/analytics-api';
import { ResolveModal } from '@/features/admin/components/resolve-modal';
import {
  ScaleIcon,
  PrinterIcon,
  DownloadIcon,
  UserIcon,
  BarChartIcon,
  CheckCircleIcon,
  ClockIcon,
  BuildingIcon,
  FileCheckIcon,
  RefreshIcon,
} from '@/components/ui/icons';

export default function PresidentBiDashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Analytics states
  const [summary, setSummary] = useState<ExecutiveSummary | null>(null);
  const [branches, setBranches] = useState<BranchAnalytics[]>([]);
  const [categories, setCategories] = useState<CategoryAnalytics[]>([]);
  const [escalatedTickets, setEscalatedTickets] = useState<AdminTicket[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Modal resolution for President
  const [resolvingTicket, setResolvingTicket] = useState<AdminTicket | null>(null);

  // Load session auth asynchronously (React 19 compliant)
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (ignore) return;
      const storedToken = sessionStorage.getItem('sams_token');
      const storedAdmin = sessionStorage.getItem('sams_admin');

      if (storedToken && storedAdmin) {
        try {
          const parsedAdmin: AdminUser = JSON.parse(storedAdmin);
          setToken(storedToken);
          setAdminUser(parsedAdmin);
        } catch {
          setToken(null);
          setAdminUser(null);
        }
      } else {
        setToken(null);
        setAdminUser(null);
      }
      setIsAuthChecking(false);
    });

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch all analytics datasets asynchronously
  useEffect(() => {
    let ignore = false;
    if (!token) return;

    Promise.all([
      fetchExecutiveSummary(token),
      fetchBranchBreakdown(token),
      fetchCategoryBreakdown(token),
      fetchPresidentEscalations(token, 20),
    ])
      .then(([summaryData, branchData, categoryData, escalationsData]) => {
        if (!ignore) {
          setSummary(summaryData);
          setBranches(branchData);
          setCategories(categoryData);
          setEscalatedTickets(escalationsData as AdminTicket[]);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'فشل تحميل بيانات التحليلات';
          setError(message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token, refreshTrigger]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleCsvDownload = async () => {
    if (!token) return;
    setIsExporting(true);
    try {
      await downloadCsvReport(token);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'فشل تصدير التقرير');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('sams_token');
    sessionStorage.removeItem('sams_admin');
    setToken(null);
    setAdminUser(null);
    startTransition(() => {
      router.push('/');
    });
  };

  // Auth checking state
  if (isAuthChecking) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <div className="inline-flex items-center justify-center mb-3">
          <RefreshIcon className="w-8 h-8 text-[#c59b27] animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-semibold">جاري التحقق من الصلاحيات التنفيذية...</p>
      </div>
    );
  }

  // Access validation (President & SuperAdmin & CentralHead)
  const isAuthorized =
    adminUser?.role === 'AcademyPresident' ||
    adminUser?.role === 'SuperAdmin' ||
    adminUser?.role === 'CentralComplaintsHead';

  if (!token || !adminUser || !isAuthorized) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-[#c59b27]/15 flex items-center justify-center mx-auto mb-4">
            <ScaleIcon className="w-8 h-8 text-[#c59b27]" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a2240] dark:text-slate-100 mb-2">
            بوابة الإدارة العليا ورئاسة الأكاديمية
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            هذه البوابة مخصصة حصرياً لرئاسة الأكاديمية والإدارة المركزية للاطلاع على المؤشرات الوطنية واتخاذ القرارات السيادية.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-md transition-all"
          >
            العودة للرئيسية وتسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. Printable Official Header (Visible ONLY during print)
      ───────────────────────────────────────────────────────────── */}
      <div className="hidden print:block mb-8 pb-6 border-b-2 border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16">
              <Image
                src="/images/SAMS شعار الاكاديمية.jpeg"
                alt="شعار الأكاديمية"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                جمهورية مصر العربية - وزارة التخطيط والتنمية الاقتصادية
              </h1>
              <h2 className="text-lg font-bold text-slate-800">
                أكاديمية السادات للعلوم الإدارية - مكتب رئيس الأكاديمية
              </h2>
              <p className="text-xs text-slate-600">
                التقرير التنفيذي الشامل للشكاوى والتظلمات الطلابية والإدارية
              </p>
            </div>
          </div>
          <div className="text-left text-xs text-slate-600 space-y-1">
            <div>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-EG')}</div>
            <div>المصدر: المنظومة الوطنية الموحدة للشكاوى</div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Screen Top Banner & Actions Header (Hidden in Print)
      ───────────────────────────────────────────────────────────── */}
      <section className="print:hidden bg-gradient-to-r from-[#07182c] via-[#0a2240] to-[#0d2e57] text-white py-8 px-4 border-b border-[#c59b27]/30 shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#c59b27] font-bold mb-1">
                <ScaleIcon className="w-4 h-4 text-[#c59b27]" />
                <span>مكتب رئيس الأكاديمية</span>
                <span>•</span>
                <span>بوابة ذكاء الأعمال والتحليلات الوطنية (Executive BI)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                لوحة الرقابة التنفيذية ومؤشرات الأداء الوطنية
              </h1>
            </div>

            {/* Actions & Profile Pill */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white/10 hover:bg-white/20 text-slate-100 rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                <PrinterIcon className="w-4 h-4" />
                <span>طباعة تقرير الإيجاز</span>
              </button>

              <button
                type="button"
                onClick={handleCsvDownload}
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-[#c59b27] hover:bg-[#dfb136] text-[#07182c] rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>{isExporting ? 'جاري التصدير...' : 'تصدير البيانات (CSV)'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-100 rounded-xl border border-white/20 transition-all cursor-pointer"
                title="تحديث البيانات"
              >
                <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <div className="mr-2 flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <span className="font-bold text-[#c59b27] flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>{adminUser.fullName}</span>
                </span>
                <span className="text-slate-300">({adminUser.role === 'AcademyPresident' ? 'رئيس الأكاديمية' : adminUser.role})</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-rose-400 hover:text-rose-300 mr-1"
                >
                  خروج
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. Main Executive Content
      ───────────────────────────────────────────────────────────── */}
      <main className="container mx-auto max-w-7xl px-4 mt-8 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* ── KPI Widgets ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Total Volume */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-[#0a2240] dark:bg-[#c59b27]" />
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
              <span>إجمالي الشكاوى الوطنية</span>
              <BarChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-black text-[#0a2240] dark:text-slate-100">
              {summary?.totalTickets ?? '...'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              على مستوى كافة فروع وكليات الأكاديمية
            </p>
          </div>

          {/* Card 2: Resolution SLA Rate */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-emerald-500" />
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
              <span>معدل الإنجاز والحل المعتمد</span>
              <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {summary ? `${summary.resolutionRate}%` : '...'}
              </span>
              <span className="text-xs text-slate-400">({summary?.resolvedTickets || 0} حالة)</span>
            </div>
            {/* Mini Progress meter */}
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${summary?.resolutionRate || 0}%` }}
              />
            </div>
          </div>

          {/* Card 3: Presidential Escalations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-purple-500" />
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
              <span>الحالات المعروضة على الرئيس</span>
              <ScaleIcon className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
              {summary?.escalatedCount ?? '...'}
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300 mt-2 font-medium">
              تتطلب توجيهاً أو بتاً سيادياً مباشراً
            </p>
          </div>

          {/* Card 4: Average SLA Hours */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-1 bg-[#c59b27]" />
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold mb-2">
              <span>متوسط زمن البت (SLA)</span>
              <ClockIcon className="w-4 h-4 text-[#c59b27]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-black text-[#0a2240] dark:text-[#c59b27]">
                {summary?.averageResolutionHours ?? '0'}
              </span>
              <span className="text-xs text-slate-500 font-bold">ساعة</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              من لحظة التسجيل وحتى اعتماد قرار البت
            </p>
          </div>
        </div>

        {/* ── Two Column Visual Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Branch Performance Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <BuildingIcon className="w-5 h-5 text-[#c59b27]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  مؤشرات فروع الأكاديمية على مستوى الجمهورية
                </h3>
              </div>
              <span className="text-xs text-[#c59b27] font-semibold">
                {branches.length} فروع مفعلة
              </span>
            </div>

            <div className="space-y-4">
              {branches.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">لا توجد بيانات متاحة حالياً</p>
              ) : (
                branches.map((b) => (
                  <div key={b.branchId} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {b.name} ({b.code})
                      </span>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-slate-500">إجمالي: {b.total}</span>
                        <span className="text-emerald-600 font-bold">حل: {b.resolved}</span>
                        {b.escalated > 0 && (
                          <span className="text-purple-600 font-bold">تصعيد: {b.escalated}</span>
                        )}
                        <span className="font-mono font-bold text-[#0a2240] dark:text-[#c59b27]">
                          {b.resolutionRate}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-500 h-full transition-all"
                        style={{ width: `${b.resolutionRate}%` }}
                        title={`تم الحل: ${b.resolved}`}
                      />
                      <div
                        className="bg-amber-400 h-full transition-all"
                        style={{ width: `${b.total > 0 ? ((b.inProgress) / b.total) * 100 : 0}%` }}
                        title={`قيد المعالجة: ${b.inProgress}`}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Category Distribution Breakdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2">
                <FileCheckIcon className="w-5 h-5 text-[#c59b27]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  توزيع الشكاوى حسب الاختصاص والنوع
                </h3>
              </div>
              <span className="text-xs text-slate-400">تحليل نسبي</span>
            </div>

            <div className="space-y-4">
              {categories.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">لا توجد تصنيفات مسجلة</p>
              ) : (
                categories.map((c, idx) => {
                  const colors = [
                    'bg-[#0a2240] dark:bg-[#c59b27]',
                    'bg-emerald-600',
                    'bg-blue-600',
                    'bg-amber-600',
                    'bg-purple-600',
                  ];
                  const barColor = colors[idx % colors.length];

                  return (
                    <div key={c.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{c.category}</span>
                        <span className="text-slate-500 dark:text-slate-400">
                          {c.count} شكوى ({c.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${barColor}`}
                          style={{ width: `${c.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. Presidential Escalation Action Table
        ───────────────────────────────────────────────────────────── */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0c1c30] border border-purple-200 dark:border-purple-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
            <div className="flex items-center gap-2.5">
              <ScaleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  الحالات والقضايا المعروضة للبت الرئاسي المباشر
                </h3>
                <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                  تم تصعيدها من إدارة الشكاوى المركزية لتقدير رئاسة الأكاديمية
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              {escalatedTickets.length} حالات في الانتظار
            </span>
          </div>

          {escalatedTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <CheckCircleIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold">لا توجد أي قضايا مصعدة حالياً لمكتب رئيس الأكاديمية</p>
              <p className="text-xs text-slate-500 mt-1">كافة الحالات قيد المتابعة والمعالجة في الفروع والإدارات المختصة</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold">
                    <th className="py-3 px-3">رقم الشكوى</th>
                    <th className="py-3 px-3">مقدم الشكوى</th>
                    <th className="py-3 px-3">الفرع / الكلية</th>
                    <th className="py-3 px-3">التصنيف</th>
                    <th className="py-3 px-4 min-w-[200px]">موجب ومبرر التصعيد للرئيس</th>
                    <th className="py-3 px-3">الحالة</th>
                    <th className="py-3 px-3 print:hidden">الإجراء الرئاسي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {escalatedTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-purple-50/40 dark:hover:bg-purple-950/20 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-[#0a2240] dark:text-[#c59b27]">
                        #{t.ticketNumber || t._id.slice(-6)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{t.studentName}</div>
                        <div className="text-[11px] text-slate-400">{t.studentId}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                        {t.assignedBranch?.name || 'غير محدد'}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#c59b27]">
                        {t.category}
                      </td>
                      <td className="py-3 px-4 text-purple-900 dark:text-purple-200 bg-purple-50/50 dark:bg-purple-950/30 rounded-lg">
                        {t.escalationReason || 'تم التصعيد للنظر الرئاسي'}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'تم الحل'
                            ? 'bg-emerald-100 text-emerald-800'
                            : t.status === 'مرفوضة'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 print:hidden">
                        {t.status !== 'تم الحل' && t.status !== 'مرفوضة' ? (
                          <button
                            type="button"
                            onClick={() => setResolvingTicket(t)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-lg shadow-xs transition-all cursor-pointer whitespace-nowrap"
                          >
                            <ScaleIcon className="w-3.5 h-3.5" />
                            <span>البت السيادي</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">تم البت</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. Printable Institutional Signature Section
        ───────────────────────────────────────────────────────────── */}
        <div className="hidden print:block pt-12 mt-12 border-t-2 border-slate-300">
          <div className="grid grid-cols-2 text-center text-xs text-slate-800">
            <div>
              <p className="font-bold mb-12">مدير إدارة الشكاوى وخدمة المواطنين</p>
              <p>................................................</p>
            </div>
            <div>
              <p className="font-bold mb-12">يعتمد، رئيس أكاديمية السادات للعلوم الإدارية</p>
              <p>................................................</p>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          Modal for President Sovereign Resolution
      ───────────────────────────────────────────────────────────── */}
      {resolvingTicket && (
        <ResolveModal
          ticket={resolvingTicket}
          isOpen={true}
          token={token || ''}
          onClose={() => setResolvingTicket(null)}
          onSuccess={() => {
            setResolvingTicket(null);
            handleManualRefresh();
          }}
        />
      )}
    </div>
  );
}
