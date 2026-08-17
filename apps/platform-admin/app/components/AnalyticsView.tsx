"use client";

import React, { useState, useMemo } from "react";
import {
  usePlatformDashboardAnalytics,
  usePlatformRevenueAnalytics,
  usePlatformGrowthAnalytics,
} from "@/hooks/platform/usePlatformAnalytics";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Loader2,
  Building2,
  CreditCard,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AnalyticsView() {
  const [period, setPeriod] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: dashboard,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = usePlatformDashboardAnalytics({
    period,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });

  const { data: revenue, isLoading: revenueLoading } =
    usePlatformRevenueAnalytics({
      period,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

  const { data: growth, isLoading: growthLoading } = usePlatformGrowthAnalytics(
    {
      period,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    },
  );

  const isLoading = dashboardLoading || revenueLoading || growthLoading;

  // Extract data from API responses
  const summary = dashboard?.summary || {};
  const revenueData = dashboard?.revenue || {};
  const studentData = dashboard?.students || {};
  const orgData = dashboard?.organizations || {};
  const recentActivities = dashboard?.recentActivities || [];

  // Stats from the API
  const stats = useMemo(() => {
    return [
      {
        label: "Total Revenue",
        value: revenueData.totalRevenueFormatted || "₦0.00",
        change: `${revenueData.revenueGrowth || 0}% growth`,
        trend: (revenueData.revenueGrowth || 0) >= 0 ? "up" : ("down" as const),
        icon: DollarSign,
        iconBg: "bg-emerald-50",
        iconColor: "text-emerald-600",
      },
      {
        label: "Total Users",
        value: (summary.totalUsers || 0).toLocaleString(),
        change: `${summary.totalStudents || 0} students`,
        trend: "neutral" as const,
        icon: Users,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-600",
      },
      {
        label: "Total Transactions",
        value: (revenueData.totalTransactions || 0).toLocaleString(),
        change: `Avg: ${revenueData.averageTransactionValueFormatted || "₦0"}`,
        trend: "neutral" as const,
        icon: Activity,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-600",
      },
      {
        label: "Organizations",
        value: (orgData.totalOrganizations || 0).toLocaleString(),
        change: `${orgData.activeOrganizations || 0} active`,
        trend: "up" as const,
        icon: Building2,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-600",
      },
    ];
  }, [summary, revenueData, orgData]);

  // Revenue trend data
  const revenueTrendData = revenueData.revenueTrend || [];
  const revenueChartData =
    revenueTrendData.length > 0
      ? revenueTrendData
      : (revenue?.revenueGrowth || []).map((item: any) => ({
          period: item.month || item.period,
          amount: item.total || 0,
        })) || [];

  // Growth data (student and organization growth)
  const studentGrowthData = growth?.studentGrowth || [];
  const orgGrowthData = growth?.organizationGrowth || [];

  const maxRevenue = Math.max(
    ...revenueChartData.map((d: any) => d.amount || 0),
    1,
  );
  const maxGrowth = Math.max(
    ...studentGrowthData.map((d: any) => d.total || 0),
    ...orgGrowthData.map((d: any) => d.total || 0),
    1,
  );

  // Get period labels from growth data or use default
  const growthLabels = studentGrowthData.map(
    (d: any) => d.month || d.period || "",
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#1a5cff]" />
            Analytics Dashboard
          </h1>
          <p>
            Route: <code>/platform/analytics</code> • Platform-wide performance
            metrics and insights
          </p>
        </div>
        <div className="actions">
          <select
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              refetchDashboard();
            }}
            className="px-3 py-2 border rounded-lg text-sm bg-white border-slate-200"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            className="px-3 py-2 border rounded-lg text-sm bg-white border-slate-200"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <input
            type="date"
            className="px-3 py-2 border rounded-lg text-sm bg-white border-slate-200"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={() => refetchDashboard()}
          >
            <Download className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Total Revenue</div>
            <div className="text-2xl font-bold text-slate-900">
              {revenueData.totalRevenueFormatted || "₦0.00"}
            </div>
            <div className="text-xs text-slate-400">
              {revenueData.totalTransactions || 0} transactions
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Total Users</div>
            <div className="text-2xl font-bold text-slate-900">
              {summary.totalUsers || 0}
            </div>
            <div className="text-xs text-slate-400">
              {summary.totalStudents || 0} students
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Organizations</div>
            <div className="text-2xl font-bold text-slate-900">
              {orgData.totalOrganizations || 0}
            </div>
            <div className="text-xs text-slate-400">
              {orgData.activeOrganizations || 0} active
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="text-sm text-slate-500">Avg Transaction</div>
            <div className="text-2xl font-bold text-slate-900">
              {revenueData.averageTransactionValueFormatted || "₦0.00"}
            </div>
            <div className="text-xs text-slate-400">
              {revenueData.revenueGrowth || 0}% growth
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="card">
          <div className="card-header">
            <h3>Revenue Trend</h3>
            <span className="text-xs text-slate-500">
              {revenueChartData.length} periods
            </span>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-end justify-between gap-2">
              {revenueChartData.length === 0 ? (
                <div className="w-full text-center text-slate-400">
                  No revenue data available
                </div>
              ) : (
                revenueChartData.map((item: any, index: number) => {
                  const height = ((item.amount || 0) / maxRevenue) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-2"
                    >
                      <div
                        className="w-full max-w-[40px] bg-gradient-to-t from-[#1a5cff] to-[#60a5fa] rounded-t transition-all duration-500 hover:opacity-80"
                        style={{ height: `${Math.max(height, 2)}%` }}
                      />
                      <span className="text-xs text-slate-500">
                        {item.period || item.month || index + 1}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400">
              <span>₦0</span>
              <span>₦{maxRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Growth Chart (Student & Organization) */}
        <div className="card">
          <div className="card-header">
            <h3>Growth Overview</h3>
            <span className="text-xs text-slate-500">
              Students & Organizations
            </span>
          </div>
          <div className="card-body">
            <div className="h-64 flex items-end justify-between gap-2">
              {studentGrowthData.length === 0 && orgGrowthData.length === 0 ? (
                <div className="w-full text-center text-slate-400">
                  No growth data available
                </div>
              ) : (
                // Show both student and organization growth side by side
                studentGrowthData.map((item: any, index: number) => {
                  const studentHeight = ((item.total || 0) / maxGrowth) * 100;
                  const orgItem = orgGrowthData[index] || { total: 0 };
                  const orgHeight = ((orgItem.total || 0) / maxGrowth) * 100;
                  const label = item.month || item.period || index + 1;

                  return (
                    <div
                      key={index}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div className="flex gap-1 w-full max-w-[40px]">
                        <div
                          className="flex-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t transition-all duration-500 hover:opacity-80"
                          style={{ height: `${Math.max(studentHeight, 2)}%` }}
                          title={`Students: ${item.total || 0}`}
                        />
                        <div
                          className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t transition-all duration-500 hover:opacity-80"
                          style={{ height: `${Math.max(orgHeight, 2)}%` }}
                          title={`Organizations: ${orgItem.total || 0}`}
                        />
                      </div>
                      <span className="text-xs text-slate-500">{label}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex justify-between mt-4 text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-blue-500" />
                  Students
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500" />
                  Organizations
                </span>
              </div>
              <span>Max: {maxGrowth}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Type Breakdown */}
      {orgData.organizationsByType &&
        orgData.organizationsByType.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="card">
              <div className="card-header">
                <h3>Organizations by Type</h3>
              </div>
              <div className="card-body">
                <div className="space-y-3">
                  {orgData.organizationsByType.map(
                    (item: any, index: number) => {
                      const total = orgData.totalOrganizations || 1;
                      const percentage = Math.round((item.count / total) * 100);
                      return (
                        <div key={index}>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-700">{item.type}</span>
                            <span className="font-semibold text-slate-900">
                              {item.count} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-blue-300 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3>Recent Activities</h3>
                <span className="text-xs text-slate-500">
                  {recentActivities.length} events
                </span>
              </div>
              <div className="card-body">
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentActivities.length === 0 ? (
                    <div className="text-center text-slate-400 text-sm py-4">
                      No recent activities
                    </div>
                  ) : (
                    recentActivities.slice(0, 10).map((activity: any) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between text-xs border-b border-slate-100 pb-2 last:border-0"
                      >
                        <div>
                          <span className="font-semibold text-slate-700">
                            {activity.type?.replace(/_/g, " ")}
                          </span>
                          <span className="text-slate-400 ml-2">
                            by {activity.userName || "System"}
                          </span>
                        </div>
                        <span className="text-slate-400">
                          {activity.createdAt
                            ? new Date(activity.createdAt).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
