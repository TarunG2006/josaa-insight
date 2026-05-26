import { useState, useEffect, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { getInstituteType } from '../utils/filters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllData } from '../utils/dataLoader';

export default function Compare() {
  const [josaaData, setJosaaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [instA, setInstA] = useState('');
  const [instB, setInstB] = useState('');

  useEffect(() => {
    getAllData().then(data => {
      setJosaaData(data);
      setLoading(false);
    });
  }, []);

  const institutes = useMemo(() => [...new Set(josaaData.map(d => d.institute))].sort(), [josaaData]);

  const dataA = josaaData.filter(d => d.institute === instA);
  const dataB = josaaData.filter(d => d.institute === instB);

  const commonBranches = useMemo(() => {
    if (!instA || !instB) return [];
    const programsA = dataA.map(d => d.program);
    const programsB = dataB.map(d => d.program);
    return [...new Set(programsA.filter(p => programsB.includes(p)))];
  }, [instA, instB, dataA, dataB]);

  const chartData = commonBranches.slice(0, 8).map(program => {
    const a = dataA.find(d => d.program === program);
    const b = dataB.find(d => d.program === program);
    return {
      program: program.substring(0, 20),
      [instA?.split(' ')[2] || 'A']: a?.closingRank,
      [instB?.split(' ')[2] || 'B']: b?.closingRank,
    };
  });

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
          Institute Comparison
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Select two institutes to compare programs and cutoff ranks side-by-side
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
        {[{ val: instA, set: setInstA, label: 'Institute A' }, { val: instB, set: setInstB, label: 'Institute B' }].map(({ val, set, label }) => (
          <div key={label} className="card p-5">
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {label}
            </label>
            <select value={val} onChange={e => set(e.target.value)} style={{ marginBottom: 10 }}>
              <option value="">Select institute…</option>
              {institutes.map(inst => <option key={inst} value={inst}>{inst}</option>)}
            </select>
            {val && (
              <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--primary)' }}>{getInstituteType(val)}</strong>
                {' · '}
                {josaaData.filter(d => d.institute === val).length} programs in dataset
              </div>
            )}
          </div>
        ))}
      </div>

      {commonBranches.length > 0 && (
        <div className="card p-5 mb-6">
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 18 }}>Common Programs – Closing Rank Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="program" tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey={instA?.split(' ')[2] || 'A'} fill="#2563EB" radius={[5, 5, 0, 0]} />
              <Bar dataKey={instB?.split(' ')[2] || 'B'} fill="#93C5FD" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {commonBranches.length > 0 && (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Detailed Comparison – {commonBranches.length} Common Programs</h3>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)' }}>
                  {['Program', `${instA || 'A'} – Opening`, `${instA || 'A'} – Closing`, `${instB || 'B'} – Opening`, `${instB || 'B'} – Closing`].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commonBranches.map(program => {
                  const a = dataA.find(d => d.program === program);
                  const b = dataB.find(d => d.program === program);
                  return (
                    <tr key={program} style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{program}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{a?.openingRank?.toLocaleString() || '–'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>{a?.closingRank?.toLocaleString() || '–'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{b?.openingRank?.toLocaleString() || '–'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#2563EB' }}>{b?.closingRank?.toLocaleString() || '–'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {instA && instB && commonBranches.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          No common programs found between these two institutes.
        </div>
      )}
    </div>
  );
}