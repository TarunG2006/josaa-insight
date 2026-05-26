import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{label}</p>
      {payload[0] && <p style={{ color: '#2563EB' }}>Closing Rank: {payload[0].value?.toLocaleString()}</p>}
      {payload[1] && <p style={{ color: '#60A5FA' }}>Opening Rank: {payload[1].value?.toLocaleString()}</p>}
      {payload[0]?.payload?.round && (
        <p style={{ color: 'var(--muted)', marginTop: 4, fontSize: 11 }}>Last Round: {payload[0].payload.round}</p>
      )}
    </div>
  );
};

export default function TrendChart({ data }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)', fontSize: 14 }}>
      No trend data available
    </div>
  );

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="year"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={v => v?.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="closingRank"
          stroke="#2563EB"
          strokeWidth={2.5}
          dot={{ r: 5, fill: '#2563EB' }}
          name="Closing Rank"
        />
        <Line
          type="monotone"
          dataKey="openingRank"
          stroke="#60A5FA"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={{ r: 3, fill: '#60A5FA' }}
          name="Opening Rank"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}