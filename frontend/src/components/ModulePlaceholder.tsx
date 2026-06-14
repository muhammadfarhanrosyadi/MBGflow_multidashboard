import React from 'react';

interface ModulePlaceholderProps {
  moduleName: string;
  icon: string;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  moduleName,
  icon,
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-pulse">{icon}</div>
        <h1 className="text-4xl font-bold text-white mb-3">{moduleName}</h1>
        <div className="text-6xl mb-6">⏳</div>
        <h2 className="text-2xl text-gray-300 mb-4">Modul Sedang Dalam Pengerjaan</h2>
        <p className="text-gray-400 max-w-md mx-auto mb-8">
          Tim pengembangan sedang bekerja keras untuk menghadirkan fitur terbaik. Harap
          tunggu beberapa saat.
        </p>

        <div className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-1 mb-8">
          <div className="bg-gray-900 rounded px-6 py-3">
            <span className="text-emerald-400 font-semibold">Estimasi: Minggu Depan</span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-2xl">🔧</span>
            <span>Under Development</span>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">🎯</div>
            <p className="text-xs text-gray-400">Planning</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="text-xs text-gray-400">Development</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">✅</div>
            <p className="text-xs text-gray-400">Testing</p>
          </div>
        </div>
      </div>
    </div>
  );
};
