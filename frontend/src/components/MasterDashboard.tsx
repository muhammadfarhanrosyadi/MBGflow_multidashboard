import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';
import { TrendingUp, TrendingDown, Layers, UtensilsCrossed, AlertTriangle, Cpu, Wallet, Users, Clock, BadgeDollarSign } from 'lucide-react';
import AIAnalystPanel from './AIAnalystPanel';
import VendorDashboardWidget from './vendor/VendorDashboardWidget';

// ── Types ─────────────────────────────────────────────────────────────
interface KPI {
  id: string;
  title: string;
  value: string | number;
  unit: string | null;
  trend: number;
  status: 'normal' | 'warning' | 'critical';
  icon: string;
}

interface ChartPoint {
  date: string;
  efisiensi: number;
  konsumsi: number;
  pengiriman: number;
  target: number;
}

interface AlertRow {
  id: string;
  tanggal: string;
  modul: string;
  pesan: string;
  severity: 'high' | 'medium' | 'low';
  status: 'critical' | 'pending' | 'resolved';
}

interface DashboardData {
  kpis: KPI[];
  chartData: ChartPoint[];
  tableData: AlertRow[];
}

interface KitchenBalance {
  kitchenId: string;
  kitchenName: string;
  city: string;
  status: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  payroll: {
    totalSalary: number;
    totalEmployees: number;
    paidCount: number;
    unpaidCount: number;
    unpaidAmount: number;
  };
  pendingApproval: {
    count: number;
    amount: number;
  };
}

interface KitchenFinanceData {
  grandTotal: {
    totalIn: number;
    totalOut: number;
    balance: number;
    totalSalary: number;
    unpaidSalary: number;
    pendingApprovalAmount: number;
    pendingApprovalCount: number;
  };
  kitchens: KitchenBalance[];
}

