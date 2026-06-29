/**
 * src/api/services/financeApi.ts
 * Finance module API calls — cashflow, approvals, kitchen balance, exports.
 */
import { apiGet, apiGetFull, apiPost, apiPut, apiDelete, apiDownload } from '../client';
import type { ReportFilter } from '../../types';

// ── Types ──────────────────────────────────────────────────────────────────────
export type FinanceApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface FinanceApproval {
  id: string;
  kitchenId: string;
  kitchenName: string;
  nominal: number;
  keperluan: string;
  status: FinanceApprovalStatus;
  requestedAt: string;
  requestedBy: string;
  aiNotes?: { score: number; reason: string } | null;
}

export interface CashflowChartPoint {
  date: string;
  in: number;
  out: number;
}

export interface CashflowTransaction {
  id: string;
  tanggal: string;
  keterangan: string;
  type: 'in' | 'out';
  nominal: number;
}

export interface CashflowSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
  period: string;
}

export interface CashflowData {
  summary: CashflowSummary;
  chartData: CashflowChartPoint[];
  transactions: CashflowTransaction[];
}

export interface CashflowAiInsight {
  kebocoran_anggaran: string;
  tren_pengeluaran: string;
  saran: string;
}

export interface KitchenBalance {
  kitchenId: string;
  kitchenName: string;
  city: string;
  status: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  payroll: {
    totalSalary: number;
    totalEmployees: number;
    paidCount: number;
    unpaidCount: number;
    unpaidAmount: number;
  };
  pendingApproval: {
    count: number;
    amount: number;
  };
}

export interface KitchenFinanceData {
  grandTotal: {
    totalIn: number;
    totalOut: number;
    balance: number;
    totalSalary: number;
    unpaidSalary: number;
    pendingApprovalAmount: number;
    pendingApprovalCount: number;
  };
  kitchens: KitchenBalance[];
}

export interface FinanceDashboardSummary {
  totalIn: number;
  totalOut: number;
  balance: number;
  pendingApprovals: number;
  pendingAmount: number;
}

export interface PaymentPayload {
  description: string;
  amount: number;
  type: 'in' | 'out';
  kitchen_id?: string;
  transaction_date?: string;
}

// ── API functions ──────────────────────────────────────────────────────────────
function buildParams(filter?: Partial<ReportFilter>): Record<string, string> {
  const p: Record<string, string> = {};
  if (filter?.reportType) p.reportType = filter.reportType;
  if (filter?.startDate)  p.startDate  = filter.startDate;
  if (filter?.endDate)    p.endDate    = filter.endDate;
  return p;
}

export const financeApi = {
  /** GET /api/finance/approvals */
  getApprovals(filter?: Partial<ReportFilter>) {
    return apiGetFull<FinanceApproval[]>('/finance/approvals', {
      params: buildParams(filter),
    });
  },

  /** POST /api/finance/approvals/:id  { action: 'approve' | 'reject' } */
  updateApproval(id: string, action: 'approve' | 'reject') {
    return apiPost<void>(`/finance/approvals/${id}`, { action });
  },

  /** POST /api/finance/analyze-request/:id */
  analyzeRequest(id: string) {
    return apiPost<{ score: number; reason: string }>(`/finance/analyze-request/${id}`);
  },

  /** GET /api/finance/cashflow */
  getCashflow(filter?: Partial<ReportFilter>) {
    return apiGet<CashflowData>('/finance/cashflow', { params: buildParams(filter) });
  },

  /** GET /api/finance/analyze-cashflow */
  analyzeCashflow() {
    return apiGet<CashflowAiInsight>('/finance/analyze-cashflow');
  },

  /** GET /api/finance/kitchen-balance */
  getKitchenBalance() {
    return apiGet<KitchenFinanceData>('/finance/kitchen-balance');
  },

  /** GET /api/finance/dashboard — summary KPIs */
  getDashboardSummary() {
    return apiGet<FinanceDashboardSummary>('/finance/dashboard');
  },

  /** POST /api/finance/payment */
  createPayment(payload: PaymentPayload) {
    return apiPost<CashflowTransaction>('/finance/payment', payload);
  },

  /** PUT /api/finance/payment/:id */
  updatePayment(id: string, payload: Partial<PaymentPayload>) {
    return apiPut<CashflowTransaction>(`/finance/payment/${id}`, payload);
  },

  /** DELETE /api/finance/payment/:id */
  deletePayment(id: string) {
    return apiDelete(`/finance/payment/${id}`);
  },

  /** GET /api/finance/export?type=approvals|cashflow&format=xlsx|pdf */
  exportData(
    type: 'approvals' | 'cashflow',
    format: 'xlsx' | 'pdf',
    filter?: Partial<ReportFilter>,
  ) {
    return apiDownload(
      '/finance/export',
      `finance_${type}.${format}`,
      { params: { type, format, ...buildParams(filter) } },
    );
  },
};
