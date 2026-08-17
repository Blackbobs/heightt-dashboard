"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformAdministrators,
  useAssignAdmin,
  useRevokeAdmin,
} from "@/hooks/platform/usePlatformAdministrators";
import { usePlatformUsers } from "@/hooks/platform/usePlatformUsers";
import {
  Shield,
  Plus,
  Search,
  UserX,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const ADMIN_TYPES = [
  "PLATFORM_ADMIN",
  "INSTITUTION_ADMIN",
  "FACULTY_ADMIN",
  "DEPARTMENT_ADMIN",
  "ORGANIZATION_ADMIN",
  "CLUB_ADMIN",
];

export default function AdministratorsView() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    adminType: "ORGANIZATION_ADMIN",
    organizationId: "",
    institutionId: "",
    facultyId: "",
    departmentId: "",
  });

  const { data: admins, isLoading, refetch } = usePlatformAdministrators();
  const { data: usersData } = usePlatformUsers({ limit: 100 });
  const assignMutation = useAssignAdmin();
  const revokeMutation = useRevokeAdmin();

  const administrators = admins || [];
  const users = usersData?.data || [];

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
    try {
      await assignMutation.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({
        userId: "",
        adminType: "ORGANIZATION_ADMIN",
        organizationId: "",
        institutionId: "",
        facultyId: "",
        departmentId: "",
      });
      refetch();
    } catch (error) {
      console.error("Failed to assign admin:", error);
    }
  };

  const handleRevoke = async (adminId: string, name: string) => {
    if (confirm(`Are you sure you want to revoke admin access for ${name}?`)) {
      try {
        await revokeMutation.mutateAsync(adminId);
        refetch();
      } catch (error) {
        console.error("Failed to revoke admin:", error);
      }
    }
  };

  const getAdminTypeLabel = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-emerald-50 text-emerald-600",
      INACTIVE: "bg-slate-100 text-slate-500",
      REVOKED: "bg-red-50 text-red-600",
    };
    return colors[status] || colors.INACTIVE;
  };

  // Define columns with useMemo - MUST be called before any conditional returns
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
        cell: ({ getValue }) => (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
            {getValue()
              ? getValue()
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/\b\w/g, (l: string) => l.toUpperCase())
              : ""}
          </span>
        ),
      },
      {
        accessorFn: (row) =>
          row.organization?.name || row.organizationId || "Platform-wide",
        id: "organization",
        header: "Organization",
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
        cell: ({ getValue }) => (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(getValue())}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${getValue() === "ACTIVE" ? "bg-emerald-500" : "bg-red-500"}`}
            />
            {getValue()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div style={{ textAlign: "right" }}>
            {row.original.status === "ACTIVE" && (
              <button
                className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                onClick={() =>
                  handleRevoke(
                    row.original.id,
                    row.original.user?.username || "Unknown",
                  )
                }
                title="Revoke Admin Access"
              >
                <UserX className="w-4 h-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleRevoke],
  );

  // Loading state AFTER all hooks are called
  if (isLoading) {
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
            Route: <code>/platform/administrators</code> • Manage administrative
            memberships and permissions
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
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Administrator</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="form-group">
                <label className="form-label">User *</label>
                <select
                  className="form-select"
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

              <div className="form-group">
                <label className="form-label">Admin Type *</label>
                <select
                  className="form-select"
                  value={formData.adminType}
                  onChange={(e) =>
                    setFormData({ ...formData, adminType: e.target.value })
                  }
                  required
                >
                  {ADMIN_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {getAdminTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {(formData.adminType === "INSTITUTION_ADMIN" ||
                formData.adminType === "ORGANIZATION_ADMIN") && (
                <div className="form-group">
                  <label className="form-label">
                    Organization ID (Optional)
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Organization ID"
                    value={formData.organizationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationId: e.target.value,
                      })
                    }
                  />
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={assignMutation.isPending}
                >
                  {assignMutation.isPending ? "Assigning..." : "Assign Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
