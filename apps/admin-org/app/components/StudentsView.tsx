"use client";

import { useState, useMemo } from "react";
import StudentDetailsModal, { type Student } from "./StudentDetailsModal";
import AddStudentModal from "./AddStudentModal";
import { usePermissions } from "../context/PermissionContext";

const INITIAL_STUDENTS: Student[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@university.edu",
    username: "@johndoe",
    studentId: "CS/2024/001",
    level: "300 Level",
    status: "active",
    avatar: "JD",
    avatarBg: "var(--color-primary)",
    joinedDate: "Sep 12, 2024",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    username: "@sarahj",
    studentId: "CS/2024/002",
    level: "200 Level",
    status: "active",
    avatar: "SJ",
    avatarBg: "var(--color-success)",
    joinedDate: "Oct 04, 2024",
  },
  {
    id: "3",
    name: "Michael Okonkwo",
    email: "m.okonkwo@university.edu",
    username: "@mokonkwo",
    studentId: "CS/2024/003",
    level: "400 Level",
    status: "active",
    avatar: "MO",
    avatarBg: "#D97706",
    joinedDate: "Nov 19, 2024",
  },
  {
    id: "4",
    name: "Amara Eze",
    email: "amara.eze@university.edu",
    username: "@amaraeze",
    studentId: "CS/2025/004",
    level: "100 Level",
    status: "pending",
    avatar: "AE",
    avatarBg: "#7C3AED",
    joinedDate: "Jan 10, 2025",
  },
  {
    id: "5",
    name: "David Mensah",
    email: "d.mensah@university.edu",
    username: "@dmensah",
    studentId: "CS/2024/005",
    level: "300 Level",
    status: "inactive",
    avatar: "DM",
    avatarBg: "#EC4899",
    joinedDate: "Feb 02, 2025",
  },
  {
    id: "6",
    name: "Grace Nwachukwu",
    email: "g.nwachukwu@university.edu",
    username: "@gnwachukwu",
    studentId: "CS/2024/006",
    level: "200 Level",
    status: "active",
    avatar: "GN",
    avatarBg: "#14B8A6",
    joinedDate: "Mar 15, 2025",
  },
];

const AVATAR_COLORS = [
  "var(--color-primary)",
  "var(--color-success)",
  "#D97706",
  "#7C3AED",
  "#EC4899",
  "#14B8A6",
];

const ITEMS_PER_PAGE = 6;

