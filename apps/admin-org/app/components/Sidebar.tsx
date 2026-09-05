"use client";
import { LayoutDashboard, Coins, HandCoins, Users, Megaphone, ChartLine, Settings, LogOut, X, Wallet, ArrowUpRight, GraduationCap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";
import { useAdminContext } from "./AdminContext";
import Image from "next/image";

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
  const { selectedScope } = useAdminContext();
  const privileged = isFacultyAdmin || isInstitutionAdmin || isDepartmentAdmin || isOrganizationAdmin || isPlatformAdmin;
  const canFinance = hasPermission("finance:read") || privileged;

  const sections = [
    {
      label: "Overview",
      items: [{ icon: LayoutDashboard, label: "Dashboard" }],
    },
    {
      label: "Finance",
      items: [
        ...(hasPermission("finance:create") || privileged ? [{ icon: Coins, label: "Dues" }] : []),
        { icon: HandCoins, label: "Payments" },
        ...(canFinance ? [{ icon: ChartLine, label: "Finance" }, { icon: ArrowUpRight, label: "Withdrawals" }, { icon: Wallet, label: "Bank Accounts" }] : []),
      ],
    },
    {
      label: "Management",
      items: [
        ...(hasPermission("student:read") || privileged ? [{ icon: Users, label: "Students" }] : []),
        ...(isInstitutionAdmin ? [{ icon: GraduationCap, label: "Promotion" }] : []),
        ...(hasPermission("communication:create") || privileged ? [{ icon: Megaphone, label: "Announcements" }] : []),
      ],
    },
    { label: "System", items: [{ icon: Settings, label: "Settings" }] },
  ].filter((section) => section.items.length);

  const organization = selectedScope?.organization?.name || "Your organization";
  const institution = selectedScope?.adminType?.replaceAll("_", " ") || "Heightt workspace";

  return <>
    {isOpen && (
      <button
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden border-0"
        onClick={onClose}
        aria-label="Close navigation"
      />
    )}

    <aside
      className={cn(
        "fixed lg:sticky top-0 left-0 h-screen z-50 w-[260px] bg-gradient-to-b from-[#0B1020] to-[#0f1629] text-white flex flex-col flex-shrink-0 transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo Header */}
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <Image
          src="/heightt-logo.png"
          alt="Heightt"
          width={116}
          height={65}
          className="w-[116px] h-auto brightness-0 invert"
          priority
        />
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg bg-white/5 hover:bg-white/10 border-0 text-slate-400 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Organization Card */}
      <div className="mx-4 mt-5 mb-4 px-4 py-3.5 border border-white/10 rounded-xl bg-white/[0.04] backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-[.14em] text-slate-500 mb-1.5 font-medium">
          Current organization
        </p>
        <p className="text-sm font-semibold text-white truncate">{organization}</p>
        <p className="text-xs text-slate-400 truncate mt-0.5">{institution}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.label} className="mb-6">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[.15em] text-slate-500">
              {section.label}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = activeNav === item.label;
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      onNavChange(item.label);
                      onClose();
                    }}
                    className={cn(
                      "relative w-full h-10 px-3 flex items-center gap-3 rounded-lg border-0 text-sm font-medium cursor-pointer transition-all duration-200",
                      active
                        ? "bg-blue-500/15 text-white shadow-sm"
                        : "bg-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200"
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 w-[3px] h-5 bg-blue-500 rounded-r-full" />
                    )}
                    <Icon
                      className={cn(
                        "w-[18px] h-[18px] flex-shrink-0",
                        active ? "text-blue-400" : "text-slate-500"
                      )}
                    />
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight className="w-3.5 h-3.5 text-blue-400/60" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign Out */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <button
          onClick={() => logoutMutation.mutateAsync()}
          disabled={logoutMutation.isPending}
          className="w-full h-10 px-3 flex items-center gap-3 rounded-lg border-0 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white text-sm cursor-pointer transition-colors disabled:opacity-50"
        >
          <LogOut className="w-[18px] h-[18px]" />
          <span>{logoutMutation.isPending ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </aside>
  </>;
}
