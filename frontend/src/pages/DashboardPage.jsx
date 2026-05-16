// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import { dashboardApi, notificationsApi } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';

function StatCard({ label, value, change, changeDir, color, prefix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || 'var(--text)' }}>
        {prefix}{value ?? '—'}
      </div>
      {change != null && (
        <div className={`stat-change ${changeDir}`}>
          {changeDir === 'up' ? '▲' : '▼'} {Math.abs(change)}% vs last month
        </div>
      )}
    </div>
  );
}

function Skeleton({ height = 120, className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ height, borderRadius: 16 }}
    />
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [summary, setSummary]         = useState(null);
  const [kpis, setKpis]               = useState(null);
  const [activity, setActivity]       = useState([]);
  const [unread, setUnread]           = useState(0);
  const [loading, setLoading]         = useState(true);

  const load = useCallback(async () => {
    try {
      const [sumRes, kpiRes, actRes, notifRes] = await Promise.allSettled([
        dashboardApi.summary(),
        dashboardApi.kpis(),
        dashboardApi.liveActivity(),
        notificationsApi.unreadCount(),
      ]);

      if (sumRes.status === 'fulfilled')   setSummary(sumRes.value.data.data);
      if (kpiRes.status === 'fulfilled')   setKpis(kpiRes.value.data.data);
      if (actRes.status === 'fulfilled')   setActivity(actRes.value.data.data ?? []);
      if (notifRes.status === 'fulfilled') setUnread(notifRes.value.data.data?.count ?? 0);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function resendVerification() {
    try {
      await authApi.sendVerification();
      toast.success('Verification email sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification.');
    }
  }

  function fmt(n) {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);
  }

  function fmtCurrency(n) {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout
      title={`${greeting()}, ${user?.firstName} 👋`}
      subtitle={new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      })}
    >
      {/* Email verification banner */}
      {user && !user.isEmailVerified && (
        <div className="verify-banner">
          <span>⚠️</span>
          <span>
            Your email is not verified. Some features may be restricted.
          </span>
          <button onClick={resendVerification}>Resend Email</button>
        </div>
      )}

      {/* Notification badge */}
      {unread > 0 && (
        <div
          className="alert alert-info"
          style={{ cursor: 'pointer', marginBottom: 20 }}
          onClick={() => navigate('/notifications')}
        >
          🔔 You have <strong>{unread}</strong> unread notification{unread !== 1 ? 's' : ''}.
        </div>
      )}

      {/* ── KPI Stats ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : (
          <>
            <StatCard
              label="Total Employees"
              value={fmt(summary?.totalEmployees)}
              change={summary?.employeeGrowth}
              changeDir={summary?.employeeGrowth >= 0 ? 'up' : 'down'}
              color="var(--primary)"
            />
            <StatCard
              label="Monthly Payroll"
              value={fmtCurrency(summary?.monthlyPayroll)}
              change={summary?.payrollChange}
              changeDir={summary?.payrollChange >= 0 ? 'up' : 'down'}
              color="var(--cyan)"
            />
            <StatCard
              label="Active Payroll Runs"
              value={fmt(summary?.activePayrolls)}
              color="var(--emerald)"
            />
            <StatCard
              label="Pending Expenses"
              value={fmt(summary?.pendingExpenses)}
              color="var(--amber)"
            />
          </>
        )}
      </div>

      {/* ── Secondary KPIs ── */}
      {kpis && (
        <div className="grid-4" style={{ marginBottom: 28 }}>
          <StatCard label="Avg Salary"        value={fmtCurrency(kpis.avgSalary)} />
          <StatCard label="Departments"       value={fmt(kpis.departments)} />
          <StatCard label="This Month Payouts" value={fmtCurrency(kpis.monthPayouts)} />
          <StatCard label="On Leave Today"    value={fmt(kpis.onLeave)} />
        </div>
      )}

      {/* ── Activity Feed ── */}
      <div className="grid-2">
        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Live Activity
          </h3>
          {loading ? (
            <Skeleton height={200} />
          ) : activity.length === 0 ? (
            <div className="empty-state" style={{ padding: '32px 0' }}>
              <div className="icon">⚡</div>
              <p>No recent activity</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activity.slice(0, 8).map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    paddingBottom: 12,
                    borderBottom: i < activity.slice(0,8).length - 1
                      ? '1px solid var(--border)'
                      : 'none',
                  }}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: 'var(--primary)', marginTop: 6, flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, color: 'var(--text)' }}>
                      {item.action} — <span style={{ color: 'var(--text2)' }}>{item.entity}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      {item.actor} ·{' '}
                      {new Date(item.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: '+ New Employee',   to: '/employees', icon: '👤', color: 'var(--primary-dim)', border: 'rgba(167,139,250,0.2)' },
              { label: '⚡ Run Payroll',   to: '/payroll',   icon: '💸', color: 'var(--cyan-dim)',    border: 'rgba(103,232,249,0.2)' },
              { label: '📊 View Analytics',to: '/analytics', icon: '📊', color: 'var(--emerald-dim)',  border: 'rgba(110,231,183,0.2)' },
              { label: '🔔 Notifications', to: '/notifications', icon: '🔔', color: 'var(--amber-dim)', border: 'rgba(252,211,77,0.2)' },
            ].map((action) => (
              <button
                key={action.to}
                onClick={() => navigate(action.to)}
                style={{
                  background: action.color,
                  border: `1px solid ${action.border}`,
                  borderRadius: 10,
                  padding: '12px 16px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: 13.5,
                  fontWeight: 500,
                  fontFamily: 'var(--font-ui)',
                  transition: 'var(--transition)',
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: 20, padding: '16px', background: 'var(--surface2)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              System Status
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { label: 'API', ok: true },
                { label: 'DB', ok: true },
                { label: 'Redis', ok: true },
              ].map((s) => (
                <span key={s.label} className={`badge ${s.ok ? 'badge-success' : 'badge-danger'}`}>
                  {s.ok ? '●' : '○'} {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
