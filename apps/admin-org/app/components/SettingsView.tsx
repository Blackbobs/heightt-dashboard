"use client";

import { useState } from "react";
import { usePermissions } from "../context/PermissionContext";

type SettingsCategory = "profile" | "notifications" | "security" | "organization";

export default function SettingsView() {
  const { role } = usePermissions();
  const [activeTab, setActiveTab] = useState<SettingsCategory>("profile");
  const [mobileDetailView, setMobileDetailView] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john.doe@heightt.com");
  const [phone, setPhone] = useState("+234 801 234 5678");

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
      icon: "fas fa-user",
      color: "blue",
    },
    {
      key: "notifications" as SettingsCategory,
      title: "Notification Preferences",
      desc: "Choose email alerts, dues reminders, and updates",
      icon: "fas fa-bell",
      color: "green",
    },
    {
      key: "security" as SettingsCategory,
      title: "Password & Security",
      desc: "Update password, 2FA, and active login sessions",
      icon: "fas fa-lock",
      color: "orange",
    },
    {
      key: "organization" as SettingsCategory,
      title: "Organization Info",
      desc: "View department details, faculty, and switch orgs",
      icon: "fas fa-building",
      color: "purple",
    },
  ];

  return (
    <div>
      {/* Page Head */}
      <div className="mb-6">
        <h1
          className="text-[22px] font-bold tracking-tight"
          style={{ color: "var(--color-foreground)" }}
        >
          Settings
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
          Manage your profile, preferences, organization details, and security settings
        </p>
      </div>

      {/* Main Settings Navigation & Content Layout */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-start">
        {/* Left Category Menu Navigation */}
        <div
          className={`space-y-2 bg-white border rounded-[var(--radius-card)] p-3 ${mobileDetailView ? "hidden md:block" : "block"
            }`}
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Settings Menu
          </div>

          {settingsMenu.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => handleTabClick(item.key)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-none cursor-pointer text-left transition-all duration-200 font-sans ${isActive
                  ? "bg-blue-50/80 text-blue-900 shadow-xs border-l-4 border-l-blue-600 font-semibold"
                  : "bg-transparent text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${item.color === "blue"
                      ? "bg-blue-100 text-blue-600"
                      : item.color === "green"
                        ? "bg-emerald-100 text-emerald-600"
                        : item.color === "orange"
                          ? "bg-amber-100 text-amber-600"
                          : "bg-purple-100 text-purple-600"
                      }`}
                  >
                    <i className={item.icon} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-tight">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                      {item.desc}
                    </div>
                  </div>
                </div>
                <i
                  className={`fas fa-chevron-right text-xs transition-transform ${isActive ? "text-blue-600 translate-x-0.5" : "text-slate-300"
                    }`}
                />
              </button>
            );
          })}

          <div className="pt-2 border-t mt-2" style={{ borderColor: "var(--color-border)" }}>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl border-none bg-red-50 text-red-600 hover:bg-red-100 cursor-pointer text-left transition-colors font-sans"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm flex-shrink-0">
                  <i className="fas fa-right-from-bracket" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Logout</div>
                  <div className="text-[11px] text-red-400">Sign out of admin session</div>
                </div>
              </div>
              <i className="fas fa-chevron-right text-xs text-red-400" />
            </button>
          </div>
        </div>

        {/* Right Active Detail Panel */}
        <div className={`space-y-6 ${mobileDetailView ? "block" : "hidden md:block"}`}>
          {/* Mobile Back Button */}
          <button
            onClick={() => setMobileDetailView(false)}
            className="md:hidden flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border-none cursor-pointer mb-2 font-sans"
          >
            <i className="fas fa-arrow-left" /> Back to Settings Menu
          </button>

          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div
              className="bg-white border rounded-[var(--radius-card)] overflow-hidden shadow-xs"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-base">
                  <i className="fas fa-user" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Profile Settings</h2>
                  <p className="text-xs text-slate-500">
                    Update your account details and profile information
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* Profile Header Card */}
                <div
                  className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border mb-6"
                  style={{ borderColor: "var(--color-border)", background: "var(--color-muted)" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-md flex-shrink-0"
                    style={{ background: "var(--color-primary)" }}
                  >
                    JD
                  </div>
                  <div className="text-center sm:text-left flex-1">
                    <h3 className="text-lg font-bold text-slate-900">{fullName}</h3>
                    <p className="text-xs text-slate-500">{email}</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <i className="fas fa-shield-halved text-[10px]" /> Department Admin
                    </span>
                  </div>
                  <button
                    onClick={() => alert("📷 Photo change dialog opened")}
                    className="px-3.5 py-2 border rounded-lg text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 cursor-pointer font-sans"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <i className="fas fa-camera mr-1" /> Change Photo
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all bg-white"
                      style={{ borderColor: "var(--color-border)" }}
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
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all bg-white"
                      style={{ borderColor: "var(--color-border)" }}
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
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all bg-white"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Role / Title
                    </label>
                    <input
                      type="text"
                      value="Department Admin"
                      disabled
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans bg-slate-100 text-slate-500 cursor-not-allowed"
                      style={{ borderColor: "var(--color-border)" }}
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Role can only be changed by Organization Master Admin.
                    </p>
                  </div>

                  <div className="pt-3 border-t flex justify-end" style={{ borderColor: "var(--color-border)" }}>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all font-sans"
                      style={{ background: "var(--color-primary)" }}
                    >
                      <i className="fas fa-save mr-1.5" /> Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div
              className="bg-white border rounded-[var(--radius-card)] overflow-hidden shadow-xs"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-base">
                  <i className="fas fa-bell" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Notification Preferences</h2>
                  <p className="text-xs text-slate-500">
                    Control how and when you receive system alerts
                  </p>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleSaveNotifications} className="space-y-4">
                  {[
                    {
                      key: "email" as const,
                      title: "Email Notifications",
                      desc: "Receive account and security alerts via email",
                    },
                    {
                      key: "payments" as const,
                      title: "Payment Alerts",
                      desc: "Get notified when student dues or payments are completed",
                    },
                    {
                      key: "dues" as const,
                      title: "Dues Reminders",
                      desc: "Receive automated alerts for upcoming due deadlines",
                    },
                    {
                      key: "announcements" as const,
                      title: "Announcement Updates",
                      desc: "Get notified when new department announcements are published",
                    },
                    {
                      key: "reports" as const,
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
                        <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-400">{item.desc}</div>
                      </div>

                      {/* Toggle Switch - Fixed */}
                      <button
                        type="button"
                        onClick={() => handleToggleNotification(item.key)}
                        className={`
                w-11 h-6 rounded-full transition-colors duration-200 
                relative flex items-center border-none cursor-pointer flex-shrink-0
                ${notifications[item.key] ? "bg-blue-600" : "bg-slate-300"}
              `}
                        aria-label={`Toggle ${item.title}`}
                        role="switch"
                        aria-checked={notifications[item.key]}
                      >
                        <span
                          className={`
                  w-[18px] h-[18px] rounded-full bg-white shadow-sm
                  transition-transform duration-200 ease-in-out
                  ${notifications[item.key] ? "translate-x-[22px]" : "translate-x-[3px]"}
                `}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-end gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all font-sans hover:opacity-90"
                      style={{ background: "var(--color-primary)" }}
                    >
                      <i className="fas fa-save mr-1.5" /> Save Preferences
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY */}
          {activeTab === "security" && (
            <div
              className="bg-white border rounded-[var(--radius-card)] overflow-hidden shadow-xs"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center gap-3"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center text-base">
                  <i className="fas fa-lock" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Password &amp; Security</h2>
                  <p className="text-xs text-slate-500">
                    Manage password authentication and active sessions
                  </p>
                </div>
              </div>

              <div className="p-6">
                <form onSubmit={handleUpdatePassword} className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none bg-white"
                      style={{ borderColor: "var(--color-border)" }}
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
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none bg-white"
                      style={{ borderColor: "var(--color-border)" }}
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
                      className="w-full px-3.5 py-2.5 border-2 rounded-lg text-sm font-sans outline-none bg-white"
                      style={{ borderColor: "var(--color-border)" }}
                      required
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all font-sans"
                      style={{ background: "var(--color-primary)" }}
                    >
                      <i className="fas fa-key mr-1.5" /> Update Password
                    </button>
                  </div>
                </form>

                {/* Additional Security Section */}
                <div className="pt-5 border-t space-y-3" style={{ borderColor: "var(--color-border)" }}>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Two-Factor Authentication (2FA)
                      </div>
                      <div className="text-xs text-slate-400">
                        Add extra verification protection to your admin login
                      </div>
                    </div>
                    <button
                      onClick={() => alert("🔐 2FA Setup Dialog triggered")}
                      className="px-3.5 py-1.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer font-sans bg-white"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      <i className="fas fa-shield-halved mr-1 text-blue-600" /> Setup
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Active Sessions</div>
                      <div className="text-xs text-slate-400">
                        Currently logged in on Chrome (Windows) & Safari (iOS)
                      </div>
                    </div>
                    <button
                      onClick={() => alert("🚪 All other device sessions logged out")}
                      className="px-3.5 py-1.5 border rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 cursor-pointer font-sans bg-white"
                      style={{ borderColor: "var(--color-border)" }}
                    >
                      Logout All Devices
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORGANIZATION */}
          {activeTab === "organization" && (
            <div
              className="bg-white border rounded-[var(--radius-card)] overflow-hidden shadow-xs"
              style={{ borderColor: "var(--color-border)" }}
            >
              <div
                className="px-6 py-4 border-b flex items-center justify-between"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center text-base">
                    <i className="fas fa-building" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Organization Info</h2>
                    <p className="text-xs text-slate-500">
                      Department affiliation & organization settings
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-semibold flex items-center gap-1">
                  <i className="fas fa-check-circle" /> Active &amp; Verified
                </span>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs text-slate-400">Organization Name</span>
                    <span className="text-sm font-semibold text-slate-900">
                      Computer Science Department
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs text-slate-400">Institution</span>
                    <span className="text-sm font-semibold text-slate-900">
                      University of Lagos
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs text-slate-400">Faculty</span>
                    <span className="text-sm font-semibold text-slate-900">
                      Faculty of Science
                    </span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs text-slate-400">Total Enrolled Members</span>
                    <span className="text-sm font-semibold text-slate-900">1,240 Students</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
                    <span className="text-xs text-slate-400">Creation Date</span>
                    <span className="text-sm font-semibold text-slate-900">September 2024</span>
                  </div>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2 mb-4">
                  <i className="fas fa-info-circle text-amber-600 text-base" />
                  <span>
                    You have admin access to <strong>2 organizations</strong>. Switch anytime from the organization menu.
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => alert("Switching organization...")}
                    className="px-4 py-2.5 border rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer font-sans bg-white"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <i className="fas fa-exchange-alt mr-1 text-blue-600" /> Switch Organization
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsLogoutModalOpen(false);
          }}
        >
          <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[420px] p-6 text-center shadow-2xl animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-2xl mb-3">
              <i className="fas fa-right-from-bracket" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Confirm Logout</h2>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Are you sure you want to sign out of your Heightt admin account? You will need to log in again to access the dashboard.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="flex-1 py-2.5 border-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer font-sans bg-white"
                style={{ borderColor: "var(--color-border)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsLogoutModalOpen(false);
                  alert("🔒 Logged out cleanly");
                }}
                className="flex-1 py-2.5 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 border-none cursor-pointer font-sans"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
