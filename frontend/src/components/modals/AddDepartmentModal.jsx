// src/components/modals/AddDepartmentModal.jsx — Luxury Institutional Modal
import React, { useState } from 'react';
import { X, Building2, Code, Wallet, Info } from 'lucide-react';
import { departmentApi } from '../../api/client';
import { toast } from 'sonner';

export default function AddDepartmentModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budgetAllocated: 5000000, // 5M Default
    organizationId: 'f00d1e55-0000-0000-0000-000000000000', // Mock org ID if not in context
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await departmentApi.create({
        ...formData,
        budgetAllocated: Number(formData.budgetAllocated),
      });
      toast.success('Organizational unit initialized successfully.');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize department.');
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
        width: '100%', maxWidth: '500px', padding: '2.5rem', 
        boxShadow: 'var(--shadow-premium)', border: '1px solid var(--border-platinum)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>Initialize Unit</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-slate)' }}>Define a new strategic department within the hierarchy.</p>
          </div>
          <button onClick={onClose} className="btn" style={{ padding: '8px' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label className="label">Department Name</label>
            <div className="input-group">
              <Building2 size={16} className="input-icon" />
              <input 
                type="text" required className="input" placeholder="e.g. Strategic Intelligence"
                value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Institutional Code</label>
            <div className="input-group">
              <Code size={16} className="input-icon" />
              <input 
                type="text" required className="input" placeholder="e.g. SI-HQ"
                value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              />
            </div>
          </div>

          <div>
            <label className="label">Annual Budget Allocation</label>
            <div className="input-group">
              <Wallet size={16} className="input-icon" />
              <input 
                type="number" required className="input" placeholder="5000000"
                value={formData.budgetAllocated} onChange={e => setFormData({ ...formData, budgetAllocated: e.target.value })}
              />
              <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: '700', fontSize: '0.75rem', color: 'var(--text-slate)' }}>USD</span>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'var(--bg-soft-ivory)', borderRadius: '12px', display: 'flex', gap: '12px' }}>
            <Info size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-slate)', lineHeight: '1.5' }}>
              Initializing a new department will automatically create a dedicated ledger node for budgetary tracking.
            </p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button 
              type="submit" disabled={loading} className="btn btn-gold" 
              style={{ width: '100%', height: '50px', fontSize: '1rem', fontWeight: '800' }}
            >
              {loading ? 'Initializing Architecture...' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
