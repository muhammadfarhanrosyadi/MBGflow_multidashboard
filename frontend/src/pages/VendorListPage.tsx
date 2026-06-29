import React, { useState, useEffect, useCallback } from 'react';
import {
  Store, Plus, Search, Download, FileText,
  CheckCircle, XCircle, Edit3, Trash2, Eye,
  RefreshCw,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import type { Vendor, ReportFilter } from '../types';
import { vendorApi } from '../api';
import VendorStatusBadge from '../components/vendor/VendorStatusBadge';
import ReportFilterBar from '../components/ReportFilterBar';
import VendorFormModal from '../components/vendor/VendorFormModal';

const EMPTY_FILTER: ReportFilter = { reportType: '', startDate: '', endDate: '' };

const STATUS_COLORS: Record<string, string> = {
  pending:  '#F59E0B',
  approved: '#22A06B',
  rejected: '#EF4444',
};

interface VendorListPageProps {
  userRole?: string;
  onNavigate?: (page: string) => void;
}

const VendorListPage: React.FC<VendorListPageProps> = ({ userRole, onNavigate }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [reportFilter, setReportFilter] = useState<ReportFilter>(EMPTY_FILTER);
  const [exporting, setExporting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const canManage = !userRole || userRole === 'admin' || userRole === 'super_admin' || userRole === 'procurement';

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await vendorApi.getAll({
        ...reportFilter,
        ...(statusFilter ? { approval_status: statusFilter } : {}),
      });
      setVendors(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [reportFilter, statusFilter]);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // Filtered by search
  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      (v.email || '').toLowerCase().includes(q) ||
      (v.contact_person || '').toLowerCase().includes(q) ||
      (v.phone || '').toLowerCase().includes(q)
    );
  });

  // Chart data
  const pieData = [
    { name: 'Pending',  value: vendors.filter(v => v.approval_status === 'pending').length  },
    { name: 'Approved', value: vendors.filter(v => v.approval_status === 'approved').length },
    { name: 'Rejected', value: vendors.filter(v => v.approval_status === 'rejected').length },
  ].filter(d => d.value > 0);

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(true);
    try {
      await vendorApi.exportData(format, reportFilter);
    } catch {
      alert('Gagal mengunduh laporan.');
    } finally {
      setExporting(false);
    }
  };

  const handleFormSuccess = () => { setShowForm(false); fetchVendors(); };

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: 24, flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}>
            <Store size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              Manajemen Vendor
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {vendors.length} vendor terdaftar
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport('xlsx')}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <Download size={14} /> Excel
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-default)', borderRadius: 8,
              color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
              cursor: exporting ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            <FileText size={14} /> PDF
          </button>
          {canManage && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 16px', background: 'var(--accent-primary)',
                border: 'none', borderRadius: 8, color: '#fff',
                fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 3px 12px rgba(27,107,69,0.3)',
              }}
            >
              <Plus size={15} /> Tambah Vendor
            </button>
          )}
        </div>
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, marginBottom: 24 }}>
        {/* Bar chart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 14, padding: '20px 24px',
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
            Distribusi Status Vendor
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={[
              { label: 'Pending',  value: vendors.filter(v => v.approval_status === 'pending').length  },
              { label: 'Approved', value: vendors.filter(v => v.approval_status === 'approved').length },
              { label: 'Rejected', value: vendors.filter(v => v.approval_status === 'rejected').length },
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" />
              <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 8 }}
                labelStyle={{ color: 'var(--text-primary)', fontWeight: 700 }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[{ color: '#F59E0B' }, { color: '#22A06B' }, { color: '#EF4444' }].map((c, i) => (
                  <Cell key={i} fill={c.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 14, padding: '20px 24px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
            Proporsi
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#999'} />
                  ))}
                </Pie>
                <Legend iconType="circle" iconSize={8} formatter={v => (
                  <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{v}</span>
                )} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              Tidak ada data
            </div>
          )}
        </div>
      </div>

      {/* ── Filters bar ────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 360 }}>
          <Search size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari nama, email, PIC..."
            style={{
              width: '100%', paddingLeft: 34, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
              borderRadius: 8, color: 'var(--text-primary)', fontSize: 13,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px', background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)', borderRadius: 8,
            color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        {/* Date filter */}
        <ReportFilterBar
          value={reportFilter}
          onChange={setReportFilter}
          onReset={() => setReportFilter(EMPTY_FILTER)}
        />

        <button
          onClick={fetchVendors}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '8px 12px', background: 'var(--bg-surface)',
            border: '1.5px solid var(--border-default)', borderRadius: 8,
            color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 14, overflow: 'hidden',
      }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{
              width: 28, height: 28, border: '3px solid var(--border-default)',
              borderTop: '3px solid var(--accent-primary)', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
            }} />
            Memuat data vendor...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Store size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
            Tidak ada vendor ditemukan
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-default)' }}>
                  {['Nama Vendor', 'PIC', 'Telepon', 'Email', 'Alamat', 'Status', 'Tgl Daftar', 'Aksi'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 11.5,
                      fontWeight: 700, color: 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: 0.5, whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, idx) => (
                  <tr
                    key={v.id}
                    style={{
                      borderBottom: '1px solid var(--border-default)',
                      background: idx % 2 === 0 ? 'transparent' : 'var(--bg-surface)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-interactive)')}
                    onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'var(--bg-surface)')}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{v.name}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {v.contact_person || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {v.phone || '—'}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
                      {v.email}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', maxWidth: 180 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.address || '—'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <VendorStatusBadge status={v.approval_status} />
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {v.created_at ? new Date(v.created_at).toLocaleDateString('id-ID') : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          onClick={() => onNavigate?.(`vendors-detail-${v.id}`)}
                          title="Lihat Detail"
                          style={actionBtnStyle('#6366F1')}
                        >
                          <Eye size={13} />
                        </button>
                        {canManage && v.approval_status === 'pending' && (
                          <>
                            <button
                              onClick={() => onNavigate?.(`vendors-detail-${v.id}`)}
                              title="Setujui"
                              style={actionBtnStyle('#22A06B')}
                            >
                              <CheckCircle size={13} />
                            </button>
                            <button
                              onClick={() => onNavigate?.(`vendors-detail-${v.id}`)}
                              title="Tolak"
                              style={actionBtnStyle('#EF4444')}
                            >
                              <XCircle size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '10px 16px', borderTop: '1px solid var(--border-default)',
          fontSize: 12, color: 'var(--text-muted)',
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span>Menampilkan {filtered.length} dari {vendors.length} vendor</span>
          {exporting && <span style={{ color: 'var(--accent-primary)' }}>Mengekspor...</span>}
        </div>
      </div>

      {/* Vendor Form Modal */}
      {showForm && (
        <VendorFormModal onClose={() => setShowForm(false)} onSuccess={handleFormSuccess} />
      )}
    </div>
  );
};

function actionBtnStyle(color: string) {
  return {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 7,
    background: `${color}18`, border: `1px solid ${color}35`,
    color, cursor: 'pointer' as const, transition: 'all 0.15s',
  };
}

export default VendorListPage;
