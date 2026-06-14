import React from 'react';
import { SystemAlert } from '../types';

interface SystemAlertsProps {
  alerts: SystemAlert[];
}

export const SystemAlerts: React.FC<SystemAlertsProps> = ({ alerts }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-950 bg-opacity-30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-950 bg-opacity-30';
      default:
        return 'text-blue-400 bg-blue-950 bg-opacity-30';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-900 text-red-300">
            🔴 KRITIS
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-900 text-yellow-300">
            ⏳ PENDING
          </span>
        );
      case 'resolved':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-900 text-green-300">
            ✓ RESOLVED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span>🚨</span> Peringatan Sistem Lintas Modul
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Tanggal & Waktu</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Modul Asal</th>
              <th className="text-left px-4 py-3 text-gray-400 font-semibold">Pesan Peringatan</th>
              <th className="text-center px-4 py-3 text-gray-400 font-semibold">Severity</th>
              <th className="text-center px-4 py-3 text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {alerts.map((alert, idx) => (
              <tr
                key={alert.id}
                className={`border-b border-gray-700 hover:bg-gray-700 bg-opacity-30 transition-colors ${
                  idx % 2 === 0 ? 'bg-gray-900 bg-opacity-20' : ''
                }`}
              >
                <td className="px-4 py-3 text-gray-300">{alert.date}</td>
                <td className="px-4 py-3">
                  <span className="px-3 py-1 bg-indigo-900 bg-opacity-50 text-indigo-300 rounded-full text-xs font-medium">
                    {alert.module}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-300">{alert.message}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
                    alert.severity
                  )}`}>
                    {alert.severity === 'high' && '🔴'}
                    {alert.severity === 'medium' && '🟡'}
                    {alert.severity === 'low' && '🟢'}
                    {' '}
                    {alert.severity.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {getStatusBadge(alert.status)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {alerts.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>✓ Tidak ada peringatan sistem saat ini</p>
        </div>
      )}
    </div>
  );
};
