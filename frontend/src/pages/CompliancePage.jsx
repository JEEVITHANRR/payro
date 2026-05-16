// src/pages/CompliancePage.jsx — Luxury Institutional Compliance
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, FileText, AlertTriangle, Scale, 
  History, Download, Filter, CheckCircle2,
  Lock, Globe, Search, ArrowRight, Bell
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('status');

  const alerts = [
    { id: 1, type: 'TAX', title: 'Q4 Tax Provisioning Required', severity: 'HIGH', date: '2 hours ago' },
    { id: 2, type: 'LABOR', title: 'PF Regulatory Update — Karnataka', severity: 'MEDIUM', date: '1 day ago' },
    { id: 3, type: 'AUDIT', title: 'Annual Financial Audit Scheduled', severity: 'INFO', date: '3 days ago' },
  ];

  return (
    <AppLayout 
      title="Compliance & Governance" 
      subtitle="Institutional oversight of global regulatory standards and audit integrity"
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Compliance Health Hero ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card" 
            style={{ 
              background: 'linear-gradient(135deg, #1e2a38 0%, #2c3e50 100%)', 
              color: 'white', padding: '3rem', border: 'none', position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                background: 'rgba(16, 185, 129, 0.2)', padding: '6px 12px', 
                borderRadius: '100px', color: '#10b981', fontSize: '0.7rem',
                fontWeight: '800', letterSpacing: '0.05em', marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={14} /> SYSTEM INTEGRITY: OPTIMAL
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Overall Compliance Score: <span style={{ color: 'var(--accent-gold)' }}>99.8%</span></h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontSize: '0.95rem', maxWidth: '400px' }}>
                Your organization is currently synchronized with 142 international labor laws and tax regulations.
              </p>
              <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-gold" style={{ padding: '12px 24px' }}>Download Certificate</button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Global Standards</button>
              </div>
            </div>
            <div style={{ position: 'absolute', right: '-10%', bottom: '-20%', opacity: 0.1 }}><Scale size={300} color="var(--accent-gold)" /></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card glass" 
            style={{ padding: '2.5rem' }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell size={20} color="var(--accent-gold)" /> Critical Compliance Alerts
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {alerts.map(alert => (
                <div key={alert.id} className="glass-hover" style={{ 
                  padding: '1.25rem', borderRadius: '16px', display: 'flex', 
                  justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-platinum)'
                }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ 
                      padding: '10px', borderRadius: '12px', 
                      background: alert.severity === 'HIGH' ? '#ef444415' : 'rgba(214, 179, 106, 0.1)',
                      color: alert.severity === 'HIGH' ? '#ef4444' : 'var(--accent-gold)'
                    }}>
                      <AlertTriangle size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{alert.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)', marginTop: '2px' }}>{alert.type} • {alert.date}</div>
                    </div>
                  </div>
                  <button className="btn" style={{ color: 'var(--accent-gold)' }}><ArrowRight size={18} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* ─── Compliance Modules ─── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {[
              { title: 'Tax Jurisdiction Engine', status: 'Synchronized', sub: 'Last sync: 12m ago', icon: <Globe />, color: '#3b82f6' },
              { title: 'Labor Law Guard', status: 'Compliant', sub: 'V24.2 Standards', icon: <Scale />, color: '#10b981' },
              { title: 'Document Integrity', status: '98% Verified', sub: '14 Pending Review', icon: <FileText />, color: 'var(--accent-gold)' },
              { title: 'Security Audit Nodes', status: 'Active', sub: 'SOC2 Certified', icon: <Lock />, color: '#8b5cf6' }
            ].map((m, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="card glass-hover" 
                style={{ padding: '2rem' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '12px', borderRadius: '14px', background: `${m.color}10`, color: m.color }}>
                    {m.icon}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> {m.status}
                  </div>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>{m.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)' }}>{m.sub}</p>
              </motion.div>
            ))}
            
            {/* ─── Recent Audit History ─── */}
            <div className="card" style={{ gridColumn: 'span 2', padding: '0' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Recent Compliance Audit Logs</h3>
                <button className="btn" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: '700' }}>Full History</button>
              </div>
              <div style={{ padding: '1rem 2rem' }}>
                {[
                  { action: 'Tax Bracket Update', user: 'Admin User', date: 'Oct 16, 2024 14:20', ip: '142.10.42.11' },
                  { action: 'New Employee Document Verified', user: 'HR System', date: 'Oct 16, 2024 12:45', ip: 'Internal' },
                  { action: 'Payroll Compliance Run', user: 'CFO Office', date: 'Oct 15, 2024 18:10', ip: '192.168.1.42' }
                ].map((log, i) => (
                  <div key={i} style={{ 
                    padding: '12px 0', borderBottom: i === 2 ? 'none' : '1px solid var(--border-platinum)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{log.action}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{log.user} • {log.date}</div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)', fontWeight: '600', padding: '4px 8px', background: 'var(--bg-soft-ivory)', borderRadius: '6px' }}>
                      {log.ip}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── Regulatory Documentation ─── */}
          <div className="card glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <History size={18} color="var(--accent-gold)" /> Regulatory Filing
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[
                { name: 'Income Tax Form-16A', status: 'Ready', date: 'Dec 2024' },
                { name: 'EPF Monthly Returns', status: 'Filing In Progress', date: 'Oct 2024' },
                { name: 'Professional Tax Report', status: 'Scheduled', date: 'Nov 2024' }
              ].map((doc, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{doc.name}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: doc.status.includes('Ready') ? '#10b981' : 'var(--accent-gold)' }}>{doc.status}</div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>Due: {doc.date}</div>
                    <button className="btn" style={{ padding: '4px', color: 'var(--text-slate)' }}><Download size={16} /></button>
                  </div>
                  {i < 2 && <div style={{ height: '1px', background: 'var(--border-platinum)', marginTop: '1.5rem' }} />}
                </div>
              ))}
            </div>
            
            <button className="btn btn-gold" style={{ width: '100%', marginTop: '2.5rem', padding: '1rem' }}>
              Generate Global Compliance Report
            </button>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
