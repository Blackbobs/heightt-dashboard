// apps/admin-org/components/WithdrawalsView.tsx
"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminWithdrawals,
  useRequestOrganizationWithdrawal,
  useAdminWithdrawal,
} from "@/hooks/admin/useAdminWithdrawals";
import { useAdminContext } from "./AdminContext";
import {
  ArrowUpRight,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn, formatKoboCurrency } from "@/lib/utils";
import { usePermissions } from "../context/PermissionContext";
import RequestWithdrawalModal from "./RequestWithdrawalModal";

const WITHDRAWAL_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting approval",
  PROCESSING: "Processing payout",
  COMPLETED: "Paid",
  FAILED: "Failed / Rejected",
  CANCELLED: "Cancelled",
};

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; icon: React.ReactNode }
> = {
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    icon: <Clock className="w-3 h-3" />,
  },
  PROCESSING: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    icon: <RefreshCw className="w-3 h-3 animate-spin" />,
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  FAILED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    icon: <XCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    icon: <AlertCircle className="w-3 h-3" />,
  },
};

export function WithdrawalsView() {
  const { hasPermission } = usePermissions();
  const { selectedScope } = useAdminContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedWithdrawalSnapshot, setSelectedWithdrawal] = useState<any | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const canRequest = hasPermission("WITHDRAWAL_REQUEST");
  const organizationId = selectedScope?.organizationId;

  const { data, isLoading, refetch } = useAdminWithdrawals({
    page: currentPage,
    limit: 10,
    status: statusFilter || undefined,
    type: "ORGANIZATION",
    organizationId,
    academicSessionId: selectedScope?.academicSessionId,
  });

  const requestMutation = useRequestOrganizationWithdrawal();
  const selectedWithdrawalQuery = useAdminWithdrawal(isDetailModalOpen ? selectedWithdrawalSnapshot?.id || "" : "");
  const selectedWithdrawal = selectedWithdrawalQuery.data || selectedWithdrawalSnapshot;

  const withdrawals = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;
  const filteredWithdrawals = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return withdrawals.filter((withdrawal) =>
      !query
        ? true
        : [
            withdrawal.reference,
            withdrawal.bankName,
            withdrawal.accountName,
            withdrawal.accountNumber,
            withdrawal.metadata?.reason,
            withdrawal.failureReason,
          ].some((value) =>
            String(value ?? "")
              .toLocaleLowerCase()
              .includes(query),
          ),
    );
  }, [search, withdrawals]);

  const handleViewDetails = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalOpen(true);
  };

  const handleOpenRequestModal = () => {
    setIsRequestModalOpen(true);
  };

  const handleSubmitWithdrawalRequest = async (data: any) => {
    if (!organizationId) {
      alert("No organization selected for this withdrawal request.");
      return;
    }
    try {
      await requestMutation.mutateAsync({
        ...data,
        organizationId,
      });
      refetch();
    } catch (error) {
      console.error("Failed to request withdrawal:", error);
      const code = (error as { response?: { data?: { code?: string } } }).response?.data?.code;
      if (code === "INSUFFICIENT_AVAILABLE_BALANCE") throw error;
      const { getApiErrorMessage } = await import("@/lib/api/error");
      alert(getApiErrorMessage(error, "Failed to submit withdrawal request."));
      throw error;
    }
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  };

  const formatDate = (date: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading withdrawals...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-[#1a5cff]" />
            Withdrawals
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            View and manage your organization's withdrawal requests
          </p>
        </div>
        {canRequest && (
          <button
            onClick={handleOpenRequestModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Request Withdrawal
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Total</div>
          <div className="text-lg font-bold text-slate-900">
            {withdrawals.length}
          </div>
        </div>
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Pending</div>
          <div className="text-lg font-bold text-amber-600">
            {withdrawals.filter((w: any) => w.status === "PENDING").length}
          </div>
        </div>
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Completed</div>
          <div className="text-lg font-bold text-emerald-600">
            {withdrawals.filter((w: any) => w.status === "COMPLETED").length}
          </div>
        </div>
        <div
          className="bg-white border rounded-xl p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="text-xs text-slate-500 font-medium">Failed</div>
          <div className="text-lg font-bold text-red-600">
            {withdrawals.filter((w: any) => w.status === "FAILED").length}
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
            placeholder="Search by reference, bank, or account..."
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
        >
          <option value="">All Status</option>
          {WITHDRAWAL_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
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
            className="px-3 py-2.5 border-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-300 transition-all bg-white border-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      <div
        className="bg-white border rounded-xl overflow-hidden"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filteredWithdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-300 mb-3">
              <ArrowUpRight className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No withdrawals found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {search || statusFilter
                ? "No matching withdrawals found. Try adjusting your search query."
                : 'No withdrawal requests yet. Click "Request Withdrawal" to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr
                  className="bg-slate-50 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Bank
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Date
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
                {filteredWithdrawals.map((withdrawal: any) => {
                  const statusConfig = getStatusConfig(withdrawal.status);

                  return (
                    <tr
                      key={withdrawal.id}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-mono text-xs font-semibold text-slate-900">
                          {withdrawal.reference}
                        </div>
                        <div className="text-xs text-slate-400">
                          {withdrawal.metadata?.type?.replace(
                            "_WITHDRAWAL",
                            "",
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-bold text-sm text-slate-900">
                          {formatKoboCurrency(withdrawal.amount)}
                        </div>
                        <div className="text-xs text-slate-400">
                          Fee: {formatKoboCurrency(withdrawal.fee)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-sm text-slate-700">
                          {withdrawal.bankName}
                        </div>
                        <div className="text-xs text-slate-400">
                          {withdrawal.accountNumber}
                        </div>
                        <div className="text-xs text-slate-400">
                          {withdrawal.accountName}
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
                          {STATUS_LABELS[withdrawal.status] ||
                            withdrawal.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-sm text-slate-700">
                          {formatDate(withdrawal.requestedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle text-right">
                        <button
                          onClick={() => handleViewDetails(withdrawal)}
                          className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RequestWithdrawalModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleSubmitWithdrawalRequest}
      />

      {selectedWithdrawal && isDetailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm" onClick={() => setIsDetailModalOpen(false)}>
          <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()} aria-labelledby="withdrawal-details-title">
            <div className="flex items-start justify-between gap-4">
              <div><h2 id="withdrawal-details-title" className="text-lg font-bold">Withdrawal details</h2><p className="mt-1 font-mono text-xs text-slate-500">{selectedWithdrawal.reference}</p></div>
              <button className="rounded-full p-2 text-slate-500 hover:bg-slate-100" onClick={() => setIsDetailModalOpen(false)} aria-label="Close details"><Plus className="h-4 w-4 rotate-45" /></button>
            </div>
            <div className={cn("mt-4 rounded-lg p-3 text-sm", getStatusConfig(selectedWithdrawal.status).bg, getStatusConfig(selectedWithdrawal.status).text)} aria-live="polite">
              <strong>{STATUS_LABELS[selectedWithdrawal.status] || selectedWithdrawal.status}</strong>
              <p className="mt-1">{selectedWithdrawal.status === "PENDING" ? "This withdrawal is waiting for approval." : selectedWithdrawal.status === "PROCESSING" ? "The payout has been submitted. This page refreshes automatically until the provider confirms it." : selectedWithdrawal.status === "COMPLETED" ? "The payout provider confirmed this transfer as completed." : selectedWithdrawal.status === "FAILED" ? "The payout failed. Review the failure reason below." : "This withdrawal was cancelled."}</p>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-4"><div className="text-xs text-slate-500">Withdrawal amount</div><div className="text-2xl font-bold">{formatKoboCurrency(selectedWithdrawal.amount)}</div><div className="mt-1 text-xs text-slate-500">Fee: {formatKoboCurrency(selectedWithdrawal.fee)} · Total debit: {formatKoboCurrency(selectedWithdrawal.amount + selectedWithdrawal.fee)}</div></div>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Bank account</dt><dd className="mt-1 text-sm font-semibold">{selectedWithdrawal.bankName}<br />{selectedWithdrawal.accountNumber}<br />{selectedWithdrawal.accountName}</dd></div>
              <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Requested</dt><dd className="mt-1 text-sm font-semibold">{new Date(selectedWithdrawal.requestedAt).toLocaleString()}</dd></div>
              {selectedWithdrawal.processedAt && <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Submitted to provider</dt><dd className="mt-1 text-sm font-semibold">{new Date(selectedWithdrawal.processedAt).toLocaleString()}</dd></div>}
              {selectedWithdrawal.completedAt && <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Completed</dt><dd className="mt-1 text-sm font-semibold">{new Date(selectedWithdrawal.completedAt).toLocaleString()}</dd></div>}
              {selectedWithdrawal.failedAt && <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Failed</dt><dd className="mt-1 text-sm font-semibold">{new Date(selectedWithdrawal.failedAt).toLocaleString()}</dd></div>}
            </dl>
            {selectedWithdrawal.status === "FAILED" && selectedWithdrawal.failureReason && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">Reason: {selectedWithdrawal.failureReason}</p>}
            <div className="mt-5 flex justify-end gap-2"><button className="rounded-lg border px-4 py-2 text-sm font-semibold" onClick={() => selectedWithdrawalQuery.refetch()} disabled={selectedWithdrawalQuery.isFetching}><RefreshCw className={cn("mr-2 inline h-4 w-4", selectedWithdrawalQuery.isFetching && "animate-spin")} />Refresh status</button><button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={() => setIsDetailModalOpen(false)}>Close</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
