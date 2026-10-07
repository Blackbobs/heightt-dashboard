/**
 * Builds a key for a list endpoint, dropping the trailing filter segment when
 * the caller passes none. A key that ends in `undefined` matches nothing, so
 * `all()` would silently fail to invalidate any filtered list query.
 */
const keyWithFilters = (base: string[], params?: unknown): unknown[] =>
  params === undefined ? base : [...base, params];

export const platformQueryKeys = {
  auth: {
    user: ["platform", "auth", "user"],
  },
  institutions: {
    all: (params?: any) => keyWithFilters(["platform", "institutions"], params),
    one: (id: string) => ["platform", "institutions", id],
  },
  faculties: {
    all: (params?: any) => keyWithFilters(["platform", "faculties"], params),
    one: (id: string) => ["platform", "faculties", id],
  },
  departments: {
    all: (params?: any) => keyWithFilters(["platform", "departments"], params),
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
    all: (params?: any) => keyWithFilters(["platform", "organizations"], params),
    one: (id: string) => ["platform", "organizations", id],
    members: (id: string, params?: any) =>
      keyWithFilters(["platform", "organizations", id, "members"], params),
  },
  announcements: {
    all: (params?: any) => keyWithFilters(["platform", "announcements"], params),
    one: (id: string) => ["platform", "announcements", id],
  },
  users: {
    all: (params?: any) => keyWithFilters(["platform", "users"], params),
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
    all: (params?: any) => keyWithFilters(["platform", "audit-logs"], params),
    summary: (params?: any) =>
      keyWithFilters(["platform", "audit-logs", "summary"], params),
  },
  analytics: {
    dashboard: (params?: any) =>
      keyWithFilters(["platform", "analytics", "dashboard"], params),
    revenue: (params?: any) =>
      keyWithFilters(["platform", "analytics", "revenue"], params),
    growth: (params?: any) =>
      keyWithFilters(["platform", "analytics", "growth"], params),
  },
  finance: {
    overview: (params?: any) =>
      keyWithFilters(["platform", "finance", "overview"], params),
    transactions: (params?: any) =>
      keyWithFilters(["platform", "finance", "transactions"], params),
    dues: (params?: any) => keyWithFilters(["platform", "finance", "dues"], params),
    receipts: (params?: any) =>
      keyWithFilters(["platform", "finance", "receipts"], params),
    // NEW: Bank Accounts
    bankAccounts: (params?: any) =>
      keyWithFilters(["platform", "finance", "bank-accounts"], params),
    bankAccount: (id: string) => ["platform", "finance", "bank-accounts", id],
    // NEW: Withdrawals
    withdrawals: (params?: any) =>
      keyWithFilters(["platform", "finance", "withdrawals"], params),
    withdrawal: (id: string) => ["platform", "finance", "withdrawals", id],
    userWithdrawals: (params?: any) =>
      keyWithFilters(["platform", "finance", "withdrawals", "user"], params),
    organizationWithdrawals: (params?: any) =>
      keyWithFilters(
        ["platform", "finance", "withdrawals", "organization"],
        params,
      ),
    platformWithdrawals: (params?: any) =>
      keyWithFilters(["platform", "finance", "withdrawals", "platform"], params),
  },
  students: {
    all: (params?: any) => keyWithFilters(["platform", "students"], params),
    one: (id: string) => ["platform", "students", id],
    promotions: (id: string) => ["platform", "students", id, "promotions"],
    eligible: (params?: any) =>
      keyWithFilters(["platform", "students", "eligible"], params),
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
