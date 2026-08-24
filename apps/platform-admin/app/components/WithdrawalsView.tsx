"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformWithdrawals,
  useApproveUserWithdrawal,
  useRejectUserWithdrawal,
  useApproveOrganizationWithdrawal,
  useRejectOrganizationWithdrawal,
  useApprovePlatformWithdrawal,
  useRequestUserWithdrawal,
  useRequestOrganizationWithdrawal,
  useRequestPlatformWithdrawal,
} from "@/hooks/platform/usePlatformWithdrawals";
import { usePlatformBankAccounts } from "@/hooks/platform/usePlatformBankAccounts";
import { usePlatformOrganizations } from "@/hooks/platform/usePlatformOrganizations";
import {
  Coins,
  Search,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Building2,
  User,
  Calendar,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const WITHDRAWAL_STATUSES = [
  "PENDING",
  "PROCESSING",
  "COMPLETED",
  "FAILED",
  "CANCELLED",
];
const WITHDRAWAL_TYPES = ["USER", "ORGANIZATION", "PLATFORM"];

export default function WithdrawalsView() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any | null>(
    null,
  );
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState<
    "USER" | "ORGANIZATION" | "PLATFORM"
  >("USER");
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    bankAccountId: "",
    organizationId: "",
    amount: 0,
    reason: "",
  });

  const { data, isLoading, refetch } = usePlatformWithdrawals({
    page: currentPage,
    limit: 10,
    status: (statusFilter as any) || undefined,
    type: (typeFilter as any) || undefined,
  });

  const { data: bankAccountsData } = usePlatformBankAccounts({ limit: 100 });
  const { data: organizationsData } = usePlatformOrganizations({ limit: 100 });

  const approveUserMutation = useApproveUserWithdrawal();
  const rejectUserMutation = useRejectUserWithdrawal();
  const approveOrgMutation = useApproveOrganizationWithdrawal();
  const rejectOrgMutation = useRejectOrganizationWithdrawal();
  const approvePlatformMutation = useApprovePlatformWithdrawal();
  const requestUserMutation = useRequestUserWithdrawal();
  const requestOrgMutation = useRequestOrganizationWithdrawal();
  const requestPlatformMutation = useRequestPlatformWithdrawal();

  const withdrawals = data?.data || [];
  const meta = data?.meta;
  const bankAccounts = bankAccountsData?.data || [];
  const organizations = organizationsData?.data || [];

  const handleViewDetails = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async (id: string, type: string) => {
    if (confirm("Are you sure you want to approve this withdrawal?")) {
      try {
        if (type === "USER") await approveUserMutation.mutateAsync(id);
        else if (type === "ORGANIZATION")
          await approveOrgMutation.mutateAsync(id);
        else if (type === "PLATFORM")
          await approvePlatformMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to approve withdrawal:", error);
      }
    }
  };

  const handleReject = async (id: string, type: string) => {
    setRejectId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!rejectId) return;
    try {
      const withdrawal = withdrawals.find((w: any) => w.id === rejectId);
      if (withdrawal?.metadata?.type === "USER_WITHDRAWAL") {
        await rejectUserMutation.mutateAsync({
          id: rejectId,
          data: { reason: rejectReason || undefined },
        });
      } else if (withdrawal?.metadata?.type === "ORGANIZATION_WITHDRAWAL") {
        await rejectOrgMutation.mutateAsync({
          id: rejectId,
          data: { reason: rejectReason || undefined },
        });
      }
      setShowRejectModal(false);
      setRejectId(null);
      refetch();
    } catch (error) {
      console.error("Failed to reject withdrawal:", error);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (requestType === "USER") {
        await requestUserMutation.mutateAsync({
          bankAccountId: formData.bankAccountId,
          amount: formData.amount,
          reason: formData.reason || undefined,
        });
      } else if (requestType === "ORGANIZATION") {
        await requestOrgMutation.mutateAsync({
          organizationId: formData.organizationId,
          bankAccountId: formData.bankAccountId,
          amount: formData.amount,
          reason: formData.reason || undefined,
        });
      } else {
        await requestPlatformMutation.mutateAsync({
          bankAccountId: formData.bankAccountId,
          amount: formData.amount,
          reason: formData.reason || undefined,
        });
      }
      setIsRequestModalOpen(false);
      setFormData({
        bankAccountId: "",
        organizationId: "",
        amount: 0,
        reason: "",
      });
      refetch();
    } catch (error) {
      console.error("Failed to request withdrawal:", error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-amber-50 text-amber-600",
      PROCESSING: "bg-blue-50 text-blue-600",
      COMPLETED: "bg-emerald-50 text-emerald-600",
      FAILED: "bg-red-50 text-red-600",
      CANCELLED: "bg-slate-100 text-slate-500",
    };
    return colors[status] || colors.PENDING;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-3 h-3" />;
      case "PROCESSING":
        return <RefreshCw className="w-3 h-3 animate-spin" />;
      case "COMPLETED":
        return <CheckCircle className="w-3 h-3" />;
      case "FAILED":
        return <XCircle className="w-3 h-3" />;
      default:
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "reference",
        header: "Reference",
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-semibold">
              {row.original.reference}
            </div>
            <div className="text-xs text-slate-400">
              {row.original.metadata?.type?.replace("_WITHDRAWAL", "")}
            </div>
          </div>
        ),
      },
      {
        accessorFn: (r) =>
          r.metadata?.type?.replace("_WITHDRAWAL", "") || "N/A",
        id: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-50 text-purple-600">
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) => `₦${(r.amount / 100).toLocaleString()}`,
        id: "amount",
        header: "Amount",
        cell: ({ getValue }) => (
          <span className="font-bold text-slate-900">{getValue()}</span>
        ),
      },
      {
        accessorFn: (r) => r.bankName,
        id: "bank",
        header: "Bank",
        cell: ({ row }) => (
          <div>
            <div className="text-sm">{row.original.bankName}</div>
            <div className="text-xs text-slate-400">
              {row.original.accountNumber}
            </div>
          </div>
        ),
      },
      {
        accessorFn: (r) => r.accountName,
        id: "accountName",
        header: "Account Name",
      },
      {
        accessorFn: (r) => r.status,
        id: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
            >
              {getStatusIcon(status)}
              {status}
            </span>
          );
        },
      },
      {
        accessorFn: (r) => new Date(r.requestedAt).toLocaleDateString(),
        id: "requested",
        header: "Requested",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isPending = row.original.status === "PENDING";
          const type =
            row.original.metadata?.type?.replace("_WITHDRAWAL", "") || "USER";
          return (
            <div className="flex items-center justify-end gap-1.5">
              <button
                className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                onClick={() => handleViewDetails(row.original)}
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              {isPending && (
                <>
                  <button
                    className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                    onClick={() => handleApprove(row.original.id, type)}
                    title="Approve"
                    disabled={
                      approveUserMutation.isPending ||
                      approveOrgMutation.isPending ||
                      approvePlatformMutation.isPending
                    }
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                    onClick={() => handleReject(row.original.id, type)}
                    title="Reject"
                    disabled={
                      rejectUserMutation.isPending ||
                      rejectOrgMutation.isPending
                    }
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

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
            <Coins className="w-6 h-6 text-[#1a5cff]" />
            Withdrawals Management
          </h1>
          <p>Manage all withdrawal requests across the platform</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setRequestType("USER");
              setFormData({
                bankAccountId: bankAccounts[0]?.id || "",
                organizationId: "",
                amount: 0,
                reason: "",
              });
              setIsRequestModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Request Withdrawal
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search by reference or account name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            {WITHDRAWAL_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            {WITHDRAWAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Withdrawals
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {withdrawals.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No withdrawal requests found.
          </div>
        ) : (
          <DataTable columns={columns} data={withdrawals} />
        )}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-slate-500">
            Showing {(currentPage - 1) * 10 + 1} to{" "}
            {Math.min(currentPage * 10, meta.total)} of {meta.total}
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

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="modal-overlay open"
          onClick={() => setShowRejectModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject Withdrawal</h2>
              <button
                className="close-btn"
                onClick={() => setShowRejectModal(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <div className="form-group">
              <label className="form-label">Reason (Optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={confirmReject}
                disabled={
                  rejectUserMutation.isPending || rejectOrgMutation.isPending
                }
              >
                {rejectUserMutation.isPending || rejectOrgMutation.isPending
                  ? "Rejecting..."
                  : "Reject Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Withdrawal Modal */}
      {isRequestModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsRequestModalOpen(false)}
        >
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Withdrawal</h2>
              <button
                className="close-btn"
                onClick={() => setIsRequestModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleRequest}>
              <div className="form-group">
                <label className="form-label">Withdrawal Type *</label>
                <select
                  className="form-select"
                  value={requestType}
                  onChange={(e) => {
                    const type = e.target.value as
                      "USER" | "ORGANIZATION" | "PLATFORM";
                    setRequestType(type);
                    setFormData({
                      ...formData,
                      organizationId: "",
                    });
                  }}
                  required
                >
                  <option value="USER">User Wallet</option>
                  <option value="ORGANIZATION">Organization Wallet</option>
                  <option value="PLATFORM">Platform Wallet</option>
                </select>
              </div>

              {requestType === "ORGANIZATION" && (
                <div className="form-group">
                  <label className="form-label">Organization *</label>
                  <select
                    className="form-select"
                    value={formData.organizationId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        organizationId: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map((org: any) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.type})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Bank Account *</label>
                <select
                  className="form-select"
                  value={formData.bankAccountId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankAccountId: e.target.value,
                    })
                  }
                  required
                >
                  <option value="">Select Bank Account</option>
                  {bankAccounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber} (
                      {account.accountName})
                      {account.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (in Kobo) *</label>
                <input
                  type="number"
                  className="form-input"
                  placeholder="500000"
                  value={formData.amount || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  min="1"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Amount in Kobo (e.g., 500000 = ₦5,000)
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Reason</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Project expenses"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                />
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-start gap-2">
                  <DollarSign className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-semibold">Summary:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      <li>
                        <strong>Type:</strong> {requestType} Withdrawal
                      </li>
                      <li>
                        <strong>Amount:</strong> ₦
                        {(formData.amount / 100).toLocaleString()}
                      </li>
                      <li>
                        <strong>Bank:</strong>{" "}
                        {bankAccounts.find(
                          (a: any) => a.id === formData.bankAccountId,
                        )?.bankName || "Not selected"}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsRequestModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    requestUserMutation.isPending ||
                    requestOrgMutation.isPending ||
                    requestPlatformMutation.isPending
                  }
                >
                  {requestUserMutation.isPending ||
                  requestOrgMutation.isPending ||
                  requestPlatformMutation.isPending
                    ? "Requesting..."
                    : "Request Withdrawal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWithdrawal && isDetailModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsDetailModalOpen(false)}
        >
          <div className="modal max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Withdrawal Details</h2>
              <button
                className="close-btn"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-sm">
                    {selectedWithdrawal.reference}
                  </div>
                  <div className="text-sm text-slate-500">
                    {selectedWithdrawal.metadata?.type?.replace(
                      "_WITHDRAWAL",
                      " ",
                    )}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedWithdrawal.status)}`}
                >
                  {getStatusIcon(selectedWithdrawal.status)}
                  {selectedWithdrawal.status}
                </span>
              </div>

              {/* Amount */}
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <div className="text-sm text-slate-500">Amount</div>
                <div className="text-3xl font-bold text-slate-900">
                  ₦{(selectedWithdrawal.amount / 100).toLocaleString()}
                </div>
                <div className="text-sm text-slate-400">
                  Fee: ₦{(selectedWithdrawal.fee / 100).toLocaleString()} • Net:
                  ₦{(selectedWithdrawal.netAmount / 100).toLocaleString()}
                </div>
              </div>

              {/* Bank Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Bank</div>
                  <div className="font-semibold">
                    {selectedWithdrawal.bankName}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Account Number</div>
                  <div className="font-semibold">
                    {selectedWithdrawal.accountNumber}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg col-span-2">
                  <div className="text-xs text-slate-500">Account Name</div>
                  <div className="font-semibold">
                    {selectedWithdrawal.accountName}
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Requested</div>
                  <div className="text-sm font-medium">
                    {new Date(selectedWithdrawal.requestedAt).toLocaleString()}
                  </div>
                </div>
                {selectedWithdrawal.processedAt && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Processed</div>
                    <div className="text-sm font-medium">
                      {new Date(
                        selectedWithdrawal.processedAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
                {selectedWithdrawal.completedAt && (
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <div className="text-xs text-slate-500">Completed</div>
                    <div className="text-sm font-medium">
                      {new Date(
                        selectedWithdrawal.completedAt,
                      ).toLocaleString()}
                    </div>
                  </div>
                )}
                {selectedWithdrawal.failureReason && (
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200 col-span-2">
                    <div className="text-xs text-red-600">Failure Reason</div>
                    <div className="text-sm text-red-800">
                      {selectedWithdrawal.failureReason}
                    </div>
                  </div>
                )}
              </div>

              {/* Reason */}
              {selectedWithdrawal.metadata?.reason && (
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-xs text-slate-500">Reason</div>
                  <div className="text-sm">
                    {selectedWithdrawal.metadata.reason}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setIsDetailModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
