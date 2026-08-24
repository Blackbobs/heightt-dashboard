// apps/admin-org/components/AdminContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { AdminScope, AdminUser } from "@/lib/api/admin";
import { useAuthStore } from "@/store/auth-store";
import { useUserOrganizations } from "@/hooks/admin/useAdminOrganizations";

interface AdminContextType {
  user: AdminUser | null;
  scopes: AdminScope[];
  selectedScopeId: string | null;
  selectedScope: AdminScope | null;
  isLoading: boolean;
  setSelectedScopeId: (scopeId: string) => void;
  switchOrganization: (scopeId: string) => void;
  hasMultipleOrgs: boolean;
  isPlatformAdmin: boolean;
  isInstitutionAdmin: boolean;
  isFacultyAdmin: boolean;
  isDepartmentAdmin: boolean;
  isOrganizationAdmin: boolean;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = "heightt_admin_selected_scope";

// Default permissions for each admin type
const ADMIN_PERMISSIONS: Record<string, string[]> = {
  PLATFORM_ADMIN: [
    "student:read",
    "student:create",
    "student:update",
    "student:delete",
    "finance:read",
    "finance:create",
    "finance:update",
    "finance:delete",
    "analytics:read",
    "organization:read",
    "organization:update",
    "organization:manage",
    "communication:create",
    "communication:update",
    "communication:delete",
  ],
  INSTITUTION_ADMIN: [
    "student:read",
    "student:create",
    "student:update",
    "finance:read",
    "analytics:read",
    "organization:read",
    "communication:create",
    "communication:update",
  ],
  FACULTY_ADMIN: [
    "student:read",
    "student:create",
    "student:update",
    "finance:read",
    "analytics:read",
    "organization:read",
    "communication:create",
  ],
  DEPARTMENT_ADMIN: [
    "student:read",
    "student:create",
    "student:update",
    "finance:read",
    "analytics:read",
    "organization:read",
    "communication:create",
  ],
  ORGANIZATION_ADMIN: [
    "student:read",
    "student:create",
    "student:update",
    "finance:read",
    "finance:create",
    "analytics:read",
    "organization:read",
    "organization:update",
    "communication:create",
    "communication:update",
  ],
  CLUB_ADMIN: [
    "student:read",
    "finance:read",
    "organization:read",
    "communication:create",
  ],
};

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(null);

  const adminTypes = (user as any)?.adminTypes || [];
  const { data: userOrgsData, isLoading: orgsLoading } = useUserOrganizations();

  const isPlatformAdmin =
    adminTypes.includes("PLATFORM_ADMIN") || user?.isPlatformAdmin === true;
  const isInstitutionAdmin = adminTypes.includes("INSTITUTION_ADMIN");
  const isFacultyAdmin = adminTypes.includes("FACULTY_ADMIN");
  const isDepartmentAdmin = adminTypes.includes("DEPARTMENT_ADMIN");
  const isOrganizationAdmin =
    adminTypes.includes("ORGANIZATION_ADMIN") ||
    adminTypes.includes("CLUB_ADMIN");

