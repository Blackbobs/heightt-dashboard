"use client";

import { useState, useRef, useEffect, forwardRef } from "react";

export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  status: "published" | "draft";
  date: string;
  author: string;
  audience: string; // 'all' | '100' | '200' | '300' | '400' | 'postgrad'
  attachments: string[];
}

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (announcement: Omit<AnnouncementItem, "id" | "date" | "author">) => void;
  editingAnnouncement?: AnnouncementItem | null;
}

const audienceLabels: Record<string, string> = {
  all: "All Students",
  "100": "100 Level",
  "200": "200 Level",
  "300": "300 Level",
  "400": "400 Level",
  postgrad: "Postgraduate",
};

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label
        className="block text-xs font-semibold mb-1"
        style={{ color: "var(--color-foreground)" }}
      >
        {label}{" "}
        {required && (
          <span style={{ color: "var(--color-destructive)" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      {...props}
      ref={ref}
      className={inputCls}
      style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-primary)";
        e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--color-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  )
);
Input.displayName = "Input";

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputCls + " cursor-pointer"}
      style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-primary)";
        e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--color-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={inputCls + " resize-y min-h-[100px]"}
      style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-primary)";
        e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--color-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export default function AnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  editingAnnouncement,
}: AnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState("all");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingAnnouncement) {
        setTitle(editingAnnouncement.title);
        setContent(editingAnnouncement.content);
        setAudience(editingAnnouncement.audience || "all");
        setStatus(editingAnnouncement.status);
        setAttachments(editingAnnouncement.attachments || []);
      } else {
        setTitle("");
        setContent("");
        setAudience("all");
        setStatus("draft");
        setAttachments([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => f.name);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    onSubmit({
      title,
      content,
      audience,
      status,
      attachments,
    });

    setIsSubmitting(false);
    onClose();
  };

  const isEditing = Boolean(editingAnnouncement);

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[19px] font-bold" style={{ color: "var(--color-foreground)" }}>
            <i
              className={`fas ${isEditing ? "fa-pen" : "fa-plus-circle"} mr-2 text-primary`}
              style={{ color: "var(--color-primary)" }}
            />
            {isEditing ? "Edit Announcement" : "Create Announcement"}
          </h2>
          <button
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormField label="Title" required>
            <Input
              ref={firstInputRef}
              type="text"
              placeholder="Enter announcement title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Content" required>
            <Textarea
              placeholder="Write your announcement content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
            <FormField label="Audience" required>
              <Select value={audience} onChange={(e) => setAudience(e.target.value)}>
                <option value="all">All Students</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="postgrad">Postgraduate</option>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select
                value={status}
                onChange={(e) => setStatus(e.target.value as "published" | "draft")}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Attachments">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50/50"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
            >
              <i className="fas fa-cloud-upload-alt text-2xl mb-1 block text-primary" style={{ color: "var(--color-primary)" }} />
              <div className="text-xs font-semibold" style={{ color: "var(--color-foreground)" }}>
                Click to upload files
              </div>
              <div className="text-[11px]">PDF, PNG, JPG up to 5MB</div>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((file, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-700"
                  >
                    <i className="fas fa-file text-blue-500 text-[11px]" />
                    {file}
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(idx)}
                      className="ml-1 bg-transparent border-none text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <i className="fas fa-times text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </FormField>

          {/* Actions */}
          <div className="flex gap-2.5 mt-5 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 font-sans bg-transparent"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white cursor-pointer transition-all duration-200 font-sans border-none disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "var(--color-primary-dark)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px oklch(46% .18 265 / 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                <>
                  <i className="fas fa-save" />
                  Update Announcement
                </>
              ) : (
                <>
                  <i className="fas fa-plus" />
                  Create Announcement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
