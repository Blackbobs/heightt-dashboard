"use client";

import React, { useState, useMemo } from "react";
import {
  useAdminBankAccounts,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useSetDefaultBankAccount,
} from "@/hooks/admin/useAdminBankAccounts";
import {
  Wallet,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  Star,
  StarOff,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "../context/PermissionContext";

export function BankAccountsView() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bankCode: "",
    isDefault: false,
  });

  const canCreate = hasPermission("WITHDRAWAL_REQUEST");
  const canEdit = hasPermission("FINANCE_VIEW");

  const { data, isLoading, refetch } = useAdminBankAccounts({
    page: currentPage,
    limit: 10,
  });

  const createMutation = useCreateBankAccount();
  const updateMutation = useUpdateBankAccount();
  const deleteMutation = useDeleteBankAccount();
  const setDefaultMutation = useSetDefaultBankAccount();

  const accounts = data?.data || [];
  const meta = data?.meta;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
        bankCode: formData.bankCode || undefined,
        isDefault: formData.isDefault,
      });
      setIsModalOpen(false);
      setFormData({
        bankName: "",
        accountNumber: "",
        accountName: "",
        bankCode: "",
        isDefault: false,
      });
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
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#1a5cff]" />
            Bank Accounts
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage your bank accounts for withdrawals
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => {
              setEditingAccount(null);
              setFormData({
                bankName: "",
                accountNumber: "",
                accountName: "",
                bankCode: "",
                isDefault: false,
              });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add Bank Account
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search bank accounts..."
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
          />
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div
          className="bg-white border rounded-xl p-12 text-center"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Wallet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-900">
            No bank accounts
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Add a bank account to start making withdrawals
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map((account: any) => (
            <div
              key={account.id}
              className={cn(
                "bg-white border rounded-xl p-5 transition-all duration-200",
                account.isDefault
                  ? "border-blue-300 shadow-md shadow-blue-50"
                  : "hover:shadow-lg hover:-translate-y-0.5",
              )}
              style={{
                borderColor: account.isDefault
                  ? "#93b4ff"
                  : "var(--color-border)",
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">
                      {account.bankName}
                    </h3>
                    {account.isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                        <Star className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-0.5">
                    {account.accountName}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {!account.isDefault && canEdit && (
                    <button
                      onClick={() => handleSetDefault(account.id)}
                      className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer flex items-center justify-center transition-colors"
                      title="Set as Default"
                    >
                      <StarOff className="w-4 h-4" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(account)}
                      className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-amber-50 text-slate-400 hover:text-amber-600 cursor-pointer flex items-center justify-center transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canEdit && (
                    <button
                      onClick={() =>
                        handleDelete(account.id, account.accountName)
                      }
                      className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-red-50 text-slate-400 hover:text-red-600 cursor-pointer flex items-center justify-center transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Account Number</span>
                  <div className="font-mono font-semibold text-slate-900">
                    {account.accountNumber}
                  </div>
                </div>
                {account.bankCode && (
                  <div>
                    <span className="text-slate-500">Bank Code</span>
                    <div className="font-mono font-semibold text-slate-900">
                      {account.bankCode}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Added: {new Date(account.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
                <Wallet className="w-5 h-5 text-[#1a5cff]" />
                {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
              >
                <span className="sr-only">Close</span>
              </button>
            </div>

            <form onSubmit={editingAccount ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    placeholder="e.g. GTBank"
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 0123456789"
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData({ ...formData, accountName: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Bank Code
                  </label>
                  <input
                    type="text"
                    value={formData.bankCode}
                    onChange={(e) =>
                      setFormData({ ...formData, bankCode: e.target.value })
                    }
                    placeholder="e.g. 058"
                    className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Optional bank code for faster processing
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) =>
                      setFormData({ ...formData, isDefault: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-slate-300 text-[#1a5cff] focus:ring-[#1a5cff]"
                  />
                  <label
                    htmlFor="isDefault"
                    className="text-sm font-medium text-slate-700"
                  >
                    Set as Default Account
                  </label>
                </div>
              </div>

              <div className="flex gap-2.5 mt-6 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none bg-[#1a5cff] hover:bg-[#0f4ad0] disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingAccount ? "Update Account" : "Add Account"}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
