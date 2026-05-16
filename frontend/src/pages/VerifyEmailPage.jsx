// src/pages/VerifyEmailPage.jsx
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { updateUser } = useAuthStore();

  const [status, setStatus] = useState('verifying'); // verifying | success | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token found. Please use the link from your email.');
      return;
    }

    authApi.verifyEmail({ token })
      .then(() => {
        setStatus('success');
        updateUser({ isEmailVerified: true });
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err.response?.data?.message ||
          'Verification failed. The link may have expired.'
        );
      });
  }, [token]); // eslint-disable-line

  return (
    <div className="auth-page">
      <div className="auth-orb" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(110,231,183,0.15) 0%, transparent 70%)',
        top: -100, right: -100,
      }} />

      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div className="auth-brand" style={{ justifyContent: 'center', marginBottom: 32 }}>
          <div className="auth-brand-icon">P</div>
          <div className="auth-brand-text">
            <div className="name">Payro</div>
            <div className="tag">Intelligent Payroll</div>
          </div>
        </div>

        {status === 'verifying' && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3, margin: '0 auto' }} />
            </div>
            <h1 className="auth-title">Verifying your email…</h1>
            <p className="auth-subtitle">This will only take a moment</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
            <h1 className="auth-title" style={{ marginBottom: 12 }}>Email verified!</h1>
            <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 32 }}>
              Your email has been verified. You now have full access to Payro.
            </p>
            <Link to="/dashboard">
              <button className="btn-primary" style={{ maxWidth: 240, margin: '0 auto' }}>
                Go to Dashboard
              </button>
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 20 }}>❌</div>
            <h1 className="auth-title" style={{ marginBottom: 12 }}>Verification failed</h1>
            <div className="alert alert-error" style={{ textAlign: 'left' }}>{message}</div>
            <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>
              If your link expired, you can request a new one from your profile settings.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login">
                <button className="btn-ghost">Sign In</button>
              </Link>
              <Link to="/dashboard">
                <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
                  Go to Dashboard
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
