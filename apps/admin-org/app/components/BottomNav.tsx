"use client";

import {
  LayoutDashboard,
  Coins,
  HandCoins,
  Users,
  Megaphone,
  ChartLine,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", nav: "Dashboard" },
  { icon: Coins, label: "Dues", nav: "Dues" },
  { icon: Users, label: "Students", nav: "Students" },
  { icon: Megaphone, label: "Announce", nav: "Announcements" },
  { icon: Settings, label: "Settings", nav: "Settings" },
];

export function BottomNav({ activeNav, onNavChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-40 flex items-center justify-around lg:hidden shadow-lg"
      style={{
        borderColor: "var(--color-border)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingTop: "6px",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeNav === item.nav;
        const Icon = item.icon;

        return (
          <button
            key={item.nav}
            onClick={() => onNavChange(item.nav)}
            className="flex flex-col items-center justify-center gap-1 py-1 flex-1 border-none bg-transparent cursor-pointer transition-all duration-200 min-w-0"
            style={{
              color: isActive
                ? "var(--color-primary)"
                : "var(--color-muted-foreground)",
            }}
          >
            <div
              className={cn(
                "w-9 h-7 rounded-full flex items-center justify-center transition-all duration-200",
                isActive ? "bg-blue-50" : "",
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <span
              className={cn(
                "text-[10px] leading-none truncate w-full text-center px-1",
                isActive ? "font-bold text-blue-700" : "font-medium",
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
