import { AdminTicket } from '@/features/admin/lib/admin-api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface ExecutiveSummary {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  rejectedTickets: number;
  escalatedCount: number;
  resolutionRate: number;
  averageResolutionHours: number;
}

export interface BranchAnalytics {
  branchId: string;
  name: string;
  code: string;
  total: number;
  resolved: number;
  inProgress: number;
  escalated: number;
  resolutionRate: number;
}

export interface CategoryAnalytics {
  category: string;
  count: number;
  percentage: number;
}

export async function fetchExecutiveSummary(token: string): Promise<ExecutiveSummary> {
  const res = await fetch(`${API_BASE_URL}/analytics/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'فشل تحميل المؤشرات التنفيذية');
  }
  return data;
}

export async function fetchBranchBreakdown(token: string): Promise<BranchAnalytics[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/branches`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'فشل تحميل إحصائيات الفروع');
  }
  return data;
}

export async function fetchCategoryBreakdown(token: string): Promise<CategoryAnalytics[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'فشل تحميل تصنيفات الشكاوى');
  }
  return data;
}

export async function fetchPresidentEscalations(token: string, limit = 15): Promise<AdminTicket[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/escalations?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'فشل تحميل الحالات المصعدة لرئاسة الأكاديمية');
  }
  return data;
}

export async function downloadCsvReport(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/analytics/export/csv`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('فشل تصدير ملف التقرير');
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sams-complaints-report-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
