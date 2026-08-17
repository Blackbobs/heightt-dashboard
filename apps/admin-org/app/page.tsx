"use client";

import { useState } from "react";

import { Loader2, AlertCircle } from "lucide-react";
import { useAdminContext } from "./components/AdminContext";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { StatsGrid } from "./components/StatsGrid";
import { TransactionsList } from "./components/TransactionsList";
import { AnnouncementsList } from "./components/AnnouncementsList";
import { DuesView } from "./components/DuesView";
import { PaymentsView } from "./components/PaymentsView";
import { StudentsView } from "./components/StudentsView";
import { AnnouncementsView } from "./components/AnnouncementsView";
import { FinanceView } from "./components/FinanceView";
import { SettingsView } from "./components/SettingsView";
import { BottomNav } from "./components/BottomNav";

const pageTitles: Record<string, string> = {
  Dashboard: "Dashboard",
  Dues: "Dues",
  Payments: "Payments",
  Students: "Students",
  Announcements: "Announcements",
  Finance: "Finance",
  Settings: "Settings",
};

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, scopes, selectedScope, isLoading } = useAdminContext();

  const pageTitle = pageTitles[activeNav] || activeNav;
  const organizationName =
    selectedScope?.organization?.name || "No Organization Selected";
  const organizationType = selectedScope?.organization?.type || "";

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

  // If no scopes, show a message
  if (!scopes || scopes.length === 0) {
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
        </div>
      </div>
    );
  }

  // Build subtitle with org info
  const subtitle = selectedScope
    ? `${organizationName}${organizationType ? ` (${organizationType})` : ""}`
    : "Select an organization";

  return (
    <div className="flex min-h-screen bg-[#f8faff]">
      {/* Sidebar */}
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col">
        <Header
          pageTitle={pageTitle}
          pageSubtitle={subtitle}
          onMenuToggle={() => setSidebarOpen((v) => !v)}
        />

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-8 pb-24 lg:pb-8">
          {activeNav === "Dashboard" && (
            <>
              <StatsGrid />
              <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
                <TransactionsList />
                <AnnouncementsList />
              </div>
            </>
          )}

          {activeNav === "Dues" && <DuesView />}
          {activeNav === "Payments" && <PaymentsView />}
          {activeNav === "Students" && <StudentsView />}
          {activeNav === "Announcements" && <AnnouncementsView />}
          {activeNav === "Finance" && <FinanceView />}
          {activeNav === "Settings" && <SettingsView />}
        </div>
      </main>

      {/* Bottom Nav (Mobile) */}
      <BottomNav activeNav={activeNav} onNavChange={setActiveNav} />
    </div>
  );
}
