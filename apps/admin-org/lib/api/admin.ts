// apps/admin-org/lib/api/admin.ts
import {
  axiosConfig,
  clearCsrfToken,
  getCsrfToken,
} from "@/utils/axios-config";

// ============ Auth Types ============
export interface LoginResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
  verificationStatus: string;
  onboardingStep: string;
  accessToken: string;
  refreshToken: string;
  message: string;
  // Role info returned by the backend login response
  isPlatformAdmin?: boolean;
  adminTypes?: string[];
  userType?: string;
  roles?: string[];
  isAdminSession?: boolean;
  highestAdminType?: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  avatar?: string;
  gender?: string;
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  bio?: string;
  onboardingStep: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  verificationStatus: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  id: string;
  userId: string;
  institutionId: string;
  facultyId: string;
  departmentId: string;
  currentAcademicLevelId?: string;
  matricNumber?: string;
  academicStatus: string;
  onboardingStep: string;
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string;
  verificationStatus: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  institution?: { id: string; name: string; shortName: string };
  faculty?: { id: string; name: string };
  department?: { id: string; name: string };
  currentAcademicLevel?: { id: string; name: string; numericLevel: number };
}

export interface User {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  status: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile: UserProfile;
  studentProfile?: StudentProfile;
}

export interface AdminScope {
  id: string;
  adminType:
    | "PLATFORM_ADMIN"
    | "INSTITUTION_ADMIN"
    | "FACULTY_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "CLUB_ADMIN";
  status?: string;
  organizationId?: string;
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  academicLevelId?: string;
  academicSessionId?: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    type: string;
  };
  institution?: {
    id: string;
    name: string;
    shortName: string;
  };
  faculty?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

export interface AdminUser extends User {
  adminScopes: AdminScope[];
  activeOrganizationId?: string;
  userType?: string;
  roles?: string[];
  adminTypes?: string[];
  isPlatformAdmin?: boolean;
  isAdminSession?: boolean;
  highestAdminType?: string;
}

export interface AcademicSession {
  id: string;
  institutionId: string;
  name: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  scope: "INSTITUTION" | "FACULTY" | "DEPARTMENT" | "LEVEL";
  isCurrent: boolean;
  startDate: string;
  endDate: string;
}

export interface InstitutionPromotionResult {
  institution: { id: string; name: string };
  previousSession: { id: string; name: string };
  currentSession: { id: string; name: string; generated: boolean };
  summary: { eligible: number; promoted: number; graduated: number; skipped: number };
}

// ============ Student Types ============
export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  institutionId: string;
  institutionName?: string;
  facultyId: string;
  facultyName?: string;
  departmentId: string;
  departmentName?: string;
  currentAcademicLevelId?: string;
  currentAcademicLevelName?: string;
  matricNumber?: string;
  academicStatus: string;
  onboardingCompleted: boolean;
  verificationStatus: string;
  createdAt: string;
  academicRecords?: any[];
  promotions?: any[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Finance Types ============
export interface Wallet {
  id: string;
  userId?: string;
  organizationId?: string;
  balance: number;
  heldBalance: number;
  currency: string;
  status: string;
}

export interface Due {
  id: string;
  organizationId: string;
  sessionId?: string;
  name: string;
  description?: string;
  amount: number;
  isRequired: boolean;
  status: "ACTIVE" | "INACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string; slug: string };
}

export interface Transaction {
  id: string;
  walletId: string;
  type: "CREDIT" | "DEBIT" | "TRANSFER" | "FEE" | "REFUND" | "REVERSAL";
  amount: number;
  fee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  reference: string;
  description?: string;
  completedAt?: string;
  createdAt: string;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  reference: string;
  amount: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  paymentMethod: string;
  paymentDate: string;
  description?: string;
  organizationName?: string;
  status: "ISSUED" | "VOIDED" | "CANCELLED";
  downloadCount: number;
  lastDownloaded?: string;
  createdAt: string;
}

export type PaymentHistoryStatus =
  "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "EXPIRED" | "CANCELLED";

export interface PaymentHistoryRecord {
  id: string;
  amount: number;
  status: PaymentHistoryStatus;
  reference?: string;
  createdAt: string;
  updatedAt?: string;
  transaction?: Transaction | null;
  organization?: {
    id: string;
    name: string;
    slug?: string;
    type?: string;
  } | null;
  payer?: {
    id: string;
    email?: string;
    username?: string;
    profile?: {
      firstName?: string;
      lastName?: string;
    } | null;
  } | null;
  duePayment?: {
    assignment?: {
      due?: Due | null;
    } | null;
  } | null;
  receipt?: Receipt | null;
}

export interface FinancialOverview {
  totalCollections: number;
  totalTransactions: number;
  totalPayments: number;
  totalOutstanding: number;
  totalWithdrawals: number;
  totalDues?: number;
  pendingDues?: number;
  completedDues?: number;
  totalStudents?: number;
  activeStudents?: number;
  balance?: number;
}

export interface OrganizationFinanceOverview {
  organization: {
    id: string;
    name: string;
    slug?: string;
    type?: string;
    status?: string;
  };
  wallet: {
    balance: number;
    heldBalance: number;
    availableBalance: number;
    currency: string;
    status: string;
  };
  transactions: {
    total: number;
  };
  collections: {
    totalAmount: number;
    completedCount: number;
    serviceFees: number;
    pendingAmount: number;
    pendingCount: number;
  };
  dues: {
    createdCount: number;
    faceValue: number;
    assignedCount: number;
    totalExpected: number;
    totalCollected: number;
    completedPayments: number;
    pendingAssignments: number;
  };
  generatedAt: string;
}

// ============ Announcement Types ============
export interface Announcement {
  id: string;
  organizationId: string;
  authorId?: string;
  title: string;
  content: string;
  type: "GENERAL" | "IMPORTANT" | "URGENT" | "FINANCIAL" | "ACADEMIC" | "EVENT";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  isPublished: boolean;
  publishedAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  organization?: { id: string; name: string; slug: string };
  author?: {
    id: string;
    username: string;
    profile?: { firstName: string; lastName: string };
  };
}

// ============ Dashboard Stats ============
export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  pendingVerifications: number;
  totalDues: number;
  activeDues: number;
  totalCollections: number;
  pendingPayments: number;
  walletBalance: number;
  recentTransactions: Transaction[];
  recentAnnouncements: Announcement[];
}

