// src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-page">
      <div className="auth-orb" style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(253,164,175,0.12) 0%, transparent 70%)',
        top: '10%', left: '20%',
      }} />
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 72, marginBottom: 8, fontFamily: 'var(--font-brand)', fontWeight: 900, color: 'var(--text3)' }}>
          404
        </div>
        <h1 className="auth-title">Page not found</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginBottom: 32 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard">
          <button className="btn-primary" style={{ maxWidth: 220, margin: '0 auto' }}>
            ← Back to Dashboard
          </button>
        </Link>
      </div>
    </div>
  );
}
