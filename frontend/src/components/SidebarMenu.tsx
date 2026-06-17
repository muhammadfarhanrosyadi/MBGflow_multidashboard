import React from 'react';
import {
  LayoutDashboard,
  ChefHat,
  Package,
  Bot,
  Truck,
  MapPinned,
  Wallet,
  UsersRound,
  Sparkles,
  LogOut,
  Zap,
  Lock,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  section?: string;
}

interface SidebarMenuProps {
  activeMenu: string;
  onMenuChange: (id: string) => void;
  onLogout: () => void;
  userRole?: string;
}

const MENU_ITEMS: Array<MenuItem & { icon: React.ReactNode }> = [
  { id: 'dashboard', label: 'Dashboard SCM', icon: <LayoutDashboard size={17} /> },
  { id: 'produksi', label: 'Produksi & Multi Dapur', icon: <ChefHat size={17} /> },
  { id: 'bahan-baku', label: 'Bahan Baku & Pemasok', icon: <Package size={17} /> },
  { id: 'menu-planning', label: 'Menu Planning & AI', icon: <Bot size={17} /> },
  { id: 'logistik', label: 'Logistik & Distribusi', icon: <Truck size={17} /> },
  { id: 'tracking', label: 'Mobile Tracking', icon: <MapPinned size={17} /> },
  { id: 'keuangan', label: 'Keuangan', icon: <Wallet size={17} />, section: 'Manajemen' },
  { id: 'karyawan', label: 'Kelola Karyawan', icon: <UsersRound size={17} />, section: 'Manajemen' },
  { id: 'ai-history', label: 'Prediksi AI Universal', icon: <Sparkles size={17} />, section: 'AI & Analytics' },
];

const SidebarMenu: React.FC<SidebarMenuProps> = ({ activeMenu, onMenuChange, onLogout, userRole }) => {
  return (
    <aside className="sidebar">
      {/* ── Brand ─────────────────────────────────────────────────── */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-badge">M</div>
        <div>
          <div className="sidebar-brand-title">SCM Master Admin</div>
          <small>MBG Platform</small>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────────────── */}
      <p className="sidebar-section-label">Menu Utama</p>
      <nav className="sidebar-menu">
        {MENU_ITEMS.map((item, idx) => {
          const prevSection = idx > 0 ? MENU_ITEMS[idx - 1].section : undefined;
          const showSection = item.section && item.section !== prevSection;
          const isRestricted = userRole === 'user' && !['karyawan', 'keuangan', 'ai-history'].includes(item.id);

          return (
            <React.Fragment key={item.id}>
              {showSection && <p className="sidebar-section-label" style={{ marginTop: 8 }}>{item.section}</p>}
              <button
                type="button"
                className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => {
                  if (isRestricted) {
                    alert('Fitur ini khusus untuk langganan Premium.');
                    return;
                  }
                  onMenuChange(item.id);
                }}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {isRestricted && <Lock size={14} color="var(--text-muted)" />}
              </button>
            </React.Fragment>
          );
        })}
      </nav>

      {/* ── Promo & Footer ────────────────────────────────────────── */}
      <div className="sidebar-footer">
        {/* Promo info card */}
        <div className="sidebar-promo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Zap size={13} color="var(--accent-primary)" />
            <span className="sidebar-promo-title">AI Analyst Aktif</span>
          </div>
          <p className="sidebar-promo-text">
            Klik "Analisis dengan AI" di setiap modul untuk insight cerdas berbasis data real-time.
          </p>
        </div>

        {/* Logout */}
        <button type="button" className="sidebar-logout" onClick={onLogout}>
          <LogOut size={15} />
          Keluar
        </button>
      </div>
    </aside>
  );
};

export default SidebarMenu;