export default function StudentsView() {
  const { hasPermission } = usePermissions();
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Permissions
  const canAddStudent = hasPermission("STUDENT_ADD");
  const canDeleteStudent = hasPermission("STUDENT_DELETE");

  // Modals
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    const term = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchesSearch =
        !term ||
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.username.toLowerCase().includes(term) ||
        s.studentId.toLowerCase().includes(term);

      const matchesStatus = !statusFilter || s.status === statusFilter;
      const matchesLevel = !levelFilter || s.level === levelFilter;

      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [students, search, statusFilter, levelFilter]);

  // Total pages
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / ITEMS_PER_PAGE));
  const currentStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredStudents, currentPage]);

  const handleOpenDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleRemoveStudent = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      if (selectedStudent?.id === id) {
        setIsDetailOpen(false);
        setSelectedStudent(null);
      }
    }
  };

  const handleAddStudent = (data: Omit<Student, "id" | "avatar">) => {
    const nameParts = data.name.trim().split(" ");
    const initials =
      nameParts.length >= 2
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].substring(0, 2).toUpperCase();

    const color = AVATAR_COLORS[students.length % AVATAR_COLORS.length];

    const newStudent: Student = {
      ...data,
      id: String(Date.now()),
      avatar: initials,
      avatarBg: color,
    };

    setStudents((prev) => [newStudent, ...prev]);
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
            Students
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Manage all students in Computer Science Department
          </p>
        </div>
        {canAddStudent && (
          <button
            onClick={() => setIsAddOpen(true)}
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
            Add Student
          </button>
        )}
      </div>

      {/* Search & Filter Section */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Search Wrap */}
          <div className="relative flex-1" style={{ minWidth: "260px", maxWidth: "500px" }}>
            <i
              className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
              style={{ color: "var(--color-muted-foreground)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, username, or student ID..."
              className="w-full pl-10 pr-9 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white"
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
                onClick={() => {
                  setSearch("");
                  setCurrentPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm bg-transparent border-none cursor-pointer transition-colors p-1"
                style={{ color: "var(--color-muted-foreground)" }}
                aria-label="Clear search"
              >
                <i className="fas fa-times-circle" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={levelFilter}
              onChange={(e) => {
                setLevelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={selectCls}
              style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--color-primary)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--color-border)";
              }}
            >
              <option value="">All Levels</option>
              <option value="100 Level">100 Level</option>
              <option value="200 Level">200 Level</option>
              <option value="300 Level">300 Level</option>
              <option value="400 Level">400 Level</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            {(search || statusFilter || levelFilter) && (
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setLevelFilter("");
                  setCurrentPage(1);
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

        {/* Quick Search Hints */}
        <div className="flex gap-4 flex-wrap text-xs" style={{ color: "var(--color-muted-foreground)" }}>
          <span className="inline-flex items-center gap-1">
            <i className="fas fa-user text-[10px]" /> Name
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="fas fa-envelope text-[10px]" /> Email
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="fas fa-at text-[10px]" /> Username
          </span>
          <span className="inline-flex items-center gap-1">
            <i className="fas fa-id-card text-[10px]" /> Student ID
          </span>
        </div>
      </div>

      {/* Students Table Wrapper */}
      <div
        className="bg-white border rounded-[var(--radius-card)] overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-3"
              style={{ background: "var(--color-muted)", color: "var(--color-border)" }}
            >
              <i className="fas fa-users-slash" />
            </div>
            <h3 className="text-base font-semibold" style={{ color: "var(--color-foreground)" }}>
              No students found
            </h3>
            <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--color-muted-foreground)" }}>
              {search || statusFilter || levelFilter
                ? "No matching student records found. Try adjusting your search query or clear filters."
                : "No students added yet. Click 'Add Student' to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[650px]">
              <thead>
                <tr className="bg-slate-50 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Student ID
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
              <tbody className="divide-y" style={{ borderColor: "var(--color-border)" }}>
                {currentStudents.map((student) => {
                  const bg = student.avatarBg || "var(--color-primary)";
                  return (
                    <tr
                      key={student.id}
                      onClick={() => handleOpenDetail(student)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-sm"
                            style={{ background: bg }}
                          >
                            {student.avatar}
                          </div>
                          <div>
                            <div
                              className="font-semibold text-sm"
                              style={{ color: "var(--color-foreground)" }}
                            >
                              {student.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{ color: "var(--color-muted-foreground)" }}
                            >
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-mono text-xs font-medium text-slate-600">
                          {student.studentId}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-sm font-medium text-slate-700">
                        {student.level}
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
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
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenDetail(student)}
                            className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors"
                            title="View Details"
                          >
                            <i className="fas fa-eye text-sm" />
                          </button>
                          {canDeleteStudent && (
                            <button
                              onClick={() => handleRemoveStudent(student.id, student.name)}
                              className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer flex items-center justify-center transition-colors"
                              title="Remove Student"
                            >
                              <i className="fas fa-user-minus text-sm" />
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

        {/* Pagination Bar */}
        {filteredStudents.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
              Showing{" "}
              <strong style={{ color: "var(--color-foreground)" }}>
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{" "}
              to{" "}
              <strong style={{ color: "var(--color-foreground)" }}>
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredStudents.length)}
              </strong>{" "}
              of{" "}
              <strong style={{ color: "var(--color-foreground)" }}>
                {filteredStudents.length}
              </strong>{" "}
              students
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                <i className="fas fa-chevron-left" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${
                      isActive
                        ? "text-white border-primary"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                    style={{
                      background: isActive ? "var(--color-primary)" : undefined,
                      borderColor: isActive ? "var(--color-primary)" : "var(--color-border)",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
              >
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <StudentDetailsModal
        student={selectedStudent}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSubmit={handleAddStudent}
      />
    </div>
  );
}
