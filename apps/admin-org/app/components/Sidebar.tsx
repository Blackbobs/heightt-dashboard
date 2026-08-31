// apps/admin-org/components/Sidebar.tsx
"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Coins,
  HandCoins,
  Users,
  Megaphone,
  ChartLine,
  Settings,
  Building2,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Shield,
  Wallet,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isFacultyAdmin?: boolean;
  isInstitutionAdmin?: boolean;
  isDepartmentAdmin?: boolean;
  isOrganizationAdmin?: boolean;
  isPlatformAdmin?: boolean;
  hasPermission?: (permission: string) => boolean;
}

export function Sidebar({
  activeNav,
  onNavChange,
  isOpen,
  onClose,
  isFacultyAdmin = false,
  isInstitutionAdmin = false,
  isDepartmentAdmin = false,
  isOrganizationAdmin = false,
  isPlatformAdmin = false,
  hasPermission = () => false,
}: SidebarProps) {
  const logoutMutation = useAdminLogout();
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Overview",
    "Management",
    "Finance",
    "Settings",
  ]);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Check permissions for each feature
  const canManageDues =
    hasPermission("finance:create") ||
    isFacultyAdmin ||
    isInstitutionAdmin ||
    isDepartmentAdmin ||
    isOrganizationAdmin ||
    isPlatformAdmin;
  const canManageStudents =
    hasPermission("student:read") ||
    isFacultyAdmin ||
    isInstitutionAdmin ||
    isDepartmentAdmin ||
    isOrganizationAdmin ||
    isPlatformAdmin;
  const canManageAnnouncements =
    hasPermission("communication:create") ||
    isFacultyAdmin ||
    isInstitutionAdmin ||
    isDepartmentAdmin ||
    isOrganizationAdmin ||
    isPlatformAdmin;
  const canViewFinance =
    hasPermission("finance:read") ||
    isFacultyAdmin ||
    isInstitutionAdmin ||
    isDepartmentAdmin ||
    isOrganizationAdmin ||
    isPlatformAdmin;
  const canViewWithdrawals =
    hasPermission("finance:read") || isOrganizationAdmin || isPlatformAdmin;
  const canViewBankAccounts =
    hasPermission("finance:read") || isOrganizationAdmin || isPlatformAdmin;

  const navSections = [
    {
      label: "Overview",
      items: [{ icon: LayoutDashboard, label: "Dashboard" }],
    },
    {
      label: "Management",
      items: [
        ...(canManageDues ? [{ icon: Coins, label: "Dues" }] : []),
        { icon: HandCoins, label: "Payments" },
        ...(canManageStudents ? [{ icon: Users, label: "Students" }] : []),
        ...(isInstitutionAdmin ? [{ icon: GraduationCap, label: "Promotion" }] : []),
        ...(canManageAnnouncements
          ? [{ icon: Megaphone, label: "Announcements" }]
          : []),
      ].filter(
        (item): item is { icon: any; label: string } => item !== undefined,
      ),
    },
    {
      label: "Finance",
      items: [
        ...(canViewFinance ? [{ icon: ChartLine, label: "Finance" }] : []),
        ...(canViewWithdrawals
          ? [{ icon: ArrowUpRight, label: "Withdrawals" }]
          : []),
        ...(canViewBankAccounts
          ? [{ icon: Wallet, label: "Bank Accounts" }]
          : []),
      ].filter(
        (item): item is { icon: any; label: string } => item !== undefined,
      ),
    },
    {
      label: "Settings",
      items: [{ icon: Settings, label: "Settings" }],
    },
  ].filter((section) => section.items.length > 0);

  const getAdminTypeLabel = () => {
    if (isPlatformAdmin) return "Platform Admin";
    if (isInstitutionAdmin) return "Institution Admin";
    if (isFacultyAdmin) return "Faculty Admin";
    if (isDepartmentAdmin) return "Department Admin";
    if (isOrganizationAdmin) return "Organization Admin";
    return "Admin";
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen z-50 w-[270px] bg-white border-r flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-300 ease-out shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base shadow-sm"
              style={{ background: "var(--color-primary)" }}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-lg text-[#0b1a33]">
                Heightt Admin
              </span>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-medium text-blue-600">
                  {getAdminTypeLabel()}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full border-none bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer flex items-center justify-center text-sm"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-2 overflow-y-auto">
          {navSections.map((section) => {
            const isExpanded = expandedSections.includes(section.label);
            const isActive = section.items.some(
              (item) => item.label === activeNav,
            );

            return (
              <div key={section.label}>
                <button
                  onClick={() => toggleSection(section.label)}
                  className={cn(
                    "flex items-center justify-between w-full px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border-none cursor-pointer bg-transparent",
                    isActive ? "text-[#1a5cff]" : "text-[#7a8ba3]",
                  )}
                >
                  <span>{section.label}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1">
                    {section.items.map((item) => {
                      const isItemActive = activeNav === item.label;
                      const Icon = item.icon;

                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            onNavChange(item.label);
                            onClose();
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left border-none cursor-pointer transition-all duration-150 bg-transparent",
                            isItemActive
                              ? "font-semibold bg-blue-50 text-blue-700 shadow-sm"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isItemActive ? "text-blue-600" : "text-slate-400",
                            )}
                          />
                          <span className="flex-1">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div
          className="p-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left border-none cursor-pointer transition-colors bg-transparent text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>
              {logoutMutation.isPending ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
