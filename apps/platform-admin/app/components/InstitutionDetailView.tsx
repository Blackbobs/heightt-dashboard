"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  usePlatformInstitution,
  useUpdateInstitution,
  useDeleteInstitution,
} from "@/hooks/platform/usePlatformInstitutions";
import { usePlatformFaculties } from "@/hooks/platform/usePlatformFaculties";
import {
  Building2,
  Edit2,
  Trash2,
  Plus,
  Search,
  Loader2,
  ArrowLeft,
  Layers,
  Users,
  Calendar,
  MapPin,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function InstitutionDetailView() {
  const params = useParams();
  const router = useRouter();
  const institutionId = params.id as string;

  const [activeTab, setActiveTab] = useState<"faculties" | "settings">(
    "faculties",
  );
  const [search, setSearch] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch data
  const {
    data: institution,
    isLoading: instLoading,
    refetch: refetchInstitution,
  } = usePlatformInstitution(institutionId);
  const { data: faculties, isLoading: facultiesLoading } =
    usePlatformFaculties(institutionId);

  // Mutations
  const updateMutation = useUpdateInstitution();
  const deleteMutation = useDeleteInstitution();

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    code: "",
    country: "",
    state: "",
    city: "",
    address: "",
    website: "",
    email: "",
    phone: "",
    status: "ACTIVE",
  });

  const isLoading = instLoading || facultiesLoading;

  // Filter faculties by search
  const filteredFaculties = useMemo(() => {
    if (!faculties) return [];
    if (!search) return faculties;
    const searchLower = search.toLowerCase();
    return faculties.filter(
      (f: any) =>
        f.name.toLowerCase().includes(searchLower) ||
        f.code.toLowerCase().includes(searchLower),
    );
  }, [faculties, search]);

  // Handle edit
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync({
        id: institutionId,
        data: formData,
      });
      setIsEditModalOpen(false);
      refetchInstitution();
    } catch (error) {
      console.error("Failed to update institution:", error);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(institutionId);
      router.push("/platform/institutions");
    } catch (error) {
      console.error("Failed to delete institution:", error);
    }
  };

  // Open edit modal
  const openEditModal = () => {
    if (institution) {
      setFormData({
        name: institution.name || "",
        shortName: institution.shortName || "",
        code: institution.code || "",
        country: institution.country || "",
        state: institution.state || "",
        city: institution.city || "",
        address: institution.address || "",
        website: institution.website || "",
        email: institution.email || "",
        phone: institution.phone || "",
        status: institution.status || "ACTIVE",
      });
      setIsEditModalOpen(true);
    }
  };

  // Navigate to faculty detail
  const navigateToFaculty = (id: string) => {
    router.push(`/platform/faculties/${id}`);
  };

  // Define columns for faculties table
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "faculty",
        header: "Faculty",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToFaculty(row.original.id)}
          >
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorFn: (r) => r.deanName || "TBD",
        id: "dean",
        header: "Dean",
      },
      {
        accessorFn: (r) => r.departmentsCount || 0,
        id: "departments",
        header: "Departments",
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
              onClick={() => navigateToFaculty(row.original.id)}
              title="View Faculty"
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

  if (!institution) {
    return (
      <div className="text-center py-12">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">
          Institution not found
        </h2>
        <button
          onClick={() => router.push("/platform/institutions")}
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
          onClick={() => router.push("/platform/institutions")}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {institution.name}
          </h1>
          <p className="text-sm text-slate-500">
            {institution.code} • {institution.country}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`status-badge ${institution.status?.toLowerCase() || "active"}`}
          >
            {institution.status || "ACTIVE"}
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
            <div className="text-sm text-slate-500">Faculties</div>
            <div className="text-2xl font-bold text-slate-900">
              {faculties?.length || 0}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Code</div>
            <div className="text-2xl font-bold text-blue-600">
              {institution.code}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Country</div>
            <div className="text-2xl font-bold text-slate-900">
              {institution.country}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Short Name</div>
            <div className="text-2xl font-bold text-slate-900">
              {institution.shortName}
            </div>
          </div>
        </div>
      </div>

      {/* Institution Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="card">
          <div className="card-header">
            <h3>Contact Information</h3>
          </div>
          <div className="card-body space-y-2">
            {institution.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{institution.email}</span>
              </div>
            )}
            {institution.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{institution.phone}</span>
              </div>
            )}
            {institution.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-slate-400" />
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {institution.website}
                </a>
              </div>
            )}
            {institution.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{institution.address}</span>
              </div>
            )}
            {!institution.email &&
              !institution.phone &&
              !institution.website &&
              !institution.address && (
                <div className="text-sm text-slate-400">
                  No contact information available
                </div>
              )}
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3>Details</h3>
          </div>
          <div className="card-body space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Created</span>
              <span>
                {new Date(institution.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Last Updated</span>
              <span>
                {new Date(institution.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">ID</span>
              <span className="font-mono text-xs">{institution.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span
                className={`status-badge ${institution.status?.toLowerCase() || "active"}`}
              >
                {institution.status || "ACTIVE"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {["faculties", "settings"].map((tab) => (
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

      {/* Faculties Tab */}
      {activeTab === "faculties" && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search faculties..."
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
                  `/platform/institutions/${institutionId}/faculties/create`,
                )
              }
            >
              <Plus className="w-4 h-4" /> Add Faculty
            </button>
          </div>

          <div className="card">
            <div className="card-body p-0">
              {filteredFaculties.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2" />
                  <p>No faculties found</p>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredFaculties} />
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
              <h3>Institution Settings</h3>
            </div>
            <div className="card-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Institution Name</div>
                  <div className="font-semibold">{institution.name}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Short Name</div>
                  <div className="font-semibold">{institution.shortName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Code</div>
                  <div className="font-mono">{institution.code}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Country</div>
                  <div>{institution.country}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">State</div>
                  <div>{institution.state || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">City</div>
                  <div>{institution.city || "N/A"}</div>
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
              <h2>Edit Institution</h2>
              <button
                className="close-btn"
                onClick={() => setIsEditModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label className="form-label">Institution Name *</label>
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
                <label className="form-label">Short Name *</label>
                <input
                  type="text"
                  className="form-input"
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
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
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
                  <option value="SUSPENDED">Suspended</option>
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
              <h2>Delete Institution</h2>
              <button
                className="close-btn"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <div className="text-center py-4">
              <Building2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-900">
                Are you sure?
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                This will permanently delete <strong>{institution.name}</strong>{" "}
                and all associated data. This action cannot be undone.
              </p>
              {faculties && faculties.length > 0 && (
                <p className="text-sm text-red-500 mt-2">
                  ⚠️ This institution has {faculties.length} faculties. They
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
                {deleteMutation.isPending
                  ? "Deleting..."
                  : "Delete Institution"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
