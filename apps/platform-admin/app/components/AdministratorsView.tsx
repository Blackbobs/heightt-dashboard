"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AdministratorsView() {
  const { administrators, revokeAdminAccess, hasPermission } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const canAssign = hasPermission("ADMIN_ASSIGN");

  const filteredAdmins = administrators.filter((adm) => {
    return (
      adm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adm.primaryOrganization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Platform Administrators</h1>
          <p>Route: <code>/platform/administrators</code> • Manage administrative memberships, permissions, and access revocations</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search administrator name, email, or organization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredAdmins.length} Administrators
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Administrator</th>
              <th>Email</th>
              <th>Primary Organization</th>
              <th>Administrative Memberships</th>
              <th>Assigned Date</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAdmins.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No administrators found matching criteria.
                </td>
              </tr>
            ) : (
              filteredAdmins.map((adm) => (
                <tr key={adm.id}>
                  <td style={{ fontWeight: 700 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "var(--primary-bg)",
                          color: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {adm.name.substring(0, 2).toUpperCase()}
                      </div>
                      {adm.name}
                    </div>
                  </td>
                  <td>{adm.email}</td>
                  <td>{adm.primaryOrganization}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {adm.memberships.map((m, idx) => (
                        <span
                          key={idx}
                          className="badge primary"
                          style={{ fontSize: "10px", padding: "3px 8px" }}
                          title={`Role: ${m.role}`}
                        >
                          <i className="fas fa-user-shield" style={{ fontSize: "9px", marginRight: "3px" }}></i>
                          {m.organizationName} ({m.role})
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{adm.assignedAt}</td>
                  <td>
                    <span className={`status-badge ${adm.status.toLowerCase()}`}>{adm.status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {adm.status === "Active" ? (
                      <button
                        className="btn btn-danger btn-sm"
                        disabled={!canAssign}
                        onClick={() => revokeAdminAccess(adm.id)}
                        title={canAssign ? "Revoke Administrative Access" : "Permission Required: ADMIN_ASSIGN"}
                      >
                        <i className="fas fa-user-slash"></i> Revoke Access
                      </button>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Access Revoked
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
