// apps/admin-org/components/AdminContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : localStorage.getItem(STORAGE_KEY),
  );
  const [forbiddenSessionIds, setForbiddenSessionIds] = useState<string[]>([]);

  useEffect(() => {
    const handleForbiddenSession = (event: Event) => {
      const sessionId = (event as CustomEvent<string>).detail;
      setForbiddenSessionIds((current) => current.includes(sessionId) ? current : [...current, sessionId]);
    };
    window.addEventListener("admin-session-forbidden", handleForbiddenSession);
    return () => window.removeEventListener("admin-session-forbidden", handleForbiddenSession);
  }, []);

  const adminTypes = useMemo(() => user?.adminTypes || [], [user?.adminTypes]);
  const { data: userOrgsData, isLoading: orgsLoading } = useUserOrganizations();

  const isPlatformAdmin =
    adminTypes.includes("PLATFORM_ADMIN") || user?.isPlatformAdmin === true;
  const activeUserScopes = (user?.adminScopes || []).filter((scope) => !scope.status || scope.status === "ACTIVE");
  const isInstitutionAdmin = activeUserScopes.length
    ? activeUserScopes.some((scope) => scope.adminType === "INSTITUTION_ADMIN")
    : adminTypes.includes("INSTITUTION_ADMIN");
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
  // Admin scopes authorize access, but FACULTY/DEPARTMENT/INSTITUTION scope
  // payloads may put the domain entity id in `organizationId`. Organization
  // endpoints require the generated organization membership id instead.
  const scopes = useMemo(() => {
    const activeMemberships = (userOrgsData || []).filter(
      (membership) =>
        membership.status === "ACTIVE" &&
        (membership.organizationId || membership.organization?.id),
    );
    const expectedOrganizationTypes: Partial<
      Record<AdminScope["adminType"], string>
    > = {
      INSTITUTION_ADMIN: "INSTITUTION",
      FACULTY_ADMIN: "FACULTY",
      DEPARTMENT_ADMIN: "DEPARTMENT",
      CLUB_ADMIN: "CLUB",
    };
    const adminTypeByOrganizationType: Record<string, AdminScope["adminType"]> =
      {
        INSTITUTION: "INSTITUTION_ADMIN",
        FACULTY: "FACULTY_ADMIN",
        DEPARTMENT: "DEPARTMENT_ADMIN",
        ORGANIZATION: "ORGANIZATION_ADMIN",
        CLUB: "CLUB_ADMIN",
      };
    const normalizeName = (name?: string) =>
      (name || "")
        .toLocaleLowerCase()
        .replace(/\s*\([^)]*\)\s*/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    const hasAuthoritativeScopes = Boolean(user?.adminScopes?.length);
    const adminScopes = (user?.adminScopes || []).filter(
      (scope) => (!scope.status || scope.status === "ACTIVE") &&
        (!scope.academicSessionId || !forbiddenSessionIds.includes(scope.academicSessionId)),
    );

    return activeMemberships.flatMap((membership) => {
      const organizationId =
        membership.organizationId || membership.organization.id;
      const organizationType = membership.organization.type;
      const matchingScopes = adminScopes.filter((scope) => {
        if (scope.organizationId === organizationId) return true;

        const expectedType =
          expectedOrganizationTypes[scope.adminType] ||
          scope.organization?.type;
        if (expectedType !== organizationType) return false;

        const scopeName = normalizeName(
          scope.faculty?.name ||
            scope.department?.name ||
            scope.institution?.name ||
            scope.organization?.name,
        );
        const organizationName = normalizeName(membership.organization.name);

        // Type is authoritative for domain admin scopes. The name check helps
        // choose correctly when several memberships share the same type.
        return (
          !scopeName ||
          organizationName === scopeName ||
          organizationName.startsWith(scopeName) ||
          scopeName.startsWith(organizationName) ||
          activeMemberships.filter(
            (candidate) => candidate.organization.type === organizationType,
          ).length === 1
        );
      });

      // Login and /auth/me responses do not always include `adminScopes`.
      // An active organization membership that matches an assigned admin role
      // is still a valid scope and must not disable every organization query.
      const fallbackAdminType =
        adminTypeByOrganizationType[organizationType] ||
        (adminTypes.includes("ORGANIZATION_ADMIN")
          ? "ORGANIZATION_ADMIN"
          : undefined);

      if (hasAuthoritativeScopes && matchingScopes.length === 0) return [];

      if (matchingScopes.length === 0 && !fallbackAdminType) return [];
      if (
        matchingScopes.length === 0 &&
        fallbackAdminType !== "PLATFORM_ADMIN" &&
        !adminTypes.includes(fallbackAdminType)
      ) {
        return [];
      }

      const resolvedScopes: AdminScope[] = matchingScopes.length ? matchingScopes : [{
        id: `membership:${membership.id}`,
        adminType: fallbackAdminType as AdminScope["adminType"],
        status: "ACTIVE",
        academicSessionId: membership.joinedSessionId || undefined,
      }];

      return resolvedScopes.map((resolvedScope) => ({
          ...resolvedScope,
          id: `${resolvedScope.id}:${organizationId}:${resolvedScope.academicSessionId || membership.joinedSessionId || "all"}`,
          academicSessionId: resolvedScope.academicSessionId || membership.joinedSessionId || undefined,
          organizationId,
          organization: {
            id: membership.organization.id,
            name: membership.organization.name,
            slug: membership.organization.slug,
            type: organizationType,
          },
        } satisfies AdminScope));
    });
  }, [adminTypes, forbiddenSessionIds, user?.adminScopes, userOrgsData]);

  const selectedScope = useMemo(() => {
    const savedScope = selectedScopeId
      ? scopes.find((scope) => scope.id === selectedScopeId)
      : undefined;

    if (savedScope) return savedScope;

    // Prefer the current/active academic session when a saved session has
    // expired or the API has told us it is no longer authorized.
    return (
      scopes.find((scope) => scope.academicSession?.isCurrent) ||
      scopes.find((scope) => scope.academicSession?.status === "ACTIVE") ||
      scopes[0] ||
      null
    );
  }, [scopes, selectedScopeId]);

  // Persist the resolved selection, including the first authorized scope when
  // a previously saved organization is no longer available.
  useEffect(() => {
    if (selectedScope) {
      localStorage.setItem(STORAGE_KEY, selectedScope.id);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedScope]);

  const switchOrganization = useCallback(
    (scopeId: string) => {
      const scope = scopes.find((candidate) => candidate.id === scopeId);
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
