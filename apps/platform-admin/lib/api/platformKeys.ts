export const platformQueryKeys = {
  auth: {
    user: ["platform", "auth", "user"],
  },
  institutions: {
    all: (params?: any) => ["platform", "institutions", params],
    one: (id: string) => ["platform", "institutions", id],
  },
  faculties: {
    all: (params?: any) => ["platform", "faculties", params],
    one: (id: string) => ["platform", "faculties", id],
  },
  departments: {
    all: (params?: any) => ["platform", "departments", params],
    one: (id: string) => ["platform", "departments", id],
  },
  academicLevels: {
    all: (departmentId: string) => [
      "platform",
      "academic-levels",
      { departmentId },
    ],
  },
  academicSessions: {
    all: (institutionId: string) => [
      "platform",
      "academic-sessions",
      { institutionId },
    ],
  },
  organizations: {
    all: (params?: any) => ["platform", "organizations", params],
    one: (id: string) => ["platform", "organizations", id],
    members: (id: string, params?: any) => [
      "platform",
      "organizations",
      id,
      "members",
      params,
    ],
  },
  announcements: {
    all: (params?: any) => ["platform", "announcements", params],
    one: (id: string) => ["platform", "announcements", id],
  },
  users: {
    all: (params?: any) => ["platform", "users", params],
    one: (id: string) => ["platform", "users", id],
  },
  administrators: {
    all: ["platform", "administrators"],
  },
  featureFlags: {
    all: ["platform", "feature-flags"],
  },
  maintenance: {
    status: ["platform", "maintenance"],
  },
  auditLogs: {
    all: (params?: any) => ["platform", "audit-logs", params],
    summary: (params?: any) => ["platform", "audit-logs", "summary", params],
  },
  analytics: {
    dashboard: (params?: any) => ["platform", "analytics", "dashboard", params],
    revenue: (params?: any) => ["platform", "analytics", "revenue", params],
    growth: (params?: any) => ["platform", "analytics", "growth", params],
  },
  finance: {
    overview: (params?: any) => ["platform", "finance", "overview", params],
    transactions: (params?: any) => [
      "platform",
      "finance",
      "transactions",
      params,
    ],
    dues: (params?: any) => ["platform", "finance", "dues", params],
    receipts: (params?: any) => ["platform", "finance", "receipts", params],
    // NEW: Bank Accounts
    bankAccounts: (params?: any) => [
      "platform",
      "finance",
      "bank-accounts",
      params,
    ],
    bankAccount: (id: string) => ["platform", "finance", "bank-accounts", id],
    // NEW: Withdrawals
    withdrawals: (params?: any) => [
      "platform",
      "finance",
      "withdrawals",
      params,
    ],
    withdrawal: (id: string) => ["platform", "finance", "withdrawals", id],
    userWithdrawals: (params?: any) => [
      "platform",
      "finance",
      "withdrawals",
      "user",
      params,
    ],
    organizationWithdrawals: (params?: any) => [
      "platform",
      "finance",
      "withdrawals",
      "organization",
      params,
    ],
    platformWithdrawals: (params?: any) => [
      "platform",
      "finance",
      "withdrawals",
      "platform",
      params,
    ],
  },
  students: {
    all: (params?: any) => ["platform", "students", params],
    one: (id: string) => ["platform", "students", id],
    promotions: (id: string) => ["platform", "students", id, "promotions"],
    eligible: (params?: any) => ["platform", "students", "eligible", params],
  },
  roles: {
    all: (organizationId: string) => ["platform", "roles", organizationId],
    one: (id: string) => ["platform", "roles", id],
  },
  adminPermissions: {
    all: ["platform", "admin-permissions"],
    one: (id: string) => ["platform", "admin-permissions", id],
    keys: ["platform", "admin-permissions", "keys"],
  },
  permissions: {
    all: ["platform", "permissions"],
  },
};
