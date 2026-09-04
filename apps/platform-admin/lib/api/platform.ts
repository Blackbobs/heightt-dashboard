// src/lib/api/platform.ts

import {
  axiosConfig,
  clearCsrfToken,
  getCsrfToken,
} from "@/utils/axios-config";
import {
  // Institution types
  CreateInstitutionDto,
  UpdateInstitutionDto,
  InstitutionResponseDto,
  InstitutionListResponseDto,
  // Faculty types
  CreateFacultyDto,
  UpdateFacultyDto,
  FacultyResponseDto,
  // Department types
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
  // Academic Level types
  CreateAcademicLevelDto,
  AcademicLevelResponseDto,
  // Academic Session types
  CreateAcademicSessionDto,
  AcademicSessionResponseDto,
  InstitutionPromotionResult,
  // Organization types
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationListResponseDto,
  OrganizationMemberResponseDto,
  AddMemberDto,
  UpdateMemberDto,
  // Student types
  CreateStudentDto,
  UpdateStudentDto,
  StudentResponseDto,
  StudentListResponseDto,
  StudentPromotionResponseDto,
  PromoteStudentDto,
  BulkPromoteDto,
  // Finance types
  CreateDueDto,
  DueResponseDto,
  WithdrawalRequestDto,
  TransactionResponseDto,
  ReceiptResponseDto,
  FinanceOverviewResponseDto,
  // Announcement types
  CreateAnnouncementDto,
  UpdateAnnouncementDto,
  AnnouncementResponseDto,
  // RBAC types
  CreateRoleDto,
  UpdateRoleDto,
  RoleResponseDto,
  PermissionResponseDto,
  AssignRoleToUserDto,
  AssignAdminRoleDto,
  AdminResponseDto,
  // Platform types
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  FeatureFlagResponseDto,
  CreateMaintenanceDto,
  MaintenanceResponseDto,
  // User types
  UpdateUserDto,
  UpdateUserStatusDto,
  UserResponseDto,
  UserListResponseDto,
  // Audit types
  AuditLogResponseDto,
  AuditSummaryResponseDto,
  // Analytics types
  DashboardAnalyticsResponseDto,
  PlatformAdminDashboardResponseDto,
  RevenueAnalyticsResponseDto,
  GrowthAnalyticsResponseDto,
  // Auth types
  AuthResponseDto,
  // Pagination
  PaginatedResponse,
  // Bank Account types
  BankAccountResponseDto,
  BankAccountListResponseDto,
  CreateBankAccountDto,
  UpdateBankAccountDto,
  SupportedBankDto,
  ResolvedBankAccountDto,
  // Withdrawal types
  UserWithdrawalRequestDto,
  OrganizationWithdrawalRequestDto,
  PlatformWithdrawalRequestDto,
  WithdrawalResponseDto,
  WithdrawalListResponseDto,
  WithdrawalApproveResponseDto,
  WithdrawalRejectRequestDto,
  WithdrawalRejectResponseDto,
  WithdrawalFiltersDto,
  WithdrawalQuoteDto,
} from "./types";

