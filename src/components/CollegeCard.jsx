import { useState } from 'react';
import { Star, MapPin, TrendingUp, BookOpen } from 'lucide-react';
import { predictCategory, getBadgeLabel, getBadgeClass, getAdmissionProbability } from '../utils/predictor';
import { getInstituteType } from '../utils/filters';

const TYPE_COLORS = {
  IIT: { bg: '#EFF6FF', color: '#1D4ED8', label: 'IIT' },
  NIT: { bg: '#F0FDF4', color: '#166534', label: 'NIT' },
  IIIT: { bg: '#FDF4FF', color: '#7E22CE', label: 'IIIT' },
  GFTI: { bg: '#FFF7ED', color: '#C2410C', label: 'GFTI' },
};

export default function CollegeCard({ data, userRank, onFavorite, isFavorite }) {
  const { institute, program, category, gender, openingRank, closingRank, round } = data;
  const predCategory = predictCategory(userRank, closingRank);
  const probability = getAdmissionProbability(userRank, closingRank, data.historicalClosingRanks);
  const instType = getInstituteType(institute);
  const typeStyle = TYPE_COLORS[instType] || TYPE_COLORS.GFTI;

  return (
    <div className="card p-5" style={{ transition: 'all 0.2s' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div style={{ flex: 1, marginRight: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              background: typeStyle.bg, color: typeStyle.color,
              borderRadius: 6, padding: '2px 9px', fontSize: 11, fontWeight: 700,
              letterSpacing: '0.4px',
            }}>
              {typeStyle.label}
            </span>
            {predCategory && predCategory !== 'out_of_reach' && (
              <span className={getBadgeClass(predCategory)}>{getBadgeLabel(predCategory)}</span>
            )}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', lineHeight: 1.3 }}>
            {institute}
          </h3>
        </div>
        <button
          onClick={() => onFavorite && onFavorite(data)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
            color: isFavorite ? '#F59E0B' : 'var(--muted)',
          }}
        >
          <Star size={18} fill={isFavorite ? '#F59E0B' : 'none'} />
        </button>
      </div>

      {/* Program */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        <BookOpen size={14} style={{ color: 'var(--primary)' }} />
        <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{program}</span>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8, marginBottom: 12,
      }}>
        {[
          { label: 'Opening', value: openingRank?.toLocaleString() },
          { label: 'Closing', value: closingRank?.toLocaleString() },
          { label: 'Round', value: round || 'Final' },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--bg)', borderRadius: 8, padding: '8px 10px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 500, marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{value || '—'}</div>
          </div>
        ))}
      </div>

      {/* Probability bar */}
      {userRank && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>Admission Probability</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{probability}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${probability}%`,
              background: probability >= 70 ? 'var(--success)' : probability >= 40 ? '#F59E0B' : 'var(--danger)',
              borderRadius: 999, transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>
          {category} · {gender === 'Gender-Neutral' ? 'All Genders' : 'Female Only'}
        </span>
      </div>
    </div>
  );
}