"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  usePlatformDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from "@/hooks/platform/usePlatformDepartments";
import {
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  Building2,
  Layers,
  Users,
  Calendar,
  ChevronRight,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function DepartmentDetailView() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [activeTab, setActiveTab] = useState<"organizations" | "settings">(
    "organizations",
  );
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch data
  const {
    data: department,
    isLoading: deptLoading,
    refetch: refetchDepartment,
  } = usePlatformDepartment(departmentId);

  // Mutations
  const updateMutation = useUpdateDepartment();
  const deleteMutation = useDeleteDepartment();

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    headName: "",
    promotionType: "AUTOMATIC",
    status: "ACTIVE",
  });

  const isLoading = deptLoading;

  // Mock organizations data (would come from API)
  const organizations = (department as any)?.organizations || [];

  // Filter organizations by search
  const filteredOrganizations = useMemo(() => {
    if (!organizations) return [];
    if (!search) return organizations;
    const searchLower = search.toLowerCase();
    return organizations.filter((o: any) =>
      o.name.toLowerCase().includes(searchLower),
    );
  }, [organizations, search]);

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: departmentId,
        data: {
          ...formData,
          status: formData.status as any,
          promotionType: formData.promotionType as any,
        },
      });
      setIsEditModalOpen(false);
      refetchDepartment();
    } catch (error) {
      console.error("Failed to update department:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(departmentId);
      router.push("/platform/departments");
    } catch (error) {
      console.error("Failed to delete department:", error);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    if (department) {
      const deptAny = department as any;
      setFormData({
        name: department.name || "",
        code: department.code || "",
        headName: deptAny.headName || "",
        promotionType: deptAny.promotionType || "AUTOMATIC",
        status: department.status || "ACTIVE",
      });
      setIsEditModalOpen(true);
    }
  };

  // Navigate to organization detail
  const navigateToOrganization = (id: string) => {
    router.push(`/platform/organizations/${id}`);
  };

  // Define columns for organizations table
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "org",
        header: "Organization",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToOrganization(row.original.id)}
          >
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.type}</div>
          </div>
        ),
      },
      {
        accessorFn: (r) => r.type,
        id: "type",
        header: "Type",
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
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <button
              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
              onClick={() => navigateToOrganization(row.original.id)}
              title="View Organization"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          Department not found
        </h2>
        <button
          onClick={() => router.push("/platform/departments")}
          className="mt-4 btn btn-secondary"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button & Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.push("/platform/departments")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {department.name}
          </h1>
          <p className="text-sm text-slate-500">
            {department.code} • {(department as any).faculty?.name || "Faculty"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`status-badge ${department.status?.toLowerCase() || "active"}`}
          >
            {department.status || "ACTIVE"}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={openEditModal}>
            <Edit2 className="w-4 h-4" /> Edit
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Organizations</div>
            <div className="text-2xl font-bold text-slate-900">
              {organizations?.length || 0}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Code</div>
            <div className="text-2xl font-bold text-blue-600">
              {department.code}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">HOD</div>
            <div className="text-2xl font-bold text-slate-900">
              {(department as any).headName || "TBD"}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Faculty</div>
            <div className="text-2xl font-bold text-slate-900">
              {(department as any).faculty?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Department Info */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Department Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500">Name</div>
              <div className="font-semibold">{department.name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Code</div>
              <div className="font-mono">{department.code}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">HOD</div>
              <div>{(department as any).headName || "TBD"}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Promotion Type</div>
              <div className="text-sm font-medium">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${(department as any).promotionType === "AUTOMATIC" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}
                >
                  {(department as any).promotionType}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <span
                className={`status-badge ${department.status?.toLowerCase() || "active"}`}
              >
                {department.status || "ACTIVE"}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-500">Created</div>
              <div>{new Date(department.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {["organizations", "settings"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Organizations Tab */}
      {activeTab === "organizations" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search organizations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              className="btn btn-primary"
              onClick={() =>
                router.push(
                  `/platform/departments/${departmentId}/organizations/create`,
                )
              }
            >
              <Plus className="w-4 h-4" /> Add Organization
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredOrganizations.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Flag className="w-8 h-8 mx-auto mb-2" />
                  <p>No organizations found</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredOrganizations} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <div>
          <div className="card">
            <div className="card-header">
              <h3>Department Settings</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Department Name</div>
                  <div className="font-semibold">{department.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Code</div>
                  <div className="font-mono">{department.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">HOD</div>
                  <div>{(department as any).headName || "TBD"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Faculty</div>
                  <div>{(department as any).faculty?.name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Promotion Type</div>
                  <div>{(department as any).promotionType}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Levels</div>
                  <div>{(department as any).academicLevels?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Department</h2>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Code *</label>
                <input
                  type="text"
                  className="form-input"
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
                <label className="form-label">HOD Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.headName}
                  onChange={(e) =>
                    setFormData({ ...formData, headName: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Promotion Type</label>
                  <select
                    className="form-select"
                    value={formData.promotionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotionType: e.target.value,
                      })
                    }
                  >
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="MANUAL">Manual</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Department</h2>
              <button
                className="close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <div className="text-center py-4">
              <BookOpen className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                This will permanently delete <strong>{department.name}</strong>{" "}
                and all associated organizations. This action cannot be undone.
              </p>
              {organizations && organizations.length > 0 && (
                <p className="text-sm text-red-500 mt-2">
                  ⚠️ This department has {organizations.length} organizations.
                  They will also be deleted.
                </p>
              )}
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Department"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