const formatRupiah = (n: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ── Custom Tooltip ────────────────────────────────────────────────────
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

const WEEK_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

// Icon & color map for KPI cards
const KPI_CONFIG: Record<string, {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}> = {
  'Total Stok': {
    icon: <Layers size={20} />,
    iconBg: 'var(--accent-light)',
    iconColor: 'var(--accent-primary)',
  },
  'Dapur Aktif': {
    icon: <UtensilsCrossed size={20} />,
    iconBg: 'var(--color-info-dim)',
    iconColor: 'var(--color-info)',
  },
  'Stok Kritis': {
    icon: <AlertTriangle size={20} />,
    iconBg: 'var(--color-danger-dim)',
    iconColor: 'var(--color-danger)',
  },
  'Efisiensi AI': {
    icon: <Cpu size={20} />,
    iconBg: 'var(--color-purple-dim)',
    iconColor: 'var(--color-purple)',
  },
};

// ── KPI Card ──────────────────────────────────────────────────────────
const KPICard: React.FC<{ item: KPI }> = ({ item }) => {
  const cfg = KPI_CONFIG[item.title] || {
    icon: <Layers size={20} />,
    iconBg: 'var(--accent-light)',
    iconColor: 'var(--accent-primary)',
  };

  const isTrendUp = item.trend >= 0;
  const statusLabel = item.status === 'normal' ? 'Operational' : item.status === 'warning' ? 'Maintenance' : 'Kritis';
  const statusClass = item.status === 'normal' ? 'status-operational' : item.status === 'warning' ? 'status-maintenance' : 'status-pending';

  return (
    <article className="bento-card kpi-card" style={{ animation: 'fadeInUp 0.4s ease both' }}>
      {/* Header: icon + status badge */}
      <div className="kpi-card-header">
        <div
          className="kpi-icon-wrap"
          style={{ background: cfg.iconBg, color: cfg.iconColor }}
        >
          {cfg.icon}
        </div>
        <span className={`kpi-status-badge status-badge ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      {/* Value */}
      <div className="kpi-value">
        {item.value}
        {item.unit && (
          <span style={{ fontSize: '0.55em', fontWeight: 600, color: 'var(--text-secondary)', marginLeft: 4 }}>
            {item.unit}
          </span>
        )}
      </div>
      <div className="kpi-label">{item.title}</div>

      {/* Trend row */}
      <div className="kpi-trend">
        <span className={`kpi-trend-badge ${isTrendUp ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
          {isTrendUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {Math.abs(item.trend)}%
        </span>
        <span className="kpi-trend-text">dari minggu lalu</span>
      </div>
    </article>
  );
};

// ── Kitchen Finance Section ───────────────────────────────────────────
const KitchenFinanceSection: React.FC = () => {
  const [finData, setFinData] = useState<KitchenFinanceData | null>(null);
  const [loadingFin, setLoadingFin] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/finance/kitchen-balance')
      .then(r => r.json())
      .then(json => { if (json.success) setFinData(json.data); })
      .catch(() => {})
      .finally(() => setLoadingFin(false));
  }, []);

  if (loadingFin) return (
    <div className="loading-state" style={{ padding: 20 }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Memuat data keuangan…</p>
    </div>
  );
  if (!finData) return null;

  const g = finData.grandTotal;

  return (
    <>
      {/* Grand Total Cards — responsive: 4→2→1 cols */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 14,
      }}>
        <div className="bento-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: 10, borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Wallet size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>Saldo Total</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: g.balance >= 0 ? 'var(--accent-primary)' : 'var(--color-danger)' }}>
              {formatRupiah(g.balance)}
            </div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'var(--color-info-dim)', color: 'var(--color-info)', padding: 10, borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <BadgeDollarSign size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>Total Pemasukan</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatRupiah(g.totalIn)}
            </div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'var(--color-danger-dim)', color: 'var(--color-danger)', padding: 10, borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>Gaji Belum Dibayar</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: g.unpaidSalary > 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
              {formatRupiah(g.unpaidSalary)}
            </div>
          </div>
        </div>

        <div className="bento-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ background: 'rgba(251, 191, 36, 0.12)', color: '#d97706', padding: 10, borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>Approval Pending</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {formatRupiah(g.pendingApprovalAmount)}
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginLeft: 6 }}>({g.pendingApprovalCount} item)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Per Kitchen Table — scrollable on small screens */}
      <section className="bento-card" style={{ overflowX: 'auto' }}>
        <div className="section-header">
          <div>
            <div className="section-title">💰 Keuangan Per Dapur</div>
            <div className="section-subtitle">Saldo, penggajian, dan approval tiap dapur — data real-time</div>
          </div>
        </div>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="module-table" style={{ minWidth: 750 }}>
            <thead>
              <tr>
                <th>Dapur</th>
                <th>Kota</th>
                <th>Pemasukan</th>
                <th>Pengeluaran</th>
                <th>Saldo</th>
                <th>Gaji/Bulan</th>
                <th>Gaji Dibayar</th>
                <th>Belum Bayar</th>
                <th>Approval Pending</th>
              </tr>
            </thead>
            <tbody>
              {finData.kitchens.map(k => (
                <tr key={k.kitchenId}>
                  <td style={{ fontWeight: 700 }}>{k.kitchenName}</td>
                  <td>{k.city}</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>{formatRupiah(k.totalIn)}</td>
                  <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{formatRupiah(k.totalOut)}</td>
                  <td style={{ fontWeight: 800, color: k.balance >= 0 ? 'var(--accent-primary)' : 'var(--color-danger)' }}>
                    {formatRupiah(k.balance)}
                  </td>
                  <td>{formatRupiah(k.payroll.totalSalary)}</td>
                  <td>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.1)',
                      color: '#16a34a',
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {k.payroll.paidCount}/{k.payroll.totalEmployees}
                    </span>
                  </td>
                  <td>
                    {k.payroll.unpaidCount > 0 ? (
                      <span style={{
                        background: 'var(--color-danger-dim)',
                        color: 'var(--color-danger)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {k.payroll.unpaidCount} org • {formatRupiah(k.payroll.unpaidAmount)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>— Lunas</span>
                    )}
                  </td>
                  <td>
                    {k.pendingApproval.count > 0 ? (
                      <span style={{
                        background: 'rgba(251, 191, 36, 0.12)',
                        color: '#d97706',
                        padding: '3px 8px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontWeight: 600,
                      }}>
                        {k.pendingApproval.count} req • {formatRupiah(k.pendingApproval.amount)}
                      </span>
                    ) : (
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};


// ── Main Dashboard ────────────────────────────────────────────────────
interface MasterDashboardProps {
  onNavigate?: (page: string) => void;
}

const MasterDashboard: React.FC<MasterDashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard')
      .then(r => r.json())
      .then(json => {
        if (json.success) setData(json.data);
        else setError('Gagal memuat data dashboard.');
      })
      .catch(() => setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di port 5000.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat data dashboard global…</p>
    </div>
  );

  if (error) return <div className="error-state">❌ {error}</div>;
  if (!data) return null;

  const chartData = data.chartData.slice(0, 6).map((row, index) => ({
    ...row,
    day: WEEK_DAYS[index] || row.date,
  }));

  const selectedKpis = data.kpis.slice(0, 4);

  const statuses = ['Operational', 'Maintenance', 'Pending'] as const;
  const statusRows = data.tableData.slice(0, 6).map((row, index) => ({
    name: row.modul,
    status: statuses[index % statuses.length],
    pesan: row.pesan,
  }));

  const stockPercent = Math.max(
    0,
    Math.min(
      100,
      Number((selectedKpis.find((k) => /efisiensi/i.test(k.title))?.value ?? 78).toString().replace('%', '')),
    ),
  );

  const radialData = [{ name: 'Global Supply', value: stockPercent, fill: 'var(--accent-primary)' }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── KPI Cards ───────────────────────────────────────────────── */}
      <section className="bento-grid bento-kpi">
        {selectedKpis.map((kpi) => (
          <KPICard key={kpi.id} item={kpi} />
        ))}
      </section>

      {/* ── Vendor Approval Widget ───────────────────────────────────── */}
      <section className="bento-card" style={{ padding: '20px 24px' }}>
        <VendorDashboardWidget onNavigate={onNavigate} />
      </section>

      {/* ── Keuangan Dapur (Real-time) ───────────────────────────────── */}
      <KitchenFinanceSection />

      {/* ── Weekly Trend Chart ──────────────────────────────────────── */}
      <section className="bento-card">
        <div className="section-header">
          <div>
            <div className="section-title">Tren Mingguan SCM</div>
            <div className="section-subtitle">Efisiensi vs Target — Senin hingga Sabtu</div>
          </div>
          <button className="section-action-btn">Lihat Detail</button>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 0, left: -15 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis
              dataKey="day"
              stroke="var(--border-default)"
              tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--border-default)"
              tick={{ fontSize: 12, fill: 'var(--text-muted)', fontFamily: 'inherit' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<DarkTooltip />} />
            <Line
              type="monotone"
              dataKey="efisiensi"
              name="Efisiensi (%)"
              stroke="var(--accent-primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--accent-primary)', stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="var(--border-strong)"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      {/* ── Status + Supply Progress ────────────────────────────────── */}
      <section className="bento-grid bento-main">
        {/* Status Dapur */}
        <article className="bento-card">
          <div className="section-header">
            <div>
              <div className="section-title">Status Dapur Aktif</div>
              <div className="section-subtitle">{statusRows.length} unit terpantau</div>
            </div>
          </div>
          <div className="status-list">
            {statusRows.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="status-item">
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--text-primary)', display: 'block' }}>{item.name}</strong>
                  <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{item.pesan?.slice(0, 50) || 'Beroperasi normal'}</span>
                </div>
                <span
                  className={`status-badge ${
                    item.status === 'Operational'
                      ? 'status-operational'
                      : item.status === 'Maintenance'
                      ? 'status-maintenance'
                      : 'status-pending'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        {/* Supply Progress Donut */}
        <article className="bento-card">
          <div className="section-header">
            <div>
              <div className="section-title">Supply Progress</div>
              <div className="section-subtitle">Ketersediaan global</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart
              innerRadius="62%"
              outerRadius="92%"
              data={radialData}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar background dataKey="value" cornerRadius={10} />
              <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 30, fontWeight: 800, fill: 'var(--accent-primary)', fontFamily: 'inherit' }}>
                {stockPercent}%
              </text>
              <text x="50%" y="60%" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 12, fill: 'var(--text-secondary)', fontFamily: 'inherit' }}>
                Ketersediaan Global
              </text>
            </RadialBarChart>
          </ResponsiveContainer>

          {/* Legend row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--accent-primary)', display: 'inline-block' }} />
              Tersedia
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--border-default)', display: 'inline-block' }} />
              Tersisa
            </div>
          </div>
        </article>
      </section>

      {/* ── AI Analyst ─────────────────────────────────────────────── */}
      <section className="bento-card">
        <div className="section-header" style={{ marginBottom: 0 }}>
          <div>
            <div className="section-title">Insight AI SCM</div>
            <div className="section-subtitle">Analisis kontekstual berbasis data real-time</div>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <AIAnalystPanel
            moduleName="dashboard"
            moduleLabel="Dashboard Global SCM"
            moduleIcon="📊"
            tableData={data.tableData as unknown as Record<string, unknown>[]}
            chartData={data.chartData as unknown as Record<string, unknown>[]}
          />
        </div>
      </section>
    </div>
  );
};

export default MasterDashboard;