// ============ Organization Types ============
export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  membershipType: string;
  status: string;
  isPrimary: boolean;
  joinedAt: string;
  joinedSessionId?: string | null;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: string;
  };
}

// ============ Bank Account Types ============
export interface BankAccount {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  isDefault: boolean;
  payoutDestinationStatus?: "pending_review" | "approved" | "rejected";
  payoutDestinationUsable?: boolean;
  payoutDestination?: {
    status?: "pending_review" | "approved" | "rejected";
    usable?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SupportedBank {
  name: string;
  slug: string;
  code: string;
  nibss_bank_code?: string | null;
  country: string;
}

export interface ResolvedBankAccount {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

// ============ Withdrawal Types ============
export interface Withdrawal {
  id: string;
  userId: string;
  walletId: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  metadata?: {
    type: string;
    bankAccountId?: string;
    reason?: string;
    organizationId?: string;
  };
}

// ============ API Services ============
export const adminApi = {
  // ============ Auth ============
  getCurrentUser: async (): Promise<AdminUser> => {
    const response = await axiosConfig.get("/v1/auth/me");
    return response.data;
  },

  login: async (
    identifier: string,
    password: string,
  ): Promise<LoginResponse> => {
    clearCsrfToken();
    await getCsrfToken(true);
    const response = await axiosConfig.post("/v1/auth/login", {
      identifier,
      password,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axiosConfig.post("/v1/auth/logout");
  },

  logoutAll: async (): Promise<void> => {
    await axiosConfig.post("/v1/auth/logout-all");
  },

  // ============ Dashboard ============
  getDashboardStats: async (
    organizationId: string,
  ): Promise<DashboardStats> => {
    const [
      studentsRes,
      duesRes,
      financeRes,
      transactionsRes,
      announcementsRes,
    ] = await Promise.all([
      axiosConfig.get("/v1/students", {
        params: { organizationId, limit: 1 },
      }),
      axiosConfig.get("/v1/finance/dues", {
        params: { organizationId, limit: 100 },
      }),
      axiosConfig.get("/v1/finance/wallet/organization/" + organizationId),
      axiosConfig.get("/v1/finance/transactions", {
        params: { organizationId, limit: 10 },
      }),
      axiosConfig.get("/v1/communication/announcements", {
        params: { organizationId, limit: 5, isPublished: true },
      }),
    ]);

    const students = studentsRes.data;
    const dues = duesRes.data;
    const wallet = financeRes.data;
    const transactions = transactionsRes.data;
    const announcements = announcementsRes.data;

    const totalStudents = students.meta?.total || 0;
    const activeStudents =
      students.data?.filter((s: any) => s.academicStatus === "ACTIVE").length ||
      0;
    const totalDues = dues.data?.length || 0;
    const activeDues =
      dues.data?.filter((d: any) => d.status === "ACTIVE").length || 0;
    const pendingPayments =
      dues.data?.filter((d: any) => d.status === "ACTIVE").length || 0;
    const walletBalance = wallet?.balance || 0;

    return {
      totalStudents,
      activeStudents,
      pendingVerifications: 0,
      totalDues,
      activeDues,
      totalCollections: walletBalance,
      pendingPayments,
      walletBalance,
      recentTransactions: transactions.data || [],
      recentAnnouncements: announcements.data || [],
    };
  },

  // ============ Students ============
  getStudents: async (params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
    institutionId?: string;
    facultyId?: string;
    departmentId?: string;
    levelId?: string;
    status?: string;
    verificationStatus?: string;
    search?: string;
  }): Promise<PaginatedResponse<Student>> => {
    const response = await axiosConfig.get("/v1/students", { params });
    return response.data;
  },

  getStudent: async (id: string): Promise<Student> => {
    const response = await axiosConfig.get(`/v1/students/${id}`);
    return response.data;
  },

  createStudent: async (data: any): Promise<Student> => {
    const response = await axiosConfig.post("/v1/students", data);
    return response.data;
  },

  updateStudent: async (id: string, data: any): Promise<Student> => {
    const response = await axiosConfig.patch(`/v1/students/${id}`, data);
    return response.data;
  },

  deleteStudent: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/students/${id}`);
  },

  getStudentPromotions: async (id: string): Promise<any[]> => {
    const response = await axiosConfig.get(`/v1/students/${id}/promotions`);
    return response.data;
  },

  getInstitutionSessions: async (institutionId: string): Promise<AcademicSession[]> => {
    const response = await axiosConfig.get(`/v1/institutions/${encodeURIComponent(institutionId)}/academic-sessions`);
    return response.data;
  },

  promoteInstitution: async (institutionId: string, currentSessionId: string, notes?: string): Promise<InstitutionPromotionResult> => {
    const response = await axiosConfig.post(`/v1/students/institutions/${encodeURIComponent(institutionId)}/promote`, {
      currentSessionId,
      ...(notes?.trim() ? { notes: notes.trim() } : {}),
    });
    return response.data;
  },

  getStudentDashboard: async (): Promise<any> => {
    const response = await axiosConfig.get("/v1/students/me");
    return response.data;
  },

  getAdminDashboard: async (params?: {
    organizationId?: string;
  }): Promise<any> => {
    const response = await axiosConfig.get("/v1/students/admin-dashboard", {
      params,
    });
    return response.data;
  },

  // ============ Finance ============
  getWallet: async (organizationId: string): Promise<Wallet> => {
    const response = await axiosConfig.get(
      `/v1/finance/wallet/organization/${organizationId}`,
    );
    return response.data;
  },

  getDues: async (params?: {
    organizationId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Due>> => {
    const response = await axiosConfig.get("/v1/finance/dues", { params });
    return response.data;
  },

  createDue: async (data: any): Promise<Due> => {
    const response = await axiosConfig.post("/v1/finance/dues", data);
    return response.data;
  },

  assignDue: async (id: string, data: any): Promise<void> => {
    await axiosConfig.post(`/v1/finance/dues/${id}/assign`, data);
  },

  deleteDue: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/finance/dues/${id}`);
  },

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Transaction>> => {
    const response = await axiosConfig.get("/v1/finance/transactions", {
      params,
    });
    return response.data;
  },

  getReceipts: async (params?: {
    page?: number;
    limit?: number;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Receipt>> => {
    const response = await axiosConfig.get("/v1/finance/receipts", { params });
    return response.data;
  },

  getAdminPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
    status?: PaymentHistoryStatus;
    organizationId?: string;
    payerId?: string;
  }): Promise<PaginatedResponse<PaymentHistoryRecord>> => {
    const response = await axiosConfig.get(
      "/v1/finance/payments/history/admin",
      {
        params,
      },
    );
    return response.data;
  },

  getOrganizationFinanceOverview: async (
    organizationId: string,
  ): Promise<OrganizationFinanceOverview> => {
    const response = await axiosConfig.get(
      `/v1/finance/organizations/${organizationId}/overview`,
    );
    return response.data;
  },

  getFinancialOverview: async (
    organizationId: string,
  ): Promise<FinancialOverview> => {
    const [walletRes, duesRes, transactionsRes] = await Promise.all([
      axiosConfig.get(`/v1/finance/wallet/organization/${organizationId}`),
      axiosConfig.get("/v1/finance/dues", {
        params: { organizationId, limit: 100 },
      }),
      axiosConfig.get("/v1/finance/transactions", {
        params: { organizationId, limit: 100 },
      }),
    ]);

    const wallet = walletRes.data;
    const dues = duesRes.data;
    const transactions = transactionsRes.data;

    const totalCollections = wallet?.balance || 0;
    const totalTransactions = transactions.meta?.total || 0;
    const totalDues = dues.data?.length || 0;
    const pendingDues =
      dues.data?.filter((d: any) => d.status === "ACTIVE").length || 0;
    const completedDues =
      dues.data?.filter((d: any) => d.status === "COMPLETED").length || 0;

    return {
      totalCollections,
      totalTransactions,
      totalPayments: 0,
      totalOutstanding: pendingDues * (dues.data?.[0]?.amount || 0),
      totalWithdrawals: 0,
      totalDues,
      pendingDues,
      completedDues,
      balance: wallet?.balance || 0,
    };
  },

  getFinanceDashboard: async (organizationId: string): Promise<any> => {
    const response = await axiosConfig.get(
      `/v1/finance/organizations/${organizationId}/dashboard`,
    );
    return response.data;
  },

  requestWithdrawal: async (data: {
    organizationId: string;
    bankAccountId: string;
    amount: number;
    reason?: string;
  }): Promise<Withdrawal> => {
    const response = await axiosConfig.post(
      "/v1/finance/withdrawals/organization",
      data,
    );
    return response.data;
  },

  getWithdrawals: async (params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
    organizationId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Withdrawal>> => {
    const response = await axiosConfig.get("/v1/finance/withdrawals", {
      params,
    });
    return response.data;
  },

  getWithdrawal: async (id: string): Promise<Withdrawal> => {
    const response = await axiosConfig.get(`/v1/finance/withdrawals/${id}`);
    return response.data;
  },

  // ============ Bank Accounts ============
  getBankAccounts: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<BankAccount>> => {
    const response = await axiosConfig.get("/v1/finance/bank-accounts", {
      params,
    });

    // The backend may return either `{ data, meta }` (paginated) or a plain
    // array of bank accounts. Normalize the plain array so the UI can always
    // read `.data` and `.meta` (fixes an empty page for the array shape).
    if (Array.isArray(response.data)) {
      const bankAccounts = response.data as BankAccount[];
      const page = params?.page || 1;
      const limit = params?.limit || bankAccounts.length || 10;
      return {
        data: bankAccounts,
        meta: {
          page,
          limit,
          total: bankAccounts.length,
          totalPages: Math.max(1, Math.ceil(bankAccounts.length / limit)),
        },
      };
    }

    return response.data;
  },

  getBankAccount: async (id: string): Promise<BankAccount> => {
    const response = await axiosConfig.get(`/v1/finance/bank-accounts/${id}`);
    return response.data;
  },

  getSupportedBanks: async (countryCode = "NG"): Promise<SupportedBank[]> => {
    const response = await axiosConfig.get(
      "/v1/finance/bank-accounts/supported-banks",
      { params: { countryCode } },
    );
    const payload = response.data;
    const banks =
      payload?.data?.banks ?? payload?.data ?? payload?.banks ?? payload;
    if (!Array.isArray(banks)) return [];
    return banks.map((bank: SupportedBank) => ({
      ...bank,
      code: String(bank.code),
      nibss_bank_code:
        bank.nibss_bank_code == null ? null : String(bank.nibss_bank_code),
    }));
  },

  resolveBankAccount: async (data: {
    bankCode: string;
    accountNumber: string;
  }): Promise<ResolvedBankAccount> => {
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

  createBankAccount: async (data: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode: string;
    isDefault?: boolean;
  }): Promise<BankAccount> => {
    const response = await axiosConfig.post("/v1/finance/bank-accounts", data);
    return response.data?.data ?? response.data;
  },

  registerPayoutDestination: async (id: string): Promise<BankAccount> => {
    const response = await axiosConfig.post(
      `/v1/finance/bank-accounts/${id}/payout-destination`,
    );
    return response.data?.data ?? response.data;
  },

  updateBankAccount: async (id: string, data: any): Promise<BankAccount> => {
    const response = await axiosConfig.patch(
      `/v1/finance/bank-accounts/${id}`,
      data,
    );
    return response.data;
  },

  deleteBankAccount: async (id: string): Promise<void> => {
    await axiosConfig.delete(`/v1/finance/bank-accounts/${id}`);
  },

  setDefaultBankAccount: async (id: string): Promise<{ message: string }> => {
    const response = await axiosConfig.post(
      `/v1/finance/bank-accounts/${id}/default`,
    );
    return response.data;
  },

  // ============ Announcements ============
  getAnnouncements: async (params?: {
    organizationId?: string;
    page?: number;
    limit?: number;
    isPublished?: boolean;
    type?: string;
    priority?: string;
  }): Promise<PaginatedResponse<Announcement>> => {
    const response = await axiosConfig.get("/v1/communication/announcements", {
      params,
    });
    return response.data;
  },

  getAnnouncement: async (id: string): Promise<Announcement> => {
    const response = await axiosConfig.get(
      `/v1/communication/announcements/${id}`,
    );
    return response.data;
  },

  createAnnouncement: async (data: any): Promise<Announcement> => {
    const response = await axiosConfig.post(
      "/v1/communication/announcements",
      data,
    );
    return response.data;
  },

  updateAnnouncement: async (id: string, data: any): Promise<Announcement> => {
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

  // ============ Organizations ============
  getUserOrganizations: async (): Promise<OrganizationMembership[]> => {
    const response = await axiosConfig.get("/v1/users/me/organizations");
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.data?.data)) return response.data.data;
    return [];
  },

  getOrganizationMembers: async (
    organizationId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      membershipType?: string;
      search?: string;
    },
  ): Promise<PaginatedResponse<any>> => {
    const response = await axiosConfig.get(
      `/v1/organizations/${organizationId}/members`,
      {
        params,
      },
    );
    return response.data;
  },

  addMember: async (
    organizationId: string,
    data: {
      userId: string;
      membershipType: string;
      status?: string;
      isPrimary?: boolean;
      sessionId?: string;
    },
  ): Promise<void> => {
    await axiosConfig.post(`/v1/organizations/${organizationId}/members`, data);
  },

  updateMember: async (membershipId: string, data: any): Promise<void> => {
    await axiosConfig.patch(`/v1/organizations/members/${membershipId}`, data);
  },

  removeMember: async (membershipId: string): Promise<void> => {
    await axiosConfig.delete(`/v1/organizations/members/${membershipId}`);
  },

  getOrganizationStats: async (params?: {
    institutionId?: string;
  }): Promise<any> => {
    const response = await axiosConfig.get("/v1/organizations/stats", {
      params,
    });
    return response.data;
  },
};

// ============ Query Keys ============
export const adminQueryKeys = {
  auth: {
    user: ["admin", "auth", "user"],
  },
  academicSessions: (institutionId: string) => ["admin", "academic-sessions", institutionId],
  dashboard: {
    stats: (organizationId: string) => [
      "admin",
      "dashboard",
      "stats",
      organizationId,
    ],
  },
  students: {
    all: (params?: any) => ["admin", "students", params],
    one: (id: string) => ["admin", "students", id],
    dashboard: ["admin", "students", "dashboard"],
    adminDashboard: (params?: any) => [
      "admin",
      "students",
      "admin-dashboard",
      params,
    ],
    promotions: (id: string) => ["admin", "students", id, "promotions"],
  },
  bankAccounts: {
    all: (params?: any) => ["admin", "finance", "bank-accounts", params],
    one: (id: string) => ["admin", "finance", "bank-accounts", id],
  },
  withdrawals: {
    all: (params?: any) => ["admin", "finance", "withdrawals", params],
    one: (id: string) => ["admin", "finance", "withdrawals", id],
  },
  finance: {
    wallet: (organizationId: string) => [
      "admin",
      "finance",
      "wallet",
      organizationId,
    ],
    dues: (params?: any) => ["admin", "finance", "dues", params],
    transactions: (params?: any) => [
      "admin",
      "finance",
      "transactions",
      params,
    ],
    receipts: (params?: any) => ["admin", "finance", "receipts", params],
    paymentHistory: (params?: unknown) => [
      "admin",
      "finance",
      "payment-history",
      params,
    ],
    overview: (organizationId: string) => [
      "admin",
      "finance",
      "overview",
      organizationId,
    ],
    organizationOverview: (organizationId: string) => [
      "admin",
      "finance",
      "organization-overview",
      organizationId,
    ],
    dashboard: (organizationId: string) => [
      "admin",
      "finance",
      "dashboard",
      organizationId,
    ],
  },
  announcements: {
    all: (params?: any) => ["admin", "announcements", params],
    one: (id: string) => ["admin", "announcements", id],
  },
  organizations: {
    members: (id: string, params?: any) => [
      "admin",
      "organizations",
      id,
      "members",
      params,
    ],
    stats: (params?: any) => ["admin", "organizations", "stats", params],
    userOrgs: ["admin", "organizations", "user"],
  },
};
