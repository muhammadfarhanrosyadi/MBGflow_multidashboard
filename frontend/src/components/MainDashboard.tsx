import React, { useMemo } from 'react';
import { Header } from './Header';
import { KPICards } from './KPICards';
import { EfficiencyChart } from './EfficiencyChart';
import { SystemAlerts } from './SystemAlerts';
import { KPICard, ChartDatapoint, SystemAlert, AdminUser } from '../types';

interface MainDashboardProps {
  onLogout: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({ onLogout }) => {
  const admin: AdminUser = {
    name: 'Master Admin',
    role: 'Administrator SCM',
  };

  // Dummy KPI Cards Data
  const kpiCards: KPICard[] = useMemo(
    () => [
      {
        id: '1',
        title: 'Total Dapur Aktif',
        value: 12,
        unit: 'dapur',
        trend: 3,
        status: 'normal',
        icon: '🍳',
      },
      {
        id: '2',
        title: 'Stok Kritis',
        value: 5,
        unit: 'item',
        trend: -2,
        status: 'critical',
        icon: '⚠️',
      },
      {
        id: '3',
        title: 'Efisiensi AI',
        value: '92%',
        trend: 5,
        status: 'normal',
        icon: '🤖',
      },
      {
        id: '4',
        title: 'Pengiriman Hari Ini',
        value: 24,
        unit: 'order',
        trend: 1,
        status: 'warning',
        icon: '🚚',
      },
    ],
    []
  );

  // Dummy Chart Data (7 hari)
  const chartData: ChartDatapoint[] = useMemo(
    () => [
      { date: 'Sen', efficiency: 78, consumption: 180 },
      { date: 'Sel', efficiency: 82, consumption: 175 },
      { date: 'Rab', efficiency: 85, consumption: 165 },
      { date: 'Kam', efficiency: 88, consumption: 155 },
      { date: 'Jum', efficiency: 90, consumption: 148 },
      { date: 'Sab', efficiency: 92, consumption: 145 },
      { date: 'Min', efficiency: 89, consumption: 160 },
    ],
    []
  );

  // Dummy System Alerts Data
  const systemAlerts: SystemAlert[] = useMemo(
    () => [
      {
        id: '1',
        date: '2026-04-16 14:30',
        module: 'Bahan Baku',
        message: 'Stok beras mencapai level minimal. Perlu restock segera.',
        status: 'critical',
        severity: 'high',
      },
      {
        id: '2',
        date: '2026-04-16 12:15',
        module: 'Logistik',
        message: 'Pengiriman ke Region Jawa Tengah tertunda 2 jam.',
        status: 'pending',
        severity: 'medium',
      },
      {
        id: '3',
        date: '2026-04-16 10:45',
        module: 'Produksi',
        message: 'Dapur cabang Bandung mencapai kapasitas 95%. Rekomendasi pause order.',
        status: 'pending',
        severity: 'high',
      },
      {
        id: '4',
        date: '2026-04-15 18:30',
        module: 'Menu Planning',
        message: 'Prediksi AI: Permintaan menu Nasi Kuning meningkat 35% minggu depan.',
        status: 'resolved',
        severity: 'low',
      },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <Header admin={admin} onLogout={onLogout} />

      <main className="p-8">
        {/* KPI Cards */}
        <KPICards cards={kpiCards} />

        {/* Chart */}
        <EfficiencyChart data={chartData} />

        {/* System Alerts */}
        <SystemAlerts alerts={systemAlerts} />

        {/* Footer Info */}
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-gray-400 text-sm">
          <p>
            Last Updated: {new Date().toLocaleString('id-ID')} | Platform SCM MBG v1.0 |
            Master Admin Dashboard
          </p>
        </div>
      </main>
    </div>
  );
};
