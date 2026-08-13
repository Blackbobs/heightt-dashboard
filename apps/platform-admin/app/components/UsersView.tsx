"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { User } from "../types";

export default function UsersView() {
  const { users, updateUserStatus, hasPermission } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const canManage = hasPermission("USER_MANAGE");

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Users Directory</h1>
          <p>Route: <code>/platform/users</code> • Search student & admin accounts by Name, Email, or Username</p>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by Name, Email, or Username (@johndoe)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredUsers.length} Users
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Institution</th>
              <th>Memberships</th>
              <th>Account Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No users found matching query.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 700 }}>{u.name}</td>
                  <td><span className="badge primary">@{u.username}</span></td>
                  <td>{u.email}</td>
                  <td>{u.institution}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {u.memberships.map((m) => (
                        <span key={m} className="badge primary" style={{ fontSize: "10px" }}>
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${u.status.toLowerCase().replace(" ", "-")}`}>
                      {u.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px" }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setSelectedUser(u)}
                      >
                        <i className="fas fa-eye"></i> View Profile
                      </button>

                      {canManage && (
                        <button
                          className={`btn btn-sm ${u.status === "Active" ? "btn-danger" : "btn-success"}`}
                          onClick={() =>
                            updateUserStatus(u.id, u.status === "Active" ? "Suspended" : "Active")
                          }
                        >
                          {u.status === "Active" ? "Suspend" : "Activate"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* USER DETAIL MODAL */}
      {selectedUser && (
        <div className="modal-overlay open" onClick={() => setSelectedUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Account Profile</h2>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "16px", fontWeight: 800 }}>{selectedUser.name}</div>
              <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>@{selectedUser.username} • {selectedUser.email}</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ padding: "10px", background: "var(--bg)", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>INSTITUTION</div>
                <div style={{ fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>{selectedUser.institution}</div>
              </div>
              <div style={{ padding: "10px", background: "var(--bg)", borderRadius: "6px" }}>
                <div style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: 600 }}>ACCOUNT STATUS</div>
                <span className={`status-badge ${selectedUser.status.toLowerCase().replace(" ", "-")}`} style={{ marginTop: "4px" }}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Organization Memberships</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {selectedUser.memberships.map((m) => (
                  <span key={m} className="badge primary" style={{ padding: "4px 8px" }}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedUser(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
