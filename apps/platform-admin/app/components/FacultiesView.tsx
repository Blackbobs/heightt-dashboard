"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function FacultiesView() {
  const { faculties, institutions, createFaculty, toggleFacultyStatus } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [instFilter, setInstFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [deanName, setDeanName] = useState("");
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || "");

  const filteredFaculties = faculties.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fac.deanName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesInst = instFilter === "All" || fac.institutionId === instFilter;
    return matchesSearch && matchesInst;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;

    const parentInst = institutions.find((i) => i.id === selectedInstId);
    createFaculty({
      institutionId: selectedInstId,
      institutionName: parentInst ? `${parentInst.name} (${parentInst.code})` : "Heightt Institution",
      name,
      code: code.toUpperCase(),
      deanName: deanName || "TBD",
      departmentsCount: 0,
      status: "Active",
    });

    setName("");
    setCode("");
    setDeanName("");
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Faculties Management</h1>
          <p>Route: <code>/platform/faculties</code> • Faculties must always be linked to an onboarded institution</p>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
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
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredFaculties.length} Faculties
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Faculty Name</th>
              <th>Code</th>
              <th>Parent Institution</th>
              <th>Dean / Head</th>
              <th>Departments</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFaculties.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No faculties found.
                </td>
              </tr>
            ) : (
              filteredFaculties.map((fac) => (
                <tr key={fac.id}>
                  <td style={{ fontWeight: 700 }}>{fac.name}</td>
                  <td><span className="badge primary">{fac.code}</span></td>
                  <td>{fac.institutionName}</td>
                  <td>{fac.deanName}</td>
                  <td>{fac.departmentsCount}</td>
                  <td>
                    <span className={`status-badge ${fac.status.toLowerCase()}`}>{fac.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      className={`btn btn-sm ${fac.status === "Active" ? "btn-danger" : "btn-success"}`}
                      onClick={() => toggleFacultyStatus(fac.id)}
                    >
                      {fac.status === "Active" ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Create Faculty
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
