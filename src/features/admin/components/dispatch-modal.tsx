'use client';

import React, { useState, useEffect } from 'react';
import {
  AdminTicket,
  BranchItem,
  DepartmentItem,
  fetchDepartments,
  dispatchTicket,
} from '../lib/admin-api';
import { CompassIcon, CloseIcon } from '@/components/ui/icons';

interface DispatchModalProps {
  ticket: AdminTicket | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  branches: BranchItem[];
  token: string;
}

export function DispatchModal({
  ticket,
  isOpen,
  onClose,
  onSuccess,
  branches,
  token,
}: DispatchModalProps) {
  const initialBranchId = branches.length > 0 ? branches[0]._id : '';
  const [selectedBranchId, setSelectedBranchId] = useState(initialBranchId);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [isEscalated, setIsEscalated] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [dispatchNote, setDispatchNote] = useState('');

  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Synchronize initial branch if branches loaded after mount
  const activeBranchId = selectedBranchId || (branches.length > 0 ? branches[0]._id : '');

  // Load departments whenever activeBranchId changes
  useEffect(() => {
    let ignore = false;
    if (!activeBranchId) {
      return;
    }

    fetchDepartments(activeBranchId)
      .then((data) => {
        if (!ignore) {
          setDepartments(data);
          setSelectedDeptId(data.length > 0 ? data[0]._id : '');
        }
      })
      .catch(() => {
        if (!ignore) {
          setDepartments([]);
          setSelectedDeptId('');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingDepartments(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [activeBranchId]);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await dispatchTicket(token, ticket._id, {
        isEscalatedToPresident: isEscalated,
        escalationReason: isEscalated ? escalationReason : undefined,
        assignedBranchId: !isEscalated ? activeBranchId : undefined,
        assignedDepartmentId: !isEscalated ? selectedDeptId : undefined,
        dispatchNote: dispatchNote || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'فشل توجيه الشكوى';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1c30] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CompassIcon className="w-5 h-5 text-[#c59b27]" />
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100">
              توجيه الشكوى أو التصعيد (الإدارة المركزية)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 mb-4 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl text-xs text-slate-600 dark:text-slate-300">
          <span className="font-bold">رقم الشكوى:</span> {ticket.ticketNumber} •{' '}
          <span className="font-bold">الطالب:</span> {ticket.studentName}
        </div>

        {error && (
          <div className="mb-4 p-3 text-xs text-red-700 bg-red-100 dark:bg-red-950/60 dark:text-red-300 rounded-xl border border-red-200 dark:border-red-900">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle Escalation to President */}
          <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-900/70 bg-amber-50/60 dark:bg-amber-950/30 flex items-center justify-between">
            <div>
              <span className="block text-sm font-bold text-amber-900 dark:text-amber-200">
                تصعيد مباشر لمكتب رئيس الأكاديمية
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400">
                للحالات الاستثنائية والقرارات السيادية التي تتطلب بت العميد/رئيس الأكاديمية
              </span>
            </div>
            <input
              type="checkbox"
              checked={isEscalated}
              onChange={(e) => setIsEscalated(e.target.checked)}
              className="w-5 h-5 text-[#c59b27] rounded focus:ring-[#c59b27] cursor-pointer"
            />
          </div>

          {isEscalated ? (
            <div>
              <label htmlFor="escalation-reason" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                سبب ومبررات التصعيد لرئيس الأكاديمية *
              </label>
              <textarea
                id="escalation-reason"
                required
                rows={3}
                minLength={5}
                value={escalationReason}
                onChange={(e) => setEscalationReason(e.target.value)}
                placeholder="وضح بإيجاز سبب استحقاق الشكوى للعرض المباشر على مكتب رئيس الأكاديمية..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
              />
            </div>
          ) : (
            <>
              {/* Branch Selection */}
              <div>
                <label htmlFor="dispatch-branch" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  الفرع المستهدف بالتوجيه *
                </label>
                <select
                  id="dispatch-branch"
                  required
                  value={activeBranchId}
                  onChange={(e) => {
                    setSelectedBranchId(e.target.value);
                    setIsLoadingDepartments(true);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                >
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Selection */}
              <div>
                <label htmlFor="dispatch-department" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  القسم المختص بالفرع *
                </label>
                <select
                  id="dispatch-department"
                  required
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  disabled={isLoadingDepartments || departments.length === 0}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27] disabled:opacity-50"
                >
                  {departments.length === 0 ? (
                    <option value="">لا توجد أقسام مسجلة لهذا الفرع</option>
                  ) : (
                    departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.code})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Optional Dispatch Note */}
              <div>
                <label htmlFor="dispatch-note" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ملاحظات أو تعليمات إدارية للتوجيه (اختياري)
                </label>
                <input
                  id="dispatch-note"
                  type="text"
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  placeholder="مثال: يرجى موافاة الإدارة المركزية بالإفادة خلال 48 ساعة"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-[#c59b27]"
                />
              </div>
            </>
          )}

          <div className="pt-3 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (!isEscalated && !selectedDeptId)}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#0a2240] hover:bg-[#12335c] dark:bg-[#c59b27] dark:hover:bg-[#dfb136] dark:text-[#07182c] rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'جاري الاعتماد...' : isEscalated ? 'تأكيد التصعيد لرئيس الأكاديمية' : 'تأكيد التوجيه للفرع'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
