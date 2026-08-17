// apps/admin-org/app/components/AdminContext.tsx

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

interface AdminContextType {
  user: AdminUser | null;
  scopes: AdminScope[];
  selectedScopeId: string | null;
  selectedScope: AdminScope | null;
  isLoading: boolean;
  setSelectedScopeId: (scopeId: string) => void;
  switchOrganization: (scopeId: string) => void;
  hasMultipleOrgs: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = "heightt_admin_selected_scope";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading } = useAuthStore();
  const [selectedScopeId, setSelectedScopeId] = useState<string | null>(null);

  const scopes = user?.adminScopes || [];

  // Initialize selected scope
  useEffect(() => {
    if (scopes.length === 0) return;

    // 1. Check localStorage for saved selection
    const savedScopeId = localStorage.getItem(STORAGE_KEY);
    const savedScope = scopes.find((s) => s.id === savedScopeId);

    if (savedScope) {
      setSelectedScopeId(savedScope.id);
      return;
    }

    // 2. Check for activeOrganizationId from backend
    if (user?.activeOrganizationId) {
      const activeScope = scopes.find(
        (s) => s.organizationId === user.activeOrganizationId,
      );
      if (activeScope) {
        setSelectedScopeId(activeScope.id);
        return;
      }
    }

    // 3. Fallback to first scope
    setSelectedScopeId(scopes[0].id);
  }, [scopes, user]);

  // Persist selection to localStorage
  useEffect(() => {
    if (selectedScopeId) {
      localStorage.setItem(STORAGE_KEY, selectedScopeId);
    }
  }, [selectedScopeId]);

  const selectedScope = scopes.find((s) => s.id === selectedScopeId) || null;

  const switchOrganization = useCallback(
    (scopeId: string) => {
      const scope = scopes.find((s) => s.id === scopeId);
      if (scope) {
        setSelectedScopeId(scopeId);
      }
    },
    [scopes],
  );

  const value = {
    user: user || null,
    scopes,
    selectedScopeId,
    selectedScope,
    isLoading: authLoading,
    setSelectedScopeId,
    switchOrganization,
    hasMultipleOrgs: scopes.length > 1,
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
