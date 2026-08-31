"use client";

import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Settings,
  User,
  Bell,
  Lock,
  Building2,
  Save,
  Key,
  Shield,
  Globe,
  Mail,
  Phone,
  Palette,
} from "lucide-react";

type SettingsTab = "profile" | "preferences" | "security" | "notifications";

export default function SettingsView() {
  const { currentUser, theme, toggleTheme } = useApp();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [fullName, setFullName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Palette },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved successfully!");
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-[#1a5cff]" />
            Platform Settings
          </h1>
          <p>
            Route: <code>/platform/settings</code> • Manage your profile,
            preferences, and security
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <div
          className="bg-white border rounded-xl p-2 h-fit"
          style={{ borderColor: "var(--color-border)" }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          className="bg-white border rounded-xl p-6"
          style={{ borderColor: "var(--color-border)" }}
        >
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <form onSubmit={handleSave}>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Profile Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    value={currentUser.role}
                    disabled
                    className="w-full px-4 py-2.5 border rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Preferences Tab */}
          {activeTab === "preferences" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Preferences
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium text-slate-900">Dark Mode</div>
                    <div className="text-sm text-slate-500">
                      Switch between light and dark theme
                    </div>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${
                      theme === "dark" ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                        theme === "dark" ? "translate-x-6" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium text-slate-900">Language</div>
                    <div className="text-sm text-slate-500">
                      Select your preferred language
                    </div>
                  </div>
                  <select className="px-3 py-1.5 border rounded-lg text-sm bg-white">
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <div className="font-medium text-slate-900">Timezone</div>
                    <div className="text-sm text-slate-500">
                      Select your timezone
                    </div>
                  </div>
                  <select className="px-3 py-1.5 border rounded-lg text-sm bg-white">
                    <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Security Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  <Key className="w-4 h-4" /> Update Password
                </button>

                <div className="pt-4 mt-4 border-t">
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-slate-900">
                        Two-Factor Authentication
                      </div>
                      <div className="text-sm text-slate-500">
                        Add an extra layer of security
                      </div>
                    </div>
                    <button className="btn btn-secondary btn-sm">
                      <Shield className="w-4 h-4" /> Enable
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Notification Preferences
              </h2>
              <div className="space-y-4">
                {[
                  {
                    id: "email",
                    label: "Email Notifications",
                    desc: "Receive updates via email",
                  },
                  {
                    id: "push",
                    label: "Push Notifications",
                    desc: "Receive push notifications in browser",
                  },
                  {
                    id: "dues",
                    label: "Dues Reminders",
                    desc: "Get notified about upcoming due deadlines",
                  },
                  {
                    id: "announcements",
                    label: "Announcement Updates",
                    desc: "Get notified when new announcements are published",
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b"
                  >
                    <div>
                      <div className="font-medium text-slate-900">
                        {item.label}
                      </div>
                      <div className="text-sm text-slate-500">{item.desc}</div>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-blue-600 relative flex items-center">
                      <span className="w-5 h-5 rounded-full bg-white shadow-sm translate-x-6" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
