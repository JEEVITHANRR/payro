// src/pages/AiInsightsPage.jsx — Luxury AI Intelligence Center
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, TrendingUp, AlertTriangle, CheckCircle2, 
  Zap, Sparkles, BarChart3, ShieldCheck, ArrowRight,
  Target, Calculator, History, Activity
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import { aiApi } from '../api/client';

export default function AiInsightsPage() {
  const [insights, setInsights] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    async function fetchData() {
      try {
        const [insightsRes, statsRes] = await Promise.all([
          aiApi.list({ isActive: true }),
          aiApi.salaryPredictions() // Mocking for now as per controller logic
        ]);
        setInsights(insightsRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        console.error("AI Data Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <AppLayout 
      title="AI Strategic Intelligence" 
      subtitle="Institutional-grade predictive analytics and anomaly detection"
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Hero Intelligence Banner ─── */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card glass"
          style={{ 
            background: 'linear-gradient(135deg, var(--text-royal-navy) 0%, #2c3e50 100%)',
            padding: '3rem', color: 'white', border: 'none', marginBottom: '2rem',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '600px' }}>
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '8px', 
              background: 'rgba(214, 179, 106, 0.2)', padding: '6px 12px', 
              borderRadius: '100px', color: 'var(--accent-gold)', fontSize: '0.7rem',
              fontWeight: '700', letterSpacing: '0.05em', marginBottom: '1.5rem'
            }}>
              <Sparkles size={14} /> SYSTEM INTEGRATION: 65% COMPLETE
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Strategic Neural <span style={{ color: 'var(--accent-gold)' }}>Optimization.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: '1.6' }}>
              Our proprietary AI models are currently analyzing 1.4M+ data points across your global workforce to identify tax optimizations and cost efficiencies.
            </p>
          </div>
          <div style={{ 
            position: 'absolute', right: '-10%', top: '-20%', opacity: 0.1, 
            transform: 'rotate(-15deg)' 
          }}>
            <Brain size={400} color="var(--accent-gold)" />
          </div>
        </motion.div>

        {/* ─── Core Metric Grid ─── */}
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}
        >
          {[
            { label: 'Predictive Savings', val: '₹4.2M', trend: '+12%', icon: <Target />, color: 'var(--accent-gold)' },
            { label: 'Anomaly Threshold', val: '0.02%', trend: 'Optimal', icon: <ShieldCheck />, color: '#10b981' },
            { label: 'Forecast Variance', val: '±1.4%', trend: '-0.2%', icon: <Activity />, color: '#3b82f6' },
            { label: 'Model Confidence', val: '98.4%', trend: 'High', icon: <Brain />, color: '#8b5cf6' }
          ].map((m, i) => (
            <motion.div key={i} variants={item} className="card glass-hover" style={{ padding: '1.5rem', position: 'relative' }}>
              <div style={{ color: m.color, marginBottom: '1rem' }}>{m.icon}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-slate)', textTransform: 'uppercase' }}>{m.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)', margin: '4px 0' }}>{m.val}</div>
              <div style={{ fontSize: '0.75rem', color: m.trend.includes('+') ? '#10b981' : '#64748b', fontWeight: '700' }}>{m.trend}</div>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* ─── Predictive Salary Chart ─── */}
          <motion.div variants={item} className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Market Compensation Forecasting</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Predicted salary trends for Q4 2024</p>
              </div>
              <div className="badge badge-gold">AI PREDICTION</div>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer>
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorSal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-gold)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--accent-gold)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="avgSalary" stroke="var(--accent-gold)" strokeWidth={3} fillOpacity={1} fill="url(#colorSal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ─── Neural Insight Feed ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={18} color="var(--accent-gold)" /> Live Intelligence Feed
            </h3>
            <AnimatePresence>
              {insights.map((insight, idx) => (
                <motion.div 
                  key={insight.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="card glass-hover" 
                  style={{ 
                    padding: '1.25rem', 
                    borderLeft: `4px solid ${insight.severity === 'CRITICAL' ? '#ef4444' : 'var(--accent-gold)'}` 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)' }}>
                      {insight.type.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: '700' }}>
                      {Math.round(insight.confidence * 100)}% Match
                    </div>
                  </div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '700', marginBottom: '0.5rem' }}>{insight.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {insight.summary}
                  </p>
                  <button className="btn" style={{ 
                    width: '100%', fontSize: '0.75rem', padding: '8px', 
                    background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)'
                  }}>
                    Execute Strategy <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* ─── Optimization Notice ─── */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="card glass"
          style={{ 
            marginTop: '4rem', padding: '3rem', textAlign: 'center',
            border: '1px dashed var(--accent-gold)', background: 'rgba(214, 179, 106, 0.03)'
          }}
        >
          <Sparkles size={40} color="var(--accent-gold)" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>AI Insights Architecture Under Optimization</h2>
          <p style={{ color: 'var(--text-slate)', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            This enterprise module is currently being integrated into our high-performance React core. 
            Real-time synchronization and security auditing are in progress.
          </p>
          <div style={{ width: '100%', maxWidth: '400px', height: '6px', background: 'var(--border-platinum)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '65%' }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ height: '100%', background: 'var(--accent-gold)' }} 
            />
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>
            PHASE 2.4 DEPLOYMENT • COMING SOON • 65% INTEGRATED
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
