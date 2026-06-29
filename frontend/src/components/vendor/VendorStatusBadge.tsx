import React from 'react';
import type { ApprovalStatusDB } from '../../types';

interface VendorStatusBadgeProps {
  status: ApprovalStatusDB;
  size?: 'sm' | 'md';
}

const CONFIG: Record<ApprovalStatusDB, { label: string; bg: string; color: string; dot: string }> = {
  pending:  { label: 'Pending',  bg: 'rgba(251,191,36,0.15)',  color: '#D97706', dot: '#F59E0B' },
  approved: { label: 'Approved', bg: 'rgba(34,160,107,0.15)',  color: '#15803D', dot: '#22A06B' },
  rejected: { label: 'Rejected', bg: 'rgba(239,68,68,0.15)',   color: '#B91C1C', dot: '#EF4444' },
};

const VendorStatusBadge: React.FC<VendorStatusBadgeProps> = ({ status, size = 'md' }) => {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  const fontSize = size === 'sm' ? 11 : 12.5;
  const padding  = size === 'sm' ? '2px 8px' : '4px 12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      padding,
      borderRadius: 20,
      background: cfg.bg,
      color: cfg.color,
      fontSize,
      fontWeight: 700,
      letterSpacing: 0.3,
      whiteSpace: 'nowrap',
    }}>
      <span style={{
        width: size === 'sm' ? 6 : 7,
        height: size === 'sm' ? 6 : 7,
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
};

export default VendorStatusBadge;
