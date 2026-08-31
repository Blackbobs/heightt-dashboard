// apps/admin-org/components/DuesView.tsx
"use client";

import { useState, useMemo } from "react";
import {
  useAdminDues,
  useCreateDue,
  useAssignDue,
  useDeleteDue,
} from "@/hooks/admin/useAdminFinance";
import { useAdminContext } from "./AdminContext";
import {
  Search,
  Plus,
  Coins,
  Users,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Clock,
  CheckCircle,
  Ban,
  Pause,
  FileText,
} from "lucide-react";
import { cn, formatKoboCurrency } from "@/lib/utils";
import { usePermissions } from "../context/PermissionContext";
import CreateDueModal from "./CreateDueModal";

const ITEMS_PER_PAGE = 10;

const STATUS_CONFIG: Record<
  string,
  {
    bg: string;
    text: string;
    dot: string;
    label: string;
    icon: React.ReactNode;
  }
> = {
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Active",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  INACTIVE: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Inactive",
    icon: <Ban className="w-3 h-3" />,
  },
  DRAFT: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    label: "Draft",
    icon: <FileText className="w-3 h-3" />,
  },
  PAUSED: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    label: "Paused",
    icon: <Pause className="w-3 h-3" />,
  },
  COMPLETED: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    dot: "bg-purple-500",
    label: "Completed",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Cancelled",
    icon: <Ban className="w-3 h-3" />,
  },
  EXPIRED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Expired",
    icon: <Clock className="w-3 h-3" />,
  },
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "PAUSED", label: "Paused" },
  { value: "COMPLETED", label: "Completed" },
  { value: "EXPIRED", label: "Expired" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function DuesView() {
  const { selectedScope } = useAdminContext();
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDue, setSelectedDue] = useState<any | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const canCreateDue = hasPermission("DUE_CREATE");
  const canEditDue = hasPermission("DUE_UPDATE");
  const canDeleteDue = hasPermission("DUE_DELETE");

  const organizationId = selectedScope?.organizationId || "";

  const { data, isLoading, refetch } = useAdminDues({
    organizationId,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const createDueMutation = useCreateDue();
  const assignDueMutation = useAssignDue();
  const deleteDueMutation = useDeleteDue();

  const dues = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;

  const filteredDues = useMemo(() => {
    let filtered = dues;

    if (search) {
      const searchLower = search.trim().toLocaleLowerCase();
      filtered = filtered.filter(
        (due: any) =>
          due.name?.toLowerCase().includes(searchLower) ||
          due.description?.toLowerCase().includes(searchLower) ||
          due.organization?.name?.toLowerCase().includes(searchLower),
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((due: any) => due.status === statusFilter);
    }

    return filtered;
  }, [dues, search, statusFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCreateDue = async (dueData: any) => {
    try {
      await createDueMutation.mutateAsync({
        ...dueData,
        organizationId,
      });
      refetch();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create due:", error);
    }
  };

  const handleAssignDue = async (dueId: string) => {
    if (confirm("Assign this due to all students in the organization?")) {
      try {
        await assignDueMutation.mutateAsync({
          id: dueId,
          data: {
            departmentId: selectedScope?.departmentId,
            levelId: selectedScope?.academicLevelId,
            studentIds: [],
          },
        });
        refetch();
      } catch (error) {
        console.error("Failed to assign due:", error);
      }
    }
  };

  const handleDeleteDue = async (id: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteDueMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete due:", error);
      }
    }
  };

  const handleViewDue = (due: any) => {
    setSelectedDue(due);
    setIsDetailModalOpen(true);
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.ACTIVE;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading dues...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Dues
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage all dues for{" "}
            {selectedScope?.organization?.name || "your organization"}
          </p>
        </div>
        {canCreateDue && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Create Due
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Total Dues</div>
          <div className="text-lg font-bold text-slate-900">{dues.length}</div>
        </div>
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Active</div>
          <div className="text-lg font-bold text-emerald-600">
            {dues.filter((d: any) => d.status === "ACTIVE").length}
          </div>
        </div>
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Draft</div>
          <div className="text-lg font-bold text-amber-600">
            {dues.filter((d: any) => d.status === "DRAFT").length}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search dues by name, description..."
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer min-w-[140px]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setCurrentPage(1);
            }}
            className="flex items-center gap-1.5 px-3 py-2.5 border-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-300 transition-all bg-white border-slate-200"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      <div
        className="bg-white border rounded-xl overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filteredDues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-300 mb-3">
              <Coins className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No dues found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {search || statusFilter
                ? "No matching dues found. Try adjusting your search query."
                : 'No dues created yet. Click "Create Due" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[760px]">
              <thead>
                <tr
                  className="bg-slate-50 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Due
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {filteredDues.map((due: any) => {
                  const statusConfig = getStatusConfig(due.status);

                  return (
                    <tr
                      key={due.id}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {due.name}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">
                            {due.description || "No description"}
                          </div>
                          {due.isRequired && (
                            <span className="inline-flex mt-1 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              Required
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <span className="font-bold text-sm text-slate-900">
                            {formatKoboCurrency(due.amount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                            statusConfig.bg,
                            statusConfig.text,
                          )}
                        >
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleViewDue(due)}
                            className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {canEditDue && (
                            <button
                              onClick={() => alert(`Edit due: ${due.name}`)}
                              className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-amber-50 text-slate-400 hover:text-amber-600 cursor-pointer flex items-center justify-center transition-colors"
                              title="Edit Due"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          {due.status === "DRAFT" && (
                            <button
                              onClick={() => handleAssignDue(due.id)}
                              className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer flex items-center justify-center transition-colors"
                              title="Assign to Students"
                            >
                              <Users className="w-4 h-4" />
                            </button>
                          )}

                          {canDeleteDue && (
                            <button
                              onClick={() => handleDeleteDue(due.id, due.name)}
                              className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer flex items-center justify-center transition-colors"
                              title="Delete Due"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {meta && meta.totalPages > 1 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="text-xs text-slate-500">
              Showing{" "}
              <strong className="text-slate-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-700">
                {Math.min(currentPage * ITEMS_PER_PAGE, meta.total)}
              </strong>{" "}
              of <strong className="text-slate-700">{meta.total}</strong> dues
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(meta.totalPages, 5) }).map(
                (_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg border text-xs font-semibold cursor-pointer transition-colors",
                        isActive
                          ? "bg-[#1a5cff] text-white border-[#1a5cff]"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              <button
                disabled={currentPage === meta.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <CreateDueModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateDue}
      />
    </div>
  );
}
