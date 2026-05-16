// src/pages/EmployeesPage.jsx
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
        toast.error('Failed to load employees.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <AppLayout title="Workforce Management" subtitle="Manage your global team and contractor network">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Employees ({employees.length})</h3>
          <button className="btn btn-primary btn-sm">+ Add Employee</button>
        </div>
        
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>Loading workforce data...</td></tr>
              ) : employees.length === 0 ? (
                <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px 0' }}>No employees found.</td></tr>
              ) : (
                employees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{emp.email}</div>
                    </td>
                    <td>{emp.role}</td>
                    <td>{emp.department?.name || '—'}</td>
                    <td><span className="badge">{emp.employmentType}</span></td>
                    <td>
                      <span className={`badge ${emp.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button className="icon-btn" style={{ fontSize: 12 }}>Edit</button>
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
