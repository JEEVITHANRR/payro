// prisma/seed.js — Development seed data for Payro
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Payro database...');

  // Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'techflow' },
    update: {},
    create: {
      id: 'org-techflow-001',
      name: 'TechFlow',
      slug: 'techflow',
      legalName: 'TechFlow Technologies Inc.',
      taxId: 'EIN-12-3456789',
      currency: 'USD',
      timezone: 'America/New_York',
      industry: 'Technology',
      size: 'ENTERPRISE',
    },
  });

  // Departments
  await Promise.all([
    prisma.department.upsert({
      where: { id: 'dept-ops' },
      update: {},
      create: {
        id: 'dept-ops',
        organizationId: org.id,
        name: 'Operations',
        code: 'OPS',
        budgetAllocated: 500000,
        budgetUsed: 412000,
        headcount: 124,
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-eng' },
      update: {},
      create: {
        id: 'dept-eng',
        organizationId: org.id,
        name: 'Engineering Hub',
        code: 'ENG',
        budgetAllocated: 800000,
        budgetUsed: 685390,
        headcount: 312,
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-product' },
      update: {},
      create: {
        id: 'dept-product',
        organizationId: org.id,
        name: 'Product & Design',
        code: 'PRD',
        budgetAllocated: 350000,
        budgetUsed: 151000,
        headcount: 87,
      },
    }),
    prisma.department.upsert({
      where: { id: 'dept-finance' },
      update: {},
      create: {
        id: 'dept-finance',
        organizationId: org.id,
        name: 'Finance',
        code: 'FIN',
        budgetAllocated: 300000,
        budgetUsed: 245000,
        headcount: 45,
      },
    }),
  ]);

  // Admin user (CFO - Alexander Vance from frontend)
  const adminPassword = await bcrypt.hash('Admin@Payro2024!', 12);
  const adminUser = await prisma.user.upsert({
    where: { email: 'alexander.vance@techflow.com' },
    update: {},
    create: {
      id: 'user-admin-001',
      email: 'alexander.vance@techflow.com',
      passwordHash: adminPassword,
      role: 'CFO',
      firstName: 'Alexander',
      lastName: 'Vance',
      isEmailVerified: true,
      isActive: true,
    },
  });

  // HR Manager
  const hrPassword = await bcrypt.hash('HrAdmin@2024!', 12);
  await prisma.user.upsert({
    where: { email: 'hr@techflow.com' },
    update: {},
    create: {
      email: 'hr@techflow.com',
      passwordHash: hrPassword,
      role: 'HR_MANAGER',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      isEmailVerified: true,
    },
  });

  // Sample employees
  const employees = [
    {
      id: 'emp-alex-rivera',
      employeeId: 'PAY-7821',
      organizationId: org.id,
      departmentId: 'dept-product',
      firstName: 'Alex',
      lastName: 'Rivera',
      email: 'alex.rivera@techflow.com',
      title: 'Senior UX Designer',
      jobRole: 'Designer',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      hireDate: new Date('2022-03-15'),
      baseSalary: 145000,
      targetSalary: 160000,
    },
    {
      id: 'emp-sarah-chen',
      employeeId: 'PAY-9023',
      organizationId: org.id,
      departmentId: 'dept-eng',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@techflow.com',
      title: 'Head of Engineering',
      jobRole: 'Engineering Lead',
      employmentType: 'FULL_TIME',
      status: 'ONBOARDING',
      hireDate: new Date('2024-08-01'),
      baseSalary: 210000,
      targetSalary: 250000,
    },
    {
      id: 'emp-marcus-thorne',
      employeeId: 'PAY-3412',
      organizationId: org.id,
      departmentId: 'dept-eng',
      firstName: 'Marcus',
      lastName: 'Thorne',
      email: 'marcus.thorne@techflow.com',
      title: 'Backend Specialist',
      jobRole: 'Infrastructure',
      employmentType: 'FULL_TIME',
      status: 'OFFBOARDING',
      hireDate: new Date('2019-06-01'),
      terminationDate: new Date('2024-09-01'),
      baseSalary: 110000,
      targetSalary: 110000,
    },
    {
      id: 'emp-elena-vance',
      employeeId: 'PAY-1104',
      organizationId: org.id,
      departmentId: 'dept-finance',
      firstName: 'Elena',
      lastName: 'Vance',
      email: 'elena.vance@techflow.com',
      title: 'Principal Analyst',
      jobRole: 'Financial Analysis',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      hireDate: new Date('2020-01-10'),
      promotedAt: new Date('2024-08-14'),
      baseSalary: 135000,
      targetSalary: 150000,
    },
    {
      id: 'emp-jordan-mills',
      employeeId: 'PAY-2205',
      organizationId: org.id,
      departmentId: 'dept-product',
      firstName: 'Jordan',
      lastName: 'Mills',
      email: 'jordan.mills@techflow.com',
      title: 'Creative Director',
      jobRole: 'Design Leadership',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      hireDate: new Date('2021-04-01'),
      baseSalary: 165000,
      targetSalary: 180000,
    },
    {
      id: 'emp-david-ko',
      employeeId: 'PAY-0099',
      organizationId: org.id,
      departmentId: 'dept-finance',
      firstName: 'David',
      lastName: 'Ko',
      email: 'david.ko@techflow.com',
      title: 'VP Finance',
      jobRole: 'Finance Leadership',
      employmentType: 'FULL_TIME',
      status: 'ACTIVE',
      hireDate: new Date('2018-09-01'),
      baseSalary: 220000,
      targetSalary: 240000,
    },
  ];

  for (const emp of employees) {
    await prisma.employee.upsert({
      where: { id: emp.id },
      update: {},
      create: emp,
    });
  }

  // Latest payroll run
  const payrollRun = await prisma.payrollRun.upsert({
    where: { id: 'payroll-aug-2024' },
    update: {},
    create: {
      id: 'payroll-aug-2024',
      organizationId: org.id,
      name: 'August 2024 Payroll',
      periodStart: new Date('2024-08-01'),
      periodEnd: new Date('2024-08-31'),
      payDate: new Date('2024-08-14'),
      status: 'PROCESSING',
      totalGross: 1395000,
      totalDeductions: 146610,
      totalNet: 1248390,
      totalTax: 151204,
      employeeCount: 1284,
      currency: 'USD',
    },
  });

  // AI Insights
  await prisma.aIInsight.upsert({
    where: { id: 'insight-001' },
    update: {},
    create: {
      id: 'insight-001',
      organizationId: org.id,
      type: 'TAX_OPTIMIZATION',
      severity: 'OPPORTUNITY',
      title: 'Contractor Tax Allocation Optimization',
      message: 'System suggests a 4.2% optimization in contractor tax allocations for the North America region.',
      recommendation: 'Reclassify 12 contractors to benefit from Q4 tax brackets. Estimated annual saving: $52,400.',
      confidence: 98,
      potentialSaving: 52400,
      affectedRegion: 'North America',
      affectedCount: 12,
      isActive: true,
    },
  });

  await prisma.aIInsight.create({
    data: {
      organizationId: org.id,
      type: 'COMPLIANCE_RISK',
      severity: 'WARNING',
      title: 'UK NI Threshold Update Detected',
      message: 'New National Insurance thresholds detected for Q4 2024. Auto-adjustment available.',
      recommendation: 'Apply updated NI bands for 23 UK-based employees effective October 2024.',
      confidence: 99,
      affectedRegion: 'EMEA - United Kingdom',
      affectedCount: 23,
      isActive: true,
    },
  });

  // Notifications for admin user
  const notificationData = [
    {
      userId: adminUser.id,
      type: 'PAYROLL_PROCESSING',
      title: 'Salary disbursement initiated',
      message: 'Salary disbursement initiated for Regional HQ. Processing 312 payments.',
    },
    {
      userId: adminUser.id,
      type: 'NEW_EMPLOYEE',
      title: 'New employee onboarded',
      message: 'Sarah Jenkins has been successfully onboarded to the Engineering Hub.',
    },
    {
      userId: adminUser.id,
      type: 'SECURITY_ALERT',
      title: 'Security patch applied',
      message: 'Security patch v2.1.4 has been applied to the Payment Gateway.',
    },
    {
      userId: adminUser.id,
      type: 'AI_INSIGHT',
      title: 'New AI Insight Available',
      message: 'High-confidence tax optimization opportunity identified. Potential saving: $52,400.',
    },
  ];

  for (const n of notificationData) {
    await prisma.notification.create({ data: n });
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      actorId: adminUser.id,
      action: 'RUN_PAYROLL',
      entity: 'PayrollRun',
      entityId: payrollRun.id,
      metadata: { period: 'August 2024', amount: 1248390 },
    },
  });

  console.log('✅ Seed complete!');
  console.log('');
  console.log('📧 Admin login: alexander.vance@techflow.com');
  console.log('🔑 Password:    Admin@Payro2024!');
  console.log('');
  console.log('📧 HR login:    hr@techflow.com');
  console.log('🔑 Password:    HrAdmin@2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
