// src/pages/TreasuryPage.jsx — Luxury Institutional Treasury
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, Landmark, Receipt, TrendingDown, 
  TrendingUp, Scale, ShieldCheck, ArrowRight,
  Plus, Search, Download, Filter, FileText, CheckCircle2
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { expenseApi } from '../api/client';

export default function TreasuryPage() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await expenseApi.list();
        setExpenses(res.data.data);
      } catch (err) {
        console.error("Treasury Data Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <AppLayout 
      title="Treasury & Capital Management" 
      subtitle="Institutional oversight of salary liquidity and operational expenditure"
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Capital Summary ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ 
            background: 'var(--text-royal-navy)', color: 'white', padding: '2rem', border: 'none',
            position: 'relative', overflow: 'hidden' 
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '1rem' }}>Available Liquidity</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>₹142.8M</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.85rem', fontWeight: '700' }}>
                <TrendingUp size={16} /> +₹12.4M vs Last Month
              </div>
            </div>
            <div style={{ position: 'absolute', right: '-10%', bottom: '-10%', opacity: 0.1 }}><Landmark size={150} /></div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(214, 179, 106, 0.1)', color: 'var(--accent-gold)' }}>
                <Receipt size={24} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Pending Disbursements</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹8.2M</div>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)', fontWeight: '600' }}>Approvals required for 14 expense reports</div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-soft-ivory)', borderRadius: '2px', marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{ width: '65%', height: '100%', background: 'var(--accent-gold)' }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card glass" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                <Scale size={24} />
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Treasury Compliance</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#10b981' }}>Healthy</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', fontWeight: '700', color: '#10b981' }}>
              <ShieldCheck size={16} /> All tax nodes synchronized
            </div>
            <button className="btn" style={{ marginTop: '1rem', width: '100%', fontSize: '0.75rem', fontWeight: '700', border: '1px solid var(--border-platinum)' }}>
              Run Compliance Audit
            </button>
          </motion.div>
        </div>

        {/* ─── Institutional Expense Ledger ─── */}
        <div className="card" style={{ padding: '0' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Capital Disbursement Ledger</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)' }}>Detailed log of operational expenditures and reimbursements</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-slate)' }} />
                <input 
                  type="text" 
                  placeholder="Reference number..." 
                  style={{ 
                    padding: '10px 16px 10px 36px', borderRadius: '10px', border: '1px solid var(--border-platinum)',
                    fontSize: '0.85rem', width: '250px' 
                  }} 
                />
              </div>
              <button className="btn btn-gold" style={{ padding: '10px 20px' }}>
                <Plus size={16} /> New Requisition
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>REQUISITION</th>
                  <th>EMPLOYEE</th>
                  <th>CATEGORY</th>
                  <th>DATE</th>
                  <th>AMOUNT</th>
                  <th>STATUS</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((exp) => (
                  <tr key={exp.id}>
                    <td style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--text-royal-navy)' }}>
                      #{exp.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                          {exp.employee.firstName[0]}{exp.employee.lastName[0]}
                        </div>
                        <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{exp.employee.firstName} {exp.employee.lastName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="badge" style={{ background: 'var(--bg-soft-ivory)', color: 'var(--text-royal-navy)', border: '1px solid var(--border-platinum)', fontSize: '0.7rem' }}>
                        {exp.category}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>{new Date(exp.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: '800', color: 'var(--text-royal-navy)' }}>₹{Number(exp.amount).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${exp.status.toLowerCase() === 'approved' ? 'success' : exp.status.toLowerCase() === 'submitted' ? 'info' : 'warning'}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn" style={{ padding: '6px', color: 'var(--accent-gold)' }}><ArrowRight size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Showing 1 - {expenses.length} of {expenses.length} disbursements</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-platinum)' }}>Previous</button>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem', border: '1px solid var(--border-platinum)' }}>Next</button>
            </div>
          </div>
        </div>

        {/* ─── Institutional Compliance Status ─── */}
        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          <div className="card glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText size={18} color="var(--accent-gold)" /> Institutional Audit Reports
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { name: 'Q3 Treasury Summary.pdf', date: 'Oct 14, 2024', size: '2.4 MB' },
                { name: 'Global Tax Compliance Log.xlsx', date: 'Oct 12, 2024', size: '1.8 MB' },
                { name: 'Salary Disbursement Audit.pdf', date: 'Oct 08, 2024', size: '4.2 MB' }
              ].map((doc, i) => (
                <div key={i} className="glass-hover" style={{ padding: '12px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', border: '1px solid var(--border-platinum)' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: 'white' }}><FileText size={16} /></div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{doc.name}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{doc.date} • {doc.size}</div>
                    </div>
                  </div>
                  <button className="btn" style={{ color: 'var(--accent-gold)' }}><Download size={18} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="card glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', 
              color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' 
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.5rem' }}>Treasury Synchronized</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)', maxWidth: '280px', lineHeight: '1.6' }}>
              Your institutional salary fund is fully collateralized and synchronized with global banking nodes.
            </p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '8px' }}>
              <div className="badge badge-success">ACTIVE MONITORING</div>
              <div className="badge badge-info">SOC2 COMPLIANT</div>
            </div>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
