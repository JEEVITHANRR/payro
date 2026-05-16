// src/pages/SignupPage.jsx
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
      // Auto-login after registration
      const { data } = await authApi.login({
        email: values.email,
        password: values.password,
      });
      const { accessToken, user } = data.data;
      setAuth(user, accessToken);
      toast.success('Account created! Check your email to verify.');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed.';
      setApiError(msg);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
        top: -120, right: -120,
      }} />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">P</div>
          <div className="auth-brand-text">
            <div className="name">Payro</div>
            <div className="tag">Intelligent Payroll</div>
          </div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Start managing payroll intelligently</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First name</label>
              <input
                type="text"
                className={`form-input${errors.firstName ? ' error' : ''}`}
                placeholder="John"
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="form-error">{errors.firstName.message}</p>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last name</label>
              <input
                type="text"
                className={`form-input${errors.lastName ? ' error' : ''}`}
                placeholder="Doe"
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="form-error">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 14 }}>
            <label className="form-label">Email address</label>
            <input
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@company.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone (optional)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="+1 555 000 0000"
              {...register('phone')}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="Min 8 chars with upper, lower, number"
                autoComplete="new-password"
                {...register('password')}
              />
              <button
                type="button"
                className="input-toggle"
                onClick={() => setShowPass((v) => !v)}
                tabIndex={-1}
              >
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && (
              <p className="form-error">{errors.password.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm password</label>
            <input
              type="password"
              className={`form-input${errors.confirmPassword ? ' error' : ''}`}
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && (
              <p className="form-error">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <div className="auth-link-row">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
