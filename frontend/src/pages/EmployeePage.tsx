import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ChevronDown, Users, Filter, UserPlus, MoreVertical, Pencil, DollarSign, UserX, X, AlertTriangle, Download } from 'lucide-react';
import type { Employee, EmployeeRole, EmployeeStatus, KitchenGrouped } from '../types/finance-employee';
import { KITCHEN_OPTIONS, DEFAULT_SALARIES } from '../types/finance-employee';
import ReportFilterBar from '../components/ReportFilterBar';
import type { ReportFilter } from '../types';
import '../styles/employee.css';

const API = 'http://localhost:5000/api/employees';
const ROLE_CONFIG: Record<EmployeeRole, { label: string; className: string; emoji: string }> = {
  'Ahli Gizi':  { label: 'Ahli Gizi',  className: 'emp-role--gizi',   emoji: '🧪' },
  'Driver':     { label: 'Driver',      className: 'emp-role--driver', emoji: '🚗' },
  'Juru Masak': { label: 'Juru Masak',  className: 'emp-role--masak',  emoji: '👨‍🍳' },
};
const ALL_ROLES: EmployeeRole[] = ['Ahli Gizi', 'Driver', 'Juru Masak'];
const STATUS_CLASS: Record<EmployeeStatus, string> = { 'Active': 'emp-status--active', 'On Leave': 'emp-status--leave', 'Terminated': 'emp-status--terminated' };

