// src/pages/DepartmentsPage.jsx — Luxury Department Architecture
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Users, Briefcase, PieChart, 
  TrendingUp, Wallet, ArrowRight, Plus,
  Layers, ChevronRight, MoreHorizontal
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { departmentApi } from '../api/client';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await departmentApi.list();
        setDepartments(res.data.data);
      } catch (err) {
        console.error("Department Data Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout 
      title="Organizational Architecture" 
      subtitle="Strategic management of institutional departments and budgetary allocations"
    >
      <div className="enterprise-container">
        
        {/* ─── Global Stats ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Strategic Units', val: departments.length, icon: <Building2 />, color: 'var(--accent-gold)' },
            { label: 'Total Headcount', val: '1,420', icon: <Users />, color: '#3b82f6' },
            { label: 'Annual Capital Allocation', val: '₹42.8M', icon: <Wallet />, color: '#10b981' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card glass"
              style={{ padding: '2rem', display: 'flex', gap: '20px', alignItems: 'center' }}
            >
              <div style={{ padding: '16px', borderRadius: '16px', background: `${s.color}15`, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{s.val}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ─── Department Grid ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
          {departments.map((dept, i) => (
            <motion.div 
              key={dept.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card glass-hover"
              style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg-soft-ivory)', color: 'var(--accent-gold)' }}>
                    <Layers size={24} />
                  </div>
                  <button className="btn" style={{ padding: '4px', color: 'var(--text-slate)' }}><MoreHorizontal size={20} /></button>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>{dept.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', marginBottom: '1.5rem', height: '40px', overflow: 'hidden' }}>
                  {dept.description || 'Core organizational unit focusing on strategic delivery and excellence.'}
                </p>

                <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Headcount</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800' }}>{dept.headcount} Professionals</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Efficiency</div>
                    <div style={{ fontSize: '1rem', fontWeight: '800', color: '#10b981' }}>94%</div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
                    <span>BUDGET UTILIZATION</span>
                    <span style={{ color: 'var(--accent-gold)' }}>₹{dept.budgetUsed || '0'}M / ₹{dept.budgetAllocated || '0'}M</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--bg-soft-ivory)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${(dept.budgetUsed / dept.budgetAllocated) * 100 || 0}%`, 
                      height: '100%', background: 'var(--accent-gold)' 
                    }} />
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '1rem 2rem', background: 'var(--bg-soft-ivory)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'white', border: '1px solid var(--border-platinum)' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Manager ID: {dept.managerId || 'Unassigned'}</span>
                </div>
                <button className="btn" style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Unit <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}

          {/* ─── Create New Card ─── */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="card"
            style={{ 
              border: '2px dashed var(--border-platinum)', background: 'transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', minHeight: '300px'
            }}
          >
            <div style={{ padding: '16px', borderRadius: '50%', background: 'var(--bg-soft-ivory)', color: 'var(--text-slate)', marginBottom: '1rem' }}>
              <Plus size={32} />
            </div>
            <div style={{ fontWeight: '800', color: 'var(--text-royal-navy)' }}>Initialize New Department</div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)', marginTop: '8px' }}>Expand organizational hierarchy</p>
          </motion.div>
        </div>

        {/* ─── Optimization Notice ─── */}
        <div className="card glass" style={{ 
          marginTop: '4rem', padding: '2.5rem', textAlign: 'center', 
          border: '1px solid var(--border-platinum)', background: 'rgba(255, 255, 255, 0.4)'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Departments Architecture Under Optimization</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            We are migrating to a dynamic role-based hierarchy system. Real-time synchronization is in progress.
          </p>
          <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: 'var(--border-platinum)', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ width: '82%', height: '100%', background: 'var(--accent-gold)' }} />
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent-gold)' }}>
            PHASE 2.4 DEPLOYMENT • 82% INTEGRATED
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
