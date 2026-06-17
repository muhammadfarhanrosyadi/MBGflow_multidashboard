import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import MasterDashboard from './components/MasterDashboard';
import ModulePage from './components/ModulePage';
import FinancePage from './pages/FinancePage';
import EmployeePage from './pages/EmployeePage';
import AiPredictionHistoryPage from './pages/AiPredictionHistoryPage';

import { LogIn, Eye, EyeOff } from 'lucide-react';

// ── Module routing config ─────────────────────────────────────────────
const MODULE_CONFIG: Record<string, { label: string; icon: string; apiKey: string }> = {
  produksi:       { label: 'Produksi & Multi Dapur',       icon: '🍳', apiKey: 'produksi'      },
  'bahan-baku':   { label: 'Bahan Baku & Pemasok',         icon: '📦', apiKey: 'bahan-baku'    },
  'menu-planning':{ label: 'Menu Planning & AI',           icon: '🤖', apiKey: 'menu-planning' },
  logistik:       { label: 'Logistik & Distribusi',         icon: '🚚', apiKey: 'logistik'      },
  tracking:       { label: 'Mobile Distribution Tracking', icon: '📍', apiKey: 'tracking'      },
};

// ── Decorative background blobs ────────────────────────────────────────
const BgBlobs: React.FC = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
    {/* Top-left blob */}
    <div style={{
      position: 'absolute', top: '-80px', left: '-80px',
      width: 400, height: 400, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(27,107,69,0.12) 0%, transparent 70%)',
    }} />
    {/* Bottom-right blob */}
    <div style={{
      position: 'absolute', bottom: '-100px', right: '-60px',
      width: 480, height: 480, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(34,160,107,0.10) 0%, transparent 70%)',
    }} />
  </div>
);

// ── Login Screen ──────────────────────────────────────────────────────
const LoginScreen: React.FC<{ onLogin: (name: string, token: string, role: string) => void }> = ({ onLogin }) => {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (data.success) {
        onLogin(data.user.username, data.token, data.user.role);
      } else {
        setError(data.message || 'Username atau password salah.');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'var(--bg-primary)',
      position: 'relative',
    }}>
      <BgBlobs />

      {/* Left panel — decorative */}
      <div style={{
        flex: '0 0 45%',
        background: 'linear-gradient(145deg, #1B6B45 0%, #145535 40%, #0E3D28 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Pattern overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 52, height: 52,
            background: 'rgba(255,255,255,0.15)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 16,
            display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 900, color: '#fff',
            marginBottom: 16,
          }}>M</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
            SCM Master Admin
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 6 }}>
            Platform Supply Chain Management MBG
          </div>
        </div>

        {/* Features list */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { icon: '📊', title: 'Dashboard Global', desc: 'Pantau KPI dan tren SCM secara real-time' },
            { icon: '🤖', title: 'AI Analyst', desc: 'Insight cerdas berbasis Gemini AI' },
            { icon: '🚚', title: 'Logistik & Tracking', desc: 'Distribusi dan mobile tracking terintegrasi' },
          ].map(f => (
            <div key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40,
                background: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 12,
                display: 'grid', placeItems: 'center',
                fontSize: 16, flexShrink: 0,
              }}>{f.icon}</div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff' }}>{f.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
          Platform SCM MBG © 2026
        </div>
      </div>

      {/* Right panel — login form */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Selamat datang kembali 👋
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 8 }}>
              Masuk ke Master Admin SCM MBG
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                Username
              </label>
              <input
                type="text"
                value={creds.username}
                onChange={e => setCreds({ ...creds, username: e.target.value })}
                placeholder="Masukkan username"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '11px 16px',
                  background: 'var(--bg-surface)',
                  border: '1.5px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                  transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                  fontFamily: 'inherit',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'var(--accent-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--accent-primary-dim)';
                }}
                onBlur={e => {
                  e.target.style.borderColor = 'var(--border-default)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={creds.password}
                  onChange={e => setCreds({ ...creds, password: e.target.value })}
                  placeholder="Masukkan password"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px 44px 11px 16px',
                    background: 'var(--bg-surface)',
                    border: '1.5px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                    transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--accent-primary)';
                    e.target.style.boxShadow = '0 0 0 3px var(--accent-primary-dim)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--border-default)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                  }}
                >
                  {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--color-danger-dim)',
                border: '1px solid var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-danger)',
                fontSize: 13,
              }}>
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                background: loading ? 'var(--bg-interactive)' : 'var(--accent-primary)',
                color: loading ? 'var(--text-muted)' : '#fff',
                fontWeight: 700,
                fontSize: 14.5,
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 4,
                transition: 'all var(--transition-normal)',
                boxShadow: loading ? 'none' : 'var(--shadow-glow-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontFamily: 'inherit',
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 16, height: 16,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid var(--text-muted)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }} />
                  Memverifikasi...
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Masuk ke Dashboard
                </>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div style={{
            marginTop: 28,
            padding: '14px 18px',
            background: 'var(--accent-light)',
            border: '1px solid rgba(27,107,69,0.15)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{ fontSize: 11.5, color: 'var(--accent-primary)', fontWeight: 600, marginBottom: 4 }}>
              Demo Credentials
            </p>
            <code style={{
              display: 'block',
              fontSize: 13,
              color: 'var(--accent-active)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}>
              Premium: admin / admin123<br/>
              Biasa: user / user123
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── App Root ──────────────────────────────────────────────────────────
export default function App() {
  const [adminName, setAdminName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('user');
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Persist login & check token
  useEffect(() => {
    const token = localStorage.getItem('scm_token');
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    fetch('http://localhost:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setAdminName(data.user.username);
          setUserRole(data.user.role);
          if (data.user.role === 'user') setActiveMenu('karyawan');
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout())
      .finally(() => setIsCheckingAuth(false));
  }, []);

  const handleLogin = (name: string, token: string, role: string) => {
    localStorage.setItem('scm_token', token);
    setAdminName(name);
    setUserRole(role);
    setActiveMenu(role === 'user' ? 'karyawan' : 'dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('scm_token');
    setAdminName(null);
    setUserRole('user');
    setActiveMenu('dashboard');
  };

  if (isCheckingAuth) return null; // Or a loading spinner
  if (!adminName) return <LoginScreen onLogin={handleLogin} />;

  // Render active page content
  const renderPage = () => {
    if (userRole === 'user' && !['karyawan', 'keuangan', 'ai-prediction'].includes(activeMenu)) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2>Akses Terkunci</h2>
          <p>Fitur ini khusus untuk langganan Premium.</p>
        </div>
      );
    }

    if (activeMenu === 'dashboard')       return <MasterDashboard />;
    if (activeMenu === 'keuangan')         return <FinancePage userRole={userRole} />;
    if (activeMenu === 'karyawan')         return <EmployeePage />;
    if (activeMenu === 'ai-prediction')    return <AiPredictionHistoryPage />;


    const mod = MODULE_CONFIG[activeMenu];
    if (!mod) return <p style={{ color: 'var(--text-muted)' }}>Halaman tidak ditemukan.</p>;

    return (
      <ModulePage
        moduleName={mod.apiKey}
        moduleLabel={mod.label}
        moduleIcon={mod.icon}
      />
    );
  };

  return (
    <div className="app-shell">
      <Layout
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        onLogout={handleLogout}
        adminName={adminName}
        userRole={userRole}
      >
        {renderPage()}
      </Layout>
    </div>
  );
}
