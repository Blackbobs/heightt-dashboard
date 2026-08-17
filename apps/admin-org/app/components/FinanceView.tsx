"use client";

import { useState } from "react";
import {
  useAdminFinancialOverview,
  useAdminFinanceDashboard,
  useRequestWithdrawal,
} from "@/hooks/admin/useAdminFinance";
import { useUserOrganizations } from "@/hooks/admin/useAdminOrganizations";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Loader2,
  AlertCircle,
  Eye,
  Calendar,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import RequestWithdrawalModal from "./RequestWithdrawalModal";
import { usePermissions } from "../context/PermissionContext";

export function FinanceView() {
  const { hasPermission } = usePermissions();
  const { data: orgs } = useUserOrganizations();
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  const canExport = hasPermission("FINANCE_EXPORT");
  const canRequestWithdrawal = hasPermission("WITHDRAWAL_REQUEST");

  const organizationId = orgs?.[0]?.organizationId;
  const organizationName = orgs?.[0]?.organization?.name || "Organization";

  const { data: overview, isLoading: overviewLoading } =
    useAdminFinancialOverview(organizationId || "");
  const { data: dashboard, isLoading: dashboardLoading } =
    useAdminFinanceDashboard(organizationId || "");
  const withdrawalMutation = useRequestWithdrawal();

  const isLoading = overviewLoading || dashboardLoading;

  const handleExportReport = () => {
    alert("📄 Exporting financial report (CSV/PDF)...");
  };

  const handleWithdrawal = async (data: any) => {
    try {
      await withdrawalMutation.mutateAsync({
        ...data,
        organizationId,
      });
      alert("✅ Withdrawal request submitted successfully!");
      setIsWithdrawalModalOpen(false);
    } catch (error) {
      console.error("Failed to submit withdrawal:", error);
      alert("❌ Failed to submit withdrawal request.");
    }
  };

  if (isLoading) {
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
      label: "Total Collections",
      value: `₦${(overview?.totalCollections || 0).toLocaleString()}`,
      change: "+8.5%",
      trend: "up",
      icon: TrendingUp,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Transactions",
      value: (overview?.totalTransactions || 0).toLocaleString(),
      change: "+12%",
      trend: "up",
      icon: CreditCard,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      label: "Outstanding Payments",
      value: `₦${(overview?.totalOutstanding || 0).toLocaleString()}`,
      change: "-3.2%",
      trend: "down",
      icon: AlertCircle,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      label: "Total Withdrawals",
      value: `₦${(overview?.totalWithdrawals || 0).toLocaleString()}`,
      change: "+5%",
      trend: "up",
      icon: ArrowUpRight,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Finance
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Financial overview for {organizationName}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canExport && (
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border-2 cursor-pointer transition-all duration-200 bg-white border-slate-200 text-[#1a5cff] hover:border-[#1a5cff] hover:bg-[#f0f4ff]"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          )}
          {canRequestWithdrawal && (
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]"
            >
              <ArrowUpRight className="w-4 h-4" />
              Request Withdrawal
            </button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
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
              <div
                className={cn(
                  "text-xs font-medium mt-1 flex items-center gap-1",
                  stat.trend === "up" ? "text-emerald-600" : "text-red-600",
                )}
              >
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {stat.change} this month
              </div>
            </div>
          );
        })}
      </div>

      {/* Organization Info Card */}
      <div
        className="bg-white border rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4"
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
            Total Students:{" "}
            <strong className="text-slate-900">
              {dashboard?.statistics?.total || 0}
            </strong>
          </span>
          <span className="w-px h-4 bg-slate-200" />
          <span>
            Active:{" "}
            <strong className="text-slate-900">
              {dashboard?.statistics?.active || 0}
            </strong>
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Wallet Balance
              </div>
              <div className="text-lg font-bold text-emerald-600">
                ₦{(overview?.totalCollections || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Pending Dues
              </div>
              <div className="text-lg font-bold text-amber-600">
                ₦{(overview?.totalOutstanding || 0).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div
          className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg cursor-pointer"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                Total Dues
              </div>
              <div className="text-lg font-bold text-purple-600">
                {overview?.totalDues || 0}
              </div>
            </div>
          </div>
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
