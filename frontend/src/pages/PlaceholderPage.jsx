// src/pages/PlaceholderPage.jsx
import React from 'react';
import AppLayout from '../components/layout/AppLayout';

export default function PlaceholderPage({ title, subtitle, icon = '◈' }) {
  return (
    <AppLayout title={title} subtitle={subtitle}>
      <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>{icon}</div>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 12 }}>
          {title} Module Under Optimization
        </h2>
        <p style={{ color: 'var(--text2)', maxWidth: 400, margin: '0 auto 24px', fontSize: 14 }}>
          We are currently migrating this legacy module to the new React architecture. 
          Real-time data synchronization is in progress.
        </p>
        <div className="badge badge-info" style={{ padding: '8px 16px' }}>
          Coming Soon in v2.4
        </div>
      </div>
    </AppLayout>
  );
}
