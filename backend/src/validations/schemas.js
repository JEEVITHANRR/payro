// src/validations/schemas.js — Zod validation schemas
const { z } = require('zod');

// ─── Auth ─────────────────────────────────────────────────────────
const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  email:     z.string().email(),
  password:  z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
  firstName: z.string().min(1).max(50),
  lastName:  z.string().min(1).max(50),
  role:      z.enum(['ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'EMPLOYEE', 'CFO', 'AUDITOR']).optional(),
  phone:     z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword:     z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number'
  ),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8),
});

// ─── Employee ─────────────────────────────────────────────────────
const createEmployeeSchema = z.object({
  firstName:       z.string().min(1).max(50),
  lastName:        z.string().min(1).max(50),
  email:           z.string().email(),
  phone:           z.string().optional(),
  title:           z.string().min(1),
  jobRole:         z.string().optional(),
  departmentId:    z.string().uuid(),
  organizationId:  z.string().uuid(),
  employmentType:  z.enum(['FULL_TIME', 'CONTRACTOR', 'PART_TIME']).default('FULL_TIME'),
  hireDate:        z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  baseSalary:      z.number().positive(),
  targetSalary:    z.number().positive().optional(),
  currency:        z.string().default('USD'),
  managerId:       z.string().uuid().optional(),
  dateOfBirth:     z.string().optional(),
  address:         z.record(z.any()).optional(),
  bankAccountInfo: z.record(z.any()).optional(),
  taxInfo:         z.record(z.any()).optional(),
});

const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  status: z.enum(['ACTIVE','ONBOARDING','OFFBOARDING','TERMINATED','ON_LEAVE','SUSPENDED']).optional(),
});

// ─── Payroll ──────────────────────────────────────────────────────
const createPayrollSchema = z.object({
  organizationId: z.string().uuid(),
  name:           z.string().min(1),
  periodStart:    z.string(),
  periodEnd:      z.string(),
  payDate:        z.string(),
  currency:       z.string().default('USD'),
  notes:          z.string().optional(),
});

const updatePayrollStatusSchema = z.object({
  status: z.enum(['DRAFT','PENDING_APPROVAL','APPROVED','PROCESSING','RELEASED','FAILED','CANCELLED']),
  notes:  z.string().optional(),
});

const payrollEntrySchema = z.object({
  employeeId: z.string().uuid(),
  baseSalary: z.number().positive(),
  overtime:   z.number().min(0).default(0),
  bonuses:    z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  taxWithheld:z.number().min(0).default(0),
  breakdown:  z.record(z.any()).optional(),
});

// ─── Department ───────────────────────────────────────────────────
const createDepartmentSchema = z.object({
  name:            z.string().min(1).max(100),
  code:            z.string().min(1).max(20).toUpperCase(),
  organizationId:  z.string().uuid(),
  budgetAllocated: z.number().min(0).optional(),
  headId:          z.string().uuid().optional(),
});

// ─── Expense ──────────────────────────────────────────────────────
const createExpenseSchema = z.object({
  employeeId:  z.string().uuid(),
  category:    z.string().min(1),
  amount:      z.number().positive(),
  currency:    z.string().default('USD'),
  description: z.string().min(1).max(500),
  receiptUrl:  z.string().url().optional(),
});

const updateExpenseStatusSchema = z.object({
  status:         z.enum(['APPROVED','REJECTED','UNDER_REVIEW','REIMBURSED']),
  rejectedReason: z.string().optional(),
});

// ─── Attendance ───────────────────────────────────────────────────
const createAttendanceSchema = z.object({
  employeeId:  z.string().uuid(),
  date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkIn:     z.string().datetime().optional(),
  checkOut:    z.string().datetime().optional(),
  status:      z.enum(['PRESENT','ABSENT','HALF_DAY','REMOTE','ON_LEAVE','HOLIDAY']).default('PRESENT'),
  hoursWorked: z.number().min(0).max(24).optional(),
  notes:       z.string().optional(),
});

// ─── Notification ─────────────────────────────────────────────────
const notificationSchema = z.object({
  userId:  z.string().uuid(),
  type:    z.string(),
  title:   z.string().min(1),
  message: z.string().min(1),
  data:    z.record(z.any()).optional(),
});

// ─── Validate middleware factory ──────────────────────────────────
function validate(schema) {
  return (req, res, next) => {
    try {
      req.validatedBody = schema.parse(req.body);
      next();
    } catch (err) {
      next(err); // ZodError → errorHandler
    }
  };
}

function validateQuery(schema) {
  return (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  loginSchema,
  registerSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  createPayrollSchema,
  updatePayrollStatusSchema,
  payrollEntrySchema,
  createDepartmentSchema,
  createExpenseSchema,
  updateExpenseStatusSchema,
  createAttendanceSchema,
  notificationSchema,
  validate,
  validateQuery,
};
