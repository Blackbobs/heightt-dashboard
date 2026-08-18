// src/app/components/AdministratorsView.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  usePlatformAdministrators,
  useAssignAdmin,
  useRevokeAdmin,
} from "@/hooks/platform/usePlatformAdministrators";
import { usePlatformUsers } from "@/hooks/platform/usePlatformUsers";
import { usePlatformInstitutions } from "@/hooks/platform/usePlatformInstitutions";
import { usePlatformFaculties } from "@/hooks/platform/usePlatformFaculties";
import { usePlatformDepartments } from "@/hooks/platform/usePlatformDepartments";
import { usePlatformOrganizations } from "@/hooks/platform/usePlatformOrganizations";
import { useAcademicSessions } from "@/hooks/platform/useAcademicSessions";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

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

export default function AdministratorsView() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    useAcademicSessions(formData.institutionId);

  const assignMutation = useAssignAdmin();
  const revokeMutation = useRevokeAdmin();

  const administrators = admins || [];
  const users = usersData?.data || [];
  const institutions = institutionsData?.data || [];
  const faculties = facultiesData || [];
  const departments = departmentsData || [];
  const organizations = organizationsData?.data || [];
  const sessions = sessionsData || [];

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
      await assignMutation.mutateAsync({
        userId: formData.userId,
        adminType: formData.adminType,
        institutionId: formData.institutionId || undefined,
        facultyId: formData.facultyId || undefined,
        departmentId: formData.departmentId || undefined,
        organizationId: formData.organizationId || undefined,
        academicSessionId: formData.academicSessionId || undefined,
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
        cell: ({ getValue }) => (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">
            {getAdminTypeLabel(getValue())}
          </span>
        ),
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
    [handleRevoke],
  );

  if (adminsLoading) {
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
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
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
              {/* User Selection */}
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

              {/* Admin Type Selection */}
              <div className="form-group">
                <label className="form-label">Admin Type *</label>
                <select
                  className="form-select"
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
                  <label className="form-label">
                    Institution {isFieldRequired("institutionId") && "*"}
                  </label>
                  <select
                    className="form-select"
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
                  <label className="form-label">
                    Faculty {isFieldRequired("facultyId") && "*"}
                  </label>
                  <select
                    className="form-select"
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
                    {faculties.map((faculty) => (
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
                  <label className="form-label">
                    Department {isFieldRequired("departmentId") && "*"}
                  </label>
                  <select
                    className="form-select"
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
                    {departments.map((dept) => (
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
                  <label className="form-label">
                    Organization {isFieldRequired("organizationId") && "*"}
                  </label>
                  <select
                    className="form-select"
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
                  <label className="form-label">
                    Academic Session{" "}
                    {isFieldRequired("academicSessionId") && "*"}
                  </label>
                  <select
                    className="form-select"
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
                          {faculties.find((f) => f.id === formData.facultyId)
                            ?.name || "Selected"}
                        </li>
                      )}
                      {formData.departmentId && (
                        <li>
                          <strong>Department:</strong>{" "}
                          {departments.find(
                            (d) => d.id === formData.departmentId,
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
                    </ul>
                  </div>
                </div>
              </div>

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
                  {assignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
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
    </div>
  );
}
