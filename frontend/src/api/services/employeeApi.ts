/**
 * src/api/services/employeeApi.ts
 * Employee module API calls.
 */
import { apiGet, apiGetFull, apiPost, apiPut, apiDelete, apiDownload } from '../client';
import type { ReportFilter } from '../../types';

// ── Types ──────────────────────────────────────────────────────────────────────
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

export interface EmployeeDashboard {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveEmployees: number;
  totalSalaryBudget: number;
  paidCount: number;
  unpaidCount: number;
  byRole: Record<EmployeeRole, number>;
  byKitchen: Array<{ kitchenId: string; kitchenName: string; count: number }>;
}

export interface CreateEmployeePayload {
  name: string;
  email: string;
  role: EmployeeRole;
  kitchen_id: string;
  salary: number;
  status?: EmployeeStatus;
}

export interface UpdateEmployeePayload extends Partial<CreateEmployeePayload> {
  paid_this_month?: boolean;
}

// ── API functions ──────────────────────────────────────────────────────────────
function buildParams(
  filter?: Partial<ReportFilter>,
  extra?: Record<string, string | boolean>,
): Record<string, string | boolean> {
  const p: Record<string, string | boolean> = { ...extra };
  if (filter?.reportType) p.reportType = filter.reportType;
  if (filter?.startDate)  p.startDate  = filter.startDate;
  if (filter?.endDate)    p.endDate    = filter.endDate;
  return p;
}

export const employeeApi = {
  /** GET /api/employees/kitchen/:kitchenId (use 'all' for all kitchens) */
  getByKitchen(
    kitchenId: string = 'all',
    options?: {
      role?: EmployeeRole;
      includeTerminated?: boolean;
      filter?: Partial<ReportFilter>;
    },
  ) {
    const params = buildParams(options?.filter, {
      ...(options?.role              ? { role: options.role }                              : {}),
      ...(options?.includeTerminated ? { includeTerminated: options.includeTerminated }    : {}),
    });
    return apiGetFull<Employee[]>(`/employees/kitchen/${kitchenId}`, { params });
  },

  /** GET /api/employees/dashboard */
  getDashboard() {
    return apiGet<EmployeeDashboard>('/employees/dashboard');
  },

  /** GET /api/employees/chef */
  getChefs(filter?: Partial<ReportFilter>) {
    return apiGet<Employee[]>('/employees/chef', { params: buildParams(filter) });
  },

  /** GET /api/employees/driver */
  getDrivers(filter?: Partial<ReportFilter>) {
    return apiGet<Employee[]>('/employees/driver', { params: buildParams(filter) });
  },

  /** GET /api/employees/:id */
  getById(id: string) {
    return apiGet<Employee>(`/employees/${id}`);
  },

  /** POST /api/employees */
  create(payload: CreateEmployeePayload) {
    return apiPost<Employee>('/employees', payload);
  },

  /** PUT /api/employees/:id */
  update(id: string, payload: UpdateEmployeePayload) {
    return apiPut<Employee>(`/employees/${id}`, payload);
  },

  /** DELETE /api/employees/:id */
  remove(id: string) {
    return apiDelete(`/employees/${id}`);
  },

  /** POST /api/employees/:id/pay — mark salary as paid */
  markPaid(id: string) {
    return apiPost<Employee>(`/employees/${id}/pay`);
  },

  /** GET /api/employees/export */
  exportData(format: 'xlsx' | 'pdf', filter?: Partial<ReportFilter>) {
    return apiDownload(
      '/employees/export',
      `employees.${format}`,
      { params: { format, ...buildParams(filter) } },
    );
  },
};
