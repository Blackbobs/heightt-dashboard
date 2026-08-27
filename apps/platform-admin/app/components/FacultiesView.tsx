"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "../context/AppContext";
import DataTable from "./DataTable";
import LogoUploader from "./LogoUploader";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, ChevronRight } from "lucide-react";

export default function FacultiesView() {
  const router = useRouter();
  const {
    faculties,
    institutions,
    createFaculty,
    toggleFacultyStatus,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [instFilter, setInstFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deanName, setDeanName] = useState("");
  const [logo, setLogo] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(
    institutions[0]?.id || "",
  );

  useEffect(() => {
    if (!selectedInstId && institutions[0]) {
      setSelectedInstId(institutions[0].id);
    }
  }, [institutions, selectedInstId]);

  const filteredFaculties = faculties.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.deanName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInst =
      instFilter === "All" || fac.institutionId === instFilter;
    return matchesSearch && matchesInst;
  });

  const navigateToFaculty = (id: string) => {
    router.push(`/platform/faculties/${id}`);
  };

  // Define columns with useMemo - MUST be called before any conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "name",
        header: "Faculty",
        cell: ({ row }) => (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => navigateToFaculty(row.original.id)}
          >
            <div className="font-semibold">{row.original.name}</div>
            <div className="text-xs text-slate-400">{row.original.code}</div>
          </div>
        ),
      },
      { accessorFn: (r) => r.code, id: "code", header: "Code" },
      {
        accessorFn: (r) => r.institutionName,
        id: "institution",
        header: "Parent Institution",
      },
      {
        accessorFn: (r) => r.deanName,
        id: "dean",
        header: "Dean / Head",
      },
      {
        accessorFn: (r) => r.departmentsCount,
        id: "departments",
        header: "Departments",
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
                onClick={() => navigateToFaculty(row.original.id)}
                title="View Details"
              >
                <Eye className="w-3 h-3" />
              </button>
              <button
                className={`btn btn-sm ${row.original.status === "Active" ? "btn-danger" : "btn-success"}`}
                onClick={() => toggleFacultyStatus(row.original.id)}
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !selectedInstId) {
      showToast(
        "Select a valid institution before creating a faculty.",
        "warning",
      );
      return;
    }

    const parentInst = institutions.find((i) => i.id === selectedInstId);
    if (!parentInst) {
      showToast(
        "The selected institution is no longer available. Please select another.",
        "danger",
      );
      return;
    }
    const created = await createFaculty({
      institutionId: selectedInstId,
      institutionName: `${parentInst.name} (${parentInst.code})`,
      name,
      code: code.toUpperCase(),
      logo: logo || undefined,
      deanName: deanName || "TBD",
      departmentsCount: 0,
      status: "Active",
    });

    if (created) {
      setName("");
      setCode("");
      setDeanName("");
      setLogo("");
      setIsModalOpen(false);
    }
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Faculties Management</h1>
          <p>
            Route: <code>/platform/faculties</code> • Faculties must always be
            linked to an onboarded institution
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <i className="fas fa-plus"></i> Create Faculty
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search faculty name, code, or dean..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={instFilter}
            onChange={(e) => setInstFilter(e.target.value)}
          >
            <option value="All">All Institutions</option>
            {institutions.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.code})
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            Total: {filteredFaculties.length} Faculties
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {filteredFaculties.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No faculties found.
          </div>
        ) : (
          <DataTable data={filteredFaculties} columns={columns} />
        )}
      </div>

      {/* CREATE FACULTY MODAL */}
      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Create New Faculty</h2>
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
                onChange={(e) => setSelectedInstId(e.target.value)}
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
              <label className="form-label">Faculty Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Faculty of Environmental Sciences"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Faculty Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. FES"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Dean Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Prof. J. O. Adebayo"
                value={deanName}
                onChange={(e) => setDeanName(e.target.value)}
              />
            </div>

            <LogoUploader
              value={logo}
              onChange={(url) => setLogo(url || "")}
              folder="logos"
              label="Faculty Logo"
            />

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!selectedInstId}
              >
                <i className="fas fa-check"></i> Create Faculty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
