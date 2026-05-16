// src/components/layout/AppLayout.jsx — Sidebar + topbar shell
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/client';

const NAV = [
  {
    section: 'Overview',
    items: [
      { to: '/dashboard',  icon: '⬡', label: 'Dashboard' },
    ],
  },
  {
    section: 'Workforce',
    items: [
      { to: '/employees', icon: '◈', label: 'Employees' },
      { to: '/departments',icon: '⬡', label: 'Departments' },
      { to: '/attendance', icon: '◷', label: 'Attendance' },
    ],
  },
  {
    section: 'Finance',
    items: [
      { to: '/payroll',     icon: '◈', label: 'Payroll' },
      { to: '/transactions',icon: '⟳', label: 'Transactions' },
      { to: '/expenses',    icon: '◉', label: 'Expenses' },
    ],
  },
  {
    section: 'Intelligence',
    items: [
      { to: '/analytics', icon: '◎', label: 'Analytics' },
      { to: '/ai',        icon: '◈', label: 'AI Insights' },
    ],
  },
  {
    section: 'System',
    items: [
      { to: '/audit',    icon: '◈', label: 'Audit Log' },
    ],
  },
];

function roleLabel(role) {
  return role?.replace(/_/g, ' ').toLowerCase() ?? '';
}

export default function AppLayout({ children, title, subtitle }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await authApi.logout();
    } catch { /* ignore */ } finally {
      logout();
      navigate('/login');
    }
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <div className="app-shell">
      {/* ─── Sidebar ─── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-logo">P</div>
          <div>
            <div className="sidebar-brand-name">Payro</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((section) => (
            <div key={section.section}>
              <div className="nav-section-label">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-item${isActive ? ' active' : ''}`
                  }
                >
                  <span className="nav-icon">{item.icon}</span>
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            className="user-pill"
            onClick={() => navigate('/profile')}
          >
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <div className="user-name">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="user-role">{roleLabel(user?.role)}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="topbar-actions">
            {!user?.isEmailVerified && (
              <span
                className="badge badge-warning"
                title="Email not verified"
              >
                ⚠ Unverified
              </span>
            )}
            <button
              className="icon-btn"
              title="Profile"
              onClick={() => navigate('/profile')}
            >
              👤
            </button>
            <button
              className="icon-btn"
              title="Logout"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? <span className="spinner" style={{ width: 14, height: 14 }} /> : '⏻'}
            </button>
          </div>
        </header>

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}
