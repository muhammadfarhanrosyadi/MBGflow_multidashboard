/**
 * AiPredictionHistoryPage.tsx
 * ──────────────────────────────────────────────────────────────
 * Full-featured AI Prediction History dashboard.
 *
 * Features:
 *  ✓ Fetches data from GET /api/ai/predictions/history
 *  ✓ Falls back to demo data when the backend is unavailable
 *  ✓ Functional search bar — filters by kitchen name, kitchen_id,
 *    date, or suggestion text (debounced 300ms)
 *  ✓ Kitchen filter dropdown
 *  ✓ Paginated table (client-side for demo / server-side for live)
 *  ✓ Summary KPI stat cards
 *  ✓ Waste visualisation bar per row
 *  ✓ Confidence level badge (high / medium / low)
 *  ✓ Responsive layout
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
  fetchPredictionHistory,
  generateDemoData,
  type AiPredictionRecord,
  type PaginationMeta,
} from '../services/aiPredictionService';
import '../styles/aiPrediction.css';

// ── Constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Format a date string as 'DD MMM YYYY' in Indonesian locale. */
function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Return a human-readable "N hari lalu" label. */
function timeAgo(dateStr: string): string {
  const diff = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 86_400_000
  );
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  return `${diff} hari lalu`;
}

/** Determine confidence tier from 0–1 score. */
function confidenceTier(score: number | null): 'high' | 'medium' | 'low' {
  if (score === null) return 'medium';
  if (score >= 0.85) return 'high';
  if (score >= 0.65) return 'medium';
  return 'low';
}

const CONFIDENCE_LABEL: Record<'high' | 'medium' | 'low', string> = {
  high:   'Tinggi',
  medium: 'Sedang',
  low:    'Rendah',
};

/** Clamp a numeric value between min and max. */
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

// ── Component ─────────────────────────────────────────────────────────────────

