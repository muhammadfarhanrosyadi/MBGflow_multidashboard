import React from 'react';
import { AdminUser } from '../types';

interface HeaderProps {
  admin: AdminUser;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ admin, onLogout }) => {
  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Global SCM</h1>
          <p className="text-gray-400 text-sm mt-1">Platform Supply Chain Management MBG</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-white font-semibold">{admin.name}</p>
            <p className="text-gray-400 text-sm">{admin.role}</p>
          </div>
          <div className="w-12 h-12 r from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">{admin.name.charAt(0)}</span>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};
