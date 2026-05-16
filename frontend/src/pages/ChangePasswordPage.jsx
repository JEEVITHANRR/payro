// src/pages/ChangePasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/[A-Z]/, 'Must contain an uppercase letter')
      .regex(/[a-z]/, 'Must contain a lowercase letter')
      .regex(/\d/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    setApiError('');
    try {
      await authApi.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      toast.success('Password changed. Please sign in again.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password.';
      setApiError(msg);
    }
  }

  return (
    <AppLayout title="Change Password" subtitle="Update your account password">
      <div style={{ maxWidth: 480 }}>
        <div className="card">
          <div
            className="alert alert-info"
            style={{ marginBottom: 24 }}
          >
            🔒 After changing your password, you will be signed out of all devices.
          </div>

          {apiError && (
            <div className="alert alert-error">{apiError}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">Current password</label>
              <div className="input-wrapper">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className={`form-input${errors.currentPassword ? ' error' : ''}`}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowCurrent((v) => !v)}
                  tabIndex={-1}
                >
                  {showCurrent ? '🙈' : '👁'}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="form-error">{errors.currentPassword.message}</p>
              )}
            </div>

            <div className="auth-divider">New Password</div>

            <div className="form-group">
              <label className="form-label">New password</label>
              <div className="input-wrapper">
                <input
                  type={showNew ? 'text' : 'password'}
                  className={`form-input${errors.newPassword ? ' error' : ''}`}
                  placeholder="Min 8 chars with upper, lower, number"
                  autoComplete="new-password"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowNew((v) => !v)}
                  tabIndex={-1}
                >
                  {showNew ? '🙈' : '👁'}
                </button>
              </div>
              {errors.newPassword && (
                <p className="form-error">{errors.newPassword.message}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input
                type="password"
                className={`form-input${errors.confirmPassword ? ' error' : ''}`}
                placeholder="Repeat new password"
                autoComplete="new-password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="form-error">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                type="submit"
                className="btn-primary"
                style={{ maxWidth: 200 }}
                disabled={isSubmitting}
              >
                {isSubmitting ? <span className="spinner" /> : 'Change Password'}
              </button>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => navigate('/profile')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
