// src/pages/SecurityPage.jsx — Luxury Institutional Security
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Lock, Monitor, Smartphone, 
  MapPin, Clock, AlertCircle, ShieldAlert,
  ChevronRight, RefreshCw, Key, LogOut,
  Fingerprint, Eye, EyeOff, Shield
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';

export default function SecurityPage() {
  const { user } = useAuthStore();
  const [mfaEnabled, setMfaEnabled] = useState(true);

  const sessions = [
    { id: 1, device: 'MacBook Pro 16"', location: 'Mumbai, India', ip: '142.10.42.11', status: 'Current Session', icon: <Monitor /> },
    { id: 2, device: 'iPhone 15 Pro', location: 'London, UK', ip: '82.14.22.104', status: 'Active 2h ago', icon: <Smartphone /> },
    { id: 3, device: 'iPad Air', location: 'San Francisco, USA', ip: '192.168.1.42', status: 'Active 1d ago', icon: <Smartphone /> },
  ];

  return (
    <AppLayout 
      title="Institutional Security" 
      subtitle="Comprehensive access control and session integrity monitoring"
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Security Health Shield ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card" 
            style={{ 
              background: 'var(--text-royal-navy)', color: 'white', padding: '3rem', border: 'none',
              position: 'relative', overflow: 'hidden'
            }}
          >
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                background: 'rgba(16, 185, 129, 0.2)', padding: '6px 12px', 
                borderRadius: '100px', color: '#10b981', fontSize: '0.7rem',
                fontWeight: '800', letterSpacing: '0.05em', marginBottom: '1.5rem'
              }}>
                <ShieldCheck size={14} /> ACCOUNT INTEGRITY: SECURE
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '1rem' }}>Global Security Shield</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Your account is protected by military-grade encryption and real-time AI threat monitoring.
              </p>
              <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem' }}>
                <button className="btn btn-gold" style={{ padding: '12px 24px' }}>Reset Security Keys</button>
                <button className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>Privacy Policy</button>
              </div>
            </div>
            <div style={{ position: 'absolute', right: '-5%', bottom: '-10%', opacity: 0.15 }}><Shield size={250} color="var(--accent-gold)" /></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card glass" 
            style={{ padding: '2.5rem' }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Fingerprint size={20} color="var(--accent-gold)" /> Advanced Authentication
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>Multi-Factor Authentication</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)', marginTop: '4px' }}>Biometric and SMS verification</div>
                </div>
                <div 
                  onClick={() => setMfaEnabled(!mfaEnabled)}
                  style={{ 
                    width: '44px', height: '24px', borderRadius: '12px', background: mfaEnabled ? '#10b981' : 'var(--border-platinum)',
                    position: 'relative', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  <div style={{ 
                    width: '18px', height: '18px', borderRadius: '50%', background: 'white',
                    position: 'absolute', top: '3px', left: mfaEnabled ? '23px' : '3px', transition: '0.3s'
                  }} />
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border-platinum)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>JWT Session Refresh</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)', marginTop: '4px' }}>Automated token rotation active</div>
                </div>
                <div style={{ color: '#10b981' }}><RefreshCw size={20} /></div>
              </div>
              <div style={{ height: '1px', background: 'var(--border-platinum)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>Last Password Change</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)', marginTop: '4px' }}>Sept 24, 2024 (22 days ago)</div>
                </div>
                <button className="btn" style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-gold)' }}>Update</button>
              </div>
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* ─── Active Session Management ─── */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800' }}>Device & Session Monitoring</h3>
              <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Terminate All Others</button>
            </div>
            <div style={{ padding: '1rem 2rem' }}>
              {sessions.map((session, i) => (
                <div key={session.id} style={{ 
                  padding: '1.5rem 0', borderBottom: i === sessions.length - 1 ? 'none' : '1px solid var(--border-platinum)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-soft-ivory)', color: 'var(--text-royal-navy)' }}>
                      {session.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '800' }}>{session.device}</div>
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.75rem', color: 'var(--text-slate)', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {session.location}</span>
                        <span>•</span>
                        <span>{session.ip}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: '800', color: session.status.includes('Current') ? '#10b981' : 'var(--text-slate)' }}>
                      {session.status}
                    </div>
                    {session.id !== 1 && (
                      <button className="btn" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ef4444', marginTop: '4px', padding: '0' }}>Revoke Access</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ─── Security Log ─── */}
          <div className="card glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color="var(--accent-gold)" /> Institutional Access Log
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { event: 'Authorized Login', date: 'Oct 16, 14:20', status: 'SUCCESS' },
                { event: 'MFA Verification', date: 'Oct 16, 14:21', status: 'SUCCESS' },
                { event: 'Password Reset Init', date: 'Sept 24, 18:30', status: 'COMPLETED' },
                { event: 'New Device Detection', date: 'Sept 12, 09:12', status: 'WARNED' }
              ].map((log, i) => (
                <div key={i} className="glass-hover" style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-platinum)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{log.event}</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: '800', color: log.status === 'SUCCESS' ? '#10b981' : log.status === 'WARNED' ? '#f59e0b' : 'var(--accent-gold)' }}>{log.status}</div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{log.date}</div>
                </div>
              ))}
            </div>
            <button className="btn" style={{ width: '100%', marginTop: '2rem', fontSize: '0.8rem', fontWeight: '700', border: '1px solid var(--border-platinum)' }}>
              View Detailed Security Audit
            </button>
          </div>
        </div>

        {/* ─── Privacy Guard ─── */}
        <div className="card" style={{ marginTop: '3rem', padding: '2.5rem', border: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(214, 179, 106, 0.1)', color: 'var(--accent-gold)' }}>
              <ShieldAlert size={32} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Advanced Data Privacy Guard</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', marginTop: '4px' }}>
                Your data is protected under the Global Data Protection Regulation (GDPR) and institutional SOC2 protocols.
              </p>
            </div>
          </div>
          <div className="badge badge-gold" style={{ padding: '12px 24px', fontSize: '0.8rem' }}>SOC2 TYPE II CERTIFIED</div>
        </div>

      </div>
    </AppLayout>
  );
}
