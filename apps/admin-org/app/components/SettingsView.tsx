"use client";

import { useState } from "react";
import { useAdminUser } from "@/hooks/admin/useAdminAuth";
import {
  User,
  Bell,
  Lock,
  Building2,
  Save,
  Key,
  Shield,
  LogOut,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "../context/PermissionContext";

type SettingsCategory =
  "profile" | "notifications" | "security" | "organization";

export function SettingsView() {
  const { data: user } = useAdminUser();
  const { role } = usePermissions();
  const [activeTab, setActiveTab] = useState<SettingsCategory>("profile");
  const [mobileDetailView, setMobileDetailView] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(
    user?.profile
      ? `${user.profile.firstName} ${user.profile.lastName}`
      : "Admin User",
  );
  const [email, setEmail] = useState(user?.email || "admin@heightt.com");
  const [phone, setPhone] = useState(
    user?.profile?.phone || "+234 801 234 5678",
  );

  // Notification Switches State
  const [notifications, setNotifications] = useState({
    email: true,
    payments: true,
    dues: false,
    announcements: true,
    reports: false,
  });

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleToggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Profile updated successfully!");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    alert("✅ Notification preferences saved!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      alert("❌ New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("❌ New password and confirmation do not match.");
      return;
    }
    alert("✅ Password updated successfully!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleTabClick = (tabKey: SettingsCategory) => {
    setActiveTab(tabKey);
    setMobileDetailView(true);
  };

  const settingsMenu = [
    {
      key: "profile" as SettingsCategory,
      title: "Profile Settings",
      desc: "Manage your name, email, avatar, and personal info",
      icon: User,
      color: "blue",
    },
    {
      key: "notifications" as SettingsCategory,
      title: "Notification Preferences",
      desc: "Choose email alerts, dues reminders, and updates",
      icon: Bell,
      color: "green",
    },
    {
      key: "security" as SettingsCategory,
      title: "Password & Security",
      desc: "Update password, 2FA, and active login sessions",
      icon: Lock,
      color: "orange",
    },
    {
      key: "organization" as SettingsCategory,
      title: "Organization Info",
      desc: "View department details, faculty, and switch orgs",
      icon: Building2,
      color: "purple",
    },
  ];

  return (
    <div>
      {/* Page Head */}
      <div className="mb-6">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage your profile, preferences, organization details, and security
          settings
        </p>
      </div>

      {/* Main Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Menu */}
        <div
          className={`space-y-2 bg-white border rounded-xl p-3 ${mobileDetailView ? "hidden md:block" : "block"}`}
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Settings Menu
          </div>

          {settingsMenu.map((item) => {
            const isActive = activeTab === item.key;
            const Icon = item.icon;
            const colorClasses = {
              blue: "bg-blue-50 text-blue-600",
              green: "bg-emerald-50 text-emerald-600",
              orange: "bg-amber-50 text-amber-600",
              purple: "bg-purple-50 text-purple-600",
            };

            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border-none cursor-pointer text-left transition-all duration-200",
                  isActive
                    ? "bg-blue-50/80 text-blue-900 shadow-xs border-l-4 border-l-blue-600 font-semibold"
                    : "bg-transparent text-slate-700 hover:bg-slate-50",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0",
                      colorClasses[item.color as keyof typeof colorClasses],
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isActive
                      ? "text-blue-600 translate-x-0.5"
                      : "text-slate-300",
                  )}
                />
              </button>
            );
          })}
        </div>

        {/* Right Panel */}
        <div
          className={`space-y-6 ${mobileDetailView ? "block" : "hidden md:block"}`}
        >
          {/* Mobile Back */}
          <button
            onClick={() => setMobileDetailView(false)}
            className="md:hidden flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border-none cursor-pointer mb-2"
          >
            <ChevronRight className="w-4 h-4 -rotate-180" /> Back to Menu
          </button>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div
              className="bg-white border rounded-xl overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Profile Settings
                  </h2>
                  <p className="text-xs text-slate-500">
                    Update your account details and profile information
                  </p>
                </div>
              </div>

              <div className="p-6">
                <div
                  className="flex items-center gap-5 p-4 rounded-xl border mb-6"
                  style={{
                    borderColor: "var(--color-border)",
                    background: "var(--color-muted)",
                  }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md"
                    style={{ background: "var(--color-primary)" }}
                  >
                    {fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900">
                      {fullName}
                    </h3>
                    <p className="text-xs text-slate-500">{email}</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <Shield className="w-3 h-3" /> {role} Admin
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    />
                  </div>
                  <div
                    className="pt-3 border-t flex justify-end"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer bg-[#1a5cff] hover:bg-[#0f4ad0] transition-all"
                    >
                      <Save className="w-4 h-4" /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div
              className="bg-white border rounded-xl overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Notification Preferences
                  </h2>
                  <p className="text-xs text-slate-500">
                    Control how and when you receive system alerts
                  </p>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  {[
                    {
                      key: "email",
                      title: "Email Notifications",
                      desc: "Receive account and security alerts via email",
                    },
                    {
                      key: "payments",
                      title: "Payment Alerts",
                      desc: "Get notified when student dues or payments are completed",
                    },
                    {
                      key: "dues",
                      title: "Dues Reminders",
                      desc: "Receive automated alerts for upcoming due deadlines",
                    },
                    {
                      key: "announcements",
                      title: "Announcement Updates",
                      desc: "Get notified when new department announcements are published",
                    },
                    {
                      key: "reports",
                      title: "Weekly Financial Summaries",
                      desc: "Receive weekly PDF summaries of department transactions",
                    },
                  ].map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between py-3 border-b last:border-b-0"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <div className="flex-1 pr-4">
                        <div className="text-sm font-semibold text-slate-900">
                          {item.title}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.desc}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleNotification(
                            item.key as keyof typeof notifications,
                          )
                        }
                        className={cn(
                          "w-11 h-6 rounded-full transition-colors duration-200 relative flex items-center border-none cursor-pointer flex-shrink-0",
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-[#1a5cff]"
                            : "bg-slate-300",
                        )}
                        role="switch"
                        aria-checked={
                          notifications[item.key as keyof typeof notifications]
                        }
                      >
                        <span
                          className={cn(
                            "w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                            notifications[
                              item.key as keyof typeof notifications
                            ]
                              ? "translate-x-[22px]"
                              : "translate-x-[3px]",
                          )}
                        />
                      </button>
                    </div>
                  ))}
                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer bg-[#1a5cff] hover:bg-[#0f4ad0] transition-all"
                    >
                      <Save className="w-4 h-4" /> Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div
              className="bg-white border rounded-xl overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Password & Security
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage password authentication and active sessions
                  </p>
                </div>
              </div>

              <div className="p-6">
                <form
                  onSubmit={handleUpdatePassword}
                  className="space-y-4 mb-6"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password (min. 8 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer bg-[#1a5cff] hover:bg-[#0f4ad0] transition-all"
                    >
                      <Key className="w-4 h-4" /> Update Password
                    </button>
                  </div>
                </form>

                <div
                  className="pt-5 border-t space-y-3"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Two-Factor Authentication (2FA)
                      </div>
                      <div className="text-xs text-slate-400">
                        Add extra verification protection to your admin login
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white border-slate-200">
                      <Shield className="w-3.5 h-3.5 inline mr-1 text-blue-600" />{" "}
                      Setup
                    </button>
                  </div>
                  <div
                    className="flex items-center justify-between py-2 border-t"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Active Sessions
                      </div>
                      <div className="text-xs text-slate-400">
                        Currently logged in on Chrome (Windows)
                      </div>
                    </div>
                    <button className="px-3.5 py-1.5 border rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer bg-white border-slate-200">
                      Logout All Devices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Organization Tab */}
          {activeTab === "organization" && (
            <div
              className="bg-white border rounded-xl overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Organization Info
                    </h2>
                    <p className="text-xs text-slate-500">
                      Department affiliation & organization settings
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Active & Verified
                </span>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div
                    className="flex justify-between py-2.5 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs text-slate-400">
                      Organization Name
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      Computer Science Department
                    </span>
                  </div>
                  <div
                    className="flex justify-between py-2.5 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs text-slate-400">Institution</span>
                    <span className="text-sm font-semibold text-slate-900">
                      University of Lagos
                    </span>
                  </div>
                  <div
                    className="flex justify-between py-2.5 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs text-slate-400">Faculty</span>
                    <span className="text-sm font-semibold text-slate-900">
                      Faculty of Science
                    </span>
                  </div>
                  <div
                    className="flex justify-between py-2.5 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs text-slate-400">
                      Total Members
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      1,240 Students
                    </span>
                  </div>
                  <div
                    className="flex justify-between py-2.5 border-b"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <span className="text-xs text-slate-400">
                      Creation Date
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      September 2024
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>
                    You have admin access to <strong>2 organizations</strong>.
                    Switch anytime from the organization menu.
                  </span>
                </div>

                <button className="px-4 py-2.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer bg-white border-slate-200">
                  <Building2 className="w-3.5 h-3.5 inline mr-1 text-blue-600" />{" "}
                  Switch Organization
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
