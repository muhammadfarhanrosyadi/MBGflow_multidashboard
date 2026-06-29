/**
 * src/contexts/ToastContext.tsx
 * Global toast notification system.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useId,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toasts: Toast[];
  toast: {
    success: (title: string, message?: string) => void;
    error:   (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info:    (title: string, message?: string) => void;
  };
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Provider ───────────────────────────────────────────────────────────────────
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const baseId = useId();
  let counter = 0;

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = `${baseId}-${Date.now()}-${counter++}`;
    const newToast: Toast = { id, type, title, message, duration };

    setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, [baseId]); // eslint-disable-line react-hooks/exhaustive-deps

  const dismiss    = useCallback((id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = {
    success: (title: string, message?: string) => addToast('success', title, message),
    error:   (title: string, message?: string) => addToast('error',   title, message),
    warning: (title: string, message?: string) => addToast('warning', title, message),
    info:    (title: string, message?: string) => addToast('info',    title, message),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
};

// ── Hook ───────────────────────────────────────────────────────────────────────
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ── Toast Container UI ────────────────────────────────────────────────────────
const TYPE_STYLES: Record<ToastType, { bg: string; border: string; icon: string; color: string }> = {
  success: { bg: 'var(--bg-surface)', border: 'var(--accent-primary)',  icon: '✅', color: 'var(--accent-primary)'  },
  error:   { bg: 'var(--bg-surface)', border: 'var(--color-danger)',    icon: '❌', color: 'var(--color-danger)'    },
  warning: { bg: 'var(--bg-surface)', border: 'var(--color-warning)',   icon: '⚠️', color: 'var(--color-warning)'   },
  info:    { bg: 'var(--bg-surface)', border: 'var(--accent-primary)',  icon: 'ℹ️', color: 'var(--accent-primary)'  },
};

const ToastContainer: React.FC<{
  toasts: Toast[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => (
  <div
    style={{
      position:      'fixed',
      bottom:        '1.5rem',
      right:         '1.5rem',
      zIndex:        9999,
      display:       'flex',
      flexDirection: 'column',
      gap:           '0.6rem',
      pointerEvents: 'none',
    }}
  >
    {toasts.map((t) => {
      const s = TYPE_STYLES[t.type];
      return (
        <div
          key={t.id}
          style={{
            pointerEvents:  'all',
            background:     s.bg,
            border:         `1px solid ${s.border}`,
            borderLeft:     `4px solid ${s.border}`,
            borderRadius:   '10px',
            padding:        '0.8rem 1rem',
            minWidth:       '280px',
            maxWidth:       '380px',
            boxShadow:      '0 8px 24px rgba(0,0,0,0.18)',
            display:        'flex',
            alignItems:     'flex-start',
            gap:            '0.6rem',
            animation:      'toast-slide-in 0.25s ease',
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1.4 }}>{s.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: s.color }}>{t.title}</p>
            {t.message && (
              <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {t.message}
              </p>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: 16, lineHeight: 1,
              padding: '0 2px', alignSelf: 'flex-start',
            }}
            aria-label="Tutup notifikasi"
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
);

export default ToastContext;
