import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import TrendChart from '../charts/TrendChart';
import { getAllData, getYearlyTrend } from '../utils/dataLoader';
import { getInstituteType } from '../utils/filters';

export default function Trends() {
  const [josaaData, setJosaaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInst, setSelectedInst] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);

  useEffect(() => {
    getAllData().then(data => {
      setJosaaData(data);
      setLoading(false);
    });
  }, []);

  // Load yearly trend when institute + program selected
  useEffect(() => {
    if (!selectedInst || !selectedProgram) { setTrendData([]); return; }
    setTrendLoading(true);
    getYearlyTrend(selectedInst, selectedProgram).then(data => {
      setTrendData(data);
      setTrendLoading(false);
    });
  }, [selectedInst, selectedProgram]);

  const institutes = useMemo(() => [...new Set(josaaData.map(d => d.institute))].sort(), [josaaData]);

  const programs = useMemo(() => {
    if (!selectedInst) return [];
    return [...new Set(josaaData.filter(d => d.institute === selectedInst).map(d => d.program))].sort();
  }, [selectedInst, josaaData]);

  const branchStats = useMemo(() => {
    const counts = {};
    josaaData.forEach(d => {
      const branch = d.program?.split('(')[0].trim();
      counts[branch] = (counts[branch] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [josaaData]);

  const getTrendIcon = () => {
    if (trendData.length < 2) return <Minus size={14} />;
    const first = trendData[0]?.closingRank;
    const last = trendData[trendData.length - 1]?.closingRank;
    if (last < first) return <TrendingUp size={14} color="var(--danger)" />;
    return <TrendingDown size={14} color="var(--success)" />;
  };

  const trendSummary = () => {
    if (trendData.length < 2) return null;
    const first = trendData[0]?.closingRank;
    const last = trendData[trendData.length - 1]?.closingRank;
    const diff = Math.round(Math.abs(last - first));
    const pct = Math.round(diff / first * 100);
    const firstYear = trendData[0]?.year;
    const lastYear = trendData[trendData.length - 1]?.year;
    return last > first
      ? `Cutoff relaxed by ${diff} ranks (${pct}%) from ${firstYear}→${lastYear}`
      : `Cutoff tightened by ${diff} ranks (${pct}%) from ${firstYear}→${lastYear}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>Loading dataset…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          Trend Analysis
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Year-wise cutoff trends (2016–2024) using last round data per year
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Institute
          </label>
          <select value={selectedInst} onChange={e => { setSelectedInst(e.target.value); setSelectedProgram(''); }}>
            <option value="">Select institute…</option>
            {institutes.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Program
          </label>
          <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} disabled={!selectedInst}>
            <option value="">Select program…</option>
            {programs.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Trend Chart */}
      {(trendLoading || trendData.length > 0) && (
        <div className="card p-5 mb-6">
          {trendLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 260, gap: 12 }}>
              <Loader2 size={22} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading trend…</span>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Year-wise Cutoff Trend</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {getTrendIcon()}
                  <span>{trendSummary()}</span>
                </div>
              </div>
              <TrendChart data={trendData} />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
                Each point represents the last round cutoff for that year
              </p>
            </>
          )}
        </div>
      )}

      {/* Branch popularity */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>Most Offered Programs in Dataset</h3>
        </div>
        <div style={{ padding: '0 4px' }}>
          {branchStats.map(([branch, count], i) => (
            <div key={branch} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '11px 16px', borderBottom: i < branchStats.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600, width: 20 }}>#{i + 1}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{branch}</span>
              <div style={{ width: 120, height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${(count / branchStats[0][1]) * 100}%`,
                  background: 'var(--primary)', borderRadius: 999,
                }} />
              </div>
              <span style={{ fontSize: 12, color: 'var(--muted)', width: 40, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}