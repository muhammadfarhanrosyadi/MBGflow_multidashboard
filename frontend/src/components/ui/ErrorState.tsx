/**
 * src/components/ui/ErrorState.tsx
 * Reusable error state component with optional retry button.
 */
import React from 'react';

interface ErrorStateProps {
  message?:    string;
  onRetry?:    () => void;
  retryLabel?: string;
  compact?:    boolean;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  message    = 'Gagal memuat data. Silakan coba lagi.',
  onRetry,
  retryLabel = 'Coba Lagi',
  compact    = false,
}) => (
  <div
    style={{
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      minHeight:       compact ? 80 : '30vh',
      gap:             '0.75rem',
      padding:         '1.5rem',
      color:           'var(--text-muted)',
      textAlign:       'center',
    }}
  >
    <span style={{ fontSize: compact ? 24 : 36 }}>⚠️</span>
    <p style={{ margin: 0, fontSize: compact ? 12 : 14, maxWidth: 320 }}>{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          marginTop:    '0.25rem',
          padding:      compact ? '0.3rem 0.8rem' : '0.5rem 1.2rem',
          background:   'var(--accent-primary)',
          border:       'none',
          borderRadius: 8,
          color:        '#fff',
          cursor:       'pointer',
          fontSize:     compact ? 12 : 13,
          fontWeight:   600,
          transition:   'opacity 0.2s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.8'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
      >
        {retryLabel}
      </button>
    )}
  </div>
);

export default ErrorState;
