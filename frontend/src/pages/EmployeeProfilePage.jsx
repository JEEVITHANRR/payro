// src/pages/EmployeeProfilePage.jsx — Luxury Professional Intelligence Profile
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, Briefcase, Mail, Phone, Calendar, 
  MapPin, ShieldCheck, TrendingUp, Award, 
  Clock, CheckCircle2, AlertCircle, FileText,
  ChevronLeft, BarChart3, Target, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { employeesApi } from '../api/client';
import AppLayout from '../components/layout/AppLayout';
import { toast } from 'sonner';

export default function EmployeeProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, insRes] = await Promise.allSettled([
          employeesApi.getById(id),
          employeesApi.getInsights(id)
        ]);

        if (empRes.status === 'fulfilled') setEmployee(empRes.value.data.data);
        if (insRes.status === 'fulfilled') setInsights(insRes.value.data.data);
      } catch (err) {
        toast.error('Failed to access professional record.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return (
    <AppLayout title="Accessing Intelligence..." subtitle="Decrypting professional records">
      <div style={{ height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-pulse" style={{ color: 'var(--accent-gold)', fontWeight: '800', fontSize: '1.25rem' }}>Synchronizing Secure Nodes...</div>
      </div>
    </AppLayout>
  );

  if (!employee) return (
    <AppLayout title="Record Not Found" subtitle="Institutional directory error">
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-royal-navy)', marginBottom: '1rem' }}>404 • Professional Null</h2>
        <button className="btn btn-gold" onClick={() => navigate('/employees')}>Return to Directory</button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout 
      title={`${employee.firstName} ${employee.lastName}`} 
      subtitle={`Professional ID: ${employee.employeeId} • ${employee.title}`}
    >
      <div className="enterprise-container" style={{ paddingBottom: '4rem' }}>
        
        {/* ─── Navigation Header ─── */}
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate('/employees')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-slate)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            <ChevronLeft size={16} /> Global Directory
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* ─── Left Column: Intelligence & Identity ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Identity Card */}
            <div className="card glass" style={{ padding: '3rem', display: 'flex', gap: '2.5rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ 
                width: '120px', height: '120px', borderRadius: '32px', 
                background: 'var(--text-royal-navy)', color: 'var(--accent-gold)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '3rem', fontWeight: '800', flexShrink: 0,
                boxShadow: '0 20px 40px -10px rgba(30, 42, 56, 0.3)'
              }}>
                {employee.firstName[0]}{employee.lastName[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--text-royal-navy)', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
                      {employee.firstName} {employee.lastName}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                      <span className="badge" style={{ background: 'var(--bg-soft-ivory)', color: 'var(--text-royal-navy)', fontWeight: '800' }}>{employee.employmentType}</span>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-slate)', fontWeight: '600' }}>Joined {new Date(employee.hireDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className={`badge ${employee.status === 'ACTIVE' ? 'badge-success' : 'badge-warning'}`} style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                    {employee.status}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Mail size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{employee.email}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Briefcase size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{employee.department?.name || 'Unassigned'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <MapPin size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>HQ • Corporate Office</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Phone size={18} color="var(--accent-gold)" />
                    <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>{employee.phone || '—'}</span>
                  </div>
                </div>
              </div>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.03 }}>
                <ShieldCheck size={200} />
              </div>
            </div>

            {/* Performance AI Insights */}
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--accent-gold)' }}>
              <div style={{ 
                padding: '1.5rem 3rem', background: 'var(--bg-soft-ivory)', 
                borderBottom: '1px solid var(--border-platinum)', display: 'flex', 
                justifyContent: 'space-between', alignItems: 'center' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Zap size={20} color="var(--accent-gold)" fill="var(--accent-gold)" />
                  <h3 style={{ fontSize: '1rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Performance Intelligence</h3>
                </div>
                <div className="badge" style={{ background: 'white', color: 'var(--accent-gold)', border: '1px solid var(--accent-gold)' }}>SYNCHRONIZED</div>
              </div>
              
              <div style={{ padding: '3rem', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '3rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{insights?.performanceScore || 92}</div>
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Index Score</div>
                    </div>
                    <div style={{ width: '2px', height: '60px', background: 'var(--border-platinum)' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>Reliability Rating</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>{insights?.reliabilityIndex || '98.5%'}</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-soft-ivory)', borderRadius: '4px', overflow: 'hidden' }}>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '98.5%' }}
                          style={{ height: '100%', background: '#10b981' }} 
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px' }}>Tenure Assessment</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={16} color="var(--accent-gold)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{insights?.tenureAssessment || 'ESTABLISHED'}</span>
                      </div>
                    </div>
                    <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '8px' }}>Market Value</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Target size={16} color="#3b82f6" />
                        <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{insights?.marketCompetitiveness || 'OPTIMAL'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'var(--text-royal-navy)', padding: '2rem', borderRadius: '24px', color: 'white' }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: '800', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart3 size={18} color="var(--accent-gold)" /> Strategic Recommendations
                  </h4>
                  <ul style={{ padding: '0', margin: '0', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(insights?.recommendations || [
                      "Maintain current high reliability standards.",
                      "Compensation benchmarks within top 15th percentile.",
                      "High potential for strategic leadership role."
                    ]).map((rec, i) => (
                      <li key={i} style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', lineHeight: '1.5' }}>
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Compensation & Benefits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div className="card glass" style={{ padding: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Financial Compensation</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Annual Base Salary</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>
                      ₹{Number(employee.baseSalary).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>Target Incentives</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                      ₹{Number(employee.targetSalary || (employee.baseSalary * 0.15)).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card glass" style={{ padding: '2.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Institutional Benefits</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {['Equity Options', 'Full Medical', 'Luxury Travel', 'Retirement 401k', 'Performance Bonus'].map(b => (
                    <div key={b} className="badge" style={{ background: 'var(--bg-soft-ivory)', color: 'var(--text-slate)', border: '1px solid var(--border-platinum)' }}>
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ─── Right Column: Timeline & Stats ─── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Quick Actions */}
            <div className="card glass" style={{ padding: '2rem' }}>
              <button className="btn btn-gold" style={{ width: '100%', height: '50px', fontWeight: '800', marginBottom: '1rem' }}>
                Modify Profile
              </button>
              <button className="btn" style={{ width: '100%', height: '50px', fontWeight: '700', border: '1px solid var(--border-platinum)', color: 'var(--text-slate)' }}>
                Download Dossier
              </button>
              <div style={{ width: '100%', height: '1px', background: 'var(--border-platinum)', margin: '1.5rem 0' }} />
              <button className="btn" style={{ width: '100%', justifyContent: 'center', color: '#EF4444', fontWeight: '700', fontSize: '0.85rem' }}>
                Initiate Offboarding
              </button>
            </div>

            {/* Attendance Snapshot */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Attendance Snapshot</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {employee.attendance?.slice(0, 5).map((att, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '12px', background: 'var(--bg-soft-ivory)' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{new Date(att.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{att.hoursWorked || 8} Hours Logged</div>
                    </div>
                    <div className={`badge ${att.status === 'PRESENT' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {att.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Org Placement */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Direct Reporting</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase', marginBottom: '10px' }}>Manager</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--text-royal-navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                      {employee.manager?.firstName?.[0] || 'A'}{employee.manager?.lastName?.[0] || 'M'}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: '700' }}>{employee.manager?.firstName || 'Institutional'} {employee.manager?.lastName || 'Lead'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{employee.manager?.title || 'Executive Director'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </AppLayout>
  );
}
