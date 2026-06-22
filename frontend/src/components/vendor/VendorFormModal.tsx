import React, { useState } from 'react';
import { X, Store } from 'lucide-react';
import type { CreateVendorDTO } from '../../types';
import { createVendor } from '../../services/vendorService';

interface VendorFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const VendorFormModal: React.FC<VendorFormModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState<CreateVendorDTO>({
    name: '', email: '', contact_person: '', phone: '', address: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateVendorDTO, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Partial<Record<keyof CreateVendorDTO, string>> = {};
    if (!form.name.trim()) e.name = 'Nama vendor wajib diisi';
    if (!form.email.trim()) e.email = 'Email wajib diisi';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Format email tidak valid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setServerError('');
    try {
      await createVendor(form);
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || 'Gagal menyimpan vendor';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof CreateVendorDTO, label: string, required = false, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label} {required && <span style={{ color: '#EF4444' }}>*</span>}
      </label>
      <input
        type={type}
        value={form[key] || ''}
        onChange={e => { setForm({ ...form, [key]: e.target.value }); setErrors({}); }}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '10px 14px', boxSizing: 'border-box',
          background: 'var(--bg-surface)',
          border: `1.5px solid ${errors[key] ? '#EF4444' : 'var(--border-default)'}`,
          borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
          outline: 'none', fontFamily: 'inherit',
        }}
      />
      {errors[key] && <p style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{errors[key]}</p>}
    </div>
  );

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 1000, width: '100%', maxWidth: 500,
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 16, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(99,102,241,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Store size={18} color="#6366F1" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Tambah Vendor Baru</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {field('name', 'Nama Vendor', true, 'text', 'PT. Nama Vendor')}
          {field('email', 'Email', true, 'email', 'vendor@email.com')}
          {field('contact_person', 'Nama PIC / Kontak', false, 'text', 'Nama penanggung jawab')}
          {field('phone', 'Nomor Telepon', false, 'tel', '08xxxxxxxxxx')}
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Alamat</label>
            <textarea
              value={form.address || ''}
              onChange={e => setForm({ ...form, address: e.target.value })}
              placeholder="Alamat lengkap vendor"
              rows={2}
              style={{
                width: '100%', padding: '10px 14px', boxSizing: 'border-box',
                background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)',
                borderRadius: 8, color: 'var(--text-primary)', fontSize: 14,
                outline: 'none', fontFamily: 'inherit', resize: 'vertical',
              }}
            />
          </div>

          {serverError && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#EF4444', fontSize: 13 }}>
              {serverError}
            </div>
          )}

          <div style={{ padding: '8px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
            ℹ️ Vendor akan didaftarkan dengan status <strong>Pending</strong> dan memerlukan persetujuan Admin Procurement.
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '10px', background: 'var(--bg-surface)', border: '1.5px solid var(--border-default)', borderRadius: 8, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
              Batal
            </button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '10px', background: loading ? 'var(--bg-interactive)' : '#6366F1', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {loading ? (
                <><div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid #fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Menyimpan...</>
              ) : 'Daftarkan Vendor'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default VendorFormModal;
