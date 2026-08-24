// apps/admin-org/components/StatsGrid.tsx
"use client";

import { useAdminContext } from "./AdminContext";
import {
  useAdminFinancialOverview,
  useAdminWallet,
  useAdminDues,
} from "@/hooks/admin/useAdminFinance";
import { useAdminStudents } from "@/hooks/admin/useAdminStudents";
import {
  Loader2,
  Users,
  Wallet,
  Clock,
  Coins,
  AlertCircle,
  CheckCircle,
  UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  subtitle?: string;
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
  iconColor,
  subtitle,
}: StatCardProps) {
  return (
    <div
      className="bg-white border rounded-xl p-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center",
            iconBg,
          )}
        >
          <div className={cn("w-4 h-4", iconColor)}>{icon}</div>
        </div>
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
      )}
    </div>
  );
}

export function StatsGrid() {
  const { selectedScope, hasPermission } = useAdminContext();
  const organizationId = selectedScope?.organizationId || "";

  // Fetch all data in parallel
  const { data: studentsData, isLoading: studentsLoading } = useAdminStudents({
    organizationId,
    limit: 1,
  });

  const { data: overview, isLoading: overviewLoading } =
    useAdminFinancialOverview(organizationId);
  const { data: wallet, isLoading: walletLoading } =
    useAdminWallet(organizationId);
  const { data: duesData, isLoading: duesLoading } = useAdminDues({
    organizationId,
    limit: 100,
  });

  const isLoading =
    studentsLoading || overviewLoading || walletLoading || duesLoading;

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
              <div className="w-16 h-3 bg-slate-200 rounded" />
              <div className="w-9 h-9 rounded-lg bg-slate-200" />
            </div>
            <div className="w-20 h-7 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalStudents = studentsData?.meta?.total || 0;
  const activeStudents =
    studentsData?.data?.filter((s: any) => s.academicStatus === "ACTIVE")
      .length || 0;
  const totalDues = duesData?.data?.length || 0;
  const activeDues =
    duesData?.data?.filter((d: any) => d.status === "ACTIVE").length || 0;
  const walletBalance = wallet?.balance || 0;
  const totalCollections = overview?.totalCollections || 0;
  const pendingPayments = overview?.pendingDues || 0;

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      icon: <Users className="w-4 h-4" />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      subtitle: `${activeStudents} active`,
    },
    {
      label: "Wallet Balance",
      value: `₦${walletBalance.toLocaleString()}`,
      icon: <Wallet className="w-4 h-4" />,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Total Collections",
      value: `₦${totalCollections.toLocaleString()}`,
      icon: <Coins className="w-4 h-4" />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      label: "Pending Payments",
      value: pendingPayments,
      icon: <Clock className="w-4 h-4" />,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      subtitle: `${totalDues} total dues`,
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
