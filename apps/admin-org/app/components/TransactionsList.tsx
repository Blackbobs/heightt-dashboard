"use client";

import { useAdminTransactions } from "@/hooks/admin/useAdminFinance";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";

export function TransactionsList() {
  const { data, isLoading } = useAdminTransactions({ limit: 5 });

  if (isLoading) {
    return (
      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#1a5cff] animate-spin" />
        </div>
      </div>
    );
  }

  const transactions = data?.data || [];

  return (
    <div
      className="bg-white border rounded-xl overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-base font-semibold flex items-center gap-2 text-slate-900">
          <span>Recent Transactions</span>
        </h3>
        <button className="text-sm font-medium border-none bg-transparent cursor-pointer text-[#1a5cff] hover:underline">
          View all
        </button>
      </div>

      {/* Transactions */}
      <div className="px-5 py-2">
        {transactions.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400">
            No transactions found
          </div>
        ) : (
          transactions.map((tx: any, i: number) => {
            const isCredit = tx.type === "CREDIT" || tx.type === "IN";
            const isPending = tx.status === "PENDING";

            return (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-3"
                style={{
                  borderBottom:
                    i < transactions.length - 1
                      ? "1px solid var(--color-border)"
                      : "none",
                }}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm",
                    isCredit
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600",
                  )}
                >
                  {isCredit ? (
                    <ArrowDown className="w-4 h-4" />
                  ) : (
                    <ArrowUp className="w-4 h-4" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate text-slate-900">
                    {tx.description || tx.type}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {tx.reference} •{" "}
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <div
                    className={cn(
                      "text-sm font-semibold",
                      isCredit ? "text-emerald-600" : "text-slate-900",
                    )}
                  >
                    {isCredit ? "+" : "-"}₦{tx.amount.toLocaleString()}
                  </div>
                  {isPending && (
                    <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
