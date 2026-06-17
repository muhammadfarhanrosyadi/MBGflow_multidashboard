/**
 * UniversalAiHistoryPage.tsx
 * ──────────────────────────────────────────────────────────────
 * Universal AI Prediction History Dashboard.
 *
 * Features:
 *  ✓ Module tab switcher (Inventory / Produksi / Distribusi / Keuangan / Karyawan)
 *  ✓ Debounced search bar — filters across kitchen, date, and JSON fields
 *  ✓ Dynamic table columns per module (reads prediction_result JSON)
 *  ✓ KPI stat cards per module
 *  ✓ Download XLSX button — calls backend export endpoint
 *  ✓ Download PDF button  — calls backend export endpoint
 *  ✓ Graceful fallback to demo data when backend is offline
 *  ✓ Pagination
 *  ✓ Fully responsive
 * ──────────────────────────────────────────────────────────────
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';

import {
  MODULES,
  MODULE_CONFIG,
  fetchHistory,
  downloadExport,
  generateDemoData,
  type ModuleName,
  type AiHistoryRecord,
} from '../services/aiHistoryService';

import '../styles/aiHistory.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: unknown, format?: string): string {
  if (value === null || value === undefined) return '—';
  switch (format) {
    case 'number':   return Number(value).toLocaleString('id-ID');
    case 'pct':      return `${Number(value).toFixed(1)}%`;
    case 'currency': return `Rp ${Number(value).toLocaleString('id-ID')}`;
    case 'list':     return Array.isArray(value) ? (value as unknown[]).join(', ') : String(value);
    default:         return String(value);
  }
}

function dateLabel(dateStr: string): { main: string; ago: string } {
  try {
    const d    = new Date(dateStr);
    const main = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    const diff = Math.floor((Date.now() - d.getTime()) / 86_400_000);
    const ago  = diff === 0 ? 'Hari ini' : diff === 1 ? 'Kemarin' : `${diff} hari lalu`;
    return { main, ago };
  } catch { return { main: dateStr, ago: '' }; }
}

/** Pct bar fill colour based on value */
function pctColor(v: number): string {
  if (v >= 85) return 'var(--color-success)';
  if (v >= 60) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const CloseIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

const RefreshIcon = ({ spin }: { spin?: boolean }) => (
  <svg className={spin ? 'spin' : ''} width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

const XlsxIcon = () => <span style={{ fontSize: '0.95rem' }}>📊</span>;
const PdfIcon  = () => <span style={{ fontSize: '0.95rem' }}>📄</span>;

// ── Main Component ────────────────────────────────────────────────────────────

const UniversalAiHistoryPage: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeModule, setActiveModule] = useState<ModuleName>('inventory');
  const [allRecords,   setAllRecords]   = useState<AiHistoryRecord[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isDemoMode,   setIsDemoMode]   = useState(false);
  const [searchInput,  setSearchInput]  = useState('');
  const [debSearch,    setDebSearch]    = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [exporting,    setExporting]    = useState<'xlsx' | 'pdf' | null>(null);

  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfg    = MODULE_CONFIG[activeModule];

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearch = (v: string) => {
    setSearchInput(v);
    setCurrentPage(1);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(v), 300);
  };

  // ── Fetch / load data ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchHistory(activeModule, { limit: 200 });
      setAllRecords(res.data);
      setIsDemoMode(false);
    } catch {
      setAllRecords(generateDemoData(activeModule));
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [activeModule]);

  // Reset page when module or search changes
  useEffect(() => { setCurrentPage(1); }, [activeModule, debSearch]);
  useEffect(() => { loadData(); }, [loadData]);

  // ── Client-side filter ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!debSearch.trim()) return allRecords;
    const kw = debSearch.toLowerCase();
    return allRecords.filter(r => {
      if (r.kitchen_name.toLowerCase().includes(kw)) return true;
      if (r.kitchen_id.toLowerCase().includes(kw))   return true;
      if (r.prediction_date.toLowerCase().includes(kw)) return true;
      const resultStr = JSON.stringify(r.prediction_result).toLowerCase();
      return resultStr.includes(kw);
    });
  }, [allRecords, debSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── KPI stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allRecords.length,
    kitchens: new Set(allRecords.map(r => r.kitchen_id)).size,
    latest:   allRecords[0]?.prediction_date ?? '—',
  }), [allRecords]);

  // ── Export handler ──────────────────────────────────────────────────────────
  const handleExport = (format: 'xlsx' | 'pdf') => {
    setExporting(format);
    downloadExport(activeModule, format);
    setTimeout(() => setExporting(null), 2500);
  };

  // ── Page numbers ───────────────────────────────────────────────────────────
  const pageNums: (number | '...')[] = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // ── Render cell ────────────────────────────────────────────────────────────
  const renderCell = (record: AiHistoryRecord, colKey: string, colFormat: string | undefined, source: 'root' | 'result') => {
    const rawVal = source === 'root'
      ? (record as unknown as Record<string, unknown>)[colKey]
      : record.prediction_result[colKey];

    if (colKey === 'prediction_date') {
      const { main, ago } = dateLabel(String(rawVal ?? ''));
      return (
        <div className="aih-cell-date">
          <span className="aih-cell-date-main">{main}</span>
          <span className="aih-cell-date-ago">{ago}</span>
        </div>
      );
    }

    if (colFormat === 'pct') {
      const pct = Number(rawVal ?? 0);
      return (
        <div className="aih-cell-pct">
          <strong>{pct.toFixed(1)}%</strong>
          <div className="aih-pct-bar">
            <div className="aih-pct-fill" style={{ width: `${Math.min(100, pct)}%`, background: pctColor(pct) }} />
          </div>
        </div>
      );
    }

    if (colFormat === 'currency') return <span className="aih-cell-currency">{fmt(rawVal, 'currency')}</span>;
    if (colFormat === 'number')   return <span className="aih-cell-number">{fmt(rawVal, 'number')}</span>;
    if (colFormat === 'text')     return <div className="aih-cell-text">{String(rawVal ?? '—')}</div>;

    return <>{fmt(rawVal, colFormat)}</>;
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="aih-page">

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="aih-demo-banner" role="alert">
          <span>⚠️</span>
          <span>
            <strong>Mode Demo:</strong> Backend tidak terhubung — menampilkan data contoh.
            Jalankan server backend di folder <code>backend/</code> untuk data real.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="aih-header">
        <div>
          <h1 className="aih-page-title">
            <span className="aih-title-icon">🤖</span>
            Riwayat Prediksi AI Universal
          </h1>
          <p className="aih-subtitle">
            Histori prediksi AI lintas modul SCM — Inventory, Produksi, Distribusi, Keuangan &amp; Karyawan
          </p>
        </div>

        {/* Export action buttons */}
        <div className="aih-header-actions">
          <button
            id="btn-export-xlsx"
            className="aih-btn aih-btn--xlsx"
            onClick={() => handleExport('xlsx')}
            disabled={exporting !== null || loading}
            aria-label="Download XLSX"
          >
            {exporting === 'xlsx' ? <RefreshIcon spin /> : <XlsxIcon />}
            Download XLSX
          </button>
          <button
            id="btn-export-pdf"
            className="aih-btn aih-btn--pdf"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null || loading}
            aria-label="Download PDF"
          >
            {exporting === 'pdf' ? <RefreshIcon spin /> : <PdfIcon />}
            Download PDF
          </button>
        </div>
      </header>

      {/* Module Tabs */}
      <div className="aih-tabs" role="tablist" aria-label="Pilih modul AI">
        {MODULES.map(mod => (
          <button
            key={mod}
            role="tab"
            id={`tab-${mod}`}
            className={`aih-tab ${activeModule === mod ? 'active' : ''}`}
            onClick={() => setActiveModule(mod)}
            aria-selected={activeModule === mod}
            style={activeModule === mod ? { borderBottom: `2.5px solid ${MODULE_CONFIG[mod].color}` } : {}}
          >
            <span className="aih-tab-icon">{MODULE_CONFIG[mod].icon}</span>
            {MODULE_CONFIG[mod].label}
            {activeModule === mod && (
              <span className="aih-tab-count">
                {loading ? '…' : allRecords.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="aih-stats">
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--green">📊</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Total Prediksi</span>
            <span className="aih-stat-value">{loading ? '…' : stats.total}</span>
            <span className="aih-stat-sub">Modul: {cfg.label}</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--blue">🏪</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Dapur Terlibat</span>
            <span className="aih-stat-value">{loading ? '…' : stats.kitchens}</span>
            <span className="aih-stat-sub">Unik dalam dataset</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--amber">🔍</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Hasil Filter</span>
            <span className="aih-stat-value">{loading ? '…' : filtered.length}</span>
            <span className="aih-stat-sub">dari {stats.total} total</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--purple">🕐</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Prediksi Terbaru</span>
            <span className="aih-stat-value" style={{ fontSize: '0.9rem', marginTop: 2 }}>
              {loading ? '…' : dateLabel(stats.latest).main}
            </span>
            <span className="aih-stat-sub">{loading ? '' : dateLabel(stats.latest).ago}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="aih-toolbar" role="search" aria-label="Filter riwayat">
        <div className="aih-search-wrap">
          <span className="aih-search-icon"><SearchIcon /></span>
          <input
            id="aih-search"
            className="aih-search-input"
            type="search"
            placeholder={`Cari di modul ${cfg.label} — dapur, tanggal, atau hasil prediksi…`}
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            aria-label="Cari prediksi"
          />
          {searchInput && (
            <button className="aih-search-clear" onClick={() => handleSearch('')} aria-label="Hapus pencarian">
              <CloseIcon />
            </button>
          )}
        </div>

        <span className="aih-count-badge">
          {loading ? '…' : `${filtered.length} hasil`}
        </span>

        <button
          id="btn-refresh"
          className="aih-btn aih-btn--ghost"
          onClick={loadData}
          disabled={loading}
          aria-label="Refresh data"
        >
          <RefreshIcon spin={loading} />
          {loading ? 'Memuat…' : 'Refresh'}
        </button>
      </div>

      {/* Table card */}
      <div className="aih-card">
        <div className="aih-card-header">
          <div className="aih-card-title">
            <span>{cfg.icon}</span>
            Prediksi {cfg.label}
          </div>
          <span className="aih-module-pill">{cfg.icon} {activeModule}</span>
        </div>

        <div className="aih-table-scroll">
          <table className="aih-table" role="table" aria-label={`Tabel prediksi ${cfg.label}`}>
            <thead>
              <tr>
                {cfg.columns.map(col => (
                  <th key={col.key} scope="col">{col.header}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {/* Loading */}
              {loading && (
                <tr className="aih-state-row">
                  <td colSpan={cfg.columns.length}>
                    <div style={{ margin: '0 auto' }} className="spinner" />
                    <div className="aih-state-title" style={{ marginTop: '0.75rem' }}>
                      Memuat data prediksi {cfg.label}…
                    </div>
                  </td>
                </tr>
              )}

              {/* Empty */}
              {!loading && filtered.length === 0 && (
                <tr className="aih-state-row">
                  <td colSpan={cfg.columns.length}>
                    <div className="aih-state-icon">🔍</div>
                    <div className="aih-state-title">Tidak ada data</div>
                    <div className="aih-state-desc">
                      {debSearch
                        ? `Tidak ada prediksi yang cocok dengan "${debSearch}"`
                        : `Belum ada prediksi AI tersimpan untuk modul ${cfg.label}.`}
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && pageRows.map(record => (
                <tr key={record.id}>
                  {cfg.columns.map(col => (
                    <td key={col.key}>
                      {renderCell(record, col.key, col.format, col.source)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > PAGE_SIZE && (
          <div className="aih-pagination">
            <span className="aih-pagination-info">
              Menampilkan{' '}
              <strong>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}</strong>
              {' '}dari <strong>{filtered.length}</strong> prediksi
            </span>

            <div className="aih-pagination-controls" role="navigation" aria-label="Navigasi halaman">
              <button className="aih-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1} aria-label="Sebelumnya">‹</button>

              {pageNums.map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                  : <button key={p} className={`aih-page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p as number)}
                      aria-current={currentPage === p ? 'page' : undefined}>{p}</button>
              )}

              <button className="aih-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages} aria-label="Berikutnya">›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalAiHistoryPage;
