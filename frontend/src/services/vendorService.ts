import axios, { AxiosInstance } from 'axios';
import type {
  Vendor,
  VendorStats,
  VendorApprovalLog,
  CreateVendorDTO,
  UpdateVendorDTO,
  ApproveVendorDTO,
  RejectVendorDTO,
  ReportFilter,
} from '../types';

const BASE_URL = 'http://localhost:5000/api';

// ── Axios instance with auth interceptor ─────────────────────────────────────
const api: AxiosInstance = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
  const token = localStorage.getItem('scm_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response shape helpers ────────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { total: number };
}

// ── Filter params builder ─────────────────────────────────────────────────────
function buildFilterParams(filter?: Partial<ReportFilter>): Record<string, string> {
  const params: Record<string, string> = {};
  if (filter?.reportType) params.reportType = filter.reportType;
  if (filter?.startDate)  params.startDate  = filter.startDate;
  if (filter?.endDate)    params.endDate    = filter.endDate;
  return params;
}

// ── Vendor API calls ──────────────────────────────────────────────────────────

export async function getVendors(
  filter?: Partial<ReportFilter> & { approval_status?: string }
): Promise<Vendor[]> {
  const params = {
    ...buildFilterParams(filter),
    ...(filter?.approval_status ? { approval_status: filter.approval_status } : {}),
  };
  const res = await api.get<ApiResponse<Vendor[]>>('/vendors', { params });
  return res.data.data;
}

export async function getVendorStats(): Promise<VendorStats> {
  const res = await api.get<ApiResponse<VendorStats>>('/vendors/stats');
  return res.data.data;
}

export async function getPendingVendors(): Promise<Vendor[]> {
  const res = await api.get<ApiResponse<Vendor[]>>('/vendors/pending');
  return res.data.data;
}

export async function getVendorById(id: number): Promise<Vendor> {
  const res = await api.get<ApiResponse<Vendor>>(`/vendors/${id}`);
  return res.data.data;
}

export async function createVendor(dto: CreateVendorDTO): Promise<Vendor> {
  const res = await api.post<ApiResponse<Vendor>>('/vendors', dto);
  return res.data.data;
}

export async function updateVendor(id: number, dto: UpdateVendorDTO): Promise<Vendor> {
  const res = await api.put<ApiResponse<Vendor>>(`/vendors/${id}`, dto);
  return res.data.data;
}

export async function deleteVendor(id: number): Promise<void> {
  await api.delete(`/vendors/${id}`);
}

export async function approveVendor(id: number, dto: ApproveVendorDTO = {}): Promise<Vendor> {
  const res = await api.post<ApiResponse<Vendor>>(`/vendors/${id}/approve`, dto);
  return res.data.data;
}

export async function rejectVendor(id: number, dto: RejectVendorDTO): Promise<Vendor> {
  const res = await api.post<ApiResponse<Vendor>>(`/vendors/${id}/reject`, dto);
  return res.data.data;
}

export async function getVendorLogs(id: number): Promise<VendorApprovalLog[]> {
  const res = await api.get<ApiResponse<VendorApprovalLog[]>>(`/vendors/${id}/logs`);
  return res.data.data;
}

export async function exportVendors(
  format: 'xlsx' | 'pdf',
  filter?: Partial<ReportFilter>
): Promise<void> {
  const params = { ...buildFilterParams(filter), format };
  const res = await api.get('/vendors/export', {
    params,
    responseType: 'blob',
  });

  const mime = format === 'xlsx'
    ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    : 'application/pdf';

  const url = window.URL.createObjectURL(new Blob([res.data as BlobPart], { type: mime }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `vendor_list.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
