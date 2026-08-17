// apps/admin-org/lib/api/admin.ts

import { axiosConfig } from "@/utils/axios-config";

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

// ============ Admin Types ============
export interface AdminScope {
  id: string;
  adminType:
    | "PLATFORM_ADMIN"
    | "INSTITUTION_ADMIN"
    | "FACULTY_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "CLUB_ADMIN";
  organizationId?: string;
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
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
}

// ============ Finance Types ============
export interface Due {
  id: string;
  organizationId: string;
  sessionId?: string;
  name: string;
  description?: string;
  amount: number;
  dueDate: string;
  lateFee: number;
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

// ============ Organization Types ============
export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  membershipType: string;
  status: string;
  isPrimary: boolean;
  joinedAt: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    type: string;
    status: string;
  };
}

// ============ Join Request Types ============
export interface OrganizationJoinRequest {
  id: string;
  organizationId: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  membershipType: "STUDENT" | "ADMIN" | "STAFF" | "ALUMNI" | "HONORARY";
  message?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    profile?: {
      firstName: string;
      lastName: string;
      phone?: string;
      avatar?: string;
    };
    studentProfile?: {
      institutionId: string;
      facultyId: string;
      departmentId: string;
      matricNumber?: string;
      currentAcademicLevel?: {
        id: string;
        name: string;
      };
    };
  };
  organization?: {
    id: string;
    name: string;
    slug: string;
    type: string;
    status: string;
  };
  reviewer?: {
    id: string;
    username: string;
    email: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface JoinRequestStats {
  organizationId: string;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
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

  refresh: async (): Promise<void> => {
    await axiosConfig.post("/v1/auth/refresh");
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
  }): Promise<PaginatedResponse<Student>> => {
    const response = await axiosConfig.get("/v1/students", { params });
    return response.data;
  },

  getStudent: async (id: string): Promise<Student> => {
    const response = await axiosConfig.get(`/v1/students/${id}`);
    return response.data;
  },

  updateStudent: async (id: string, data: any): Promise<Student> => {
    const response = await axiosConfig.patch(`/v1/students/${id}`, data);
    return response.data;
  },

  getStudentPromotions: async (id: string): Promise<any[]> => {
    const response = await axiosConfig.get(`/v1/students/${id}/promotions`);
    return response.data;
  },

  getStudentDashboard: async (): Promise<any> => {
    const response = await axiosConfig.get("/v1/students/me");
    return response.data;
  },

  getAdminDashboard: async (params?: {
    institutionId?: string;
  }): Promise<any> => {
    const response = await axiosConfig.get("/v1/students/admin-dashboard", {
      params,
    });
    return response.data;
  },

  // ============ Finance ============
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

  getTransactions: async (params?: {
    page?: number;
    limit?: number;
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
    startDate?: string;
    endDate?: string;
    organizationId?: string;
  }): Promise<PaginatedResponse<Receipt>> => {
    const response = await axiosConfig.get("/v1/finance/receipts", { params });
    return response.data;
  },

  getFinancialOverview: async (
    organizationId: string,
  ): Promise<FinancialOverview> => {
    const response = await axiosConfig.get(
      `/v1/finance/organizations/${organizationId}/overview`,
    );
    return response.data;
  },

  getFinanceDashboard: async (organizationId: string): Promise<any> => {
    const response = await axiosConfig.get(
      `/v1/finance/organizations/${organizationId}/dashboard`,
    );
    return response.data;
  },

  requestWithdrawal: async (data: {
    organizationId: string;
    amount: number;
    bankName: string;
    accountNumber: string;
    accountName: string;
    reason: string;
  }): Promise<void> => {
    await axiosConfig.post("/v1/finance/withdrawals/organization", data);
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
    return response.data;
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
      { params },
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

  // ============ Organization Join Requests ============
  getPendingJoinRequests: async (
    organizationId: string,
    params?: {
      page?: number;
      limit?: number;
    },
  ): Promise<PaginatedResponse<OrganizationJoinRequest>> => {
    const response = await axiosConfig.get(
      `/v1/organizations/${organizationId}/join-requests/pending`,
      { params },
    );
    return response.data;
  },

  reviewJoinRequest: async (
    requestId: string,
    data: { status: "APPROVED" | "REJECTED"; rejectionReason?: string },
  ): Promise<OrganizationJoinRequest> => {
    const response = await axiosConfig.patch(
      `/v1/organizations/join-requests/${requestId}/review`,
      data,
    );
    return response.data;
  },

  getJoinRequestStats: async (
    organizationId: string,
  ): Promise<JoinRequestStats> => {
    const response = await axiosConfig.get(
      `/v1/organizations/${organizationId}/join-requests/stats`,
    );
    return response.data;
  },
};

// ============ Query Keys ============
export const adminQueryKeys = {
  auth: {
    user: ["admin", "auth", "user"],
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
  finance: {
    dues: (params?: any) => ["admin", "finance", "dues", params],
    transactions: (params?: any) => [
      "admin",
      "finance",
      "transactions",
      params,
    ],
    receipts: (params?: any) => ["admin", "finance", "receipts", params],
    overview: (organizationId: string) => [
      "admin",
      "finance",
      "overview",
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
    joinRequests: {
      pending: (organizationId: string, params?: any) => [
        "admin",
        "organizations",
        organizationId,
        "join-requests",
        "pending",
        params,
      ],
      stats: (organizationId: string) => [
        "admin",
        "organizations",
        organizationId,
        "join-requests",
        "stats",
      ],
    },
  },
};
