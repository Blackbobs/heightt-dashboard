"use client";

import { useEffect } from "react";

export interface Student {
  id: string;
  name: string;
  email: string;
  username: string;
  studentId: string;
  level: string;
  status: "active" | "pending" | "inactive";
  avatar: string;
  avatarBg?: string;
  joinedDate?: string;
  department?: string;
  role?: string;
}

interface StudentDetailsModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function StudentDetailsModal({
  student,
  isOpen,
  onClose,
}: StudentDetailsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen || !student) return null;

  const bgStyle = student.avatarBg || "var(--color-primary)";

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-lg sm:text-xl font-bold flex items-center gap-2"
            style={{ color: "var(--color-foreground)" }}
          >
            <i className="fas fa-id-card text-primary" style={{ color: "var(--color-primary)" }} />
            Student Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Profile Card */}
        <div
          className="flex items-center gap-4 py-4 border-b mb-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-sm"
            style={{ background: bgStyle }}
          >
            {student.avatar}
          </div>
          <div>
            <h3 className="text-lg font-bold" style={{ color: "var(--color-foreground)" }}>
              {student.name}
            </h3>
            <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {student.email}
            </p>
          </div>
        </div>

        {/* Detail Rows */}
        <div className="space-y-3">
          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Student ID (Matric No)
            </span>
            <span
              className="text-sm font-semibold font-mono"
              style={{ color: "var(--color-foreground)" }}
            >
              {student.studentId}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Username
            </span>
            <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
              {student.username}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Academic Level
            </span>
            <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
              {student.level}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Status
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                student.status === "active"
                  ? "bg-emerald-50 text-emerald-600"
                  : student.status === "pending"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  student.status === "active"
                    ? "bg-emerald-500"
                    : student.status === "pending"
                    ? "bg-amber-500"
                    : "bg-slate-400"
                }`}
              />
              {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium" style={{ color: "var(--color-muted-foreground)" }}>
              Joined Date
            </span>
            <span className="text-sm font-medium" style={{ color: "var(--color-foreground)" }}>
              {student.joinedDate || "Sep 12, 2024"}
            </span>
          </div>
        </div>

        {/* Department Membership Box */}
        <div
          className="mt-5 p-3.5 rounded-lg flex items-center gap-3"
          style={{ background: "var(--color-muted)" }}
        >
          <i className="fas fa-building-columns text-base text-primary" style={{ color: "var(--color-primary)" }} />
          <div>
            <div className="font-semibold text-sm" style={{ color: "var(--color-foreground)" }}>
              {student.department || "Comp. Science Dept"}
            </div>
            <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              {student.role || "Student Member"}
            </div>
          </div>
          <span
            className="ml-auto text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ background: "var(--color-primary-glow)", color: "var(--color-primary)" }}
          >
            Member
          </span>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border-none cursor-pointer transition-all duration-200 text-white font-sans"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary-dark)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
