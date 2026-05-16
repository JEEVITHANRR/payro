// src/App.jsx — Root with routing and auth bootstrap
import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/client';

import ProtectedRoute from './components/layout/ProtectedRoute';
import PublicRoute from './components/layout/PublicRoute';

import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import SignupPage         from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage  from './pages/ResetPasswordPage';
import VerifyEmailPage    from './pages/VerifyEmailPage';
import DashboardPage      from './pages/DashboardPage';
import EmployeesPage      from './pages/EmployeesPage';
import PayrollPage        from './pages/PayrollPage';
import ProfilePage        from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import PlaceholderPage    from './pages/PlaceholderPage';
import NotFoundPage       from './pages/NotFoundPage';

export default function App() {
  const { setAuth, logout, setLoading, accessToken } = useAuthStore();

  // Bootstrap — verify stored token on mount
  useEffect(() => {
    async function bootstrap() {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await authApi.me();
        setAuth(data.data, accessToken);
      } catch {
        try {
          const { data } = await authApi.refresh();
          const { data: me } = await authApi.me();
          setAuth(me.data, data.data.accessToken);
        } catch {
          logout();
        }
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []); // eslint-disable-line

  return (
    <Routes>
      {/* Public only (redirect to dashboard if logged in) */}
      <Route element={<PublicRoute />}>
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/signup"          element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password"  element={<ResetPasswordPage />} />
      </Route>

      {/* Public unrestricted */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected (require auth) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/employees"       element={<EmployeesPage />} />
        <Route path="/payroll"         element={<PayrollPage />} />
        <Route path="/profile"         element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        
        {/* Module Placeholders */}
        <Route path="/departments"     element={<PlaceholderPage title="Departments" subtitle="Organizational structure and budget allocation" icon="⬡" />} />
        <Route path="/attendance"      element={<PlaceholderPage title="Attendance" subtitle="Time tracking and leave management" icon="◷" />} />
        <Route path="/transactions"    element={<PlaceholderPage title="Transactions" subtitle="Ledger of all salary disbursements" icon="⟳" />} />
        <Route path="/expenses"        element={<PlaceholderPage title="Expenses" subtitle="Reimbursements and tax deductions" icon="◉" />} />
        <Route path="/analytics"       element={<PlaceholderPage title="Analytics" subtitle="Deep financial insights and trend analysis" icon="◎" />} />
        <Route path="/ai"              element={<PlaceholderPage title="AI Insights" subtitle="Predictive intelligence and anomaly detection" icon="◈" />} />
        <Route path="/audit"           element={<PlaceholderPage title="Audit Log" subtitle="System security and access monitoring" icon="◈" />} />
        <Route path="/notifications"   element={<PlaceholderPage title="Notifications" subtitle="System alerts and task reminders" icon="🔔" />} />
      </Route>

      {/* Redirects */}
      <Route path="/"  element={<LandingPage />} />
      <Route path="*"  element={<NotFoundPage />} />
    </Routes>
  );
}
