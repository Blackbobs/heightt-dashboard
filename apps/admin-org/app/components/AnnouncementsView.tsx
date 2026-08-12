"use client";

import { useState, useMemo } from "react";
import AnnouncementModal, { type AnnouncementItem } from "./AnnouncementModal";
import { usePermissions } from "../context/PermissionContext";

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "1",
    title: "Departmental Meeting",
    content:
      "This is to inform all students of the Computer Science Department that there will be a departmental meeting on Friday, December 15, 2026 at 2:00 PM.",
    status: "published",
    date: "Dec 12, 2026",
    author: "By Dr. Adeyemi",
    audience: "all",
    attachments: ["Agenda.pdf", "Map.png"],
  },
  {
    id: "2",
    title: "Lab Maintenance Schedule",
    content:
      "The Computer Science Lab will be closed for maintenance from December 20-22, 2026. Please plan your projects accordingly.",
    status: "published",
    date: "Dec 10, 2026",
    author: "By Admin",
    audience: "all",
    attachments: ["Schedule.pdf"],
  },
  {
    id: "3",
    title: "Faculty Week Updates",
    content: "Updates on Faculty Week activities. More details coming soon.",
    status: "draft",
    date: "Dec 8, 2026",
    author: "By John Doe",
    audience: "all",
    attachments: [],
  },
  {
    id: "4",
    title: "New Dues Structure",
    content:
      "The new dues structure for the 2025/26 session has been approved. Please check your dashboard for the updated amounts.",
    status: "published",
    date: "Dec 5, 2026",
    author: "By Finance Dept",
    audience: "all",
    attachments: ["Dues_Structure_2025-26.pdf"],
  },
];

const audienceLabels: Record<string, string> = {
  all: "All Students",
  "100": "100 Level",
  "200": "200 Level",
  "300": "300 Level",
  "400": "400 Level",
  postgrad: "Postgraduate",
};

export default function AnnouncementsView() {
  const { hasPermission } = usePermissions();
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_ANNOUNCEMENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("");

  // Permissions
  const canCreate = hasPermission("ANNOUNCEMENT_CREATE");
  const canEdit = hasPermission("ANNOUNCEMENT_UPDATE");
  const canPublish = hasPermission("ANNOUNCEMENT_PUBLISH");
  const canDelete = hasPermission("ANNOUNCEMENT_DELETE");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);

  // Filtered list
  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return announcements.filter((item) => {
      const matchSearch =
        !term ||
        item.title.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term) ||
        item.author.toLowerCase().includes(term);

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchAudience = !audienceFilter || item.audience === audienceFilter;

      return matchSearch && matchStatus && matchAudience;
    });
  }, [announcements, search, statusFilter, audienceFilter]);

  const handleOpenCreate = () => {
    setEditingAnnouncement(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AnnouncementItem) => {
    setEditingAnnouncement(item);
    setModalOpen(true);
  };

  const handleToggleStatus = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: item.status === "published" ? "draft" : "published" }
          : item
      )
    );
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleSave = (data: Omit<AnnouncementItem, "id" | "date" | "author">) => {
    if (editingAnnouncement) {
      setAnnouncements((prev) =>
        prev.map((item) =>
          item.id === editingAnnouncement.id
            ? { ...item, ...data }
            : item
        )
      );
    } else {
      const newItem: AnnouncementItem = {
        ...data,
        id: String(Date.now()),
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        author: "By John Doe",
      };
      setAnnouncements((prev) => [newItem, ...prev]);
    }
  };

  const selectCls =
    "px-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white cursor-pointer";

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            Announcements
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Create and manage announcements for Computer Science Department
          </p>
        </div>
        {canCreate && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 font-sans"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary-dark)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 16px oklch(46% .18 265 / 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-plus" />
            Create Announcement
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "360px" }}>
          <i
            className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: "var(--color-muted-foreground)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-8 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white"
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs bg-transparent border-none cursor-pointer"
              style={{ color: "var(--color-muted-foreground)" }}
            >
              <i className="fas fa-times-circle" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectCls}
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
            }}
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className={selectCls}
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
            }}
          >
            <option value="">All Audience</option>
            <option value="all">All Students</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
            <option value="postgrad">Postgraduate</option>
          </select>

          {(search || statusFilter || audienceFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setAudienceFilter("");
              }}
              className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 bg-white font-sans"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-destructive)";
                e.currentTarget.style.color = "var(--color-destructive)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              <i className="fas fa-xmark" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Announcements Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white border rounded-[var(--radius-card)]" style={{ borderColor: "var(--color-border)" }}>
          <i className="fas fa-bullhorn text-5xl" style={{ color: "var(--color-border)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>
            No announcements found
          </h3>
          <p className="text-sm max-w-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {search || statusFilter || audienceFilter
              ? "Try adjusting your search query or clear your active filters."
              : "Click 'Create Announcement' to broadcast your first update."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border rounded-[var(--radius-card)] p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-lg hover:border-blue-300"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div>
                {/* Top Title & Status */}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-semibold text-slate-900 flex-1">
                    {item.title}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                      item.status === "published"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        item.status === "published" ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </div>

                {/* Content Preview */}
                <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-2">
                  {item.content}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <i className="fas fa-calendar" /> {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <i className="fas fa-user" /> {item.author}
                  </span>
                  <span
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium text-[11px]"
                    style={{
                      background: "var(--color-primary-glow)",
                      color: "var(--color-primary)",
                    }}
                  >
                    <i className="fas fa-users" /> {audienceLabels[item.audience] || "All Students"}
                  </span>
                </div>

                {/* Attachments */}
                {item.attachments && item.attachments.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    {item.attachments.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600"
                      >
                        <i className="fas fa-file-pdf text-blue-600 text-xs" />
                        {file}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Actions */}
              {(canEdit || canPublish || canDelete) && (
                <div
                  className="flex items-center gap-2 pt-3 mt-2 border-t flex-wrap"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  {canEdit && (
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer transition-colors flex items-center gap-1.5"
                      style={{
                        background: "var(--color-primary-glow)",
                        color: "var(--color-primary)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--color-primary)";
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "var(--color-primary-glow)";
                        e.currentTarget.style.color = "var(--color-primary)";
                      }}
                    >
                      <i className="fas fa-pen" /> Edit
                    </button>
                  )}

                  {canPublish && (
                    <button
                      onClick={() => handleToggleStatus(item.id)}
                      className={`px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer transition-colors flex items-center gap-1.5 ${
                        item.status === "published"
                          ? "bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                      }`}
                    >
                      {item.status === "published" ? (
                        <>
                          <i className="fas fa-undo" /> Draft
                        </>
                      ) : (
                        <>
                          <i className="fas fa-check" /> Publish
                        </>
                      )}
                    </button>
                  )}

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="px-3.5 py-1.5 rounded-md text-xs font-semibold border-none cursor-pointer transition-colors flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
                    >
                      <i className="fas fa-trash" /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSave}
        editingAnnouncement={editingAnnouncement}
      />
    </div>
  );
}
