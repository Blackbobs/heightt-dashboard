// src/app/context/AppContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { useAuthStore } from "@/store/auth-store";
import { platformApi } from "@/lib/api/platform";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  Permission,
  Role,
  UserContextType,
  Institution,
  Faculty,
  Department,
  Organization,
  Administrator,
  User,
  Announcement,
  FeatureFlag,
  MaintenanceState,
  AuditLog,
} from "../types";

interface AppContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
  currentUser: UserContextType;
  switchRole: (role: Role) => void;
  hasPermission: (permission: Permission) => boolean;
  toast: {
    message: string;
    type: "success" | "info" | "warning" | "danger";
  } | null;
  showToast: (
    message: string,
    type?: "success" | "info" | "warning" | "danger",
  ) => void;

  // Data Collections
  institutions: Institution[];
  createInstitution: (data: Omit<Institution, "id" | "createdAt">) => void;
  toggleInstitutionStatus: (id: string) => void;

  faculties: Faculty[];
  createFaculty: (data: Omit<Faculty, "id">) => Promise<boolean>;
  toggleFacultyStatus: (id: string) => void;

  departments: Department[];
  createDepartment: (data: Omit<Department, "id">) => void;
  toggleDepartmentStatus: (id: string) => void;

  organizations: Organization[];
  createOrganization: (data: Omit<Organization, "id" | "createdAt">) => void;
  toggleOrganizationStatus: (id: string) => void;

  administrators: Administrator[];
  assignAdmin: (adminData: Omit<Administrator, "id" | "assignedAt">) => void;
  revokeAdminAccess: (adminId: string) => void;

  users: User[];
  updateUserStatus: (userId: string, newStatus: User["status"]) => void;

  announcements: Announcement[];
  createAnnouncement: (data: Omit<Announcement, "id" | "createdAt">) => void;
  toggleAnnouncementPublish: (id: string) => void;
  deleteAnnouncement: (id: string) => void;

  featureFlags: FeatureFlag[];
  toggleFeatureFlag: (id: string) => void;

  maintenance: MaintenanceState;
  toggleMaintenanceMode: (enabled: boolean, message?: string) => void;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, resource: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialPermissionsMap: Record<Role, Permission[]> = {
  "Full Platform Admin": [
    "PLATFORM_ADMIN",
    "INSTITUTION_CREATE",
    "ORGANIZATION_CREATE",
    "ADMIN_ASSIGN",
    "FEATURE_FLAG_UPDATE",
    "MAINTENANCE_UPDATE",
    "AUDIT_LOG_VIEW",
    "ANNOUNCEMENT_MANAGE",
    "USER_MANAGE",
  ],
  "Operations Admin": [
    "INSTITUTION_CREATE",
    "ORGANIZATION_CREATE",
    "ADMIN_ASSIGN",
    "ANNOUNCEMENT_MANAGE",
    "USER_MANAGE",
    "AUDIT_LOG_VIEW",
  ],
  "Auditor / Read-Only": ["AUDIT_LOG_VIEW"],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [currentUser, setCurrentUser] = useState<UserContextType>({
    name: "",
    email: "",
    avatar: "",
    role: "Operations Admin",
    permissions: [],
  });

  const { token, user: authUser } = useAuthStore();

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "warning" | "danger";
  } | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  // Sync dark class to <html> tag
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const switchRole = (newRole: Role) => {
    setCurrentUser({
      ...currentUser,
      role: newRole,
      permissions: initialPermissionsMap[newRole],
    });
    showToast(`Role switched to ${newRole}`, "info");
  };

  const hasPermission = (permission: Permission) => {
    return (
      currentUser.permissions.includes(permission) ||
      currentUser.permissions.includes("PLATFORM_ADMIN")
    );
  };

  const showToast = useCallback(
    (
      message: string,
      type: "success" | "info" | "warning" | "danger" = "success",
    ) => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setToast({ message, type });
      toastTimeoutRef.current = setTimeout(() => {
        setToast(null);
        toastTimeoutRef.current = null;
      }, 3500);
    },
    [],
  );

  // Data state
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    isMaintenanceEnabled: false,
    systemStatus: "Operational",
    bannerMessage: "",
    scheduledWindow: "",
    lastUpdatedBy: "",
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Sync current user from auth store
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        name: (authUser as any).name || (authUser as any).email || "",
        email: (authUser as any).email || "",
        avatar: (authUser as any).avatar || "",
        role: ((authUser as any).role as Role) || "Operations Admin",
        permissions: (authUser as any).permissions || [],
      });
    }
  }, [authUser]);

  // Load collections from the platform API
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    async function loadData() {
      try {
        // Load institutions
        const institutionResponse = await platformApi.getInstitutions({
          limit: 100,
        });
        const institutionData = institutionResponse.data || [];
        const nextInstitutions = institutionData.map((item: any) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          country: item.country || "—",
          facultiesCount: item.faculties?.length || 0,
          departmentsCount: 0,
          organizationsCount: 0,
          studentsCount: 0,
          status:
            item.status === "ACTIVE"
              ? ("Active" as const)
              : ("Inactive" as const),
          createdAt: item.createdAt,
        }));
        if (!mounted) return;
        setInstitutions(nextInstitutions);

        // Load faculties
        const facultyResults = await Promise.allSettled(
          institutionData.map((item: any) => platformApi.getFaculties(item.id)),
        );
        const nextFaculties = facultyResults.flatMap((result, index) =>
          result.status === "fulfilled"
            ? result.value.map((item: any) => ({
                id: item.id,
                institutionId: institutionData[index].id,
                institutionName: `${institutionData[index].name} (${institutionData[index].code})`,
                name: item.name,
                code: item.code,
                deanName: "—",
                departmentsCount: 0,
                status:
                  item.status === "ACTIVE"
                    ? ("Active" as const)
                    : ("Inactive" as const),
              }))
            : [],
        );
        if (!mounted) return;
        setFaculties(nextFaculties);

        // Load departments
        const departmentResults = await Promise.allSettled(
          nextFaculties.map((item) => platformApi.getDepartments(item.id)),
        );
        const nextDepartments = departmentResults.flatMap((result, index) =>
          result.status === "fulfilled"
            ? result.value.map((item: any) => ({
                id: item.id,
                institutionId: nextFaculties[index].institutionId,
                institutionName: nextFaculties[index].institutionName,
                facultyId: nextFaculties[index].id,
                facultyName: nextFaculties[index].name,
                name: item.name,
                code: item.code,
                headName: "—",
                generatedLevels: [],
                organizationsCount: 0,
                status:
                  item.status === "ACTIVE"
                    ? ("Active" as const)
                    : ("Inactive" as const),
              }))
            : [],
        );
        if (!mounted) return;
        setDepartments(nextDepartments);

        // Load all other data in parallel
        const results = await Promise.allSettled([
          platformApi.getOrganizations({ limit: 100 }),
          platformApi.getAdministrators(),
          platformApi.getUsers({ limit: 100 }),
          platformApi.getAnnouncements({ limit: 100 }),
          platformApi.getFeatureFlags(),
          platformApi.getMaintenanceStatus(),
          platformApi.getAuditLogs({ limit: 10 }),
        ]);
        if (!mounted) return;

        const value = (index: number) =>
          results[index].status === "fulfilled"
            ? (results[index] as PromiseFulfilledResult<any>).value
            : null;

        // Organizations
        const orgs = value(0)?.data || [];
        setOrganizations(
          orgs.map((item: any) => ({
            ...item,
            institutionName:
              nextInstitutions.find((inst) => inst.id === item.institutionId)
                ?.name || "—",
            studentCount: item.members?.length || 0,
            adminsCount: 0,
            status:
              item.status === "ACTIVE"
                ? "Active"
                : item.status === "PENDING_ACTIVATION"
                  ? "Pending"
                  : "Inactive",
          })),
        );

        // Administrators
        setAdministrators(
          (value(1) || []).map((item: any) => ({
            id: item.id,
            userId: item.userId,
            name:
              [item.user?.profile?.firstName, item.user?.profile?.lastName]
                .filter(Boolean)
                .join(" ") ||
              item.user?.username ||
              "—",
            email: item.user?.email || "—",
            memberships: [],
            primaryOrganization: item.organizationId || "Platform",
            role: item.adminType,
            status: item.status === "REVOKED" ? "Revoked" : "Active",
            assignedAt: item.assignedAt,
          })),
        );

        // Users
        setUsers(
          (value(2)?.data || []).map((item: any) => ({
            id: item.id,
            name:
              [item.profile?.firstName, item.profile?.lastName]
                .filter(Boolean)
                .join(" ") || item.username,
            username: item.username,
            email: item.email,
            institution: "—",
            memberships: [],
            status:
              item.status === "SUSPENDED"
                ? "Suspended"
                : item.emailVerified
                  ? "Active"
                  : "Pending Verification",
            createdAt: item.createdAt,
          })),
        );

        // Announcements
        setAnnouncements(
          (value(3)?.data || []).map((item: any) => ({
            id: item.id,
            title: item.title,
            content: item.content,
            author: item.author?.username || "—",
            audience: item.organization?.name || "—",
            status: item.isPublished ? "Published" : "Draft",
            createdAt: item.createdAt,
          })),
        );

        // Feature Flags
        setFeatureFlags(
          (value(4) || []).map((item: any) => ({
            ...item,
            description: item.description || "",
            lastUpdatedBy: "—",
            lastUpdatedAt: item.updatedAt,
          })),
        );

        // Maintenance
        const maint = value(5);
        if (maint) {
          setMaintenance({
            isMaintenanceEnabled: maint.enabled,
            systemStatus: maint.enabled ? "Maintenance" : "Operational",
            bannerMessage: maint.message || "System operational",
            scheduledWindow: [maint.startsAt, maint.endsAt]
              .filter(Boolean)
              .join(" – "),
            lastUpdatedBy: "—",
          });
        }

        // Audit Logs
        setAuditLogs(
          (value(6)?.data || []).map((item: any) => ({
            id: item.id,
            adminName: item.user?.username || "—",
            action: item.action,
            resource: item.entity,
            ipAddress: item.ipAddress || "—",
            deviceInfo: item.userAgent || "—",
            timestamp: item.createdAt,
            status: "Success",
            metadata: item.metadata,
          })),
        );
      } catch (err) {
        if (mounted) {
          showToast(
            getApiErrorMessage(err, "Unable to load platform data."),
            "danger",
          );
        }
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, [token]);

  const addAuditLog = (action: string, resource: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminName: currentUser.name,
      action,
      resource,
      ipAddress: "127.0.0.1",
      deviceInfo: "Browser Session",
      timestamp: new Date().toLocaleString(),
      status: "Success",
    };
    setAuditLogs([newLog, ...auditLogs]);
  };

  // CRUD Implementations
  const createInstitution = (data: Omit<Institution, "id" | "createdAt">) => {
    if (!hasPermission("INSTITUTION_CREATE")) {
      showToast("Permission denied: INSTITUTION_CREATE required", "danger");
      return;
    }
    const newInst: Institution = {
      ...data,
      id: `inst-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setInstitutions([newInst, ...institutions]);
    addAuditLog("Created Institution", newInst.name);
    showToast(`Institution "${newInst.name}" created successfully!`);
  };

  const toggleInstitutionStatus = (id: string) => {
    setInstitutions(
      institutions.map((i) =>
        i.id === id
          ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" }
          : i,
      ),
    );
    addAuditLog("Toggled Institution Status", id);
    showToast("Institution status updated");
  };

  const createFaculty = async (data: Omit<Faculty, "id">): Promise<boolean> => {
    try {
      const faculty = await platformApi.createFaculty({
        name: data.name,
        code: data.code,
        institutionId: data.institutionId,
        logo: data.logo || undefined,
      });
      setFaculties((current) => [
        ...current,
        {
          ...data,
          id: faculty.id,
          status: faculty.status === "ACTIVE" ? "Active" : "Inactive",
        },
      ]);
      showToast(`Faculty "${faculty.name}" created successfully!`);
      return true;
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to create faculty."),
        "danger",
      );
      return false;
    }
  };

  const toggleFacultyStatus = async (id: string) => {
    const current = faculties.find((faculty) => faculty.id === id);
    if (!current) return;
    try {
      const nextStatus = current.status === "Active" ? "INACTIVE" : "ACTIVE";
      await platformApi.updateFaculty(id, { status: nextStatus });
      setFaculties((items) =>
        items.map((faculty) =>
          faculty.id === id
            ? {
                ...faculty,
                status: nextStatus === "ACTIVE" ? "Active" : "Inactive",
              }
            : faculty,
        ),
      );
      showToast("Faculty status updated");
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to update faculty status."),
        "danger",
      );
    }
  };

  const createDepartment = async (data: Omit<Department, "id">) => {
    try {
      const department = await platformApi.createDepartment({
        name: data.name,
        code: data.code,
        facultyId: data.facultyId,
        logo: data.logo || undefined,
      });
      setDepartments((current) => [
        ...current,
        {
          ...data,
          id: department.id,
          status: department.status === "ACTIVE" ? "Active" : "Inactive",
        },
      ]);
      showToast(`Department "${department.name}" created successfully!`);
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to create department."),
        "danger",
      );
    }
  };

  const toggleDepartmentStatus = async (id: string) => {
    const current = departments.find((department) => department.id === id);
    if (!current) return;
    try {
      const nextStatus = current.status === "Active" ? "INACTIVE" : "ACTIVE";
      await platformApi.updateDepartment(id, { status: nextStatus });
      setDepartments((items) =>
        items.map((department) =>
          department.id === id
            ? {
                ...department,
                status: nextStatus === "ACTIVE" ? "Active" : "Inactive",
              }
            : department,
        ),
      );
      showToast("Department status updated");
    } catch (error) {
      showToast(
        getApiErrorMessage(error, "Unable to update department status."),
        "danger",
      );
    }
  };

  const createOrganization = (data: Omit<Organization, "id" | "createdAt">) => {
    if (!hasPermission("ORGANIZATION_CREATE")) {
      showToast("Permission denied: ORGANIZATION_CREATE required", "danger");
      return;
    }
    const newOrg: Organization = {
      ...data,
      id: `org-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setOrganizations([newOrg, ...organizations]);
    addAuditLog("Created Organization", newOrg.name);
    showToast(`Organization "${newOrg.name}" created!`);
  };

  const toggleOrganizationStatus = (id: string) => {
    setOrganizations(
      organizations.map((o) =>
        o.id === id
          ? { ...o, status: o.status === "Active" ? "Inactive" : "Active" }
          : o,
      ),
    );
    showToast("Organization status updated");
  };

  const assignAdmin = (adminData: Omit<Administrator, "id" | "assignedAt">) => {
    if (!hasPermission("ADMIN_ASSIGN")) {
      showToast("Permission denied: ADMIN_ASSIGN required", "danger");
      return;
    }
    const newAdmin: Administrator = {
      ...adminData,
      id: `adm-${Date.now()}`,
      assignedAt: new Date().toISOString().split("T")[0],
    };
    setAdministrators([newAdmin, ...administrators]);
    addAuditLog(
      "Assigned Administrator",
      `${newAdmin.name} (${newAdmin.primaryOrganization})`,
    );
    showToast(`Administrator privileges assigned to ${newAdmin.name}!`);
  };

  const revokeAdminAccess = (adminId: string) => {
    if (!hasPermission("ADMIN_ASSIGN")) {
      showToast("Permission denied: ADMIN_ASSIGN required", "danger");
      return;
    }
    setAdministrators(
      administrators.map((a) =>
        a.id === adminId ? { ...a, status: "Revoked" } : a,
      ),
    );
    addAuditLog("Revoked Admin Access", adminId);
    showToast("Administrative access revoked", "warning");
  };

  const updateUserStatus = (userId: string, newStatus: User["status"]) => {
    setUsers(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)),
    );
    addAuditLog("Updated User Account Status", `${userId} -> ${newStatus}`);
    showToast(`User status updated to ${newStatus}`);
  };

  const createAnnouncement = (data: Omit<Announcement, "id" | "createdAt">) => {
    const newAnc: Announcement = {
      ...data,
      id: `anc-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setAnnouncements([newAnc, ...announcements]);
    addAuditLog("Created Announcement", newAnc.title);
    showToast("Platform announcement created!");
  };

  const toggleAnnouncementPublish = (id: string) => {
    setAnnouncements(
      announcements.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "Published" ? "Draft" : "Published" }
          : a,
      ),
    );
    showToast("Announcement publish status updated");
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(announcements.filter((a) => a.id !== id));
    addAuditLog("Deleted Announcement", id);
    showToast("Announcement deleted", "warning");
  };

  const toggleFeatureFlag = (id: string) => {
    if (!hasPermission("FEATURE_FLAG_UPDATE")) {
      showToast("Permission denied: FEATURE_FLAG_UPDATE required", "danger");
      return;
    }
    setFeatureFlags(
      featureFlags.map((ff) => {
        if (ff.id === id) {
          const nextState = !ff.enabled;
          addAuditLog(
            "Updated Feature Flag",
            `${ff.key} -> ${nextState ? "ON" : "OFF"}`,
          );
          return {
            ...ff,
            enabled: nextState,
            lastUpdatedBy: currentUser.name,
            lastUpdatedAt: new Date().toLocaleString(),
          };
        }
        return ff;
      }),
    );
    showToast("Feature flag toggled");
  };

  const toggleMaintenanceMode = (enabled: boolean, message?: string) => {
    if (!hasPermission("MAINTENANCE_UPDATE")) {
      showToast("Permission denied: MAINTENANCE_UPDATE required", "danger");
      return;
    }
    setMaintenance({
      ...maintenance,
      isMaintenanceEnabled: enabled,
      systemStatus: enabled ? "Maintenance" : "Operational",
      bannerMessage: message || maintenance.bannerMessage,
      lastUpdatedBy: currentUser.name,
    });
    addAuditLog(
      "Updated System Maintenance Mode",
      enabled ? "ENABLED" : "DISABLED",
    );
    showToast(`System maintenance mode ${enabled ? "enabled" : "disabled"}`);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        switchRole,
        hasPermission,
        toast,
        showToast,
        institutions,
        createInstitution,
        toggleInstitutionStatus,
        faculties,
        createFaculty,
        toggleFacultyStatus,
        departments,
        createDepartment,
        toggleDepartmentStatus,
        organizations,
        createOrganization,
        toggleOrganizationStatus,
        administrators,
        assignAdmin,
        revokeAdminAccess,
        users,
        updateUserStatus,
        announcements,
        createAnnouncement,
        toggleAnnouncementPublish,
        deleteAnnouncement,
        featureFlags,
        toggleFeatureFlag,
        maintenance,
        toggleMaintenanceMode,
        auditLogs,
        addAuditLog,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
