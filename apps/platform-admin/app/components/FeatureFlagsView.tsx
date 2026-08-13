"use client";

import React from "react";
import { useApp } from "../context/AppContext";

export default function FeatureFlagsView() {
  const { featureFlags, toggleFeatureFlag, hasPermission } = useApp();

  const canUpdate = hasPermission("FEATURE_FLAG_UPDATE");

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Feature Flags Control</h1>
          <p>Route: <code>/platform/feature-flags</code> • Enable or disable platform features dynamically across Heightt</p>
        </div>
      </div>

      {!canUpdate && (
        <div className="permission-banner" style={{ background: "var(--warning-bg)", borderColor: "var(--warning)" }}>
          <i className="fas fa-exclamation-triangle" style={{ color: "var(--warning)" }}></i>
          <span>
            Read-only mode: You need <strong>FEATURE_FLAG_UPDATE</strong> permission to modify feature states.
          </span>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
        {featureFlags.map((flag) => (
          <div className="card" key={flag.id} style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700 }}>{flag.name}</h3>
                <span className="badge primary" style={{ fontSize: "10px", marginTop: "4px" }}>
                  {flag.key}
                </span>
              </div>
              <span className={`status-badge ${flag.enabled ? "on" : "off"}`}>
                {flag.enabled ? "ON" : "OFF"}
              </span>
            </div>

            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px", minHeight: "36px" }}>
              {flag.description}
            </p>

            <div style={{ padding: "10px", background: "var(--bg)", borderRadius: "6px", fontSize: "11px", color: "var(--text-muted)", marginBottom: "16px" }}>
              Last changed by <strong>{flag.lastUpdatedBy}</strong> on {flag.lastUpdatedAt}
            </div>

            <button
              className={`btn ${flag.enabled ? "btn-danger" : "btn-primary"}`}
              style={{ width: "100%", justifyContent: "center" }}
              disabled={!canUpdate}
              onClick={() => toggleFeatureFlag(flag.id)}
            >
              <i className={`fas ${flag.enabled ? "fa-toggle-off" : "fa-toggle-on"}`}></i>
              {flag.enabled ? "Disable Feature (Set OFF)" : "Enable Feature (Set ON)"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
