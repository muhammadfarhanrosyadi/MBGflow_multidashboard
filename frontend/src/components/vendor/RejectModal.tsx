import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface RejectModalProps {
  vendorName: string;
  onConfirm: (reason: string, notes: string) => Promise<void>;
  onClose: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({ vendorName, onConfirm, onClose }) => {
  const [reason, setReason] = useState('');
  const [notes, setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<{ reason?: string }>({});

  const validate = () => {
    const e: { reason?: string } = {};
    if (!reason.trim()) e.reason = 'Alasan penolakan wajib diisi';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await onConfirm(reason.trim(), notes.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        width: '100%', maxWidth: 480,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 16,
        boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-default)',
          background: 'rgba(239,68,68,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertTriangle size={18} color="#EF4444" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                Tolak Vendor
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                {vendorName}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Reason */}
          <div>
            <label style={{
              display: 'block', fontSize: 12.5, fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: 6,
            }}>
              Alasan Penolakan <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => { setReason(e.target.value); setErrors({}); }}
              placeholder="Contoh: Dokumen legalitas tidak lengkap"
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg-surface)',
                border: `1.5px solid ${errors.reason ? '#EF4444' : 'var(--border-default)'}`,
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
            {errors.reason && (
              <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors.reason}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label style={{
              display: 'block', fontSize: 12.5, fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: 6,
            }}>
              Catatan Tambahan <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Catatan detail untuk vendor (contoh: perlu update SIUP tahun 2026)"
              rows={3}
              style={{
                width: '100%', padding: '10px 14px',
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1, padding: '10px', background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)', borderRadius: 8,
                color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1, padding: '10px',
                background: loading ? 'var(--bg-interactive)' : '#EF4444',
                border: 'none', borderRadius: 8, color: '#fff',
                fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', transition: 'background 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)',
                    borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                  }} />
                  Memproses...
                </>
              ) : (
                'Tolak Vendor'
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default RejectModal;
