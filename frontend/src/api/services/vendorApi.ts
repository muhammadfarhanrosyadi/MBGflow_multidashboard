/**
 * src/api/services/vendorApi.ts
 * Vendor / Supplier approval API — replaces the old vendorService.ts.
 * All calls go through the centralized apiClient.
 */
import { apiGet, apiGetFull, apiPost, apiPut, apiDelete, apiDownload } from '../client';
import type {
  Vendor,
  VendorStats,
  VendorApprovalLog,
  CreateVendorDTO,
  UpdateVendorDTO,
  ApproveVendorDTO,
  RejectVendorDTO,
  ReportFilter,
} from '../../types';

function buildParams(
  filter?: Partial<ReportFilter>,
  extra?: Record<string, string>,
): Record<string, string> {
  const p: Record<string, string> = { ...extra };
  if (filter?.reportType) p.reportType = filter.reportType;
  if (filter?.startDate)  p.startDate  = filter.startDate;
  if (filter?.endDate)    p.endDate    = filter.endDate;
  return p;
}

export const vendorApi = {
  /** GET /api/vendors */
  getAll(filter?: Partial<ReportFilter> & { approval_status?: string }) {
    return apiGetFull<Vendor[]>('/vendors', {
      params: buildParams(
        filter,
        filter?.approval_status ? { approval_status: filter.approval_status } : undefined,
      ),
    });
  },

  /** GET /api/vendors/stats */
  getStats(): Promise<VendorStats> {
    return apiGet<VendorStats>('/vendors/stats');
  },

  /** GET /api/vendors/pending */
  getPending(): Promise<Vendor[]> {
    return apiGet<Vendor[]>('/vendors/pending');
  },

  /** GET /api/vendors/:id */
  getById(id: number): Promise<Vendor> {
    return apiGet<Vendor>(`/vendors/${id}`);
  },

  /** POST /api/vendors */
  create(dto: CreateVendorDTO): Promise<Vendor> {
    return apiPost<Vendor>('/vendors', dto);
  },

  /** PUT /api/vendors/:id */
  update(id: number, dto: UpdateVendorDTO): Promise<Vendor> {
    return apiPut<Vendor>(`/vendors/${id}`, dto);
  },

  /** DELETE /api/vendors/:id */
  remove(id: number): Promise<void> {
    return apiDelete(`/vendors/${id}`);
  },

  /** POST /api/vendors/:id/approve */
  approve(id: number, dto: ApproveVendorDTO = {}): Promise<Vendor> {
    return apiPost<Vendor>(`/vendors/${id}/approve`, dto);
  },

  /** POST /api/vendors/:id/reject */
  reject(id: number, dto: RejectVendorDTO): Promise<Vendor> {
    return apiPost<Vendor>(`/vendors/${id}/reject`, dto);
  },

  /** GET /api/vendors/:id/logs */
  getLogs(id: number): Promise<VendorApprovalLog[]> {
    return apiGet<VendorApprovalLog[]>(`/vendors/${id}/logs`);
  },

  /** GET /api/vendors/export */
  exportData(format: 'xlsx' | 'pdf', filter?: Partial<ReportFilter>) {
    return apiDownload(
      '/vendors/export',
      `vendor_list.${format}`,
      { params: { format, ...buildParams(filter) } },
    );
  },
};
