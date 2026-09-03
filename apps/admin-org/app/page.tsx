// apps/admin-org/app/page.tsx
"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useAdminContext } from "./components/AdminContext";
import { useAdminUser } from "@/hooks/admin/useAdminAuth";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { StatsGrid } from "./components/StatsGrid";
import { TransactionsList } from "./components/TransactionsList";
import { AnnouncementsList } from "./components/AnnouncementsList";
import { DuesView } from "./components/DuesView";
import { StudentsView } from "./components/StudentsView";
import { AnnouncementsView } from "./components/AnnouncementsView";
import { FinanceView } from "./components/FinanceView";
import { SettingsView } from "./components/SettingsView";
import { PaymentsView } from "./components/PaymentsView";
import { BottomNav } from "./components/BottomNav";
import { WithdrawalsView } from "./components/WithdrawalsView";
import { BankAccountsView } from "./components/BankAccountsView";
import { InstitutionPromotionView } from "./components/InstitutionPromotionView";

const pageTitles: Record<string, string> = {
  Dashboard: "Dashboard",
  Dues: "Dues",
  Payments: "Payments",
  Students: "Students",
  Announcements: "Announcements",
  Finance: "Finance",
  Settings: "Settings",
  Withdrawals: "Withdrawals",
  "Bank Accounts": "Bank Accounts",
  Promotion: "Institution Promotion",
};

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: userData, isLoading: userLoading } = useAdminUser();
  const {
    user,
    selectedScope,
    isLoading: contextLoading,
    isFacultyAdmin,
    isInstitutionAdmin,
    isDepartmentAdmin,
    isOrganizationAdmin,
    isPlatformAdmin,
    hasPermission,
  } = useAdminContext();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const routeToNav: Record<string, string> = {
    dues: "Dues", payments: "Payments", students: "Students",
    announcements: "Announcements", finance: "Finance", settings: "Settings",
    withdrawals: "Withdrawals", "bank-accounts": "Bank Accounts", promotion: "Promotion",
  };
  const routeSegment = pathname.split("/").filter(Boolean)[0] || "dashboard";
  const activeNav = routeToNav[routeSegment] || "Dashboard";

  const isLoading = userLoading || contextLoading;

  const pageTitle = pageTitles[activeNav] || activeNav;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8faff]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  const resolvedUser = (userData || user || {}) as any;
  const adminTypes = resolvedUser?.adminTypes || [];
  const resolvedIsPlatformAdmin =
    resolvedUser?.isPlatformAdmin === true || isPlatformAdmin;
  const hasAdminAccess = adminTypes.length > 0 || resolvedIsPlatformAdmin;

  if (!hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8faff] p-4">
        <div
          className="bg-white border rounded-xl p-8 max-w-md text-center shadow-lg"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            No Admin Access
          </h2>
          <p className="text-sm text-slate-500">
            You don't have admin access to any organizations. Please contact
            your administrator.
          </p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-4 px-4 py-2 bg-[#1a5cff] text-white rounded-lg text-sm font-semibold hover:bg-[#0f4ad0] transition-colors border-none cursor-pointer"
          >
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch (activeNav) {
      case "Dashboard":
        return (
          <>
            <div className="mb-6"><p className="text-xs font-semibold text-blue-600 uppercase tracking-[.12em] mb-2">Organization overview</p><h1 className="text-[28px] leading-9 font-bold tracking-tight text-slate-950">Welcome back, {resolvedUser?.profile?.firstName || "Admin"}</h1><p className="text-sm text-slate-500 mt-1">Here’s the latest activity for your organization.</p></div>
            <StatsGrid />
            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
              <TransactionsList />
              <AnnouncementsList />
            </div>
          </>
        );
      case "Dues":
        return <DuesView />;
      case "Payments":
        return <PaymentsView />;
      case "Students":
        return <StudentsView />;
      case "Promotion": {
        const institutionScope = selectedScope?.adminType === "INSTITUTION_ADMIN" && selectedScope.institutionId
          ? selectedScope
          : resolvedUser?.adminScopes?.find(
          (scope: { adminType: string; institutionId?: string; status?: string }) => scope.adminType === "INSTITUTION_ADMIN" && scope.institutionId && (!scope.status || scope.status === "ACTIVE"),
        );
        return institutionScope?.institutionId ? <InstitutionPromotionView institutionId={institutionScope.institutionId} /> : <p className="text-sm text-slate-500">No institution admin scope is available.</p>;
      }
      case "Announcements":
        return <AnnouncementsView />;
      case "Finance":
        return <FinanceView />;
      case "Withdrawals":
        return <WithdrawalsView />;
      case "Bank Accounts":
        return <BankAccountsView />;
      case "Settings":
        return <SettingsView />;
      default:
        return <StatsGrid />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar
        activeNav={activeNav}
        onNavChange={(nav) => {
          const routes: Record<string, string> = {
            Dashboard: "/", Dues: "/dues", Payments: "/payments", Students: "/students",
            Announcements: "/announcements", Finance: "/finance", Settings: "/settings",
            Withdrawals: "/withdrawals", "Bank Accounts": "/bank-accounts", Promotion: "/promotion",
          };
          router.push(routes[nav] || "/");
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isFacultyAdmin={isFacultyAdmin}
        isInstitutionAdmin={isInstitutionAdmin}
        isDepartmentAdmin={isDepartmentAdmin}
        isOrganizationAdmin={isOrganizationAdmin}
        isPlatformAdmin={isPlatformAdmin}
        hasPermission={hasPermission}
      />

      <main className="flex-1 min-w-0 flex flex-col">
        <Header
          pageTitle={pageTitle}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex-1 p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 max-w-[1600px] w-full mx-auto">
          {renderView()}
        </div>
      </main>

      <BottomNav activeNav={activeNav} onNavChange={(nav) => {
        const route = nav === "Dashboard" ? "/" : `/${nav.toLowerCase().replaceAll(" ", "-")}`;
        router.push(route);
      }} />
    </div>
  );
}
