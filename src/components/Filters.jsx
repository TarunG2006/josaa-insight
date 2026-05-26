import { useState } from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';

const CATEGORIES = ['OPEN', 'OBC-NCL', 'SC', 'ST', 'EWS', 'OPEN-PwD', 'OBC-NCL-PwD', 'SC-PwD', 'ST-PwD', 'EWS-PwD'];
const GENDERS = ['Gender-Neutral', 'Female-only (including Supernumerary)'];
const INSTITUTE_TYPES = ['ALL', 'IIT', 'NIT', 'IIIT', 'GFTI'];

export default function Filters({ filters, onChange }) {
  const [open, setOpen] = useState(true);

  const update = (key, val) => onChange({ ...filters, [key]: val });
  const reset = () => onChange({
    rank: '', categoryRank: '', category: 'OPEN',
    gender: 'Gender-Neutral', instituteType: 'ALL', branch: '', safeOnly: false
  });

  const showCategoryRank = filters.category !== 'OPEN' && !filters.category.includes('PwD');

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>Filters</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontSize: 12, color: 'var(--text-secondary)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          }}>
            <RotateCcw size={13} /> Reset
          </button>
          <button onClick={() => setOpen(!open)} style={{
            fontSize: 12, color: 'var(--primary)', background: 'none',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
          }}>
            {open ? 'Collapse' : 'Expand'}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* CRL Rank */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Your CRL Rank
            </label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={filters.rank}
              onChange={e => update('rank', e.target.value ? Number(e.target.value) : '')}
            />
          </div>

          {/* Category Rank — shown for reserved categories */}
          {showCategoryRank && (
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--primary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your {filters.category} Rank
              </label>
              <input
                type="number"
                placeholder="e.g. 1200"
                value={filters.categoryRank || ''}
                onChange={e => update('categoryRank', e.target.value ? Number(e.target.value) : '')}
              />
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                Enter your category rank from JEE scorecard
              </p>
            </div>
          )}

          {/* Category */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Category
            </label>
            <select value={filters.category} onChange={e => update('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Gender */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Gender
            </label>
            <select value={filters.gender} onChange={e => update('gender', e.target.value)}>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Institute Type */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Institute Type
            </label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {INSTITUTE_TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => update('instituteType', t)}
                  style={{
                    padding: '5px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                    border: '1.5px solid', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    borderColor: filters.instituteType === t ? 'var(--primary)' : 'var(--border)',
                    background: filters.instituteType === t ? 'var(--primary)' : 'transparent',
                    color: filters.instituteType === t ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Branch search */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Branch (search)
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science"
              value={filters.branch}
              onChange={e => update('branch', e.target.value)}
            />
          </div>

          {/* Safe only toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div
              onClick={() => update('safeOnly', !filters.safeOnly)}
              style={{
                width: 40, height: 22, borderRadius: 999,
                background: filters.safeOnly ? 'var(--primary)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s', cursor: 'pointer', flexShrink: 0,
              }}
            >
              <div style={{
                position: 'absolute', top: 3, left: filters.safeOnly ? 21 : 3,
                width: 16, height: 16, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>
              Safe options only
            </span>
          </label>

        </div>
      )}
    </div>
  );
}