// src/pages/AnalyticsPage.jsx — Luxury Executive Analytics
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, PieChart, TrendingUp, Download, 
  Filter, Calendar, ArrowUpRight, DollarSign,
  Briefcase, UserPlus, Globe, ShieldCheck, ChevronDown
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { analyticsApi } from '../api/client';

export default function AnalyticsPage() {
  const [data, setData] = useState({ trend: [], budget: [], headcount: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [trend, budget, headcount] = await Promise.all([
          analyticsApi.payrollTrend(),
          analyticsApi.budgetBreakdown(),
          analyticsApi.headcountTrend()
        ]);
        setData({ 
          trend: trend.data.data, 
          budget: budget.data.data, 
          headcount: headcount.data.data 
        });
      } catch (err) {
        console.error("Analytics Data Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const COLORS = ['var(--accent-gold)', 'var(--text-royal-navy)', '#3b82f6', '#10b981', '#8b5cf6'];

  return (
    <AppLayout 
      title="Executive Analytics" 
      subtitle="Strategic performance metrics and institutional financial oversight"
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Strategic Controls ─── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn glass" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <Calendar size={16} /> Last 12 Months <ChevronDown size={14} />
            </button>
            <button className="btn glass" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <Globe size={16} /> Global View <ChevronDown size={14} />
            </button>
          </div>
          <button className="btn btn-gold" style={{ padding: '10px 24px' }}>
            <Download size={16} /> Export Executive Report
          </button>
        </div>

        {/* ─── KPI Scorecard ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Total Annual Outflow', val: '₹482.4M', trend: '+5.2%', icon: <DollarSign />, color: 'var(--accent-gold)' },
            { label: 'Average Compensation', val: '₹1.2M', trend: '+2.1%', icon: <Briefcase />, color: '#3b82f6' },
            { label: 'Retention Coefficient', val: '98.2%', trend: '+0.4%', icon: <ShieldCheck />, color: '#10b981' },
            { label: 'Headcount Velocity', val: '+14%', trend: 'Steady', icon: <UserPlus />, color: '#8b5cf6' }
          ].map((k, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card glass-hover" 
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: `${k.color}15`, color: k.color }}>
                  {k.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#10b981' }}>{k.trend}</div>
              </div>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k.label}</div>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-royal-navy)', marginTop: '4px' }}>{k.val}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          
          {/* ─── Growth Trend Chart ─── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Strategic Payroll Dynamics</h3>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: '700' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)' }} /> Net Disbursement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-royal-navy)' }} /> Gross Commitment</div>
              </div>
            </div>
            <div style={{ height: '350px', width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={data.trend}>
                  <defs>
                    <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="totalNet" stroke="var(--accent-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorNet)" />
                  <Area type="monotone" dataKey="totalGross" stroke="var(--text-royal-navy)" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ─── Departmental Allocation ─── */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem' }}>Allocation Breakdown</h3>
            <div style={{ height: '250px', width: '100%' }}>
              <ResponsiveContainer>
                <RePieChart>
                  <Pie
                    data={data.budget}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="allocated"
                  >
                    {data.budget.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.budget.map((dept, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    {dept.name}
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{dept.utilizationPct}%</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ─── Workforce Velocity ─── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Institutional Growth Velocity</h3>
            <div className="badge badge-info">TOTAL HEADCOUNT: 1,420</div>
          </div>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={data.headcount}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                <Bar dataKey="count" fill="var(--accent-gold)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ─── Optimization Notice ─── */}
        <div className="card glass" style={{ 
          marginTop: '3rem', padding: '2rem', textAlign: 'center', 
          border: '1px solid var(--border-platinum)', background: 'rgba(255, 255, 255, 0.4)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Analytics Architecture Under Optimization</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)', marginBottom: '1.5rem' }}>
            Enhancing data aggregation for real-time executive dashboards.
          </p>
          <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: 'var(--border-platinum)', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ width: '92%', height: '100%', background: 'var(--accent-gold)' }} />
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
            PHASE 2.4 DEPLOYMENT • 92% COMPLETE
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
