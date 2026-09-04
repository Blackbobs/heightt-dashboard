// apps/admin-org/app/components/FinanceView.tsx
"use client";

import { useState } from "react";
import {
  useRequestWithdrawal,
  useAdminTransactions,
  useOrganizationFinanceOverview,
} from "@/hooks/admin/useAdminFinance";
import { useAdminContext } from "./AdminContext";
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Building2,
} from "lucide-react";
import { cn, formatKoboCurrency } from "@/lib/utils";
import RequestWithdrawalModal from "./RequestWithdrawalModal";
import { usePermissions } from "../context/PermissionContext";
import { PageHeader } from "./OperationsUI";

export function FinanceView() {
  const { hasPermission } = usePermissions();
  const { selectedScope } = useAdminContext();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const canRequestWithdrawal = hasPermission("WITHDRAWAL_REQUEST");

  const organizationId = selectedScope?.organizationId || "";
  const organizationName = selectedScope?.organization?.name || "Organization";

  const { data: overview, isLoading: overviewLoading } =
    useOrganizationFinanceOverview(organizationId);
  const { data: transactions, isLoading: transactionsLoading } =
    useAdminTransactions({
      organizationId,
      limit: 10,
    });
  const withdrawalMutation = useRequestWithdrawal();

  const isLoading = overviewLoading || transactionsLoading;

  const handleWithdrawal = async (data: any) => {
    try {
      await withdrawalMutation.mutateAsync({
        ...data,
        organizationId,
      });
      setIsWithdrawalModalOpen(false);
    } catch (error) {
      console.error("Failed to submit withdrawal:", error);
      const code = (error as { response?: { data?: { code?: string } } }).response?.data?.code;
      if (code === "INSUFFICIENT_AVAILABLE_BALANCE") throw error;
      throw error;
    }
  };

  if (isLoading && !overview && !transactions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading finance data...
          </span>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Available Balance",
      value: formatKoboCurrency(overview?.wallet.availableBalance),
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Collections",
      value: formatKoboCurrency(overview?.collections.totalAmount),
      icon: CreditCard,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Transactions",
      value: (overview?.transactions.total || 0).toLocaleString(),
      icon: ArrowUpRight,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Expected Dues",
      value: formatKoboCurrency(overview?.dues.totalExpected),
      icon: AlertCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const recentTransactions = transactions?.data || [];

  return (
    <div className="operations-page">
      <PageHeader eyebrow="Finance" title="Financial overview" description={<>Balances, collections, and recent transactions for {organizationName}.</>} actions={canRequestWithdrawal ? (
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Withdrawal
            </button>
          ) : undefined} />

      {/* Stats Grid */}
      <div className="operations-stats grid grid-cols-2 sm:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </span>
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center",
                    stat.iconBg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", stat.iconColor)} />
                </div>
              </div>
              <div className="text-2xl font-bold text-slate-900">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Organization Info Card */}
      <div
        className="operations-surface p-5 mb-5 flex items-center justify-between flex-wrap gap-4"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-[#1a5cff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{organizationName}</h3>
            <p className="text-xs text-slate-500">Financial Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span>
            Assigned dues:{" "}
            <strong className="text-slate-900">
              {overview?.dues.assignedCount || 0}
            </strong>
          </span>
          <span className="w-px h-4 bg-slate-200" />
          <span>
            Pending assignments:{" "}
            <strong className="text-slate-900">
              {overview?.dues.pendingAssignments || 0}
            </strong>
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div
        className="operations-surface"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h3 className="text-base font-semibold flex items-center gap-2 text-slate-900">
            <CreditCard className="w-4 h-4 text-slate-400" />
            Recent Transactions
          </h3>
          <button className="text-sm font-medium border-none bg-transparent cursor-pointer text-[#1a5cff] hover:underline">
            View all
          </button>
        </div>

        <div className="px-5 py-2">
          {recentTransactions.length === 0 ? (
            <div className="py-6 text-center text-sm text-slate-400">
              No transactions found
            </div>
          ) : (
            recentTransactions.map((tx: any, i: number) => {
              const isCredit = tx.type === "CREDIT" || tx.type === "IN";
              const isPending = tx.status === "PENDING";

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 py-3"
                  style={{
                    borderBottom:
                      i < recentTransactions.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                  }}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm",
                      isCredit
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600",
                    )}
                  >
                    {isCredit ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate text-slate-900">
                      {tx.description || tx.type}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {tx.reference} •{" "}
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div
                      className={cn(
                        "text-sm font-semibold",
                        isCredit ? "text-emerald-600" : "text-slate-900",
                      )}
                    >
                      {isCredit ? "+" : "-"}
                      {formatKoboCurrency(tx.amount)}
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

      {/* Request Withdrawal Modal */}
      <RequestWithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleWithdrawal}
      />
    </div>
  );
}
