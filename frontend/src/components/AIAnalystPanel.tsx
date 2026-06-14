import React, { useState } from 'react';

// ── Types ─────────────────────────────────────────────────────────────
interface AnalysisResult {
  kesimpulan: string;
  temuanMasalah: string[];
  analisisAI: string;
  solusiStrategis: string[];
  confidenceScore: number;
  source?: 'gemini' | 'rule-based' | 'empty';
}

interface AIAnalystPanelProps {
  moduleName: string;
  moduleLabel: string;
  moduleIcon: string;
  tableData: Record<string, unknown>[];
  chartData: Record<string, unknown>[];
}

// ── Confidence Badge ──────────────────────────────────────────────────
const ConfidenceBadge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 85 ? 'var(--color-success)' : score >= 70 ? 'var(--color-warning)' : 'var(--color-danger)';
  const bg = score >= 85 ? 'var(--color-success-dim)' : score >= 70 ? 'var(--color-warning-dim)' : 'var(--color-danger-dim)';
  const label = score >= 85 ? 'Tinggi' : score >= 70 ? 'Sedang' : 'Rendah';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 12px', borderRadius: 99,
      background: bg, color, fontSize: '0.75rem', fontWeight: 700,
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', background: color,
        display: 'inline-block', animation: score >= 85 ? 'pulse-glow 2s ease infinite' : 'none',
      }} />
      Keyakinan AI: {score}% ({label})
    </span>
  );
};

// ── Source Badge ──────────────────────────────────────────────────────
const SourceBadge: React.FC<{ source?: string }> = ({ source }) => {
  if (source === 'gemini') return (
    <span style={{
      padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600,
      background: 'var(--accent-light)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary-dim)',
    }}>✨ Powered by Gemini AI</span>
  );
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 600,
      background: 'var(--color-purple-dim)', color: 'var(--color-purple)', border: '1px solid rgba(124,58,237,0.2)',
    }}>⚙️ Rule-Based Analysis</span>
  );
};


