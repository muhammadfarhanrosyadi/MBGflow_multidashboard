import React, { useState } from 'react';
import { Calendar, Filter, X } from 'lucide-react';
import type { ReportFilter, ReportType } from '../types';

interface ReportFilterProps {
  value: ReportFilter;
  onChange: (filter: ReportFilter) => void;
  onReset?: () => void;
  className?: string;
}

const FILTER_OPTIONS: Array<{ value: ReportType | ''; label: string }> = [
  { value: '',         label: 'Semua Periode' },
  { value: 'daily',   label: 'Hari Ini' },
  { value: 'monthly', label: 'Bulan Ini' },
  { value: 'yearly',  label: 'Tahun Ini' },
  { value: 'custom',  label: 'Rentang Kustom' },
];

const ReportFilterBar: React.FC<ReportFilterProps> = ({ value, onChange, onReset }) => {
  const [open, setOpen] = useState(false);

  const isActive = value.reportType !== '';

  const handleTypeChange = (type: ReportType | '') => {
    onChange({
      reportType: type,
      startDate: type === 'custom' ? value.startDate : '',
      endDate:   type === 'custom' ? value.endDate   : '',
    });
    if (type !== 'custom') setOpen(false);
  };

  const handleReset = () => {
    onChange({ reportType: '', startDate: '', endDate: '' });
    onReset?.();
    setOpen(false);
  };

  const activeLabel = FILTER_OPTIONS.find(o => o.value === value.reportType)?.label || 'Filter Periode';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      {/* Dropdown trigger */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(!open)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px',
            background: isActive ? 'rgba(27,107,69,0.12)' : 'var(--bg-surface)',
            border: `1.5px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-default)'}`,
            borderRadius: 8,
            color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'inherit', transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
        >
          <Filter size={14} />
          {activeLabel}
        </button>

        {open && (
          <>
            {/* Close backdrop */}
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 50 }}
              onClick={() => setOpen(false)}
            />
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 51,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: 10,
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              minWidth: 200, overflow: 'hidden',
            }}>
              {FILTER_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleTypeChange(opt.value as ReportType | '')}
                  style={{
                    display: 'block', width: '100%', textAlign: 'left',
                    padding: '10px 16px', fontSize: 13, fontWeight: 500,
                    color: value.reportType === opt.value ? 'var(--accent-primary)' : 'var(--text-primary)',
                    background: value.reportType === opt.value ? 'rgba(27,107,69,0.08)' : 'transparent',
                    border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-surface)')}
                  onMouseLeave={e => (e.currentTarget.style.background =
                    value.reportType === opt.value ? 'rgba(27,107,69,0.08)' : 'transparent'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Custom date range pickers */}
      {value.reportType === 'custom' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="date"
              value={value.startDate}
              onChange={e => onChange({ ...value, startDate: e.target.value })}
              style={{
                padding: '7px 10px', fontSize: 13,
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 7, color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
              }}
            />
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>s/d</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={14} color="var(--text-muted)" />
            <input
              type="date"
              value={value.endDate}
              min={value.startDate}
              onChange={e => onChange({ ...value, endDate: e.target.value })}
              style={{
                padding: '7px 10px', fontSize: 13,
                background: 'var(--bg-surface)',
                border: '1.5px solid var(--border-default)',
                borderRadius: 7, color: 'var(--text-primary)',
                outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
              }}
            />
          </div>
        </>
      )}

      {/* Reset button */}
      {isActive && (
        <button
          onClick={handleReset}
          title="Reset filter"
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '7px 10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1.5px solid rgba(239,68,68,0.25)',
            borderRadius: 7, color: '#EF4444', fontSize: 12,
            fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <X size={13} />
          Reset
        </button>
      )}
    </div>
  );
};

export default ReportFilterBar;
