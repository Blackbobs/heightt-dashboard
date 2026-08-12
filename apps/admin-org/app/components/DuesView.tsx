"use client";

import { useState } from "react";
import DuesTable from "./DuesTable";
import CreateDueModal from "./CreateDueModal";
import { usePermissions } from "../context/PermissionContext";

export default function DuesView() {
  const { hasPermission } = usePermissions();
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  const canCreateDue = hasPermission("DUE_CREATE");

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            Dues
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Manage all dues for Computer Science Department
          </p>
        </div>
        {canCreateDue && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 font-sans"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-primary-dark)";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 16px oklch(46% .18 265 / 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--color-primary)";
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-plus" />
            Create
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "360px" }}>
          <i
            className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: "var(--color-muted-foreground)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dues..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white"
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white cursor-pointer"
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white cursor-pointer"
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
          >
            <option value="">All Levels</option>
            <option value="100">100 Level</option>
            <option value="200">200 Level</option>
            <option value="300">300 Level</option>
            <option value="400">400 Level</option>
          </select>

          {/* Clear filters */}
          {(search || statusFilter || levelFilter) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setLevelFilter(""); }}
              className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 bg-white font-sans"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-destructive)";
                e.currentTarget.style.color = "var(--color-destructive)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              <i className="fas fa-xmark" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <DuesTable
        search={search}
        statusFilter={statusFilter}
        levelFilter={levelFilter}
      />

      {/* Modal */}
      <CreateDueModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
