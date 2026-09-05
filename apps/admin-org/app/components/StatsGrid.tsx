// apps/admin-org/components/StatsGrid.tsx
"use client";

import { useAdminContext } from "./AdminContext";
import { useOrganizationFinanceOverview } from "@/hooks/admin/useAdminFinance";
import { useAdminStudents } from "@/hooks/admin/useAdminStudents";
import { formatKoboCurrency } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: boolean;
}

function StatCard({
  label,
  value,
  subtitle,
  accent,
}: StatCardProps) {
  return (
    <div
      className="relative bg-white p-5 transition-shadow duration-200"
    >
      {accent && (
        <span className="absolute top-0 left-6 right-6 h-[3px] bg-gradient-to-r from-blue-500 to-blue-600 rounded-b-full" />
      )}
      <div className="mb-2">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
        {value}
      </div>
      {subtitle && (
        <div className="text-xs text-slate-400 mt-1">{subtitle}</div>
      )}
    </div>
  );
}

export function StatsGrid() {
  const { selectedScope } = useAdminContext();
  const organizationId = selectedScope?.organizationId || "";

  // Fetch all data in parallel
  const { data: studentsData, isLoading: studentsLoading } = useAdminStudents({
    organizationId,
    limit: 1,
  });

  const { data: overview, isLoading: overviewLoading } =
    useOrganizationFinanceOverview(organizationId);

  const isLoading = studentsLoading || overviewLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border rounded-lg p-5 animate-pulse"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-16 h-3 bg-slate-200 rounded" />
            </div>
            <div className="w-20 h-7 bg-slate-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalStudents = studentsData?.meta?.total || 0;

  const stats = [
    {
      label: "Total Students",
      value: totalStudents,
      subtitle: "Active student records",
    },
    {
      label: "Available Balance",
      value: formatKoboCurrency(overview?.wallet.availableBalance),
      subtitle: "Ready for withdrawal",
      accent: true,
    },
    {
      label: "Total Collections",
      value: formatKoboCurrency(overview?.collections.totalAmount),
      subtitle: "Collected for this organization",
    },
    {
      label: "Dues Created",
      value: overview?.dues.createdCount || 0,
      subtitle: "Across this organization",
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden mb-6"
      style={{ borderColor: "var(--color-border)" }}
    >
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
