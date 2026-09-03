// apps/admin-org/components/StudentsView.tsx
"use client";

import { useState, useMemo } from "react";
import {
  useAdminStudents,
  useDeleteStudent,
} from "@/hooks/admin/useAdminStudents";
import { useAdminContext } from "./AdminContext";
import {
  Search,
  Plus,
  Eye,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import StudentDetailsModal from "./StudentDetailsModal";
import AddStudentModal from "./AddStudentModal";
import { PageHeader } from "./OperationsUI";

const ITEMS_PER_PAGE = 10;

export function StudentsView() {
  const { selectedScope, hasPermission } = useAdminContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const canAddStudent = hasPermission("student:create");
  const canDeleteStudent = hasPermission("student:delete");
  const organizationId = selectedScope?.organizationId || "";

  const { data, isLoading } = useAdminStudents({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    organizationId,
  });

  const deleteStudentMutation = useDeleteStudent();

  const students = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;

  const filteredStudents = useMemo(() => {
    let filtered = students;

    if (levelFilter) {
      filtered = filtered.filter(
        (s: any) =>
          s.currentAcademicLevel?.name?.includes(levelFilter) ||
          s.currentAcademicLevel?.numericLevel?.toString() === levelFilter,
      );
    }

    return filtered;
  }, [students, levelFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStudentName = (student: any): string => {
    const profile = student?.user?.profile;
    const fullName =
      `${profile?.firstName || ""} ${profile?.lastName || ""}`.trim();
    return fullName || student?.user?.username || "Unknown";
  };

  const getStudentEmail = (student: any): string =>
    student?.user?.email || "No email";

  const handleOpenDetail = (student: any) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleRemoveStudent = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteStudentMutation.mutateAsync(id);
      } catch (error) {
        console.error("Failed to remove student:", error);
      }
    }
  };

  if (isLoading && !data) {
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
    <div className="operations-page">
      <PageHeader eyebrow="Management" title="Students" description={<>Manage student records in {selectedScope?.organization?.name || "your organization"}.</>} actions={canAddStudent ? (
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Student
          </button>
        ) : undefined} />

      <div className="mb-[18px]">
        <div className="operations-toolbar flex flex-col md:flex-row items-stretch md:items-center">
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

      <div
        className="operations-surface"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filteredStudents.length === 0 ? (
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
                {filteredStudents.map((student: any) => {
                  const studentName = getStudentName(student);
                  const initials = studentName
                    ? studentName
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
                              {studentName}
                            </div>
                            <div className="text-xs text-slate-400">
                              {getStudentEmail(student)}
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
                        {student.currentAcademicLevel?.name || "N/A"}
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
                                handleRemoveStudent(
                                  student.id,
                                  getStudentName(student),
                                )
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

      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        organizationId={organizationId}
      />
    </div>
  );
}
