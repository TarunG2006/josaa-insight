import { useState, useEffect, useMemo } from 'react';
import { Search, Download, AlertCircle, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import Filters from '../components/Filters';
import CollegeCard from '../components/CollegeCard';
import SafeOptionsChart from '../charts/SafeOptionsChart';
import { filterResults } from '../utils/filters';
import { predictCategory } from '../utils/predictor';
import { getLatestRoundDataWithHistory } from '../utils/dataLoader';

const DEFAULT_FILTERS = {
  rank: '',
  category: 'OPEN',
  gender: 'Gender-Neutral',
  instituteType: 'ALL',
  branch: '',
  safeOnly: false, categoryRank: '',
};

export default function Dashboard({ favorites, onToggleFavorite, isFavorite }) {
  const [josaaData, setJosaaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  useEffect(() => {
    getLatestRoundDataWithHistory(2024).then(data => {
      setJosaaData(data);
      setLoading(false);
    });
  }, []);

  const effectiveRank = useMemo(() => {
  if (filters.category !== 'OPEN' && filters.categoryRank) return parseInt(filters.categoryRank);
  return parseInt(filters.rank) || 0;
}, [filters.rank, filters.category, filters.categoryRank]);

const results = useMemo(() => filterResults(josaaData, filters), [josaaData, filters]);

 const filtered = useMemo(() => {
  let list = results;
  if (search.trim()) {
    const q = search.toLowerCase();
    list = list.filter(d =>
      d.institute?.toLowerCase().includes(q) ||
      d.program?.toLowerCase().includes(q)
    );
  }
  // Sort by closingRank ascending = most competitive first = probability increasing
  return [...list].sort((a, b) => (a.closingRank || 0) - (b.closingRank || 0));
}, [results, search]);

  const stats = useMemo(() => ({
  total: filtered.filter(d => d.closingRank >= effectiveRank).length,
  safe: filtered.filter(d => predictCategory(effectiveRank, d.closingRank) === 'safe').length,
  target: filtered.filter(d => predictCategory(effectiveRank, d.closingRank) === 'target').length,
  dream: filtered.filter(d => predictCategory(effectiveRank, d.closingRank) === 'dream').length,
}), [filtered, effectiveRank]);
  const paginated = filtered.slice(0, page * PER_PAGE);

 

  
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('JoSAA Insight – My College List', 14, 20);
    doc.setFontSize(10);
    doc.text(`Rank: ${filters.rank || 'N/A'} | Category: ${filters.category} | Generated: ${new Date().toLocaleDateString()}`, 14, 30);
    let y = 42;
    filtered.slice(0, 30).forEach((d, i) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.text(`${i + 1}. ${d.institute}`, 14, y);
      doc.setFontSize(9);
      doc.setTextColor(80);
      doc.text(`   ${d.program} | OR: ${d.openingRank} | CR: ${d.closingRank} | ${d.category}`, 14, y + 5);
      doc.setTextColor(0);
      y += 14;
    });
    doc.save('josaa-insight-list.pdf');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
        <Loader2 size={36} color="var(--primary)" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: 15, color: 'var(--text-secondary)', fontWeight: 500 }}>Loading JoSAA dataset…</p>
        <p style={{ fontSize: 12, color: 'var(--muted)' }}>Fetching and normalizing 2016–2024 records</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 6 }}>
          Counseling Dashboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Enter your rank and preferences to discover eligible programs across IITs, NITs, IIITs & GFTIs
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>
        <div style={{ position: 'sticky', top: 84 }}>
          <Filters filters={filters} onChange={f => { setFilters(f); setPage(1); }} />
        </div>

        <div>
          {filters.rank && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: 'Eligible', value: stats.total, color: 'var(--primary)' },
                { label: 'Safe', value: stats.safe, color: 'var(--success)' },
                { label: 'Target', value: stats.target, color: '#F59E0B' },
                { label: 'Dream', value: stats.dream, color: '#7C3AED' },
              ].map(({ label, value, color }) => (
                <div key={label} className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color }}>{value}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>
          )}

          {filters.rank && filtered.length > 0 && (
            <div className="card p-5 mb-5">
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                Top Eligible Programs – Cutoff Overview
              </h3>
              <SafeOptionsChart data={filtered} />
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)' }} />
              <input
                type="text"
                placeholder="Search institute or program…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                style={{ paddingLeft: 36 }}
              />
            </div>
            <button className="btn-outline" onClick={exportPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
              <Download size={14} /> Export PDF
            </button>
          </div>

          {filtered.length === 0 && (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>No results found. Try adjusting your filters.</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {paginated.map((item, i) => (
              <CollegeCard
                key={i}
                data={item}
                userRank={effectiveRank || filters.rank}
                onFavorite={onToggleFavorite}
                isFavorite={isFavorite(item)}
              />
            ))}
          </div>

          {filtered.length > paginated.length && (
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <button className="btn-outline" onClick={() => setPage(p => p + 1)}>
                Load more ({filtered.length - paginated.length} remaining)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
