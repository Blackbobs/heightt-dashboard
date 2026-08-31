"use client";

import { useState, useRef, useEffect } from "react";
import { X, Megaphone, AlertCircle, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editingAnnouncement?: any | null;
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  editingAnnouncement,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("GENERAL");
  const [priority, setPriority] = useState("NORMAL");
  const [expiresAt, setExpiresAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditing = Boolean(editingAnnouncement);

  useEffect(() => {
    if (isOpen) {
      if (editingAnnouncement) {
        setTitle(editingAnnouncement.title);
        setContent(editingAnnouncement.content);
        setType(editingAnnouncement.type || "GENERAL");
        setPriority(editingAnnouncement.priority || "NORMAL");
        setExpiresAt(
          editingAnnouncement.expiresAt
            ? editingAnnouncement.expiresAt.split("T")[0]
            : "",
        );
      } else {
        setTitle("");
        setContent("");
        setType("GENERAL");
        setPriority("NORMAL");
        setExpiresAt("");
      }
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, editingAnnouncement]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    onSubmit({
      title,
      content,
      type,
      priority,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Megaphone className="w-5 h-5 text-[#1a5cff]" />
            {isEditing ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your announcement content..."
                rows={5}
                className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10 resize-y"
                required
              />
            </div>

            {/* Type & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                >
                  <option value="GENERAL">General</option>
                  <option value="IMPORTANT">Important</option>
                  <option value="URGENT">Urgent</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="EVENT">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expiry Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700">
                <p className="font-semibold">Announcement Guidelines</p>
                <p>
                  Draft announcements can be saved and published later.
                  Published announcements are immediately visible to all
                  members.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-6 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none",
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]",
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Megaphone className="w-4 h-4" />
                  {isEditing ? "Update Announcement" : "Create Announcement"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
