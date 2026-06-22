import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Bot, Sparkles, Download, FileText } from 'lucide-react';
import type {
  Approval, ApprovalStatus,
  CashflowData, CashflowChartPoint, CashflowAiInsight
} from '../types/finance-employee';
import type { ReportFilter } from '../types';
import ReportFilterBar from '../components/ReportFilterBar';
import '../styles/finance.css';

// ── Helpers ────────────────────────────────────────────────────────────
const formatRupiah = (n: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ── Custom Recharts Tooltip ────────────────────────────────────────────
const CashflowTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="finance-chart-tooltip">
      <p className="finance-chart-tooltip-label">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, margin: '2px 0', fontWeight: 500 }}>
          {p.name}: <strong>{formatRupiah(p.value)}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Filter label helper ────────────────────────────────────────────────────
const filterLabel = (f: ReportFilter) => {
  if (!f.reportType) return 'Semua Periode';
  if (f.reportType === 'daily')   return 'Hari Ini';
  if (f.reportType === 'monthly') return 'Bulan Ini';
  if (f.reportType === 'yearly')  return 'Tahun Ini';
  if (f.reportType === 'custom' && f.startDate && f.endDate)
    return `${f.startDate} s/d ${f.endDate}`;
  return 'Kustom';
};

// ── Export helper ─────────────────────────────────────────────────────────
async function triggerFinanceExport(type: string, format: 'xlsx' | 'pdf', filter: ReportFilter) {
  const params = new URLSearchParams({ type, format });
  if (filter.reportType) params.set('reportType', filter.reportType);
  if (filter.startDate)  params.set('startDate',  filter.startDate);
  if (filter.endDate)    params.set('endDate',    filter.endDate);
  const res = await fetch(`http://localhost:5000/api/finance/export?${params}`);
  if (!res.ok) throw new Error('Export gagal');
  const blob = await res.blob();
  const url  = window.URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `finance_${type}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

// ── Tab Type ─────────────────────────────────────────────────────────
type FinanceTab = 'approval' | 'cashflow';

const EMPTY_FILTER: ReportFilter = { reportType: '', startDate: '', endDate: '' };

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const FinancePage: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [tab, setTab] = useState<FinanceTab>('approval');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>(EMPTY_FILTER);
  const [exporting, setExporting] = useState(false);
  
  // AI States
  const [aiReport, setAiReport] = useState<CashflowAiInsight | null>(null);
  const [analyzingCashflow, setAnalyzingCashflow] = useState(false);

  // Fetch data based on active tab + filter
  const fetchData = (currentTab: FinanceTab, currentFilter: ReportFilter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (currentFilter.reportType) params.set('reportType', currentFilter.reportType);
    if (currentFilter.startDate)  params.set('startDate',  currentFilter.startDate);
    if (currentFilter.endDate)    params.set('endDate',    currentFilter.endDate);
    const qs = params.toString() ? '?' + params : '';
    const url = currentTab === 'approval'
      ? `http://localhost:5000/api/finance/approvals${qs}`
      : `http://localhost:5000/api/finance/cashflow${qs}`;

    fetch(url)
      .then(r => r.json())
      .then(json => {
        if (json.success) {
          if (currentTab === 'approval') setApprovals(json.data);
          else setCashflow(json.data);
        }
      })
      .catch(err => console.error('Finance fetch error:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(tab, filter); }, [tab]);

  // Handle approve/reject
  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      const res = await fetch(`http://localhost:5000/api/finance/approvals/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setApprovals(prev =>
          prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a)
        );
      }
    } catch (err) {
      console.error('Approval action error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyzeRequest = async (id: string) => {
    setActionLoading(`ai-${id}`);
    try {
      const res = await fetch(`http://localhost:5000/api/finance/analyze-request/${id}`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setApprovals(prev => prev.map(a => a.id === id ? { ...a, aiNotes: json.data } : a));
      }
    } catch (err) {
      console.error('AI Request analysis error:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyzeCashflow = async () => {
    setAnalyzingCashflow(true);
    try {
      const res = await fetch('http://localhost:5000/api/finance/analyze-cashflow');
      const json = await res.json();
      if (json.success) {
        setAiReport(json.data);

        // ── Auto-save ke Universal AI History ────────────────────────
        const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
        fetch('http://localhost:5000/api/ai/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            module_name: 'keuangan',
            module_label: 'Keuangan — Audit Cashflow AI',
            kitchen_id: null,
            prediction_date: nowStr,
            prediction_result: json.data,
          }),
        }).then(r => r.json())
          .then(h => { if (h.success) console.log('[AI History] Cashflow audit saved ✓'); })
          .catch(err => console.warn('[AI History] Save cashflow failed (non-fatal):', err));
        // ── End auto-save ─────────────────────────────────────────────
      }
    } catch (err) {
      console.error('AI Cashflow analysis error:', err);
    } finally {
      setAnalyzingCashflow(false);
    }
  };

  const handleFilterChange = (f: ReportFilter) => {
    if (f.reportType === 'custom' && (!f.startDate || !f.endDate)) { setFilter(f); return; }
    setFilter(f);
    fetchData(tab, f);
  };

  const handleExport = async (fmt: 'xlsx' | 'pdf') => {
    setExporting(true);
    try {
      const type = tab === 'approval' ? 'approvals' : 'cashflow';
      await triggerFinanceExport(type, fmt, filter);
    } catch { alert('Export gagal.'); }
    finally { setExporting(false); }
  };

  // Status badge renderer
  const renderStatusBadge = (status: ApprovalStatus) => {
    const cls =
      status === 'Approved' ? 'finance-badge--approved' :
      status === 'Rejected' ? 'finance-badge--rejected' :
      'finance-badge--pending';
    return <span className={`finance-badge ${cls}`}>{status}</span>;
  };

  return (
    <div className="finance-page">
      {/* ── Tab Bar + Filter + Export ──────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 10, marginBottom: 2,
      }}>
        {/* Tabs */}
        <div className="finance-tab-bar" style={{ marginBottom: 0 }}>
          <button
            className={`finance-tab ${tab === 'approval' ? 'active' : ''}`}
            onClick={() => setTab('approval')}
          >
            💰 Approval Dana
          </button>
          {userRole !== 'user' && (
            <button
              className={`finance-tab ${tab === 'cashflow' ? 'active' : ''}`}
              onClick={() => setTab('cashflow')}
            >
              📊 Cash Flow
            </button>
          )}
        </div>

        {/* Filter + Export */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <ReportFilterBar
            value={filter}
            onChange={handleFilterChange}
            onReset={() => { setFilter(EMPTY_FILTER); fetchData(tab, EMPTY_FILTER); }}
          />
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting || loading}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', background: 'var(--bg-surface)',
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
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 12px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <FileText size={13} /> PDF
          </button>
        </div>
      </div>

      {/* Periode label */}
      {filter.reportType && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, paddingLeft: 2 }}>
          Menampilkan: <strong style={{ color: 'var(--accent-primary)' }}>{filterLabel(filter)}</strong>
        </div>
      )}

      {/* ── Loading ────────────────────────────────────────── */}
      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat data keuangan…</p>
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB 1: APPROVAL */}
      {/* ════════════════════════════════════════════════════ */}
      {!loading && tab === 'approval' && (
        <div className="finance-approval-section animate-fade-up">
          <section className="bento-card">
            <div className="section-header">
              <div>
                <div className="section-title">Permintaan Dana Dapur</div>
                <div className="section-subtitle">
                  {approvals.filter(a => a.status === 'Pending').length} pending • {approvals.length} total
                </div>
              </div>
            </div>

            <div className="module-table-wrap">
              <table className="module-table finance-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Dapur</th>
                    <th>Keperluan</th>
                    <th>Nominal</th>
                    <th>Pemohon</th>
                    <th>Tanggal</th>
                    <th>AI Insight</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {approvals.map(a => (
                    <tr key={a.id} className={a.status !== 'Pending' ? 'finance-row--decided' : ''}>
                      <td>
                        <span className="finance-id-tag">{a.id}</span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{a.kitchenName}</td>
                      <td>{a.keperluan}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatRupiah(a.nominal)}</td>
                      <td>{a.requestedBy}</td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{a.requestedAt}</td>
                      <td>
                        {a.aiNotes ? (
                          <div>
                            <span className={`finance-ai-badge ${a.aiNotes.score < 4 ? 'finance-ai-badge--green' : a.aiNotes.score < 8 ? 'finance-ai-badge--yellow' : 'finance-ai-badge--red'}`}>
                              <Bot size={13} />
                              Skor: {a.aiNotes.score}/10
                            </span>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, maxWidth: 200, lineHeight: 1.4 }}>
                              {a.aiNotes.reason}
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="finance-ai-btn" 
                            onClick={() => handleAnalyzeRequest(a.id)}
                            disabled={actionLoading === `ai-${a.id}`}
                          >
                            <Sparkles size={13} />
                            {actionLoading === `ai-${a.id}` ? 'Analyzing...' : 'Audit AI'}
                          </button>
                        )}
                      </td>
                      <td>{renderStatusBadge(a.status)}</td>
                      <td>
                        {a.status === 'Pending' ? (
                          <div className="finance-action-group">
                            <button
                              className="finance-btn finance-btn--approve"
                              disabled={actionLoading === a.id}
                              onClick={() => handleAction(a.id, 'approve')}
                            >
                              <CheckCircle size={14} />
                              Approve
                            </button>
                            <button
                              className="finance-btn finance-btn--reject"
                              disabled={actionLoading === a.id}
                              onClick={() => handleAction(a.id, 'reject')}
                            >
                              <XCircle size={14} />
                              Reject
                            </button>
                          </div>
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
        </div>
      )}

      {/* ════════════════════════════════════════════════════ */}
      {/* TAB 2: CASH FLOW */}
      {/* ════════════════════════════════════════════════════ */}
      {!loading && tab === 'cashflow' && cashflow && (
        <div className="finance-cashflow-section animate-fade-up">
          {/* Bento Grid: 1 big chart + 2 summary cards */}
          <div className="finance-bento-grid">
            {/* ── Chart Card (big) ──────────────── */}
            <section className="bento-card finance-chart-card">
              <div className="section-header">
                <div>
                  <div className="section-title">📈 Arus Kas Mingguan</div>
                  <div className="section-subtitle">{cashflow.summary.period}</div>
                </div>
                <button 
                  className="emp-btn emp-btn--primary" 
                  onClick={handleAnalyzeCashflow}
                  disabled={analyzingCashflow}
                  style={{ gap: 8, padding: '8px 14px' }}
                >
                  <Bot size={16} />
                  {analyzingCashflow ? 'AI Menganalisis...' : 'Minta Audit AI'}
                </button>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={cashflow.chartData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis dataKey="date" stroke="var(--border-default)" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="var(--border-default)" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}jt`} />
                  <Tooltip content={<CashflowTooltip />} />
                  <Bar dataKey="in" name="Pemasukan" fill="var(--accent-primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="out" name="Pengeluaran" fill="var(--color-danger)" radius={[6, 6, 0, 0]} opacity={0.75} />
                </BarChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="finance-chart-legend">
                <span className="finance-legend-item"><span className="finance-legend-dot" style={{ background: 'var(--accent-primary)' }} /> Pemasukan (In)</span>
                <span className="finance-legend-item"><span className="finance-legend-dot" style={{ background: 'var(--color-danger)' }} /> Pengeluaran (Out)</span>
              </div>
            </section>

            {/* ── Summary Cards (small) ─────────── */}
            <div className="finance-summary-stack">
              {/* Total In */}
              <section className="bento-card finance-summary-card finance-summary--in">
                <div className="finance-summary-icon-wrap finance-summary-icon--in">
                  <TrendingUp size={22} />
                </div>
                <div className="finance-summary-label">Total Pemasukan</div>
                <div className="finance-summary-value">{formatRupiah(cashflow.summary.totalIn)}</div>
                <div className="finance-summary-badge finance-summary-badge--in">
                  <ArrowUpRight size={13} /> +12.4% vs minggu lalu
                </div>
              </section>

              {/* Total Out */}
              <section className="bento-card finance-summary-card finance-summary--out">
                <div className="finance-summary-icon-wrap finance-summary-icon--out">
                  <TrendingDown size={22} />
                </div>
                <div className="finance-summary-label">Total Pengeluaran</div>
                <div className="finance-summary-value">{formatRupiah(cashflow.summary.totalOut)}</div>
                <div className="finance-summary-badge finance-summary-badge--out">
                  <ArrowDownLeft size={13} /> -3.1% vs minggu lalu
                </div>
              </section>

              {/* Net Balance */}
              <section className="bento-card finance-summary-card finance-summary--balance">
                <div className="finance-summary-label">Saldo Bersih</div>
                <div className="finance-summary-value" style={{ color: 'var(--accent-primary)' }}>
                  {formatRupiah(cashflow.summary.balance)}
                </div>
              </section>
            </div>
          </div>

          {/* ── AI Health Report (Shows only if generated) ── */}
          {aiReport && (
            <section className="bento-card finance-ai-report-card animate-fade-up">
              <div className="section-header" style={{ paddingBottom: 0, borderBottom: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ background: 'var(--accent-light)', color: 'var(--accent-primary)', padding: 8, borderRadius: 'var(--radius-md)' }}>
                    <Bot size={22} />
                  </div>
                  <div>
                    <div className="section-title" style={{ fontSize: 16 }}>AI Financial Health Report</div>
                    <div className="section-subtitle">Didukung oleh Google Gemini</div>
                  </div>
                </div>
              </div>
              <div className="finance-ai-report-content">
                <div className="finance-ai-report-item">
                  <h4>⚠️ Kebocoran Anggaran</h4>
                  <p>{aiReport.kebocoran_anggaran}</p>
                </div>
                <div className="finance-ai-report-item">
                  <h4>📊 Tren Pengeluaran</h4>
                  <p>{aiReport.tren_pengeluaran}</p>
                </div>
                <div className="finance-ai-report-item">
                  <h4>💡 Saran & Strategi</h4>
                  <p>{aiReport.saran}</p>
                </div>
              </div>
            </section>
          )}

          {/* ── Transaction List ───────────────── */}
          <section className="bento-card" style={{ marginTop: 18 }}>
            <div className="section-header">
              <div>
                <div className="section-title">Riwayat Transaksi</div>
                <div className="section-subtitle">{cashflow.transactions.length} transaksi terbaru</div>
              </div>
            </div>
            <div className="module-table-wrap">
              <table className="module-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tanggal</th>
                    <th>Keterangan</th>
                    <th>Tipe</th>
                    <th>Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {cashflow.transactions.map(t => (
                    <tr key={t.id}>
                      <td><span className="finance-id-tag">{t.id}</span></td>
                      <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{t.tanggal}</td>
                      <td>{t.keterangan}</td>
                      <td>
                        <span className={`finance-badge ${t.type === 'in' ? 'finance-badge--approved' : 'finance-badge--rejected'}`}>
                          {t.type === 'in' ? '↑ Masuk' : '↓ Keluar'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700, color: t.type === 'in' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {t.type === 'in' ? '+' : '-'}{formatRupiah(t.nominal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
