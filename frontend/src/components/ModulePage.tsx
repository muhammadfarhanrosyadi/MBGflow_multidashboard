import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Info, Download, FileText, RefreshCw } from 'lucide-react';
import AIAnalystPanel from './AIAnalystPanel';
import ReportFilterBar from './ReportFilterBar';
import type { ReportFilter } from '../types';

// ── Types ─────────────────────────────────────────────────────────────
interface AIAnalysis {
  summary: string;
  recommendations: string[];
  confidenceScore: number;
}

interface ModuleData {
  chartData: Record<string, unknown>[];
  tableData: Record<string, unknown>[];
  aiAnalysis: AIAnalysis;
}

interface ModulePageProps {
  moduleName: string;
  moduleLabel: string;
  moduleIcon: string;
}

const EMPTY_FILTER: ReportFilter = { reportType: '', startDate: '', endDate: '' };
const BASE = 'http://localhost:5000/api';

// ── Custom Tooltip ─────────────────────────────────────────────────────
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-md)',
      padding: '0.7rem 1rem',
      fontSize: '0.8rem',
      color: 'var(--text-primary)',
      boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--accent-primary)', fontSize: '0.78rem' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Auto Chart ─────────────────────────────────────────────────────────
const AutoChart: React.FC<{ data: Record<string, unknown>[] }> = ({ data }) => {
  if (!data || data.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      Tidak ada data grafik untuk periode ini.
    </div>
  );

  const keys = Object.keys(data[0]);
  const xKey = keys[0];
  const numericKeys = keys.slice(1).filter(k => typeof data[0][k] === 'number');

  const COLORS = [
    'var(--accent-primary)', 'var(--accent-secondary)',
    'var(--color-info)', 'var(--color-purple)',
    'var(--color-danger)', '#F59E0B',
  ];

  const useLineChart = /^\d{2}:\d{2}$/.test(String(data[0][xKey]));

  return (
    <ResponsiveContainer width="100%" height={280}>
      {useLineChart ? (
        <LineChart data={data} margin={{ top: 5, right: 16, bottom: 0, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey={xKey} stroke="var(--border-default)" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--border-default)" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
          {numericKeys.map((k, i) => (
            <Line key={k} type="monotone" dataKey={k} name={k} stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
              dot={{ r: 4, fill: COLORS[i % COLORS.length], stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          ))}
        </LineChart>
      ) : (
        <BarChart data={data} margin={{ top: 5, right: 16, bottom: 0, left: -15 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
          <XAxis dataKey={xKey} stroke="var(--border-default)" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
          <YAxis stroke="var(--border-default)" tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }} axisLine={false} tickLine={false} />
          <Tooltip content={<DarkTooltip />} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }} />
          {numericKeys.map((k, i) => (
            <Bar key={k} dataKey={k} name={k} fill={COLORS[i % COLORS.length]} radius={[6, 6, 0, 0]} />
          ))}
        </BarChart>
      )}
    </ResponsiveContainer>
  );
};

// ── Auto Table ────────────────────────────────────────────────────────
const AutoTable: React.FC<{ data: Record<string, unknown>[] }> = ({ data }) => {
  if (!data || data.length === 0) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
      Tidak ada data tabel untuk periode ini.
    </div>
  );

  const allKeys = Object.keys(data[0]);
  const visibleKeys = allKeys.filter(k => k !== 'id');
  const capitalize = (s: string) => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="module-table">
        <thead>
          <tr>
            {visibleKeys.map(k => <th key={k}>{capitalize(k)}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, ri) => (
            <tr key={String(row.id ?? ri)}>
              {visibleKeys.map(k => {
                const val = String(row[k] ?? '-');
                const isStatus = k.toLowerCase() === 'status';
                const style: React.CSSProperties = {};
                if (isStatus) {
                  if (/(kritis|offline|critical|over)/i.test(val))   { style.color = 'var(--color-danger)'; style.fontWeight = 700; }
                  if (/(warning|rendah|delayed)/i.test(val))           { style.color = 'var(--color-warning)'; style.fontWeight = 600; }
                  if (/(normal|optimal|delivered|moving)/i.test(val))  { style.color = 'var(--color-success)'; style.fontWeight = 600; }
                }
                return <td key={k} style={style}>{val}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Export helper ─────────────────────────────────────────────────────
async function triggerExport(
  moduleName: string,
  format: 'xlsx' | 'pdf',
  filter: ReportFilter
) {
  const params = new URLSearchParams({ format });
  if (filter.reportType) params.set('reportType', filter.reportType);
  if (filter.startDate)  params.set('startDate',  filter.startDate);
  if (filter.endDate)    params.set('endDate',    filter.endDate);

  const url = `${BASE}/modules/${moduleName}/export?${params}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Export gagal');

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = `${moduleName}_laporan.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(blobUrl);
}

// ── Filter label helper ───────────────────────────────────────────────
function filterLabel(filter: ReportFilter): string {
  if (!filter.reportType) return 'Semua Periode';
  if (filter.reportType === 'daily')   return 'Hari Ini';
  if (filter.reportType === 'monthly') return 'Bulan Ini';
  if (filter.reportType === 'yearly')  return 'Tahun Ini';
  if (filter.reportType === 'custom' && filter.startDate && filter.endDate)
    return `${filter.startDate} s/d ${filter.endDate}`;
  return 'Kustom';
}

// ── Main Component ────────────────────────────────────────────────────
const ModulePage: React.FC<ModulePageProps> = ({ moduleName, moduleLabel, moduleIcon }) => {
  const [data, setData]       = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState<ReportFilter>(EMPTY_FILTER);
  const [exporting, setExporting] = useState(false);

  const fetchData = useCallback(async (f: ReportFilter) => {
    setLoading(true);
    setError('');
    setData(null);

    const params = new URLSearchParams();
    if (f.reportType) params.set('reportType', f.reportType);
    if (f.startDate)  params.set('startDate',  f.startDate);
    if (f.endDate)    params.set('endDate',    f.endDate);

    const url = `${BASE}/modules/${moduleName}${params.toString() ? '?' + params : ''}`;

    try {
      const res  = await fetch(url);
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || 'Gagal memuat data modul.');
    } catch {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.');
    } finally {
      setLoading(false);
    }
  }, [moduleName]);

  useEffect(() => { fetchData(filter); }, [moduleName]);

  const handleFilterChange = (f: ReportFilter) => {
    // For custom, only trigger when both dates are set
    if (f.reportType === 'custom' && (!f.startDate || !f.endDate)) {
      setFilter(f);
      return;
    }
    setFilter(f);
    fetchData(f);
  };

  const handleExport = async (fmt: 'xlsx' | 'pdf') => {
    setExporting(true);
    try { await triggerExport(moduleName, fmt, filter); }
    catch { alert('Export gagal. Pastikan server berjalan.'); }
    finally { setExporting(false); }
  };

  const rowCount = data?.tableData?.length ?? 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

      {/* ── Top bar: filter + export ──────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 14,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}>
        {/* Left: module title + filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--accent-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>
            {moduleIcon}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{moduleLabel}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 1 }}>
              {rowCount} baris • {filterLabel(filter)}
            </div>
          </div>
          <div style={{ marginLeft: 4 }}>
            <ReportFilterBar
              value={filter}
              onChange={handleFilterChange}
              onReset={() => { setFilter(EMPTY_FILTER); fetchData(EMPTY_FILTER); }}
            />
          </div>
        </div>

        {/* Right: refresh + export buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => fetchData(filter)}
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13,
              cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <Download size={13} /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────────────────────── */}
      <div className="module-alert">
        <div className="module-alert-icon">
          <Info size={18} color="#B45309" />
        </div>
        <div className="module-alert-body">
          <strong>ON PROGRESS — {moduleLabel}</strong>
          <p>
            Integrasi data real modul {moduleLabel} sedang berlangsung.
            Tampilan berikut menggunakan data simulasi agar alur Master Admin tetap berjalan.
          </p>
        </div>
      </div>

      {/* ── Loading / Error ───────────────────────────────────────────── */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat data {moduleLabel}…</p>
        </div>
      )}
      {error && <div className="error-state">❌ {error}</div>}

      {data && (
        <div className="module-grid">
          {/* Chart */}
          <section className="bento-card">
            <div className="section-header">
              <div>
                <div className="section-title">{moduleIcon} Grafik Analisis</div>
                <div className="section-subtitle">{moduleLabel} — {filterLabel(filter)}</div>
              </div>
            </div>
            <AutoChart data={data.chartData} />
          </section>

          {/* AI Panel */}
          <section className="bento-card">
            <div className="section-header" style={{ marginBottom: 0 }}>
              <div>
                <div className="section-title">Panel Analisis AI</div>
                <div className="section-subtitle">Master SCM Analyst</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              <AIAnalystPanel
                moduleName={moduleName}
                moduleLabel={moduleLabel}
                moduleIcon={moduleIcon}
                tableData={data.tableData}
                chartData={data.chartData}
              />
            </div>
          </section>

          {/* Data Table */}
          <section className="bento-card" style={{ gridColumn: '1 / -1' }}>
            <div className="section-header">
              <div>
                <div className="section-title">Tabel Data Detail</div>
                <div className="section-subtitle">{rowCount} baris data • {filterLabel(filter)}</div>
              </div>
            </div>
            <div className="module-table-wrap">
              <AutoTable data={data.tableData} />
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ModulePage;
