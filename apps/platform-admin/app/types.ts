export type Permission =
  | "PLATFORM_ADMIN"
  | "INSTITUTION_CREATE"
  | "ORGANIZATION_CREATE"
  | "ADMIN_ASSIGN"
  | "FEATURE_FLAG_UPDATE"
  | "MAINTENANCE_UPDATE"
  | "AUDIT_LOG_VIEW"
  | "ANNOUNCEMENT_MANAGE"
  | "USER_MANAGE";

export type Role = "Full Platform Admin" | "Operations Admin" | "Auditor / Read-Only";

export interface UserContextType {
  name: string;
  email: string;
  avatar: string;
  role: Role;
  permissions: Permission[];
}

export interface Institution {
  id: string;
  name: string;
  code: string;
  country: string;
  facultiesCount: number;
  departmentsCount: number;
  organizationsCount: number;
  studentsCount: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface Faculty {
  id: string;
  institutionId: string;
  institutionName: string;
  name: string;
  code: string;
  deanName: string;
  departmentsCount: number;
  status: "Active" | "Inactive";
}

export interface Department {
  id: string;
  institutionId: string;
  institutionName: string;
  facultyId: string;
  facultyName: string;
  name: string;
  code: string;
  headName: string;
  generatedLevels: string[];
  organizationsCount: number;
  status: "Active" | "Inactive";
}

export type OrganizationType =
  | "Institution"
  | "Faculty"
  | "Department"
  | "Level"
  | "External"
  | "Other";

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  institutionName: string;
  facultyName?: string;
  departmentName?: string;
  studentCount: number;
  adminsCount: number;
  status: "Active" | "Pending" | "Inactive";
  createdAt: string;
  academicSessionId?: string; // NEW
  academicSession?: { // NEW
    id: string;
    name: string;
  };
}

export interface AdminMembership {
  organizationId: string;
  organizationName: string;
  role: string;
  status: "Active" | "Revoked";
}

export interface Administrator {
  id: string;
  userId: string;
  name: string;
  email: string;
  memberships: AdminMembership[];
  primaryOrganization: string;
  role: string;
  status: "Active" | "Revoked";
  assignedAt: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  institution: string;
  memberships: string[];
  status: "Active" | "Suspended" | "Pending Verification";
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  audience: string;
  status: "Published" | "Draft";
  createdAt: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  lastUpdatedBy: string;
  lastUpdatedAt: string;
}

export interface MaintenanceState {
  isMaintenanceEnabled: boolean;
  systemStatus: "Operational" | "Degraded" | "Maintenance";
  bannerMessage: string;
  scheduledWindow: string;
  lastUpdatedBy: string;
}

export interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  resource: string;
  ipAddress: string;
  deviceInfo: string;
  timestamp: string;
  status: "Success" | "Failed";
  metadata?: Record<string, any>;
}
