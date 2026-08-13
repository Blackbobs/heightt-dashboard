"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { OrganizationType } from "../types";

const orgTypes: OrganizationType[] = [
  "Institution",
  "Faculty",
  "Department",
  "Level",
  "External",
  "Other",
];

export default function OrganizationsView() {
  const {
    organizations,
    institutions,
    createOrganization,
    toggleOrganizationStatus,
    assignAdmin,
    hasPermission,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedOrgForAdmin, setSelectedOrgForAdmin] = useState<string | null>(null);

  // Create Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<OrganizationType>("Department");
  const [selectedInstName, setSelectedInstName] = useState(institutions[0]?.name || "UNILAG");

  // Assign Admin Form State
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminRole, setAdminRole] = useState("Organization Admin");

  const canCreateOrg = hasPermission("ORGANIZATION_CREATE");
  const canAssignAdmin = hasPermission("ADMIN_ASSIGN");

  const filteredOrgs = organizations.filter((org) => {
    const matchesSearch =
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.institutionName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || org.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    createOrganization({
      name,
      type,
      institutionName: selectedInstName,
      studentCount: 0,
      adminsCount: 0,
      status: "Active",
    });

    setName("");
    setIsModalOpen(false);
  };

  const handleAssignAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminName || !adminEmail || !selectedOrgForAdmin) return;

    const targetOrg = organizations.find((o) => o.id === selectedOrgForAdmin);
    assignAdmin({
      userId: `usr-${Date.now()}`,
      name: adminName,
      email: adminEmail,
      primaryOrganization: targetOrg ? targetOrg.name : "Organization",
      role: adminRole,
      memberships: [
        {
          organizationId: selectedOrgForAdmin,
          organizationName: targetOrg ? targetOrg.name : "Organization",
          role: adminRole,
          status: "Active",
        },
      ],
      status: "Active",
    });

    setAdminName("");
    setAdminEmail("");
    setIsAssignModalOpen(false);
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Organizations Management</h1>
          <p>Route: <code>/platform/organizations</code> • ⚠️ <strong>Critical Platform Admin Feature:</strong> Only Platform Admins create organizations</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            disabled={!canCreateOrg}
            onClick={() => setIsModalOpen(true)}
            title={canCreateOrg ? "Create Organization" : "Permission Required: ORGANIZATION_CREATE"}
          >
            <i className="fas fa-plus"></i> Create Organization
          </button>
        </div>
      </div>

      <div className="permission-banner" style={{ background: "rgba(26, 86, 219, 0.08)", borderColor: "var(--primary)" }}>
        <i className="fas fa-lock"></i>
        <span>
          Organization level creation & administrative delegation is strictly scoped to <strong>PLATFORM_ADMIN</strong>.
        </span>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by organization name or institution..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Organization Types</option>
            {orgTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredOrgs.length} Organizations
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Organization Name</th>
              <th>Organization Type</th>
              <th>Institution</th>
              <th>Students</th>
              <th>Admins</th>
              <th>Created Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrgs.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No organizations found.
                </td>
              </tr>
            ) : (
              filteredOrgs.map((org) => (
                <tr key={org.id}>
                  <td style={{ fontWeight: 700 }}>{org.name}</td>
                  <td>
                    <span className="badge primary" style={{ fontWeight: 700 }}>
                      {org.type}
                    </span>
                  </td>
                  <td>{org.institutionName}</td>
                  <td>{org.studentCount.toLocaleString()}</td>
                  <td>{org.adminsCount} Administrators</td>
                  <td>{org.createdAt}</td>
                  <td>
                    <span className={`status-badge ${org.status.toLowerCase()}`}>{org.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={!canAssignAdmin}
                        onClick={() => {
                          setSelectedOrgForAdmin(org.id);
                          setIsAssignModalOpen(true);
                        }}
                        title="Assign / Manage Administrators"
                      >
                        <i className="fas fa-user-plus"></i> Assign Admin
                      </button>
                      <button
                        className={`btn btn-sm ${org.status === "Active" ? "btn-danger" : "btn-success"}`}
                        onClick={() => toggleOrganizationStatus(org.id)}
                      >
                        {org.status === "Active" ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE ORGANIZATION MODAL */}
      <div
        className={`modal-overlay ${isModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Create Platform Organization</h2>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleCreateOrg}>
            <div className="form-group">
              <label className="form-label">Organization Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Electrical Engineering 300L Class Executive"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Organization Type</label>
              <select
                className="form-select"
                value={type}
                onChange={(e) => setType(e.target.value as OrganizationType)}
              >
                {orgTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Associated Institution</label>
              <select
                className="form-select"
                value={selectedInstName}
                onChange={(e) => setSelectedInstName(e.target.value)}
              >
                {institutions.map((i) => (
                  <option key={i.id} value={i.name}>
                    {i.name} ({i.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-check"></i> Create Organization
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ASSIGN ADMINISTRATOR MODAL */}
      <div
        className={`modal-overlay ${isAssignModalOpen ? "open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsAssignModalOpen(false);
        }}
      >
        <div className="modal">
          <div className="modal-header">
            <h2>Assign Organization Administrator</h2>
            <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <form onSubmit={handleAssignAdminSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Samuel Okafor"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="e.g. s.okafor@heightt.edu"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role</label>
              <select
                className="form-select"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
              >
                <option value="Organization Admin">Organization Admin</option>
                <option value="Financial Auditor">Financial Auditor</option>
                <option value="Elections Director">Elections Director</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-user-shield"></i> Grant Administrator Privileges
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
