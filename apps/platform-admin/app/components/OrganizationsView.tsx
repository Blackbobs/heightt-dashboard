// src/app/components/OrganizationsView.tsx

"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  usePlatformOrganizations,
  useCreateOrganization,
  useDeleteOrganization,
  useActivateOrganization,
  useArchiveOrganization,
} from "@/hooks/platform/usePlatformOrganizations";
import { usePlatformInstitutions } from "@/hooks/platform/usePlatformInstitutions";
import { usePlatformFaculties } from "@/hooks/platform/usePlatformFaculties";
import { usePlatformDepartments } from "@/hooks/platform/usePlatformDepartments";
import {
  Flag,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  Loader2,
  Users,
  Archive,
  Building2,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api/error";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const ORGANIZATION_TYPES = [
  { value: "INSTITUTION", label: "Institution" },
  { value: "FACULTY", label: "Faculty" },
  { value: "DEPARTMENT", label: "Department" },
  { value: "LEVEL", label: "Level" },
  { value: "ASSOCIATION", label: "Association" },
  { value: "CLUB", label: "Club" },
  { value: "RELIGIOUS", label: "Religious" },
  { value: "SPORTS", label: "Sports" },
  { value: "SPECIAL", label: "Special" },
];

const ORGANIZATION_SCOPES = [
  { value: "INSTITUTION", label: "Institution Wide" },
  { value: "FACULTY", label: "Faculty Level" },
  { value: "DEPARTMENT", label: "Department Level" },
  { value: "LEVEL", label: "Level Specific" },
  { value: "CROSS_DEPARTMENT", label: "Cross Department" },
  { value: "CROSS_LEVEL", label: "Cross Level" },
  { value: "CUSTOM", label: "Custom" },
];