// ── AnimatedDots — loading indicator ─────────────────────────────────
const AnimatedDots: React.FC = () => {
  const dotStyle = (delay: string): React.CSSProperties => ({
    width: 8, height: 8, borderRadius: '50%',
    background: 'var(--accent-primary)',
    display: 'inline-block', margin: '0 3px',
    animation: `bounce 1.2s ${delay} infinite`,
  });
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center' }}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1.1); opacity: 1;   }
        }
      `}</style>
      <span style={dotStyle('0s')} />
      <span style={dotStyle('0.2s')} />
      <span style={dotStyle('0.4s')} />
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────
const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({
  moduleName, moduleLabel, moduleIcon, tableData, chartData,
}) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);

  const runAnalysis = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('http://localhost:5000/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName, moduleLabel, tableData, chartData }),
      });

      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Analisis gagal.');
      setResult(json.analysis);
      setAnalyzed(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Gagal menghubungi AI Analyst: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(27,107,69,0.04) 0%, rgba(34,160,107,0.05) 100%)',
      border: '1px solid var(--accent-primary-dim)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
    }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderBottom: analyzed || loading ? '1px solid var(--accent-primary-dim)' : 'none',
        background: 'rgba(27,107,69,0.04)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Pulsing AI icon */}
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: '#000', flexShrink: 0,
            boxShadow: loading ? '0 0 20px rgba(0,212,255,0.5)' : 'var(--shadow-glow-cyan)',
            transition: 'box-shadow 0.3s ease',
          }}>
            {loading ? '⚙️' : '🤖'}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Master SCM Analyst AI
            </h3>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {moduleIcon} Analisis kontekstual modul {moduleLabel}
            </p>
          </div>
        </div>

        {/* Trigger Button */}
        <button
          onClick={runAnalysis}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.55rem 1.25rem',
            background: loading
              ? 'var(--bg-interactive)'
              : 'var(--accent-primary)',
            color: loading ? 'var(--text-muted)' : '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700, fontSize: '0.85rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all var(--transition-normal)',
            boxShadow: loading ? 'none' : 'var(--shadow-glow-green)',
            whiteSpace: 'nowrap',
            fontFamily: 'inherit',
          }}
        >
          {loading ? (
            <>Menganalisis <AnimatedDots /></>
          ) : analyzed ? (
            <><span>🔄</span> Analisis Ulang</>
          ) : (
            <><span>✨</span> Analisis dengan AI</>
          )}
        </button>
      </div>

      {/* ── Idle State ─────────────────────────────────────────────── */}
      {!loading && !result && !error && (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.88rem',
        }}>
          <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🧠</p>
          <p>Klik <strong style={{ color: 'var(--accent-primary)' }}>Analisis dengan AI</strong> untuk mendapatkan</p>
          <p>insight instan berdasarkan data modul ini.</p>
        </div>
      )}

      {/* ── Loading State ───────────────────────────────────────────── */}
      {loading && (
        <div style={{
          padding: '2rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        }}>
          <div style={{
            width: 48, height: 48,
            border: '3px solid var(--border-default)',
            borderTop: '3px solid var(--accent-primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: 0 }}>
            Master SCM Analyst AI sedang membaca & menganalisis data…
          </p>
        </div>
      )}

      {/* ── Error State ─────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{
          margin: '1rem 1.5rem',
          padding: '1rem',
          background: 'var(--color-danger-dim)',
          border: '1px solid var(--color-danger)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-danger)',
          fontSize: '0.85rem',
        }}>
          ❌ {error}
        </div>
      )}

      {/* ── Result ──────────────────────────────────────────────────── */}
      {result && !loading && (
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', animation: 'fadeInUp 0.4s ease both' }}>

          {/* Meta badges */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <ConfidenceBadge score={result.confidenceScore} />
            <SourceBadge source={result.source} />
          </div>

          {/* KESIMPULAN DATA */}
          <ResultSection
            icon="📋"
            label="KESIMPULAN DATA"
            color="var(--accent-primary)"
            colorDim="rgba(0,212,255,0.08)"
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
              {result.kesimpulan}
            </p>
          </ResultSection>

          {/* TEMUAN MASALAH */}
          <ResultSection
            icon="🔍"
            label="TEMUAN MASALAH"
            color="var(--color-warning)"
            colorDim="rgba(245,158,11,0.08)"
          >
            {result.temuanMasalah.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
                Tidak ada masalah kritis yang terdeteksi.
              </p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {result.temuanMasalah.map((item, i) => (
                  <li key={i} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                    fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}>
                    <span style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }}>▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </ResultSection>

          {/* ANALISIS AI */}
          <ResultSection
            icon="🧠"
            label="ANALISIS AI"
            color="var(--accent-secondary)"
            colorDim="rgba(124,111,255,0.08)"
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.75, margin: 0 }}>
              {result.analisisAI}
            </p>
          </ResultSection>

          {/* SOLUSI STRATEGIS */}
          <ResultSection
            icon="🎯"
            label="SOLUSI STRATEGIS"
            color="var(--color-success)"
            colorDim="rgba(34,197,94,0.08)"
          >
            <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {result.solusiStrategis.map((item, i) => (
                <li key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.65rem 0.8rem',
                  background: 'var(--bg-overlay)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.6,
                }}>
                  <span style={{
                    color: 'var(--color-success)', fontWeight: 700, flexShrink: 0,
                    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginTop: 2,
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </ResultSection>

        </div>
      )}
    </div>
  );
};

// ── Reusable Section Wrapper ──────────────────────────────────────────
const ResultSection: React.FC<{
  icon: string;
  label: string;
  color: string;
  colorDim: string;
  children: React.ReactNode;
}> = ({ icon, label, color, colorDim, children }) => (
  <div style={{
    background: colorDim,
    borderRadius: 'var(--radius-md)',
    border: `1px solid ${color}30`,
    overflow: 'hidden',
  }}>
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      padding: '0.6rem 1rem',
      borderBottom: `1px solid ${color}25`,
      background: `${color}10`,
    }}>
      <span>{icon}</span>
      <span style={{
        fontSize: '0.72rem', fontWeight: 800,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color,
      }}>
        {label}
      </span>
    </div>
    <div style={{ padding: '0.9rem 1rem' }}>
      {children}
    </div>
  </div>
);

export default AIAnalystPanel;
