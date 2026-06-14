import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/sidebar.css';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '📊', route: '/dashboard' },
    { name: 'Produksi & Multi Dapur', icon: '🏭', route: '/production' },
    { name: 'Bahan Baku & Pemasok', icon: '📦', route: '/ingredients' },
    { name: 'Menu Planning & AI', icon: '🤖', route: '/menu-ai' },
    { name: 'Logistik & Distribusi', icon: '🚚', route: '/logistics' },
    { name: 'Mobile Distribution Tracking', icon: '🗺️', route: '/tracking' },
  ];

  const isActive = (route: string) => location.pathname === route;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2 className="logo">📱 SCM MBG</h2>
        <button 
          className="toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.route}
            to={item.route}
            className={`nav-item ${isActive(item.route) ? 'active' : ''}`}
            title={isCollapsed ? item.name : ''}
          >
            <span className="nav-icon">{item.icon}</span>
            {!isCollapsed && <span className="nav-text">{item.name}</span>}
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button 
          className="btn-logout"
          onClick={onLogout}
          title="Logout"
        >
          <span>🚪</span>
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
