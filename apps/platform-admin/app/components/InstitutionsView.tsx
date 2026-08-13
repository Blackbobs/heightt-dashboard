"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Institution } from "../types";

export default function InstitutionsView() {
  const {
    institutions,
    createInstitution,
    toggleInstitutionStatus,
    faculties,
    departments,
    organizations,
    hasPermission,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewHierarchyInstId, setViewHierarchyInstId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [country, setCountry] = useState("Nigeria");

  const canCreate = hasPermission("INSTITUTION_CREATE");

  const filteredInstitutions = institutions.filter((inst) => {
    const matchesSearch =
      inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || inst.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    createInstitution({
      name,
      code: code.toUpperCase(),
      country,
      facultiesCount: 0,
      departmentsCount: 0,
      organizationsCount: 0,
      studentsCount: 0,
      status: "Active",
    });
    setName("");
    setCode("");
    setIsModalOpen(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-head">
        <div className="title">
          <h1>Institutions Management</h1>
          <p>Route: <code>/platform/institutions</code> • Academic institutions onboarding and hierarchy control</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={!canCreate}
            onClick={() => setIsModalOpen(true)}
            title={canCreate ? "Create Institution" : "Permission Required: INSTITUTION_CREATE"}
          >
            <i className="fas fa-plus"></i> Create Institution
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by institution name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredInstitutions.length} Institutions
          </span>
        </div>
      </div>

      {/* Table View */}
      <div className="table-responsive" style={{ marginBottom: "24px" }}>
        <table className="table">
          <thead>
            <tr>
              <th>Institution</th>
              <th>Code</th>
              <th>Country</th>
              <th>Faculties</th>
              <th>Departments</th>
              <th>Organizations</th>
              <th>Students</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstitutions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No institutions found matching criteria.
                </td>
              </tr>
            ) : (
              filteredInstitutions.map((inst) => (
                <React.Fragment key={inst.id}>
                  <tr>
                    <td style={{ fontWeight: 700 }}>{inst.name}</td>
                    <td><span className="badge primary">{inst.code}</span></td>
                    <td>{inst.country}</td>
                    <td>{inst.facultiesCount}</td>
                    <td>{inst.departmentsCount}</td>
                    <td>{inst.organizationsCount}</td>
                    <td>{inst.studentsCount.toLocaleString()}</td>
                    <td>
                      <span className={`status-badge ${inst.status.toLowerCase()}`}>{inst.status}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setViewHierarchyInstId(viewHierarchyInstId === inst.id ? null : inst.id)}
                          title="View Academic Hierarchy Tree"
                        >
                          <i className="fas fa-sitemap"></i> Hierarchy
                        </button>
                        <button
                          className={`btn btn-sm ${inst.status === "Active" ? "btn-danger" : "btn-success"}`}
                          onClick={() => toggleInstitutionStatus(inst.id)}
                        >
                          {inst.status === "Active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Academic Hierarchy Tree View Drawer */}
                  {viewHierarchyInstId === inst.id && (
                    <tr>
                      <td colSpan={9} style={{ background: "var(--bg)", padding: "16px 24px" }}>
                        <div className="tree-container">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "14px", color: "var(--primary)" }}>
                            <i className="fas fa-building-columns"></i>
                            {inst.name} ({inst.code}) Academic Hierarchy
                          </div>

                          {/* Level 1: Faculties */}
                          {faculties.filter((f) => f.institutionId === inst.id).length === 0 ? (
                            <div style={{ fontSize: "12px", color: "var(--text-muted)", marginLeft: "24px", marginTop: "8px" }}>
                              No faculties onboarded under this institution yet.
                            </div>
                          ) : (
                            faculties
                              .filter((f) => f.institutionId === inst.id)
                              .map((fac) => (
                                <div className="tree-node" key={fac.id}>
                                  <div className="tree-node-content">
                                    <i className="fas fa-layer-group"></i>
                                    <span>Faculty: {fac.name} ({fac.code})</span>
                                    <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "auto" }}>
                                      Dean: {fac.deanName}
                                    </span>
                                  </div>

                                  {/* Level 2: Departments */}
                                  {departments
                                    .filter((d) => d.facultyId === fac.id)
                                    .map((dep) => (
                                      <div className="tree-node" key={dep.id}>
                                        <div className="tree-node-content">
                                          <i className="fas fa-sitemap"></i>
                                          <span>Dept: {dep.name} ({dep.code})</span>
                                        </div>

                                        {/* Level 3: Organizations & Levels */}
                                        {organizations
                                          .filter((o) => o.departmentName === dep.name)
                                          .map((org) => (
                                            <div className="tree-node" key={org.id}>
                                              <div className="tree-node-content" style={{ background: "var(--primary-bg)", borderColor: "var(--primary-light)" }}>
                                                <i className="fas fa-flag"></i>
                                                <span>Organization: {org.name}</span>
                                                <span className={`status-badge ${org.status.toLowerCase()}`} style={{ marginLeft: "auto" }}>
                                                  {org.type} • {org.studentCount} Students
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                      </div>
                                    ))}
                                </div>
                              ))
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE INSTITUTION MODAL */}
      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Create New Institution</h2>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Institution Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Obafemi Awolowo University"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institution Code / Abbreviation</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. OAU"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <select className="form-select" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Onboard Institution
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
