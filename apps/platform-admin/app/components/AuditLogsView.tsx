"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function AuditLogsView() {
  const { auditLogs } = useApp();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = auditLogs.filter((log) => {
    const term = searchTerm.toLowerCase();
    return (
      log.adminName.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.resource.toLowerCase().includes(term) ||
      log.ipAddress.includes(term)
    );
  });

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Platform Audit Logs</h1>
          <p>Route: <code>/platform/audit-logs</code> • 🔒 Immutable & read-only trail of all platform-wide administrative actions</p>
        </div>
      </div>

      <div className="permission-banner" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <i className="fas fa-lock" style={{ color: "var(--text-muted)" }}></i>
        <span>
          Audit logs are <strong>strictly read-only</strong> and cryptographically indexed for security compliance.
        </span>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search by Admin name, action, resource, or IP address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 600 }}>
            Total: {filteredLogs.length} Audit Entries
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Administrator</th>
              <th>Action Performed</th>
              <th>Target Resource</th>
              <th>IP / Device Info</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)" }}>
                  No audit log entries matching search query.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: "12px", whiteSpace: "nowrap" }}>{log.timestamp}</td>
                  <td style={{ fontWeight: 700 }}>{log.adminName}</td>
                  <td>
                    <span className="badge primary" style={{ fontWeight: 600 }}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.resource}</td>
                  <td style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                    <div><strong>IP:</strong> {log.ipAddress}</div>
                    <div>{log.deviceInfo}</div>
                  </td>
                  <td>
                    <span className={`status-badge ${log.status === "Success" ? "active" : "danger"}`}>
                      {log.status}
                    </span>
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
