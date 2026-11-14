'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AdminUser,
  AdminTicket,
  BranchItem,
  fetchBranches,
  fetchScopedTickets,
} from '@/features/admin/lib/admin-api';
import { DispatchModal } from '@/features/admin/components/dispatch-modal';
import { ResolveModal } from '@/features/admin/components/resolve-modal';
import { AiAdvisoryCard } from '@/features/tickets/components/ai-advisory-card';
import {
  ScaleIcon,
  RefreshIcon,
  ShieldCheckIcon,
  SearchIcon,
  InboxIcon,
  CompassIcon,
} from '@/components/ui/icons';

const STATUS_TABS = [
  'الكل',
  'مفتوحة',
  'قيد المعالجة',
  'تم الحل',
  'مرفوضة',
  'مصعدة للرئيس',
];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [tickets, setTickets] = useState<AdminTicket[]>([]);

  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Modals state
  const [dispatchTicketTarget, setDispatchTicketTarget] = useState<AdminTicket | null>(null);
  const [resolveTicketTarget, setResolveTicketTarget] = useState<AdminTicket | null>(null);
  const [expandedAiTicketId, setExpandedAiTicketId] = useState<string | null>(null);

  // Load session auth asynchronously
  useEffect(() => {
    let ignore = false;
    void Promise.resolve().then(() => {
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

  // Fetch branches asynchronously once
  useEffect(() => {
    let ignore = false;
    void fetchBranches().then((data) => {
      if (!ignore) setBranches(data);
    });
    return () => {
      ignore = true;
    };
  }, []);

  // Fetch scoped tickets asynchronously whenever token, status, or refreshTrigger changes
  useEffect(() => {
    let ignore = false;
    if (!token) return;

    fetchScopedTickets(token, selectedStatus)
      .then((data) => {
        if (!ignore) {
          setTickets(data);
          setError(null);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const message = err instanceof Error ? err.message : 'فشل تحميل الشكاوى';
          setError(message);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [token, selectedStatus, refreshTrigger]);

  const handleManualRefresh = () => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
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

  // Helper for role permissions
  const canDispatch =
    adminUser?.role === 'CentralComplaintsHead' ||
    adminUser?.role === 'SuperAdmin';

  const canResolve =
    adminUser?.role === 'DepartmentStaff' ||
    adminUser?.role === 'BranchComplaintsStaff' ||
    adminUser?.role === 'AcademyPresident' ||
    adminUser?.role === 'SuperAdmin';

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'SuperAdmin':
        return 'مدير النظام العام';
      case 'AcademyPresident':
        return 'رئيس الأكاديمية';
      case 'CentralComplaintsHead':
        return 'مدير إدارة الشكاوى المركزية';
      case 'BranchComplaintsStaff':
        return 'مسؤول شكاوى الفرع';
      case 'DepartmentStaff':
        return 'كادر الإدارة / القسم المختص';
      default:
        return 'كادر إداري';
    }
  };

  const getStatusBadge = (status: string, isEscalated?: boolean) => {
    if (isEscalated) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
          <ScaleIcon className="w-3.5 h-3.5 text-purple-700 dark:text-purple-300" />
          <span>مصعدة لرئاسة الأكاديمية</span>
        </span>
      );
    }

    switch (status) {
      case 'مفتوحة':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            مفتوحة (بانتظار التوجيه)
          </span>
        );
      case 'قيد المعالجة':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            قيد المعالجة والتنفيذ
          </span>
        );
      case 'تم الحل':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            تم الحل والمعالجة
          </span>
        );
      case 'مرفوضة':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            مرفوضة
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
            {status}
          </span>
        );
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'حرج':
        return <span className="text-xs font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 rounded-md border border-red-200">أولوية حرجة</span>;
      case 'عاجل':
        return <span className="text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-md border border-amber-200">أولوية عاجلة</span>;
      default:
        return <span className="text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">أولوية عادية</span>;
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const tNum = (t.ticketNumber || t._id || '').toLowerCase();
    const sName = (t.studentName || '').toLowerCase();
    const sId = (t.studentId || '').toLowerCase();
    const title = (t.title || '').toLowerCase();
    return tNum.includes(query) || sName.includes(query) || sId.includes(query) || title.includes(query);
  });

  // Render loading while verifying authentication
  if (isAuthChecking) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="inline-flex items-center justify-center mb-3">
          <RefreshIcon className="w-8 h-8 text-[#c59b27] animate-spin" />
        </div>
        <p className="text-sm text-slate-500 font-semibold">جاري التحقق من هوية المستخدم...</p>
      </div>
    );
  }

  // Render unauthorized view
  if (!token || !adminUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-lg">
        <div className="p-8 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <ShieldCheckIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#0a2240] dark:text-slate-100 mb-2">
            غير مصرح بالدخول
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            يرجى تسجيل الدخول بحساب الكادر الإداري المعتمد للوصول إلى لوحة التوجيه والبت الإداري.
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
      {/* Top Bar Header */}
      <section className="bg-gradient-to-r from-[#0a2240] via-[#0d2e57] to-[#0a2240] text-white py-8 px-4 border-b border-[#c59b27]/30 shadow-md">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 text-xs text-[#c59b27] font-semibold mb-1">
                <span>أكاديمية السادات للعلوم الإدارية</span>
                <span>•</span>
                <span>النظام الموحد للشكاوى والمقترحات</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                لوحة المتابعة الإدارية والبت المركزي
              </h1>
            </div>

            {/* Admin identity pill & logout */}
            <div className="flex flex-wrap items-center gap-3 bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
              <div className="w-10 h-10 rounded-full bg-[#c59b27] text-[#0a2240] font-black flex items-center justify-center text-lg">
                {adminUser.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-100">
                  {adminUser.fullName}
                </div>
                <div className="text-xs text-[#c59b27] font-medium">
                  {getRoleLabel(adminUser.role)}
                </div>
              </div>
              {(adminUser.role === 'AcademyPresident' || adminUser.role === 'SuperAdmin') && (
                <Link
                  href="/admin/president"
                  className="mr-2 px-3 py-1.5 text-xs font-bold bg-purple-500/30 text-purple-200 hover:bg-purple-500/40 rounded-lg border border-purple-400/40 transition-all flex items-center gap-1.5"
                >
                  <ScaleIcon className="w-3.5 h-3.5" />
                  <span>بوابة الرئاسة (BI)</span>
                </Link>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="mr-2 px-3 py-1.5 text-xs font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-lg border border-rose-500/30 transition-all cursor-pointer"
              >
                خروج
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-7xl px-4 mt-8">
        {/* Metric summary counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">إجمالي الشكاوى بالنطاق</span>
            <span className="text-2xl font-black text-[#0a2240] dark:text-slate-100">{tickets.length}</span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-blue-600 dark:text-blue-400 block font-medium">مفتوحة (بانتظار التوجيه)</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {tickets.filter((t) => t.status === 'مفتوحة').length}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">قيد المعالجة</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {tickets.filter((t) => t.status === 'قيد المعالجة').length}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xs">
            <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">تم الحل والمعالجة</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {tickets.filter((t) => t.status === 'تم الحل').length}
            </span>
          </div>
        </div>

        {/* Filters and search header */}
        <div className="bg-white dark:bg-[#0c1c30] p-4 md:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search input */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="بحث برقم الشكوى، اسم الطالب، الرقم القومي..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
              />
              <SearchIcon className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
            </div>

            {/* Refresh button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <svg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>تحديث البيانات</span>
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-t border-slate-100 dark:border-slate-800 pt-3">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedStatus(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === tab
                    ? 'bg-[#0a2240] text-white dark:bg-[#c59b27] dark:text-[#07182c] shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Error notice */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Tickets List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <div className="inline-flex items-center justify-center mb-3">
              <RefreshIcon className="w-6 h-6 text-[#c59b27] animate-spin" />
            </div>
            <p className="text-sm font-semibold">جاري تحميل شكاوى النطاق الإداري المخصص...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800/60 flex items-center justify-center mx-auto mb-3">
              <InboxIcon className="w-7 h-7 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
              لا توجد شكاوى مطابقة
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              لم يتم العثور على أي شكاوى في نطاق اختصاصك أو وفقاً لمعايير التصفية المحددة.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const isAiExpanded = expandedAiTicketId === ticket._id;
              return (
                <div
                  key={ticket._id}
                  className="p-5 md:p-6 rounded-2xl bg-white dark:bg-[#0c1c30] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#c59b27]/40 transition-all"
                >
                  {/* Top metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-[#0a2240] dark:text-[#c59b27]">
                        #{ticket.ticketNumber || ticket._id.slice(-6)}
                      </span>
                      {getStatusBadge(ticket.status, ticket.isEscalatedToPresident)}
                      {getPriorityBadge(ticket.priority)}
                    </div>

                    <div className="text-xs text-slate-400">
                      تاريخ التقديم: {new Date(ticket.createdAt).toLocaleString('ar-EG')}
                    </div>
                  </div>

                  {/* Body: Title and Student Info */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-3">
                      <div>
                        <span className="text-xs font-bold text-[#c59b27] block mb-1">
                          التصنيف: {ticket.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                          {ticket.title}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200/60 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                        {ticket.description}
                      </p>

                      {/* Resolution notes if resolved */}
                      {ticket.resolution && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                            حيثيات البت الإداري ({ticket.resolution.resolvedByRole || 'المسؤول'}):
                          </span>
                          <p className="text-emerald-900 dark:text-emerald-200 leading-relaxed">
                            {ticket.resolution.justification}
                          </p>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block pt-1">
                            تاريخ القرار: {new Date(ticket.resolution.resolvedAt).toLocaleString('ar-EG')}
                          </span>
                        </div>
                      )}

                      {/* Escalation notice if escalated */}
                      {ticket.isEscalatedToPresident && ticket.escalationReason && (
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 text-xs">
                          <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">
                            موجب التصعيد لمكتب رئيس الأكاديمية:
                          </span>
                          <p className="text-purple-900 dark:text-purple-200">{ticket.escalationReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Student Identity and Scope Assignment */}
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 block mb-0.5">مقدم الشكوى:</span>
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          {ticket.studentName}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">الرقم القومي / الجامعي:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {ticket.studentId}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">البريد الإلكتروني:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {ticket.studentEmail}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block mb-0.5">الهاتف:</span>
                        <span className="font-mono text-slate-700 dark:text-slate-300">
                          {ticket.studentPhone || 'غير مسجل'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 block mb-0.5">جهة الاختصاص المحددة:</span>
                        {ticket.assignedBranch ? (
                          <div className="font-bold text-[#0a2240] dark:text-[#c59b27]">
                            {ticket.assignedBranch.name || 'الفرع المحدد'}
                            {ticket.assignedDepartment && ` - ${ticket.assignedDepartment.name}`}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">في انتظار التوجيه المركزي</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Advisory Card Accordion */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedAiTicketId(isAiExpanded ? null : ticket._id)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0a2240] dark:text-[#c59b27] hover:underline cursor-pointer"
                      >
                        <CompassIcon className="w-4 h-4 text-[#c59b27]" />
                        <span>{isAiExpanded ? 'إخفاء التحليل الاستشاري' : 'عرض التحليل والتوجيه الاستشاري (Model 1 & 2)'}</span>
                        <span className="text-xs">{isAiExpanded ? '▲' : '▼'}</span>
                      </button>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {canDispatch && ticket.status === 'مفتوحة' && (
                          <button
                            type="button"
                            onClick={() => setDispatchTicketTarget(ticket)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0a2240] hover:bg-[#12335c] rounded-xl shadow-xs border border-[#c59b27]/30 transition-all cursor-pointer"
                          >
                            <CompassIcon className="w-3.5 h-3.5 text-[#dfb136]" />
                            <span>توجيه / تصعيد الشكوى</span>
                          </button>
                        )}

                        {canResolve && ticket.status !== 'تم الحل' && ticket.status !== 'مرفوضة' && (
                          <button
                            type="button"
                            onClick={() => setResolveTicketTarget(ticket)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer"
                          >
                            <ScaleIcon className="w-3.5 h-3.5" />
                            <span>البت الإداري في الشكوى</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isAiExpanded && (
                      <div className="mt-4">
                        <AiAdvisoryCard analysis={ticket.aiAnalysis} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modals */}
      {dispatchTicketTarget && (
        <DispatchModal
          ticket={dispatchTicketTarget}
          branches={branches}
          isOpen={true}
          token={token || ''}
          onClose={() => setDispatchTicketTarget(null)}
          onSuccess={() => {
            setDispatchTicketTarget(null);
            handleManualRefresh();
          }}
        />
      )}

      {resolveTicketTarget && (
        <ResolveModal
          ticket={resolveTicketTarget}
          isOpen={true}
          token={token || ''}
          onClose={() => setResolveTicketTarget(null)}
          onSuccess={() => {
            setResolveTicketTarget(null);
            handleManualRefresh();
          }}
        />
      )}
    </div>
  );
}
