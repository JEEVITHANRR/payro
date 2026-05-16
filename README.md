# Payro — Enterprise AI-Powered Payroll Platform

> Full-stack, production-ready payroll management system with JWT authentication, role-based access control, real-time features, and AI-powered insights.

---

## Tech Stack

| Layer      | Technology |
|------------|-----------|
| Frontend   | React 18, Vite, React Router 6, Zustand, React Hook Form + Zod, Sonner |
| Backend    | Node.js 20, Express 4, Prisma ORM, PostgreSQL 16 |
| Cache      | Redis 7 (ioredis) |
| Auth       | JWT (access + refresh tokens), bcrypt, httpOnly cookies |
| Email      | Nodemailer (SMTP-agnostic) |
| Real-time  | Socket.IO |
| Jobs       | Bull queue + node-cron |
| Security   | Helmet, rate-limiting, CORS, input sanitization, HPP |
| Deploy     | Docker + docker-compose |

---

## Project Structure

```
payro/
├── backend/
│   ├── src/
│   │   ├── ai/               # AI insights engine
│   │   ├── config/           # database, jwt, redis
│   │   ├── controllers/      # request handlers
│   │   ├── jobs/             # payroll processor & scheduler
│   │   ├── middleware/       # auth, audit, error handler
│   │   ├── notifications/    # notification service
│   │   ├── routes/           # API route definitions
│   │   ├── sockets/          # Socket.IO setup
│   │   ├── utils/            # logger, apiResponse, email
│   │   ├── validations/      # Zod schemas
│   │   └── app.js            # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.js           # Seed data
│   ├── docker/postgres/      # Postgres init script
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/              # Axios client + API helpers
│   │   ├── components/
│   │   │   └── layout/       # AppLayout, ProtectedRoute, PublicRoute
│   │   ├── pages/            # All page components
│   │   ├── store/            # Zustand auth store
│   │   └── index.css         # Design system CSS
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml        # Full stack compose
├── package.json              # Root scripts (monorepo)
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites

- **Node.js** ≥ 18
- **Docker & Docker Compose** (for Postgres + Redis)
- **Git**

### 1 — Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/payro.git
cd payro

# Install all dependencies (backend + frontend)
npm run install:all
```

### 2 — Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env.local
```

Edit `backend/.env` and fill in:
- **JWT secrets** (generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- **SMTP credentials** (optional for dev — set `ENABLE_EMAIL_NOTIFICATIONS=false` to skip)

### 3 — Start Database & Redis

```bash
# Starts Postgres + Redis via Docker
npm run docker:up
```

Wait ~10 seconds for containers to be healthy.

### 4 — Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Seed with example data
npm run db:seed
```

### 5 — Start the App

```bash
# Start both backend (port 4000) and frontend (port 5173) simultaneously
npm run dev
```

Visit **http://localhost:5173** — you'll see the login page.

> **Default seeded credentials** (after running `npm run db:seed`):
> - `admin@payro.io` / `Admin@1234`
> - `hr@payro.io` / `Hr@12345`

---

## Authentication Pages

| Route             | Description |
|-------------------|-------------|
| `/login`          | Sign in with email + password |
| `/signup`         | Create a new account |
| `/forgot-password`| Request a password reset email |
| `/reset-password` | Set a new password via email link |
| `/verify-email`   | Confirm email address via link |
| `/profile`        | View and edit your profile |
| `/change-password`| Change account password |
| `/dashboard`      | Main app (requires auth) |

---

## API Reference

### Base URL
```
http://localhost:4000/api/v1
```

### Auth Endpoints

| Method | Endpoint                  | Auth | Description |
|--------|---------------------------|------|-------------|
| POST   | `/auth/register`          | —    | Create account |
| POST   | `/auth/login`             | —    | Get tokens |
| POST   | `/auth/refresh`           | 🍪   | Rotate access token |
| POST   | `/auth/logout`            | ✓    | Revoke session |
| POST   | `/auth/logout-all`        | ✓    | Revoke all sessions |
| GET    | `/auth/me`                | ✓    | Current user |
| PUT    | `/auth/change-password`   | ✓    | Change password |
| POST   | `/auth/forgot-password`   | —    | Send reset email |
| POST   | `/auth/reset-password`    | —    | Apply new password |
| POST   | `/auth/verify-email`      | —    | Confirm email token |
| POST   | `/auth/send-verification` | ✓    | Resend verification |
| PATCH  | `/auth/profile`           | ✓    | Update profile |

### Other Endpoints

| Prefix           | Description |
|------------------|-------------|
| `/employees`     | Employee CRUD |
| `/departments`   | Department management |
| `/payroll`       | Payroll runs |
| `/transactions`  | Payment transactions |
| `/dashboard`     | KPIs and summary |
| `/analytics`     | Charts and trends |
| `/notifications` | In-app notifications |
| `/expenses`      | Expense management |
| `/attendance`    | Attendance records |
| `/ai`            | AI insights |
| `/audit`         | Audit log |
| `/health`        | Health + readiness |

