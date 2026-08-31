// ============================================
// AUTH TYPES
// ============================================

export interface AuthResponseDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  onboardingCompleted: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  onboardingStep: "PERSONAL_INFO" | "INSTITUTION" | "INTERESTS" | "COMPLETED";
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface UserResponseDto {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile: UserProfileResponseDto;
  studentProfile?: StudentProfileResponseDto;
  // Admin fields
  isPlatformAdmin?: boolean;
  adminTypes?: string[];
  userType?: "PLATFORM_ADMIN" | "ADMIN" | "USER" | "STUDENT";
  roles?: string[];
}

export interface UserProfileResponseDto {
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  avatar?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth?: string;
  country?: string;
  state?: string;
  city?: string;
  address?: string;
  bio?: string;
  onboardingStep: "PERSONAL_INFO" | "INSTITUTION" | "INTERESTS" | "COMPLETED";
  onboardingCompleted: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

export interface StudentProfileResponseDto {
  institutionId: string;
  facultyId: string;
  departmentId: string;
  currentAcademicLevelId: string;
  matricNumber?: string;
  academicStatus:
    "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "PROBATION" | "SUSPENDED";
  onboardingCompleted: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
}

export interface UserListResponseDto {
  data: UserResponseDto[];
  meta: PaginationMeta;
}

// ============================================
// INSTITUTION TYPES
// ============================================

export interface CreateInstitutionDto {
  name: string;
  shortName: string;
  code: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface UpdateInstitutionDto {
  name?: string;
  shortName?: string;
  code?: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
}

export interface FacultyResponseDto {
  id: string;
  name: string;
  code: string;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

export interface AcademicSessionResponseDto {
  id: string;
  institutionId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isCurrent: boolean;
  scope: "INSTITUTION" | "FACULTY" | "DEPARTMENT" | "LEVEL";
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionPromotionResult {
  institution: { id: string; name: string };
  previousSession: { id: string; name: string };
  currentSession: { id: string; name: string; generated: boolean };
  summary: { eligible: number; promoted: number; graduated: number; skipped: number };
}

export interface InstitutionResponseDto {
  id: string;
  name: string;
  shortName: string;
  code: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "ARCHIVED";
  faculties: FacultyResponseDto[];
  sessions: AcademicSessionResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionListResponseDto {
  data: InstitutionResponseDto[];
  meta: PaginationMeta;
}

// ============================================
// FACULTY TYPES
// ============================================

export interface CreateFacultyDto {
  name: string;
  code: string;
  institutionId: string;
  logo?: string;
}

export interface UpdateFacultyDto {
  name?: string;
  code?: string;
  logo?: string;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

// ============================================
// DEPARTMENT TYPES
// ============================================

export interface CreateDepartmentDto {
  name: string;
  code: string;
  facultyId: string;
  logo?: string;
  promotionType?: "AUTOMATIC" | "MANUAL";
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
  logo?: string;
  promotionType?: "AUTOMATIC" | "MANUAL";
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

export interface DepartmentResponseDto {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  promotionType: "AUTOMATIC" | "MANUAL";
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ACADEMIC LEVEL TYPES
// ============================================

export interface CreateAcademicLevelDto {
  name: string;
  numericLevel: number;
  order: number;
  departmentId: string;
}

export interface AcademicLevelResponseDto {
  id: string;
  departmentId: string;
  name: string;
  numericLevel: number;
  order: number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ACADEMIC SESSION TYPES
// ============================================

export interface CreateAcademicSessionDto {
  name: string;
  startDate: string;
  endDate: string;
  institutionId: string;
  status?: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isCurrent?: boolean;
}

// ============================================
// ORGANIZATION TYPES
// ============================================

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  type:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "ASSOCIATION"
    | "CLUB"
    | "RELIGIOUS"
    | "SPORTS"
    | "SPECIAL";
  scope:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "CROSS_DEPARTMENT"
    | "CROSS_LEVEL"
    | "CUSTOM";
  institutionId: string;
  facultyId?: string;
  departmentId?: string;
  academicLevelId?: string;
  parentOrganizationId?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
  description?: string;
  type?:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "ASSOCIATION"
    | "CLUB"
    | "RELIGIOUS"
    | "SPORTS"
    | "SPECIAL";
  scope?:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "CROSS_DEPARTMENT"
    | "CROSS_LEVEL"
    | "CUSTOM";
  facultyId?: string;
  departmentId?: string;
  academicLevelId?: string;
  status?:
    | "DRAFT"
    | "PENDING_ACTIVATION"
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "ARCHIVED";
}

export interface OrganizationMemberResponseDto {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  membershipType: "STUDENT" | "ADMIN" | "STAFF" | "ALUMNI" | "HONORARY";
  status: "INVITED" | "PENDING" | "ACTIVE" | "SUSPENDED" | "LEFT" | "REMOVED";
  isPrimary: boolean;
  joinedAt: string;
  createdAt: string;
}

export interface OrganizationResponseDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "ASSOCIATION"
    | "CLUB"
    | "RELIGIOUS"
    | "SPORTS"
    | "SPECIAL";
  scope:
    | "INSTITUTION"
    | "FACULTY"
    | "DEPARTMENT"
    | "LEVEL"
    | "CROSS_DEPARTMENT"
    | "CROSS_LEVEL"
    | "CUSTOM";
  status:
    | "DRAFT"
    | "PENDING_ACTIVATION"
    | "ACTIVE"
    | "INACTIVE"
    | "SUSPENDED"
    | "ARCHIVED";
  institutionId: string;
  facultyId?: string;
  departmentId?: string;
  academicLevelId?: string;
  parentOrganizationId?: string;
  children?: OrganizationResponseDto[];
  members?: OrganizationMemberResponseDto[];
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationListResponseDto {
  data: OrganizationResponseDto[];
  meta: PaginationMeta;
}

// ============================================
// MEMBERSHIP TYPES
// ============================================

export interface AddMemberDto {
  userId: string;
  membershipType: "STUDENT" | "ADMIN" | "STAFF" | "ALUMNI" | "HONORARY";
  status?: "INVITED" | "PENDING" | "ACTIVE" | "SUSPENDED" | "LEFT" | "REMOVED";
  isPrimary?: boolean;
  sessionId?: string;
}

export interface UpdateMemberDto {
  status?: "INVITED" | "PENDING" | "ACTIVE" | "SUSPENDED" | "LEFT" | "REMOVED";
  membershipType?: "STUDENT" | "ADMIN" | "STAFF" | "ALUMNI" | "HONORARY";
  isPrimary?: boolean;
}

// ============================================
// STUDENT TYPES
// ============================================

export interface CreateStudentDto {
  userId: string;
  institutionId: string;
  facultyId: string;
  departmentId: string;
  currentAcademicLevelId?: string;
  matricNumber?: string;
  academicStatus?:
    "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "PROBATION" | "SUSPENDED";
}

export interface UpdateStudentDto {
  facultyId?: string;
  departmentId?: string;
  currentAcademicLevelId?: string;
  matricNumber?: string;
  academicStatus?:
    "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "PROBATION" | "SUSPENDED";
}

export interface StudentAcademicRecordResponseDto {
  id: string;
  sessionId: string;
  sessionName: string;
  gpa?: number;
  cgpa?: number;
  creditsAttempted?: number;
  creditsEarned?: number;
  status: "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "PROBATION" | "SUSPENDED";
  createdAt: string;
}

export interface StudentPromotionResponseDto {
  id: string;
  fromLevelName: string;
  toLevelName: string;
  sessionName: string;
  promotionDate: string;
  notes?: string;
}

export interface StudentResponseDto {
  id: string;
  userId: string;
  name: string;
  email: string;
  username: string;
  institutionId: string;
  institutionName: string;
  facultyId: string;
  facultyName: string;
  departmentId: string;
  departmentName: string;
  currentAcademicLevelId: string;
  currentAcademicLevelName: string;
  matricNumber: string;
  academicStatus:
    "ACTIVE" | "GRADUATED" | "WITHDRAWN" | "PROBATION" | "SUSPENDED";
  onboardingCompleted: boolean;
  verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED";
  createdAt: string;
  academicRecords?: StudentAcademicRecordResponseDto[];
  promotions?: StudentPromotionResponseDto[];
}

export interface StudentListResponseDto {
  data: StudentResponseDto[];
  meta: PaginationMeta;
}

export interface PromoteStudentDto {
  fromLevelId: string;
  toLevelId: string;
  sessionId: string;
  notes?: string;
  promotionDate?: string;
}

export interface BulkPromoteDto {
  fromLevelId: string;
  toLevelId: string;
  sessionId: string;
  departmentId?: string;
  studentIds?: string[];
  promoteAll?: boolean;
  notes?: string;
}

// ============================================
// FINANCE TYPES
// ============================================

export interface CreateDueDto {
  organizationId: string;
  sessionId?: string;
  name: string;
  description?: string;
  amount: number;
  dueDate: string;
  lateFee?: number;
  isRequired: boolean;
}

export interface WithdrawalRequestDto {
  organizationId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  reason?: string;
}

export interface DueResponseDto {
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
}

export interface TransactionResponseDto {
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

export interface ReceiptResponseDto {
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
  paymentMethod: "CARD" | "BANK_TRANSFER" | "USSD" | "QR_CODE" | "WALLET";
  paymentDate: string;
  description?: string;
  organizationName?: string;
  status: "ISSUED" | "VOIDED" | "CANCELLED";
  downloadCount: number;
  lastDownloaded?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceOverviewResponseDto {
  totalBalance: number;
  totalHeld: number;
  totalWallets: number;
  platformEarnings: {
    amount: number;
    amountFormatted: string;
    grossAmount: number;
    grossAmountFormatted: string;
    withdrawnAmount: number;
    withdrawnAmountFormatted: string;
    payoutProviderFees: number;
    payoutProviderFeesFormatted: string;
    withdrawalCount: number;
    currency: string;
    currencyUnit: "KOBO";
    scope: "PLATFORM_NET" | "INSTITUTION_GROSS";
  };
  dueStats: {
    total: number;
    paid: number;
    pending: number;
    completionRate: number;
  };
  recentPayments: Array<{
    id: string;
    amount: number;
    amountFormatted: string;
    payer: string;
    organization: string;
    createdAt: string;
    status: "COMPLETED" | "PENDING" | "FAILED";
    journalEntryId: string;
  }>;
  dailyTransactions: number;
}

// ============================================
// RBAC TYPES
// ============================================

export interface PermissionResponseDto {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
}

export interface CreateRoleDto {
  organizationId: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions?: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleResponseDto {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  permissions: PermissionResponseDto[];
  createdAt: string;
  updatedAt: string;
}

export interface AssignRoleToUserDto {
  userId: string;
  roleId: string;
  organizationId: string;
}

export interface AssignAdminRoleDto {
  userId: string;
  adminType:
    | "PLATFORM_ADMIN"
    | "INSTITUTION_ADMIN"
    | "FACULTY_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "CLUB_ADMIN";
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  organizationId?: string;
  academicSessionId?: string;
}

export interface AdminResponseDto {
  id: string;
  userId: string;
  adminType:
    | "PLATFORM_ADMIN"
    | "INSTITUTION_ADMIN"
    | "FACULTY_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "CLUB_ADMIN";
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  organizationId?: string;
  status: "ACTIVE" | "INACTIVE" | "REVOKED";
  assignedBy?: string;
  assignedAt: string;
  revokedAt?: string;
  revokedReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: UserResponseDto;
}

// ============================================
// PLATFORM FEATURES TYPES
// ============================================

export interface CreateFeatureFlagDto {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  percentage: number;
}

export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  enabled?: boolean;
  percentage?: number;
}

export interface FeatureFlagResponseDto {
  id: string;
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  percentage: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceDto {
  enabled: boolean;
  message?: string;
  startsAt?: string;
  endsAt?: string;
}

export interface MaintenanceResponseDto {
  id: string;
  enabled: boolean;
  message?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ANNOUNCEMENT TYPES
// ============================================

export interface CreateAnnouncementDto {
  organizationId: string;
  title: string;
  content: string;
  type: "GENERAL" | "IMPORTANT" | "URGENT" | "FINANCIAL" | "ACADEMIC" | "EVENT";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  expiresAt?: string;
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  type?:
    "GENERAL" | "IMPORTANT" | "URGENT" | "FINANCIAL" | "ACADEMIC" | "EVENT";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  expiresAt?: string;
}

export interface AnnouncementResponseDto {
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
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  author?: {
    id: string;
    username: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

// ============================================
// AUDIT TYPES
// ============================================

export interface AuditLogResponseDto {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    username: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface AuditSummaryResponseDto {
  total: number;
  uniqueUsers: number;
  uniqueActions: number;
  uniqueEntities: number;
}

// ============================================
// USER TYPES
// ============================================

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
  dateOfBirth?: string;
  country?: string;
  state?: string;
  bio?: string;
}

export interface UpdateUserStatusDto {
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED" | "DELETED";
  reason?: string;
}

// ============================================
// SEARCH TYPES
// ============================================

export interface SearchResultDto {
  id: string;
  type: string;
  title: string;
  description?: string;
  url?: string;
  image?: string;
  score: number;
  createdAt: string;
  metadata?: any;
}

export interface SearchResponseDto {
  data: SearchResultDto[];
  meta: PaginationMeta;
  facets?: any;
}

// ============================================
// PAGINATION
// ============================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface DashboardAnalyticsResponseDto {
  totalUsers: number;
  totalInstitutions: number;
  totalOrganizations: number;
  totalTransactions: number;
  totalRevenue: number;
  userGrowth: Array<{ period: string; count: number }>;
  revenueData: Array<{ period: string; amount: number }>;
  organizationStats: {
    total: number;
    active: number;
    pending: number;
    inactive: number;
  };
}

export interface PlatformAdminDashboardResponseDto {
  admin: { type: string };
  statistics: {
    totalUsers: number;
    totalStudents: number;
    totalOrganizations: number;
    totalInstitutions: number;
    totalEvents: number;
    totalPayments: number;
    totalRevenue: number;
    formattedRevenue: string;
    activeOrganizations: number;
    pendingVerifications: number;
    totalTransactions: number;
  };
  systemHealth: {
    maintenanceMode: boolean;
    featureFlags: number;
    activeKillSwitches: number;
    uptime: number;
  };
}

export interface RevenueAnalyticsResponseDto {
  data: Array<{ period: string; amount: number }>;
  total: number;
  average: number;
  growth: number;
}

export interface GrowthAnalyticsResponseDto {
  data: Array<{ period: string; count: number }>;
  total: number;
  growth: number;
}

// ============================================
// AUTH STORE TYPES
// ============================================

export interface AuthState {
  token: string | null;
  user: UserResponseDto | null;
  isLoading: boolean;
}

// ============================================
// FINANCE TYPES - ADD THESE NEW TYPES
// ============================================

// Bank Account Types
export interface CreateBankAccountDto {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankCode: string;
  isDefault?: boolean;
}

export interface UpdateBankAccountDto {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  bankCode?: string;
  isDefault?: boolean;
}

export interface BankAccountResponseDto {
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

export interface BankAccountListResponseDto {
  data: BankAccountResponseDto[];
  meta: PaginationMeta;
}

export interface SupportedBankDto {
  name: string;
  slug: string;
  code: string;
  nibss_bank_code?: string | null;
  country: string;
}

export interface ResolvedBankAccountDto {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
}

// Withdrawal Types
export interface UserWithdrawalRequestDto {
  bankAccountId: string;
  amount: number;
  reason?: string;
}

export interface OrganizationWithdrawalRequestDto {
  organizationId: string;
  bankAccountId: string;
  amount: number;
  reason?: string;
}

export interface PlatformWithdrawalRequestDto {
  bankAccountId: string;
  amount: number;
  reason?: string;
}

export interface WithdrawalResponseDto {
  id: string;
  userId: string;
  walletId: string;
  organizationId?: string;
  amount: number;
  fee: number;
  netAmount: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  bankName: string;
  accountNumber: string;
  accountName: string;
  reference: string;
  requestedAt: string;
  providerPayoutId?: string | null;
  processedAt?: string | null;
  completedAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  webhookStatus?: string | null;
  metadata: {
    type: "USER_WITHDRAWAL" | "ORGANIZATION_WITHDRAWAL" | "PLATFORM_WITHDRAWAL";
    bankAccountId: string;
    reason?: string;
    organizationId?: string;
    requestedBy?: string;
  };
  wallet?: {
    id: string;
    userId: string;
    organizationId?: string;
    isPlatformWallet: boolean;
  };
  journalEntry?: {
    id: string;
    reference: string;
    lines: Array<{
      id: string;
      type: "DEBIT" | "CREDIT";
      amount: number;
      description: string;
    }>;
  };
  user?: {
    id: string;
    email: string;
    username: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface WithdrawalQuoteDto {
  balance: number;
  heldBalance: number;
  availableBalance: number;
  requestedAmount: number | null;
  fee: number;
  totalDebit: number;
  maxWithdrawable: number;
  canWithdraw: boolean;
  feePolicy: "WITHDRAWAL_FEE_APPLIES" | "FEE_FREE";
  currency: "NGN";
  currencyUnit: "KOBO";
}

export interface WithdrawalListResponseDto {
  data: WithdrawalResponseDto[];
  meta: PaginationMeta;
}

export interface WithdrawalApproveResponseDto {
  id: string;
  status: "PROCESSING";
  processedAt: string;
  message: string;
}

export interface WithdrawalRejectRequestDto {
  reason?: string;
}

export interface WithdrawalRejectResponseDto {
  id: string;
  status: "FAILED";
  failedAt: string;
  failureReason: string;
  message: string;
}

// Withdrawal History Filters
export interface WithdrawalFiltersDto {
  status?: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  type?: "USER" | "ORGANIZATION" | "PLATFORM";
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export type AdminOrganizationWithdrawalFiltersDto = Omit<
  WithdrawalFiltersDto,
  "type"
>;

// Webhook Types
export interface WithdrawalWebhookDto {
  event: "withdrawal.succeeded" | "withdrawal.failed";
  reference: string;
  id: string;
  amount: string;
  reason?: string;
  data: {
    reference: string;
    id: string;
    amount: string;
    status: "completed" | "failed";
    reason?: string;
  };
}

export interface WebhookResponseDto {
  received: boolean;
  event: string;
  withdrawalId: string;
  status: string;
}

export interface PermissionDto {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminPermissionDto {
  id: string;
  adminId: string;
  permissionKey: string;
  permissionCategory: string;
  permissionAction: string;
  resourceId?: string;
  grantedBy?: string;
  grantedAt: string;
}

export interface AdminWithPermissionsResponseDto extends AdminResponseDto {
  permissions?: AdminPermissionDto[];
  allPermissions?: PermissionDto[];
}

export interface AssignAdminWithPermissionsDto {
  userId: string;
  adminType:
    | "PLATFORM_ADMIN"
    | "INSTITUTION_ADMIN"
    | "FACULTY_ADMIN"
    | "DEPARTMENT_ADMIN"
    | "ORGANIZATION_ADMIN"
    | "CLUB_ADMIN";
  institutionId?: string;
  facultyId?: string;
  departmentId?: string;
  organizationId?: string;
  academicSessionId?: string;
  permissions?: string[]; // Array of permission keys to assign
}

export interface UpdateAdminPermissionsDto {
  permissions: string[]; // Array of permission keys
  action: "ADD" | "REMOVE" | "SET";
}

// ============================================
// PERMISSION CATEGORIES
// ============================================

export interface PermissionOption {
  key: string;
  label: string;
  action: string;
}

export interface PermissionCategory {
  key: string;
  label: string;
  permissions: PermissionOption[];
}

export const PERMISSION_CATEGORIES: Record<string, PermissionCategory> = {
  USER: {
    key: "USER",
    label: "User Management",
    permissions: [
      { key: "users:create", label: "Create Users", action: "CREATE" },
      { key: "users:read", label: "View Users", action: "READ" },
      { key: "users:update", label: "Update Users", action: "UPDATE" },
      { key: "users:delete", label: "Delete Users", action: "DELETE" },
      { key: "users:manage", label: "Manage Users", action: "MANAGE" },
    ],
  },
  INSTITUTION: {
    key: "INSTITUTION",
    label: "Institution Management",
    permissions: [
      {
        key: "institution:create",
        label: "Create Institutions",
        action: "CREATE",
      },
      { key: "institution:read", label: "View Institutions", action: "READ" },
      {
        key: "institution:update",
        label: "Update Institutions",
        action: "UPDATE",
      },
      {
        key: "institution:delete",
        label: "Delete Institutions",
        action: "DELETE",
      },
      {
        key: "institution:manage",
        label: "Manage Institutions",
        action: "MANAGE",
      },
    ],
  },
  ORGANIZATION: {
    key: "ORGANIZATION",
    label: "Organization Management",
    permissions: [
      {
        key: "organization:create",
        label: "Create Organizations",
        action: "CREATE",
      },
      { key: "organization:read", label: "View Organizations", action: "READ" },
      {
        key: "organization:update",
        label: "Update Organizations",
        action: "UPDATE",
      },
      {
        key: "organization:delete",
        label: "Delete Organizations",
        action: "DELETE",
      },
      {
        key: "organization:manage",
        label: "Manage Organizations",
        action: "MANAGE",
      },
      {
        key: "organization:approve",
        label: "Approve Organizations",
        action: "APPROVE",
      },
    ],
  },
  FINANCE: {
    key: "FINANCE",
    label: "Finance Management",
    permissions: [
      { key: "finance:read", label: "View Finance", action: "READ" },
      {
        key: "finance:create",
        label: "Create Finance Records",
        action: "CREATE",
      },
      {
        key: "finance:update",
        label: "Update Finance Records",
        action: "UPDATE",
      },
      {
        key: "finance:delete",
        label: "Delete Finance Records",
        action: "DELETE",
      },
      {
        key: "finance:approve",
        label: "Approve Transactions",
        action: "APPROVE",
      },
      { key: "finance:export", label: "Export Finance Data", action: "EXPORT" },
      { key: "finance:review", label: "Review Finance", action: "REVIEW" },
      {
        key: "finance:withdrawal:approve",
        label: "Approve Withdrawals",
        action: "APPROVE",
      },
      {
        key: "finance:withdrawal:platform",
        label: "Platform Withdrawals",
        action: "MANAGE",
      },
    ],
  },
  STUDENT: {
    key: "STUDENT",
    label: "Student Management",
    permissions: [
      { key: "student:create", label: "Create Students", action: "CREATE" },
      { key: "student:read", label: "View Students", action: "READ" },
      { key: "student:update", label: "Update Students", action: "UPDATE" },
      { key: "student:delete", label: "Delete Students", action: "DELETE" },
      { key: "student:verify", label: "Verify Students", action: "VERIFY" },
      { key: "student:promote", label: "Promote Students", action: "PROMOTE" },
    ],
  },
  ACADEMIC: {
    key: "ACADEMIC",
    label: "Academic Management",
    permissions: [
      { key: "academic:read", label: "View Academic Data", action: "READ" },
      {
        key: "academic:create",
        label: "Create Academic Records",
        action: "CREATE",
      },
      {
        key: "academic:update",
        label: "Update Academic Records",
        action: "UPDATE",
      },
      {
        key: "academic:delete",
        label: "Delete Academic Records",
        action: "DELETE",
      },
      {
        key: "academic:manage",
        label: "Manage Academic Records",
        action: "MANAGE",
      },
    ],
  },
  COMMUNICATION: {
    key: "COMMUNICATION",
    label: "Communication",
    permissions: [
      {
        key: "communication:create",
        label: "Create Announcements",
        action: "CREATE",
      },
      {
        key: "communication:read",
        label: "View Announcements",
        action: "READ",
      },
      {
        key: "communication:update",
        label: "Update Announcements",
        action: "UPDATE",
      },
      {
        key: "communication:delete",
        label: "Delete Announcements",
        action: "DELETE",
      },
      {
        key: "communication:manage",
        label: "Manage Communications",
        action: "MANAGE",
      },
    ],
  },
  ADMIN: {
    key: "ADMIN",
    label: "Administrator Management",
    permissions: [
      { key: "admin:assign", label: "Assign Admins", action: "ASSIGN" },
      { key: "admin:revoke", label: "Revoke Admins", action: "REVOKE" },
      { key: "admin:view", label: "View Admins", action: "VIEW" },
      { key: "admin:manage", label: "Manage Admins", action: "MANAGE" },
    ],
  },
  SYSTEM: {
    key: "SYSTEM",
    label: "System Management",
    permissions: [
      { key: "system:read", label: "View System Data", action: "READ" },
      { key: "system:update", label: "Update System", action: "UPDATE" },
      { key: "system:manage", label: "Manage System", action: "MANAGE" },
      {
        key: "system:maintenance",
        label: "System Maintenance",
        action: "MAINTENANCE",
      },
      {
        key: "system:feature_flag",
        label: "Manage Feature Flags",
        action: "FEATURE_FLAG",
      },
    ],
  },
  ANALYTICS: {
    key: "ANALYTICS",
    label: "Analytics",
    permissions: [
      { key: "analytics:read", label: "View Analytics", action: "READ" },
      { key: "analytics:export", label: "Export Analytics", action: "EXPORT" },
      { key: "analytics:manage", label: "Manage Analytics", action: "MANAGE" },
    ],
  },
};

/**
 * Keep the permission picker aligned with the backend's seeded catalog.
 * The static entries above remain a fallback while the request is loading.
 */
export function mergePermissionCategories(
  permissions: PermissionResponseDto[],
): Record<string, PermissionCategory> {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return PERMISSION_CATEGORIES;
  }

  const grouped: Record<string, PermissionCategory> = {};
  for (const permission of permissions) {
    if (!permission?.key) continue;
    const categoryKey = (permission.category || "OTHER").toUpperCase();
    const action = permission.key.split(":").at(-1)?.toUpperCase() || "ACCESS";
    grouped[categoryKey] ??= {
      key: categoryKey,
      label: `${categoryKey
        .toLowerCase()
        .replaceAll("_", " ")
        .replace(/\b\w/g, (character) => character.toUpperCase())} Permissions`,
      permissions: [],
    };
    grouped[categoryKey].permissions.push({
      key: permission.key,
      label: permission.name || permission.key,
      action,
    });
  }

  for (const category of Object.values(grouped)) {
    category.permissions.sort((left, right) =>
      left.label.localeCompare(right.label),
    );
  }

  for (const key of Object.keys(PERMISSION_CATEGORIES)) {
    delete PERMISSION_CATEGORIES[key];
  }
  Object.assign(PERMISSION_CATEGORIES, grouped);
  return PERMISSION_CATEGORIES;
}

export type PermissionCategoryKey = keyof typeof PERMISSION_CATEGORIES;
export type PermissionKey = string;
