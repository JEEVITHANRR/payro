// src/pages/ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../api/client';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setApiError('');
    try {
      await authApi.forgotPassword(values);
      setSent(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong.';
      setApiError(msg);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{
        width: 460, height: 460,
        background: 'radial-gradient(circle, rgba(103,232,249,0.14) 0%, transparent 70%)',
        top: -80, left: '30%',
      }} />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">P</div>
          <div className="auth-brand-text">
            <div className="name">Payro</div>
            <div className="tag">Intelligent Payroll</div>
          </div>
        </div>

        {sent ? (
          <>
            <div style={{ textAlign: 'center', padding: '12px 0 28px' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
              <h1 className="auth-title" style={{ marginBottom: 12 }}>Check your inbox</h1>
              <p style={{ color: 'var(--text2)', fontSize: 14, lineHeight: 1.7 }}>
                If <strong style={{ color: 'var(--primary)' }}>{getValues('email')}</strong> is
                registered, a password reset link has been sent. It expires in 1 hour.
              </p>
            </div>
            <div className="alert alert-info">
              Didn't receive it? Check your spam folder or{' '}
              <span
                className="auth-link"
                onClick={() => setSent(false)}
              >
                try again
              </span>.
            </div>
          </>
        ) : (
          <>
            <h1 className="auth-title">Forgot password?</h1>
            <p className="auth-subtitle">
              Enter your email and we'll send you a reset link
            </p>

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

              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="spinner" /> : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <div className="auth-link-row" style={{ marginTop: 24 }}>
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
