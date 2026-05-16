// src/pages/LandingPage.jsx — Luxury Marketing Entrance
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', background: 'var(--text-royal-navy)', color: 'var(--surface-white)',
      fontFamily: 'var(--font-ui)', overflowX: 'hidden', position: 'relative'
    }}>
      {/* ─── Luxury Ambient Glows ─── */}
      <div style={{ 
        position: 'absolute', top: '-10%', left: '-10%', width: '800px', height: '800px',
        background: 'radial-gradient(circle, rgba(214, 179, 106, 0.05) 0%, transparent 70%)', filter: 'blur(100px)'
      }} />
      <div style={{ 
        position: 'absolute', bottom: '-10%', right: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(15, 118, 110, 0.05) 0%, transparent 70%)', filter: 'blur(100px)'
      }} />

      {/* ─── Premium Navigation ─── */}
      <nav style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '2rem 10%', position: 'relative', zIndex: 100 
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-gold)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>P</div>
          Payro<span style={{ color: 'var(--accent-gold)' }}>.</span>
        </div>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          {['Features', 'Treasury', 'Compliance', 'Security'].map(item => (
            <a key={item} href="#" style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255,255,255,0.7)', textDecoration: 'none', letterSpacing: '0.05em' }}>{item.toUpperCase()}</a>
          ))}
          <button 
            onClick={() => navigate('/login')}
            className="btn btn-gold" 
            style={{ padding: '10px 24px', fontSize: '0.85rem' }}
          >
            Access Portal
          </button>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <main style={{ position: 'relative', zIndex: 10, padding: '8rem 10% 4rem', textAlign: 'center' }}>
        <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '10px', 
            background: 'rgba(214, 179, 106, 0.1)', border: '1px solid rgba(214, 179, 106, 0.2)',
            padding: '8px 20px', borderRadius: '100px', color: 'var(--accent-gold)',
            fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', marginBottom: '2rem'
          }}>
            ISO 27001 CERTIFIED • v2.4 ENGINE
          </div>
          
          <h1 style={{ fontSize: '5rem', fontWeight: '900', lineHeight: '1', letterSpacing: '-0.04em', marginBottom: '2rem' }}>
            The New Standard in <br />
            <span style={{ color: 'var(--accent-gold)' }}>Enterprise Payroll.</span>
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
            Institutional-grade salary distribution, automated compliance monitoring, and intelligent treasury dynamics—all within a single, high-performance interface.
          </p>

          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
            <button className="btn btn-gold" style={{ padding: '1.25rem 3rem', fontSize: '1rem' }} onClick={() => navigate('/login')}>
              Request Executive Access
            </button>
            <button className="btn" style={{ 
              padding: '1.25rem 3rem', fontSize: '1rem', background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', color: 'white' 
            }}>
              Technical Documentation
            </button>
          </div>
        </div>

        {/* ─── Visual Preview ─── */}
        <div className="animate-fade-in" style={{ 
          marginTop: '6rem', position: 'relative',
          padding: '2px', background: 'linear-gradient(to bottom, rgba(214,179,106,0.3), transparent)',
          borderRadius: '32px 32px 0 0', maxWidth: '1200px', margin: '6rem auto 0'
        }}>
          <div style={{ 
            background: 'var(--bg-soft-ivory)', borderRadius: '30px 30px 0 0', height: '400px',
            overflow: 'hidden', boxShadow: '0 -20px 50px rgba(0,0,0,0.5)'
          }}>
            <div style={{ 
              padding: '20px 40px', background: 'white', borderBottom: '1px solid var(--border-platinum)',
              display: 'flex', gap: '20px'
            }}>
              {[1,2,3].map(i => <div key={i} style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--border-platinum)' }} />)}
            </div>
            <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[1,2,3].map(i => (
                <div key={i} className="card" style={{ height: '120px', background: 'white', opacity: 0.5 }} />
              ))}
              <div className="card" style={{ gridColumn: 'span 3', height: '200px', background: 'white', opacity: 0.5 }} />
            </div>
          </div>
        </div>
      </main>

      {/* ─── Feature Pillars ─── */}
      <section style={{ padding: '10rem 10%', background: 'var(--surface-white)', color: 'var(--text-royal-navy)' }}>
        <div style={{ textAlign: 'center', marginBottom: '6rem' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: '900', letterSpacing: '-0.03em' }}>Built for the <span style={{ color: 'var(--accent-gold)' }}>Modern Treasury.</span></h2>
          <p style={{ color: 'var(--text-slate)', fontSize: '1.1rem', marginTop: '1rem' }}>Sophisticated tools for complex global organizations.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem' }}>
          {[
            { t: 'Treasury Dynamics', d: 'Automated salary routing across 140+ jurisdictions with real-time exchange monitoring.', icon: '💸' },
            { t: 'Compliance Shield', d: 'AI-driven audit logs and regulatory reporting built to global ISO and SOC2 standards.', icon: '🛡️' },
            { t: 'Predictive Insights', d: 'Forecast workforce expenditure and treasury exposure with precision-engineered AI models.', icon: '📊' }
          ].map((f, i) => (
            <div key={i} className="card glass" style={{ padding: '3rem', border: '1px solid var(--border-platinum)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>{f.t}</h3>
              <p style={{ color: 'var(--text-slate)', lineHeight: '1.6', fontSize: '0.95rem' }}>{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Institutional Footer ─── */}
      <footer style={{ padding: '6rem 10%', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '2rem' }}>Payro<span style={{ color: 'var(--accent-gold)' }}>.</span></div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.8' }}>
          Payro is a registered trademark of Quantum Systems. Services are governed by the Global Enterprise Service Agreement. 
          Financial distribution is subject to local jurisdictional review.
        </p>
        <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          &copy; 2024 PAYRO ENTERPRISE • PRIVACY • SECURITY • COMPLIANCE
        </div>
      </footer>
    </div>
  );
}
