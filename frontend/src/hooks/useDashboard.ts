/**
 * src/hooks/useDashboard.ts
 * Dashboard KPI data fetching with 30s auto-refresh.
 */
import { dashboardApi, type DashboardData } from '../api/services/dashboardApi';
import ENV from '../config/env';
import { useApi } from './useApi';

export function useDashboard() {
  return useApi<DashboardData>(
    () => dashboardApi.getData(),
    [],
    { refreshInterval: ENV.REFRESH_INTERVAL_MS, immediate: true },
  );
}
