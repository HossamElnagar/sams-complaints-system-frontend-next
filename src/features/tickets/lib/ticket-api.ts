const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export interface CreateTicketPayload {
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  description: string;
  category?: string;
  priority?: string;
  branch: string;
  branchId?: string;
}

export interface TicketResponse {
  message: string;
  ticketNumber: string;
  status: string;
}

export interface TicketDetails {
  _id: string;
  ticketNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  branch?: string;
  createdAt: string;
  updatedAt: string;
  aiAnalysis?: {
    summary?: string;
    recommendedBranch?: string;
    recommendedDepartment?: string;
    confidence?: number;
    analyzedAt?: string;
  };
  timeline?: Array<{
    action: string;
    note?: string;
    timestamp: string;
  }>;
}

export async function submitTicket(payload: CreateTicketPayload): Promise<TicketResponse> {
  const res = await fetch(`${API_BASE_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    throw new Error(errorMsg || 'فشل إنشاء الشكوى');
  }

  return data;
}

export async function fetchTicketByNumber(ticketNumber: string): Promise<TicketDetails> {
  const res = await fetch(`${API_BASE_URL}/tickets/track?ticketNumber=${encodeURIComponent(ticketNumber.trim())}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'الشكوى غير موجودة');
  }

  return data;
}