const AiPredictionHistoryPage: React.FC = () => {
  // ── Data state ────────────────────────────────────────────────
  const [records, setRecords]       = useState<AiPredictionRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // ── Filter state ──────────────────────────────────────────────
  const [searchInput, setSearchInput]   = useState('');       // raw user input
  const [debouncedSearch, setDebounced] = useState('');       // debounced value
  const [kitchenFilter, setKitchenFilter] = useState('');     // kitchen_id filter
  const [currentPage, setCurrentPage]   = useState(1);

  // ── Debounce search input ─────────────────────────────────────
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebounced(value), 300);
  };

  // ── Fetch data from backend ───────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchPredictionHistory({
        search:     debouncedSearch || undefined,
        kitchen_id: kitchenFilter  || undefined,
        limit:      PAGE_SIZE,
        page:       currentPage,
      });
      setRecords(response.data);
      setPagination(response.pagination);
      setIsDemoMode(false);
    } catch (err) {
      // Backend unavailable — fall back to demo data with client-side pagination
      const demo  = generateDemoData();
      setRecords(demo);
      setPagination({
        total:      demo.length,
        page:       1,
        limit:      PAGE_SIZE,
        totalPages: Math.ceil(demo.length / PAGE_SIZE),
      });
      setIsDemoMode(true);
      const msg = err instanceof Error ? err.message : String(err);
      console.warn('[AiPredictionHistoryPage] Backend unavailable, using demo data:', msg);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, kitchenFilter, currentPage]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Client-side filter for demo mode ──────────────────────────
  const displayRecords = useMemo(() => {
    if (!isDemoMode) return records; // backend already filtered

    let filtered = records;

    if (kitchenFilter) {
      filtered = filtered.filter(r => r.kitchen_id === kitchenFilter);
    }

    if (debouncedSearch.trim()) {
      const kw = debouncedSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.kitchen_id.toLowerCase().includes(kw)
        || r.kitchen_name.toLowerCase().includes(kw)
        || r.prediction_date.includes(kw)
        || (r.suggested_portion_adjustment ?? '').toLowerCase().includes(kw)
      );
    }

    // Paginate
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [isDemoMode, records, debouncedSearch, kitchenFilter, currentPage]);

  // Recalculate pagination totals in demo mode
  const totalPages = useMemo(() => {
    if (!isDemoMode || !pagination) return pagination?.totalPages ?? 1;
    let filtered = records;
    if (kitchenFilter) filtered = filtered.filter(r => r.kitchen_id === kitchenFilter);
    if (debouncedSearch.trim()) {
      const kw = debouncedSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.kitchen_id.toLowerCase().includes(kw)
        || r.kitchen_name.toLowerCase().includes(kw)
        || r.prediction_date.includes(kw)
        || (r.suggested_portion_adjustment ?? '').toLowerCase().includes(kw)
      );
    }
    return Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  }, [isDemoMode, records, kitchenFilter, debouncedSearch, pagination]);

  const totalFiltered = useMemo(() => {
    if (!isDemoMode) return pagination?.total ?? 0;
    let filtered = records;
    if (kitchenFilter) filtered = filtered.filter(r => r.kitchen_id === kitchenFilter);
    if (debouncedSearch.trim()) {
      const kw = debouncedSearch.toLowerCase();
      filtered = filtered.filter(r =>
        r.kitchen_id.toLowerCase().includes(kw)
        || r.kitchen_name.toLowerCase().includes(kw)
        || r.prediction_date.includes(kw)
        || (r.suggested_portion_adjustment ?? '').toLowerCase().includes(kw)
      );
    }
    return filtered.length;
  }, [isDemoMode, records, kitchenFilter, debouncedSearch, pagination]);

  // ── KPI summary stats ─────────────────────────────────────────
  const stats = useMemo(() => {
    const all = records;
    if (!all.length) return { total: 0, avgWaste: 0, maxWaste: 0, kitchens: 0 };

    const wasteValues = all.map(r => Number(r.predicted_waste_kg)).filter(v => !isNaN(v));
    const total       = all.length;
    const avgWaste    = wasteValues.reduce((a, b) => a + b, 0) / (wasteValues.length || 1);
    const maxWaste    = Math.max(...wasteValues, 0);
    const kitchens    = new Set(all.map(r => r.kitchen_id)).size;

    return { total, avgWaste, maxWaste, kitchens };
  }, [records]);

  // ── Unique kitchens for the dropdown ──────────────────────────
  const kitchenOptions = useMemo(() => {
    const seen = new Map<string, string>();
    records.forEach(r => {
      if (!seen.has(r.kitchen_id)) seen.set(r.kitchen_id, r.kitchen_name || r.kitchen_id);
    });
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
  }, [records]);

  // ── Pagination page numbers ────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3)    pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  // ── Render ────────────────────────────────────────────────────
  return (
    <div className="aipred-page">

      {/* ── Demo mode warning ─────────────────────────────────── */}
      {isDemoMode && (
        <div className="aipred-demo-banner" role="alert">
          <span>⚠️</span>
          <span>
            <strong>Mode Demo:</strong> Backend tidak terhubung — data yang ditampilkan adalah contoh statis.
            Jalankan <code>npm start</code> di folder <code>backend/</code> dan pastikan DB terhubung.
          </span>
        </div>
      )}

      {/* ── Page header ───────────────────────────────────────── */}
      <header className="aipred-header">
        <div className="aipred-header-left">
          <h1 className="aipred-page-title">
            <span className="title-icon">🤖</span>
            Riwayat Prediksi AI
          </h1>
          <p className="aipred-subtitle">
            Histori rekomendasi pemborosan makanan &amp; penyesuaian porsi berbasis AI per dapur
          </p>
        </div>
      </header>

      {/* ── KPI stat cards ────────────────────────────────────── */}
      <div className="aipred-stats-row">
        <div className="aipred-stat-card">
          <div className="aipred-stat-icon aipred-stat-icon--green">📊</div>
          <div className="aipred-stat-body">
            <span className="aipred-stat-label">Total Prediksi</span>
            <span className="aipred-stat-value">{stats.total}</span>
            <span className="aipred-stat-sub">Semua waktu</span>
          </div>
        </div>

        <div className="aipred-stat-card">
          <div className="aipred-stat-icon aipred-stat-icon--amber">♻️</div>
          <div className="aipred-stat-body">
            <span className="aipred-stat-label">Rata-rata Waste</span>
            <span className="aipred-stat-value">{stats.avgWaste.toFixed(1)}</span>
            <span className="aipred-stat-sub">kg / prediksi</span>
          </div>
        </div>

        <div className="aipred-stat-card">
          <div className="aipred-stat-icon aipred-stat-icon--blue">📈</div>
          <div className="aipred-stat-body">
            <span className="aipred-stat-label">Waste Tertinggi</span>
            <span className="aipred-stat-value">{stats.maxWaste.toFixed(1)}</span>
            <span className="aipred-stat-sub">kg (maks)</span>
          </div>
        </div>

        <div className="aipred-stat-card">
          <div className="aipred-stat-icon aipred-stat-icon--purple">🏪</div>
          <div className="aipred-stat-body">
            <span className="aipred-stat-label">Dapur Aktif</span>
            <span className="aipred-stat-value">{stats.kitchens}</span>
            <span className="aipred-stat-sub">Dapur dengan prediksi</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="aipred-toolbar" role="search" aria-label="Filter riwayat prediksi">

        {/* Search input */}
        <div className="aipred-search-wrap">
          <span className="aipred-search-icon" aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
          <input
            id="aipred-search"
            className="aipred-search-input"
            type="search"
            placeholder="Cari dapur, tanggal, atau rekomendasi…"
            value={searchInput}
            onChange={e => handleSearchChange(e.target.value)}
            aria-label="Cari riwayat prediksi"
          />
          {searchInput && (
            <button
              className="aipred-search-clear"
              onClick={() => handleSearchChange('')}
              aria-label="Hapus pencarian"
              title="Hapus"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Kitchen filter */}
        <select
          id="aipred-kitchen-filter"
          className="aipred-filter-select"
          value={kitchenFilter}
          onChange={e => { setKitchenFilter(e.target.value); setCurrentPage(1); }}
          aria-label="Filter berdasarkan dapur"
        >
          <option value="">Semua Dapur</option>
          {kitchenOptions.map(k => (
            <option key={k.id} value={k.id}>{k.name}</option>
          ))}
        </select>

        {/* Result count badge */}
        <span className="aipred-toolbar-badge">
          {loading ? '…' : `${totalFiltered} hasil`}
        </span>

        {/* Refresh button */}
        <button
          id="aipred-refresh-btn"
          className="aipred-btn-refresh"
          onClick={loadData}
          disabled={loading}
          aria-label="Refresh data"
          title="Refresh"
        >
          <svg
            className={loading ? 'spin' : ''}
            width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M8 16H3v5" />
          </svg>
          {loading ? 'Memuat…' : 'Refresh'}
        </button>
      </div>

      {/* ── Table card ────────────────────────────────────────── */}
      <div className="aipred-table-card">
        <div className="aipred-table-scroll">
          <table className="aipred-table" role="table" aria-label="Tabel riwayat prediksi AI">
            <thead>
              <tr>
                <th scope="col">Dapur</th>
                <th scope="col">Tanggal Prediksi</th>
                <th scope="col">Estimasi Waste</th>
                <th scope="col" className="aipred-col-suggestion">Rekomendasi Porsi</th>
                <th scope="col" className="aipred-col-confidence">Kepercayaan</th>
                <th scope="col" className="aipred-col-model">Versi Model</th>
              </tr>
            </thead>

            <tbody>
              {/* Loading state */}
              {loading && (
                <tr className="aipred-state-row">
                  <td colSpan={6}>
                    <div className="aipred-state-icon">
                      <div className="spinner" style={{ margin: '0 auto' }} />
                    </div>
                    <div className="aipred-state-title" style={{ marginTop: '0.75rem' }}>
                      Memuat riwayat prediksi…
                    </div>
                  </td>
                </tr>
              )}

              {/* Error state */}
              {!loading && error && (
                <tr className="aipred-state-row">
                  <td colSpan={6}>
                    <div className="aipred-state-icon">⚠️</div>
                    <div className="aipred-state-title">Gagal memuat data</div>
                    <div className="aipred-state-desc">{error}</div>
                  </td>
                </tr>
              )}

              {/* Empty state */}
              {!loading && !error && displayRecords.length === 0 && (
                <tr className="aipred-state-row">
                  <td colSpan={6}>
                    <div className="aipred-state-icon">🔍</div>
                    <div className="aipred-state-title">Tidak ada data ditemukan</div>
                    <div className="aipred-state-desc">
                      {debouncedSearch || kitchenFilter
                        ? 'Coba ubah kata kunci atau filter dapur.'
                        : 'Belum ada prediksi AI yang tersimpan.'}
                    </div>
                  </td>
                </tr>
              )}

              {/* Data rows */}
              {!loading && !error && displayRecords.map((record, idx) => {
                const wasteKg     = Number(record.predicted_waste_kg);
                const barPct      = clamp((wasteKg / Math.max(stats.maxWaste, 1)) * 100, 0, 100);
                const tier        = confidenceTier(record.confidence_score);
                const barColor    = wasteKg > stats.avgWaste * 1.5
                  ? 'var(--color-danger)'
                  : wasteKg > stats.avgWaste
                  ? 'var(--color-warning)'
                  : 'var(--color-success)';

                return (
                  <tr key={record.id} style={{ animationDelay: `${idx * 30}ms` }}>
                    {/* Kitchen */}
                    <td>
                      <div className="aipred-kitchen-cell">
                        <span className="aipred-kitchen-name">{record.kitchen_name}</span>
                        <span className="aipred-kitchen-id">{record.kitchen_id}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <div className="aipred-date-cell">
                        <span className="aipred-date-main">{formatDate(record.prediction_date)}</span>
                        <span className="aipred-date-ago">{timeAgo(record.prediction_date)}</span>
                      </div>
                    </td>

                    {/* Waste */}
                    <td>
                      <div className="aipred-waste-cell">
                        <span className="aipred-waste-value">{wasteKg.toFixed(2)}</span>
                        <span className="aipred-waste-unit">kg</span>
                        <div className="aipred-waste-bar-wrap">
                          <div
                            className="aipred-waste-bar"
                            style={{ width: `${barPct}%`, background: barColor }}
                            title={`${barPct.toFixed(0)}% dari maksimum`}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Suggestion */}
                    <td className="aipred-col-suggestion aipred-suggestion-cell">
                      <span className="aipred-suggestion-text">
                        {record.suggested_portion_adjustment || <em style={{ color: 'var(--text-muted)' }}>—</em>}
                      </span>
                    </td>

                    {/* Confidence */}
                    <td className="aipred-col-confidence">
                      <span className={`aipred-confidence aipred-confidence--${tier}`}>
                        {CONFIDENCE_LABEL[tier]}
                        {record.confidence_score !== null && (
                          <span style={{ opacity: 0.8 }}>
                            {' '}({(record.confidence_score * 100).toFixed(0)}%)
                          </span>
                        )}
                      </span>
                    </td>

                    {/* Model */}
                    <td className="aipred-col-model">
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                      }}>
                        {record.model_version || '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ──────────────────────────────────────── */}
        {!loading && totalFiltered > PAGE_SIZE && (
          <div className="aipred-pagination">
            <span className="aipred-pagination-info">
              Menampilkan{' '}
              <strong>{(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, totalFiltered)}</strong>{' '}
              dari <strong>{totalFiltered}</strong> prediksi
            </span>

            <div className="aipred-pagination-controls" role="navigation" aria-label="Navigasi halaman">
              <button
                className="aipred-page-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Halaman sebelumnya"
              >
                ‹
              </button>

              {pageNumbers.map((p, i) =>
                p === '...'
                  ? <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--text-muted)' }}>…</span>
                  : (
                    <button
                      key={p}
                      className={`aipred-page-btn ${currentPage === p ? 'active' : ''}`}
                      onClick={() => setCurrentPage(p as number)}
                      aria-label={`Halaman ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
              )}

              <button
                className="aipred-page-btn"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Halaman berikutnya"
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiPredictionHistoryPage;
