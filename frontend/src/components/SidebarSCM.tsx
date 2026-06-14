import React from 'react';
import { MenuItemType } from '../types';

interface SidebarProps {
  activeMenu: string;
  onMenuChange: (menuId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeMenu,
  onMenuChange,
  isCollapsed,
  onToggleCollapse,
}) => {
  const menuItems: MenuItemType[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Global SCM',
      icon: '📊',
      path: 'dashboard',
    },
    {
      id: 'produksi',
      label: 'Produksi & Multi Dapur',
      icon: '🍳',
      path: 'produksi',
    },
    {
      id: 'bahan-baku',
      label: 'Bahan Baku & Pemasok',
      icon: '📦',
      path: 'bahan-baku',
    },
    {
      id: 'menu-planning',
      label: 'Menu Planning & AI',
      icon: '🤖',
      path: 'menu-planning',
    },
    {
      id: 'logistik',
      label: 'Logistik & Distribusi',
      icon: '🚚',
      path: 'logistik',
    },
    {
      id: 'tracking',
      label: 'Mobile Distribution Tracking',
      icon: '📍',
      path: 'tracking',
    },
  ];

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-gray-800 border-r border-gray-700 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo Area */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-sm">SCM MBG</span>
              <span className="text-gray-400 text-xs">Master Admin</span>
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="text-gray-400 hover:text-emerald-400 transition-colors p-2 rounded hover:bg-gray-700"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="p-3 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeMenu === item.id
                ? ' from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                : 'text-gray-300 hover:bg-gray-700 hover:text-emerald-400'
            }`}
            title={isCollapsed ? item.label : ''}
          >
            <span className="text-xl ">{item.icon}</span>
            {!isCollapsed && <span className="text-sm font-medium truncate">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700 bg-gray-900 bg-opacity-50">
        <div className={`text-xs text-gray-500 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? 'v1' : 'Platform SCM v1.0'}
        </div>
      </div>
    </div>
  );
};
