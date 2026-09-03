"use client";

import { useEffect } from "react";
import {
  X,
  Mail,
  User,
  Calendar,
  Building2,
  BookOpen,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StudentDetailsModalProps {
  student: any | null;
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

  const profile = student?.user?.profile || {};
  const studentName =
    `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim() ||
    student?.user?.username ||
    "Unknown";
  const initials = studentName
    ? studentName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <BadgeCheck className="w-5 h-5 text-[#1a5cff]" />
            Student Details
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Card */}
        <div
          className="flex items-center gap-4 py-4 border-b mb-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-sm"
            style={{ background: "var(--color-primary)" }}
          >
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {studentName}
            </h3>
            <p className="text-sm text-slate-500">
              {student?.user?.email || "No email"}
            </p>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium",
                student.academicStatus === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-600"
                  : student.academicStatus === "PENDING"
                    ? "bg-amber-50 text-amber-600"
                    : "bg-slate-100 text-slate-500",
              )}
            >
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  student.academicStatus === "ACTIVE"
                    ? "bg-emerald-500"
                    : student.academicStatus === "PENDING"
                      ? "bg-amber-500"
                      : "bg-slate-400",
                )}
              />
              {student.academicStatus || "Unknown"}
            </span>
          </div>
        </div>

        {/* Detail Rows */}
        <div className="space-y-3">
          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Username
            </span>
            <span className="text-sm font-medium text-slate-900">
              {student?.user?.username || "N/A"}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Student ID
            </span>
            <span className="text-sm font-medium font-mono text-slate-900">
              {student.matricNumber || "N/A"}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" /> Academic Level
            </span>
            <span className="text-sm font-medium text-slate-900">
              {student?.currentAcademicLevel?.name || "N/A"}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" /> Department
            </span>
            <span className="text-sm font-medium text-slate-900">
              {student?.department?.name || "N/A"}
            </span>
          </div>

          <div
            className="flex justify-between items-center py-2.5 border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Joined
            </span>
            <span className="text-sm font-medium text-slate-900">
              {student.createdAt
                ? new Date(student.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
          </div>
        </div>

        {/* Academic Records Summary */}
        {student.academicRecords && student.academicRecords.length > 0 && (
          <div className="mt-5 p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">
              Academic Summary
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-500">Current GPA</span>
                <div className="text-lg font-bold text-slate-900">
                  {student.academicRecords[0]?.gpa || "N/A"}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500">CGPA</span>
                <div className="text-lg font-bold text-slate-900">
                  {student.academicRecords[0]?.cgpa || "N/A"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border-2 border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff] transition-all cursor-pointer bg-transparent"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
