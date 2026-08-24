"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformFinanceOverview,
  usePlatformTransactions,
  usePlatformDues,
  usePlatformReceipts,
} from "@/hooks/platform/usePlatformFinance";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Eye,
  Loader2,
  Building2,
  Users,
  Coins,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  StarOff,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DataTable from "./DataTable";
import type { ColumnDef } from "@tanstack/react-table";

// Import the new components
import BankAccountsView from "./BankAccountsView";
import WithdrawalsView from "./WithdrawalsView";

type FinanceTab = "overview" | "bank-accounts" | "withdrawals";

export default function FinanceView() {
  const [period, setPeriod] = useState("monthly");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FinanceTab>("overview");

  const {
    data: overview,
    isLoading: overviewLoading,
    refetch: refetchOverview,
  } = usePlatformFinanceOverview();
  const { data: transactionsData, isLoading: transactionsLoading } =
    usePlatformTransactions({
      page: currentPage,
      limit: 10,
    });

  const { data: duesData } = usePlatformDues({ limit: 5 });
  const { data: receiptsData } = usePlatformReceipts({ limit: 5 });

  const isLoading = overviewLoading || transactionsLoading;

  // Calculate stats from the actual API response
  const stats = useMemo(() => {
    const overviewAny = overview as any;
    // Calculate total revenue from recent payments
    const totalRevenue =
      overviewAny?.recentPayments?.reduce(
        (sum: number, p: any) => sum + (p.amount || 0),
        0,
      ) || 0;

    // Get dues stats
    const dueStats = overviewAny?.dueStats || { total: 0, paid: 0, pending: 0 };

    // Calculate pending payments amount (from dueStats pending)
    const pendingPayments = dueStats.pending || 0;

    // Calculate total withdrawals (you might need to calculate this from transactions)
    const totalWithdrawals = overviewAny?.totalHeld || 0;

    return [
      {
        label: "Total Balance",
        value: `₦${(overviewAny?.totalBalance || 0).toLocaleString()}`,
        change: `${overviewAny?.totalWallets || 0} wallets`,
        trend: "neutral" as "up" | "down" | "neutral",
        icon: Wallet,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        label: "Total Revenue",
        value: `₦${totalRevenue.toLocaleString()}`,
        change: `${overviewAny?.recentPayments?.length || 0} payments`,
        trend: "up" as "up" | "down" | "neutral",
        icon: DollarSign,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        label: "Total Dues",
        value: dueStats.total.toString(),
        change: `${dueStats.paid} paid · ${dueStats.pending} pending`,
        trend: (dueStats.pending > 0 ? "neutral" : "up") as "up" | "down" | "neutral",
        icon: Coins,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        label: "Daily Transactions",
        value: (overviewAny?.dailyTransactions || 0).toString(),
        change: "Today",
        trend: "neutral" as "up" | "down" | "neutral",
        icon: TrendingUp,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ];
  }, [overview]);

  const transactions = transactionsData?.data || [];
  const meta = transactionsData?.meta;

  // Define columns with useMemo - MUST be called before conditional returns
  const columns = useMemo<ColumnDef<any, any>[]>(
    () => [
      {
        accessorFn: (r) => r.description || r.type,
        id: "desc",
        header: "Description",
      },
      {
        accessorFn: (r) => r.type,
        id: "type",
        header: "Type",
        cell: ({ getValue }) => (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              getValue() === "CREDIT" || getValue() === "IN"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600",
            )}
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) =>
          r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "N/A",
        id: "date",
        header: "Date",
      },
      {
        accessorFn: (r) => {
          const isCredit = r.type === "CREDIT" || r.type === "IN";
          const sign = isCredit ? "+" : "-";
          return `${sign}₦${(r.amount || 0).toLocaleString()}`;
        },
        id: "amount",
        header: "Amount",
        cell: ({ getValue, row }) => (
          <span
            className={
              row.original.type === "CREDIT" || row.original.type === "IN"
                ? "text-emerald-600"
                : "text-red-600"
            }
          >
            {getValue()}
          </span>
        ),
      },
      {
        accessorFn: (r) => r.status || "UNKNOWN",
        id: "status",
        header: "Status",
        cell: ({ getValue }) => (
          <span className={`status-badge ${String(getValue()).toLowerCase()}`}>
            {getValue()}
          </span>
        ),
      },
    ],
    [],
  );

  // Render overview tab content
  const renderOverview = () => {
    const overviewAny = overview as any;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
        </div>
      );
    }

    return (
      <div>
        {/* Stats */}
        <div className="stats-grid">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="stat-label">{stat.label}</span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.iconBg}`}
                  >
                    <Icon className={`w-4 h-4 ${stat.iconColor}`} />
                  </div>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div
                  className={`stat-change ${stat.trend === "up" ? "up" : stat.trend === "down" ? "down" : ""}`}
                >
                  {stat.change}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dues Summary */}
        {overviewAny?.dueStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">Total Dues</div>
                <div className="text-2xl font-bold text-slate-900">
                  {overviewAny.dueStats.total}
                </div>
                <div className="text-xs text-slate-400">All active dues</div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">Paid Dues</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {overviewAny.dueStats.paid}
                </div>
                <div className="text-xs text-slate-400">
                  {overviewAny.dueStats.completionRate}% completion rate
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-body">
                <div className="text-sm text-slate-500">Pending Dues</div>
                <div className="text-2xl font-bold text-amber-600">
                  {overviewAny.dueStats.pending}
                </div>
                <div className="text-xs text-slate-400">Awaiting payment</div>
              </div>
            </div>
          </div>
        )}

        {/* Wallet Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="card">
            <div className="card-body">
              <div className="text-sm text-slate-500">Total Balance</div>
              <div className="text-2xl font-bold text-slate-900">
                ₦{(overviewAny?.totalBalance || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">
                Across {overviewAny?.totalWallets || 0} wallets
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm text-slate-500">Held Balance</div>
              <div className="text-2xl font-bold text-amber-600">
                ₦{(overviewAny?.totalHeld || 0).toLocaleString()}
              </div>
              <div className="text-xs text-slate-400">Pending settlements</div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <div className="text-sm text-slate-500">Daily Transactions</div>
              <div className="text-2xl font-bold text-blue-600">
                {overviewAny?.dailyTransactions || 0}
              </div>
              <div className="text-xs text-slate-400">Today</div>
            </div>
          </div>
        </div>

        {/* Recent Payments */}
        {overviewAny?.recentPayments && overviewAny.recentPayments.length > 0 && (
          <div className="card mb-6">
            <div className="card-header">
              <h3>Recent Payments</h3>
              <button className="action">View all →</button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Amount</th>
                      <th>Payer</th>
                      <th>Organization</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overviewAny.recentPayments.map(
                      (payment: any, index: number) => (
                        <tr key={payment.id || index}>
                          <td className="font-bold">
                            {payment.amountFormatted ||
                              `₦${(payment.amount || 0).toLocaleString()}`}
                          </td>
                          <td>{payment.payer || "Unknown"}</td>
                          <td>{payment.organization || "Unknown"}</td>
                          <td>
                            {payment.createdAt
                              ? new Date(payment.createdAt).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td>
                            <span
                              className={`status-badge ${(payment.status || "COMPLETED").toLowerCase()}`}
                            >
                              {payment.status || "COMPLETED"}
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="card">
          <div className="card-header">
            <h3>Recent Transactions</h3>
            <button className="action">View all →</button>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  No transactions found
                </div>
              ) : (
                <DataTable columns={columns} data={transactions} />
              )}
            </div>
          </div>
        </div>

        {/* Pagination */}
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
      </div>
    );
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#1a5cff]" />
            Finance
          </h1>
          <p>Manage platform finances, bank accounts, and withdrawals</p>
        </div>
        <div className="actions">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm bg-white border-slate-200"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
          <button
            className="btn btn-secondary"
            onClick={() => refetchOverview()}
          >
            <Download className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Finance Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        {[
          { id: "overview", label: "Overview" },
          { id: "bank-accounts", label: "Bank Accounts" },
          { id: "withdrawals", label: "Withdrawals" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as FinanceTab)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "bank-accounts" && <BankAccountsView />}
      {activeTab === "withdrawals" && <WithdrawalsView />}
    </div>
  );
}
