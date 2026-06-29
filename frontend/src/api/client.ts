/**
 * src/api/client.ts
 * Centralized Axios instance — single source for ALL API calls to the
 * backend (http://localhost:5000/api).
 *
 * Features:
 *  - JWT token injection via request interceptor
 *  - Global 401 handling (auto-logout)
 *  - Standardized error messages
 *  - 15s timeout
 *  - AbortController support (via axios CancelToken)
 */
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from 'axios';
import ENV from '../config/env';

// ── Internal response shape ────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: Record<string, unknown> | PaginatedMeta;
  errors?: string[];
}

export interface PaginatedMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginatedMeta;
}

// ── Axios instance ─────────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT ───────────────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(ENV.TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ── Response interceptor: global error handling ───────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiResponse>) => {
    const status = error.response?.status;

    // Auto-logout on 401
    if (status === 401) {
      localStorage.removeItem(ENV.TOKEN_KEY);
      // Emit a custom event so AuthContext can react
      window.dispatchEvent(new CustomEvent('scm:unauthorized'));
    }

    // Normalize error message
    const message =
      error.response?.data?.message ||
      (status === 403 ? 'Akses ditolak.' :
       status === 404 ? 'Data tidak ditemukan.' :
       status === 500 ? 'Terjadi kesalahan server.' :
       error.message || 'Terjadi kesalahan jaringan.');

    const normalized = new Error(message) as Error & { status?: number; data?: ApiResponse };
    normalized.status = status;
    normalized.data   = error.response?.data;
    return Promise.reject(normalized);
  },
);

// ── Typed helpers ──────────────────────────────────────────────────────────────
/**
 * GET request — returns the `data` field of the response.
 */
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.get<ApiResponse<T>>(url, config);
  return res.data.data;
}

/**
 * GET request — returns the full ApiResponse (for pagination meta etc).
 */
export async function apiGetFull<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  const res = await apiClient.get<ApiResponse<T>>(url, config);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.post<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiPut<T>(
  url: string,
  body?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.put<ApiResponse<T>>(url, body, config);
  return res.data.data;
}

export async function apiDelete<T = void>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await apiClient.delete<ApiResponse<T>>(url, config);
  return res.data.data;
}

/** Download a blob (xlsx / pdf) */
export async function apiDownload(
  url: string,
  filename: string,
  config?: AxiosRequestConfig,
): Promise<void> {
  const res = await apiClient.get(url, { ...config, responseType: 'blob' });
  const href = window.URL.createObjectURL(new Blob([res.data as BlobPart]));
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(href);
}

export default apiClient;