### Authentication

All protected routes require:
```
Authorization: Bearer <access_token>
```
Refresh tokens are sent as `httpOnly` cookies automatically by the browser.

---

## Role-Based Access Control

| Role             | Level | Access |
|------------------|-------|--------|
| `SUPER_ADMIN`    | 100   | Everything |
| `ADMIN`          | 90    | Everything except super admin actions |
| `CFO`            | 80    | Approve + process payroll, finance reports |
| `PAYROLL_MANAGER`| 70    | Create + submit payroll |
| `HR_MANAGER`     | 60    | Employee + department management |
| `AUDITOR`        | 50    | Read-only audit access |
| `EMPLOYEE`       | 10    | Own profile + payslips |

---

## Email Features

Email is sent via **Nodemailer** and works with any SMTP provider:

| Email               | Trigger |
|---------------------|---------|
| Welcome email       | On registration |
| Email verification  | On registration + resend |
| Password reset      | Forgot password request |
| Password changed    | After reset or change |

**Development:** Set `ENABLE_EMAIL_NOTIFICATIONS=false` in `.env` to skip email sending (links are logged to console instead).

**Production options:**
- [Resend](https://resend.com) (recommended, generous free tier)
- [Mailtrap](https://mailtrap.io) (great for testing)
- [SendGrid](https://sendgrid.com)
- AWS SES

---

## Security Features

- ✅ Passwords hashed with **bcrypt** (cost factor 12)
- ✅ **JWT access tokens** (15 min) + **refresh tokens** (7 days, stored in httpOnly cookies)
- ✅ Refresh token **rotation** on every use
- ✅ **Revoke all sessions** (logout-all) on password change
- ✅ **Rate limiting** — global (500/15 min), auth (10/15 min), reset (5/hr)
- ✅ **Helmet** security headers
- ✅ **CORS** allowlist
- ✅ **Input sanitization** (mongo-sanitize + xss-clean)
- ✅ **Audit logging** on all sensitive actions
- ✅ **Redis token blacklist** support
- ✅ Email enumeration protection on forgot-password

---

## Production Deployment

### Docker (Recommended)

```bash
# 1. Copy and fill in your .env
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# 2. Build and start all services
docker-compose up -d --build

# 3. The backend auto-runs migrations on startup
```

### Manual Deployment

**Backend** (e.g. Railway, Render, Fly.io):
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

**Frontend** (e.g. Vercel, Netlify):
```bash
cd frontend
# Set VITE_API_URL=https://your-backend.com/api/v1
npm install
npm run build
# Deploy the dist/ folder
```

### Environment Variables for Production

**Backend** — critical values to change:
```
NODE_ENV=production
DATABASE_URL=<your-postgres-url>
REDIS_HOST=<your-redis-host>
JWT_ACCESS_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
ALLOWED_ORIGINS=https://your-frontend.com
APP_URL=https://your-frontend.com
SMTP_HOST=smtp.resend.com
SMTP_USER=resend
SMTP_PASS=<your-api-key>
ENABLE_EMAIL_NOTIFICATIONS=true
```

**Frontend**:
```
VITE_API_URL=https://your-backend.com/api/v1
```

---

## GitHub Upload Instructions

```bash
# 1. Create a new repository on GitHub (do NOT initialize with README)

# 2. Initialize git in the project root
cd payro
git init
git add .
git commit -m "feat: initial production-ready Payro setup"

# 3. Connect to your GitHub repo
git remote add origin https://github.com/YOUR_USERNAME/payro.git
git branch -M main
git push -u origin main
```

> ⚠️ Make sure `.gitignore` is in place before pushing — it excludes `.env` files and `node_modules`.

---

## Development Commands Reference

```bash
# From project root:
npm run install:all       # Install all dependencies
npm run dev               # Start backend + frontend
npm run dev:backend       # Backend only (port 4000)
npm run dev:frontend      # Frontend only (port 5173)
npm run docker:up         # Start Postgres + Redis
npm run docker:down       # Stop containers
npm run db:generate       # Regenerate Prisma client
npm run db:migrate        # Run pending migrations
npm run db:seed           # Seed example data
npm run db:studio         # Open Prisma Studio (DB GUI)
npm run build:frontend    # Build frontend for production
```

---

## Health Check

```
GET http://localhost:4000/api/v1/health         → liveness
GET http://localhost:4000/api/v1/health/ready   → readiness (DB + Redis)
GET http://localhost:4000/api/v1/health/metrics → memory + DB stats
```

---

## License

MIT — see LICENSE file.
