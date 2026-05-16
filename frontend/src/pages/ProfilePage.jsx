// src/pages/ProfilePage.jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/client';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName:  z.string().min(1, 'Last name is required').max(50),
  phone:     z.string().optional(),
});

function roleLabel(role) {
  return role?.replace(/_/g, ' ') ?? '';
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [sendingVerify, setSendingVerify] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     user?.phone     ?? '',
    },
  });

  async function onSave(values) {
    try {
      const { data } = await authApi.updateProfile(values);
      updateUser(data.data);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    }
  }

  function cancelEdit() {
    reset({
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      phone:     user?.phone     ?? '',
    });
    setEditMode(false);
  }

  async function resendVerification() {
    setSendingVerify(true);
    try {
      await authApi.sendVerification();
      toast.success('Verification email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send email.');
    } finally {
      setSendingVerify(false);
    }
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : 'U';

  return (
    <AppLayout title="My Profile" subtitle="Manage your account settings">
      <div style={{ maxWidth: 680 }}>

        {/* Unverified email banner */}
        {user && !user.isEmailVerified && (
          <div className="verify-banner">
            <span>⚠️</span>
            <span>Your email address is not yet verified.</span>
            <button onClick={resendVerification} disabled={sendingVerify}>
              {sendingVerify ? 'Sending…' : 'Resend Email'}
            </button>
          </div>
        )}

        {/* Profile Header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="profile-header">
            <div className="profile-avatar">{initials}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                {user?.firstName} {user?.lastName}
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{roleLabel(user?.role)}</span>
                <span className={`badge ${user?.isEmailVerified ? 'badge-success' : 'badge-warning'}`}>
                  {user?.isEmailVerified ? '✓ Email Verified' : '⚠ Unverified'}
                </span>
              </div>
            </div>
            {!editMode && (
              <button className="btn-ghost" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            )}
          </div>

          {/* Info grid (read mode) */}
          {!editMode && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 8 }}>
              {[
                { label: 'First Name', value: user?.firstName },
                { label: 'Last Name',  value: user?.lastName },
                { label: 'Email',      value: user?.email },
                { label: 'Phone',      value: user?.phone || '—' },
                { label: 'Role',       value: roleLabel(user?.role) },
                { label: 'Member Since', value: user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : '—',
                },
                { label: 'Last Login', value: user?.lastLoginAt
                  ? new Date(user.lastLoginAt).toLocaleString('en-US')
                  : '—',
                },
              ].map(({ label, value }) => (
                <div key={label}>
                  <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text3)', marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Edit form */}
          {editMode && (
            <form onSubmit={handleSubmit(onSave)} noValidate>
              <div className="auth-divider">Edit Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label className="form-label">First name</label>
                  <input
                    className={`form-input${errors.firstName ? ' error' : ''}`}
                    {...register('firstName')}
                  />
                  {errors.firstName && <p className="form-error">{errors.firstName.message}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">Last name</label>
                  <input
                    className={`form-input${errors.lastName ? ' error' : ''}`}
                    {...register('lastName')}
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName.message}</p>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" placeholder="+1 555 000 0000" {...register('phone')} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn-primary" style={{ maxWidth: 180 }} disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? <span className="spinner" /> : 'Save Changes'}
                </button>
                <button type="button" className="btn-ghost" onClick={cancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Security card */}
        <div className="card">
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Security
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 14, color: 'var(--text)', fontWeight: 500 }}>Password</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>
                Last changed: unknown — change it regularly for security
              </div>
            </div>
            <button
              className="btn-ghost"
              onClick={() => navigate('/change-password')}
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
