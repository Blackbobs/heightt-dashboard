"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useSetDefaultBankAccount,
  useRegisterPayoutDestination,
  usePlatformSupportedBanks,
  useResolvePlatformBankAccount,
} from "@/hooks/platform/usePlatformBankAccounts";
import {
  Wallet,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  Star,
  StarOff,
  Building2,
  User,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

const BANK_CODES: Record<string, string> = {
  "058": "GTBank",
  "044": "Access Bank",
  "011": "First Bank",
  "014": "Zenith Bank",
  "033": "UBA",
};

export default function BankAccountsView() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [resolvedAccount, setResolvedAccount] = useState<{
    accountName: string;
    bankName: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bankCode: "",
    isDefault: false,
  });

  const { data, isLoading, refetch } = usePlatformBankAccounts({
    page: currentPage,
    limit: 10,
  });

  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();
  const setDefaultMutation = useSetDefaultBankAccount();
  const payoutDestinationMutation = useRegisterPayoutDestination();
  const resolveMutation = useResolvePlatformBankAccount();
  const { data: supportedBanksData, isLoading: banksLoading } =
    usePlatformSupportedBanks();
  const supportedBanks = Array.isArray(supportedBanksData)
    ? supportedBanksData
    : [];

  const accounts = data?.data || [];
  const meta = data?.meta;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!resolvedAccount) return;
      const createdAccount = await createMutation.mutateAsync({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        bankCode: formData.bankCode,
        isDefault: formData.isDefault,
      });
      try {
        await payoutDestinationMutation.mutateAsync(createdAccount.id);
      } catch (destinationError) {
        const { getApiErrorMessage } = await import("@/lib/api/error");
        alert(
          `Account saved. ${getApiErrorMessage(
            destinationError,
            "Payout registration failed. Use the refresh action to retry.",
          )}`,
        );
      }
      setIsModalOpen(false);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        bankCode: "",
        isDefault: false,
      });
      setResolvedAccount(null);
      refetch();
    } catch (error) {
      console.error("Failed to create bank account:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    try {
      await updateMutation.mutateAsync({
        id: editingAccount.id,
        data: {
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountName: formData.accountName,
          bankCode: formData.bankCode || undefined,
          isDefault: formData.isDefault,
        },
      });
      setIsModalOpen(false);
      setEditingAccount(null);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        bankCode: "",
        isDefault: false,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update bank account:", error);
    }
  };

  const handleDelete = async (id: string, accountName: string) => {
    if (
      confirm(`Are you sure you want to delete bank account "${accountName}"?`)
    ) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete bank account:", error);
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      console.error("Failed to set default bank account:", error);
    }
  };

  const handleEdit = (account: any) => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName || "",
      accountNumber: account.accountNumber || "",
      accountName: account.accountName || "",
      bankCode: account.bankCode || "",
      isDefault: account.isDefault || false,
    });
    setResolvedAccount({
      accountName: account.accountName,
      bankName: account.bankName,
    });
    setIsModalOpen(true);
  };

  const handleResolveAccount = async () => {
    if (!formData.bankCode || formData.accountNumber.length !== 10) return;
    try {
      const resolved = await resolveMutation.mutateAsync({
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
      });
      setResolvedAccount({
        accountName: resolved.accountName,
        bankName: resolved.bankName,
      });
      setFormData((current) => ({
        ...current,
        bankName: resolved.bankName,
        accountName: resolved.accountName,
      }));
    } catch (error) {
      const { getApiErrorMessage } = await import("@/lib/api/error");
      alert(getApiErrorMessage(error, "The account could not be verified."));
    }
  };

  const handleRegisterDestination = async (id: string) => {
    try {
      await payoutDestinationMutation.mutateAsync(id);
      refetch();
    } catch (error) {
      const { getApiErrorMessage } = await import("@/lib/api/error");
      alert(
        getApiErrorMessage(error, "Could not register the payout destination."),
      );
    }
  };

  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        id: "bank",
        header: "Bank Account",
        cell: ({ row }) => (
          <div>
            <div className="font-semibold">{row.original.bankName}</div>
            <div className="text-sm text-slate-500">
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
        accessorFn: (r) => r.bankCode || "N/A",
        id: "bankCode",
        header: "Bank Code",
      },
      {
        accessorFn: (r) => (r.isDefault ? "Yes" : "No"),
        id: "default",
        header: "Default",
        cell: ({ getValue, row }) => (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              row.original.isDefault
                ? "bg-emerald-50 text-emerald-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {row.original.isDefault ? (
              <Star className="w-3 h-3" />
            ) : (
              <StarOff className="w-3 h-3" />
            )}
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) =>
          r.payoutDestinationStatus ??
          r.payoutDestination?.status ??
          "pending_review",
        id: "destination",
        header: "Payout destination",
        cell: ({ getValue, row }) => {
          const status = getValue() as string;
          return (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 text-xs font-medium",
                  status === "approved"
                    ? "bg-emerald-50 text-emerald-700"
                    : status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700",
                )}
              >
                {status === "approved"
                  ? "Approved"
                  : status === "rejected"
                    ? "Rejected"
                    : "Awaiting Bachs approval"}
              </span>
              {status !== "approved" && (
                <button
                  type="button"
                  title="Register or refresh payout destination"
                  onClick={() => handleRegisterDestination(row.original.id)}
                  disabled={payoutDestinationMutation.isPending}
                  className="p-1 text-blue-600 disabled:opacity-50"
                >
                  <RefreshCw
                    className={cn(
                      "h-4 w-4",
                      payoutDestinationMutation.isPending && "animate-spin",
                    )}
                  />
                </button>
              )}
            </div>
          );
        },
      },
      {
        accessorFn: (r) => new Date(r.createdAt).toLocaleDateString(),
        id: "created",
        header: "Created",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            {!row.original.isDefault && (
              <button
                className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                onClick={() => handleSetDefault(row.original.id)}
                title="Set as Default"
              >
                <Star className="w-4 h-4" />
              </button>
            )}
            <button
              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
              onClick={() => handleEdit(row.original)}
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
              onClick={() =>
                handleDelete(row.original.id, row.original.accountName)
              }
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
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
            <Wallet className="w-6 h-6 text-[#1a5cff]" />
            Bank Accounts
          </h1>
          <p>Manage your bank accounts for withdrawals</p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingAccount(null);
              setFormData({
                bankName: "",
                accountNumber: "",
                accountName: "",
                bankCode: "",
                isDefault: false,
              });
              setResolvedAccount(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4" /> Add Bank Account
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrap">
            <Search className="w-4 h-4" />
            <input
              type="text"
              placeholder="Search bank accounts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        <div className="toolbar-right">
          <span className="text-sm text-slate-500 font-medium">
            Total: {meta?.total || 0} Accounts
          </span>
        </div>
      </div>

      <div className="table-responsive">
        {accounts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No bank accounts found.
          </div>
        ) : (
          <DataTable columns={columns} data={accounts} />
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
              </h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={editingAccount ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Bank *</label>
                <select
                  className="form-input"
                  value={formData.bankCode}
                  onChange={(e) => {
                    const bankCode = e.target.value;
                    const bank = supportedBanks.find(
                      (item) => item.code === bankCode,
                    );
                    setResolvedAccount(null);
                    setFormData({
                      ...formData,
                      bankCode,
                      bankName: bank?.name ?? "",
                      accountName: "",
                    });
                  }}
                  required
                  disabled={banksLoading}
                >
                  <option value="">
                    {banksLoading ? "Loading banks..." : "Select a bank"}
                  </option>
                  {supportedBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 0123456789"
                  value={formData.accountNumber}
                  onChange={(e) => {
                    setResolvedAccount(null);
                    setFormData({
                      ...formData,
                      accountNumber: e.target.value.replace(/\D/g, ""),
                      accountName: "",
                    });
                  }}
                  required
                  maxLength={10}
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary w-full mb-4"
                onClick={handleResolveAccount}
                disabled={
                  !formData.bankCode ||
                  formData.accountNumber.length !== 10 ||
                  resolveMutation.isPending
                }
              >
                {resolveMutation.isPending
                  ? "Verifying account..."
                  : "Verify account"}
              </button>

              <div className="form-group">
                <label className="form-label">Account Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.accountName}
                  readOnly
                  required
                />
                {resolvedAccount && (
                  <p className="text-xs font-medium text-emerald-700 mt-1">
                    Verified: {resolvedAccount.accountName}. Confirm these
                    details before saving.
                  </p>
                )}
              </div>

              <div className="form-group flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                />
                <label
                  htmlFor="isDefault"
                  className="text-sm font-medium text-slate-700"
                >
                  Set as Default Account
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    !resolvedAccount ||
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    payoutDestinationMutation.isPending
                  }
                >
                  {createMutation.isPending ||
                  updateMutation.isPending ||
                  payoutDestinationMutation.isPending
                    ? "Saving..."
                    : editingAccount
                      ? "Update Account"
                      : "Add Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
