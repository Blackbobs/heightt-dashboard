// src/app/components/PlatformShell.tsx

"use client";

import React, { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "../context/AppContext";
import { Role } from "../types";
import * as Lucide from "lucide-react";

const {
  LayoutDashboard,
  Building2,
  Layers,
  Sitemap,
  Flag,
  Shield,
  Users,
  Megaphone,
  FlagCheckered,
  Wrench,
  ClipboardList,
  BarChart3,
  CreditCard,
  UserPlus,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Moon,
  Sun,
  Search,
  Menu,
  Calendar,
  Globe,
} = Lucide as any;

const navItems = [
  {
    path: "/platform",
    label: "Dashboard",
    icon: Lucide.LayoutDashboard,
    badge: null,
  },
  {
    path: "/platform/institutions",
    label: "Institutions",
    icon: Lucide.Building2,
    badgeKey: "institutions",
  },
  {
    path: "/platform/faculties",
    label: "Faculties",
    icon: Lucide.Layers,
    badgeKey: "faculties",
  },
  {
    path: "/platform/departments",
    label: "Departments",
    icon: Lucide.Layers,
    badgeKey: "departments",
  },
  {
    path: "/platform/organizations",
    label: "Organizations",
    icon: Lucide.Flag,
    badgeKey: "organizations",
    highlight: true,
  },
  {
    path: "/platform/administrators",
    label: "Administrators",
    icon: Shield,
    badgeKey: "administrators",
  },
  { path: "/platform/users", label: "Users", icon: Users, badgeKey: "users" },
  {
    path: "/platform/announcements",
    label: "Announcements",
    icon: Megaphone,
    badgeKey: "announcements",
  },
  {
    path: "/platform/feature-flags",
    label: "Feature Flags",
    icon: Lucide.Flag,
    badge: null,
  },
  {
    path: "/platform/maintenance",
    label: "Maintenance",
    icon: Wrench,
    badgeText: "Status",
  },
  {
    path: "/platform/academic-sessions",
    label: "Academic Sessions",
    icon: Calendar,
    badge: null,
  },
  {
    path: "/platform/audit-logs",
    label: "Audit Logs",
    icon: ClipboardList,
    badgeKey: "auditLogs",
  },
  {
    path: "/platform/analytics",
    label: "Analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    path: "/platform/finance",
    label: "Finance",
    icon: CreditCard,
    badge: null,
  },
  {
    path: "/platform/settings",
    label: "Settings",
    icon: Settings,
    badge: null,
  },
];

export default function PlatformShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    currentUser,
    switchRole,
    toast,
    showToast,
    institutions,
    faculties,
    departments,
    organizations,
    administrators,
    users,
    announcements,
    auditLogs,
    maintenance,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  useEffect(() => {
    const handleApiError = (event: Event) =>
      showToast((event as CustomEvent<string>).detail, "danger");
    window.addEventListener("platform-api-error", handleApiError);
    return () =>
      window.removeEventListener("platform-api-error", handleApiError);
  }, [showToast]);

  const getBadgeCount = (key?: string) => {
    switch (key) {
      case "institutions":
        return institutions.length;
      case "faculties":
        return faculties.length;
      case "departments":
        return departments.length;
      case "organizations":
        return organizations.length;
      case "administrators":
        return administrators.length;
      case "users":
        return users.length;
      case "announcements":
        return announcements.length;
      case "auditLogs":
        return auditLogs.length;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            background:
              toast.type === "danger"
                ? "#DC2626"
                : toast.type === "warning"
                  ? "#D97706"
                  : "#0F172A",
            color: "#FFFFFF",
            padding: "12px 20px",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            zIndex: 1000,
            fontSize: "13px",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <i
            className={`fas ${toast.type === "danger" ? "fa-circle-exclamation" : "fa-check-circle"}`}
          ></i>
          {toast.message}
        </div>
      )}

      {/* Maintenance Notice Bar */}
      {maintenance.isMaintenanceEnabled && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "var(--warning)",
            color: "#FFFFFF",
            padding: "6px 16px",
            fontSize: "12px",
            fontWeight: 700,
            textAlign: "center",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          <Wrench className="w-4 h-4" />
          SYSTEM MAINTENANCE MODE ACTIVE: {maintenance.bannerMessage}
        </div>
      )}

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "open" : ""}`}
        onClick={() => setIsSidebarOpen(false)}
        style={{
          display: isSidebarOpen ? "block" : "none",
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 90,
        }}
      />

      {/* SIDEBAR */}
      <aside
        className={`sidebar ${isSidebarOpen ? "open" : ""} ${isCollapsed ? "collapsed" : ""}`}
      >
        <div className="brand-header">
          <Link href="/platform" className="logo">
            <Globe className="w-5 h-5" />
          </Link>
          <div className="brand-title">
            <span className="name">Heightt Platform</span>
            <span className="tag">Platform Admin</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => {
            const isActive =
              pathname === item.path ||
              (item.path !== "/platform" && pathname?.startsWith(item.path));
            const count = getBadgeCount(item.badgeKey);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-btn ${isActive ? "active" : ""}`}
                onClick={() => setIsSidebarOpen(false)}
                title={item.label}
              >
                <Icon className="w-5 h-5" />
                <span className="label">{item.label}</span>
                {count !== null && count > 0 && (
                  <span className="badge primary">{count}</span>
                )}
                {item.badgeText && (
                  <span className="badge green">
                    {maintenance.systemStatus}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="bottom">
          <button
            className="nav-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Menu className="w-5 h-5" />
            <span className="label">Collapse</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        className="main"
        style={{ paddingTop: maintenance.isMaintenanceEnabled ? "28px" : "0" }}
      >
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <button
              className="menu-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="header-search">
              <Search className="w-4 h-4" />
              <input type="text" placeholder="Search across platform..." />
            </div>

            {/* Platform Badge */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-200">
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-700">
                Platform-wide View
              </span>
            </div>
          </div>

          <div className="header-right">
            {/* Role Switcher */}
            <div style={{ position: "relative" }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                title="Switch Active Admin Role for Testing Permissions"
                style={{ fontSize: "11px", gap: "6px" }}
              >
                <Shield
                  className="w-4 h-4"
                  style={{ color: "var(--primary)" }}
                />
                {currentUser.role}
                <ChevronDown className="w-3 h-3" />
              </button>

              {isRoleMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "40px",
                    right: 0,
                    width: "220px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 200,
                    padding: "8px",
                  }}
                >
                  <div
                    style={{
                      padding: "6px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                    }}
                  >
                    RBAC Role Preview Mode
                  </div>
                  {(
                    [
                      "Full Platform Admin",
                      "Operations Admin",
                      "Auditor / Read-Only",
                    ] as Role[]
                  ).map((role) => (
                    <button
                      key={role}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "8px 10px",
                        border: "none",
                        background:
                          currentUser.role === role
                            ? "var(--primary-bg)"
                            : "transparent",
                        color:
                          currentUser.role === role
                            ? "var(--primary)"
                            : "var(--text)",
                        fontSize: "12px",
                        fontWeight: currentUser.role === role ? 700 : 500,
                        cursor: "pointer",
                        borderRadius: "6px",
                      }}
                      onClick={() => {
                        switchRole(role);
                        setIsRoleMenuOpen(false);
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>

            {/* Notifications */}
            <div style={{ position: "relative" }}>
              <button
                className="icon-btn"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                title="Platform Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="dot"></span>
              </button>

              {isNotificationsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    right: 0,
                    width: "320px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 200,
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "10px",
                      borderBottom: "1px solid var(--border)",
                      paddingBottom: "6px",
                    }}
                  >
                    <span style={{ fontSize: "13px", fontWeight: 700 }}>
                      Platform Notifications
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--primary)",
                        fontWeight: 600,
                      }}
                    >
                      2 Unread
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      padding: "8px 0",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>
                      Database Backup Completed
                    </div>
                    <div
                      style={{ color: "var(--text-muted)", fontSize: "11px" }}
                    >
                      Platform snapshot created successfully.
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", padding: "8px 0" }}>
                    <div style={{ fontWeight: 600 }}>
                      Slow API Latency Alert
                    </div>
                    <div
                      style={{ color: "var(--text-muted)", fontSize: "11px" }}
                    >
                      UNILAG gateway response time +12%.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div style={{ position: "relative" }}>
              <button
                className="profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <span className="avatar">{currentUser.avatar}</span>
                <span className="name">{currentUser.name}</span>
              </button>

              {isProfileOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "44px",
                    right: 0,
                    width: "220px",
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius)",
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 200,
                    padding: "12px",
                  }}
                >
                  <div
                    style={{
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--border)",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ fontSize: "13px", fontWeight: 700 }}>
                      {currentUser.name}
                    </div>
                    <div
                      style={{ fontSize: "11px", color: "var(--text-muted)" }}
                    >
                      {currentUser.email}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--primary)",
                        fontWeight: 700,
                        marginTop: "4px",
                      }}
                    >
                      {currentUser.role}
                    </div>
                  </div>
                  <Link
                    href="/platform/settings"
                    style={{
                      display: "block",
                      padding: "8px",
                      fontSize: "12px",
                      color: "var(--text)",
                      textDecoration: "none",
                      borderRadius: "4px",
                    }}
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Settings
                      className="w-4 h-4"
                      style={{ marginRight: "8px", display: "inline" }}
                    />
                    Settings
                  </Link>
                  <button
                    style={{
                      display: "block",
                      padding: "8px",
                      fontSize: "12px",
                      color: "var(--danger)",
                      textDecoration: "none",
                      borderRadius: "4px",
                      background: "none",
                      border: "none",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setIsProfileOpen(false);
                      alert("Logout functionality");
                    }}
                  >
                    <LogOut
                      className="w-4 h-4"
                      style={{ marginRight: "8px", display: "inline" }}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="page">{children}</div>
      </main>
    </div>
  );
}