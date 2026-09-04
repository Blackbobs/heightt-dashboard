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
import { cn, formatKoboCurrency } from "@/lib/utils";
import { useAdminBankAccounts } from "@/hooks/admin/useAdminBankAccounts";
import { useOrganizationWithdrawalQuote } from "@/hooks/admin/useAdminWithdrawals";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminContext } from "./AdminContext";
import { getApiErrorMessage } from "@/lib/api/error";

interface RequestWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
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
  const [balanceError, setBalanceError] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  const organizationId = selectedScope?.organizationId || "";

  const { data: bankAccountsData, isLoading: bankAccountsLoading } =
    useAdminBankAccounts({
      limit: 100,
    });

  const normalizedAmount = amount.replace(/,/g, "").trim();
  const numericAmount = Number(normalizedAmount);
  const amountInKobo =
    normalizedAmount && Number.isFinite(numericAmount)
      ? Math.round(numericAmount * 100)
      : undefined;
  const debouncedAmountInKobo = useDebouncedValue(amountInKobo, 350);
  const quoteQuery = useOrganizationWithdrawalQuote(
    organizationId,
    debouncedAmountInKobo && debouncedAmountInKobo > 0
      ? debouncedAmountInKobo
      : undefined,
  );
  const quote = quoteQuery.data;
  const quoteMatchesAmount =
    amountInKobo === undefined || quote?.requestedAmount === amountInKobo;

  const bankAccounts = bankAccountsData?.data || [];
  const usableBankAccounts = bankAccounts.filter((account: any) => {
    const status =
      account.payoutDestinationStatus ?? account.payoutDestination?.status;
    const usable =
      account.payoutDestinationUsable ?? account.payoutDestination?.usable;
    return status === "approved" && usable !== false;
  });

  useEffect(() => {
    let focusTimeout: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      focusTimeout = setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setBankAccountId("");
      setAmount("");
      setReason("");
      setBalanceError("");
    }
    return () => {
      if (focusTimeout) clearTimeout(focusTimeout);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankAccountId || !amountInKobo || amountInKobo < 100) return;

    const requestedAmount = amountInKobo;
    if (!Number.isSafeInteger(requestedAmount) || requestedAmount <= 0) return;
    if (!quote || !quoteMatchesAmount || !quote.canWithdraw) {
      setBalanceError("Please wait for the withdrawal amount to be validated.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        bankAccountId,
        amount: requestedAmount,
        reason: reason || undefined,
      });
      onClose();
    } catch (error) {
      const response = (
        error as {
          response?: { data?: { code?: string; maxWithdrawable?: number } };
        }
      ).response?.data;
      if (response?.code === "INSUFFICIENT_AVAILABLE_BALANCE") {
        await quoteQuery.refetch();
        setBalanceError(
          `Your available balance changed. The maximum you can now withdraw is ${formatKoboCurrency(response.maxWithdrawable || 0)}.`,
        );
      } else {
        setBalanceError(
          getApiErrorMessage(
            error,
            "The withdrawal request could not be submitted.",
          ),
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = bankAccountsLoading;

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
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
                    {formatKoboCurrency(quote?.availableBalance || 0)}
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
                  {usableBankAccounts.map((account: any) => (
                    <option key={account.id} value={account.id}>
                      {account.bankName} - {account.accountNumber} (
                      {account.accountName})
                      {account.isDefault ? " (Default)" : ""}
                    </option>
                  ))}
                </select>
                {usableBankAccounts.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    No approved payout destination is available. Register a bank
                    account and wait for Bachs approval first.
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
                    placeholder="5000.00"
                    className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                    min="1"
                    step="0.01"
                    max={(quote?.maxWithdrawable || 0) / 100}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Enter the amount in naira. It will be sent securely in kobo.
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <div className="flex justify-between py-1">
                  <span>Available balance</span>
                  <strong>
                    {formatKoboCurrency(quote?.availableBalance || 0)}
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Withdrawal amount</span>
                  <strong>
                    {formatKoboCurrency(quote?.requestedAmount || 0)}
                  </strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Heightt fee</span>
                  <strong>{formatKoboCurrency(quote?.platformFee || 0)}</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span>Bachs payout fee</span>
                  <strong>{formatKoboCurrency(quote?.providerFee || 0)}</strong>
                </div>
                <div className="mt-1 flex justify-between border-t border-slate-200 pt-2">
                  <span>Total debit</span>
                  <strong>{formatKoboCurrency(quote?.totalDebit || 0)}</strong>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  The bank account receives the withdrawal amount. Heightt
                  charges ₦0; the Bachs fee is debited separately.
                </p>
              </div>
              {balanceError && (
                <p role="alert" className="text-xs font-medium text-red-600">
                  {balanceError}
                </p>
              )}

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
                disabled={isSubmitting}
                className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  usableBankAccounts.length === 0 ||
                  !quote?.canWithdraw ||
                  quoteQuery.isFetching ||
                  !quoteMatchesAmount
                }
                className={cn(
                  "order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none",
                  isSubmitting ||
                    usableBankAccounts.length === 0 ||
                    !quote?.canWithdraw ||
                    quoteQuery.isFetching ||
                    !quoteMatchesAmount
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
