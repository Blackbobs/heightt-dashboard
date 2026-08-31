"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformAuditLogs,
  usePlatformAuditSummary,
} from "@/hooks/platform/usePlatformAuditLogs";
import {
  ClipboardList,
  Search,
  Loader2,
  Shield,
  User,
  Building2,
  FileText,
  Clock,
  Plus,
  Edit2,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function AuditLogsView() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, refetch } = usePlatformAuditLogs({
    page: currentPage,
    limit: 20,
    action: actionFilter || undefined,
    entity: entityFilter || undefined,
  });

  const { data: summary } = usePlatformAuditSummary();

  const logs = data?.data || [];
  const meta = data?.meta;

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE"))
      return <Plus className="w-3 h-3 text-emerald-500" />;
    if (action.includes("UPDATE"))
      return <Edit2 className="w-3 h-3 text-blue-500" />;
    if (action.includes("DELETE") || action.includes("REVOKE"))
      return <Trash2 className="w-3 h-3 text-red-500" />;
    if (action.includes("LOGIN"))
      return <User className="w-3 h-3 text-purple-500" />;
    return <ClipboardList className="w-3 h-3 text-slate-400" />;
  };

  // Define columns with useMemo - MUST be called before any conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorFn: (r) => new Date(r.createdAt).toLocaleString(),
        id: "timestamp",
        header: "Timestamp",
      },
      {
        id: "admin",
        header: "Administrator",
        cell: ({ row }) => {
          const adminName = row.original.user?.profile
            ? `${row.original.user.profile.firstName} ${row.original.user.profile.lastName}`
            : row.original.user?.username || "System";
          return (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                {adminName.substring(0, 2).toUpperCase()}
              </div>
              <span className="font-medium">{adminName}</span>
            </div>
          );
        },
      },
      {
        id: "action",
        header: "Action",
        cell: ({ row }) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {getActionIcon(row.original.action)}
            {row.original.action}
          </span>
        ),
      },
      {
        id: "resource",
        header: "Resource",
        cell: ({ row }) => (
          <div>
            <div className="text-sm font-medium">{row.original.entity}</div>
            <div className="text-xs text-slate-400">
              {row.original.entityId}
            </div>
          </div>
        ),
      },
      {
        id: "ip",
        header: "IP / Device",
        cell: ({ row }) => (
          <div className="text-xs text-slate-500">
            <div>{row.original.ipAddress || "N/A"}</div>
            <div className="text-slate-400">
              {row.original.userAgent?.substring(0, 30) || "Unknown"}
            </div>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Loading state AFTER all hooks are called
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-[#1a5cff]" />
            Platform Audit Logs
          </h1>
          <p>
            Route: <code>/platform/audit-logs</code> • 🔒 Immutable trail of all
            platform-wide administrative actions
          </p>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-slate-500">Total Actions</div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.total || 0}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-slate-500">Unique Users</div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.uniqueUsers || 0}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-slate-500">Unique Actions</div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.uniqueActions || 0}
            </div>
          </div>
          <div className="bg-white border rounded-lg p-4">
            <div className="text-xs text-slate-500">Entities Affected</div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.uniqueEntities || 0}
            </div>
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by admin name, action, or resource..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="ASSIGN">Assign</option>
            <option value="REVOKE">Revoke</option>
          </select>
          <select
            className="filter-select"
            value={entityFilter}
            onChange={(e) => {
              setEntityFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Entities</option>
            <option value="User">User</option>
            <option value="Institution">Institution</option>
            <option value="Organization">Organization</option>
            <option value="Announcement">Announcement</option>
            <option value="FeatureFlag">Feature Flag</option>
            <option value="Admin">Admin</option>
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Entries
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No audit log entries found.
          </div>
        ) : (
          <DataTable columns={columns} data={logs} />
        )}
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, meta.total)} of {meta.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={currentPage === meta.totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
