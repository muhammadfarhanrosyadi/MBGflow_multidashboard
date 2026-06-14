// ── Finance Types ──────────────────────────────────────────────────────────

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Approval {
  id: string;
  kitchenId: string;
  kitchenName: string;
  nominal: number;
  keperluan: string;
  status: ApprovalStatus;
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

// ── Employee Types ─────────────────────────────────────────────────────────

export type EmployeeRole = 'Ahli Gizi' | 'Driver' | 'Juru Masak';

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

// ── Kitchen lookup for forms ───────────────────────────────────────────────

export interface KitchenOption {
  id: string;
  name: string;
}

export const KITCHEN_OPTIONS: KitchenOption[] = [
  { id: 'K01', name: 'Dapur Jakarta Pusat' },
  { id: 'K02', name: 'Dapur Bandung' },
  { id: 'K03', name: 'Dapur Surabaya' },
  { id: 'K04', name: 'Dapur Yogyakarta' },
  { id: 'K05', name: 'Dapur Semarang' },
  { id: 'K06', name: 'Dapur Cimahi' },
];

export const DEFAULT_SALARIES: Record<EmployeeRole, number> = {
  'Ahli Gizi':  5500000,
  'Driver':     4200000,
  'Juru Masak': 4800000,
};
