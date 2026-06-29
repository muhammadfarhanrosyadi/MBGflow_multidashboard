/**
 * src/api/services/dashboardApi.ts
 * Dashboard KPI and chart data API calls.
 */
import { apiGet } from '../client';

export interface DashboardKPI {
  id: string;
  title: string;
  value: string | number;
  unit: string | null;
  trend: number;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}

export interface DashboardChartPoint {
  date: string;
  efisiensi: number;
  konsumsi: number;
  pengiriman: number;
  target: number;
}

export interface DashboardAlert {
  id: string;
  tanggal: string;
  modul: string;
  pesan: string;
  severity: 'high' | 'medium' | 'low';
  status: 'critical' | 'pending' | 'resolved';
}

export interface DashboardData {
  kpis: DashboardKPI[];
  chartData: DashboardChartPoint[];
  tableData: DashboardAlert[];
}

export const dashboardApi = {
  /** GET /api/dashboard — main dashboard KPIs, chart, alerts */
  getData(): Promise<DashboardData> {
    return apiGet<DashboardData>('/dashboard');
  },
};
