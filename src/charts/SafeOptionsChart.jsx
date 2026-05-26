import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SafeOptionsChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 14 }}>
      Enter your rank to see safe options chart
    </div>
  );

  // Top 8 safe options by closing rank
  const chartData = data
    .slice(0, 8)
    .map(d => ({
      name: d.institute?.replace('Indian Institute of Technology', 'IIT')
               .replace('National Institute of Technology', 'NIT')
               .split('(')[0].trim().substring(0, 18),
      closing: d.closingRank,
      opening: d.openingRank,
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div style={{
          background: 'var(--card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>
          <p style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 12, color: '#2563EB' }}>Opening: {payload[1]?.value?.toLocaleString()}</p>
          <p style={{ fontSize: 12, color: '#60A5FA' }}>Closing: {payload[0]?.value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="closing" fill="#60A5FA" radius={[6, 6, 0, 0]} />
        <Bar dataKey="opening" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}