  // Get permissions based on admin type
  const getPermissions = useCallback(() => {
    const perms: string[] = [];
    if (isPlatformAdmin) {
      perms.push(...ADMIN_PERMISSIONS.PLATFORM_ADMIN);
    }
    if (isInstitutionAdmin) {
      perms.push(...ADMIN_PERMISSIONS.INSTITUTION_ADMIN);
    }
    if (isFacultyAdmin) {
      perms.push(...ADMIN_PERMISSIONS.FACULTY_ADMIN);
    }
    if (isDepartmentAdmin) {
      perms.push(...ADMIN_PERMISSIONS.DEPARTMENT_ADMIN);
    }
    if (isOrganizationAdmin) {
      perms.push(...ADMIN_PERMISSIONS.ORGANIZATION_ADMIN);
    }
    return [...new Set(perms)];
  }, [
    isPlatformAdmin,
    isInstitutionAdmin,
    isFacultyAdmin,
    isDepartmentAdmin,
    isOrganizationAdmin,
  ]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      const perms = getPermissions();
      return perms.includes(permission);
    },
    [getPermissions],
  );

  // ============================================================
  // REAL ORGANIZATION SCOPES
  // ============================================================
  // The org dashboard only works against real organizations. NEVER fabricate a
  // scope with the admin's user id (or a faculty/department id) as the
  // organizationId - that sent org-scoped endpoints (wallet, dues,
  // announcements, withdrawals) a bogus id and caused 404/403 errors. Scopes
  // are derived from real organization sources:
  //   1. Backend /v1/auth/me adminScopes when they reference a real org
  //   2. The /v1/users/me/organizations memberships (for org/club admins)
  const defaultAdminType: AdminScope["adminType"] =
    (adminTypes.find(
      (t: string) => t === "ORGANIZATION_ADMIN" || t === "CLUB_ADMIN",
    ) as AdminScope["adminType"]) ||
    (isOrganizationAdmin
      ? "ORGANIZATION_ADMIN"
      : (adminTypes[0] as AdminScope["adminType"]));

  const membershipScopes: AdminScope[] = (userOrgsData || [])
    .filter((m) => m.status === "ACTIVE" && m.organization?.id)
    .map((m) => ({
      id: m.organizationId,
      adminType:
        m.organization.type === "CLUB"
          ? "CLUB_ADMIN"
          : defaultAdminType || "ORGANIZATION_ADMIN",
      organizationId: m.organizationId,
      organization: {
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        type: m.organization.type,
        status: m.organization.status,
      },
    }));

  const membershipOrgIds = new Set(
    membershipScopes.map((s) => s.organizationId),
  );

  // Backend /v1/auth/me adminScopes are only trusted when they point at a real
  // organization (type ORGANIZATION/CLUB) or an org the admin belongs to.
  const backendRealScopes: AdminScope[] = (user?.adminScopes || [])
    .filter(
      (s) =>
        !!s.organizationId &&
        (s.organization?.type === "ORGANIZATION" ||
          s.organization?.type === "CLUB" ||
          membershipOrgIds.has(s.organizationId as string)),
    )
    .map((s) => ({ ...s, id: (s.organizationId as string) || s.id }));

  const backendScopesByOrgId = new Map<string, AdminScope>(
    backendRealScopes
      .filter((s) => !!s.organizationId)
      .map((s) => [s.organizationId as string, s]),
  );

  // Prefer the richer backend scope when available for an org, otherwise fall
  // back to the membership scope derived from /v1/users/me/organizations.
  const scopes: AdminScope[] = [
    ...backendScopesByOrgId.values(),
    ...membershipScopes.filter(
      (m) => !!m.organizationId && !backendScopesByOrgId.has(m.organizationId),
    ),
  ];

  // Initialize selected scope
  useEffect(() => {
    if (scopes.length === 0) {
      setSelectedScopeId(null);
      return;
    }

    const savedScopeId = localStorage.getItem(STORAGE_KEY);
    const savedScope = scopes.find((s: any) => s.id === savedScopeId);

    if (savedScope) {
      setSelectedScopeId(savedScope.id);
      return;
    }

    setSelectedScopeId(scopes[0].id);
  }, [scopes]);

  // Persist selection
  useEffect(() => {
    if (selectedScopeId) {
      localStorage.setItem(STORAGE_KEY, selectedScopeId);
    }
  }, [selectedScopeId]);

  const selectedScope =
    scopes.find((s) => s.id === selectedScopeId) || scopes[0] || null;

  const switchOrganization = useCallback(
    (scopeId: string) => {
      const scope = scopes.find((s: any) => s.id === scopeId);
      if (scope) {
        setSelectedScopeId(scopeId);
      }
    },
    [scopes],
  );

  const value = {
    user: user || null,
    scopes,
    selectedScopeId: selectedScope?.id ?? null,
    selectedScope,
    isLoading: authLoading || orgsLoading,
    setSelectedScopeId,
    switchOrganization,
    hasMultipleOrgs: scopes.length > 1,
    isPlatformAdmin,
    isInstitutionAdmin,
    isFacultyAdmin,
    isDepartmentAdmin,
    isOrganizationAdmin,
    hasPermission,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
}
