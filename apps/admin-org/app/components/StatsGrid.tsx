"use client";

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}

function StatCard({ label, value, change, trend }: StatCardProps) {
  const trendColor =
    trend === "up"
      ? "var(--color-success)"
      : trend === "down"
      ? "var(--color-destructive)"
      : "var(--color-muted-foreground)";

  const trendIcon =
    trend === "up"
      ? "fas fa-arrow-up"
      : trend === "down"
      ? "fas fa-arrow-down"
      : "fas fa-minus";

  return (
    <div
      className="bg-white border rounded-[var(--radius-card)] p-5 md:p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="text-[13px] font-medium mb-1" style={{ color: "var(--color-muted-foreground)" }}>
        {label}
      </div>
      <div className="text-[26px] md:text-[28px] font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
        {value}
      </div>
      <div className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-medium" style={{ color: trendColor }}>
        <i className={trendIcon} />
        {change}
      </div>
    </div>
  );
}

const stats = [
  { label: "Total Students", value: "1,240", change: "12% this month", trend: "up" as const },
  { label: "Total Collected", value: "₦4.5M", change: "8.5% this month", trend: "up" as const },
  { label: "Pending Payments", value: "₦320K", change: "3.2% this month", trend: "down" as const },
  { label: "Active Dues", value: "4", change: "2 new this month", trend: "up" as const },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
