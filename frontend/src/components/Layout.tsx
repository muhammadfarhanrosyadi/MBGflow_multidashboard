import React from 'react';
import SidebarMenu from './SidebarMenu';
import TopBar from './TopBar';

interface LayoutProps {
  children: React.ReactNode;
  activeMenu: string;
  onMenuChange: (id: string) => void;
  onLogout: () => void;
  adminName: string;
  userRole?: string;
}

const MENU_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard SCM' },
  { id: 'produksi',     label: 'Produksi & Multi Dapur' },
  { id: 'bahan-baku',   label: 'Bahan Baku & Pemasok' },
  { id: 'menu-planning',label: 'Menu Planning & AI' },
  { id: 'logistik',     label: 'Logistik & Distribusi' },
  { id: 'tracking',     label: 'Mobile Tracking' },
  { id: 'keuangan',     label: 'Keuangan' },
  { id: 'karyawan',     label: 'Kelola Karyawan' },
  { id: 'ai-history',   label: 'Prediksi AI Universal' },
];

const Layout: React.FC<LayoutProps> = ({ children, activeMenu, onMenuChange, onLogout, adminName, userRole }) => {
  const pageTitle = MENU_ITEMS.find((m) => m.id === activeMenu)?.label || 'Dashboard SCM';

  return (
    <div className="main-layout">
      <SidebarMenu activeMenu={activeMenu} onMenuChange={onMenuChange} onLogout={onLogout} userRole={userRole} />

      <section className="layout-content">
        <TopBar title={pageTitle} />
        <main className="content-wrap">{children}</main>
      </section>
    </div>
  );
};

export default Layout;
export { MENU_ITEMS };
