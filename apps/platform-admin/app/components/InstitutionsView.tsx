"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import {
  usePlatformInstitutions,
  useCreateInstitution,
  useDeleteInstitution,
} from "@/hooks/platform/usePlatformInstitutions";
import { usePlatformFaculties } from "@/hooks/platform/usePlatformFaculties";
import { usePlatformDepartments } from "@/hooks/platform/usePlatformDepartments";
import { usePlatformOrganizations } from "@/hooks/platform/usePlatformOrganizations";
import {
  Loader2,
  Eye,
  Edit2,
  Trash2,
  Plus,
  Search,
  Layers,
  GitBranch,
  Flag,
  Building2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

// ============================================
// Institution Hierarchy Component
// ============================================

function InstitutionHierarchy({ institutionId }: { institutionId: string }) {
  const router = useRouter();
  const { data: faculties, isLoading: facultiesLoading } =
    usePlatformFaculties(institutionId);
  const { data: departments, isLoading: deptsLoading } =
    usePlatformDepartments();
  const { data: organizations, isLoading: orgsLoading } =
    usePlatformOrganizations({
      institutionId,
      limit: 100,
    });

  const isLoading = facultiesLoading || deptsLoading || orgsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  if (!faculties || faculties.length === 0) {
    return (
      <div className="text-sm text-slate-400 mt-2">
        No faculties onboarded yet.
      </div>
    );
  }

  const navigateToFaculty = (id: string) => {
    router.push(`/platform/faculties/${id}`);
  };

  const navigateToDepartment = (id: string) => {
    router.push(`/platform/departments/${id}`);
  };

  const navigateToOrganization = (id: string) => {
    router.push(`/platform/organizations/${id}`);
  };

  return (
    <div className="mt-3 space-y-2">
      {faculties.map((faculty: any) => (
        <div key={faculty.id} className="tree-node">
          <div
            className="tree-node-content cursor-pointer hover:bg-blue-50 transition-colors"
            onClick={() => navigateToFaculty(faculty.id)}
          >
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="font-semibold">{faculty.name}</span>
            <span className="text-xs text-slate-400">({faculty.code})</span>
            <span className="text-xs text-slate-400 ml-auto">
              Dean: {faculty.deanName || "TBD"}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          {/* Departments */}
          {departments
            ?.filter((d: any) => d.facultyId === faculty.id)
            .map((dept: any) => (
              <div key={dept.id} className="tree-node">
                <div
                  className="tree-node-content cursor-pointer hover:bg-emerald-50 transition-colors"
                  onClick={() => navigateToDepartment(dept.id)}
                >
                  <GitBranch className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">{dept.name}</span>
                  <span className="text-xs text-slate-400">({dept.code})</span>
                  <span className="text-xs text-slate-400 ml-auto">
                    HOD: {dept.headName || "TBD"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>

                {/* Organizations */}
                {organizations?.data
                  ?.filter((o: any) => o.departmentId === dept.id)
                  .map((org: any) => (
                    <div key={org.id} className="tree-node">
                      <div
                        className="tree-node-content cursor-pointer hover:bg-purple-50 transition-colors"
                        style={{
                          background: "var(--color-primary-bg)",
                          borderColor: "var(--color-primary-light)",
                        }}
                        onClick={() => navigateToOrganization(org.id)}
                      >
                        <Flag className="w-4 h-4 text-purple-600" />
                        <span>{org.name}</span>
                        <span
                          className={`status-badge ${org.status.toLowerCase()}`}
                          style={{ marginLeft: "auto" }}
                        >
                          {org.type} • {org.members?.length || 0} members
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

// ============================================
// Main Institutions View
// ============================================

export default function InstitutionsView() {
  const router = useRouter();
  const { hasPermission } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedInstitution, setExpandedInstitution] = useState<string | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    code: "",
    country: "Nigeria",
  });

  const { data, isLoading, refetch } = usePlatformInstitutions({
    page: currentPage,
    limit: 10,
    search: search || undefined,
    status: statusFilter !== "All" ? statusFilter : undefined,
  });

  const createMutation = useCreateInstitution();
  const deleteMutation = useDeleteInstitution();

  const institutions = data?.data || [];
  const meta = data?.meta;

  const navigateToInstitution = (id: string) => {
    router.push(`/platform/institutions/${id}`);
  };

  // Define columns with useMemo - MUST be called before any conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "name",
        header: "Institution",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToInstitution(row.original.id)}
          >
            <div style={{ fontWeight: 700 }}>{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.code}</div>
          </div>
        ),
      },
      { accessorFn: (r) => r.code, id: "code", header: "Code" },
      { accessorFn: (r) => r.country, id: "country", header: "Country" },
      {
        accessorFn: (r) => r.faculties?.length || 0,
        id: "faculties",
        header: "Faculties",
      },
      {
        accessorFn: (r) => r.departmentsCount || 0,
        id: "departments",
        header: "Departments",
      },
      {
        accessorFn: (r) => r.organizationsCount || 0,
        id: "organizations",
        header: "Organizations",
      },
      {
        accessorFn: (r) => r.studentsCount?.toLocaleString() || 0,
        id: "students",
        header: "Students",
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
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-flex", gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigateToInstitution(row.original.id)}
                title="View Details"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => toggleExpand(row.original.id)}
                title="View Hierarchy"
              >
                <Layers className="w-3 h-3" /> Hierarchy
              </button>
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({ name: "", shortName: "", code: "", country: "Nigeria" });
      refetch();
    } catch (error) {
      console.error("Failed to create institution:", error);
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
        console.error("Failed to delete institution:", error);
      }
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedInstitution(expandedInstitution === id ? null : id);
  };

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
      {/* Page Header */}
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1a5cff]" />
            Institutions Management
          </h1>
          <p>
            Route: <code>/platform/institutions</code> • Academic institutions
            onboarding and hierarchy control
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create Institution
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by institution name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span
            style={{
              fontSize: "12px",
              color: "var(--color-text-muted)",
              fontWeight: 600,
            }}
          >
            Total: {meta?.total || 0} Institutions
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        {institutions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No institutions found matching criteria.
          </div>
        ) : (
          <DataTable columns={columns} data={institutions} />
        )}
      </div>

      {/* Render hierarchy panel for expanded institution */}
      {expandedInstitution && (
        <div className="mt-4 p-4 bg-white border rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold">Institution Hierarchy</h3>
            <button
              className="ml-auto btn btn-secondary btn-sm"
              onClick={() => setExpandedInstitution(null)}
            >
              Close
            </button>
          </div>
          <InstitutionHierarchy institutionId={expandedInstitution} />
        </div>
      )}

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
              <h2>Create New Institution</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Institution Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Obafemi Awolowo University"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Short Name / Abbreviation *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. OAU"
                  value={formData.shortName}
                  onChange={(e) =>
                    setFormData({ ...formData, shortName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. OAU001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <select
                  className="form-select"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                >
                  <option value="Nigeria">Nigeria</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Kenya">Kenya</option>
                  <option value="South Africa">South Africa</option>
                </select>
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
                    : "Create Institution"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
