const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  branchId?: string | null;
  departmentId?: string | null;
}

export interface BranchItem {
  _id: string;
  name: string;
  code: string;
  isActive: boolean;
}

export interface DepartmentItem {
  _id: string;
  name: string;
  code: string;
  branchId: string;
  isActive: boolean;
}

export interface DispatchPayload {
  assignedBranchId?: string;
  assignedDepartmentId?: string;
  isEscalatedToPresident?: boolean;
  escalationReason?: string;
  dispatchNote?: string;
}

export interface ResolvePayload {
  status: 'تم الحل' | 'مرفوضة';
  justification: string;
}

export interface AdminTicket {
  _id: string;
  ticketNumber: string;
  studentName: string;
  studentId: string;
  studentEmail: string;
  studentPhone?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedBranch?: {
    _id: string;
    name: string;
    code?: string;
  } | null;
  assignedDepartment?: {
    _id: string;
    name: string;
    code?: string;
  } | null;
  isEscalatedToPresident?: boolean;
  escalationReason?: string;
  resolution?: {
    justification: string;
    resolvedByRole: string;
    resolvedAt: string;
  } | null;
  aiAnalysis?: {
    summary?: string;
    recommendedBranch?: string;
    recommendedDepartment?: string;
    confidence?: number;
    analyzedAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DispatchResponse {
  message: string;
  ticket: AdminTicket;
}

export interface ResolveResponse {
  message: string;
  ticket: AdminTicket;
}

export async function fetchScopedTickets(token: string, status?: string): Promise<AdminTicket[]> {
  const url = new URL(`${API_BASE_URL}/tickets/admin/scoped`);
  if (status && status !== 'الكل') {
    url.searchParams.append('status', status);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'فشل تحميل الشكاوى');
  }
  return data;
}

export async function dispatchTicket(
  token: string,
  ticketId: string,
  payload: DispatchPayload,
): Promise<DispatchResponse> {
  const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/dispatch`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(errorMsg || 'فشل توجيه الشكوى');
  }
  return data;
}

export async function resolveTicket(
  token: string,
  ticketId: string,
  payload: ResolvePayload,
): Promise<ResolveResponse> {
  const res = await fetch(`${API_BASE_URL}/tickets/${ticketId}/resolve`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(errorMsg || 'فشل تسجيل قرار البت');
  }
  return data;
}

export async function fetchBranches(): Promise<BranchItem[]> {
  const res = await fetch(`${API_BASE_URL}/branches`, {
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) return [];
  return data;
}

export async function fetchDepartments(branchId: string): Promise<DepartmentItem[]> {
  const res = await fetch(`${API_BASE_URL}/departments/branch/${branchId}`, {
    cache: 'no-store',
  });
  const data = await res.json();
  if (!res.ok) return [];
  return data;
}
