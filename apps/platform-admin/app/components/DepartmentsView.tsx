"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function DepartmentsView() {
  const { departments, faculties, institutions, createDepartment, toggleDepartmentStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [headName, setHeadName] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");
  const [selectedFacultyId, setSelectedFacultyId] = useState(faculties[0]?.id || "");
  const [generate500L, setGenerate500L] = useState(true);

  const availableFaculties = faculties.filter((f) => f.institutionId === selectedInstId);

  const filteredDepartments = departments.filter((dep) => {
    return (
      dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.institutionName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const parentInst = institutions.find((i) => i.id === selectedInstId);
    const parentFac = faculties.find((f) => f.id === selectedFacultyId);

    const levels = generate500L
      ? ["100L", "200L", "300L", "400L", "500L", "Postgraduate"]
      : ["100L", "200L", "300L", "400L", "Postgraduate"];

    createDepartment({
      institutionId: selectedInstId,
      institutionName: parentInst ? `${parentInst.name} (${parentInst.code})` : "Institution",
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
          <p>Route: <code>/platform/departments</code> • Displays auto-generated organizations/levels when onboarded</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredDepartments.length} Departments
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Code</th>
              <th>Faculty</th>
              <th>Institution</th>
              <th>HOD</th>
              <th>Generated Organizations / Levels</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No departments found.
                </td>
              </tr>
            ) : (
              filteredDepartments.map((dep) => (
                <tr key={dep.id}>
                  <td style={{ fontWeight: 700 }}>{dep.name}</td>
                  <td><span className="badge primary">{dep.code}</span></td>
                  <td>{dep.facultyName}</td>
                  <td>{dep.institutionName}</td>
                  <td>{dep.headName}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {dep.generatedLevels.map((lvl) => (
                        <span key={lvl} className="badge primary" style={{ fontSize: "9px" }}>
                          {lvl}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${dep.status.toLowerCase()}`}>{dep.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className={`btn btn-sm ${dep.status === "Active" ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleDepartmentStatus(dep.id)}
                    >
                      {dep.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
                  const facs = faculties.filter((f) => f.institutionId === e.target.value);
                  if (facs.length > 0) setSelectedFacultyId(facs[0].id);
                }}
                required
              >
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

            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "12px" }}>
              <input
                type="checkbox"
                id="lvlCheck"
                checked={generate500L}
                onChange={(e) => setGenerate500L(e.target.checked)}
              />
              <label htmlFor="lvlCheck" style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 600 }}>
                Include 500-Level Organization Node (5-year degree program)
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
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
