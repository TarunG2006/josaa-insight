import { Link, useLocation } from 'react-router-dom';
import { BarChart2, GitCompare, MessageSquare, Star, TrendingUp } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Dashboard', icon: BarChart2 },
  { to: '/compare', label: 'Compare', icon: GitCompare },
  { to: '/ai-chat', label: 'AI Counselor', icon: MessageSquare },
  { to: '/trends', label: 'Trends', icon: TrendingUp },
  { to: '/favorites', label: 'Favorites', icon: Star },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <div style={{
            background: 'var(--primary)',
            borderRadius: '10px',
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <BarChart2 size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--text)', letterSpacing: '-0.3px' }}>
            JoSAA <span style={{ color: 'var(--primary)' }}>Insight</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  borderRadius: 9,
                  fontSize: 14,
                  fontWeight: active ? 600 : 500,
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  background: active ? 'rgba(37,99,235,0.08)' : 'transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = 'var(--card-hover)';
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Badge */}
        <div style={{
          background: 'rgba(37,99,235,0.08)',
          color: 'var(--primary)',
          borderRadius: 999,
          padding: '5px 14px',
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.3px',
        }}>
          JoSAA 2024
        </div>
      </div>
    </nav>
  );
}