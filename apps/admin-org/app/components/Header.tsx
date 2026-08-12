"use client";

import { useState } from "react";
import { usePermissions, ROLE_PRESETS, type RoleKey } from "../context/PermissionContext";

interface HeaderProps {
  pageTitle: string;
  pageSubtitle: string;
  onMenuToggle: () => void;
}

export default function Header({ pageTitle, pageSubtitle, onMenuToggle }: HeaderProps) {
  const { role, setRole, permissions } = usePermissions();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const currentRoleInfo = ROLE_PRESETS[role];

  return (
    <header
      className="sticky top-0 z-50 min-h-[64px] bg-white border-b flex items-center justify-between px-3 sm:px-6 md:px-8 py-2"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Left Column: Menu Button & Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 pr-2">
        <button
          className="lg:hidden p-1.5 rounded-lg border-none bg-slate-100 hover:bg-slate-200 text-slate-700 text-base cursor-pointer flex-shrink-0"
          onClick={onMenuToggle}
          aria-label="Toggle sidebar"
        >
          <i className="fas fa-bars" />
        </button>
        <div className="min-w-0">
          <h1
            className="text-base sm:text-lg md:text-xl font-bold tracking-tight truncate leading-snug"
            style={{ color: "var(--color-foreground)" }}
          >
            {pageTitle}
          </h1>
          <p
            className="text-[11px] sm:text-xs md:text-[13px] truncate leading-none mt-0.5"
            style={{ color: "var(--color-muted-foreground)" }}
          >
            {pageSubtitle}
          </p>
        </div>
      </div>

      {/* Right Column: Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Role Switcher Widget */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen((v) => !v)}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 bg-slate-50 hover:bg-slate-100 font-sans"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-foreground)",
            }}
            title="Switch demo role to test permission-based UI filtering"
          >
            <i className="fas fa-user-shield text-blue-600 text-xs sm:text-sm flex-shrink-0" />
            <span className="hidden md:inline text-slate-500">Role:</span>
            <span className="font-bold text-blue-700 max-w-[80px] sm:max-w-none truncate">
              {currentRoleInfo.name.replace("Department ", "")}
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-mono font-semibold">
              {permissions.length} perms
            </span>
            <i className="fas fa-chevron-down text-[10px] text-slate-400 flex-shrink-0" />
          </button>

          {roleDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setRoleDropdownOpen(false)}
              />
              <div
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border p-2 z-20 animate-fade-in"
                style={{ borderColor: "var(--color-border)" }}
              >
                <div className="px-3 py-2 border-b mb-1" style={{ borderColor: "var(--color-border)" }}>
                  <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Testing Permissions
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Switch role to see action buttons hide or appear dynamically
                  </div>
                </div>

                <div className="space-y-1">
                  {(Object.keys(ROLE_PRESETS) as RoleKey[]).map((rKey) => {
                    const preset = ROLE_PRESETS[rKey];
                    const isSelected = rKey === role;
                    return (
                      <button
                        key={rKey}
                        onClick={() => {
                          setRole(rKey);
                          setRoleDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border-none cursor-pointer transition-colors font-sans ${
                          isSelected
                            ? "bg-blue-50 text-blue-900 font-semibold"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span>{preset.name}</span>
                          {isSelected && <i className="fas fa-check text-blue-600 text-xs" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                          {preset.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Notifications */}
        <button
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-none bg-transparent flex items-center justify-center text-sm sm:text-base cursor-pointer relative transition-all duration-200 hover:bg-slate-100 flex-shrink-0"
          style={{ color: "var(--color-muted-foreground)" }}
          onClick={() => alert("Notifications panel would open here")}
          aria-label="Notifications"
        >
          <i className="fas fa-bell" />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full border-2 border-white"
            style={{ background: "var(--color-destructive)" }}
          />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 py-1 pl-1 pr-1 sm:pr-2 rounded-lg font-sans flex-shrink-0">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-xs"
            style={{ background: "var(--color-primary)" }}
          >
            JD
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-bold text-slate-900 leading-tight">John Doe</div>
            <div className="text-[10px] text-slate-400">{currentRoleInfo.name}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
