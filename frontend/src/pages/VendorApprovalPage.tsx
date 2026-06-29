import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle, XCircle, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import type { Vendor } from '../types';
import { vendorApi } from '../api';
import VendorStatusBadge from '../components/vendor/VendorStatusBadge';
import RejectModal from '../components/vendor/RejectModal';

interface VendorApprovalPageProps {
  userRole?: string;
  onNavigate?: (page: string) => void;
}

const VendorApprovalPage: React.FC<VendorApprovalPageProps> = ({ userRole, onNavigate }) => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Vendor | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string; type: 'success' | 'error' }>>([]);

  const canApprove = !userRole || userRole === 'master_admin' || userRole === 'admin' || userRole === 'super_admin' || userRole === 'procurement';

  const fetchPending = async () => {
    setLoading(true);
    try { setVendors(await vendorApi.getPending()); }
    catch { setVendors([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPending(); }, []);

  const toast = (msg: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };

  const handleApprove = async (v: Vendor) => {
    setActionLoadingId(v.id);
    try {
      await vendorApi.approve(v.id, {});
      setVendors(prev => prev.filter(x => x.id !== v.id));
      toast(`✅ ${v.name} berhasil disetujui`);
    } catch {
      toast(`❌ Gagal menyetujui vendor`, 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (reason: string, notes: string) => {
    if (!rejectTarget) return;
    await vendorApi.reject(rejectTarget.id, { reason, notes });
    setVendors(prev => prev.filter(x => x.id !== rejectTarget.id));
    toast(`Vendor ${rejectTarget.name} ditolak.`);
    setRejectTarget(null);
  };

  return (
    <div style={{ padding: '0 0 40px' }}>
      {/* Toast notifications */}
      <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            padding: '12px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600,
            background: t.type === 'success' ? 'rgba(34,160,107,0.95)' : 'rgba(239,68,68,0.95)',
            color: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            animation: 'slideInRight 0.3s ease',
          }}>
            {t.msg}
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #F59E0B, #D97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(245,158,11,0.35)',
          }}>
            <ClipboardCheck size={20} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
              Antrian Persetujuan
            </h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
              {vendors.length} vendor menunggu persetujuan
            </p>
          </div>
        </div>
        <button
          onClick={fetchPending}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
        </button>
      </div>

      {/* Banner if user can't approve */}
      {!canApprove && (
        <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#D97706', fontWeight: 600 }}>
          <AlertTriangle size={16} /> Role Anda tidak memiliki izin untuk approve/reject. Hanya Super Admin dan Procurement yang dapat melakukan tindakan ini.
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTop: '3px solid #F59E0B', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          Memuat antrian...
        </div>
      ) : vendors.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 14 }}>
          <CheckCircle size={48} color="#22A06B" style={{ display: 'block', margin: '0 auto 12px', opacity: 0.5 }} />
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Semua vendor telah ditinjau</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Tidak ada vendor yang menunggu persetujuan saat ini.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {vendors.map(v => (
            <div key={v.id} style={{
              background: 'var(--bg-card)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 14, padding: '20px 24px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16, alignItems: 'center',
              transition: 'box-shadow 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(245,158,11,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{v.name}</div>
                  <VendorStatusBadge status={v.approval_status} size="sm" />
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'PIC', val: v.contact_person || '—' },
                    { label: 'Email', val: v.email },
                    { label: 'Telepon', val: v.phone || '—' },
                    { label: 'Tgl Daftar', val: v.created_at ? new Date(v.created_at).toLocaleDateString('id-ID') : '—' },
                  ].map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{f.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 1 }}>{f.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => onNavigate?.(`vendors-detail-${v.id}`)}
                  title="Lihat Detail"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: 'rgba(99,102,241,0.08)', border: '1.5px solid rgba(99,102,241,0.25)', borderRadius: 8, color: '#6366F1', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  <Eye size={13} /> Detail
                </button>

                {canApprove && (
                  <>
                    <button
                      onClick={() => handleApprove(v)}
                      disabled={actionLoadingId === v.id}
                      title="Setujui"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: actionLoadingId === v.id ? 'var(--bg-interactive)' : 'rgba(34,160,107,0.1)', border: '1.5px solid rgba(34,160,107,0.3)', borderRadius: 8, color: '#22A06B', fontSize: 12, fontWeight: 700, cursor: actionLoadingId === v.id ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}
                    >
                      <CheckCircle size={13} /> Setujui
                    </button>
                    <button
                      onClick={() => setRejectTarget(v)}
                      disabled={actionLoadingId === v.id}
                      title="Tolak"
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#EF4444', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <XCircle size={13} /> Tolak
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {rejectTarget && (
        <RejectModal
          vendorName={rejectTarget.name}
          onConfirm={handleReject}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default VendorApprovalPage;
