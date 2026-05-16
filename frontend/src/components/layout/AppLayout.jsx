// src/components/layout/AppLayout.jsx — Premium Luxury Shell
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/client';

const NAV = [
  {
    section: 'Intelligence',
    items: [
      { to: '/dashboard',  icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Command Center' },
      { to: '/ai',         icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'AI Strategy' },
    ],
  },
  {
    section: 'Global Workforce',
    items: [
      { to: '/employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', label: 'Professional Directory' },
      { to: '/attendance',icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Time & Attendance' },
      { to: '/departments',icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', label: 'Departments' },
    ],
  },
  {
    section: 'Treasury & Ledger',
    items: [
      { to: '/payroll',     icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Disbursement' },
      { to: '/treasury',    icon: 'M8 14v20c0 4.418 7.163 8 16 8 1.38 0 2.721-.087 4-.252V22c-1.279.165-2.62.252-4 .252-8.837 0-16-3.582-16-8zm0 0c0-4.418 7.163-8 16-8s16 3.582 16 8M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8m0 0V10c0-4.418-7.163-8-16-8S8 5.582 8 10v4', label: 'Treasury Hub' },
      { to: '/analytics',   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v16a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Performance' },
    ],
  },
  {
    section: 'Governance',
    items: [
      { to: '/compliance',  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', label: 'Compliance Guard' },
      { to: '/security',    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', label: 'Security Portal' },
      { to: '/audit',       icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'Institutional Audit' },
    ],
  },
];

function Icon({ path, className = "w-5 h-5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
  );
}

export default function AppLayout({ children, title, subtitle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try { await authApi.logout(); } catch { } finally {
      logout();
      navigate('/login');
    }
  }

  const initials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() : 'P';

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '3rem' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--text-royal-navy)', 
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-gold)', fontSize: '20px', fontWeight: '800',
            boxShadow: '0 8px 16px -4px rgba(30, 42, 56, 0.2)'
          }}>P</div>
          <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.03em', color: 'var(--text-royal-navy)' }}>Payro</span>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map((section) => (
            <div key={section.section} style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-slate)', 
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingLeft: '1rem' 
              }}>{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon path={item.icon} className="nav-icon" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer" style={{ marginTop: 'auto', borderTop: '1px solid var(--border-platinum)', paddingTop: '1.5rem' }}>
          <div className="user-pill" style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
            <div style={{ 
              width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-soft-ivory)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-platinum)',
              fontSize: '12px', fontWeight: '600', color: 'var(--text-royal-navy)'
            }}>{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.firstName} {user?.lastName}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-slate)', textTransform: 'capitalize' }}>{user?.role?.toLowerCase().replace('_', ' ')}</div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', marginTop: '1rem', padding: '10px', borderRadius: '10px', 
              background: 'transparent', border: '1px solid var(--border-platinum)',
              fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'var(--transition)'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-platinum)'}
          >
            {loggingOut ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <main className="main-content">
        <header className="glass" style={{ 
          position: 'sticky', top: '1.5rem', zIndex: 40,
          padding: '1rem 2rem', borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-platinum)', display: 'flex', 
          justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem',
          boxShadow: 'var(--shadow-premium)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{title}</h1>
            {subtitle && <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" style={{ background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)' }}>
              <Icon path="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/ai')}>
              <Icon path="M13 10V3L4 14h7v7l9-11h-7z" />
              AI Insights
            </button>
          </div>
        </header>

        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}

