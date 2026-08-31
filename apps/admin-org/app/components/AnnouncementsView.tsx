"use client";

import { useMemo, useState } from "react";
import {
  useAdminAnnouncements,
  useCreateAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
  usePublishAnnouncement,
} from "@/hooks/admin/useAdminAnnouncements";
import { useAdminContext } from "./AdminContext";
import {
  Search,
  Plus,
  Megaphone,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Send,
  FileText,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AnnouncementModal from "./AnnouncementModal";
import { usePermissions } from "../context/PermissionContext";

const ITEMS_PER_PAGE = 10;

const TYPE_COLORS: Record<string, { bg: string; text: string; icon: string }> =
  {
    GENERAL: { bg: "bg-slate-100", text: "text-slate-600", icon: "📢" },
    IMPORTANT: { bg: "bg-amber-50", text: "text-amber-600", icon: "⚠️" },
    URGENT: { bg: "bg-red-50", text: "text-red-600", icon: "🚨" },
    FINANCIAL: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "💰" },
    ACADEMIC: { bg: "bg-blue-50", text: "text-blue-600", icon: "📚" },
    EVENT: { bg: "bg-purple-50", text: "text-purple-600", icon: "🎉" },
  };

const PRIORITY_COLORS: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  LOW: { bg: "bg-slate-100", text: "text-slate-500", label: "Low" },
  NORMAL: { bg: "bg-blue-50", text: "text-blue-600", label: "Normal" },
  HIGH: { bg: "bg-amber-50", text: "text-amber-600", label: "High" },
  URGENT: { bg: "bg-red-50", text: "text-red-600", label: "Urgent" },
};

export function AnnouncementsView() {
  const { hasPermission } = usePermissions();
  const { selectedScope } = useAdminContext();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(
    null,
  );

  const canCreate = hasPermission("ANNOUNCEMENT_CREATE");
  const canEdit = hasPermission("ANNOUNCEMENT_UPDATE");
  const canDelete = hasPermission("ANNOUNCEMENT_DELETE");
  const canPublish = hasPermission("ANNOUNCEMENT_PUBLISH");

  const organizationId = selectedScope?.organizationId;

  const { data, isLoading, refetch } = useAdminAnnouncements({
    organizationId,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    isPublished: statusFilter ? statusFilter === "published" : undefined,
    type: typeFilter || undefined,
  });

  const createMutation = useCreateAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const publishMutation = usePublishAnnouncement();

  const announcements = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;
  const filteredAnnouncements = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return announcements.filter((announcement) =>
      !query
        ? true
        : [
            announcement.title,
            announcement.content,
            announcement.organization?.name,
            announcement.author?.username,
            announcement.author?.profile?.firstName,
            announcement.author?.profile?.lastName,
          ].some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [announcements, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (announcement: any) => {
    setEditingAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingAnnouncement) {
        await updateMutation.mutateAsync({
          id: editingAnnouncement.id,
          data: {
            ...data,
            organizationId,
          },
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          organizationId,
        });
      }
      refetch();
      setIsModalOpen(false);
      setEditingAnnouncement(null);
    } catch (error) {
      console.error("Failed to save announcement:", error);
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

  const getTypeStyle = (type: string) => {
    return TYPE_COLORS[type] || TYPE_COLORS.GENERAL;
  };

  const getPriorityStyle = (priority: string) => {
    return PRIORITY_COLORS[priority] || PRIORITY_COLORS.NORMAL;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading announcements...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Announcements
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Create and manage announcements for your organization
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Announcement
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search announcements..."
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="GENERAL">General</option>
          <option value="IMPORTANT">Important</option>
          <option value="URGENT">Urgent</option>
          <option value="FINANCIAL">Financial</option>
          <option value="ACADEMIC">Academic</option>
          <option value="EVENT">Event</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        {(search || typeFilter || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 border-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-300 transition-all bg-white border-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Announcements Grid */}
      {filteredAnnouncements.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border rounded-xl"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-300 mb-3">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">
            No announcements found
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">
            {search || typeFilter || statusFilter
              ? "No matching announcements found. Try adjusting your search query."
              : 'No announcements created yet. Click "Create Announcement" to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAnnouncements.map((ann: any) => {
            const typeStyle = getTypeStyle(ann.type);
            const priorityStyle = getPriorityStyle(ann.priority);
            const isPublished = ann.isPublished;

            return (
              <div
                key={ann.id}
                className="bg-white border rounded-xl p-5 flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                style={{ borderColor: "var(--color-border)" }}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeStyle.icon}</span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                        typeStyle.bg,
                        typeStyle.text,
                      )}
                    >
                      {ann.type}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                        priorityStyle.bg,
                        priorityStyle.text,
                      )}
                    >
                      {priorityStyle.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {!isPublished && canPublish && (
                      <button
                        onClick={() => handlePublish(ann.id)}
                        className="w-7 h-7 rounded-lg border-none bg-transparent hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer flex items-center justify-center transition-colors"
                        title="Publish"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEdit(ann)}
                        className="w-7 h-7 rounded-lg border-none bg-transparent hover:bg-amber-50 text-slate-400 hover:text-amber-600 cursor-pointer flex items-center justify-center transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(ann.id, ann.title)}
                        className="w-7 h-7 rounded-lg border-none bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer flex items-center justify-center transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Content */}
                <h3 className="text-base font-semibold text-slate-900 mb-1.5 line-clamp-1">
                  {ann.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                  {ann.content}
                </p>

                {/* Footer */}
                <div
                  className="flex items-center justify-between mt-4 pt-3 border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ann.createdAt)}
                    </span>
                    {ann.organization && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {ann.organization.name}
                      </span>
                    )}
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-medium",
                      isPublished
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        isPublished ? "bg-emerald-500" : "bg-slate-400",
                      )}
                    />
                    {isPublished ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 px-5 py-4 bg-white border rounded-xl"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500">
            Showing{" "}
            <strong className="text-slate-700">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-slate-700">
              {Math.min(currentPage * ITEMS_PER_PAGE, meta.total)}
            </strong>{" "}
            of <strong className="text-slate-700">{meta.total}</strong>{" "}
            announcements
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: Math.min(meta.totalPages, 5) }).map(
              (_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      "w-8 h-8 rounded-lg border text-xs font-semibold cursor-pointer transition-colors",
                      isActive
                        ? "bg-[#1a5cff] text-white border-[#1a5cff]"
                        : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
                    )}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            <button
              disabled={currentPage === meta.totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAnnouncement(null);
        }}
        onSubmit={handleSave}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  );
}
