"use client";
import { LayoutDashboard, Coins, HandCoins, Users, Megaphone, ChartLine, Settings, LogOut, X, Wallet, ArrowUpRight, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminLogout } from "@/hooks/admin/useAdminAuth";
import { useAdminContext } from "./AdminContext";
import Image from "next/image";

interface SidebarProps { activeNav: string; onNavChange: (nav: string) => void; isOpen: boolean; onClose: () => void; isFacultyAdmin?: boolean; isInstitutionAdmin?: boolean; isDepartmentAdmin?: boolean; isOrganizationAdmin?: boolean; isPlatformAdmin?: boolean; hasPermission?: (permission: string) => boolean; }

export function Sidebar({ activeNav, onNavChange, isOpen, onClose, isFacultyAdmin = false, isInstitutionAdmin = false, isDepartmentAdmin = false, isOrganizationAdmin = false, isPlatformAdmin = false, hasPermission = () => false }: SidebarProps) {
  const logoutMutation = useAdminLogout();
  const { selectedScope } = useAdminContext();
  const privileged = isFacultyAdmin || isInstitutionAdmin || isDepartmentAdmin || isOrganizationAdmin || isPlatformAdmin;
  const canFinance = hasPermission("finance:read") || privileged;
  const sections = [
    { label: "Overview", items: [{ icon: LayoutDashboard, label: "Dashboard" }] },
    { label: "Finance", items: [...(hasPermission("finance:create") || privileged ? [{ icon: Coins, label: "Dues" }] : []), { icon: HandCoins, label: "Payments" }, ...(canFinance ? [{ icon: ChartLine, label: "Finance" }, { icon: ArrowUpRight, label: "Withdrawals" }, { icon: Wallet, label: "Bank Accounts" }] : [])] },
    { label: "Management", items: [...(hasPermission("student:read") || privileged ? [{ icon: Users, label: "Students" }] : []), ...(isInstitutionAdmin ? [{ icon: GraduationCap, label: "Promotion" }] : []), ...(hasPermission("communication:create") || privileged ? [{ icon: Megaphone, label: "Announcements" }] : [])] },
    { label: "System", items: [{ icon: Settings, label: "Settings" }] },
  ].filter((section) => section.items.length);
  const organization = selectedScope?.organization?.name || "Your organization";
  const institution = selectedScope?.adminType?.replaceAll("_", " ") || "Heightt workspace";
  return <>
    {isOpen && <button className="fixed inset-0 bg-black/50 z-40 lg:hidden border-0" onClick={onClose} aria-label="Close navigation" />}
    <aside className={cn("fixed lg:sticky top-0 left-0 h-screen z-50 w-[252px] bg-[#0B1020] text-white flex flex-col flex-shrink-0 transition-transform duration-200", isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
      <div className="h-16 px-5 border-b border-white/10 flex items-center justify-between"><Image src="/heightt-logo.png" alt="Heightt" width={116} height={65} className="w-[116px] h-auto brightness-0 invert" priority /><button onClick={onClose} className="lg:hidden bg-transparent border-0 text-slate-400 p-1"><X className="w-5 h-5" /></button></div>
      <div className="mx-4 my-4 px-3 py-3 border border-white/10 rounded-lg bg-white/[0.035]"><p className="text-[11px] uppercase tracking-[.12em] text-slate-500 mb-1">Current organization</p><p className="text-sm font-semibold text-white truncate">{organization}</p><p className="text-xs text-slate-400 truncate mt-0.5">{institution}</p></div>
      <nav className="flex-1 px-3 pb-4 overflow-y-auto">{sections.map(section => <div key={section.label} className="mb-5"><p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-[.14em] text-slate-500">{section.label}</p><div className="space-y-0.5">{section.items.map(item => { const Icon = item.icon; const active = activeNav === item.label; return <button key={item.label} onClick={() => { onNavChange(item.label); onClose(); }} className={cn("relative w-full h-10 px-3 flex items-center gap-3 rounded-md border-0 text-sm font-medium cursor-pointer transition-colors", active ? "bg-blue-500/15 text-white" : "bg-transparent text-slate-400 hover:bg-white/[0.055] hover:text-slate-200")}>{active && <span className="absolute left-0 w-0.5 h-5 bg-[#3B82F6] rounded-r" />}<Icon className={cn("w-[17px] h-[17px]", active ? "text-blue-400" : "text-slate-500")} />{item.label}</button>})}</div></div>)}</nav>
      <div className="p-3 border-t border-white/10"><button onClick={() => logoutMutation.mutateAsync()} disabled={logoutMutation.isPending} className="w-full h-10 px-3 flex items-center gap-3 rounded-md border-0 bg-transparent text-slate-400 hover:bg-white/5 hover:text-white text-sm cursor-pointer"><LogOut className="w-[17px] h-[17px]" />{logoutMutation.isPending ? "Signing out…" : "Sign out"}</button></div>
    </aside>
  </>;
}
