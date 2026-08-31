"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformAcademicSessions,
  useCreateAcademicSession,
  useUpdateAcademicSession,
  useDeleteAcademicSession,
} from "@/hooks/platform/usePlatformAcademicSessions";
import { usePlatformInstitutions } from "@/hooks/platform/usePlatformInstitutions";
import {
  Calendar,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { InstitutionPromotionPanel } from "./InstitutionPromotionPanel";

export default function AcademicSessionsView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [institutionFilter, setInstitutionFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    institutionId: "",
    status: "UPCOMING",
    isCurrent: false,
  });

  const { data: institutionsData } = usePlatformInstitutions({ limit: 100 });
  const {
    data: sessionsData,
    isLoading,
    refetch,
  } = usePlatformAcademicSessions(
    institutionFilter || institutionsData?.data?.[0]?.id || "",
  );
  const createMutation = useCreateAcademicSession();
  const updateMutation = useUpdateAcademicSession();
  const deleteMutation = useDeleteAcademicSession();

  const sessions = sessionsData || [];
  const institutions = institutionsData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        status: formData.status as any,
      });
      setIsModalOpen(false);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        institutionId: "",
        status: "UPCOMING",
        isCurrent: false,
      });
      refetch();
    } catch (error) {
      console.error("Failed to create academic session:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSession) return;
    try {
      await updateMutation.mutateAsync({
        id: editingSession.id,
        data: {
          ...formData,
          status: formData.status as any,
        },
      });
      setIsModalOpen(false);
      setEditingSession(null);
      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        institutionId: "",
        status: "UPCOMING",
        isCurrent: false,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update academic session:", error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete academic session:", error);
      }
    }
  };

  const handleEdit = (session: any) => {
    setEditingSession(session);
    setFormData({
      name: session.name,
      startDate: session.startDate?.split("T")[0] || "",
      endDate: session.endDate?.split("T")[0] || "",
      institutionId: session.institutionId,
      status: session.status || "UPCOMING",
      isCurrent: session.isCurrent || false,
    });
    setIsModalOpen(true);
  };

  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    if (search) {
      filtered = filtered.filter((s: any) =>
        s.name.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (statusFilter) {
      filtered = filtered.filter((s: any) => s.status === statusFilter);
    }
    return filtered;
  }, [sessions, search, statusFilter]);

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorFn: (r) => r.name,
        id: "name",
        header: "Session Name",
      },
      {
        accessorFn: (r) => new Date(r.startDate).toLocaleDateString(),
        id: "startDate",
        header: "Start Date",
      },
      {
        accessorFn: (r) => new Date(r.endDate).toLocaleDateString(),
        id: "endDate",
        header: "End Date",
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          const colors: Record<string, string> = {
            UPCOMING: "bg-blue-50 text-blue-600",
            ACTIVE: "bg-emerald-50 text-emerald-600",
            COMPLETED: "bg-slate-100 text-slate-500",
            ARCHIVED: "bg-red-50 text-red-600",
          };
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || colors.UPCOMING}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${status === "ACTIVE" ? "bg-emerald-500" : "bg-blue-500"}`}
              />
              {status}
            </span>
          );
        },
      },
      {
        accessorFn: (r) => (r.isCurrent ? "Yes" : "No"),
        id: "current",
        header: "Current",
        cell: ({ getValue }) => (
          <span
            className={
              getValue() === "Yes"
                ? "text-emerald-600 font-semibold"
                : "text-slate-400"
            }
          >
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
              onClick={() => handleEdit(row.original)}
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              onClick={() => handleDelete(row.original.id, row.original.name)}
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
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

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#1a5cff]" />
            Academic Sessions
          </h1>
          <p>Manage academic sessions across institutions</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingSession(null);
              setFormData({
                name: "",
                startDate: "",
                endDate: "",
                institutionId: institutions[0]?.id || "",
                status: "UPCOMING",
                isCurrent: false,
              });
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Create Session
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search sessions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={institutionFilter}
            onChange={(e) => {
              setInstitutionFilter(e.target.value);
            }}
          >
            <option value="">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {filteredSessions.length} Sessions
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No academic sessions found.
          </div>
        ) : (
          <DataTable columns={columns} data={filteredSessions} />
        )}
      </div>

      <div className="mt-6">
        {institutionFilter ? <InstitutionPromotionPanel institutionId={institutionFilter} /> : <div className="rounded-xl border bg-white p-5 text-sm text-slate-500">Select an institution to manage institution-wide promotion.</div>}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingSession
                  ? "Edit Academic Session"
                  : "Create Academic Session"}
              </h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={editingSession ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Session Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2024/2025"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Institution *</label>
                <select
                  className="form-select"
                  value={formData.institutionId}
                  onChange={(e) =>
                    setFormData({ ...formData, institutionId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Institution</option>
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
                <div className="form-group flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onChange={(e) =>
                      setFormData({ ...formData, isCurrent: e.target.checked })
                    }
                  />
                  <label
                    htmlFor="isCurrent"
                    className="text-sm font-medium text-slate-700"
                  >
                    Set as Current Session
                  </label>
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
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingSession
                      ? "Update Session"
                      : "Create Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
