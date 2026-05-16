// src/components/modals/AddDepartmentModal.jsx — Ultra-Luxury Unit Initialization
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Code, Wallet, Info, Sparkles, ArrowRight } from 'lucide-react';
import { departmentApi } from '../../api/client';
import { toast } from 'sonner';

export default function AddDepartmentModal({ isOpen, onClose, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    budgetAllocated: 5000000, 
    organizationId: 'f00d1e55-0000-0000-0000-000000000000', 
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await departmentApi.create({
        ...formData,
        budgetAllocated: Number(formData.budgetAllocated),
      });
      toast.success('Strategic unit initialized in the global hierarchy.');
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Initialization failed.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" style={{ 
        position: 'fixed', inset: 0, zIndex: 1000, 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)'
      }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="modal-content card"
          style={{ 
            width: '100%', maxWidth: '550px', padding: '3.5rem', 
            background: 'var(--bg-soft-ivory)', border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            position: 'relative', overflow: 'hidden'
          }}
        >
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.5rem' }}>
                  <Sparkles size={20} color="var(--accent-gold)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Institutional Expansion</span>
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-royal-navy)', letterSpacing: '-0.02em' }}>Initialize Unit</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-slate)', marginTop: '0.5rem' }}>Expand your organizational architecture with a new strategic node.</p>
              </div>
              <button onClick={onClose} style={{ color: 'var(--text-slate)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Department Name</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="text" required className="input" placeholder="Strategic Intelligence"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '52px', fontSize: '1rem' }}
                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Institutional Code</label>
                <div style={{ position: 'relative' }}>
                  <Code size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="text" required className="input" placeholder="SI-HQ"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '52px', fontSize: '1rem', textTransform: 'uppercase' }}
                    value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Capital Allocation (Annual)</label>
                <div style={{ position: 'relative' }}>
                  <Wallet size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="number" required className="input" placeholder="5,000,000"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '52px', fontSize: '1rem' }}
                    value={formData.budgetAllocated} onChange={e => setFormData({ ...formData, budgetAllocated: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ 
                padding: '1.25rem', background: 'rgba(214, 179, 106, 0.05)', 
                borderRadius: '16px', border: '1px solid rgba(214, 179, 106, 0.2)',
                display: 'flex', gap: '12px' 
              }}>
                <Info size={20} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-royal-navy)', lineHeight: '1.5', fontWeight: '500' }}>
                  A new ledger entry will be created for this unit. All downstream salary payouts will be benchmarked against this allocation.
                </p>
              </div>

              <button 
                type="submit" disabled={loading} className="btn-gold" 
                style={{ 
                  width: '100%', height: '60px', borderRadius: '18px', 
                  fontSize: '1.1rem', fontWeight: '800', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', gap: '12px',
                  boxShadow: '0 10px 25px -5px rgba(214, 179, 106, 0.4)',
                  cursor: 'pointer', transition: 'all 0.2s ease', marginTop: '1rem'
                }}
              >
                {loading ? 'Initializing Architecture...' : (
                  <>
                    Expand Hierarchy <ArrowRight size={22} />
                  </>
                )}
              </button>
            </form>
          </div>
          
          <div style={{ 
            position: 'absolute', top: '-100px', right: '-100px', 
            width: '250px', height: '250px', borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
            opacity: 0.05, pointerEvents: 'none'
          }} />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
