// src/pages/PayrollPage.jsx
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
        toast.error('Failed to load payroll runs.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <AppLayout title="Payroll Processing" subtitle="Automated salary distribution and compliance">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Payroll Cycles</h3>
          <button className="btn btn-primary btn-sm">⚡ Run New Payroll</button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Status</th>
                <th>Employees</th>
                <th>Total Cost</th>
                <th>Tax</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>Analyzing payroll cycles...</td></tr>
              ) : runs.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>No payroll runs found.</td></tr>
              ) : (
                runs.map(run => (
                  <tr key={run.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{run.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${run.status === 'RELEASED' ? 'success' : 'info'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td>{run.employeeCount}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text)' }}>
                      ${Number(run.totalNet).toLocaleString()}
                    </td>
                    <td>${Number(run.totalTax).toLocaleString()}</td>
                    <td>
                      <button className="btn btn-sm" style={{ background: 'var(--surface2)', fontSize: 11 }}>View Details</button>
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