export default function OrganizationsView() {
  const router = useRouter();
  const { hasPermission } = useApp();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    type: "ASSOCIATION",
    scope: "CUSTOM",
    institutionId: "",
    facultyId: "",
    departmentId: "",
    academicLevelId: "",
  });

  // Fetch institutions
  const { data: institutionsData } = usePlatformInstitutions({ limit: 100 });

  // Fetch faculties for the selected institution
  const {
    data: facultiesData,
    isLoading: facultiesLoading,
    refetch: refetchFaculties,
  } = usePlatformFaculties(formData.institutionId);

  // Fetch departments for the selected faculty
  const {
    data: departmentsData,
    isLoading: departmentsLoading,
    refetch: refetchDepartments,
  } = usePlatformDepartments(formData.facultyId);

  const {
    data,
    isLoading: orgsLoading,
    refetch,
  } = usePlatformOrganizations({
    page: currentPage,
    limit: 10,
    search: search || undefined,
    type: typeFilter || undefined,
    status: statusFilter || undefined,
  });

  const createMutation = useCreateOrganization();
  const deleteMutation = useDeleteOrganization();
  const activateMutation = useActivateOrganization();
  const archiveMutation = useArchiveOrganization();

  const organizations = data?.data || [];
  const meta = data?.meta;
  const institutions = institutionsData?.data || [];

  // Handle the data response - might be array or object with data property
  const faculties = Array.isArray(facultiesData)
    ? facultiesData
    : facultiesData?.data || [];
  const departments = Array.isArray(departmentsData)
    ? departmentsData
    : departmentsData?.data || [];

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

  // Get filtered faculties based on selected institution
  const filteredFaculties = useMemo(() => {
    if (!formData.institutionId) return [];
    return faculties.filter(
      (f: any) => f.institutionId === formData.institutionId,
    );
  }, [faculties, formData.institutionId]);

  // Get filtered departments based on selected faculty
  const filteredDepartments = useMemo(() => {
    if (!formData.facultyId) return [];
    return departments.filter((d: any) => d.facultyId === formData.facultyId);
  }, [departments, formData.facultyId]);

  // Determine if faculty/department fields should be shown based on type
  const showFacultyField = useMemo(() => {
    return [
      "FACULTY",
      "DEPARTMENT",
      "LEVEL",
      "ASSOCIATION",
      "CLUB",
      "RELIGIOUS",
      "SPORTS",
      "SPECIAL",
    ].includes(formData.type);
  }, [formData.type]);

  const showDepartmentField = useMemo(() => {
    return [
      "DEPARTMENT",
      "LEVEL",
      "ASSOCIATION",
      "CLUB",
      "RELIGIOUS",
      "SPORTS",
      "SPECIAL",
    ].includes(formData.type);
  }, [formData.type]);

  const showLevelField = useMemo(() => {
    return ["LEVEL"].includes(formData.type);
  }, [formData.type]);

  const handleNavigateToOrg = (id: string) => {
    router.push(`/platform/organizations/${id}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate institution is selected
      if (!formData.institutionId) {
        alert("Please select an institution");
        return;
      }

      // For FACULTY type, facultyId is required
      if (formData.type === "FACULTY" && !formData.facultyId) {
        alert("Please select a faculty");
        return;
      }

      // For DEPARTMENT and LEVEL types, departmentId is required
      if (
        (formData.type === "DEPARTMENT" || formData.type === "LEVEL") &&
        !formData.departmentId
      ) {
        alert("Please select a department");
        return;
      }

      // Build the data object - only include fields that have values
      const data: any = {
        name: formData.name,
        slug: formData.slug,
        type: formData.type,
        scope: formData.scope,
        institutionId: formData.institutionId,
      };

      // Only add description if it has a value
      if (formData.description) {
        data.description = formData.description;
      }

      // Only include facultyId if it has a value and is relevant
      if (formData.facultyId && showFacultyField) {
        data.facultyId = formData.facultyId;
      }

      // Only include departmentId if it has a value and is relevant
      if (formData.departmentId && showDepartmentField) {
        data.departmentId = formData.departmentId;
      }

      // Only include academicLevelId if it has a value and is relevant
      if (formData.academicLevelId && showLevelField) {
        data.academicLevelId = formData.academicLevelId;
      }

      console.log("Submitting organization data:", data);

      await createMutation.mutateAsync(data);
      setIsModalOpen(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        type: "ASSOCIATION",
        scope: "CUSTOM",
        institutionId: "",
        facultyId: "",
        departmentId: "",
        academicLevelId: "",
      });
      refetch();
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create organization";
      alert(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete organization:", error);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to activate organization:", error);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to archive organization:", error);
    }
  };

  // Define columns with useMemo
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "org",
        header: "Organization",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => handleNavigateToOrg(row.original.id)}
          >
            <div style={{ fontWeight: 700 }}>{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.slug}</div>
          </div>
        ),
      },
      { accessorFn: (r) => r.type, id: "type", header: "Type" },
      {
        accessorFn: (r) => r.institution?.name || r.institutionId,
        id: "institution",
        header: "Institution",
      },
      {
        accessorFn: (r) => r.faculty?.name || r.facultyId || "—",
        id: "faculty",
        header: "Faculty",
      },
      {
        accessorFn: (r) => r.members?.length || 0,
        id: "members",
        header: "Members",
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span className={`status-badge ${String(getValue()).toLowerCase()}`}>
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) => new Date(r.createdAt).toLocaleDateString(),
        id: "created",
        header: "Created",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-flex", gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleNavigateToOrg(row.original.id)}
                title="View Details"
              >
                <Eye className="w-3 h-3" />
              </button>
              {row.original.status === "DRAFT" && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleActivate(row.original.id)}
                >
                  <CheckCircle className="w-3 h-3" /> Activate
                </button>
              )}
              {row.original.status === "ACTIVE" && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleArchive(row.original.id)}
                >
                  <Archive className="w-3 h-3" /> Archive
                </button>
              )}
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => alert(`Edit: ${row.original.name}`)}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleDelete(row.original.id, row.original.name)}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ),
      },
    ],
    [],
  );

  // Show loading state
  if (orgsLoading) {
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
            <Flag className="w-6 h-6 text-[#1a5cff]" />
            Organizations Management
          </h1>
          <p>
            Route: <code>/platform/organizations</code> • Manage all
            organizations across the platform
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create Organization
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by name or institution..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            {ORGANIZATION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_ACTIVATION">Pending</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Organizations
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {organizations.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No organizations found.
          </div>
        ) : (
          <DataTable columns={columns} data={organizations} />
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, meta.total)} of {meta.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === meta.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Organization</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="sr-only">Close</span>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              {/* Basic Info */}
              <div className="form-group">
                <label className="form-label">Organization Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science Association"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. csa"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/\s/g, "-"),
                    })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type *</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => {
                    const type = e.target.value;
                    setFormData({
                      ...formData,
                      type,
                      facultyId: "",
                      departmentId: "",
                      academicLevelId: "",
                    });
                  }}
                  required
                >
                  {ORGANIZATION_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Select the type of organization you want to create
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Scope *</label>
                <select
                  className="form-select"
                  value={formData.scope}
                  onChange={(e) =>
                    setFormData({ ...formData, scope: e.target.value })
                  }
                  required
                >
                  {ORGANIZATION_SCOPES.map((scope) => (
                    <option key={scope.value} value={scope.value}>
                      {scope.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Defines the reach and visibility of this organization
                </p>
              </div>

              {/* Institution - Always required */}
              <div className="form-group">
                <label className="form-label">Institution *</label>
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
                    });
                  }}
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map((inst: any) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name} ({inst.code})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  The institution this organization belongs to
                </p>
              </div>

              {/* Faculty - Only show for certain types */}
              {showFacultyField && (
                <div className="form-group">
                  <label className="form-label">
                    Faculty {formData.type !== "FACULTY" ? "(Optional)" : "*"}
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
                    disabled={!formData.institutionId || facultiesLoading}
                    required={formData.type === "FACULTY"}
                  >
                    <option value="">
                      {!formData.institutionId
                        ? "Please select an institution first"
                        : facultiesLoading
                          ? "Loading faculties..."
                          : formData.type === "FACULTY"
                            ? "Select Faculty"
                            : "None"}
                    </option>
                    {filteredFaculties.map((faculty: any) => (
                      <option key={faculty.id} value={faculty.id}>
                        {faculty.name} ({faculty.code})
                      </option>
                    ))}
                  </select>
                  {!formData.institutionId && (
                    <p className="text-xs text-amber-500 mt-1">
                      Please select an institution first
                    </p>
                  )}
                  {formData.type === "FACULTY" && (
                    <p className="text-xs text-slate-400 mt-1">
                      This organization will represent a faculty
                    </p>
                  )}
                  {filteredFaculties.length === 0 &&
                    formData.institutionId &&
                    !facultiesLoading && (
                      <p className="text-xs text-amber-500 mt-1">
                        No faculties found for this institution. Please create a
                        faculty first.
                      </p>
                    )}
                </div>
              )}

              {/* Department - Only show for certain types */}
              {showDepartmentField && (
                <div className="form-group">
                  <label className="form-label">
                    Department{" "}
                    {formData.type !== "DEPARTMENT" ? "(Optional)" : "*"}
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
                    disabled={!formData.facultyId || departmentsLoading}
                    required={formData.type === "DEPARTMENT"}
                  >
                    <option value="">
                      {!formData.facultyId
                        ? "Please select a faculty first"
                        : departmentsLoading
                          ? "Loading departments..."
                          : formData.type === "DEPARTMENT"
                            ? "Select Department"
                            : "None"}
                    </option>
                    {filteredDepartments.map((dept: any) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                  {!formData.facultyId && formData.type !== "DEPARTMENT" && (
                    <p className="text-xs text-amber-500 mt-1">
                      Please select a faculty first
                    </p>
                  )}
                  {formData.type === "DEPARTMENT" && (
                    <p className="text-xs text-slate-400 mt-1">
                      This organization will represent a department
                    </p>
                  )}
                  {filteredDepartments.length === 0 &&
                    formData.facultyId &&
                    !departmentsLoading && (
                      <p className="text-xs text-amber-500 mt-1">
                        No departments found for this faculty. Please create a
                        department first.
                      </p>
                    )}
                </div>
              )}

              {/* Academic Level - Only for LEVEL type */}
              {showLevelField && (
                <div className="form-group">
                  <label className="form-label">Academic Level *</label>
                  <select
                    className="form-select"
                    value={formData.academicLevelId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        academicLevelId: e.target.value,
                      })
                    }
                    disabled={!formData.departmentId}
                    required
                  >
                    <option value="">
                      {!formData.departmentId
                        ? "Please select a department first"
                        : "Select Academic Level"}
                    </option>
                    {/* This would need to be populated from an API call to get levels for the department */}
                    <option value="" disabled>
                      Loading levels...
                    </option>
                  </select>
                  {!formData.departmentId && (
                    <p className="text-xs text-amber-500 mt-1">
                      Please select a department first
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    The academic level this organization belongs to (e.g., 100
                    Level)
                  </p>
                </div>
              )}

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  placeholder="Organization description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              {/* Info Box */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold">
                      Organization Hierarchy Info:
                    </p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>
                        <strong>Institution</strong> - Top level, spans the
                        entire institution
                      </li>
                      <li>
                        <strong>Faculty</strong> - Belongs to an institution,
                        spans a faculty
                      </li>
                      <li>
                        <strong>Department</strong> - Belongs to a faculty,
                        spans a department
                      </li>
                      <li>
                        <strong>Level</strong> - Belongs to a department, spans
                        a specific academic level
                      </li>
                      <li>
                        <strong>Association/Club/etc</strong> - Can be at any
                        level, typically faculty or department
                      </li>
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
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Create Organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
