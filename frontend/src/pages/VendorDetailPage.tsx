import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Store, CheckCircle, XCircle,
  Clock, User, MapPin, Phone, Mail, FileText, History,
} from 'lucide-react';
import type { Vendor, VendorApprovalLog } from '../types';
import { vendorApi } from '../api';
import VendorStatusBadge from '../components/vendor/VendorStatusBadge';
import RejectModal from '../components/vendor/RejectModal';

interface VendorDetailPageProps {
  vendorId: number;
  userRole?: string;
  onBack?: () => void;
}

const VendorDetailPage: React.FC<VendorDetailPageProps> = ({ vendorId, userRole, onBack }) => {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [logs, setLogs] = useState<VendorApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [notes, setNotes] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const canApprove = !userRole || userRole === 'admin' || userRole === 'super_admin' || userRole === 'procurement';

  // TODO: Uncomment saat API Bahan Baku & Pemasok (Vendor) dari tim sudah deploy
  const fetchData = async () => {
    setLoading(true);
    try {
      /*
      const [v, l] = await Promise.all([
        vendorApi.getById(vendorId),
        vendorApi.getLogs(vendorId),
      ]);
      setVendor(v);
      setLogs(l);
      */
      // [BYPASS] Set data kosong agar UI tidak crash
      console.warn('[BYPASS] fetchData vendor detail dilewati — API Vendor belum tersedia.');
      setVendor(null);
      setLogs([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [vendorId]);

  // TODO: Uncomment saat API Bahan Baku & Pemasok (Vendor) dari tim sudah deploy
  const handleApprove = async () => {
    if (!vendor) return;
    setApproving(true);
    try {
      /*
      const updated = await vendorApi.approve(vendor.id, { notes });
      setVendor(updated);
      setLogs(await vendorApi.getLogs(vendor.id));
      setActionMsg('✅ Vendor berhasil disetujui!');
      setTimeout(() => setActionMsg(''), 3000);
      */
      // [BYPASS] Approve dilewati
      console.warn('[BYPASS] handleApprove dilewati — API Vendor belum tersedia.');
      setActionMsg('⚠️ Approve belum tersedia (API belum deploy)');
      setTimeout(() => setActionMsg(''), 3000);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 'Gagal menyetujui vendor';
      setActionMsg(`❌ ${msg}`);
    } finally {
      setApproving(false);
    }
  };

  // TODO: Uncomment saat API Bahan Baku & Pemasok (Vendor) dari tim sudah deploy
  const handleReject = async (_reason: string, _rejectNotes: string) => {
    if (!vendor) return;
    /*
    const updated = await vendorApi.reject(vendor.id, { reason: _reason, notes: _rejectNotes });
    setVendor(updated);
    setLogs(await vendorApi.getLogs(vendor.id));
    setActionMsg('Vendor berhasil ditolak.');
    setTimeout(() => setActionMsg(''), 3000);
    */
    // [BYPASS] Reject dilewati
    console.warn('[BYPASS] handleReject dilewati — API Vendor belum tersedia.');
    setActionMsg('⚠️ Reject belum tersedia (API belum deploy)');
    setTimeout(() => setActionMsg(''), 3000);
  };

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ width: 28, height: 28, border: '3px solid var(--border-default)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
        Memuat data vendor...
      </div>
    );
  }

  if (!vendor) {
    return <div style={{ padding: 48, textAlign: 'center', color: '#EF4444' }}>Vendor tidak ditemukan.</div>;
  }

  const isPending  = vendor.approval_status === 'pending';
  const isApproved = vendor.approval_status === 'approved';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 0 48px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600, padding: '0 0 20px', fontFamily: 'inherit' }}
      >
        <ArrowLeft size={15} /> Kembali ke Daftar Vendor
      </button>

      {/* Action message */}
      {actionMsg && (
        <div style={{ padding: '12px 16px', background: actionMsg.startsWith('❌') ? 'rgba(239,68,68,0.1)' : 'rgba(34,160,107,0.1)', border: `1px solid ${actionMsg.startsWith('❌') ? 'rgba(239,68,68,0.3)' : 'rgba(34,160,107,0.3)'}`, borderRadius: 10, marginBottom: 16, fontSize: 14, fontWeight: 600, color: actionMsg.startsWith('❌') ? '#EF4444' : '#22A06B' }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* ── Left: Vendor Info ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Header card */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 14, padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                }}>
                  <Store size={22} color="#fff" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>{vendor.name}</h2>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>ID #{vendor.id}</div>
                </div>
              </div>
              <VendorStatusBadge status={vendor.approval_status} />
            </div>

            {/* Info fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: <User size={14} />, label: 'PIC', value: vendor.contact_person || '—' },
                { icon: <Phone size={14} />, label: 'Telepon', value: vendor.phone || '—' },
                { icon: <Mail size={14} />, label: 'Email', value: vendor.email },
                { icon: <Clock size={14} />, label: 'Tgl Daftar', value: vendor.created_at ? new Date(vendor.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' }) : '—' },
              ].map(info => (
                <div key={info.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                    {info.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{info.label}</div>
                    <div style={{ fontSize: 13.5, color: 'var(--text-primary)', marginTop: 2 }}>{info.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {vendor.address && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-default)', display: 'flex', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                  <MapPin size={14} />
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>Alamat</div>
                  <div style={{ fontSize: 13.5, color: 'var(--text-primary)', marginTop: 2 }}>{vendor.address}</div>
                </div>
              </div>
            )}
          </div>

          {/* Approval info (if not pending) */}
          {!isPending && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileText size={15} /> Informasi Persetujuan
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {isApproved && (
                  <>
                    <InfoRow label="Disetujui Oleh" value={vendor.approver_name || '—'} />
                    <InfoRow label="Tanggal Disetujui" value={vendor.approved_at ? new Date(vendor.approved_at).toLocaleString('id-ID') : '—'} />
                    {vendor.approval_notes && <InfoRow label="Catatan" value={vendor.approval_notes} />}
                  </>
                )}
                {!isApproved && (
                  <>
                    {vendor.rejection_reason && <InfoRow label="Alasan Penolakan" value={vendor.rejection_reason} highlight="red" />}
                    {vendor.approval_notes && <InfoRow label="Catatan" value={vendor.approval_notes} />}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Approval Actions + History ──────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Action card */}
          {canApprove && isPending && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: 24 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Tindakan Persetujuan
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
                Vendor ini menunggu tinjauan Anda.
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Catatan Persetujuan <span style={{ fontWeight: 400 }}>(opsional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Tambahkan catatan..."
                  rows={3}
                  style={{ width: '100%', padding: '9px 12px', boxSizing: 'border-box', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 8, color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical' }}
                />
              </div>

              <button
                onClick={handleApprove}
                disabled={approving}
                style={{ width: '100%', padding: '10px', marginBottom: 8, background: approving ? 'var(--bg-interactive)' : '#22A06B', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: approving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, transition: 'background 0.2s' }}
              >
                {approving ? (
                  <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Memproses...</>
                ) : (
                  <><CheckCircle size={16} /> Setujui Vendor</>
                )}
              </button>

              <button
                onClick={() => setShowReject(true)}
                style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}
              >
                <XCircle size={16} /> Tolak Vendor
              </button>
            </div>
          )}

          {/* Approval History */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 14, padding: 24 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
              <History size={15} /> Riwayat Persetujuan ({logs.length})
            </div>

            {logs.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>Belum ada riwayat</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {logs.map((log, idx) => (
                  <div key={log.id} style={{ display: 'flex', gap: 12, paddingBottom: idx < logs.length - 1 ? 16 : 0, position: 'relative' }}>
                    {idx < logs.length - 1 && (
                      <div style={{ position: 'absolute', left: 14, top: 28, bottom: 0, width: 1, background: 'var(--border-default)' }} />
                    )}
                    {/* Dot */}
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: getLogColor(log.action).bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
                      {getLogIcon(log.action)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {getLogLabel(log.action)}
                        {log.new_status && (
                          <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, padding: '1px 7px', borderRadius: 10, background: getStatusBg(log.new_status), color: getStatusColor(log.new_status) }}>
                            {log.new_status}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>
                        {log.actor_name || 'System'} • {log.created_at ? new Date(log.created_at).toLocaleString('id-ID') : ''}
                      </div>
                      {log.notes && (
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, padding: '6px 10px', background: 'var(--bg-surface)', borderRadius: 6, borderLeft: '3px solid var(--border-default)' }}>
                          {log.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showReject && vendor && (
        <RejectModal
          vendorName={vendor.name}
          onConfirm={handleReject}
          onClose={() => setShowReject(false)}
        />
      )}
    </div>
  );
};

const InfoRow: React.FC<{ label: string; value: string; highlight?: string }> = ({ label, value, highlight }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.4 }}>{label}</div>
    <div style={{ fontSize: 13.5, color: highlight === 'red' ? '#EF4444' : 'var(--text-primary)', marginTop: 2, fontWeight: highlight ? 600 : 400 }}>{value}</div>
  </div>
);

function getLogColor(action: string) {
  if (action === 'approved') return { bg: 'rgba(34,160,107,0.15)', color: '#22A06B' };
  if (action === 'rejected') return { bg: 'rgba(239,68,68,0.15)', color: '#EF4444' };
  return { bg: 'rgba(99,102,241,0.12)', color: '#6366F1' };
}

function getLogIcon(action: string) {
  const c = getLogColor(action);
  if (action === 'approved') return <CheckCircle size={13} color={c.color} />;
  if (action === 'rejected') return <XCircle size={13} color={c.color} />;
  return <Store size={13} color={c.color} />;
}

function getLogLabel(action: string) {
  const m: Record<string, string> = { approved: 'Disetujui', rejected: 'Ditolak', created: 'Didaftarkan', updated: 'Diperbarui' };
  return m[action] || action;
}

function getStatusBg(status: string) {
  if (status === 'approved') return 'rgba(34,160,107,0.12)';
  if (status === 'rejected') return 'rgba(239,68,68,0.12)';
  return 'rgba(245,158,11,0.12)';
}
function getStatusColor(status: string) {
  if (status === 'approved') return '#15803D';
  if (status === 'rejected') return '#B91C1C';
  return '#D97706';
}

export default VendorDetailPage;
