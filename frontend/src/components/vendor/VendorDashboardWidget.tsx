import React, { useEffect, useState } from 'react';
import { Store, Clock, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import type { VendorStats } from '../../types';
import { vendorApi } from '../../api';

interface VendorDashboardWidgetProps {
  onNavigate?: (page: string) => void;
}

const VendorDashboardWidget: React.FC<VendorDashboardWidgetProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorApi.getStats()
      .then(setStats)
      .catch(() => setStats({ total: 0, pending: 0, approved: 0, rejected: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      label: 'Total Vendor',
      value: stats?.total ?? 0,
      icon: <Store size={18} />,
      color: '#6366F1',
      bg: 'rgba(99,102,241,0.12)',
      onClick: () => onNavigate?.('vendors'),
    },
    {
      label: 'Pending',
      value: stats?.pending ?? 0,
      icon: <Clock size={18} />,
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.12)',
      onClick: () => onNavigate?.('vendors-approval'),
    },
    {
      label: 'Approved',
      value: stats?.approved ?? 0,
      icon: <CheckCircle size={18} />,
      color: '#22A06B',
      bg: 'rgba(34,160,107,0.12)',
      onClick: () => onNavigate?.('vendors'),
    },
    {
      label: 'Rejected',
      value: stats?.rejected ?? 0,
      icon: <XCircle size={18} />,
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.12)',
      onClick: () => onNavigate?.('vendors'),
    },
  ];

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'rgba(99,102,241,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Store size={15} color="#6366F1" />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
            Vendor Approval
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            Status persetujuan vendor/pemasok
          </div>
        </div>
        {stats?.pending != null && stats.pending > 0 && (
          <span style={{
            marginLeft: 'auto',
            padding: '3px 10px',
            background: 'rgba(245,158,11,0.15)',
            color: '#D97706',
            fontSize: 11,
            fontWeight: 700,
            borderRadius: 12,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <TrendingUp size={11} />
            {stats.pending} menunggu
          </span>
        )}
      </div>

      {/* Stat cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {cards.map(card => (
          <button
            key={card.label}
            onClick={card.onClick}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 12,
              padding: '14px 16px',
              textAlign: 'left',
              cursor: onNavigate ? 'pointer' : 'default',
              transition: 'transform 0.15s, box-shadow 0.15s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              if (!onNavigate) return;
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
            }}
          >
            {/* Accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: card.color, borderRadius: '12px 12px 0 0',
            }} />

            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 4 }}>
              <div>
                <div style={{
                  fontSize: loading ? 18 : 28,
                  fontWeight: 800,
                  color: 'var(--text-primary)',
                  lineHeight: 1,
                  marginBottom: 4,
                }}>
                  {loading ? '—' : card.value.toLocaleString('id-ID')}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                  {card.label}
                </div>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: card.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: card.color,
              }}>
                {card.icon}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default VendorDashboardWidget;
