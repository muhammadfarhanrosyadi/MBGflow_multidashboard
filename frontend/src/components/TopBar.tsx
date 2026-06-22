import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Bell, X, ChevronRight, AlertTriangle, Info, CheckCircle } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────
interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  navigate: string;
}

interface Notification {
  id: string;
  severity: 'high' | 'medium' | 'low';
  type: string;
  icon: string;
  title: string;
  message: string;
  navigate: string;
  timestamp: string;
  read: boolean;
}

interface NotificationMeta {
  total: number;
  unread: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

interface TopBarProps {
  title: string;
  subtitle?: string;
  onNavigate?: (menuId: string) => void;
  adminName?: string;
}

// ── Debounce hook ─────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Format relative time ───────────────────────────────────────────────
function relativeTime(ts: string): string {
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'baru saja';
  if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

// ── Severity config ────────────────────────────────────────────────────
const SEV_CONFIG = {
  high: {
    color: 'var(--color-danger)',
    bg: 'var(--color-danger-dim)',
    label: 'Kritis',
    dot: '#ef4444',
  },
  medium: {
    color: '#d97706',
    bg: 'rgba(251,191,36,0.12)',
    label: 'Sedang',
    dot: '#f59e0b',
  },
  low: {
    color: 'var(--color-info)',
    bg: 'var(--color-info-dim)',
    label: 'Info',
    dot: '#60a5fa',
  },
};

// ── Main TopBar ────────────────────────────────────────────────────────
const TopBar: React.FC<TopBarProps> = ({ title, subtitle, onNavigate, adminName }) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Notification state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifMeta, setNotifMeta] = useState<NotificationMeta | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 280);

  // ── Fetch search results ───────────────────────────────────────────
  useEffect(() => {
    if (debouncedQuery.trim().length === 0) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }
    setSearchLoading(true);
    fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setSearchResults(json.results ?? []);
          setSearchOpen(true);
        }
      })
      .catch(() => {})
      .finally(() => setSearchLoading(false));
  }, [debouncedQuery]);

  // ── Fetch notifications ────────────────────────────────────────────
  const fetchNotifications = useCallback(() => {
    setNotifLoading(true);
    fetch('http://localhost:5000/api/notifications')
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          setNotifications(json.data ?? []);
          setNotifMeta(json.meta ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setNotifLoading(false));
  }, []);

  // Fetch notifications on mount + every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // ── Close dropdowns on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotifOpen(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Navigate from search result ────────────────────────────────────
  const handleSearchNav = (result: SearchResult) => {
    setSearchQuery('');
    setSearchOpen(false);
    onNavigate?.(result.navigate);
  };

  // ── Navigate from notification ─────────────────────────────────────
  const handleNotifNav = (notif: Notification) => {
    setNotifOpen(false);
    // Mark read visually
    setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    onNavigate?.(notif.navigate);
  };

  // Group search results by type
  const grouped = searchResults.reduce((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type].push(r);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.severity === 'high' && !n.read).length;

  // Avatar letter from adminName
  const avatarLetter = adminName ? adminName.charAt(0).toUpperCase() : 'M';

  return (
    <header className="topbar">
      {/* ── Left: Page title ────────────────────────────────────────── */}
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      {/* ── Center: Search ──────────────────────────────────────────── */}
      <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: 460 }}>
        <label
          className="topbar-search"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)',
            border: `1.5px solid ${searchOpen ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '0 12px',
            height: 38,
            cursor: 'text',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxShadow: searchOpen ? '0 0 0 3px var(--accent-primary-dim)' : 'none',
          }}
          aria-label="Search"
        >
          {searchLoading
            ? <div style={{ width: 15, height: 15, border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
            : <Search size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          }
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults.length > 0) setSearchOpen(true); }}
            placeholder="Cari dapur, menu, supplier, karyawan…"
            style={{
              flex: 1, border: 'none', background: 'transparent',
              color: 'var(--text-primary)', fontSize: 13.5, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setSearchOpen(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
            >
              <X size={14} />
            </button>
          )}
          {!searchQuery && <span className="topbar-kbd">⌘K</span>}
        </label>

        {/* ── Search dropdown ────────────────────────────────────── */}
        {searchOpen && searchResults.length > 0 && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            maxHeight: 440,
            overflowY: 'auto',
            padding: '8px 0',
          }}>
            {Object.entries(grouped).map(([type, items]) => (
              <div key={type}>
                <div style={{
                  padding: '6px 14px 4px',
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {type}
                </div>
                {items.map(result => (
                  <button
                    key={result.id}
                    onClick={() => handleSearchNav(result)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      width: '100%', padding: '8px 14px',
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-interactive)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{result.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {result.subtitle}
                      </div>
                    </div>
                    <ChevronRight size={14} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            ))}
            <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border-subtle)', marginTop: 4 }}>
              <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                {searchResults.length} hasil untuk "<strong>{searchQuery}</strong>"
              </span>
            </div>
          </div>
        )}

        {searchOpen && searchResults.length === 0 && searchQuery && !searchLoading && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            padding: '16px 14px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Tidak ada hasil untuk "<strong>{searchQuery}</strong>"
            </span>
          </div>
        )}
      </div>

      {/* ── Right: Notification + User ──────────────────────────────── */}
      <div className="topbar-right">
        {/* ── Notification bell ──────────────────────────────────── */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="topbar-bell"
            title="Notifikasi"
            onClick={() => {
              setNotifOpen(prev => !prev);
              if (!notifOpen) fetchNotifications();
            }}
            style={{
              position: 'relative', border: 'none', cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
              background: notifOpen ? 'var(--bg-interactive)' : 'none',
            } as React.CSSProperties}
          >
            <Bell size={18} color="var(--text-secondary)" />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2,
                minWidth: 16, height: 16,
                background: criticalCount > 0 ? 'var(--color-danger)' : '#f59e0b',
                color: '#fff',
                fontSize: 9.5,
                fontWeight: 800,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                lineHeight: 1,
                padding: '0 3px',
                border: '1.5px solid var(--bg-primary)',
                animation: criticalCount > 0 ? 'pulse 2s ease infinite' : 'none',
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* ── Notification dropdown ──────────────────────────── */}
          {notifOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 10px)', right: 0,
              width: 400,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 1000,
              maxHeight: 520,
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 16px 10px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                    Notifikasi Sistem
                  </div>
                  {notifMeta && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      {notifMeta.highCount > 0 && (
                        <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                          {notifMeta.highCount} kritis
                        </span>
                      )}
                      {notifMeta.highCount > 0 && notifMeta.mediumCount > 0 && ' · '}
                      {notifMeta.mediumCount > 0 && (
                        <span style={{ color: '#d97706', fontWeight: 600 }}>
                          {notifMeta.mediumCount} sedang
                        </span>
                      )}
                      {(notifMeta.highCount > 0 || notifMeta.mediumCount > 0) && notifMeta.lowCount > 0 && ' · '}
                      {notifMeta.lowCount > 0 && `${notifMeta.lowCount} info`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* List */}
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {notifLoading && (
                  <div style={{ padding: 20, textAlign: 'center' }}>
                    <div style={{ width: 20, height: 20, border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', margin: '0 auto 8px' }} />
                    <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>Memuat notifikasi…</span>
                  </div>
                )}

                {!notifLoading && notifications.length === 0 && (
                  <div style={{ padding: 24, textAlign: 'center' }}>
                    <CheckCircle size={32} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600 }}>Semua aman!</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Tidak ada notifikasi aktif saat ini.</div>
                  </div>
                )}

                {notifications.map(notif => {
                  const cfg = SEV_CONFIG[notif.severity];
                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifNav(notif)}
                      style={{
                        display: 'flex', gap: 12, width: '100%',
                        padding: '11px 16px',
                        background: notif.read ? 'none' : `${cfg.bg}55`,
                        border: 'none', borderBottom: '1px solid var(--border-subtle)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-interactive)')}
                      onMouseLeave={e => (e.currentTarget.style.background = notif.read ? 'none' : `${cfg.bg}55`)}
                    >
                      {/* Severity dot */}
                      <div style={{ flexShrink: 0, paddingTop: 3 }}>
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%',
                          background: cfg.dot,
                          boxShadow: notif.severity === 'high' ? `0 0 6px ${cfg.dot}` : 'none',
                        }} />
                      </div>

                      {/* Icon + content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <span style={{ fontSize: 14 }}>{notif.icon}</span>
                          <span style={{
                            fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            flex: 1,
                          }}>
                            {notif.title}
                          </span>
                          <span style={{
                            fontSize: 10, fontWeight: 700,
                            color: cfg.color, background: cfg.bg,
                            padding: '2px 6px', borderRadius: 4,
                            flexShrink: 0,
                          }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 11.5, color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        } as React.CSSProperties}>
                          {notif.message}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <span style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                            {relativeTime(notif.timestamp)}
                          </span>
                          <span style={{ fontSize: 10.5, color: 'var(--accent-primary)', fontWeight: 600 }}>
                            → Lihat detail
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div style={{
                padding: '10px 16px',
                borderTop: '1px solid var(--border-subtle)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  Auto-refresh setiap 60 detik
                </span>
                <button
                  onClick={() => fetchNotifications()}
                  style={{
                    fontSize: 11.5, color: 'var(--accent-primary)', fontWeight: 600,
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-light)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── User ────────────────────────────────────────────── */}
        <div className="topbar-user">
          <div className="topbar-user-name">
            <strong>{adminName || 'Master Admin'}</strong>
            <span>SCM Control</span>
          </div>
          <div className="topbar-avatar">{avatarLetter}</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;