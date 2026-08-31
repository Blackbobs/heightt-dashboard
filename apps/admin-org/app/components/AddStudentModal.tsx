// apps/admin-org/components/AddStudentModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  UserPlus,
  Mail,
  User,
  BookOpen,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminContext } from "./AdminContext";
import { useCreateStudent } from "@/hooks/admin/useAdminStudents";

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
}

export default function AddStudentModal({
  isOpen,
  onClose,
  organizationId,
}: AddStudentModalProps) {
  const { selectedScope } = useAdminContext();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");
  const [level, setLevel] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const createStudentMutation = useCreateStudent();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setName("");
      setEmail("");
      setStudentId("");
      setLevel("");
      setStatus("ACTIVE");
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsSubmitting(true);

    try {
      // Split name into first and last
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const studentData = {
        userId: "", // This would be a new user ID or the user ID to link
        firstName,
        lastName,
        email,
        matricNumber: studentId || undefined,
        currentAcademicLevelId: level || undefined,
        academicStatus: status,
        institutionId: selectedScope?.institutionId || "",
        facultyId: selectedScope?.facultyId || "",
        departmentId: selectedScope?.departmentId || "",
        organizationId: organizationId || selectedScope?.organizationId || "",
      };

      await createStudentMutation.mutateAsync(studentData);
      onClose();
    } catch (error) {
      console.error("Failed to create student:", error);
      alert("Failed to create student. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <UserPlus className="w-5 h-5 text-[#1a5cff]" />
            Add New Student
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={firstInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. jane.doe@university.edu"
                  className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student ID (Matric No)
              </label>
              <div className="relative">
                <BadgeCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. CS/2024/001"
                  className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Academic Level
              </label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g. 100 Level"
                  className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

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
              disabled={isSubmitting || createStudentMutation.isPending}
              className={cn(
                "order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none",
                isSubmitting || createStudentMutation.isPending
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]",
              )}
            >
              {isSubmitting || createStudentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
