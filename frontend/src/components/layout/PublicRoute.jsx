// src/components/layout/PublicRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function PublicRoute() {
  const { user, accessToken, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--void)',
      }}>
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  if (accessToken && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
