// Types untuk aplikasi SCM Master Admin

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
  name: string;
  role: string;
  avatar?: string;
}

// ── Vendor / Supplier Types ───────────────────────────────────────────────────

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface Vendor {
  id: number;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string;
  address: string | null;
  approval_status: ApprovalStatus;
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
  old_status: ApprovalStatus | null;
  new_status: ApprovalStatus | null;
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

