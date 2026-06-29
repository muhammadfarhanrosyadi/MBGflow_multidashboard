/**
 * src/api/index.ts
 * Barrel export for all API services.
 * Import from here: import { financeApi, vendorApi } from '../api';
 */
export { authApi }          from './services/authApi';
export { dashboardApi }     from './services/dashboardApi';
export { financeApi }       from './services/financeApi';
export { employeeApi }      from './services/employeeApi';
export { vendorApi }        from './services/vendorApi';
export { aiApi }            from './services/aiApi';
export { notificationApi }  from './services/notificationApi';


// Re-export client utilities
export { apiGet, apiGetFull, apiPost, apiPut, apiDelete, apiDownload } from './client';
export type { ApiResponse, PaginatedMeta, PaginatedResponse } from './client';
