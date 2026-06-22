/**
 * UniversalAiHistoryPage.tsx — fully integrated with real data flow
 * ──────────────────────────────────────────────────────────────
 * Every "Analisis dengan AI" click in any module auto-saves to the
 * backend, and this page reads from that table.
 *
 * Features:
 *  ✓ 9 module tabs: Semua, Dashboard, Produksi, Bahan Baku, Menu AI,
 *    Logistik, Tracking, Keuangan, Karyawan
 *  ✓ Unified AI result rendering: Kesimpulan, Temuan, Solusi, Confidence
 *  ✓ Debounced search across module_name, kitchen_name, date, and JSON
 *  ✓ Download XLSX / PDF (calls backend export endpoint)
 *  ✓ Graceful demo fallback when backend offline
 *  ✓ Pagination
 * ──────────────────────────────────────────────────────────────
 */

import React, {
  useState, useEffect, useCallback, useMemo, useRef,
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

import ReportFilterBar from '../components/ReportFilterBar';
import type { ReportFilter } from '../types';

import '../styles/aiHistory.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function dateLabel(d: string): { main: string; ago: string } {
  try {
    const dt   = new Date(d);
    const main = dt.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const diff = Math.floor((Date.now() - dt.getTime()) / 86_400_000);
    const ago  = diff === 0 ? 'Hari ini' : diff === 1 ? 'Kemarin' : `${diff} hari lalu`;
    return { main, ago };
  } catch { return { main: d, ago: '' }; }
}

function scoreColor(n: number): string {
  if (n >= 85) return 'var(--color-success)';
  if (n >= 70) return 'var(--color-warning)';
  return 'var(--color-danger)';
}

function scoreLabel(n: number): string {
  if (n >= 85) return 'Tinggi';
  if (n >= 70) return 'Sedang';
  return 'Rendah';
}

/** Format any value for display in a table cell */
function renderValue(v: unknown, format?: string): React.ReactNode {
  if (v === null || v === undefined || v === '') return <span style={{ color: 'var(--text-muted)' }}>—</span>;

  if (format === 'list' && Array.isArray(v)) {
    return (
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {(v as string[]).slice(0, 3).map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: 5, fontSize: '0.78rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--accent-primary)', flexShrink: 0, fontWeight: 700 }}>›</span>
            <span style={{ overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {item}
            </span>
          </li>
        ))}
        {Array.isArray(v) && v.length > 3 && (
          <li style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>+{v.length - 3} lainnya…</li>
        )}
      </ul>
    );
  }

  if (format === 'score') {
    const n = Number(v);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: '0.82rem', fontWeight: 700, color: scoreColor(n),
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: scoreColor(n), display: 'inline-block' }} />
          {n}%
        </span>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{scoreLabel(n)}</span>
      </div>
    );
  }

  if (format === 'text') {
    const text = String(v);
    return (
      <div style={{
        fontSize: '0.82rem', lineHeight: 1.5, color: 'var(--text-secondary)',
        display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        maxWidth: 280,
      }}>
        {text}
      </div>
    );
  }

  return <span style={{ fontSize: '0.84rem' }}>{String(v)}</span>;
}

// ── Source badge ──────────────────────────────────────────────────────────────

const SourceBadge: React.FC<{ source: unknown }> = ({ source }) => {
  if (source === 'gemini') return (
    <span style={{
      padding: '2px 8px', borderRadius: 99, fontSize: '0.67rem', fontWeight: 700,
      background: 'var(--accent-soft)', color: 'var(--accent-primary)',
      border: '1px solid var(--accent-primary-dim)', whiteSpace: 'nowrap',
    }}>✨ Gemini</span>
  );
  return (
    <span style={{
      padding: '2px 8px', borderRadius: 99, fontSize: '0.67rem', fontWeight: 700,
      background: 'var(--color-purple-dim)', color: 'var(--color-purple)',
      border: '1px solid rgba(124,58,237,0.2)', whiteSpace: 'nowrap',
    }}>⚙️ Rule</span>
  );
};

// ── SVG Icons ─────────────────────────────────────────────────────────────────

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

// ── Main Component ────────────────────────────────────────────────────────────

