"use client";

interface BottomNavProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
}

const navItems = [
  { icon: "fas fa-chart-pie", label: "Home", nav: "Dashboard" },
  { icon: "fas fa-coins", label: "Dues", nav: "Dues" },
  { icon: "fas fa-users", label: "Students", nav: "Students" },
  { icon: "fas fa-bullhorn", label: "Announce", nav: "Announcements" },
  { icon: "fas fa-gear", label: "Settings", nav: "Settings" },
];

export default function BottomNav({ activeNav, onNavChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t z-[100] flex items-center justify-around lg:hidden shadow-lg"
      style={{
        borderColor: "var(--color-border)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
        paddingTop: "6px",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeNav === item.nav;
        return (
          <button
            key={item.nav}
            onClick={() => onNavChange(item.nav)}
            className="flex flex-col items-center justify-center gap-1 py-1 flex-1 border-none bg-transparent cursor-pointer font-sans transition-all duration-200 min-w-0"
            style={{
              color: isActive ? "var(--color-primary)" : "var(--color-muted-foreground)",
            }}
          >
            <div
              className={`w-9 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
                isActive ? "bg-blue-50" : ""
              }`}
            >
              <i className={`${item.icon} text-base`} />
            </div>
            <span
              className={`text-[10px] leading-none truncate w-full text-center px-1 ${
                isActive ? "font-bold text-blue-700" : "font-medium"
              }`}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
