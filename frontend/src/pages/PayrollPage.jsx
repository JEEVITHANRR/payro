// src/pages/PayrollPage.jsx — Luxury Treasury Center
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { payrollApi } from '../api/client';
import { toast } from 'sonner';

export default function PayrollPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await payrollApi.list();
        setRuns(data.data || []);
      } catch (err) {
        toast.error('Failed to access treasury records.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const fmtCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n || 0);

  return (
    <AppLayout 
      title="Treasury & Disbursement" 
      subtitle="Institutional-grade salary distribution and regulatory compliance monitoring."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card glass" style={{ borderLeft: '4px solid var(--accent-gold)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Next Disbursement</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)', margin: '0.5rem 0' }}>Sept 14, 2024</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--emerald-elegant)', fontWeight: '600' }}>● All systems ready</div>
        </div>
        <div className="card glass" style={{ borderLeft: '4px solid var(--text-royal-navy)' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Quarterly Exposure</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)', margin: '0.5rem 0' }}>$4.28M</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-slate)' }}>Within projected budget</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-platinum)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Payroll Ledger</h3>
          <button className="btn btn-gold">
            <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Execute New Run
          </button>
        </div>
        
        <div className="table-container" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2rem' }}>Financial Period</th>
                <th>Distribution Status</th>
                <th>Staff Count</th>
                <th>Net Exposure</th>
                <th>Regulatory Tax</th>
                <th style={{ paddingRight: '2rem', textAlign: 'right' }}>Audit</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--accent-gold)' }}>Synchronizing Financial Data...</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-slate)' }}>No historical distribution records found.</td></tr>
              ) : (
                runs.map(run => (
                  <tr key={run.id}>
                    <td style={{ paddingLeft: '2rem' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-royal-navy)' }}>{run.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)' }}>
                        {new Date(run.periodStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(run.periodEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${run.status === 'RELEASED' ? 'badge-success' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>
                        {run.status?.toLowerCase()}
                      </span>
                    </td>
                    <td><span style={{ fontWeight: '600' }}>{run.employeeCount}</span> Professional{run.employeeCount !== 1 ? 's' : ''}</td>
                    <td>
                      <div style={{ fontWeight: '800', color: 'var(--text-royal-navy)' }}>{fmtCurrency(run.totalNet)}</div>
                    </td>
                    <td style={{ color: 'var(--text-slate)', fontSize: '0.85rem' }}>{fmtCurrency(run.totalTax)}</td>
                    <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)' }}>
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