export const platformApi = {
  // ============ Auth ============
  getCurrentUser: async (): Promise<UserResponseDto> => {
    const response = await axiosConfig.get("/v1/auth/me");
    return response.data;
  },

  login: async (
    identifier: string,
    password: string,
  ): Promise<AuthResponseDto> => {
    clearCsrfToken();
    await getCsrfToken(true);
    const response = await axiosConfig.post("/v1/auth/platform/login", {
      identifier,
      password,
    });
    const payload = response.data?.data ?? response.data;
    if (!payload?.accessToken) {
      throw new Error("Login succeeded without an access token");
    }
    return payload;
  },

  logout: async (): Promise<void> => {
    await axiosConfig.post("/v1/auth/platform/logout");
  },

  // ============ Institutions ============
  getInstitutions: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<InstitutionListResponseDto> => {
    const response = await axiosConfig.get("/v1/institutions", { params });
    return response.data;
  },

  getInstitution: async (id: string): Promise<InstitutionResponseDto> => {
    const response = await axiosConfig.get(`/v1/institutions/${id}`);
    return response.data;
  },

  createInstitution: async (
    data: CreateInstitutionDto,
  ): Promise<InstitutionResponseDto> => {
    const response = await axiosConfig.post("/v1/institutions", data);
    return response.data;
  },

  updateInstitution: async (
    id: string,
    data: UpdateInstitutionDto,
  ): Promise<InstitutionResponseDto> => {
    const response = await axiosConfig.patch(`/v1/institutions/${id}`, data);
    return response.data;
  },

  deleteInstitution: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/institutions/${id}`);
  },

  // ============ Faculties ============
  getFaculties: async (
    institutionId: string,
  ): Promise<FacultyResponseDto[]> => {
    const response = await axiosConfig.get(
      `/v1/institutions/${institutionId}/faculties`,
    );
    return response.data;
  },

  getFaculty: async (id: string): Promise<FacultyResponseDto> => {
    const response = await axiosConfig.get(`/v1/institutions/faculties/${id}`);
    return response.data;
  },

  createFaculty: async (
    data: CreateFacultyDto,
  ): Promise<FacultyResponseDto> => {
    const response = await axiosConfig.post("/v1/institutions/faculties", data);
    return response.data;
  },

  updateFaculty: async (
    id: string,
    data: UpdateFacultyDto,
  ): Promise<FacultyResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/institutions/faculties/${id}`,
      data,
    );
    return response.data;
  },

  deleteFaculty: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/institutions/faculties/${id}`);
  },

  // ============ Departments ============
  getDepartments: async (
    facultyId: string,
  ): Promise<DepartmentResponseDto[]> => {
    const response = await axiosConfig.get(
      `/v1/institutions/faculties/${facultyId}/departments`,
    );
    return response.data;
  },

  getDepartment: async (id: string): Promise<DepartmentResponseDto> => {
    const response = await axiosConfig.get(
      `/v1/institutions/departments/${id}`,
    );
    return response.data;
  },

  createDepartment: async (
    data: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/institutions/departments",
      data,
    );
    return response.data;
  },

  updateDepartment: async (
    id: string,
    data: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/institutions/departments/${id}`,
      data,
    );
    return response.data;
  },

  deleteDepartment: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/institutions/departments/${id}`);
  },

  // ============ Academic Levels ============
  getAcademicLevels: async (
    departmentId: string,
  ): Promise<AcademicLevelResponseDto[]> => {
    const response = await axiosConfig.get(
      `/v1/institutions/departments/${departmentId}/academic-levels`,
    );
    return response.data;
  },

  createAcademicLevel: async (
    data: CreateAcademicLevelDto,
  ): Promise<AcademicLevelResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/institutions/academic-levels",
      data,
    );
    return response.data;
  },

  deleteAcademicLevel: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/institutions/academic-levels/${id}`);
  },

  // ============ Academic Sessions ============
  getAcademicSessions: async (
    institutionId: string,
  ): Promise<AcademicSessionResponseDto[]> => {
    const response = await axiosConfig.get(
      `/v1/institutions/${institutionId}/academic-sessions`,
    );
    return response.data;
  },

  promoteInstitution: async (
    institutionId: string,
    currentSessionId: string,
    notes?: string,
  ): Promise<InstitutionPromotionResult> => {
    const response = await axiosConfig.post(
      `/v1/students/institutions/${encodeURIComponent(institutionId)}/promote`,
      { currentSessionId, ...(notes?.trim() ? { notes: notes.trim() } : {}) },
    );
    return response.data;
  },

  createAcademicSession: async (
    data: CreateAcademicSessionDto,
  ): Promise<AcademicSessionResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/institutions/academic-sessions",
      data,
    );
    return response.data;
  },

  updateAcademicSession: async (
    id: string,
    data: Partial<CreateAcademicSessionDto>,
  ): Promise<AcademicSessionResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/institutions/academic-sessions/${id}`,
      data,
    );
    return response.data;
  },

  deleteAcademicSession: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/institutions/academic-sessions/${id}`);
  },

  // ============ Organizations ============
  getOrganizations: async (params?: {
    page?: number;
    limit?: number;
    institutionId?: string;
    status?: string;
    type?: string;
    scope?: string;
    search?: string;
    parentId?: string;
  }): Promise<OrganizationListResponseDto> => {
    const response = await axiosConfig.get("/v1/organizations", { params });
    return response.data;
  },

  getOrganization: async (id: string): Promise<OrganizationResponseDto> => {
    const response = await axiosConfig.get(`/v1/organizations/${id}`);
    return response.data;
  },

  createOrganization: async (
    data: CreateOrganizationDto,
  ): Promise<OrganizationResponseDto> => {
    const response = await axiosConfig.post("/v1/organizations", data);
    return response.data;
  },

  updateOrganization: async (
    id: string,
    data: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> => {
    const response = await axiosConfig.patch(`/v1/organizations/${id}`, data);
    return response.data;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/organizations/${id}`);
  },

  activateOrganization: async (
    id: string,
  ): Promise<OrganizationResponseDto> => {
    const response = await axiosConfig.post(`/v1/organizations/${id}/activate`);
    return response.data;
  },

  archiveOrganization: async (id: string): Promise<OrganizationResponseDto> => {
    const response = await axiosConfig.post(`/v1/organizations/${id}/archive`);
    return response.data;
  },

  getOrganizationMembers: async (
    id: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      membershipType?: string;
      search?: string;
    },
  ): Promise<PaginatedResponse<OrganizationMemberResponseDto>> => {
    const response = await axiosConfig.get(`/v1/organizations/${id}/members`, {
      params,
    });
    return response.data;
  },

  addOrganizationMember: async (
    id: string,
    data: AddMemberDto,
  ): Promise<OrganizationMemberResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/organizations/${id}/members`,
      data,
    );
    return response.data;
  },

  updateOrganizationMember: async (
    membershipId: string,
    data: UpdateMemberDto,
  ): Promise<OrganizationMemberResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/organizations/members/${membershipId}`,
      data,
    );
    return response.data;
  },

  removeOrganizationMember: async (membershipId: string): Promise<void> => {
    await axiosConfig.delete(`/v1/organizations/members/${membershipId}`);
  },

  // ============ Students ============
  getStudents: async (params?: {
    page?: number;
    limit?: number;
    institutionId?: string;
    facultyId?: string;
    departmentId?: string;
    levelId?: string;
    status?: string;
    verificationStatus?: string;
    search?: string;
  }): Promise<StudentListResponseDto> => {
    const response = await axiosConfig.get("/v1/students", { params });
    return response.data;
  },

  getStudent: async (id: string): Promise<StudentResponseDto> => {
    const response = await axiosConfig.get(`/v1/students/${id}`);
    return response.data;
  },

  updateStudent: async (
    id: string,
    data: UpdateStudentDto,
  ): Promise<StudentResponseDto> => {
    const response = await axiosConfig.patch(`/v1/students/${id}`, data);
    return response.data;
  },

  promoteStudent: async (
    id: string,
    data: PromoteStudentDto,
  ): Promise<StudentPromotionResponseDto> => {
    const response = await axiosConfig.post(`/v1/students/${id}/promote`, data);
    return response.data;
  },

  bulkPromoteStudents: async (
    data: BulkPromoteDto,
  ): Promise<{ success: boolean; results: any[] }> => {
    const response = await axiosConfig.post(
      "/v1/students/promotions/bulk",
      data,
    );
    return response.data;
  },

  getEligibleStudents: async (params: {
    fromLevelId: string;
    departmentId?: string;
    page?: number;
    limit?: number;
  }): Promise<StudentListResponseDto> => {
    const response = await axiosConfig.get("/v1/students/promotions/eligible", {
      params,
    });
    return response.data;
  },

  getStudentPromotions: async (
    id: string,
  ): Promise<StudentPromotionResponseDto[]> => {
    const response = await axiosConfig.get(`/v1/students/${id}/promotions`);
    return response.data;
  },

  // ============ Finance ============
  getDues: async (params?: {
    organizationId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<DueResponseDto>> => {
    const response = await axiosConfig.get("/v1/finance/dues", { params });
    return response.data;
  },

  createDue: async (data: CreateDueDto): Promise<DueResponseDto> => {
    const response = await axiosConfig.post("/v1/finance/dues", data);
    return response.data;
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<TransactionResponseDto>> => {
    const response = await axiosConfig.get("/v1/finance/transactions", {
      params,
    });
    return response.data;
  },

  getReceipts: async (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    organizationId?: string;
  }): Promise<PaginatedResponse<ReceiptResponseDto>> => {
    const response = await axiosConfig.get("/v1/finance/receipts", { params });
    return response.data;
  },

  requestWithdrawal: async (data: WithdrawalRequestDto): Promise<void> => {
    await axiosConfig.post("/v1/finance/withdrawals/organization", data);
  },

  getFinanceOverview: async (params?: {
    institutionId?: string;
    organizationId?: string;
  }): Promise<FinanceOverviewResponseDto> => {
    const response = await axiosConfig.get("/v1/finance/reports/overview", {
      params,
    });
    return response.data;
  },

  exportPaymentsCsv: async (params?: {
    organizationId?: string;
    status?: string;
    payerId?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    axiosConfig.get<Blob>("/v1/finance/reports/payments.csv", {
      params,
      responseType: "blob",
    }),

  // ============ Announcements ============
  getAnnouncements: async (params?: {
    organizationId?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
    type?: string;
    priority?: string;
  }): Promise<PaginatedResponse<AnnouncementResponseDto>> => {
    const response = await axiosConfig.get("/v1/communication/announcements", {
      params,
    });
    return response.data;
  },

  getAnnouncement: async (id: string): Promise<AnnouncementResponseDto> => {
    const response = await axiosConfig.get(
      `/v1/communication/announcements/${id}`,
    );
    return response.data;
  },

  createAnnouncement: async (
    data: CreateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/communication/announcements",
      data,
    );
    return response.data;
  },

  updateAnnouncement: async (
    id: string,
    data: UpdateAnnouncementDto,
  ): Promise<AnnouncementResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/communication/announcements/${id}`,
      data,
    );
    return response.data;
  },

  deleteAnnouncement: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/communication/announcements/${id}`);
  },

  publishAnnouncement: async (id: string): Promise<void> => {
    await axiosConfig.post(`/v1/communication/announcements/${id}/publish`);
  },

  // ============ Users ============
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    email?: string;
    username?: string;
    status?: string;
    createdAfter?: string;
    createdBefore?: string;
    search?: string;
  }): Promise<UserListResponseDto> => {
    const response = await axiosConfig.get("/v1/users", { params });
    return response.data;
  },

  getUser: async (id: string): Promise<UserResponseDto> => {
    const response = await axiosConfig.get(`/v1/users/${id}`);
    return response.data;
  },

  getUserByEmail: async (email: string): Promise<UserResponseDto> => {
    const response = await axiosConfig.get(`/v1/users/email/${email}`);
    return response.data;
  },

  updateUser: async (
    id: string,
    data: UpdateUserDto,
  ): Promise<UserResponseDto> => {
    const response = await axiosConfig.patch(`/v1/users/${id}`, data);
    return response.data;
  },

  updateUserStatus: async (
    id: string,
    data: UpdateUserStatusDto,
  ): Promise<UserResponseDto> => {
    const response = await axiosConfig.patch(`/v1/users/${id}/status`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/users/${id}`);
  },

  // ============ RBAC ============
  getPermissions: async (): Promise<PermissionResponseDto[]> => {
    const response = await axiosConfig.get("/v1/rbac/permissions");
    return response.data;
  },

  getRoles: async (organizationId: string): Promise<RoleResponseDto[]> => {
    const response = await axiosConfig.get("/v1/rbac/roles", {
      params: { organizationId },
    });
    return response.data;
  },

  getRole: async (id: string): Promise<RoleResponseDto> => {
    const response = await axiosConfig.get(`/v1/rbac/roles/${id}`);
    return response.data;
  },

  createRole: async (data: CreateRoleDto): Promise<RoleResponseDto> => {
    const response = await axiosConfig.post("/v1/rbac/roles", data);
    return response.data;
  },

  updateRole: async (
    id: string,
    data: UpdateRoleDto,
  ): Promise<RoleResponseDto> => {
    const response = await axiosConfig.patch(`/v1/rbac/roles/${id}`, data);
    return response.data;
  },

  deleteRole: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/rbac/roles/${id}`);
  },

  assignRoleToUser: async (data: AssignRoleToUserDto): Promise<void> => {
    await axiosConfig.post("/v1/rbac/users/assign-role", data);
  },

  removeRoleFromUser: async (membershipRoleId: string): Promise<void> => {
    await axiosConfig.delete(`/v1/rbac/users/roles/${membershipRoleId}`);
  },

  getAdministrators: async (): Promise<AdminResponseDto[]> => {
    const response = await axiosConfig.get("/v1/rbac/admins");
    return response.data;
  },

  assignAdmin: async (data: AssignAdminRoleDto): Promise<AdminResponseDto> => {
    const response = await axiosConfig.post("/v1/rbac/admins/assign", data);
    return response.data;
  },

  revokeAdmin: async (adminId: string): Promise<void> => {
    await axiosConfig.post(`/v1/rbac/admins/${adminId}/revoke`);
  },

  // ============ ADMIN PERMISSIONS ============
  getAllPermissions: async (): Promise<PermissionResponseDto[]> => {
    const response = await axiosConfig.get("/v1/rbac/permissions");
    const payload = response.data;
    const permissions =
      payload?.data?.permissions ??
      payload?.data ??
      payload?.permissions ??
      payload;
    return Array.isArray(permissions) ? permissions : [];
  },

  getAdminWithPermissions: async (adminId: string): Promise<any> => {
    const response = await axiosConfig.get(
      `/v1/rbac/admins/${adminId}/permissions`,
    );
    return response.data?.data ?? response.data;
  },

  assignAdminWithPermissions: async (data: {
    userId: string;
    adminType: string;
    institutionId?: string;
    facultyId?: string;
    departmentId?: string;
    organizationId?: string;
    academicSessionId?: string;
    permissions?: string[];
  }): Promise<any> => {
    const response = await axiosConfig.post(
      "/v1/rbac/admins/assign-with-permissions",
      data,
    );
    return response.data;
  },

  updateAdminPermissions: async (
    adminId: string,
    data: { permissions: string[]; action: "ADD" | "REMOVE" | "SET" },
  ): Promise<any> => {
    const response = await axiosConfig.patch(
      `/v1/rbac/admins/${adminId}/permissions`,
      data,
    );
    return response.data;
  },

  // ============ Feature Flags ============
  getFeatureFlags: async (): Promise<FeatureFlagResponseDto[]> => {
    const response = await axiosConfig.get("/v1/platform/features");
    return response.data;
  },

  getFeatureFlag: async (key: string): Promise<FeatureFlagResponseDto> => {
    const response = await axiosConfig.get(`/v1/platform/features/${key}`);
    return response.data;
  },

  createFeatureFlag: async (
    data: CreateFeatureFlagDto,
  ): Promise<FeatureFlagResponseDto> => {
    const response = await axiosConfig.post("/v1/platform/features", data);
    return response.data;
  },

  updateFeatureFlag: async (
    id: string,
    data: UpdateFeatureFlagDto,
  ): Promise<FeatureFlagResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/platform/features/${id}`,
      data,
    );
    return response.data;
  },

  deleteFeatureFlag: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/platform/features/${id}`);
  },

  // ============ Maintenance ============
  getMaintenanceStatus: async (): Promise<MaintenanceResponseDto> => {
    const response = await axiosConfig.get("/v1/platform/maintenance");
    return response.data;
  },

  setMaintenanceMode: async (
    data: CreateMaintenanceDto,
  ): Promise<MaintenanceResponseDto> => {
    const response = await axiosConfig.post("/v1/platform/maintenance", data);
    return response.data;
  },

  // ============ Audit Logs ============
  getAuditLogs: async (params?: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    entity?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<AuditLogResponseDto>> => {
    const response = await axiosConfig.get("/v1/audit", { params });
    return response.data;
  },

  getAuditSummary: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<AuditSummaryResponseDto> => {
    const response = await axiosConfig.get("/v1/audit/summary", { params });
    return response.data;
  },

  // ============ Analytics ============
  getDashboardAnalytics: async (params?: {
    institutionId?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
  }): Promise<DashboardAnalyticsResponseDto> => {
    const response = await axiosConfig.get("/v1/analytics/dashboard", {
      params,
    });
    return response.data;
  },

  getPlatformAdminDashboard:
    async (): Promise<PlatformAdminDashboardResponseDto> => {
      const response = await axiosConfig.get("/v1/dashboard/platform-admin");
      return response.data;
    },

  getRevenueAnalytics: async (params?: {
    institutionId?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
  }): Promise<RevenueAnalyticsResponseDto> => {
    const response = await axiosConfig.get("/v1/analytics/revenue", { params });
    return response.data;
  },

  getGrowthAnalytics: async (params?: {
    institutionId?: string;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
    period?: string;
  }): Promise<GrowthAnalyticsResponseDto> => {
    const response = await axiosConfig.get("/v1/analytics/growth", { params });
    return response.data;
  },

  // ============ Bank Account Management ============
  getBankAccounts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<BankAccountListResponseDto> => {
    const response = await axiosConfig.get("/v1/finance/bank-accounts", {
      params,
    });

    if (Array.isArray(response.data)) {
      const accounts = response.data as BankAccountResponseDto[];
      const page = params?.page || 1;
      const limit = params?.limit || accounts.length || 10;

      return {
        data: accounts,
        meta: {
          page,
          limit,
          total: accounts.length,
          totalPages: Math.max(1, Math.ceil(accounts.length / limit)),
        },
      };
    }

    return response.data;
  },

  getBankAccount: async (id: string): Promise<BankAccountResponseDto> => {
    const response = await axiosConfig.get(`/v1/finance/bank-accounts/${id}`);
    return response.data;
  },

  getSupportedBanks: async (
    countryCode = "NG",
  ): Promise<SupportedBankDto[]> => {
    const response = await axiosConfig.get(
      "/v1/finance/bank-accounts/supported-banks",
      { params: { countryCode } },
    );
    const payload = response.data;
    const banks =
      payload?.data?.banks ?? payload?.data ?? payload?.banks ?? payload;
    if (!Array.isArray(banks)) return [];
    return banks.map((bank: SupportedBankDto) => ({
      ...bank,
      code: String(bank.code),
      nibss_bank_code:
        bank.nibss_bank_code == null ? null : String(bank.nibss_bank_code),
    }));
  },

  resolveBankAccount: async (data: {
    bankCode: string;
    accountNumber: string;
  }): Promise<ResolvedBankAccountDto> => {
    const response = await axiosConfig.post(
      "/v1/finance/bank-accounts/resolve",
      data,
    );
    const resolved = response.data?.data ?? response.data;
    return {
      accountNumber: resolved.accountNumber ?? resolved.account_number,
      accountName: resolved.accountName ?? resolved.account_name,
      bankCode: String(resolved.bankCode ?? resolved.bank_code),
      bankName: resolved.bankName ?? resolved.bank_name,
    };
  },

  createBankAccount: async (
    data: CreateBankAccountDto,
  ): Promise<BankAccountResponseDto> => {
    const response = await axiosConfig.post("/v1/finance/bank-accounts", data);
    return response.data?.data ?? response.data;
  },

  updateBankAccount: async (
    id: string,
    data: UpdateBankAccountDto,
  ): Promise<BankAccountResponseDto> => {
    const response = await axiosConfig.patch(
      `/v1/finance/bank-accounts/${id}`,
      data,
    );
    return response.data?.data ?? response.data;
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/finance/bank-accounts/${id}`);
  },

  registerPayoutDestination: async (
    id: string,
  ): Promise<BankAccountResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/bank-accounts/${id}/payout-destination`,
    );
    return response.data;
  },

  setDefaultBankAccount: async (id: string): Promise<{ message: string }> => {
    const response = await axiosConfig.post(
      `/v1/finance/bank-accounts/${id}/default`,
    );
    return response.data;
  },

  // ============ User Withdrawals ============
  getWithdrawalQuote: async (params: {
    type: "ORGANIZATION" | "PLATFORM";
    organizationId?: string;
    amount?: number;
  }): Promise<WithdrawalQuoteDto> => {
    const response = await axiosConfig.get("/v1/finance/withdrawals/quote", {
      params,
      headers: { "Cache-Control": "no-cache" },
    });
    return response.data;
  },

  requestUserWithdrawal: async (
    data: UserWithdrawalRequestDto,
  ): Promise<WithdrawalResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/finance/withdrawals/user",
      data,
    );
    return response.data;
  },

  approveUserWithdrawal: async (
    id: string,
  ): Promise<WithdrawalApproveResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/withdrawals/user/${id}/approve`,
    );
    return response.data;
  },

  rejectUserWithdrawal: async (
    id: string,
    data?: WithdrawalRejectRequestDto,
  ): Promise<WithdrawalRejectResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/withdrawals/user/${id}/reject`,
      data,
    );
    return response.data;
  },

  // ============ Organization Withdrawals ============
  requestOrganizationWithdrawal: async (
    data: OrganizationWithdrawalRequestDto,
  ): Promise<WithdrawalResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/finance/withdrawals/organization",
      data,
    );
    return response.data;
  },

  approveOrganizationWithdrawal: async (
    id: string,
  ): Promise<WithdrawalApproveResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/withdrawals/organization/${id}/approve`,
    );
    return response.data;
  },

  rejectOrganizationWithdrawal: async (
    id: string,
    data?: WithdrawalRejectRequestDto,
  ): Promise<WithdrawalRejectResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/withdrawals/organization/${id}/reject`,
      data,
    );
    return response.data;
  },

  // ============ Platform Withdrawals ============
  requestPlatformWithdrawal: async (
    data: PlatformWithdrawalRequestDto,
  ): Promise<WithdrawalResponseDto> => {
    const response = await axiosConfig.post(
      "/v1/finance/withdrawals/platform",
      data,
    );
    return response.data;
  },

  approvePlatformWithdrawal: async (
    id: string,
  ): Promise<WithdrawalApproveResponseDto> => {
    const response = await axiosConfig.post(
      `/v1/finance/withdrawals/platform/${id}/approve`,
    );
    return response.data;
  },

  // ============ Withdrawal History ============
  getWithdrawals: async (
    params?: WithdrawalFiltersDto,
  ): Promise<WithdrawalListResponseDto> => {
    const endpoint =
      params?.type === "ORGANIZATION"
        ? "/v1/finance/withdrawals/admin"
        : "/v1/finance/withdrawals";
    const response = await axiosConfig.get(endpoint, {
      params,
    });
    return response.data;
  },

  getPendingOrganizationWithdrawals: async (params?: {
    status?: WithdrawalFiltersDto["status"];
    page?: number;
    limit?: number;
  }): Promise<WithdrawalListResponseDto> => {
    const response = await axiosConfig.get("/v1/finance/withdrawals/admin", {
      params: { ...params, type: "ORGANIZATION" },
    });
    return response.data;
  },

  getWithdrawal: async (id: string): Promise<WithdrawalResponseDto> => {
    const response = await axiosConfig.get(`/v1/finance/withdrawals/${id}`);
    return response.data;
  },
};

export type {
  AcademicLevelResponseDto as AcademicLevel,
  AcademicSessionResponseDto as AcademicSession,
  InstitutionPromotionResult,
  AnnouncementResponseDto as Announcement,
  DepartmentResponseDto as Department,
  FacultyResponseDto as Faculty,
  FeatureFlagResponseDto as FeatureFlag,
  InstitutionResponseDto as Institution,
  MaintenanceResponseDto as MaintenanceMode,
  OrganizationResponseDto as Organization,
  OrganizationMemberResponseDto as OrganizationMember,
  UserResponseDto as User,
} from "./types";

export * from "./types";
