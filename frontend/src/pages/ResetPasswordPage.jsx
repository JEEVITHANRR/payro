// src/pages/ResetPasswordPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authApi } from '../api/client';

const schema = z
  .object({
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPass, setShowPass] = useState(false);
  const [apiError, setApiError] = useState('');
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit({ password }) {
    setApiError('');
    if (!token) {
      setApiError('Invalid or missing reset token. Please request a new one.');
      return;
    }
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      setApiError(msg);
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon">P</div>
            <div className="auth-brand-text">
              <div className="name">Payro</div>
              <div className="tag">Intelligent Payroll</div>
            </div>
          </div>
          <div className="alert alert-error">
            Missing reset token. Please use the link from your email.
          </div>
          <div className="auth-link-row">
            <Link to="/forgot-password">Request a new link</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{
        width: 440, height: 440,
        background: 'radial-gradient(circle, rgba(167,139,250,0.2) 0%, transparent 70%)',
        bottom: -80, left: '20%',
      }} />

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">P</div>
          <div className="auth-brand-text">
            <div className="name">Payro</div>
            <div className="tag">Intelligent Payroll</div>
          </div>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '12px 0 28px' }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h1 className="auth-title" style={{ marginBottom: 12 }}>Password reset!</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 28 }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </button>
          </div>
        ) : (
          <>
            <h1 className="auth-title">Set new password</h1>
            <p className="auth-subtitle">
              Choose a strong password for your account
            </p>

            {apiError && <div className="alert alert-error">{apiError}</div>}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">New password</label>
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
                <label className="form-label">Confirm new password</label>
                <input
                  type="password"
                  className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                  placeholder="Repeat your new password"
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
                {isSubmitting ? <span className="spinner" /> : 'Reset Password'}
              </button>
            </form>
          </>
        )}

        <div className="auth-link-row" style={{ marginTop: 20 }}>
          <Link to="/login">← Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
