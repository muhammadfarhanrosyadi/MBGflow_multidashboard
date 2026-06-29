/**
 * src/components/ui/SkeletonCard.tsx
 * Animated skeleton placeholder for loading states.
 */
import React from 'react';

interface SkeletonCardProps {
  height?: number | string;
  width?:  number | string;
  style?:  React.CSSProperties;
}

const pulse: React.CSSProperties = {
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-pulse 1.6s ease-in-out infinite',
  borderRadius: 10,
};

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  height = 140,
  width  = '100%',
  style,
}) => (
  <div
    style={{
      ...pulse,
      height,
      width,
      ...style,
    }}
    aria-hidden="true"
    role="status"
  />
);

/** Multiple skeleton cards in a grid-like layout */
export const SkeletonGrid: React.FC<{ count?: number; columns?: number }> = ({
  count   = 4,
  columns = 4,
}) => (
  <div
    style={{
      display:             'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap:                 '1rem',
    }}
  >
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} height={140} />
    ))}
  </div>
);

/** Full-page loading overlay */
export const SkeletonPage: React.FC<{ label?: string }> = ({
  label = 'Memuat data...',
}) => (
  <div
    style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      minHeight:      '40vh',
      gap:            '1rem',
      color:          'var(--text-muted)',
      fontSize:       14,
    }}
  >
    <div
      style={{
        width:        40,
        height:       40,
        borderRadius: '50%',
        border:       '3px solid rgba(255,255,255,0.1)',
        borderTop:    '3px solid var(--accent-primary)',
        animation:    'spin 0.8s linear infinite',
      }}
    />
    <span>{label}</span>
  </div>
);

export default SkeletonCard;
