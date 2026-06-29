import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { CheckCircle, XCircle, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Bot, Sparkles, Download, FileText, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type {
  FinanceApproval, ApprovalStatus,
  CashflowData, CashflowChartPoint, CashflowAiInsight
} from '../types/finance-employee';
import type { ReportFilter } from '../types';
import ReportFilterBar from '../components/ReportFilterBar';
import { financeApi, aiApi } from '../api';
import { ErrorState } from '../components/ui/ErrorState';
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



// ── Tab Type ─────────────────────────────────────────────────────────
type FinanceTab = 'approval' | 'cashflow';
type ApprovalSortKey = 'requestedAt' | 'nominal' | 'status' | 'kitchenName';
type TransactionSortKey = 'tanggal' | 'nominal' | 'type';

const EMPTY_FILTER: ReportFilter = { reportType: '', startDate: '', endDate: '' };
const APPROVAL_PAGE_SIZE = 8;
const TRANSACTION_PAGE_SIZE = 10;

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
const FinancePage: React.FC<{ userRole?: string }> = ({ userRole }) => {
  const [tab, setTab] = useState<FinanceTab>('approval');
  const [approvals, setApprovals] = useState<FinanceApproval[]>([]);
  const [cashflow, setCashflow] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>(EMPTY_FILTER);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState<ApprovalStatus | 'all'>('all');
  const [approvalSortKey, setApprovalSortKey] = useState<ApprovalSortKey>('requestedAt');
  const [approvalSortDir, setApprovalSortDir] = useState<'asc' | 'desc'>('desc');
  const [approvalPage, setApprovalPage] = useState(1);
  const [transactionSortKey, setTransactionSortKey] = useState<TransactionSortKey>('tanggal');
  const [transactionSortDir, setTransactionSortDir] = useState<'asc' | 'desc'>('desc');
  const [transactionPage, setTransactionPage] = useState(1);
  
  // AI States
  const [aiReport, setAiReport] = useState<CashflowAiInsight | null>(null);
  const [analyzingCashflow, setAnalyzingCashflow] = useState(false);

  // Fetch data based on active tab + filter
  const fetchData = useCallback(async (currentTab: FinanceTab, currentFilter: ReportFilter) => {
    setLoading(true);
    setError(null);
    try {
      if (currentTab === 'approval') {
        const res = await financeApi.getApprovals(currentFilter);
        setApprovals(res.data);
      } else {
        const res = await financeApi.getCashflow(currentFilter);
        setCashflow(res);
      }
    } catch (err) {
      console.error('Finance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memuat data keuangan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(tab, filter); }, [tab, filter, fetchData]);
  useEffect(() => { setApprovalPage(1); setTransactionPage(1); }, [tab, search, approvalStatusFilter, filter]);

  // Handle approve/reject
  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(id);
    try {
      await financeApi.updateApproval(id, action);
      setApprovals(prev =>
        prev.map(a => a.id === id ? { ...a, status: action === 'approve' ? 'Approved' : 'Rejected' } : a)
      );
      fetchData(tab, filter);
    } catch (err) {
      console.error('Approval action error:', err);
      setError(err instanceof Error ? err.message : 'Gagal memperbarui approval.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyzeRequest = async (id: string) => {
    setActionLoading(`ai-${id}`);
    try {
      const res = await financeApi.analyzeRequest(id);
      setApprovals(prev => prev.map(a => a.id === id ? { ...a, aiNotes: res } : a));
    } catch (err) {
      console.error('AI Request analysis error:', err);
      setError(err instanceof Error ? err.message : 'Gagal menjalankan audit AI.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnalyzeCashflow = async () => {
    setAnalyzingCashflow(true);
    try {
      const res = await financeApi.analyzeCashflow();
      setAiReport(res);

      const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
      await aiApi.saveHistory({
        module_name: 'keuangan',
        module_label: 'Keuangan — Audit Cashflow AI',
        kitchen_id: null,
        kitchen_name: null,
        prediction_date: nowStr,
        prediction_result: res as any,
      });
    } catch (err) {
      console.error('AI Cashflow analysis error:', err);
      setError(err instanceof Error ? err.message : 'Gagal menganalisis cashflow.');
    } finally {
      setAnalyzingCashflow(false);
    }
  };

  const handleFilterChange = (f: ReportFilter) => {
    if (f.reportType === 'custom' && (!f.startDate || !f.endDate)) { setFilter(f); return; }
    setFilter(f);
  };

  const handleExport = async (fmt: 'xlsx' | 'pdf') => {
    setExporting(true);
    try {
      const type = tab === 'approval' ? 'approvals' : 'cashflow';
      await financeApi.exportData(type, fmt, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export gagal.');
    }
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

  const filteredApprovals = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = approvals.filter((item) => {
      const matchesStatus = approvalStatusFilter === 'all' || item.status === approvalStatusFilter;
      const haystack = [
        item.id,
        item.kitchenName,
        item.keperluan,
        item.requestedBy,
        item.requestedAt,
        item.status,
      ].join(' ').toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });

    return [...rows].sort((a, b) => {
      const aVal = a[approvalSortKey];
      const bVal = b[approvalSortKey];
      const direction = approvalSortDir === 'asc' ? 1 : -1;
      if (approvalSortKey === 'nominal') return (Number(aVal) - Number(bVal)) * direction;
      return String(aVal).localeCompare(String(bVal), 'id-ID') * direction;
    });
  }, [approvals, approvalSortDir, approvalSortKey, approvalStatusFilter, search]);

  const approvalTotalPages = Math.max(1, Math.ceil(filteredApprovals.length / APPROVAL_PAGE_SIZE));
  const approvalRows = filteredApprovals.slice((approvalPage - 1) * APPROVAL_PAGE_SIZE, approvalPage * APPROVAL_PAGE_SIZE);

  const filteredTransactions = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = (cashflow?.transactions ?? []).filter((item) => {
      const haystack = [item.id, item.tanggal, item.keterangan, item.type].join(' ').toLowerCase();
      return !q || haystack.includes(q);
    });

    return [...rows].sort((a, b) => {
      const direction = transactionSortDir === 'asc' ? 1 : -1;
      if (transactionSortKey === 'nominal') return (a.nominal - b.nominal) * direction;
      return String(a[transactionSortKey]).localeCompare(String(b[transactionSortKey]), 'id-ID') * direction;
    });
  }, [cashflow?.transactions, search, transactionSortDir, transactionSortKey]);

  const transactionTotalPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTION_PAGE_SIZE));
  const transactionRows = filteredTransactions.slice((transactionPage - 1) * TRANSACTION_PAGE_SIZE, transactionPage * TRANSACTION_PAGE_SIZE);

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
      <div className="finance-toolbar">
        <div className="finance-search-wrap">
          <Search size={15} className="finance-search-icon" />
          <input
            className="finance-search-input"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tab === 'approval' ? 'Cari ID, dapur, keperluan, pemohon...' : 'Cari transaksi, tanggal, keterangan...'}
          />
        </div>

        {tab === 'approval' ? (
          <>
            <select
              className="finance-control"
              value={approvalStatusFilter}
              onChange={(event) => setApprovalStatusFilter(event.target.value as ApprovalStatus | 'all')}
            >
              <option value="all">Semua Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="finance-control"
              value={approvalSortKey}
              onChange={(event) => setApprovalSortKey(event.target.value as ApprovalSortKey)}
            >
              <option value="requestedAt">Urut Tanggal</option>
              <option value="nominal">Urut Nominal</option>
              <option value="status">Urut Status</option>
              <option value="kitchenName">Urut Dapur</option>
            </select>
            <button className="finance-sort-toggle" onClick={() => setApprovalSortDir((value) => value === 'asc' ? 'desc' : 'asc')}>
              {approvalSortDir === 'asc' ? 'Naik' : 'Turun'}
            </button>
          </>
        ) : (
          <>
            <select
              className="finance-control"
              value={transactionSortKey}
              onChange={(event) => setTransactionSortKey(event.target.value as TransactionSortKey)}
            >
              <option value="tanggal">Urut Tanggal</option>
              <option value="nominal">Urut Nominal</option>
              <option value="type">Urut Tipe</option>
            </select>
            <button className="finance-sort-toggle" onClick={() => setTransactionSortDir((value) => value === 'asc' ? 'desc' : 'asc')}>
              {transactionSortDir === 'asc' ? 'Naik' : 'Turun'}
            </button>
          </>
        )}
      </div>

      {error && !loading && (
        <div className="bento-card">
          <ErrorState message={error} onRetry={() => fetchData(tab, filter)} compact />
        </div>
      )}

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
                  {approvals.filter(a => a.status === 'Pending').length} pending - {filteredApprovals.length} ditampilkan dari {approvals.length} total
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
                  {approvalRows.length === 0 && (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        Tidak ada approval yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  )}
                  {approvalRows.map(a => (
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
            {filteredApprovals.length > APPROVAL_PAGE_SIZE && (
              <div className="finance-pagination">
                <span>Halaman {approvalPage} dari {approvalTotalPages}</span>
                <div className="finance-pagination-actions">
                  <button disabled={approvalPage === 1} onClick={() => setApprovalPage((page) => Math.max(1, page - 1))}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button disabled={approvalPage === approvalTotalPages} onClick={() => setApprovalPage((page) => Math.min(approvalTotalPages, page + 1))}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
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
                <div className="section-subtitle">{filteredTransactions.length} ditampilkan dari {cashflow.transactions.length} transaksi terbaru</div>
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
                  {transactionRows.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                        Tidak ada transaksi yang cocok dengan filter saat ini.
                      </td>
                    </tr>
                  )}
                  {transactionRows.map(t => (
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
            {filteredTransactions.length > TRANSACTION_PAGE_SIZE && (
              <div className="finance-pagination">
                <span>Halaman {transactionPage} dari {transactionTotalPages}</span>
                <div className="finance-pagination-actions">
                  <button disabled={transactionPage === 1} onClick={() => setTransactionPage((page) => Math.max(1, page - 1))}>
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button disabled={transactionPage === transactionTotalPages} onClick={() => setTransactionPage((page) => Math.min(transactionTotalPages, page + 1))}>
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default FinancePage;
