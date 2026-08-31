"use client";

import { useState, useMemo } from "react";
import { usePermissions } from "../context/PermissionContext";

export type DueStatus = "active" | "draft" | "paused" | "expired";

export interface Due {
  id: string;
  title: string;
  dueDate: string;
  amount: string;
  status: DueStatus;
  target: string;
  progress: number;
}

const MOCK_DUES: Due[] = [
  {
    id: "1",
    title: "Departmental Dues 2025/26",
    dueDate: "Dec 15, 2026",
    amount: "₦25,000",
    status: "active",
    target: "All Students",
    progress: 74,
  },
  {
    id: "2",
    title: "Faculty Week Fees",
    dueDate: "Nov 30, 2026",
    amount: "₦5,000",
    status: "active",
    target: "All Students",
    progress: 64,
  },
  {
    id: "3",
    title: "Lab Maintenance",
    dueDate: "Oct 20, 2026",
    amount: "₦3,000",
    status: "expired",
    target: "All Students",
    progress: 42,
  },
  {
    id: "4",
    title: "Tech Fest Tickets",
    dueDate: "Jan 25, 2027",
    amount: "₦12,500",
    status: "paused",
    target: "All Students",
    progress: 35,
  },
  {
    id: "5",
    title: "Graduation Gown Deposit",
    dueDate: "Mar 10, 2027",
    amount: "₦35,000",
    status: "draft",
    target: "Final Year Only",
    progress: 0,
  },
];

const STATUS_STYLES: Record<DueStatus, { label: string; bg: string; text: string; dot: string }> = {
  active: { label: "Active", bg: "#DCFCE7", text: "#16A34A", dot: "#16A34A" },
  draft: { label: "Draft", bg: "#F1F5F9", text: "#64748B", dot: "#94A3B8" },
  paused: { label: "Paused", bg: "#FEF3C7", text: "#D97706", dot: "#D97706" },
  expired: { label: "Expired", bg: "#FEE2E2", text: "#DC2626", dot: "#DC2626" },
};

function progressColor(pct: number) {
  if (pct >= 60) return "#16A34A";
  if (pct >= 40) return "var(--color-primary)";
  return "#D97706";
}

interface DuesTableProps {
  search: string;
  statusFilter: string;
  levelFilter: string;
}

export default function DuesTable({ search, statusFilter, levelFilter }: DuesTableProps) {
  const { hasPermission } = usePermissions();
  const [dues, setDues] = useState<Due[]>(MOCK_DUES);

  const canEdit = hasPermission("DUE_UPDATE");
  const canDelete = hasPermission("DUE_DELETE");

  const filtered = useMemo(() => {
    return dues.filter((d) => {
      const matchSearch =
        !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.target.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchLevel =
        !levelFilter ||
        (levelFilter === "100" && d.target.includes("100")) ||
        (levelFilter === "200" && d.target.includes("200")) ||
        (levelFilter === "300" && d.target.includes("300")) ||
        (levelFilter === "400" && (d.target.includes("Final Year") || d.target.includes("400"))) ||
        d.target === "All Students";
      return matchSearch && matchStatus && matchLevel;
    });
  }, [dues, search, statusFilter, levelFilter]);

  const handleDelete = (id: string) => {
    if (confirm("Delete this due? This action cannot be undone.")) {
      setDues((prev) => prev.filter((d) => d.id !== id));
    }
  };

  if (filtered.length === 0) {
    return (
      <div
        className="bg-white border rounded-[var(--radius-card)] overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
          <i
            className="fas fa-coins text-5xl mb-3"
            style={{ color: "var(--color-border)" }}
          />
          <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>
            No dues found
          </h3>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {search || statusFilter || levelFilter
              ? "Try adjusting your filters"
              : "Create your first due to get started"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white border rounded-[var(--radius-card)] overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm" style={{ minWidth: "700px" }}>
          <thead style={{ background: "var(--color-muted)" }}>
            <tr>
              {["Due", "Amount", "Status", "Target", "Progress", "Actions"].map((h, i) => (
                <th
                  key={h}
                  className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.4px] border-b text-left"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-muted-foreground)",
                    textAlign: i === 5 ? "right" : "left",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((due, i) => {
              const st = STATUS_STYLES[due.status];
              const pct = due.progress;
              const fillColor = progressColor(pct);

              return (
                <tr
                  key={due.id}
                  className="transition-colors duration-150 hover:bg-slate-50"
                  style={{
                    borderBottom: i < filtered.length - 1 ? `1px solid var(--color-border)` : "none",
                  }}
                >
                  {/* Title */}
                  <td className="px-4 py-3.5 align-middle">
                    <div
                      className="font-semibold text-sm"
                      style={{ color: "var(--color-foreground)" }}
                    >
                      {due.title}
                    </div>
                    <div
                      className="text-xs mt-0.5"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      Due: {due.dueDate}
                    </div>
                  </td>

                  {/* Amount */}
                  <td
                    className="px-4 py-3.5 align-middle font-semibold text-sm"
                    style={{ color: "var(--color-foreground)" }}
                  >
                    {due.amount}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3.5 align-middle">
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium"
                      style={{ background: st.bg, color: st.text }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
                        style={{ background: st.dot }}
                      />
                      {st.label}
                    </span>
                  </td>

                  {/* Target */}
                  <td
                    className="px-4 py-3.5 align-middle text-sm"
                    style={{ color: "var(--color-muted-foreground)" }}
                  >
                    {due.target}
                  </td>

                  {/* Progress */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-20 h-1.5 rounded-full overflow-hidden flex-shrink-0"
                        style={{ background: "var(--color-muted)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: fillColor }}
                        />
                      </div>
                      <span
                        className="text-[13px] font-medium min-w-[40px]"
                        style={{ color: "var(--color-foreground)" }}
                      >
                        {pct}%
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit */}
                      {canEdit && (
                        <button
                          title="Edit"
                          className="w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center text-sm cursor-pointer transition-all duration-200"
                          style={{ color: "var(--color-muted-foreground)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "var(--color-muted)";
                            e.currentTarget.style.color = "var(--color-primary)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--color-muted-foreground)";
                          }}
                          onClick={() => alert(`Edit: ${due.title}`)}
                        >
                          <i className="fas fa-pen" />
                        </button>
                      )}

                      {/* View */}
                      <button
                        title="View"
                        className="w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center text-sm cursor-pointer transition-all duration-200"
                        style={{ color: "var(--color-muted-foreground)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--color-muted)";
                          e.currentTarget.style.color = "var(--color-foreground)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--color-muted-foreground)";
                        }}
                        onClick={() => alert(`View: ${due.title}`)}
                      >
                        <i className="fas fa-eye" />
                      </button>

                      {/* Delete */}
                      {canDelete && (
                        <button
                          title="Delete"
                          className="w-8 h-8 rounded-lg border-none bg-transparent flex items-center justify-center text-sm cursor-pointer transition-all duration-200"
                          style={{ color: "var(--color-muted-foreground)" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#FEE2E2";
                            e.currentTarget.style.color = "#DC2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "var(--color-muted-foreground)";
                          }}
                          onClick={() => handleDelete(due.id)}
                        >
                          <i className="fas fa-trash-can" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
