/**
 * src/types/index.ts
 * Shared type definitions for the SCM Master Admin application.
 * Single source of truth — no duplicate types across files.
 */

// ── Generic API Response wrapper ───────────────────────────────────────────────
export interface ApiMeta {
  total?: number;
  page?: number;
  pageSize?: number;
  pending?: number;
  generatedAt?: string;
  [key: string]: unknown;
}

// ── Dashboard types ────────────────────────────────────────────────────────────
export interface KPICard {
  id: string;
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}

export interface ChartDatapoint {
  date: string;
  efficiency: number;
  consumption: number;
}

export interface SystemAlert {
  id: string;
  date: string;
  module: string;
  message: string;
  status: 'resolved' | 'pending' | 'critical';
  severity: 'low' | 'medium' | 'high';
}

export interface MenuItemType {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface AdminUser {
  id?: number;
  name: string;
  username?: string;
  role: string;
  avatar?: string;
}

// ── Approval Status (canonical — used by both Vendor and Finance) ──────────────
/** Lowercase form used in API responses from the database */
export type ApprovalStatusDB  = 'pending' | 'approved' | 'rejected';
/** Display form used in the UI */
export type ApprovalStatus    = 'Pending' | 'Approved' | 'Rejected';

// ── Vendor / Supplier Types ───────────────────────────────────────────────────
export interface Vendor {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  approval_status: ApprovalStatusDB;
  approved_by: number | null;
  approved_at: string | null;
  rejection_reason: string | null;
  approval_notes: string | null;
  created_at: string;
  approver_name: string | null;
}

export interface VendorApprovalLog {
  id: number;
  action: string;
  old_status: ApprovalStatusDB | null;
  new_status: ApprovalStatusDB | null;
  notes: string | null;
  created_at: string;
  actor_name: string | null;
}

export interface VendorStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface CreateVendorDTO {
  name: string;
  contact_person?: string;
  phone?: string;
  email: string;
  address?: string;
}

export interface UpdateVendorDTO {
  name?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface ApproveVendorDTO {
  notes?: string;
}

export interface RejectVendorDTO {
  reason: string;
  notes?: string;
}

// ── Report Filter Types ───────────────────────────────────────────────────────
export type ReportType = 'daily' | 'monthly' | 'yearly' | 'custom';

export interface ReportFilter {
  reportType: ReportType | '';
  startDate: string;
  endDate: string;
}

// ── Kitchen ───────────────────────────────────────────────────────────────────
export interface Kitchen {
  id: string;
  name: string;
  city?: string;
  status?: string;
}
