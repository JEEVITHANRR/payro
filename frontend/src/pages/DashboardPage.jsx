// src/pages/DashboardPage.jsx — Luxury Enterprise Dashboard
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import { dashboardApi, notificationsApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

function StatCard({ label, value, change, changeDir, icon, color }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ padding: '8px', borderRadius: '10px', background: 'var(--bg-soft-ivory)', color: color || 'var(--accent-gold)' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-royal-navy)', letterSpacing: '-0.02em' }}>{value}</div>
        {change != null && (
          <div style={{ fontSize: '0.75rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: changeDir === 'up' ? 'var(--emerald-elegant)' : '#EF4444', fontWeight: '700' }}>
              {changeDir === 'up' ? '↑' : '↓'} {Math.abs(change)}%
            </span>
            <span style={{ color: 'var(--text-slate)' }}>vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [summary, setSummary]   = useState(null);
  const [kpis, setKpis]         = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [sumRes, kpiRes, actRes] = await Promise.allSettled([
        dashboardApi.summary(),
        dashboardApi.kpis(),
        dashboardApi.liveActivity(),
      ]);

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data.data);
      if (kpiRes.status === 'fulfilled') setKpis(kpiRes.value.data.data);
      if (actRes.status === 'fulfilled') setActivity(actRes.value.data.data?.auditLogs ?? []);
    } catch {
      toast.error('Failed to load insights.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const fmt = (n) => new Intl.NumberFormat('en-US').format(n || 0);
  const fmtCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <AppLayout
      title={`${greeting()}, ${user?.firstName}`}
      subtitle="Welcome to your executive command center."
    >
      {/* ─── Key Performance Indicators ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard 
          label="Total Workforce" 
          value={fmt(summary?.workforce?.total)} 
          change={12.5} changeDir="up"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
        <StatCard 
          label="Annual Payroll" 
          value={fmtCurrency(summary?.payroll?.totalCost)} 
          change={4.2} changeDir="up"
          color="var(--emerald-elegant)"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard 
          label="Retention Rate" 
          value={`${kpis?.retentionRate?.value ?? 98.4}%`} 
          change={0.8} changeDir="up"
          color="var(--accent-gold)"
          icon="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
        />
        <StatCard 
          label="Avg Longevity" 
          value={`${kpis?.avgLongevity?.value ?? 4.2} yrs`} 
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* ─── Workforce Distribution ─── */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Treasury Dynamics</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-soft-ivory)' }}>Weekly</button>
              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>Monthly</button>
            </div>
          </div>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
            {[65, 45, 80, 55, 90, 70, 85].map((h, i) => (
              <div key={i} style={{ flex: 1, position: 'relative' }}>
                <div 
                  className="animate-fade-in"
                  style={{ 
                    height: `${h}%`, width: '100%', background: i === 4 ? 'var(--accent-gold)' : 'var(--text-royal-navy)',
                    borderRadius: '8px 8px 4px 4px', transition: 'var(--transition)', cursor: 'pointer',
                    opacity: 0.9
                  }} 
                  onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '0.9'}
                />
                <div style={{ fontSize: '0.65rem', color: 'var(--text-slate)', textAlign: 'center', marginTop: '8px', fontWeight: '600' }}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Live Ecosystem Feed ─── */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Live Activity</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activity.slice(0, 5).map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '10px', background: 'var(--bg-soft-ivory)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', flexShrink: 0
                }}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-royal-navy)' }}>{item.action}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.actor} • {item.entity}
                  </div>
                </div>
              </div>
            ))}
            {activity.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-slate)', fontSize: '0.9rem' }}>
                Monitoring systems online...
              </div>
            )}
          </div>
          <button className="btn" style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', background: 'var(--bg-soft-ivory)', color: 'var(--text-slate)' }}>
            View Full Audit
          </button>
        </div>
      </div>
    </AppLayout>
  );
}

