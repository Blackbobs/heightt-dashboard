"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
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
  toast: { message: string; type: "success" | "info" | "warning" | "danger" } | null;
  showToast: (message: string, type?: "success" | "info" | "warning" | "danger") => void;

  // Data Collections
  institutions: Institution[];
  createInstitution: (data: Omit<Institution, "id" | "createdAt">) => void;
  toggleInstitutionStatus: (id: string) => void;

  faculties: Faculty[];
  createFaculty: (data: Omit<Faculty, "id">) => void;
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
    name: "Platform Admin",
    email: "admin@heightt.edu",
    avatar: "PA",
    role: "Full Platform Admin",
    permissions: initialPermissionsMap["Full Platform Admin"],
  });

  const [toast, setToast] = useState<{ message: string; type: "success" | "info" | "warning" | "danger" } | null>(null);

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
    return currentUser.permissions.includes(permission) || currentUser.permissions.includes("PLATFORM_ADMIN");
  };

  const showToast = (message: string, type: "success" | "info" | "warning" | "danger" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Mock Initial Data
  const [institutions, setInstitutions] = useState<Institution[]>([
    {
      id: "inst-1",
      name: "University of Lagos",
      code: "UNILAG",
      country: "Nigeria",
      facultiesCount: 14,
      departmentsCount: 84,
      organizationsCount: 42,
      studentsCount: 38400,
      status: "Active",
      createdAt: "2026-01-15",
    },
    {
      id: "inst-2",
      name: "University of Ibadan",
      code: "UI",
      country: "Nigeria",
      facultiesCount: 16,
      departmentsCount: 92,
      organizationsCount: 38,
      studentsCount: 34100,
      status: "Active",
      createdAt: "2026-02-01",
    },
    {
      id: "inst-3",
      name: "Kwame Nkrumah University of Science & Tech",
      code: "KNUST",
      country: "Ghana",
      facultiesCount: 12,
      departmentsCount: 68,
      organizationsCount: 29,
      studentsCount: 27500,
      status: "Active",
      createdAt: "2026-03-10",
    },
    {
      id: "inst-4",
      name: "University of Benin",
      code: "UNIBEN",
      country: "Nigeria",
      facultiesCount: 15,
      departmentsCount: 78,
      organizationsCount: 31,
      studentsCount: 29800,
      status: "Active",
      createdAt: "2026-04-05",
    },
  ]);

  const [faculties, setFaculties] = useState<Faculty[]>([
    {
      id: "fac-1",
      institutionId: "inst-1",
      institutionName: "University of Lagos (UNILAG)",
      name: "Faculty of Engineering",
      code: "ENG",
      deanName: "Prof. O. Alabi",
      departmentsCount: 6,
      status: "Active",
    },
    {
      id: "fac-2",
      institutionId: "inst-1",
      institutionName: "University of Lagos (UNILAG)",
      name: "Faculty of Science",
      code: "SCI",
      deanName: "Prof. K. Ogunleye",
      departmentsCount: 8,
      status: "Active",
    },
    {
      id: "fac-3",
      institutionId: "inst-2",
      institutionName: "University of Ibadan (UI)",
      name: "Faculty of Social Sciences",
      code: "SOC",
      deanName: "Prof. E. Danjuma",
      departmentsCount: 5,
      status: "Active",
    },
  ]);

  const [departments, setDepartments] = useState<Department[]>([
    {
      id: "dep-1",
      institutionId: "inst-1",
      institutionName: "University of Lagos (UNILAG)",
      facultyId: "fac-2",
      facultyName: "Faculty of Science",
      name: "Computer Science",
      code: "CSC",
      headName: "Dr. A. Bello",
      generatedLevels: ["100L", "200L", "300L", "400L", "Postgraduate"],
      organizationsCount: 5,
      status: "Active",
    },
    {
      id: "dep-2",
      institutionId: "inst-1",
      institutionName: "University of Lagos (UNILAG)",
      facultyId: "fac-1",
      facultyName: "Faculty of Engineering",
      name: "Mechanical Engineering",
      code: "MEG",
      headName: "Dr. C. Nwosu",
      generatedLevels: ["100L", "200L", "300L", "400L", "500L"],
      organizationsCount: 5,
      status: "Active",
    },
  ]);

  const [organizations, setOrganizations] = useState<Organization[]>([
    {
      id: "org-1",
      name: "Computer Science Dept (UNILAG)",
      type: "Department",
      institutionName: "UNILAG",
      facultyName: "Faculty of Science",
      departmentName: "Computer Science",
      studentCount: 1240,
      adminsCount: 3,
      status: "Active",
      createdAt: "2026-02-10",
    },
    {
      id: "org-2",
      name: "Mechanical Engineering 400L",
      type: "Level",
      institutionName: "UNIBEN",
      facultyName: "Faculty of Engineering",
      departmentName: "Mechanical Engineering",
      studentCount: 280,
      adminsCount: 1,
      status: "Active",
      createdAt: "2026-03-01",
    },
    {
      id: "org-3",
      name: "KNUST Business School Executive Council",
      type: "Faculty",
      institutionName: "KNUST",
      facultyName: "Business School",
      studentCount: 567,
      adminsCount: 2,
      status: "Pending",
      createdAt: "2026-05-12",
    },
  ]);

  const [administrators, setAdministrators] = useState<Administrator[]>([
    {
      id: "adm-1",
      userId: "usr-1",
      name: "John Doe",
      email: "john.doe@unilag.edu.ng",
      primaryOrganization: "Computer Science Dept (UNILAG)",
      role: "Organization Admin",
      memberships: [
        { organizationId: "org-1", organizationName: "Computer Science Dept", role: "Organization Admin", status: "Active" },
        { organizationId: "org-2", organizationName: "Mechanical Engineering 400L", role: "Financial Auditor", status: "Active" },
      ],
      status: "Active",
      assignedAt: "2026-03-01",
    },
    {
      id: "adm-2",
      userId: "usr-2",
      name: "Sarah Johnson",
      email: "s.johnson@knust.edu.gh",
      primaryOrganization: "KNUST Business School Executive Council",
      role: "Organization Admin",
      memberships: [
        { organizationId: "org-3", organizationName: "KNUST Business School", role: "Organization Admin", status: "Active" },
      ],
      status: "Active",
      assignedAt: "2026-04-14",
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    {
      id: "usr-1",
      name: "John Doe",
      username: "johndoe",
      email: "john.doe@unilag.edu.ng",
      institution: "UNILAG",
      memberships: ["Computer Science Dept", "Mechanical Engineering 400L"],
      status: "Active",
      createdAt: "2026-01-20",
    },
    {
      id: "usr-2",
      name: "Sarah Johnson",
      username: "sjohnson",
      email: "s.johnson@knust.edu.gh",
      institution: "KNUST",
      memberships: ["KNUST Business School"],
      status: "Active",
      createdAt: "2026-02-11",
    },
    {
      id: "usr-3",
      name: "Amina Yusuf",
      username: "ayusuf",
      email: "ayusuf@ui.edu.ng",
      institution: "UI",
      memberships: ["Faculty of Social Sciences"],
      status: "Pending Verification",
      createdAt: "2026-06-02",
    },
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: "anc-1",
      title: "Scheduled System Maintenance — August 2026",
      content: "Platform maintenance will take place on Aug 15 between 02:00 UTC and 04:00 UTC.",
      author: "Platform Operations Team",
      audience: "All Organizations & Students",
      status: "Published",
      createdAt: "2026-08-10",
    },
    {
      id: "anc-2",
      title: "Group Savings Feature Beta Rollout",
      content: "Selected institutions now have access to group savings pools for departmental dues.",
      author: "Product Engineering",
      audience: "Platform Administrators",
      status: "Published",
      createdAt: "2026-08-01",
    },
  ]);

  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    {
      id: "ff-1",
      key: "WALLET_ENABLE",
      name: "Wallet",
      description: "Enable student digital wallets and instant peer transfers",
      enabled: true,
      lastUpdatedBy: "Platform Admin",
      lastUpdatedAt: "2026-08-01 10:00",
    },
    {
      id: "ff-2",
      key: "SAVINGS_ENABLE",
      name: "Savings",
      description: "Enable target savings and automated group dues collection",
      enabled: false,
      lastUpdatedBy: "Platform Admin",
      lastUpdatedAt: "2026-08-05 14:30",
    },
    {
      id: "ff-3",
      key: "ELECTIONS_ENABLE",
      name: "Elections",
      description: "Enable student association e-voting module",
      enabled: false,
      lastUpdatedBy: "Operations Admin",
      lastUpdatedAt: "2026-07-20 09:15",
    },
    {
      id: "ff-4",
      key: "WITHDRAWALS_ENABLE",
      name: "Withdrawals",
      description: "Enable payout withdrawals to registered bank accounts",
      enabled: true,
      lastUpdatedBy: "Platform Admin",
      lastUpdatedAt: "2026-08-11 16:45",
    },
  ]);

  const [maintenance, setMaintenance] = useState<MaintenanceState>({
    isMaintenanceEnabled: false,
    systemStatus: "Operational",
    bannerMessage: "All Heightt platform services are fully operational.",
    scheduledWindow: "Aug 15, 2026 02:00 - 04:00 UTC",
    lastUpdatedBy: "Platform Admin",
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "log-1",
      adminName: "John Doe",
      action: "Created Organization",
      resource: "Computer Science Department",
      ipAddress: "197.210.64.12",
      deviceInfo: "Chrome 127.0 (Windows 11)",
      timestamp: "Aug 11, 2026 14:22:10",
      status: "Success",
    },
    {
      id: "log-2",
      adminName: "Platform Admin",
      action: "Updated Feature Flag",
      resource: "WITHDRAWALS_ENABLE -> ON",
      ipAddress: "102.89.23.4",
      deviceInfo: "Firefox 128.0 (macOS)",
      timestamp: "Aug 11, 2026 16:45:01",
      status: "Success",
    },
  ]);

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
        i.id === id ? { ...i, status: i.status === "Active" ? "Inactive" : "Active" } : i
      )
    );
    addAuditLog("Toggled Institution Status", id);
    showToast("Institution status updated");
  };

  const createFaculty = (data: Omit<Faculty, "id">) => {
    const newFac: Faculty = { ...data, id: `fac-${Date.now()}` };
    setFaculties([...faculties, newFac]);
    addAuditLog("Created Faculty", newFac.name);
    showToast(`Faculty "${newFac.name}" created successfully!`);
  };

  const toggleFacultyStatus = (id: string) => {
    setFaculties(
      faculties.map((f) =>
        f.id === id ? { ...f, status: f.status === "Active" ? "Inactive" : "Active" } : f
      )
    );
    showToast("Faculty status updated");
  };

  const createDepartment = (data: Omit<Department, "id">) => {
    const newDept: Department = { ...data, id: `dep-${Date.now()}` };
    setDepartments([...departments, newDept]);
    addAuditLog("Created Department", newDept.name);
    showToast(`Department "${newDept.name}" onboarded with levels!`);
  };

  const toggleDepartmentStatus = (id: string) => {
    setDepartments(
      departments.map((d) =>
        d.id === id ? { ...d, status: d.status === "Active" ? "Inactive" : "Active" } : d
      )
    );
    showToast("Department status updated");
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
          : o
      )
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
    addAuditLog("Assigned Administrator", `${newAdmin.name} (${newAdmin.primaryOrganization})`);
    showToast(`Administrator privileges assigned to ${newAdmin.name}!`);
  };

  const revokeAdminAccess = (adminId: string) => {
    if (!hasPermission("ADMIN_ASSIGN")) {
      showToast("Permission denied: ADMIN_ASSIGN required", "danger");
      return;
    }
    setAdministrators(
      administrators.map((a) => (a.id === adminId ? { ...a, status: "Revoked" } : a))
    );
    addAuditLog("Revoked Admin Access", adminId);
    showToast("Administrative access revoked", "warning");
  };

  const updateUserStatus = (userId: string, newStatus: User["status"]) => {
    setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
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
        a.id === id ? { ...a, status: a.status === "Published" ? "Draft" : "Published" } : a
      )
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
          addAuditLog("Updated Feature Flag", `${ff.key} -> ${nextState ? "ON" : "OFF"}`);
          return {
            ...ff,
            enabled: nextState,
            lastUpdatedBy: currentUser.name,
            lastUpdatedAt: new Date().toLocaleString(),
          };
        }
        return ff;
      })
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
    addAuditLog("Updated System Maintenance Mode", enabled ? "ENABLED" : "DISABLED");
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
