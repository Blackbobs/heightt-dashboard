// apps/admin-org/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
};

export default function AdminDashboard() {
  const router = useRouter();
  const { data: userData, isLoading: userLoading } = useAdminUser();
  const {
    user,
    scopes,
    selectedScope,
    isLoading: contextLoading,
    isFacultyAdmin,
    isInstitutionAdmin,
    isDepartmentAdmin,
    isOrganizationAdmin,
    isPlatformAdmin,
    hasPermission,
  } = useAdminContext();

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoading = userLoading || contextLoading;

  useEffect(() => {
    if (user) {
      console.log("👤 User data:", user);
      console.log("🔑 Admin types:", (user as any)?.adminTypes);
      console.log("📋 Scopes:", scopes);
      console.log("🎯 Selected scope:", selectedScope);
    }
  }, [user, scopes, selectedScope]);

  const pageTitle = pageTitles[activeNav] || activeNav;

  const getDisplayName = () => {
    if (selectedScope?.organization?.name) {
      return selectedScope.organization.name;
    }
    const adminTypes = (user as any)?.adminTypes || [];
    if (adminTypes.includes("PLATFORM_ADMIN")) return "Platform Admin";
    if (adminTypes.includes("INSTITUTION_ADMIN")) return "Institution Admin";
    if (adminTypes.includes("FACULTY_ADMIN")) return "Faculty Admin";
    if (adminTypes.includes("DEPARTMENT_ADMIN")) return "Department Admin";
    if (
      adminTypes.includes("ORGANIZATION_ADMIN") ||
      adminTypes.includes("CLUB_ADMIN")
    ) {
      return "Organization Admin";
    }
    return "Admin Dashboard";
  };

  const organizationName = getDisplayName();
  const organizationType =
    selectedScope?.organization?.type || (user as any)?.adminTypes?.[0] || "";

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

  const subtitle = selectedScope
    ? `${organizationName}${organizationType ? ` (${organizationType})` : ""}`
    : organizationName;

  const renderView = () => {
    switch (activeNav) {
      case "Dashboard":
        return (
          <>
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
    <div className="flex min-h-screen bg-[#f8faff]">
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
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
          pageSubtitle={subtitle}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">{renderView()}</div>
      </main>

      <BottomNav activeNav={activeNav} onNavChange={setActiveNav} />
    </div>
  );
}
