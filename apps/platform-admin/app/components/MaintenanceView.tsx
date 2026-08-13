"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";

export default function MaintenanceView() {
  const { maintenance, toggleMaintenanceMode, hasPermission } = useApp();

  const [message, setMessage] = useState(maintenance.bannerMessage);
  const canUpdate = hasPermission("MAINTENANCE_UPDATE");

  const handleToggle = (enabled: boolean) => {
    toggleMaintenanceMode(enabled, message);
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>System Maintenance Control</h1>
          <p>Route: <code>/platform/maintenance</code> • Manage system availability, maintenance windows, and status banners</p>
        </div>
      </div>

      <div className="system-status-bar" style={{ padding: "20px" }}>
        <span
          className={`status-dot ${
            maintenance.systemStatus === "Operational"
              ? "online"
              : maintenance.systemStatus === "Maintenance"
              ? "warning"
              : "offline"
          }`}
          style={{ width: "14px", height: "14px" }}
        ></span>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 800 }}>
            System Status: <span className="highlight">{maintenance.systemStatus}</span>
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>
            Last modified by <strong>{maintenance.lastUpdatedBy}</strong>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <span className={`status-badge ${maintenance.isMaintenanceEnabled ? "warning" : "active"}`}>
            {maintenance.isMaintenanceEnabled ? "MAINTENANCE MODE ACTIVE" : "OPERATIONAL"}
          </span>
        </div>
      </div>

      <div className="card" style={{ maxWidth: "600px", padding: "24px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>
          Maintenance Mode Settings
        </h3>

        <div className="form-group">
          <label className="form-label">Global Notice Banner Message</label>
          <textarea
            className="form-textarea"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={!canUpdate}
            placeholder="System maintenance in progress..."
          ></textarea>
        </div>

        <div className="form-group">
          <label className="form-label">Scheduled Maintenance Window</label>
          <input
            type="text"
            className="form-input"
            value={maintenance.scheduledWindow}
            disabled
          />
        </div>

        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {maintenance.isMaintenanceEnabled ? (
            <button
              className="btn btn-success"
              disabled={!canUpdate}
              onClick={() => handleToggle(false)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <i className="fas fa-check-circle"></i> Disable Maintenance Mode (Set Operational)
            </button>
          ) : (
            <button
              className="btn btn-danger"
              disabled={!canUpdate}
              onClick={() => handleToggle(true)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              <i className="fas fa-triangle-exclamation"></i> Enable Maintenance Mode
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
