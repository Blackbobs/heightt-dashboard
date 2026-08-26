// src/app/components/AdministratorsView.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  usePlatformAdministrators,
  useAssignAdmin,
  useRevokeAdmin,
} from "@/hooks/platform/usePlatformAdministrators";
import {
  usePlatformAllPermissions,
  useAssignAdminWithPermissions,
  useUpdateAdminPermissions,
} from "@/hooks/platform/usePlatformAdminPermissions";
import { usePlatformUsers } from "@/hooks/platform/usePlatformUsers";
import { usePlatformInstitutions } from "@/hooks/platform/usePlatformInstitutions";
import { usePlatformFaculties } from "@/hooks/platform/usePlatformFaculties";
import { usePlatformDepartments } from "@/hooks/platform/usePlatformDepartments";
import { usePlatformOrganizations } from "@/hooks/platform/usePlatformOrganizations";
import { usePlatformAcademicSessions } from "@/hooks/platform/usePlatformAcademicSessions";
import {
  Shield,
  Plus,
  Search,
  UserX,
  Loader2,
  Calendar,
  Building2,
  Layers,
  GitBranch,
  Flag,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Edit2,
  X,
  Save,
  UserCog,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { PERMISSION_CATEGORIES, PermissionCategoryKey } from "@/lib/api/types";
import { platformApi } from "@/lib/api/platform";

// ============================================
// CONSTANTS
// ============================================

const ADMIN_TYPES = [
  { value: "PLATFORM_ADMIN", label: "Platform Admin", requires: [] },
  {
    value: "INSTITUTION_ADMIN",
    label: "Institution Admin",
    requires: ["institutionId"],
  },
  {
    value: "FACULTY_ADMIN",
    label: "Faculty Admin",
    requires: ["institutionId", "facultyId"],
  },
  {
    value: "DEPARTMENT_ADMIN",
    label: "Department Admin",
    requires: ["institutionId", "facultyId", "departmentId"],
  },
  {
    value: "ORGANIZATION_ADMIN",
    label: "Organization Admin",
    requires: ["organizationId"],
  },
  {
    value: "CLUB_ADMIN",
    label: "Club Admin",
    requires: ["organizationId"],
  },
];

// ============================================
// EDIT ADMIN PERMISSIONS MODAL
// ============================================

interface EditAdminPermissionsModalProps {
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminType: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function EditAdminPermissionsModal({
  adminId,
  adminName,
  adminEmail,
  adminType,
  isOpen,
  onClose,
  onSuccess,
}: EditAdminPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminPermissions, setAdminPermissions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updatePermissionsMutation = useUpdateAdminPermissions();

  // Load existing permissions when modal opens
  useEffect(() => {
    if (isOpen && adminId) {
      setIsLoading(true);
      setError(null);
      fetchAdminPermissions();
    }
  }, [isOpen, adminId]);

  const fetchAdminPermissions = async () => {
    try {
      const data = await platformApi.getAdminWithPermissions(adminId);
      const permissions = Array.isArray(data?.permissions)
        ? data.permissions
        : [];
      setAdminPermissions(permissions);
      setSelectedPermissions(
        permissions.map((permission: any) => permission.permissionKey),
      );
      // Expand all categories by default
      setExpandedCategories(Object.keys(PERMISSION_CATEGORIES));
    } catch (error) {
      console.error("Failed to fetch admin permissions:", error);
      // Use empty state on error
      setAdminPermissions([]);
      setSelectedPermissions([]);
      setExpandedCategories(Object.keys(PERMISSION_CATEGORIES));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Toggle permission selection
  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((c) => c !== categoryKey)
        : [...prev, categoryKey],
    );
  };

  // Select all permissions in a category
  const selectAllInCategory = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    setSelectedPermissions((prev) => {
      const newSelected = [...prev];
      for (const key of categoryPermissionKeys) {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      }
      return newSelected;
    });
  };

  // Deselect all permissions in a category
  const deselectAllInCategory = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    setSelectedPermissions((prev) =>
      prev.filter((p) => !categoryPermissionKeys.includes(p)),
    );
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    return categoryPermissionKeys.every((key) =>
      selectedPermissions.includes(key),
    );
  };

  // Check if any permissions in a category are selected
  const isCategoryPartiallySelected = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    const selectedInCategory = categoryPermissionKeys.filter((key) =>
      selectedPermissions.includes(key),
    );
    return (
      selectedInCategory.length > 0 &&
      selectedInCategory.length < categoryPermissionKeys.length
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const existingPermissions = adminPermissions.map(
        (permission: any) => permission.permissionKey,
      );
      const permissionsToAdd = selectedPermissions.filter(
        (permission) => !existingPermissions.includes(permission),
      );
      const permissionsToRemove = existingPermissions.filter(
        (permission: string) => !selectedPermissions.includes(permission),
      );

      if (permissionsToAdd.length > 0) {
        await updatePermissionsMutation.mutateAsync({
          adminId,
          data: { permissions: permissionsToAdd, action: "ADD" },
        });
      }
      if (permissionsToRemove.length > 0) {
        await updatePermissionsMutation.mutateAsync({
          adminId,
          data: { permissions: permissionsToRemove, action: "REMOVE" },
        });
      }

      // Verify and display the backend's authoritative result.
      await fetchAdminPermissions();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to update permissions:", error);
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update permissions. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
              <Shield className="w-5 h-5 text-[#1a5cff]" />
              Loading Permissions...
            </h2>
          </div>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <UserCog className="w-5 h-5 text-[#1a5cff]" />
            Edit Permissions
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-lg font-bold">
              {adminName.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-slate-900">{adminName}</div>
              <div className="text-sm text-slate-500">{adminEmail}</div>
              <div className="text-xs text-purple-600 font-medium mt-0.5">
                {adminType}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <p className="text-sm text-slate-500 mb-4">
          Select the permissions this administrator should have. Deselecting a
          permission will revoke access to that specific feature.
        </p>

        <div className="border rounded-lg overflow-hidden">
          {Object.entries(PERMISSION_CATEGORIES).map(
            ([categoryKey, category]) => {
              const isExpanded = expandedCategories.includes(categoryKey);
              const isFullySelected = isCategoryFullySelected(categoryKey);
              const isPartiallySelected =
                isCategoryPartiallySelected(categoryKey);

              return (
                <div key={categoryKey} className="border-b last:border-b-0">
                  {/* Category Header */}
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                    onClick={() => toggleCategory(categoryKey)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer",
                          isFullySelected
                            ? "bg-blue-600 border-blue-600"
                            : isPartiallySelected
                              ? "border-blue-600 bg-blue-100"
                              : "border-slate-300",
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isFullySelected) {
                            deselectAllInCategory(categoryKey);
                          } else {
                            selectAllInCategory(categoryKey);
                          }
                        }}
                      >
                        {isFullySelected && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                        {isPartiallySelected && (
                          <div className="w-2 h-2 rounded-sm bg-blue-600" />
                        )}
                      </div>
                      <span className="font-medium text-sm text-slate-700">
                        {category.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        ({category.permissions.length} permissions)
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {/* Permission List */}
                  {isExpanded && (
                    <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
                      {category.permissions.map((perm) => {
                        const isSelected = selectedPermissions.includes(
                          perm.key,
                        );
                        return (
                          <label
                            key={perm.key}
                            className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => togglePermission(perm.key)}
                              className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-600">{perm.label}</span>
                            <span className="text-[10px] text-slate-400 ml-auto">
                              {perm.action}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            },
          )}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>
            Selected: <strong>{selectedPermissions.length}</strong> permissions
          </span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => {
                if (selectedPermissions.length === 0) {
                  // Select all permissions
                  const allKeys = Object.values(PERMISSION_CATEGORIES).flatMap(
                    (cat) => cat.permissions.map((p) => p.key),
                  );
                  setSelectedPermissions(allKeys);
                } else {
                  // Deselect all
                  setSelectedPermissions([]);
                }
              }}
            >
              {selectedPermissions.length === 0 ? "Select All" : "Deselect All"}
            </button>
            <button
              type="button"
              className="text-slate-500 hover:text-slate-700"
              onClick={() => {
                if (adminPermissions) {
                  setSelectedPermissions(
                    adminPermissions.map((p: any) => p.permissionKey),
                  );
                }
              }}
            >
              Reset to Current
            </button>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            className="px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
            onClick={() => onClose()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={isSubmitting || updatePermissionsMutation.isPending}
          >
            {isSubmitting || updatePermissionsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Permissions
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN ADMINISTRATORS VIEW
// ============================================

export default function AdministratorsView() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);
  const [isEditPermissionsOpen, setIsEditPermissionsOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    adminType: "ORGANIZATION_ADMIN",
    institutionId: "",
    facultyId: "",
    departmentId: "",
    organizationId: "",
    academicSessionId: "",
  });

  const {
    data: admins,
    isLoading: adminsLoading,
    refetch: refetchAdmins,
  } = usePlatformAdministrators();
  const { data: usersData } = usePlatformUsers({ limit: 100 });
  const { data: institutionsData } = usePlatformInstitutions({ limit: 100 });
  const { data: allPermissions, isLoading: permissionsLoading } =
    usePlatformAllPermissions();

  const {
    data: facultiesData,
    isLoading: facultiesLoading,
    refetch: refetchFaculties,
  } = usePlatformFaculties(formData.institutionId);

  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    refetch: refetchDepartments,
  } = usePlatformDepartments({ facultyId: formData.facultyId });

  const {
    data: organizationsData,
    isLoading: organizationsLoading,
    refetch: refetchOrganizations,
  } = usePlatformOrganizations({
    institutionId: formData.institutionId || undefined,
    limit: 100,
  });

  const { data: sessionsData, isLoading: sessionsLoading } =
    usePlatformAcademicSessions(formData.institutionId);

  const assignMutation = useAssignAdmin();
  const assignWithPermissionsMutation = useAssignAdminWithPermissions();
  const revokeMutation = useRevokeAdmin();

  const administrators = admins || [];
  const users = usersData?.data || [];
  const institutions = institutionsData?.data || [];
  const faculties = Array.isArray(facultiesData)
    ? facultiesData
    : (facultiesData as any)?.data || [];
  const departments = Array.isArray(departmentsData)
    ? departmentsData
    : (departmentsData as any)?.data || [];
  const organizations = organizationsData?.data || [];
  const sessions = sessionsData || [];
  const permissions = allPermissions || [];

  // Refetch faculties when institution changes
  useEffect(() => {
    if (formData.institutionId) {
      refetchFaculties();
    }
  }, [formData.institutionId, refetchFaculties]);

  // Refetch departments when faculty changes
  useEffect(() => {
    if (formData.facultyId) {
      refetchDepartments();
    }
  }, [formData.facultyId, refetchDepartments]);

  // Refetch organizations when institution changes
  useEffect(() => {
    if (formData.institutionId) {
      refetchOrganizations();
    }
  }, [formData.institutionId, refetchOrganizations]);

  const handleAdminTypeChange = (type: string) => {
    // Reset permissions when admin type changes
    setSelectedPermissions([]);
    setExpandedCategories([]);
    setFormData({
      ...formData,
      adminType: type,
      institutionId: "",
      facultyId: "",
      departmentId: "",
      organizationId: "",
      academicSessionId: "",
    });
  };

  const isFieldRequired = (field: string) => {
    const adminType = ADMIN_TYPES.find((t) => t.value === formData.adminType);
    return adminType?.requires?.includes(field) || false;
  };

  const shouldShowField = (field: string) => {
    const adminType = ADMIN_TYPES.find((t) => t.value === formData.adminType);
    if (!adminType) return false;

    if (field === "organizationId") {
      return ["ORGANIZATION_ADMIN", "CLUB_ADMIN"].includes(formData.adminType);
    }

    if (field === "academicSessionId") {
      return formData.adminType !== "PLATFORM_ADMIN";
    }

    if (["institutionId", "facultyId", "departmentId"].includes(field)) {
      return [
        "INSTITUTION_ADMIN",
        "FACULTY_ADMIN",
        "DEPARTMENT_ADMIN",
      ].includes(formData.adminType);
    }

    return false;
  };

  // Toggle permission selection
  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey],
    );
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((c) => c !== categoryKey)
        : [...prev, categoryKey],
    );
  };

  // Select all permissions in a category
  const selectAllInCategory = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    setSelectedPermissions((prev) => {
      const newSelected = [...prev];
      for (const key of categoryPermissionKeys) {
        if (!newSelected.includes(key)) {
          newSelected.push(key);
        }
      }
      return newSelected;
    });
  };

  // Deselect all permissions in a category
  const deselectAllInCategory = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    setSelectedPermissions((prev) =>
      prev.filter((p) => !categoryPermissionKeys.includes(p)),
    );
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    return categoryPermissionKeys.every((key) =>
      selectedPermissions.includes(key),
    );
  };

  // Check if any permissions in a category are selected
  const isCategoryPartiallySelected = (categoryKey: string) => {
    const category =
      PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    const selectedInCategory = categoryPermissionKeys.filter((key) =>
      selectedPermissions.includes(key),
    );
    return (
      selectedInCategory.length > 0 &&
      selectedInCategory.length < categoryPermissionKeys.length
    );
  };

  const filteredAdmins = administrators.filter((admin) => {
    const searchLower = search.toLowerCase();
    return (
      admin.user?.username?.toLowerCase().includes(searchLower) ||
      admin.user?.email?.toLowerCase().includes(searchLower) ||
      admin.adminType?.toLowerCase().includes(searchLower)
    );
  });

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();

    const adminType = ADMIN_TYPES.find((t) => t.value === formData.adminType);
    if (adminType) {
      for (const required of adminType.requires) {
        if (!formData[required as keyof typeof formData]) {
          alert(`Please select a ${required.replace("Id", "")}`);
          return;
        }
      }
    }

    try {
      await assignWithPermissionsMutation.mutateAsync({
        userId: formData.userId,
        adminType: formData.adminType as
          | "PLATFORM_ADMIN"
          | "INSTITUTION_ADMIN"
          | "FACULTY_ADMIN"
          | "DEPARTMENT_ADMIN"
          | "ORGANIZATION_ADMIN"
          | "CLUB_ADMIN",
        institutionId: formData.institutionId || undefined,
        facultyId: formData.facultyId || undefined,
        departmentId: formData.departmentId || undefined,
        organizationId: formData.organizationId || undefined,
        academicSessionId: formData.academicSessionId || undefined,
        permissions: selectedPermissions,
      });
      setIsModalOpen(false);
      setFormData({
        userId: "",
        adminType: "ORGANIZATION_ADMIN",
        institutionId: "",
        facultyId: "",
        departmentId: "",
        organizationId: "",
        academicSessionId: "",
      });
      setSelectedPermissions([]);
      setExpandedCategories([]);
      refetchAdmins();
    } catch (error: any) {
      console.error("Failed to assign admin:", error);
      alert(error?.response?.data?.message || "Failed to assign admin role");
    }
  };

  const handleRevoke = async (adminId: string, name: string) => {
    if (confirm(`Are you sure you want to revoke admin access for ${name}?`)) {
      try {
        await revokeMutation.mutateAsync(adminId);
        refetchAdmins();
      } catch (error: any) {
        console.error("Failed to revoke admin:", error);
        alert(error?.response?.data?.message || "Failed to revoke admin role");
      }
    }
  };

  const getAdminTypeLabel = (type: string) => {
    const found = ADMIN_TYPES.find((t) => t.value === type);
    return (
      found?.label ||
      type
        .replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase())
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-600",
      INACTIVE: "bg-slate-100 text-slate-500",
      REVOKED: "bg-red-50 text-red-600",
    };
    return colors[status] || colors.INACTIVE;
  };

  const handleEditPermissions = (admin: any) => {
    setEditingAdmin(admin);
    setIsEditPermissionsOpen(true);
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "admin",
        header: "Administrator",
        cell: ({ row }) => {
          const admin = row.original;
          const initials =
            admin.user?.profile?.firstName && admin.user?.profile?.lastName
              ? `${admin.user.profile.firstName[0]}${admin.user.profile.lastName[0]}`.toUpperCase()
              : admin.user?.username?.substring(0, 2).toUpperCase() || "A";

          return (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">
                {initials}
              </div>
              <div>
                <div className="font-semibold">
                  {admin.user?.profile?.firstName &&
                  admin.user?.profile?.lastName
                    ? `${admin.user.profile.firstName} ${admin.user.profile.lastName}`
                    : admin.user?.username || "Unknown"}
                </div>
                <div className="text-xs text-slate-400">
                  {admin.user?.email}
                </div>
              </div>
            </div>
          );
        },
      },
      { accessorKey: "user.email", header: "Email" },
      {
        accessorFn: (row) => row.adminType,
        id: "role",
        header: "Role",
        cell: ({ getValue }) => {
          const type = getValue() as string;
          const found = ADMIN_TYPES.find((t) => t.value === type);
          return (
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {found?.label || type}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => {
          if (row.organization?.name) return row.organization.name;
          if (row.institution?.name) return row.institution.name;
          if (row.faculty?.name)
            return `${row.faculty.name} (${row.institution?.name})`;
          if (row.department?.name)
            return `${row.department.name} (${row.faculty?.name})`;
          return "Platform-wide";
        },
        id: "scope",
        header: "Scope",
      },
      {
        accessorFn: (row) => row.academicSession?.name || "N/A",
        id: "session",
        header: "Session",
        cell: ({ getValue }) => (
          <span className="text-xs text-slate-600">{getValue()}</span>
        ),
      },
      {
        accessorFn: (row) => new Date(row.assignedAt).toLocaleDateString(),
        id: "assigned",
        header: "Assigned",
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const colors: Record<string, string> = {
            ACTIVE: "bg-emerald-50 text-emerald-600",
            INACTIVE: "bg-slate-100 text-slate-500",
            REVOKED: "bg-red-50 text-red-600",
          };
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.INACTIVE}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : status === "REVOKED" ? "bg-red-500" : "bg-slate-400"}`}
              />
              {status}
            </span>
          );
        },
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const admin = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              {admin.status === "ACTIVE" && (
                <>
                  <button
                    className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                    onClick={() => handleEditPermissions(admin)}
                    title="Edit Permissions"
                  >
                    <UserCog className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    onClick={() =>
                      handleRevoke(admin.id, admin.user?.username || "Unknown")
                    }
                    title="Revoke Admin Access"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [handleEditPermissions, handleRevoke],
  );

  if (adminsLoading || permissionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#1a5cff]" />
            Platform Administrators
          </h1>
          <p>
            Manage administrative memberships and permissions across the
            platform
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Assign Admin
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {filteredAdmins.length} Administrators
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {filteredAdmins.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No administrators found.
          </div>
        ) : (
          <DataTable columns={columns} data={filteredAdmins} />
        )}
      </div>

      {/* Assign Admin Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Shield className="w-5 h-5 text-[#1a5cff]" />
                Assign Administrator
              </h2>
              <button
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssign}>
              {/* User Selection */}
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  User <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                  value={formData.userId}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: e.target.value })
                  }
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.profile?.firstName && user.profile?.lastName
                        ? `${user.profile.firstName} ${user.profile.lastName}`
                        : user.username}{" "}
                      ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Admin Type Selection */}
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Admin Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                  value={formData.adminType}
                  onChange={(e) => handleAdminTypeChange(e.target.value)}
                  required
                >
                  {ADMIN_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Select the scope of administrative access
                </p>
              </div>

              {/* Institution Field */}
              {shouldShowField("institutionId") && (
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Institution{" "}
                    {isFieldRequired("institutionId") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                    value={formData.institutionId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        institutionId: value,
                        facultyId: "",
                        departmentId: "",
                        academicSessionId: "",
                      });
                    }}
                    required={isFieldRequired("institutionId")}
                  >
                    <option value="">Select Institution</option>
                    {institutions.map((inst) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.name} ({inst.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Faculty Field */}
              {shouldShowField("facultyId") && (
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Faculty{" "}
                    {isFieldRequired("facultyId") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                    value={formData.facultyId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData({
                        ...formData,
                        facultyId: value,
                        departmentId: "",
                      });
                    }}
                    required={isFieldRequired("facultyId")}
                    disabled={!formData.institutionId || facultiesLoading}
                  >
                    <option value="">
                      {!formData.institutionId
                        ? "Please select an institution first"
                        : facultiesLoading
                          ? "Loading faculties..."
                          : "Select Faculty"}
                    </option>
                    {faculties.map((faculty: any) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name} ({faculty.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Department Field */}
              {shouldShowField("departmentId") && (
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Department{" "}
                    {isFieldRequired("departmentId") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                    value={formData.departmentId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departmentId: e.target.value,
                      })
                    }
                    required={isFieldRequired("departmentId")}
                    disabled={!formData.facultyId || departmentsLoading}
                  >
                    <option value="">
                      {!formData.facultyId
                        ? "Please select a faculty first"
                        : departmentsLoading
                          ? "Loading departments..."
                          : "Select Department"}
                    </option>
                    {departments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Organization Field */}
              {shouldShowField("organizationId") && (
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Organization{" "}
                    {isFieldRequired("organizationId") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                    value={formData.organizationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationId: e.target.value,
                      })
                    }
                    required={isFieldRequired("organizationId")}
                    disabled={organizationsLoading}
                  >
                    <option value="">
                      {organizationsLoading
                        ? "Loading organizations..."
                        : "Select Organization"}
                    </option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Academic Session Field */}
              {shouldShowField("academicSessionId") && (
                <div className="form-group">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Academic Session{" "}
                    {isFieldRequired("academicSessionId") && (
                      <span className="text-red-500">*</span>
                    )}
                  </label>
                  <select
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                    value={formData.academicSessionId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicSessionId: e.target.value,
                      })
                    }
                    disabled={!formData.institutionId || sessionsLoading}
                  >
                    <option value="">
                      {!formData.institutionId
                        ? "Please select an institution first"
                        : sessionsLoading
                          ? "Loading sessions..."
                          : "Select Academic Session"}
                    </option>
                    {sessions.map((session) => (
                      <option key={session.id} value={session.id}>
                        {session.name} {session.isCurrent ? "(Current)" : ""}
                      </option>
                    ))}
                  </select>
                  {!formData.institutionId && (
                    <p className="text-xs text-amber-500 mt-1">
                      Please select an institution first
                    </p>
                  )}
                </div>
              )}

              {/* Permissions Section */}
              <div className="form-group">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Permissions
                </label>
                <p className="text-xs text-slate-400 mb-3">
                  Select the permissions this administrator should have. Leave
                  empty to use default permissions for the admin type.
                </p>

                <div className="border rounded-lg overflow-hidden">
                  {Object.entries(PERMISSION_CATEGORIES).map(
                    ([categoryKey, category]) => {
                      const isExpanded =
                        expandedCategories.includes(categoryKey);
                      const isFullySelected =
                        isCategoryFullySelected(categoryKey);
                      const isPartiallySelected =
                        isCategoryPartiallySelected(categoryKey);

                      return (
                        <div
                          key={categoryKey}
                          className="border-b last:border-b-0"
                        >
                          {/* Category Header */}
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors"
                            onClick={() => toggleCategory(categoryKey)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors",
                                  isFullySelected
                                    ? "bg-blue-600 border-blue-600"
                                    : isPartiallySelected
                                      ? "border-blue-600 bg-blue-100"
                                      : "border-slate-300",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isFullySelected) {
                                    deselectAllInCategory(categoryKey);
                                  } else {
                                    selectAllInCategory(categoryKey);
                                  }
                                }}
                              >
                                {isFullySelected && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                                {isPartiallySelected && (
                                  <div className="w-2 h-2 rounded-sm bg-blue-600" />
                                )}
                              </div>
                              <span className="font-medium text-sm text-slate-700">
                                {category.label}
                              </span>
                              <span className="text-xs text-slate-400">
                                ({category.permissions.length} permissions)
                              </span>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </button>

                          {/* Permission List */}
                          {isExpanded && (
                            <div className="px-4 pb-3 grid grid-cols-2 gap-1.5">
                              {category.permissions.map((perm) => {
                                const isSelected = selectedPermissions.includes(
                                  perm.key,
                                );
                                return (
                                  <label
                                    key={perm.key}
                                    className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-50 cursor-pointer text-sm"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() =>
                                        togglePermission(perm.key)
                                      }
                                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-600">
                                      {perm.label}
                                    </span>
                                    <span className="text-[10px] text-slate-400 ml-auto">
                                      {perm.action}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    },
                  )}
                </div>

                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    Selected: <strong>{selectedPermissions.length}</strong>{" "}
                    permissions
                  </span>
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => {
                      if (selectedPermissions.length === 0) {
                        const allKeys = Object.values(
                          PERMISSION_CATEGORIES,
                        ).flatMap((cat) => cat.permissions.map((p) => p.key));
                        setSelectedPermissions(allKeys);
                      } else {
                        setSelectedPermissions([]);
                      }
                    }}
                  >
                    {selectedPermissions.length === 0
                      ? "Select All"
                      : "Deselect All"}
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold">Role Summary:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>
                        <strong>Type:</strong>{" "}
                        {getAdminTypeLabel(formData.adminType)}
                      </li>
                      {formData.institutionId && (
                        <li>
                          <strong>Institution:</strong>{" "}
                          {institutions.find(
                            (i) => i.id === formData.institutionId,
                          )?.name || "Selected"}
                        </li>
                      )}
                      {formData.facultyId && (
                        <li>
                          <strong>Faculty:</strong>{" "}
                          {faculties.find(
                            (f: any) => f.id === formData.facultyId,
                          )?.name || "Selected"}
                        </li>
                      )}
                      {formData.departmentId && (
                        <li>
                          <strong>Department:</strong>{" "}
                          {departments.find(
                            (d: any) => d.id === formData.departmentId,
                          )?.name || "Selected"}
                        </li>
                      )}
                      {formData.organizationId && (
                        <li>
                          <strong>Organization:</strong>{" "}
                          {organizations.find(
                            (o) => o.id === formData.organizationId,
                          )?.name || "Selected"}
                        </li>
                      )}
                      {formData.academicSessionId && (
                        <li>
                          <strong>Session:</strong>{" "}
                          {sessions.find(
                            (s) => s.id === formData.academicSessionId,
                          )?.name || "Selected"}
                        </li>
                      )}
                      <li>
                        <strong>Permissions:</strong>{" "}
                        {selectedPermissions.length} selected
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 mt-6 flex-col sm:flex-row">
                <button
                  type="button"
                  className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98] disabled:bg-slate-400 disabled:cursor-not-allowed"
                  disabled={
                    assignMutation.isPending ||
                    assignWithPermissionsMutation.isPending
                  }
                >
                  {assignMutation.isPending ||
                  assignWithPermissionsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign Admin"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {isEditPermissionsOpen && editingAdmin && (
        <EditAdminPermissionsModal
          adminId={editingAdmin.id}
          adminName={
            editingAdmin.user?.profile?.firstName &&
            editingAdmin.user?.profile?.lastName
              ? `${editingAdmin.user.profile.firstName} ${editingAdmin.user.profile.lastName}`
              : editingAdmin.user?.username || "Unknown"
          }
          adminEmail={editingAdmin.user?.email || ""}
          adminType={getAdminTypeLabel(editingAdmin.adminType)}
          isOpen={isEditPermissionsOpen}
          onClose={() => {
            setIsEditPermissionsOpen(false);
            setEditingAdmin(null);
          }}
          onSuccess={() => {
            refetchAdmins();
          }}
        />
      )}
    </div>
  );
}
