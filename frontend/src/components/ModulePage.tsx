import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Info } from 'lucide-react';
import AIAnalystPanel from './AIAnalystPanel';

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
  /** Must match a key in the backend modulesDummyData (e.g. "produksi") */
  moduleName: string;
  /** Human-readable title */
  moduleLabel: string;
  /** Emoji icon */
  moduleIcon: string;
}

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

// ── Chart selector — automatically renders bars for all numeric keys ──
const AutoChart: React.FC<{ data: Record<string, unknown>[] }> = ({ data }) => {
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '1rem' }}>Tidak ada data grafik.</p>;

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
  if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: 13, padding: '1rem' }}>Tidak ada data tabel.</p>;

  const allKeys = Object.keys(data[0]);
  const visibleKeys = allKeys.filter(k => k !== 'id');

  const capitalize = (s: string) =>
    s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());

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


// ── Main Component ────────────────────────────────────────────────────
const ModulePage: React.FC<ModulePageProps> = ({ moduleName, moduleLabel, moduleIcon }) => {
  const [data, setData] = useState<ModuleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);

    fetch(`http://localhost:5000/api/modules/${moduleName}`)
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError(json.error || 'Gagal memuat data modul.');
      })
      .catch(() => setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.'))
      .finally(() => setLoading(false));
  }, [moduleName]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat data modul {moduleLabel}…</p>
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
                <div className="section-subtitle">{moduleLabel}</div>
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
                <div className="section-subtitle">{data.tableData.length} baris data</div>
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
