/**
 * src/components/ui/EmptyState.tsx
 * Reusable empty state with optional action button.
 */
import React from 'react';

interface EmptyStateProps {
  icon?:        string;
  title?:       string;
  description?: string;
  action?:      { label: string; onClick: () => void };
  compact?:     boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon        = '📭',
  title       = 'Belum ada data',
  description,
  action,
  compact     = false,
}) => (
  <div
    style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      compact ? 80 : '25vh',
      gap:            '0.6rem',
      padding:        '1.5rem',
      color:          'var(--text-muted)',
      textAlign:      'center',
    }}
  >
    <span style={{ fontSize: compact ? 28 : 40 }}>{icon}</span>
    <p style={{ margin: 0, fontWeight: 600, fontSize: compact ? 13 : 15, color: 'var(--text-secondary)' }}>
      {title}
    </p>
    {description && (
      <p style={{ margin: 0, fontSize: compact ? 11 : 13, maxWidth: 280, lineHeight: 1.5 }}>
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        style={{
          marginTop:    '0.5rem',
          padding:      compact ? '0.3rem 0.8rem' : '0.5rem 1.2rem',
          background:   'var(--accent-primary)',
          border:       'none',
          borderRadius: 8,
          color:        '#fff',
          cursor:       'pointer',
          fontSize:     compact ? 12 : 13,
          fontWeight:   600,
        }}
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
