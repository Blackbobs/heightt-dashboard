"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "../context/AppContext";
import { usePlatformDashboardAnalytics } from "@/hooks/platform/usePlatformAnalytics";

export default function DashboardView() {
  const {
    institutions,
    organizations,
    administrators,
    auditLogs,
    maintenance,
  } = useApp();

  const {
    data: dashboard,
    isLoading,
    refetch,
  } = usePlatformDashboardAnalytics();

  // Extract data from the dashboard response
  const summary = dashboard?.summary || {};
  const revenueData = dashboard?.revenue || {};
  const studentData = dashboard?.students || {};
  const orgData = dashboard?.organizations || {};
  const recentActivities = dashboard?.recentActivities || [];

  // Use data from API or fallback to context data
  const totalInstitutions = institutions.length;
  const totalOrganizations = orgData.totalOrganizations || organizations.length;
  const totalStudents = summary.totalStudents || 0;
  const totalAdministrators = administrators.length;
  const totalTransactions = revenueData.totalTransactions || 0;
  const totalRevenue = revenueData.totalRevenueFormatted || "₦0.00";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-[#1a5cff] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="platform-dashboard">
      {/* Page Header */}
      <div className="page-head">
        <div className="title">
          <h1>Platform Dashboard</h1>
          <p>Global oversight and statistics across the Heightt platform</p>
        </div>
        <div className="actions">
          <Link href="/platform/organizations" className="btn btn-primary">
            <i className="fas fa-plus"></i> New Organization
          </Link>
          <Link href="/platform/institutions" className="btn btn-secondary">
            <i className="fas fa-building"></i> Add Institution
          </Link>
        </div>
      </div>

      {/* System Status */}
      <div className="system-status-bar">
        <span
          className={`status-dot ${
            maintenance.systemStatus === "Operational"
              ? "online"
              : maintenance.systemStatus === "Maintenance"
                ? "warning"
                : "offline"
          }`}
        ></span>
        <span className="status-text">
          System Status:{" "}
          <span className="highlight">{maintenance.systemStatus}</span>
        </span>
        <span className="status-meta">
          <i
            className="fas fa-check-circle"
            style={{ color: "var(--success)" }}
          ></i>
          {maintenance.bannerMessage}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Institutions</div>
          <div className="stat-value">{totalInstitutions}</div>
          <div className="stat-change">Live API total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Organizations</div>
          <div className="stat-value">{totalOrganizations}</div>
          <div className="stat-change">
            {orgData.activeOrganizations || 0} active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Students</div>
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-change">
            {studentData.activeStudents || 0} active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Administrators</div>
          <div className="stat-value">{totalAdministrators}</div>
          <div className="stat-change">Live API total</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Transactions</div>
          <div className="stat-value">{totalTransactions}</div>
          <div className="stat-change">
            {revenueData.averageTransactionValueFormatted || "₦0"} avg
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Volume</div>
          <div className="stat-value">{totalRevenue}</div>
          <div className="stat-change">
            {revenueData.revenueGrowth || 0}% growth
          </div>
        </div>
      </div>

      {/* Organization Stats Breakdown */}
      {orgData.organizationsByType &&
        orgData.organizationsByType.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">Organization Types</div>
                <div className="mt-2 space-y-2">
                  {orgData.organizationsByType
                    .slice(0, 3)
                    .map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.type}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ))}
                  {orgData.organizationsByType.length > 3 && (
                    <div className="text-xs text-slate-400">
                      +{orgData.organizationsByType.length - 3} more types
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">
                  Organization Status
                </div>
                <div className="mt-2 space-y-2">
                  {orgData.organizationsByStatus?.map(
                    (item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-600">{item.status}</span>
                        <span className="font-semibold">{item.count}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">Member Stats</div>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Members</span>
                    <span className="font-semibold">
                      {orgData.memberStats?.totalMembers || 0}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Avg per Organization</span>
                    <span className="font-semibold">
                      {orgData.memberStats?.averageMembersPerOrganization || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Content Grid - Mobile Responsive */}
      <div className="content-grid">
        {/* Left Column: Recent Activity Audit Stream */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Platform Activity</h3>
            <Link href="/platform/audit-logs" className="action">
              View Audit Logs →
            </Link>
          </div>
          <div className="card-body">
            {recentActivities.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                No recent activity
              </div>
            ) : (
              recentActivities.slice(0, 5).map((log: any) => {
                const action = log.type?.replace(/_/g, " ") || "Activity";
                const resource = log.description
                  ? (() => {
                      try {
                        const parsed =
                          typeof log.description === "string"
                            ? JSON.parse(log.description)
                            : log.description;
                        return parsed.name || parsed.resource || "Action";
                      } catch {
                        return "Action";
                      }
                    })()
                  : "Action";

                return (
                  <div key={log.id} className="activity-item">
                    <div className="activity-icon">
                      <i className="fas fa-clipboard-check"></i>
                    </div>
                    <div className="activity-info">
                      <div className="activity-title">{action}</div>
                      <div className="activity-desc">
                        {resource} • by {log.userName || "System"}
                      </div>
                    </div>
                    <span className="activity-time">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Recently Created Orgs & Admins */}
        <div className="right-column">
          {/* Recently Created Organizations */}
          <div className="card">
            <div className="card-header">
              <h3>Recently Created Organizations</h3>
              <Link href="/platform/organizations" className="action">
                View all →
              </Link>
            </div>
            <div className="card-body">
              {organizations.slice(0, 3).map((org) => (
                <div key={org.id} className="org-item">
                  <div className="org-icon">
                    <i className="fas fa-flag"></i>
                  </div>
                  <div className="org-info">
                    <div className="org-name">{org.name}</div>
                    <div className="org-desc">
                      {org.institutionName} • {org.type}
                    </div>
                  </div>
                  <span className={`status-badge ${org.status.toLowerCase()}`}>
                    {org.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Administrators */}
          <div className="card">
            <div className="card-header">
              <h3>Recent Administrators</h3>
              <Link href="/platform/administrators" className="action">
                Manage →
              </Link>
            </div>
            <div className="card-body">
              {administrators.slice(0, 3).map((adm) => (
                <div key={adm.id} className="admin-item">
                  <div className="admin-avatar">
                    {adm.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="admin-info">
                    <div className="admin-name">{adm.name}</div>
                    <div className="admin-org">{adm.primaryOrganization}</div>
                  </div>
                  <span className={`status-badge ${adm.status.toLowerCase()}`}>
                    {adm.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ============================================================
           PLATFORM DASHBOARD STYLES
           ============================================================ */
        .platform-dashboard {
          width: 100%;
        }

        /* ============================================================
           PAGE HEADER
           ============================================================ */
        .page-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .page-head .title h1 {
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .page-head .title p {
          font-size: 14px;
          color: var(--text-muted);
          margin: 2px 0 0 0;
        }

        .page-head .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 9px 18px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--primary);
          color: #fff;
        }

        .btn-primary:hover {
          background: var(--primary-dark);
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: var(--surface);
          color: var(--primary);
          border: 1px solid var(--border);
        }

        .btn-secondary:hover {
          background: var(--primary-bg);
          border-color: var(--primary);
        }

        /* ============================================================
           SYSTEM STATUS
           ============================================================ */
        .system-status-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 18px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .system-status-bar .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .system-status-bar .status-dot.online {
          background: var(--success);
        }
        .system-status-bar .status-dot.warning {
          background: var(--warning);
        }
        .system-status-bar .status-dot.offline {
          background: var(--danger);
        }

        .system-status-bar .status-text {
          font-size: 14px;
          font-weight: 500;
        }

        .system-status-bar .status-text .highlight {
          font-weight: 700;
          color: var(--success);
        }

        .system-status-bar .status-meta {
          margin-left: auto;
          font-size: 13px;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* ============================================================
           STATS GRID
           ============================================================ */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 14px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 18px;
          transition: all 0.2s ease;
        }

        .stat-card:hover {
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-light);
        }

        .stat-card .stat-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .stat-card .stat-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          margin-top: 2px;
        }

        .stat-card .stat-change {
          font-size: 11px;
          font-weight: 500;
          margin-top: 2px;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .stat-card .stat-change.up {
          color: var(--success);
        }
        .stat-card .stat-change.down {
          color: var(--danger);
        }

        /* ============================================================
           CONTENT GRID
           ============================================================ */
        .content-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .right-column {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ============================================================
           CARDS
           ============================================================ */
        .card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          overflow: hidden;
        }

        .card-header {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 15px;
          font-weight: 600;
          margin: 0;
        }

        .card-header .action {
          font-size: 13px;
          color: var(--primary);
          font-weight: 500;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          text-decoration: none;
        }

        .card-header .action:hover {
          text-decoration: underline;
        }

        .card-body {
          padding: 4px 20px 12px;
        }

        /* ============================================================
           ACTIVITY ITEMS
           ============================================================ */
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .activity-item:last-child {
          border-bottom: none;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary-bg);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }

        .activity-info {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          font-size: 14px;
          font-weight: 600;
        }

        .activity-desc {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .activity-time {
          font-size: 11px;
          color: var(--text-muted);
          flex-shrink: 0;
        }

        /* ============================================================
           ORGANIZATION ITEMS
           ============================================================ */
        .org-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .org-item:last-child {
          border-bottom: none;
        }

        .org-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--primary-bg);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          flex-shrink: 0;
        }

        .org-info {
          flex: 1;
          min-width: 0;
        }

        .org-name {
          font-size: 13px;
          font-weight: 600;
        }

        .org-desc {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ============================================================
           ADMIN ITEMS
           ============================================================ */
        .admin-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid var(--border);
        }

        .admin-item:last-child {
          border-bottom: none;
        }

        .admin-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #ede9fe;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .admin-info {
          flex: 1;
          min-width: 0;
        }

        .admin-name {
          font-size: 13px;
          font-weight: 600;
        }

        .admin-org {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ============================================================
           STATUS BADGE
           ============================================================ */
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 12px;
          border-radius: 12px;
          font-size: 10px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .status-badge.active {
          background: var(--success-bg);
          color: var(--success);
        }

        .status-badge.pending {
          background: var(--warning-bg);
          color: var(--warning);
        }

        .status-badge.inactive {
          background: var(--bg);
          color: var(--text-muted);
        }

        .status-badge.suspended {
          background: var(--danger-bg);
          color: var(--danger);
        }

        /* ============================================================
           RESPONSIVE
           ============================================================ */
        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .content-grid {
            grid-template-columns: 1fr;
          }

          .right-column {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
        }

        @media (max-width: 768px) {
          .page-head {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .page-head .actions {
            width: 100%;
          }

          .page-head .actions .btn {
            flex: 1;
            justify-content: center;
            padding: 10px 14px;
            font-size: 12px;
          }

          .page-head .title h1 {
            font-size: 20px;
          }

          .page-head .title p {
            font-size: 13px;
          }

          .system-status-bar {
            padding: 10px 14px;
            gap: 8px;
          }

          .system-status-bar .status-text {
            font-size: 13px;
          }

          .system-status-bar .status-meta {
            font-size: 12px;
            margin-left: 0;
            width: 100%;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }

          .stat-card {
            padding: 12px 14px;
          }

          .stat-card .stat-value {
            font-size: 18px;
          }

          .stat-card .stat-change {
            font-size: 10px;
          }

          .content-grid {
            gap: 16px;
          }

          .right-column {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .card-header {
            padding: 12px 16px;
          }

          .card-header h3 {
            font-size: 14px;
          }

          .card-body {
            padding: 4px 16px 10px;
          }

          .activity-item {
            padding: 10px 0;
            gap: 10px;
            flex-wrap: wrap;
          }

          .activity-icon {
            width: 32px;
            height: 32px;
            font-size: 12px;
          }

          .activity-title {
            font-size: 13px;
          }

          .activity-desc {
            font-size: 11px;
            white-space: normal;
          }

          .activity-time {
            font-size: 10px;
            margin-left: auto;
          }

          .org-item,
          .admin-item {
            padding: 10px 0;
            gap: 10px;
            flex-wrap: wrap;
          }

          .org-icon {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .org-name {
            font-size: 12px;
          }

          .org-desc {
            font-size: 10px;
            white-space: normal;
          }

          .admin-avatar {
            width: 28px;
            height: 28px;
            font-size: 10px;
          }

          .admin-name {
            font-size: 12px;
          }

          .admin-org {
            font-size: 10px;
            white-space: normal;
          }

          .status-badge {
            font-size: 9px;
            padding: 1px 10px;
          }
        }

        @media (max-width: 480px) {
          .page-head .actions {
            flex-direction: column;
          }

          .page-head .actions .btn {
            width: 100%;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .stat-card {
            padding: 10px 12px;
          }

          .stat-card .stat-value {
            font-size: 16px;
          }

          .stat-card .stat-label {
            font-size: 10px;
          }

          .stat-card .stat-change {
            font-size: 9px;
          }

          .system-status-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .system-status-bar .status-meta {
            font-size: 11px;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }

          .card-header .action {
            font-size: 12px;
          }
        }

        @media (max-width: 360px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .activity-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }

          .activity-time {
            margin-left: 0;
            font-size: 10px;
          }

          .org-item,
          .admin-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
}