const formatRupiah = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// ── Add Employee Modal ─────────────────────────────────────────────────
const AddModal: React.FC<{ onClose: () => void; onSaved: () => void }> = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({ name: '', email: '', role: 'Juru Masak' as EmployeeRole, kitchenId: 'K01', salary: DEFAULT_SALARIES['Juru Masak'] });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const handleRoleChange = (role: EmployeeRole) => { set('role', role); set('salary', DEFAULT_SALARIES[role]); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if ((await r.json()).success) { onSaved(); onClose(); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <h3>➕ Tambah Karyawan Baru</h3>
          <button className="emp-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="emp-modal-form">
          <label className="emp-form-label">Nama Lengkap
            <input className="emp-form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Nama karyawan" required />
          </label>
          <label className="emp-form-label">Email
            <input className="emp-form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@mbg.id" />
          </label>
          <label className="emp-form-label">Jabatan
            <select className="emp-form-input" value={form.role} onChange={e => handleRoleChange(e.target.value as EmployeeRole)}>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="emp-form-label">Penempatan Dapur
            <select className="emp-form-input" value={form.kitchenId} onChange={e => set('kitchenId', e.target.value)}>
              {KITCHEN_OPTIONS.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </label>
          <label className="emp-form-label">Gaji Pokok
            <input className="emp-form-input" type="number" value={form.salary} onChange={e => set('salary', Number(e.target.value))} min={1000000} step={100000} />
          </label>
          <button type="submit" className="emp-modal-submit" disabled={saving}>{saving ? 'Menyimpan…' : '✅ Tambah Karyawan'}</button>
        </form>
      </div>
    </div>
  );
};

// ── Edit Employee Modal ────────────────────────────────────────────────
const EditModal: React.FC<{ emp: Employee; onClose: () => void; onSaved: () => void }> = ({ emp, onClose, onSaved }) => {
  const [form, setForm] = useState({ role: emp.role, kitchenId: emp.kitchenId, salary: emp.salary, status: emp.status });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await fetch(`${API}/${emp.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      if ((await r.json()).success) { onSaved(); onClose(); }
    } catch (err) { console.error(err); } finally { setSaving(false); }
  };

  return (
    <div className="emp-modal-backdrop" onClick={onClose}>
      <div className="emp-modal" onClick={e => e.stopPropagation()}>
        <div className="emp-modal-header">
          <h3>✏️ Edit — {emp.name}</h3>
          <button className="emp-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="emp-modal-form">
          <label className="emp-form-label">Jabatan
            <select className="emp-form-input" value={form.role} onChange={e => set('role', e.target.value)}>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <label className="emp-form-label">Penempatan Dapur
            <select className="emp-form-input" value={form.kitchenId} onChange={e => set('kitchenId', e.target.value)}>
              {KITCHEN_OPTIONS.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </label>
          <label className="emp-form-label">Gaji Pokok
            <input className="emp-form-input" type="number" value={form.salary} onChange={e => set('salary', Number(e.target.value))} min={1000000} step={100000} />
          </label>
          <label className="emp-form-label">Status
            <select className="emp-form-input" value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </label>
          <button type="submit" className="emp-modal-submit" disabled={saving}>{saving ? 'Menyimpan…' : '💾 Simpan Perubahan'}</button>
        </form>
      </div>
    </div>
  );
};

// ── Confirm Dialog ─────────────────────────────────────────────────────
const ConfirmDialog: React.FC<{ title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }> = ({ title, message, confirmLabel, danger, onConfirm, onCancel }) => (
  <div className="emp-modal-backdrop" onClick={onCancel}>
    <div className="emp-modal emp-modal--sm" onClick={e => e.stopPropagation()}>
      <div className="emp-confirm-icon">{danger ? <AlertTriangle size={32} color="var(--color-danger)" /> : <DollarSign size={32} color="var(--accent-primary)" />}</div>
      <h3 className="emp-confirm-title">{title}</h3>
      <p className="emp-confirm-msg">{message}</p>
      <div className="emp-confirm-actions">
        <button className="emp-btn emp-btn--ghost" onClick={onCancel}>Batal</button>
        <button className={`emp-btn ${danger ? 'emp-btn--danger' : 'emp-btn--primary'}`} onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════
const EmployeePage: React.FC = () => {
  const [kitchens, setKitchens] = useState<KitchenGrouped[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKitchen, setSelectedKitchen] = useState<string>('all');
  const [activeRoleFilter, setActiveRoleFilter] = useState<EmployeeRole | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ type: 'pay' | 'fire'; emp: Employee } | null>(null);
  const [actionMenuId, setActionMenuId] = useState<string | null>(null);
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; right: number } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReportFilter>({ reportType: '', startDate: '', endDate: '' });
  const [exporting, setExporting] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };
  const refresh = () => setRefreshKey(k => k + 1);

  // Fetch
  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (filter.reportType) q.append('reportType', filter.reportType);
    if (filter.startDate) q.append('startDate', filter.startDate);
    if (filter.endDate) q.append('endDate', filter.endDate);

    fetch(`${API}/kitchen/all?${q.toString()}`)
      .then(r => r.json())
      .then(json => { if (json.success) setKitchens(json.data); })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [refreshKey, filter]);

  // Close dropdown/action menu on outside click
  useEffect(() => {
    const handler = () => { setDropdownOpen(false); setActionMenuId(null); setActionMenuPos(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  // Handle opening action menu — calculate position from trigger button
  const handleOpenActionMenu = (e: React.MouseEvent<HTMLButtonElement>, empId: string) => {
    e.stopPropagation();
    if (actionMenuId === empId) {
      setActionMenuId(null);
      setActionMenuPos(null);
      return;
    }
    const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
    setActionMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
    setActionMenuId(empId);
  };

  // Pay salary
  const handlePay = useCallback(async (emp: Employee) => {
    try {
      const r = await fetch(`${API}/${emp.id}/pay`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      const json = await r.json();
      if (json.success) { showToast(`✅ Gaji ${emp.name} berhasil dibayarkan!`); refresh(); }
      else showToast(`❌ ${json.error}`);
    } catch { showToast('❌ Gagal membayar gaji.'); }
    setConfirmAction(null);
  }, []);

  // Fire / Offboard
  const handleFire = useCallback(async (emp: Employee) => {
    try {
      const r = await fetch(`${API}/${emp.id}`, { method: 'DELETE' });
      const json = await r.json();
      if (json.success) { showToast(`⚠️ ${emp.name} telah di-offboard.`); refresh(); }
    } catch { showToast('❌ Gagal melakukan offboard.'); }
    setConfirmAction(null);
  }, []);

  const filteredKitchens = useMemo(() => {
    let result = kitchens;
    if (selectedKitchen !== 'all') result = result.filter(k => k.kitchenId === selectedKitchen);
    return result;
  }, [kitchens, selectedKitchen]);

  const handleExport = async (format: 'xlsx' | 'pdf') => {
    setExporting(format);
    try {
      const q = new URLSearchParams({ format });
      if (filter.reportType) q.append('reportType', filter.reportType);
      if (filter.startDate) q.append('startDate', filter.startDate);
      if (filter.endDate) q.append('endDate', filter.endDate);

      const res = await fetch(`${API}/export?${q.toString()}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Karyawan_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      showToast('❌ Gagal mengekspor data.');
    } finally {
      setTimeout(() => setExporting(null), 2500);
    }
  };

  const getFilteredGrouped = (grouped: Record<EmployeeRole, Employee[]>) => {
    if (!activeRoleFilter) return grouped;
    const f: Record<string, Employee[]> = {};
    f[activeRoleFilter] = grouped[activeRoleFilter] || [];
    return f as Record<EmployeeRole, Employee[]>;
  };

  const totalEmployees = kitchens.reduce((s, k) => s + k.totalEmployees, 0);

  return (
    <div className="employee-page">
      {/* TOAST */}
      {toast && <div className="emp-toast animate-fade-up">{toast}</div>}

      {/* HEADER */}
      <div className="emp-header">
        <div className="emp-header-left">
          <div className="emp-header-icon"><Users size={20} /></div>
          <div>
            <h2 className="emp-header-title">Kelola Karyawan</h2>
            <p className="emp-header-subtitle">{totalEmployees} karyawan • {kitchens.length} dapur</p>
          </div>
        </div>
        <div className="emp-header-right" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="emp-btn" onClick={() => handleExport('xlsx')} disabled={!!exporting} style={{ backgroundColor: '#107c41', color: 'white' }}>
              {exporting === 'xlsx' ? '⌛' : <Download size={16} />} XLSX
            </button>
            <button className="emp-btn" onClick={() => handleExport('pdf')} disabled={!!exporting} style={{ backgroundColor: '#d83b01', color: 'white' }}>
              {exporting === 'pdf' ? '⌛' : <Download size={16} />} PDF
            </button>
            <button className="emp-btn emp-btn--add" onClick={() => setShowAddModal(true)}>
              <UserPlus size={16} /> Tambah Karyawan
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ReportFilterBar value={filter} onChange={setFilter} />
            <div className="emp-dropdown-wrap" onClick={e => e.stopPropagation()}>
              <button className="emp-dropdown-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <span>{selectedKitchen === 'all' ? 'Semua Dapur' : kitchens.find(k => k.kitchenId === selectedKitchen)?.kitchenName}</span>
                <ChevronDown size={16} className={`emp-dropdown-chevron ${dropdownOpen ? 'open' : ''}`} />
              </button>
            {dropdownOpen && (
              <div className="emp-dropdown-menu">
                <button className={`emp-dropdown-item ${selectedKitchen === 'all' ? 'active' : ''}`} onClick={() => { setSelectedKitchen('all'); setDropdownOpen(false); }}>Semua Dapur</button>
                {kitchens.map(k => (
                  <button key={k.kitchenId} className={`emp-dropdown-item ${selectedKitchen === k.kitchenId ? 'active' : ''}`} onClick={() => { setSelectedKitchen(k.kitchenId); setDropdownOpen(false); }}>
                    {k.kitchenName}<span className="emp-dropdown-count">{k.totalEmployees}</span>
                  </button>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="emp-filter-bar">
        <Filter size={15} color="var(--text-muted)" />
        <span className="emp-filter-label">Filter Jabatan:</span>
        <button className={`emp-filter-chip ${!activeRoleFilter ? 'active' : ''}`} onClick={() => setActiveRoleFilter(null)}>Semua</button>
        {ALL_ROLES.map(role => (
          <button key={role} className={`emp-filter-chip ${ROLE_CONFIG[role].className} ${activeRoleFilter === role ? 'active' : ''}`} onClick={() => setActiveRoleFilter(activeRoleFilter === role ? null : role)}>
            {ROLE_CONFIG[role].emoji} {role}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading && <div className="loading-state"><div className="spinner" /><p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Memuat data karyawan…</p></div>}

      {/* KITCHEN CARDS */}
      {!loading && (
        <div className="emp-kitchen-grid">
          {filteredKitchens.map((kitchen, idx) => {
            const grouped = getFilteredGrouped(kitchen.grouped);
            const hasEmployees = Object.values(grouped).some(arr => arr.length > 0);
            return (
              <section key={kitchen.kitchenId} className="bento-card emp-kitchen-card" style={{ animationDelay: `${idx * 60}ms` }}>
                <div className="emp-kitchen-header">
                  <div className="emp-kitchen-avatar">🍳</div>
                  <div>
                    <h3 className="emp-kitchen-name">{kitchen.kitchenName}</h3>
                    <p className="emp-kitchen-meta">{kitchen.totalEmployees} karyawan terdaftar</p>
                  </div>
                </div>
                {!hasEmployees && <p className="emp-empty-msg">Tidak ada karyawan dengan jabatan ini.</p>}
                {(Object.entries(grouped) as [EmployeeRole, Employee[]][]).map(([role, emps]) => {
                  if (emps.length === 0) return null;
                  const cfg = ROLE_CONFIG[role];
                  return (
                    <div key={role} className="emp-role-group">
                      <div className="emp-role-group-header">
                        <span className={`emp-role-badge ${cfg.className}`}>{cfg.emoji} {cfg.label}</span>
                        <span className="emp-role-count">{emps.length} orang</span>
                      </div>
                      <ul className="emp-list">
                        {emps.map(emp => (
                          <li key={emp.id} className="emp-list-item">
                            <div className="emp-list-avatar">{emp.name.charAt(0)}</div>
                            <div className="emp-list-info">
                              <div className="emp-list-name-row">
                                <span className="emp-list-name">{emp.name}</span>
                                <span className={`emp-status-tag ${STATUS_CLASS[emp.status]}`}>{emp.status}</span>
                                {emp.paidThisMonth && <span className="emp-paid-tag">💰 Paid</span>}
                              </div>
                              <span className="emp-list-id">{emp.id} • {formatRupiah(emp.salary)}</span>
                            </div>
                            {/* Action Menu Trigger */}
                            <div className="emp-action-wrap" onClick={e => e.stopPropagation()}>
                              <button
                                className="emp-action-trigger"
                                onClick={(e) => handleOpenActionMenu(e, emp.id)}
                              >
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}

      {/* ── GLOBAL ACTION MENU (portal-style, fixed position, above all cards) ── */}
      {actionMenuId && actionMenuPos && (() => {
        // Find the employee by the active actionMenuId
        let activeEmp: Employee | null = null;
        for (const k of kitchens) {
          for (const emps of Object.values(k.grouped)) {
            const found = emps.find(e => e.id === actionMenuId);
            if (found) { activeEmp = found; break; }
          }
          if (activeEmp) break;
        }
        if (!activeEmp) return null;
        const emp = activeEmp;
        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: actionMenuPos.top,
              right: actionMenuPos.right,
              width: 190,
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 12px 32px rgba(15,23,42,0.14), 0 4px 12px rgba(15,23,42,0.08)',
              zIndex: 9999,
              padding: 4,
              animation: 'fadeInUp 0.15s ease both',
            }}
          >
            <button className="emp-action-item" onClick={() => { setEditTarget(emp); setActionMenuId(null); setActionMenuPos(null); }}>
              <Pencil size={14} /> Edit Profile
            </button>
            <button
              className="emp-action-item emp-action--pay"
              disabled={emp.paidThisMonth || emp.status === 'Terminated'}
              onClick={() => { setConfirmAction({ type: 'pay', emp }); setActionMenuId(null); setActionMenuPos(null); }}
            >
              <DollarSign size={14} /> {emp.paidThisMonth ? 'Sudah Dibayar' : 'Bayar Gaji'}
            </button>
            <button
              className="emp-action-item emp-action--fire"
              onClick={() => { setConfirmAction({ type: 'fire', emp }); setActionMenuId(null); setActionMenuPos(null); }}
            >
              <UserX size={14} /> Offboard
            </button>
          </div>
        );
      })()}
      {showAddModal && <AddModal onClose={() => setShowAddModal(false)} onSaved={refresh} />}
      {editTarget && <EditModal emp={editTarget} onClose={() => setEditTarget(null)} onSaved={refresh} />}
      {confirmAction?.type === 'pay' && (
        <ConfirmDialog title="Bayar Gaji" message={`Bayar gaji ${confirmAction.emp.name} sebesar ${formatRupiah(confirmAction.emp.salary)}? Transaksi akan dicatat di modul Keuangan.`} confirmLabel="💰 Bayar Sekarang" onConfirm={() => handlePay(confirmAction.emp)} onCancel={() => setConfirmAction(null)} />
      )}
      {confirmAction?.type === 'fire' && (
        <ConfirmDialog danger title="⚠️ Offboard Karyawan" message={`Apakah Anda yakin ingin meng-offboard ${confirmAction.emp.name}? Karyawan akan berstatus Terminated dan tidak muncul di daftar aktif.`} confirmLabel="Ya, Offboard" onConfirm={() => handleFire(confirmAction.emp)} onCancel={() => setConfirmAction(null)} />
      )}
    </div>
  );
};

export default EmployeePage;
