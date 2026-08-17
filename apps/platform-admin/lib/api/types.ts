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
  name: string;
  startDate: string;
  endDate: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED" | "ARCHIVED";
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
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
}

export interface UpdateFacultyDto {
  name?: string;
  code?: string;
  status?: "ACTIVE" | "INACTIVE" | "ARCHIVED";
}

// ============================================
// DEPARTMENT TYPES
// ============================================

export interface CreateDepartmentDto {
  name: string;
  code: string;
  facultyId: string;
  promotionType?: "AUTOMATIC" | "MANUAL";
}

export interface UpdateDepartmentDto {
  name?: string;
  code?: string;
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
  totalRevenue: number;
  totalDues: number;
  pendingPayments: number;
  totalWithdrawals: number;
  totalTransactions: number;
  organizationCount: number;
  studentCount: number;
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
