import React, { useState } from 'react';
import { Sidebar } from './SidebarSCM';
import { MainDashboard } from './MainDashboard';
import { ModulePlaceholder } from './ModulePlaceholder';

interface MainLayoutProps {
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ onLogout }) => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const moduleConfig: Record<
    string,
    { name: string; icon: string }
  > = {
    produksi: { name: 'Produksi & Multi Dapur', icon: '🍳' },
    'bahan-baku': { name: 'Bahan Baku & Pemasok', icon: '📦' },
    'menu-planning': { name: 'Menu Planning & AI', icon: '🤖' },
    logistik: { name: 'Logistik & Distribusi', icon: '🚚' },
    tracking: { name: 'Mobile Distribution Tracking', icon: '📍' },
  };

  const isModule = activeMenu !== 'dashboard';
  const moduleInfo = moduleConfig[activeMenu];

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {isModule ? (
          <div className="bg-gray-900 min-h-screen">
            <ModulePlaceholder
              moduleName={moduleInfo?.name || 'Modul'}
              icon={moduleInfo?.icon || '⚠️'}
            />
          </div>
        ) : (
          <MainDashboard onLogout={onLogout} />
        )}
      </div>
    </div>
  );
};
