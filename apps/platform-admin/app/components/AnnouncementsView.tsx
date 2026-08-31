"use client";

import React, { useState } from "react";
import {
  usePlatformAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "@/hooks/platform/usePlatformAnnouncements";
import { usePlatformOrganizations } from "@/hooks/platform/usePlatformOrganizations";
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Send,
  Eye,
  XCircle,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ANNOUNCEMENT_TYPES = [
  "GENERAL",
  "IMPORTANT",
  "URGENT",
  "FINANCIAL",
  "ACADEMIC",
  "EVENT",
];

const PRIORITY_LEVELS = ["LOW", "NORMAL", "HIGH", "URGENT"];

export default function AnnouncementsView() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationId: "",
    title: "",
    content: "",
    type: "GENERAL",
    priority: "NORMAL",
    expiresAt: "",
  });

  const { data: orgsData } = usePlatformOrganizations({ limit: 100 });
  const { data, isLoading, refetch } = usePlatformAnnouncements({
    page: currentPage,
    limit: 10,
    type: typeFilter || undefined,
    isPublished: statusFilter ? statusFilter === "published" : undefined,
  });

  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const publishMutation = usePublishAnnouncement();

  const announcements = data?.data || [];
  const meta = data?.meta;
  const organizations = orgsData?.data || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        ...formData,
        type: formData.type as any,
        priority: formData.priority as any,
        expiresAt: formData.expiresAt || undefined,
      });
      setIsModalOpen(false);
      setFormData({
        organizationId: "",
        title: "",
        content: "",
        type: "GENERAL",
        priority: "NORMAL",
        expiresAt: "",
      });
      refetch();
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete announcement:", error);
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to publish announcement:", error);
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      GENERAL: "bg-slate-100 text-slate-600",
      IMPORTANT: "bg-amber-50 text-amber-600",
      URGENT: "bg-red-50 text-red-600",
      FINANCIAL: "bg-emerald-50 text-emerald-600",
      ACADEMIC: "bg-blue-50 text-blue-600",
      EVENT: "bg-purple-50 text-purple-600",
    };
    return colors[type] || colors.GENERAL;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-slate-100 text-slate-500",
      NORMAL: "bg-blue-50 text-blue-600",
      HIGH: "bg-amber-50 text-amber-600",
      URGENT: "bg-red-50 text-red-600",
    };
    return colors[priority] || colors.NORMAL;
  };

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
            <Megaphone className="w-6 h-6 text-[#1a5cff]" />
            Platform Announcements
          </h1>
          <p>
            Route: <code>/platform/announcements</code> • Broadcast messages
            across all organizations
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" /> Create Announcement
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search announcements..."
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
            {ANNOUNCEMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
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
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Announcements
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {announcements.length === 0 ? (
          <div className="card p-10 text-center text-slate-400">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No announcements found</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <div key={ann.id} className="card">
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getTypeColor(ann.type)}`}
                      >
                        {ann.type}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getPriorityColor(ann.priority)}`}
                      >
                        {ann.priority}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ann.isPublished ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                      >
                        {ann.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {ann.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {ann.content}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span>By {ann.author?.username || "Unknown"}</span>
                      <span>•</span>
                      <span>
                        {new Date(ann.createdAt).toLocaleDateString()}
                      </span>
                      {ann.organization && (
                        <>
                          <span>•</span>
                          <span>{ann.organization.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!ann.isPublished && (
                      <button
                        className="p-2 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                        onClick={() => handlePublish(ann.id)}
                        title="Publish"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      className="p-2 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      onClick={() => alert(`Edit: ${ann.title}`)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      onClick={() => handleDelete(ann.id, ann.title)}
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
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
              <h2>Create Announcement</h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Organization *</label>
                <select
                  className="form-select"
                  value={formData.organizationId}
                  onChange={(e) =>
                    setFormData({ ...formData, organizationId: e.target.value })
                  }
                  required
                >
                  <option value="">Select Organization</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Announcement content..."
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                  >
                    {ANNOUNCEMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select
                    className="form-select"
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                  >
                    {PRIORITY_LEVELS.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
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
                    : "Create Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
