"use client";

import React, { createContext, useContext, useState } from "react";

export type Permission =
  // Dues
  | "DUE_CREATE"
  | "DUE_UPDATE"
  | "DUE_DELETE"
  | "DUE_VIEW"
  // Students
  | "STUDENT_ADD"
  | "STUDENT_VIEW"
  | "STUDENT_UPDATE"
  | "STUDENT_DELETE"
  // Announcements
  | "ANNOUNCEMENT_CREATE"
  | "ANNOUNCEMENT_UPDATE"
  | "ANNOUNCEMENT_DELETE"
  | "ANNOUNCEMENT_PUBLISH"
  // Finance
  | "FINANCE_VIEW"
  | "FINANCE_EXPORT"
  | "WITHDRAWAL_REQUEST"
  | "FINANCE_APPROVE";

export type RoleKey = "HEAD" | "SECRETARY" | "FINANCE" | "VIEWER";

export interface RolePreset {
  key: RoleKey;
  name: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_PRESETS: Record<RoleKey, RolePreset> = {
  HEAD: {
    key: "HEAD",
    name: "Department Head",
    description: "Full administrative & financial access across all modules",
    permissions: [
      "DUE_CREATE",
      "DUE_UPDATE",
      "DUE_DELETE",
      "DUE_VIEW",
      "STUDENT_ADD",
      "STUDENT_VIEW",
      "STUDENT_UPDATE",
      "STUDENT_DELETE",
      "ANNOUNCEMENT_CREATE",
      "ANNOUNCEMENT_UPDATE",
      "ANNOUNCEMENT_DELETE",
      "ANNOUNCEMENT_PUBLISH",
      "FINANCE_VIEW",
      "FINANCE_EXPORT",
      "WITHDRAWAL_REQUEST",
      "FINANCE_APPROVE",
    ],
  },
  SECRETARY: {
    key: "SECRETARY",
    name: "Department Secretary",
    description:
      "Can create dues, add students, & write announcements (No deletes / withdrawals)",
    permissions: [
      "DUE_VIEW",
      "DUE_CREATE",
      "DUE_UPDATE",
      "STUDENT_ADD",
      "STUDENT_VIEW",
      "ANNOUNCEMENT_CREATE",
      "ANNOUNCEMENT_UPDATE",
      "FINANCE_VIEW",
    ],
  },
  FINANCE: {
    key: "FINANCE",
    name: "Finance Officer",
    description: "Financial overview, report exports, & withdrawal requests",
    permissions: [
      "FINANCE_VIEW",
      "FINANCE_EXPORT",
      "WITHDRAWAL_REQUEST",
      "DUE_VIEW",
      "STUDENT_VIEW",
    ],
  },
  VIEWER: {
    key: "VIEWER",
    name: "Read-Only Visitor",
    description: "Can view dashboards & listings (All action buttons hidden)",
    permissions: ["DUE_VIEW", "STUDENT_VIEW", "FINANCE_VIEW"],
  },
};

interface PermissionContextType {
  role: RoleKey;
  setRole: (role: RoleKey) => void;
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(
  undefined,
);

export function PermissionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRoleState] = useState<RoleKey>("HEAD");
  const [permissions, setPermissions] = useState<Permission[]>(
    ROLE_PRESETS.HEAD.permissions,
  );

  const setRole = (newRole: RoleKey) => {
    setRoleState(newRole);
    setPermissions(ROLE_PRESETS[newRole].permissions);
  };

  const hasPermission = (permission: Permission): boolean => {
    return permissions.includes(permission);
  };

  return (
    <PermissionContext.Provider
      value={{
        role,
        setRole,
        permissions,
        hasPermission,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
