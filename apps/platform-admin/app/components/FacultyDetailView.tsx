"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  usePlatformFaculty,
  useUpdateFaculty,
  useDeleteFaculty,
} from "@/hooks/platform/usePlatformFaculties";
import { usePlatformDepartments } from "@/hooks/platform/usePlatformDepartments";
import {
  Layers,
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  Building2,
  Users,
  Calendar,
  ChevronRight,
  CheckCircle,
  XCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function FacultyDetailView() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params.id as string;

  const [activeTab, setActiveTab] = useState<"departments" | "settings">(
    "departments",
  );
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch data
  const {
    data: faculty,
    isLoading: facultyLoading,
    refetch: refetchFaculty,
  } = usePlatformFaculty(facultyId);
  const { data: departmentsData, isLoading: deptsLoading } =
    usePlatformDepartments({ facultyId });

  const departments = Array.isArray(departmentsData) ? departmentsData : (departmentsData as any)?.data || [];

  // Mutations
  const updateMutation = useUpdateFaculty();
  const deleteMutation = useDeleteFaculty();

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    deanName: "",
    status: "ACTIVE",
  });

  const isLoading = facultyLoading || deptsLoading;

  // Filter departments by search
  const filteredDepartments = useMemo(() => {
    if (!departments) return [];
    if (!search) return departments;
    const searchLower = search.toLowerCase();
    return departments.filter(
      (d: any) =>
        d.name.toLowerCase().includes(searchLower) ||
        d.code.toLowerCase().includes(searchLower),
    );
  }, [departments, search]);

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: facultyId,
        data: {
          ...formData,
          status: formData.status as any,
        },
      });
      setIsEditModalOpen(false);
      refetchFaculty();
    } catch (error) {
      console.error("Failed to update faculty:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(facultyId);
      router.push("/platform/faculties");
    } catch (error) {
      console.error("Failed to delete faculty:", error);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    if (faculty) {
      setFormData({
        name: faculty.name || "",
        code: faculty.code || "",
        deanName: (faculty as any).deanName || "",
        status: faculty.status || "ACTIVE",
      });
      setIsEditModalOpen(true);
    }
  };

  // Navigate to department detail
  const navigateToDepartment = (id: string) => {
    router.push(`/platform/departments/${id}`);
  };

  // Define columns for departments table
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "department",
        header: "Department",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToDepartment(row.original.id)}
          >
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorFn: (r) => r.headName || "TBD",
        id: "head",
        header: "HOD",
      },
      {
        accessorFn: (r) => r.academicLevels?.length || 0,
        id: "levels",
        header: "Levels",
      },
      {
        accessorFn: (r) => r.organizationsCount || 0,
        id: "orgs",
        header: "Organizations",
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
              onClick={() => navigateToDepartment(row.original.id)}
              title="View Department"
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

  if (!faculty) {
    return (
      <div className="text-center py-12">
        <Layers className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Faculty not found</h2>
        <button
          onClick={() => router.push("/platform/faculties")}
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
          onClick={() => router.push("/platform/faculties")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{faculty.name}</h1>
          <p className="text-sm text-slate-500">
            {faculty.code} • {(faculty as any).institution?.name || "Institution"}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`status-badge ${faculty.status?.toLowerCase() || "active"}`}
          >
            {faculty.status || "ACTIVE"}
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
            <div className="text-sm text-slate-500">Departments</div>
            <div className="text-2xl font-bold text-slate-900">
              {departments?.length || 0}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Code</div>
            <div className="text-2xl font-bold text-blue-600">
              {faculty.code}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Dean</div>
            <div className="text-2xl font-bold text-slate-900">
              {(faculty as any).deanName || "TBD"}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Institution</div>
            <div className="text-2xl font-bold text-slate-900">
              {(faculty as any).institution?.name || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Info */}
      <div className="card mb-6">
        <div className="card-header">
          <h3>Faculty Information</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-500">Name</div>
              <div className="font-semibold">{faculty.name}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Code</div>
              <div className="font-mono">{faculty.code}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Dean</div>
              <div>{(faculty as any).deanName || "TBD"}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Status</div>
              <span
                className={`status-badge ${faculty.status?.toLowerCase() || "active"}`}
              >
                {faculty.status || "ACTIVE"}
              </span>
            </div>
            <div>
              <div className="text-sm text-slate-500">Created</div>
              <div>{new Date(faculty.createdAt).toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-sm text-slate-500">Last Updated</div>
              <div>{new Date(faculty.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {["departments", "settings"].map((tab) => (
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

      {/* Departments Tab */}
      {activeTab === "departments" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search departments..."
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
                  `/platform/faculties/${facultyId}/departments/create`,
                )
              }
            >
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredDepartments.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2" />
                  <p>No departments found</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredDepartments} />
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
              <h3>Faculty Settings</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Faculty Name</div>
                  <div className="font-semibold">{faculty.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Code</div>
                  <div className="font-mono">{faculty.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Dean</div>
                  <div>{(faculty as any).deanName || "TBD"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Institution</div>
                  <div>{(faculty as any).institution?.name || "N/A"}</div>
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
              <h2>Edit Faculty</h2>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Faculty Name *</label>
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
                <label className="form-label">Dean Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.deanName}
                  onChange={(e) =>
                    setFormData({ ...formData, deanName: e.target.value })
                  }
                />
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
              <h2>Delete Faculty</h2>
              <button
                className="close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <div className="text-center py-4">
              <Layers className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                This will permanently delete <strong>{faculty.name}</strong> and
                all associated departments. This action cannot be undone.
              </p>
              {departments && departments.length > 0 && (
                <p className="text-sm text-red-500 mt-2">
                  ⚠️ This faculty has {departments.length} departments. They
                  will also be deleted.
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
                {deleteMutation.isPending ? "Deleting..." : "Delete Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
