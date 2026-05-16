// src/pages/EmployeesPage.jsx — Luxury Workforce Directory
import React, { useEffect, useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { employeesApi } from '../api/client';
import { toast } from 'sonner';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await employeesApi.list();
        setEmployees(data.data || []);
      } catch (err) {
        toast.error('Failed to load global directory.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <AppLayout 
      title="Global Workforce" 
      subtitle="The definitive directory of your organization's talent and contractors."
    >
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-platinum)' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>Directory</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Total {employees.length} Active Records</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn" style={{ background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)' }}>
              Export CSV
            </button>
            <button className="btn btn-gold">+ Add Professional</button>
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th style={{ paddingLeft: '2rem' }}>Professional Profile</th>
                <th>Role & Title</th>
                <th>Department</th>
                <th>Type</th>
                <th>Status</th>
                <th style={{ paddingRight: '2rem', textAlign: 'right' }}>Management</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '100px 0' }}>
                    <div className="animate-pulse" style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>Accessing Secure Directory...</div>
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-slate)' }}>
                    No workforce records found in the current directory.
                  </td>
                </tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td style={{ paddingLeft: '2rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ 
                          width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-soft-ivory)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-platinum)',
                          color: 'var(--accent-gold)', fontWeight: '700'
                        }}>{emp.firstName?.[0]}{emp.lastName?.[0]}</div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-royal-navy)' }}>{emp.firstName} {emp.lastName}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-slate)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{emp.title || 'Senior Associate'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{emp.role}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-royal-navy)' }}>{emp.department?.name || '—'}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg-soft-ivory)', color: 'var(--text-slate)', border: '1px solid var(--border-platinum)' }}>
                        {emp.employmentType}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td style={{ paddingRight: '2rem', textAlign: 'right' }}>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', background: 'transparent', border: '1px solid var(--border-platinum)' }}>
                        View Profile
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

