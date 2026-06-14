import React from 'react';
import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  title: string;
  subtitle?: string;
}

const TopBar: React.FC<TopBarProps> = ({ title, subtitle }) => {
  return (
    <header className="topbar">
      {/* Left: Page title */}
      <div className="topbar-left">
        <div className="topbar-title">{title}</div>
        {subtitle && <div className="topbar-subtitle">{subtitle}</div>}
      </div>

      {/* Center: Search bar */}
      <label className="topbar-search" aria-label="Search">
        <Search size={15} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Cari modul, dapur, atau supplier..."
        />
        <span className="topbar-kbd">⌘K</span>
      </label>

      {/* Right: Notification + User */}
      <div className="topbar-right">
        {/* Notification bell */}
        <div className="topbar-bell" title="Notifikasi">
          <Bell size={17} color="var(--text-secondary)" />
          <span className="topbar-bell-dot" />
        </div>

        {/* User */}
        <div className="topbar-user">
          <div className="topbar-user-name">
            <strong>Master Admin</strong>
            <span>SCM Control</span>
          </div>
          <div className="topbar-avatar">M</div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;