const UniversalAiHistoryPage: React.FC = () => {
  const [activeModule, setActiveModule] = useState<ModuleName>('all');
  const [allRecords,   setAllRecords]   = useState<AiHistoryRecord[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [isDemoMode,   setIsDemoMode]   = useState(false);
  const [searchInput,  setSearchInput]  = useState('');
  const [debSearch,    setDebSearch]    = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [exporting,    setExporting]    = useState<'xlsx' | 'pdf' | null>(null);
  const [filter,       setFilter]       = useState<ReportFilter>({ reportType: '', startDate: '', endDate: '' });

  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cfg    = MODULE_CONFIG[activeModule];

  // ── Search debounce ────────────────────────────────────────────────────────
  const handleSearch = (v: string) => {
    setSearchInput(v);
    setCurrentPage(1);
    if (debRef.current) clearTimeout(debRef.current);
    debRef.current = setTimeout(() => setDebSearch(v), 350);
  };

  // ── Load data ──────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { limit: 200 };
      if (filter.reportType) params.reportType = filter.reportType;
      if (filter.startDate)  params.startDate  = filter.startDate;
      if (filter.endDate)    params.endDate    = filter.endDate;

      const res = await fetchHistory(activeModule, params);
      setAllRecords(res.data);
      setIsDemoMode(false);
    } catch {
      // Backend offline → show demo data for the selected module
      const demoModule = activeModule === 'all' ? 'dashboard' : activeModule;
      setAllRecords(generateDemoData(demoModule));
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  }, [activeModule, filter]);

  useEffect(() => { setCurrentPage(1); }, [activeModule, debSearch]);
  useEffect(() => { loadData(); }, [loadData]);

  // ── Client-side filter (search) ────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!debSearch.trim()) return allRecords;
    const kw = debSearch.toLowerCase();
    return allRecords.filter(r => {
      if (r.kitchen_name?.toLowerCase().includes(kw))     return true;
      if (r.module_name?.toLowerCase().includes(kw))      return true;
      if (r.module_label?.toLowerCase().includes(kw))     return true;
      if (r.prediction_date?.toLowerCase().includes(kw))  return true;
      // Search inside JSON result
      const str = JSON.stringify(r.prediction_result).toLowerCase();
      return str.includes(kw);
    });
  }, [allRecords, debSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    allRecords.length,
    filtered: filtered.length,
    kitchens: new Set(allRecords.map(r => r.kitchen_id ?? 'global')).size,
    latest:   allRecords[0]?.prediction_date ?? '',
    gemini:   allRecords.filter(r => r.prediction_result.source === 'gemini').length,
  }), [allRecords, filtered]);

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = (format: 'xlsx' | 'pdf') => {
    setExporting(format);
    const params: any = {};
    if (filter.reportType) params.reportType = filter.reportType;
    if (filter.startDate)  params.startDate  = filter.startDate;
    if (filter.endDate)    params.endDate    = filter.endDate;
    downloadExport(activeModule, format, params);
    setTimeout(() => setExporting(null), 2500);
  };

  // ── Pagination numbers ─────────────────────────────────────────────────────
  const pageNums: (number | '...')[] = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const renderCell = (record: AiHistoryRecord, col: { key: string; source: 'root' | 'result'; format?: string }) => {
    if (col.key === 'prediction_date') {
      const { main, ago } = dateLabel(record.prediction_date);
      return (
        <div className="aih-cell-date">
          <span className="aih-cell-date-main" style={{ fontSize: '0.8rem' }}>{main}</span>
          <span className="aih-cell-date-ago">{ago}</span>
        </div>
      );
    }

    if (col.key === 'kitchen_name') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)' }}>
            {record.kitchen_name}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {record.module_label ?? record.module_name}
            {' '}
            <SourceBadge source={record.prediction_result.source} />
          </span>
        </div>
      );
    }

    const rawVal = col.source === 'root'
      ? (record as unknown as Record<string, unknown>)[col.key]
      : record.prediction_result[col.key];

    // ── Cashflow AI fallback mapping ──────────────────────────────────
    // If the standard key is absent, try the cashflow-specific equivalent
    if ((rawVal === undefined || rawVal === null || rawVal === '') && col.source === 'result') {
      const r = record.prediction_result;
      const fallback: Record<string, unknown> = {
        kesimpulan:      r.kebocoran_anggaran,   // cashflow: kebocoran_anggaran → kesimpulan col
        temuanMasalah:   r.tren_pengeluaran ? [String(r.tren_pengeluaran)] : undefined,  // tren → list
        solusiStrategis: r.saran ? [String(r.saran)] : undefined,                        // saran → list
      };
      const fallbackVal = fallback[col.key];
      if (fallbackVal !== undefined && fallbackVal !== null) {
        return renderValue(fallbackVal, col.format);
      }
    }
    // ── End cashflow fallback ─────────────────────────────────────────

    return renderValue(rawVal, col.format);
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <div className="aih-page">

      {/* Demo mode banner */}
      {isDemoMode && (
        <div className="aih-demo-banner" role="alert">
          <span>⚠️</span>
          <span>
            <strong>Mode Demo</strong> — Backend tidak terhubung. Klik <strong>"Analisis dengan AI"</strong>{' '}
            di modul mana saja, lalu refresh halaman ini untuk melihat data nyata.
          </span>
        </div>
      )}

      {/* Header */}
      <header className="aih-header">
        <div>
          <h1 className="aih-page-title">
            <span className="aih-title-icon">🤖</span>
            Riwayat Analisis AI Universal
          </h1>
          <p className="aih-subtitle">
            Histori lengkap semua hasil <strong>Analisis dengan AI</strong> dari seluruh modul SCM
            — Dashboard, Produksi, Logistik, Keuangan &amp; lebih
          </p>
        </div>

        <div className="aih-header-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button id="btn-export-xlsx" className="aih-btn aih-btn--xlsx"
              onClick={() => handleExport('xlsx')} disabled={exporting !== null || loading}>
              {exporting === 'xlsx' ? <RefreshIcon spin /> : <span>📊</span>}
              Download XLSX
            </button>
            <button id="btn-export-pdf" className="aih-btn aih-btn--pdf"
              onClick={() => handleExport('pdf')} disabled={exporting !== null || loading}>
              {exporting === 'pdf' ? <RefreshIcon spin /> : <span>📄</span>}
              Download PDF
            </button>
          </div>
          <ReportFilterBar value={filter} onChange={setFilter} />
        </div>
      </header>

      {/* Module Tabs — scrollable */}
      <div className="aih-tabs" role="tablist" aria-label="Filter modul AI">
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
            <span>{MODULE_CONFIG[mod].label}</span>
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
            <span className="aih-stat-label">Total Analisis</span>
            <span className="aih-stat-value">{loading ? '…' : stats.total}</span>
            <span className="aih-stat-sub">{cfg.label}</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--purple">✨</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">via Gemini AI</span>
            <span className="aih-stat-value">{loading ? '…' : stats.gemini}</span>
            <span className="aih-stat-sub">dari {stats.total} total</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--amber">🔍</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Hasil Filter</span>
            <span className="aih-stat-value">{loading ? '…' : stats.filtered}</span>
            <span className="aih-stat-sub">dari {stats.total} total</span>
          </div>
        </div>
        <div className="aih-stat">
          <div className="aih-stat-icon aih-stat-icon--blue">🕐</div>
          <div className="aih-stat-body">
            <span className="aih-stat-label">Analisis Terbaru</span>
            <span className="aih-stat-value" style={{ fontSize: '0.82rem', marginTop: 2 }}>
              {loading ? '…' : stats.latest ? dateLabel(stats.latest).main : '—'}
            </span>
            <span className="aih-stat-sub">{loading || !stats.latest ? '' : dateLabel(stats.latest).ago}</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="aih-toolbar" role="search">
        <div className="aih-search-wrap">
          <span className="aih-search-icon"><SearchIcon /></span>
          <input
            id="aih-search"
            className="aih-search-input"
            type="search"
            placeholder="Cari berdasarkan dapur, tanggal, modul, kesimpulan, atau solusi AI…"
            value={searchInput}
            onChange={e => handleSearch(e.target.value)}
            aria-label="Cari analisis AI"
          />
          {searchInput && (
            <button className="aih-search-clear" onClick={() => handleSearch('')} aria-label="Hapus">
              <CloseIcon />
            </button>
          )}
        </div>

        <span className="aih-count-badge">
          {loading ? '…' : `${stats.filtered} hasil`}
        </span>

        <button id="btn-refresh" className="aih-btn aih-btn--ghost"
          onClick={loadData} disabled={loading}>
          <RefreshIcon spin={loading} />
          {loading ? 'Memuat…' : 'Refresh'}
        </button>
      </div>

      {/* Notice when empty and no demo */}
      {!loading && !isDemoMode && stats.total === 0 && (
        <div style={{
          padding: '1.25rem 1.5rem',
          background: 'var(--accent-soft)',
          border: '1px solid var(--accent-primary-dim)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.87rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
        }}>
          💡 <strong>Belum ada data.</strong> Klik tombol{' '}
          <strong style={{ color: 'var(--accent-primary)' }}>✨ Analisis dengan AI</strong>{' '}
          di modul mana saja (Dashboard, Produksi, dll.), lalu kembali ke halaman ini.
          Setiap hasil analisis akan otomatis tersimpan di sini.
        </div>
      )}

      {/* Table card */}
      <div className="aih-card">
        <div className="aih-card-header">
          <div className="aih-card-title">
            <span>{cfg.icon}</span>
            Riwayat Analisis — {cfg.label}
          </div>
          <span className="aih-module-pill">{cfg.icon} {activeModule}</span>
        </div>

        <div className="aih-table-scroll">
          <table className="aih-table" aria-label={`Tabel analisis AI — ${cfg.label}`}>
            <thead>
              <tr>
                {cfg.columns.map(col => (
                  <th key={col.key}>{col.header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Loading */}
              {loading && (
                <tr className="aih-state-row">
                  <td colSpan={cfg.columns.length}>
                    <div className="aih-state-icon">⚙️</div>
                    <div className="aih-state-title">Memuat riwayat analisis…</div>
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
                        ? `Tidak ada hasil untuk "${debSearch}"`
                        : `Belum ada analisis AI untuk modul ${cfg.label}.`}
                    </div>
                  </td>
                </tr>
              )}

              {/* Rows */}
              {!loading && pageRows.map(record => (
                <tr key={record.id}>
                  {cfg.columns.map(col => (
                    <td key={col.key}>{renderCell(record, col)}</td>
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
              {' '}dari <strong>{filtered.length}</strong> analisis
            </span>
            <div className="aih-pagination-controls">
              <button className="aih-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}>‹</button>
              {pageNums.map((p, i) =>
                p === '...'
                  ? <span key={`e${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                  : <button key={p} className={`aih-page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p as number)}>{p}</button>
              )}
              <button className="aih-page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalAiHistoryPage;
