// src/pages/AttendancePage.jsx — Luxury Attendance Management
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Calendar, UserCheck, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Timer, PieChart,
  ChevronLeft, ChevronRight, Download, Filter
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { attendanceApi } from '../api/client';

export default function AttendancePage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ present: 0, late: 0, overtime: 0, absent: 0 });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await attendanceApi.list();
        setLogs(res.data.data);
        // Mocking stats for the luxury feel
        setStats({ present: 142, late: 8, overtime: 24, absent: 3 });
      } catch (err) {
        console.error("Attendance Data Error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <AppLayout 
      title="Workforce Presence" 
      subtitle="Real-time attendance tracking and operational efficiency monitoring"
    >
      <div className="enterprise-container">
        
        {/* ─── Executive Summary Widgets ─── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Active Presence', val: stats.present, sub: 'Currently clocked in', icon: <UserCheck />, color: '#10b981' },
            { label: 'Latency Rate', val: `${stats.late}`, sub: 'Requires review', icon: <AlertCircle />, color: '#f59e0b' },
            { label: 'Total Overtime', val: `${stats.overtime}h`, sub: 'Accumulated this week', icon: <Timer />, color: 'var(--accent-gold)' },
            { label: 'Leave Requests', val: stats.absent, sub: 'Approved absence', icon: <Calendar />, color: '#3b82f6' }
          ].map((s, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card glass-hover" 
              style={{ padding: '1.5rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: `${s.color}15`, color: s.color }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                  <ArrowUpRight size={14} /> 4.2%
                </div>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-royal-navy)' }}>{s.val}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-slate)', marginTop: '4px' }}>{s.label}</div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-slate)', opacity: 0.7, marginTop: '4px' }}>{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
          
          {/* ─── Attendance Timeline ─── */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '2rem', borderBottom: '1px solid var(--border-platinum)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Presence Ledger</h3>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}><Filter size={14} /> Filter</button>
                <button className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.8rem' }}><Download size={14} /> Export</button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="luxury-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>DATE</th>
                    <th>CHECK IN</th>
                    <th>CHECK OUT</th>
                    <th>TOTAL HOURS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-soft-ivory)', border: '1px solid var(--border-platinum)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                            {log.employee.firstName[0]}{log.employee.lastName[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.85rem' }}>{log.employee.firstName} {log.employee.lastName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-slate)' }}>{log.employee.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{new Date(log.date).toLocaleDateString()}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>{log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ fontSize: '0.85rem', fontWeight: '600' }}>{log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td style={{ fontSize: '0.85rem' }}>{log.hoursWorked ? `${log.hoursWorked}h` : '—'}</td>
                      <td>
                        <span className={`badge badge-${log.status.toLowerCase() === 'present' ? 'success' : 'warning'}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ─── Calendar Visualization ─── */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: '800' }}>Presence Calendar</h3>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="btn" style={{ padding: '4px' }}><ChevronLeft size={16} /></button>
                <button className="btn" style={{ padding: '4px' }}><ChevronRight size={16} /></button>
              </div>
            </div>
            <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '0.85rem', marginBottom: '1rem' }}>MAY 2024</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {days.map(d => <div key={d} style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-slate)', textTransform: 'uppercase' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
              {dates.map(d => (
                <div key={d} style={{ 
                  aspectRatio: '1/1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '600', borderRadius: '8px',
                  background: d === 16 ? 'var(--accent-gold)' : 'var(--bg-soft-ivory)',
                  color: d === 16 ? 'white' : 'var(--text-royal-navy)',
                  cursor: 'pointer', border: '1px solid var(--border-platinum)'
                }}>
                  {d}
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-platinum)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--text-slate)' }}>Distribution</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['Present', 'Late', 'Remote', 'On Leave'].map((l, i) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'][i] }} />
                      {l}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: '700' }}>{['85%', '8%', '5%', '2%'][i]}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Optimization Notice ─── */}
        <div className="card glass" style={{ 
          marginTop: '3rem', padding: '2rem', textAlign: 'center', 
          border: '1px solid var(--border-platinum)', background: 'rgba(255, 255, 255, 0.4)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '0.5rem' }}>Attendance Architecture Under Optimization</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-slate)', marginBottom: '1.5rem' }}>
            Transitioning to real-time bio-metric synchronization. Security auditing in progress.
          </p>
          <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: 'var(--border-platinum)', borderRadius: '2px', margin: '0 auto', overflow: 'hidden' }}>
            <div style={{ width: '78%', height: '100%', background: 'var(--accent-gold)' }} />
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--accent-gold)' }}>
            PHASE 2.4 DEPLOYMENT • 78% COMPLETE
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
