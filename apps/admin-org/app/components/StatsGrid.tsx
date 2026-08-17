"use client";

import { useAdminDashboard } from "@/hooks/admin/useAdminStudents";
import { useAdminFinancialOverview } from "@/hooks/admin/useAdminFinance";
import { useUserOrganizations } from "@/hooks/admin/useAdminOrganizations";
import { Loader2, Users, Coins, Wallet, Clock } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconBg: string;
}

function StatCard({
  label,
  value,
  change,
  trend,
  icon,
  iconBg,
}: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "text-emerald-600"
      : trend === "down"
        ? "text-red-600"
        : "text-slate-400";

  const trendIcon = trend === "up" ? "↑" : trend === "down" ? "↓" : "—";

  return (
    <div
      className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          {icon}
        </div>
        <span className={cn("text-xs font-medium", trendColor)}>
          {trendIcon} {change}
        </span>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

export function StatsGrid() {
  const { data: orgs, isLoading: orgsLoading } = useUserOrganizations();
  const organizationId = orgs?.[0]?.organizationId;

  const { data: overview, isLoading: overviewLoading } =
    useAdminFinancialOverview(organizationId || "");
  const { data: dashboard, isLoading: dashboardLoading } = useAdminDashboard();

  const isLoading = orgsLoading || overviewLoading || dashboardLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border rounded-xl p-5 animate-pulse"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-lg bg-slate-200" />
              <div className="w-12 h-4 bg-slate-200 rounded" />
            </div>
            <div className="w-20 h-7 bg-slate-200 rounded" />
            <div className="w-16 h-4 bg-slate-200 rounded mt-0.5" />
          </div>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Students",
      value: dashboard?.statistics?.total?.toLocaleString() || "0",
      change: "12% this month",
      trend: "up" as const,
      icon: <Users className="w-4 h-4 text-blue-600" />,
      iconBg: "bg-blue-50",
    },
    {
      label: "Total Collections",
      value: `₦${(overview?.totalCollections || 0).toLocaleString()}`,
      change: "8.5% this month",
      trend: "up" as const,
      icon: <Wallet className="w-4 h-4 text-emerald-600" />,
      iconBg: "bg-emerald-50",
    },
    {
      label: "Pending Payments",
      value: `₦${(overview?.totalOutstanding || 0).toLocaleString()}`,
      change: "3.2% this month",
      trend: "down" as const,
      icon: <Clock className="w-4 h-4 text-amber-600" />,
      iconBg: "bg-amber-50",
    },
    {
      label: "Active Dues",
      value: overview?.totalDues?.toString() || "0",
      change: "2 new this month",
      trend: "up" as const,
      icon: <Coins className="w-4 h-4 text-purple-600" />,
      iconBg: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
