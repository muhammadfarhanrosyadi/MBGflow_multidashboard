import React from 'react';
import { KPICard as KPICardType } from '../types';

interface KPICardsProps {
  cards: KPICardType[];
}

export const KPICards: React.FC<KPICardsProps> = ({ cards }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'border-red-500 bg-red-950 bg-opacity-20';
      case 'warning':
        return 'border-yellow-500 bg-yellow-950 bg-opacity-20';
      default:
        return 'border-emerald-500 bg-emerald-950 bg-opacity-20';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      default:
        return 'text-emerald-400';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`border-2 rounded-lg p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${getStatusColor(
            card.status
          )} hover:scale-105`}
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-3xl">{card.icon}</span>
            {card.trend !== undefined && (
              <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                card.trend >= 0
                  ? 'bg-green-900 text-green-300'
                  : 'bg-red-900 text-red-300'
              }`}>
                {card.trend >= 0 ? '↑' : '↓'} {Math.abs(card.trend)}%
              </span>
            )}
          </div>

          <h3 className="text-gray-300 text-sm font-medium mb-2">{card.title}</h3>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{card.value}</span>
            {card.unit && <span className="text-gray-400 text-sm">{card.unit}</span>}
          </div>

          <div className={`mt-3 text-xs font-semibold ${getStatusTextColor(card.status)}`}>
            {card.status === 'critical' && '⚠️ KRITIS'}
            {card.status === 'warning' && '⚡ PERHATIAN'}
            {card.status === 'normal' && '✓ NORMAL'}
          </div>
        </div>
      ))}
    </div>
  );
};
