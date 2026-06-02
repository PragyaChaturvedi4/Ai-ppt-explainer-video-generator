import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cloud, LayoutDashboard, Plus, Bell, User } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [notifActive, setNotifActive] = useState(false);

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      padding: '0.75rem 2rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      background: 'rgba(6,12,26,0.75)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 16px rgba(56,189,248,0.35)',
        }}>
          <Cloud size={20} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
          Cloud<span className="gradient-text">PPT</span> Studio
        </span>
      </Link>

      {/* Nav Links */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }} className="hide-mobile">
        <NavLink to="/" active={location.pathname === '/'} icon={<LayoutDashboard size={16} />} label="Dashboard" />
      </nav>

      {/* Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notification bell */}
        <button
          className="btn-icon"
          onClick={() => setNotifActive(!notifActive)}
          style={{ position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} />
          {notifActive && (
            <span style={{
              position: 'absolute', top: 8, right: 8,
              width: 8, height: 8, borderRadius: '50%',
              background: '#38BDF8', border: '2px solid var(--bg-dark)',
            }} />
          )}
        </button>

        {/* Profile */}
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
          <User size={18} color="var(--accent-blue)" />
        </div>

        {/* CTA */}
        <Link to="/create" className="btn btn-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.875rem' }}>
          <Plus size={16} strokeWidth={2.5} /> New Video
        </Link>
      </div>
    </header>
  );
}

function NavLink({ to, active, icon, label }) {
  return (
    <Link to={to} style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      padding: '0.45rem 0.85rem', borderRadius: 8, fontSize: '0.875rem', fontWeight: 500,
      color: active ? 'var(--accent-blue)' : 'var(--text-secondary)',
      background: active ? 'rgba(56,189,248,0.1)' : 'transparent',
      transition: 'all 0.2s',
    }}>
      {icon} {label}
    </Link>
  );
}
