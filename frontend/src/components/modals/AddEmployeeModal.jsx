import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, User, Mail, Briefcase, Building, 
  Wallet, Calendar, Sparkles, ArrowRight,
  ShieldCheck, Globe, CreditCard, Phone, Target
} from 'lucide-react';
import { departmentApi, employeesApi } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

export default function AddEmployeeModal({ isOpen, onClose, onRefresh }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useManualDept, setUseManualDept] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    departmentId: '',
    manualDepartment: '',
    organizationId: user?.organizationId || 'f00d1e55-0000-0000-0000-000000000000', 
    employmentType: 'FULL_TIME',
    hireDate: new Date().toISOString().split('T')[0],
    baseSalary: 85000,
    targetSalary: 100000,
  });

  useEffect(() => {
    if (user?.organizationId) {
      setFormData(prev => ({ ...prev, organizationId: user.organizationId }));
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      fetchDepts();
    }
  }, [isOpen]);

  async function fetchDepts() {
    try {
      const { data } = await departmentApi.list();
      const depts = data.data || [];
      setDepartments(depts);
      if (depts.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          departmentId: depts[0].id, 
          organizationId: depts[0].organizationId 
        }));
        setUseManualDept(false);
      } else {
        setUseManualDept(true);
      }
    } catch (err) {
      // Graceful fallback for organizational nodes
      setUseManualDept(true);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // If manual dept, we might need to create it first or handle it in backend.
      // For now, let's assume we need a valid departmentId.
      // If none, we'll try to find or create a 'General' dept.
      let finalDeptId = formData.departmentId;
      
      if (useManualDept) {
        // Implementation detail: usually would call departmentApi.create here
        toast.info("Initializing manual organizational node...");
        const deptRes = await departmentApi.create({
          name: formData.manualDepartment || 'General Operations',
          code: (formData.manualDepartment || 'GEN').slice(0, 3).toUpperCase(),
          organizationId: formData.organizationId
        });
        finalDeptId = deptRes.data.data.id;
      }

      const res = await employeesApi.create({
        ...formData,
        departmentId: finalDeptId,
        baseSalary: Number(formData.baseSalary),
        targetSalary: Number(formData.targetSalary),
      });
      
      const newEmp = res.data.data;
      toast.success('Professional record integrated into global directory.');
      onRefresh();
      onClose();
      navigate(`/employees/${newEmp.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Strategic integration failed.');
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
            width: '100%', maxWidth: '800px', padding: '0', 
            background: 'var(--bg-soft-ivory)', border: '1px solid rgba(255,255,255,0.8)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'grid', gridTemplateColumns: '300px 1fr', overflow: 'hidden'
          }}
        >
          {/* ─── Left Panel: Context ─── */}
          <div style={{ 
            background: 'var(--text-royal-navy)', color: 'white', padding: '3rem 2.5rem',
            display: 'flex', flexDirection: 'column', position: 'relative'
          }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '16px', 
                background: 'rgba(255,255,255,0.1)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', marginBottom: '2rem'
              }}>
                <Sparkles color="var(--accent-gold)" size={24} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '1rem' }}>
                Onboard <br/>Professional
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                Integrating strategic talent into your institutional hierarchy with military-grade precision.
              </p>

              <div style={{ marginTop: '4rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {[
                  { icon: <ShieldCheck size={18} />, text: 'SOC2 Compliant Ledger' },
                  { icon: <Globe size={18} />, text: 'Global Payroll Ready' },
                  { icon: <CreditCard size={18} />, text: 'Tax Sync Enabled' }
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                    <span style={{ color: 'var(--accent-gold)' }}>{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ 
              position: 'absolute', bottom: '-50px', left: '-50px', 
              width: '200px', height: '200px', borderRadius: '50%',
              background: 'radial-gradient(circle, var(--accent-gold) 0%, transparent 70%)',
              opacity: 0.1, pointerEvents: 'none'
            }} />
          </div>

          {/* ─── Right Panel: Form ─── */}
          <div style={{ padding: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
              <button onClick={onClose} style={{ color: 'var(--text-slate)', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>First Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="text" required className="input" placeholder="Alexander"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Last Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="text" required className="input" placeholder="Sterling"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Institutional Email</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1rem' }}>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="email" required className="input" placeholder="a.sterling@payro.enterprise"
                      style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                      value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                    <input 
                      type="text" className="input" placeholder="+91 98765 43210"
                      style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                      value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Strategic Role</label>
                <div style={{ position: 'relative' }}>
                  <Briefcase size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="text" required className="input" placeholder="Director of Engineering"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Department</label>
                  <button 
                    type="button" 
                    onClick={() => setUseManualDept(!useManualDept)}
                    style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    {useManualDept ? 'Select Node' : 'Manual Entry'}
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Building size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  {useManualDept ? (
                    <input 
                      type="text" required className="input" placeholder="e.g. Finance & Ops"
                      style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                      value={formData.manualDepartment} onChange={e => setFormData({ ...formData, manualDepartment: e.target.value })}
                    />
                  ) : (
                    <select 
                      className="input" required style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px', appearance: 'none' }}
                      value={formData.departmentId} 
                      onChange={e => {
                        const dept = departments.find(d => d.id === e.target.value);
                        setFormData({ ...formData, departmentId: e.target.value, organizationId: dept?.organizationId });
                      }}
                    >
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      {departments.length === 0 && <option value="">No departments found</option>}
                    </select>
                  )}
                </div>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Base Compensation</label>
                <div style={{ position: 'relative' }}>
                  <Wallet size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="number" required className="input" placeholder="120000"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.baseSalary} onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Target Incentives</label>
                <div style={{ position: 'relative' }}>
                  <Target size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="number" className="input" placeholder="150000"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.targetSalary} onChange={e => setFormData({ ...formData, targetSalary: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 1' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Integration Date</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-gold)' }} />
                  <input 
                    type="date" required className="input"
                    style={{ paddingLeft: '40px', background: 'white', borderRadius: '12px', height: '48px' }}
                    value={formData.hireDate} onChange={e => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', marginTop: '1.5rem' }}>
                <button 
                  type="submit" disabled={loading} className="btn-gold" 
                  style={{ 
                    width: '100%', height: '56px', borderRadius: '16px', 
                    fontSize: '1rem', fontWeight: '800', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', gap: '12px',
                    boxShadow: '0 10px 20px -5px rgba(214, 179, 106, 0.4)',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Authenticating...' : (
                    <>
                      Finalize Integration <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
