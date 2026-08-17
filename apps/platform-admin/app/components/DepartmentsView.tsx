"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ChevronRight } from "lucide-react";

export default function DepartmentsView() {
  const router = useRouter();
  const {
    departments,
    faculties,
    institutions,
    createDepartment,
    toggleDepartmentStatus,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headName, setHeadName] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(
    institutions[0]?.id || "",
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    faculties[0]?.id || "",
  );
  const [generate500L, setGenerate500L] = useState(true);

  // Auto-select first faculty when institution changes
  useEffect(() => {
    const availableFaculties = faculties.filter(
      (f) => f.institutionId === selectedInstId,
    );
    if (availableFaculties.length > 0) {
      setSelectedFacultyId(availableFaculties[0].id);
    } else {
      setSelectedFacultyId("");
    }
  }, [selectedInstId, faculties]);

  const availableFaculties = faculties.filter(
    (f) => f.institutionId === selectedInstId,
  );

  const filteredDepartments = departments.filter((dep) => {
    return (
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.institutionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const navigateToDepartment = (id: string) => {
    router.push(`/platform/departments/${id}`);
  };

  // Define columns with useMemo - MUST be called before any conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "name",
        header: "Department",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToDepartment(row.original.id)}
          >
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.code}</div>
          </div>
        ),
      },
      {
        accessorFn: (r) => r.code,
        id: "code",
        header: "Code",
      },
      {
        accessorFn: (r) => r.facultyName,
        id: "faculty",
        header: "Faculty",
      },
      {
        accessorFn: (r) => r.institutionName,
        id: "institution",
        header: "Institution",
      },
      {
        accessorFn: (r) => r.headName,
        id: "head",
        header: "HOD",
      },
      {
        accessorFn: (r) => r.generatedLevels,
        id: "levels",
        header: "Generated Organizations / Levels",
        cell: ({ getValue }) => {
          const levels = getValue() as string[];
          return (
            <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
              {levels.map((lvl: string) => (
                <span
                  key={lvl}
                  className="badge primary"
                  style={{ fontSize: "9px" }}
                >
                  {lvl}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span className={`status-badge ${String(getValue()).toLowerCase()}`}>
            {getValue()}
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "inline-flex", gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => navigateToDepartment(row.original.id)}
                title="View Details"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                className={`btn btn-sm ${row.original.status === "Active" ? "btn-danger" : "btn-success"}`}
                onClick={() => toggleDepartmentStatus(row.original.id)}
              >
                {row.original.status === "Active" ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !selectedFacultyId) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    const parentInst = institutions.find((i) => i.id === selectedInstId);
    const parentFac = faculties.find((f) => f.id === selectedFacultyId);

    const levels = generate500L
      ? ["100L", "200L", "300L", "400L", "500L", "Postgraduate"]
      : ["100L", "200L", "300L", "400L", "Postgraduate"];

    createDepartment({
      institutionId: selectedInstId,
      institutionName: parentInst
        ? `${parentInst.name} (${parentInst.code})`
        : "Institution",
      facultyId: selectedFacultyId,
      facultyName: parentFac ? parentFac.name : "Faculty",
      name,
      code: code.toUpperCase(),
      headName: headName || "TBD",
      generatedLevels: levels,
      organizationsCount: levels.length,
      status: "Active",
    });

    setName("");
    setCode("");
    setHeadName("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Departments Management</h1>
          <p>
            Route: <code>/platform/departments</code> • Displays auto-generated
            organizations/levels when onboarded
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus"></i> Onboard Department
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search department name, code, institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Total: {filteredDepartments.length} Departments
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {filteredDepartments.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No departments found.
          </div>
        ) : (
          <DataTable data={filteredDepartments} columns={columns} />
        )}
      </div>

      {/* CREATE DEPARTMENT MODAL */}
      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Onboard New Department</h2>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Parent Institution</label>
              <select
                className="form-select"
                value={selectedInstId}
                onChange={(e) => {
                  setSelectedInstId(e.target.value);
                  const facs = faculties.filter(
                    (f) => f.institutionId === e.target.value,
                  );
                  if (facs.length > 0) setSelectedFacultyId(facs[0].id);
                }}
                required
              >
                <option value="" disabled>
                  Select an institution
                </option>
                {institutions.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} ({i.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Parent Faculty</label>
              <select
                className="form-select"
                value={selectedFacultyId}
                onChange={(e) => setSelectedFacultyId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a faculty
                </option>
                {availableFaculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Electrical & Electronics Engineering"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. EEE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">HOD / Department Head</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prof. M. K. Bello"
                value={headName}
                onChange={(e) => setHeadName(e.target.value)}
              />
            </div>

            <div
              className="form-group"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <input
                type="checkbox"
                id="lvlCheck"
                checked={generate500L}
                onChange={(e) => setGenerate500L(e.target.checked)}
              />
              <label
                htmlFor="lvlCheck"
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                Include 500-Level Organization Node (5-year degree program)
              </label>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Onboard & Generate Levels
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
