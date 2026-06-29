/**
 * src/types/finance-employee.ts
 * Finance and Employee-specific types.
 * ApprovalStatus is imported from the canonical location (types/index.ts).
 */

// ── Finance Types ──────────────────────────────────────────────────────────────
// Re-export canonical approval status so existing code importing from here still works
export type { ApprovalStatus, ApprovalStatusDB } from './index';

export interface FinanceApproval {
  id: string;
  kitchenId: string;
  kitchenName: string;
  nominal: number;
  keperluan: string;
  /** Display status (capitalized) */
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  requestedBy: string;
  aiNotes?: {
    score: number;
    reason: string;
  } | null;
}

export interface CashflowChartPoint {
  date: string;   // 'Sen' | 'Sel' | ...
  in: number;
  out: number;
}

export interface Transaction {
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
  transactions: Transaction[];
}

export interface CashflowAiInsight {
  kebocoran_anggaran: string;
  tren_pengeluaran: string;
  saran: string;
}

// ── Employee Types ─────────────────────────────────────────────────────────────
export type EmployeeRole   = 'Ahli Gizi' | 'Driver' | 'Juru Masak';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  kitchenId: string;
  kitchenName: string;
  salary: number;
  status: EmployeeStatus;
  paidThisMonth: boolean;
}

export interface KitchenGrouped {
  kitchenId: string;
  kitchenName: string;
  employees: Employee[];
  grouped: Record<EmployeeRole, Employee[]>;
  totalEmployees: number;
}

// ── Kitchen lookup for forms ───────────────────────────────────────────────────
export interface KitchenOption {
  id: string;
  name: string;
}

export const DEFAULT_SALARIES: Record<EmployeeRole, number> = {
  'Ahli Gizi':  5_500_000,
  'Driver':     4_200_000,
  'Juru Masak': 4_800_000,
};
