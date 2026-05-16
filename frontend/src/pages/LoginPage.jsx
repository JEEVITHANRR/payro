// src/pages/LoginPage.jsx
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
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      setApiError(msg);
    }
  }

  return (
    <div className="auth-page">
      {/* Decorative orbs */}
      <div className="auth-orb" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,92,246,0.22) 0%, transparent 70%)',
        top: -120, left: -120,
      }} />
      <div className="auth-orb" style={{
        width: 380, height: 380,
        background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
        bottom: -60, right: -60,
        animationDelay: '3s',
        animationDuration: '10s',
      }} />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">P</div>
          <div className="auth-brand-text">
            <div className="name">Payro</div>
            <div className="tag">Intelligent Payroll</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              type="email"
              className={`form-input${errors.email ? ' error' : ''}`}
              placeholder="you@company.com"
              autoComplete="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="form-error">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                className={`form-input${errors.password ? ' error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
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

          <div style={{ textAlign: 'right', marginBottom: 20, marginTop: -8 }}>
            <Link to="/forgot-password" className="auth-link" style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? <span className="spinner" /> : 'Sign In'}
          </button>
        </form>

        <div className="auth-link-row">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}
