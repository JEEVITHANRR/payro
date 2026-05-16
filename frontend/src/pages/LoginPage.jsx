// src/pages/LoginPage.jsx — Luxury High-End Entrance
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setApiError('');
    try {
      const { data } = await authApi.login(values);
      const { accessToken, user } = data.data;
      setAuth(user, accessToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Authentication failed. Please check your credentials.';
      setApiError(msg);
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: 'var(--text-royal-navy)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
    }}>
      {/* ─── Luxury Glows ─── */}
      <div style={{ 
        position: 'absolute', top: '-10%', right: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(214, 179, 106, 0.08) 0%, transparent 70%)', filter: 'blur(80px)'
      }} />
      <div style={{ 
        position: 'absolute', bottom: '-10%', left: '-10%', width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(15, 118, 110, 0.06) 0%, transparent 70%)', filter: 'blur(80px)'
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '1rem', zIndex: 10 }}>
        <div className="card glass" style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ 
              width: '56px', height: '56px', background: 'var(--accent-gold)', 
              borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--surface-white)', fontSize: '28px', fontWeight: '800', margin: '0 auto 1rem',
              boxShadow: '0 10px 25px -5px rgba(214, 179, 106, 0.4)'
            }}>P</div>
            <h1 style={{ color: 'var(--surface-white)', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Welcome to Payro
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              The definitive platform for enterprise payroll.
            </p>
          </div>

          {apiError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#F87171', padding: '0.875rem', borderRadius: '12px', fontSize: '0.8rem',
              marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600'
            }}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
              <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Institutional Email</label>
              <input
                type="email"
                className="input-field"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="name@organization.com"
                {...register('email')}
              />
              {errors.email && <p style={{ color: '#F87171', fontSize: '0.7rem', marginTop: '4px' }}>{errors.email.message}</p>}
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Security Token</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Enter your password"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ 
                    position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer'
                  }}
                >
                  {showPass ? 'HIDE' : 'SHOW'}
                </button>
              </div>
              {errors.password && <p style={{ color: '#F87171', fontSize: '0.7rem', marginTop: '4px' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginTop: '1rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Institutional Access Only. <Link to="/signup" style={{ color: 'var(--accent-gold)', fontWeight: '600', textDecoration: 'none' }}>Request Access</Link>
          </div>
        </div>

        <p style={{ 
          textAlign: 'center', marginTop: '2rem', color: 'rgba(255,255,255,0.3)', 
          fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: '700' 
        }}>
          &copy; 2024 Payro Enterprise • ISO 27001 Certified
        </p>
      </div>
    </div>
  );
}

