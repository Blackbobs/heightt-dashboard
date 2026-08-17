"use client";

import { useState, useMemo } from "react";
import {
  useAdminStudents,
  useUpdateStudent,
} from "@/hooks/admin/useAdminStudents";
import {
  Search,
  Plus,
  UserPlus,
  Eye,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import StudentDetailsModal from "./StudentDetailsModal";
import AddStudentModal from "./AddStudentModal";
import { usePermissions } from "../context/PermissionContext";

const ITEMS_PER_PAGE = 10;

export function StudentsView() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Permissions
  const canAddStudent = hasPermission("STUDENT_ADD");
  const canDeleteStudent = hasPermission("STUDENT_DELETE");

  const { data, isLoading, refetch } = useAdminStudents({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    status: statusFilter || undefined,
  });

  const updateStudentMutation = useUpdateStudent();

  const students = data?.data || [];
  const meta = data?.meta;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    refetch();
  };

  const handleOpenDetail = (student: any) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleRemoveStudent = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      // This would call a delete endpoint if available
      // For now, we'll just show a message
      alert(`Student ${name} removed (API endpoint would be called)`);
      refetch();
    }
  };

  const handleAddStudent = (data: any) => {
    // This would call a create endpoint if available
    alert(`Student ${data.name} added successfully!`);
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading students...
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
            Students
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all students in your organization
          </p>
        </div>
        {canAddStudent && (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        )}
      </div>

      {/* Search & Filter Section */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="INACTIVE">Inactive</option>
              <option value="GRADUATED">Graduated</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
            >
              <option value="">All Levels</option>
              <option value="100">100 Level</option>
              <option value="200">200 Level</option>
              <option value="300">300 Level</option>
              <option value="400">400 Level</option>
            </select>

            {(search || statusFilter || levelFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setLevelFilter("");
                  setCurrentPage(1);
                }}
                className="px-3 py-2.5 border-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-300 transition-all bg-white border-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div
        className="bg-white border rounded-xl overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        {students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-300 mb-3">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No students found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {search || statusFilter || levelFilter
                ? "No matching student records found. Try adjusting your search query."
                : 'No students added yet. Click "Add Student" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[700px]">
              <thead>
                <tr
                  className="bg-slate-50 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    ID
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Level
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {students.map((student: any) => {
                  const initials = student.name
                    ? student.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()
                        .slice(0, 2)
                    : "U";

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150"
                      onClick={() => handleOpenDetail(student)}
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                            style={{ background: "var(--color-primary)" }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-slate-900">
                              {student.name || "Unknown"}
                            </div>
                            <div className="text-xs text-slate-400">
                              {student.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs font-medium text-slate-600">
                          {student.matricNumber || "N/A"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm font-medium text-slate-700">
                        {student.currentAcademicLevelName || "N/A"}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                            student.academicStatus === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-600"
                              : student.academicStatus === "PENDING"
                                ? "bg-amber-50 text-amber-600"
                                : student.academicStatus === "GRADUATED"
                                  ? "bg-purple-50 text-purple-600"
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
                                  : student.academicStatus === "GRADUATED"
                                    ? "bg-purple-500"
                                    : "bg-slate-400",
                            )}
                          />
                          {student.academicStatus || "Unknown"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5 align-middle text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(student)}
                            className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canDeleteStudent && (
                            <button
                              onClick={() =>
                                handleRemoveStudent(student.id, student.name)
                              }
                              className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer flex items-center justify-center transition-colors"
                              title="Remove Student"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t"
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
              students
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
      </div>

      {/* Modals */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
}
