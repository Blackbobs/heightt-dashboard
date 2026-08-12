"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsGrid from "./components/StatsGrid";
import TransactionsList from "./components/TransactionsList";
import AnnouncementsList from "./components/AnnouncementsList";
import BottomNav from "./components/BottomNav";
import DuesView from "./components/DuesView";
import PaymentsView from "./components/PaymentsView";

import StudentsView from "./components/StudentsView";
import AnnouncementsView from "./components/AnnouncementsView";
import FinanceView from "./components/FinanceView";
import SettingsView from "./components/SettingsView";

import { PermissionProvider } from "./context/PermissionContext";

const pageTitles: Record<string, string> = {
  Dashboard: "Dashboard",
  Dues: "Dues",
  Payments: "Payments",
  Students: "Students",
  Announcements: "Announcements",
  Finance: "Finance",
  Settings: "Settings",
};

export default function Home() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pageTitle = pageTitles[activeNav] || activeNav;

  return (
    <PermissionProvider>
      <div className="flex min-h-screen" style={{ background: "var(--color-background)" }}>
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
            pageSubtitle="Computer Science Department"
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

            {activeNav === "Dues" && (
              <DuesView />
            )}

            {activeNav === "Payments" && (
              <PaymentsView />
            )}

            {activeNav === "Students" && (
              <StudentsView />
            )}

            {activeNav === "Announcements" && (
              <AnnouncementsView />
            )}

            {activeNav === "Finance" && (
              <FinanceView />
            )}

            {activeNav === "Settings" && (
              <SettingsView />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <BottomNav
        activeNav={activeNav}
        onNavChange={setActiveNav}
      />
    </PermissionProvider>
  );
}
