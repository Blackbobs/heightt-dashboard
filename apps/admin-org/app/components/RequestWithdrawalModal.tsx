// apps/admin-org/components/RequestWithdrawalModal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  ArrowUpRight,
  Building2,
  User,
  Hash,
  AlertCircle,
  Wallet,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminBankAccounts } from "@/hooks/admin/useAdminBankAccounts";
import { useAdminWallet } from "@/hooks/admin/useAdminFinance";
import { useAdminContext } from "./AdminContext";

interface RequestWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function RequestWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestWithdrawalModalProps) {
  const { selectedScope } = useAdminContext();
  const [bankAccountId, setBankAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const organizationId = selectedScope?.organizationId || "";

  const { data: bankAccountsData, isLoading: bankAccountsLoading } =
    useAdminBankAccounts({
      limit: 100,
    });

  const { data: wallet, isLoading: walletLoading } =
    useAdminWallet(organizationId);

  const bankAccounts = bankAccountsData?.data || [];
  const balance = wallet?.balance || 0;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setBankAccountId("");
      setAmount("");
      setReason("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountId || !amount || parseFloat(amount) <= 0) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    onSubmit({
      bankAccountId,
      amount: parseFloat(amount),
      reason: reason || undefined,
    });

    setIsSubmitting(false);
    onClose();
  };

  const isLoading = bankAccountsLoading || walletLoading;

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <ArrowUpRight className="w-5 h-5 text-[#1a5cff]" />
            Request Withdrawal
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-[#1a5cff] animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* Balance Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-xs text-blue-800">
                <Wallet className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <div>
                  Available balance:{" "}
                  <strong className="text-blue-900">
                    ₦{balance.toLocaleString()}
                  </strong>
                </div>
              </div>

              {/* Bank Account Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bank Account <span className="text-red-500">*</span>
                </label>
                <select
                  value={bankAccountId}
                  onChange={(e) => setBankAccountId(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
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
                {bankAccounts.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No bank accounts found. Please add a bank account first.
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ₦
                  </span>
                  <input
                    ref={firstInputRef}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                    min="1"
                    max={balance}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Amount in Kobo (e.g., 500000 = ₦5,000)
                </p>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Reason
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Project expenses"
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                />
              </div>

              {/* Info Box */}
              <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-700">
                  <p className="font-semibold">Important</p>
                  <p>
                    Withdrawal requests are subject to review and approval.
                    Processing may take 1-2 business days.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 mt-6 flex-col sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || bankAccounts.length === 0}
                className={cn(
                  "order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none",
                  isSubmitting || bankAccounts.length === 0
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]",
                )}
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4" />
                    Submit Request
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
