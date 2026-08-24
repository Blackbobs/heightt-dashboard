// src/app/components/EditAdminPermissionsModal.tsx

"use client";

import React, { useState, useEffect } from "react";
import {
  usePlatformAdminPermissions,
  useUpdateAdminPermissions,
} from "@/hooks/platform/usePlatformAdminPermissions";
import {
  Shield,
  Loader2,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PERMISSION_CATEGORIES, PermissionCategoryKey } from "@/lib/api/types";

interface EditAdminPermissionsModalProps {
  adminId: string;
  adminName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAdminPermissionsModal({
  adminId,
  adminName,
  isOpen,
  onClose,
  onSuccess,
}: EditAdminPermissionsModalProps) {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: adminData,
    isLoading,
    refetch,
  } = usePlatformAdminPermissions(adminId);

  const updatePermissionsMutation = useUpdateAdminPermissions();

  // Load existing permissions when modal opens
  useEffect(() => {
    if (isOpen && adminId) {
      refetch();
    }
  }, [isOpen, adminId, refetch]);

  // Set selected permissions from admin data
  useEffect(() => {
    if (adminData?.permissions) {
      setSelectedPermissions(
        adminData.permissions.map((p: any) => p.permissionKey)
      );
    }
    // Expand all categories by default
    setExpandedCategories(Object.keys(PERMISSION_CATEGORIES));
  }, [adminData]);

  if (!isOpen) return null;

  // Toggle permission selection
  const togglePermission = (permissionKey: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionKey)
        ? prev.filter((p) => p !== permissionKey)
        : [...prev, permissionKey]
    );
  };

  // Toggle category expansion
  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryKey)
        ? prev.filter((c) => c !== categoryKey)
        : [...prev, categoryKey]
    );
  };

  // Select all permissions in a category
  const selectAllInCategory = (categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
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
    const category = PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    setSelectedPermissions((prev) =>
      prev.filter((p) => !categoryPermissionKeys.includes(p))
    );
  };

  // Check if all permissions in a category are selected
  const isCategoryFullySelected = (categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    return categoryPermissionKeys.every((key) =>
      selectedPermissions.includes(key)
    );
  };

  // Check if any permissions in a category are selected
  const isCategoryPartiallySelected = (categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as PermissionCategoryKey];
    if (!category) return false;
    const categoryPermissionKeys = category.permissions.map((p) => p.key);
    const selectedInCategory = categoryPermissionKeys.filter((key) =>
      selectedPermissions.includes(key)
    );
    return (
      selectedInCategory.length > 0 &&
      selectedInCategory.length < categoryPermissionKeys.length
    );
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      await updatePermissionsMutation.mutateAsync({
        adminId,
        data: {
          permissions: selectedPermissions,
          action: "SET",
        },
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to update permissions:", error);
      alert("Failed to update permissions. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="modal-overlay open"
        onClick={() => onClose()}
      >
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Loading Permissions...</h2>
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
      className="modal-overlay open"
      onClick={() => onClose()}
    >
      <div className="modal max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1a5cff]" />
            Edit Permissions: {adminName}
          </h2>
          <button
            className="close-btn"
            onClick={() => onClose()}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            Select the permissions this administrator should have. Deselecting
            a permission will revoke access to that specific feature.
          </p>

          <div className="border rounded-lg overflow-hidden">
            {Object.entries(PERMISSION_CATEGORIES).map(
              ([categoryKey, category]) => {
                const isExpanded = expandedCategories.includes(categoryKey);
                const isFullySelected = isCategoryFullySelected(categoryKey);
                const isPartiallySelected = isCategoryPartiallySelected(
                  categoryKey
                );

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
                                : "border-slate-300"
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
                            perm.key
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
              }
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>
              Selected: <strong>{selectedPermissions.length}</strong>{" "}
              permissions
            </span>
            <div className="flex items-center gap-4">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => {
                  if (selectedPermissions.length === 0) {
                    // Select all permissions
                    const allKeys = Object.values(
                      PERMISSION_CATEGORIES
                    ).flatMap((cat) => cat.permissions.map((p) => p.key));
                    setSelectedPermissions(allKeys);
                  } else {
                    // Deselect all
                    setSelectedPermissions([]);
                  }
                }}
              >
                {selectedPermissions.length === 0
                  ? "Select All"
                  : "Deselect All"}
              </button>
              <button
                type="button"
                className="text-slate-500 hover:text-slate-700"
                onClick={() => {
                  if (adminData?.permissions) {
                    setSelectedPermissions(
                      adminData.permissions.map((p: any) => p.permissionKey)
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
              className="btn btn-secondary"
              onClick={() => onClose()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSubmitting || updatePermissionsMutation.isPending}
            >
              {isSubmitting || updatePermissionsMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Permissions
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}