// src/components/modals/AddEmployeeModal.jsx — Premium Luxury Modal
import React, { useState, useEffect } from 'react';
import { X, User, Mail, Briefcase, Building, Wallet, Calendar, ShieldCheck } from 'lucide-react';
import { departmentApi, employeesApi } from '../../api/client';
import { toast } from 'sonner';

export default function AddEmployeeModal({ isOpen, onClose, onRefresh }) {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    departmentId: '',
    organizationId: '', // Will be handled by backend usually, but schema requires it
    employmentType: 'FULL_TIME',
    hireDate: new Date().toISOString().split('T')[0],
    baseSalary: 65000,
  });

  useEffect(() => {
    if (isOpen) {
      fetchDepts();
    }
  }, [isOpen]);

  async function fetchDepts() {
    try {
      const { data } = await departmentApi.list();
      setDepartments(data.data || []);
      if (data.data?.length > 0) {
        setFormData(prev => ({ ...prev, departmentId: data.data[0].id, organizationId: data.data[0].organizationId }));
      }
    } catch (err) {
      toast.error('Failed to access organizational nodes.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await employeesApi.create({
        ...formData,
        baseSalary: Number(formData.baseSalary),
      });
      toast.success('Professional record integrated successfully.');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register professional.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay glass" style={{ 
      position: 'fixed', inset: 0, zIndex: 100, display: 'flex', 
      alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(12px)'
    }}>
      <div className="modal-content card" style={{ 
        width: '100%', maxWidth: '600px', padding: '2.5rem', 
        boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-platinum)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>Onboard Professional</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Register a new record into the secure organizational directory.</p>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">First Name</label>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input 
                type="text" required className="input" placeholder="e.g. Alexander"
                value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
          </div>
          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">Last Name</label>
            <div className="input-group">
              <User size={16} className="input-icon" />
              <input 
                type="text" required className="input" placeholder="e.g. Sterling"
                value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="label">Corporate Email</label>
            <div className="input-group">
              <Mail size={16} className="input-icon" />
              <input 
                type="email" required className="input" placeholder="a.sterling@payro.enterprise"
                value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">Professional Title</label>
            <div className="input-group">
              <Briefcase size={16} className="input-icon" />
              <input 
                type="text" required className="input" placeholder="e.g. Strategic Analyst"
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">Institutional Department</label>
            <div className="input-group">
              <Building size={16} className="input-icon" />
              <select 
                className="input" required value={formData.departmentId} 
                onChange={e => {
                  const dept = departments.find(d => d.id === e.target.value);
                  setFormData({ ...formData, departmentId: e.target.value, organizationId: dept?.organizationId });
                }}
              >
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">Employment Classification</label>
            <select 
              className="input" value={formData.employmentType} 
              onChange={e => setFormData({ ...formData, employmentType: e.target.value })}
            >
              <option value="FULL_TIME">Institutional (Full-time)</option>
              <option value="CONTRACTOR">Strategic Contractor</option>
              <option value="PART_TIME">Associate (Part-time)</option>
            </select>
          </div>

          <div style={{ gridColumn: 'span 1' }}>
            <label className="label">Integration Date</label>
            <div className="input-group">
              <Calendar size={16} className="input-icon" />
              <input 
                type="date" required className="input"
                value={formData.hireDate} onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <label className="label">Base Compensation (Annual)</label>
            <div className="input-group">
              <Wallet size={16} className="input-icon" />
              <input 
                type="number" required className="input" placeholder="65000"
                value={formData.baseSalary} onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-slate)' }}>USD</span>
            </div>
          </div>

          <div style={{ gridColumn: 'span 2', marginTop: '1rem' }}>
            <button 
              type="submit" disabled={loading} className="btn btn-gold" 
              style={{ width: '100%', height: '50px', fontSize: '1rem', fontWeight: '800' }}
            >
              {loading ? 'Authenticating Record...' : 'Finalize Onboarding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
