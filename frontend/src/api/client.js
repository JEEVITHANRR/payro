// src/api/client.js — Axios instance with auth interceptors
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request interceptor — attach access token ─────────────────
client.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — auto refresh on 401 ────────────────
let isRefreshing = false;
let failedQueue = [];

function processQueue(error, token = null) {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (
      error.response?.status === 401 &&
      !original._retry &&
      !original.url?.includes('/auth/refresh') &&
      !original.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return client(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        useAuthStore.getState().setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return client(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ──────────────────────────────────────────────────
export const authApi = {
  login:            (data) => client.post('/auth/login', data),
  register:         (data) => client.post('/auth/register', data),
  logout:           ()     => client.post('/auth/logout'),
  logoutAll:        ()     => client.post('/auth/logout-all'),
  me:               ()     => client.get('/auth/me'),
  refresh:          ()     => client.post('/auth/refresh'),
  changePassword:   (data) => client.put('/auth/change-password', data),
  forgotPassword:   (data) => client.post('/auth/forgot-password', data),
  resetPassword:    (data) => client.post('/auth/reset-password', data),
  verifyEmail:      (data) => client.post('/auth/verify-email', data),
  sendVerification: ()     => client.post('/auth/send-verification'),
  updateProfile:    (data) => client.patch('/auth/profile', data),
};

// ─── Dashboard API ─────────────────────────────────────────────
export const dashboardApi = {
  summary:              () => client.get('/dashboard/summary'),
  kpis:                 () => client.get('/dashboard/kpis'),
  employeeDistribution: () => client.get('/dashboard/employee-distribution'),
  liveActivity:         () => client.get('/dashboard/live-activity'),
};

// ─── Employees API ─────────────────────────────────────────────
export const employeesApi = {
  list:    (params) => client.get('/employees', { params }),
  getById: (id)     => client.get(`/employees/${id}`),
  create:  (data)   => client.post('/employees', data),
  update:  (id, data) => client.patch(`/employees/${id}`, data),
  remove:  (id)     => client.delete(`/employees/${id}`),
  stats:   ()       => client.get('/employees/stats'),
};

// ─── Payroll API ───────────────────────────────────────────────
export const payrollApi = {
  list:    (params) => client.get('/payroll', { params }),
  getById: (id)     => client.get(`/payroll/${id}`),
  create:  (data)   => client.post('/payroll', data),
  submit:  (id)     => client.post(`/payroll/${id}/submit`),
  approve: (id)     => client.post(`/payroll/${id}/approve`),
  process: (id)     => client.post(`/payroll/${id}/process`),
};

// ─── Notifications API ─────────────────────────────────────────
export const notificationsApi = {
  list:        (params) => client.get('/notifications', { params }),
  unreadCount: ()       => client.get('/notifications/unread-count'),
  markRead:    (id)     => client.patch(`/notifications/${id}/read`),
  markAllRead: ()       => client.patch('/notifications/read-all'),
};

// ─── Analytics API ─────────────────────────────────────────────
export const analyticsApi = {
  payrollTrend:    () => client.get('/analytics/payroll-trend'),
  budgetBreakdown: () => client.get('/analytics/budget-breakdown'),
  headcountTrend:  () => client.get('/analytics/headcount-trend'),
  compensation:    () => client.get('/analytics/compensation'),
  taxTrend:        () => client.get('/analytics/tax-trend'),
  exportReport:    (params) => client.get('/analytics/export', { params }),
};

// ─── AI Insights API ───────────────────────────────────────────
export const aiApi = {
  list:              (params) => client.get('/ai', { params }),
  topInsight:        ()       => client.get('/ai/top'),
  applyInsight:      (id)     => client.post(`/ai/${id}/apply`),
  dismissInsight:    (id)     => client.post(`/ai/${id}/dismiss`),
  generateInsights:  (data)   => client.post('/ai/generate', data),
  salaryPredictions: ()       => client.get('/ai/salary-predictions'),
  fraudDetection:    ()       => client.get('/ai/fraud-detection'),
};

// ─── Attendance API ────────────────────────────────────────────
export const attendanceApi = {
  list:    (params) => client.get('/attendance', { params }),
  create:  (data)   => client.post('/attendance', data),
  summary: (params) => client.get('/attendance/summary', { params }),
};

// ─── Departments API ───────────────────────────────────────────
export const departmentApi = {
  list:    (params)    => client.get('/departments', { params }),
  getById: (id)        => client.get(`/departments/${id}`),
  create:  (data)      => client.post('/departments', data),
  update:  (id, data)  => client.patch(`/departments/${id}`, data),
  remove:  (id)        => client.delete(`/departments/${id}`),
};

// ─── Expenses/Treasury API ─────────────────────────────────────
export const expenseApi = {
  list:         (params) => client.get('/expenses', { params }),
  create:       (data)   => client.post('/expenses', data),
  getById:      (id)     => client.get(`/expenses/${id}`),
  updateStatus: (id, data) => client.patch(`/expenses/${id}/status`, data),
  remove:       (id)     => client.delete(`/expenses/${id}`),
};

export default client;
