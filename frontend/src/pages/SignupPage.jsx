// src/pages/SignupPage.jsx — Luxury Institutional Signup
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

const schema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  email:     z.string().email('Invalid email address'),
  phone:     z.string().optional(),
  password:  z
    .string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/\d/, 'Must contain a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export default function SignupPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ confirmPassword, ...values }) {
    setApiError('');
    try {
      await authApi.register(values);
      const { data } = await authApi.login({ email: values.email, password: values.password });
      const { accessToken, user } = data.data;
      setAuth(user, accessToken);
      toast.success('Registration successful. Welcome to Payro Enterprise.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Institutional registration failed.');
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: 'var(--text-royal-navy)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', padding: '2rem 0'
    }}>
      {/* ─── Luxury Glows ─── */}
      <div style={{ 
        position: 'absolute', top: '-10%', left: '-10%', width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(214, 179, 106, 0.08) 0%, transparent 70%)', filter: 'blur(80px)'
      }} />

      <div className="animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '1rem', zIndex: 10 }}>
        <div className="card glass" style={{ padding: '3rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ color: 'var(--surface-white)', fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em' }}>
              Create Executive Account
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              Establish your organization's presence on the Payro platform.
            </p>
          </div>

          {apiError && (
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
              color: '#F87171', padding: '0.875rem', borderRadius: '12px', fontSize: '0.8rem',
              marginBottom: '1.5rem', textAlign: 'center'
            }}>{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Given Name</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="John"
                  {...register('firstName')}
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Surname</label>
                <input
                  type="text"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Doe"
                  {...register('lastName')}
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Institutional Email</label>
              <input
                type="email"
                className="input-field"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                placeholder="name@organization.com"
                {...register('email')}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Security Token</label>
                <input
                  type="password"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Create password"
                  {...register('password')}
                />
              </div>
              <div className="input-group">
                <label className="input-label" style={{ color: 'rgba(255,255,255,0.7)' }}>Confirm Token</label>
                <input
                  type="password"
                  className="input-field"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                  placeholder="Repeat password"
                  {...register('confirmPassword')}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-gold"
              style={{ width: '100%', padding: '1rem', justifyContent: 'center', marginTop: '1.5rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Establish Account'}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
            Already have institutional access? <Link to="/login" style={{ color: 'var(--accent-gold)', fontWeight: '600', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

