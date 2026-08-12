"use client";

interface SidebarProps {
  activeNav: string;
  onNavChange: (nav: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navSections = [
  {
    label: "Overview",
    items: [{ icon: "fas fa-chart-pie", label: "Dashboard" }],
  },
  {
    label: "Management",
    items: [
      { icon: "fas fa-coins", label: "Dues", badge: "3" },
      { icon: "fas fa-hand-holding-dollar", label: "Payments" },
      { icon: "fas fa-users", label: "Students", badge: "1.2k" },
      { icon: "fas fa-bullhorn", label: "Announcements", badge: "2" },
    ],
  },
  {
    label: "Finance",
    items: [{ icon: "fas fa-chart-line", label: "Finance" }],
  },
  {
    label: "Settings",
    items: [{ icon: "fas fa-gear", label: "Settings" }],
  },
];

export default function Sidebar({ activeNav, onNavChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[99] lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={[
          "fixed lg:sticky top-0 left-0 h-screen z-[100] w-[260px] lg:w-[240px] bg-white border-r flex flex-col flex-shrink-0 overflow-y-auto transition-transform duration-300 ease-out shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Brand Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <a href="#" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 no-underline">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base shadow-sm"
              style={{ background: "var(--color-primary)" }}
            >
              <i className="fas fa-building-columns" />
            </div>
            <span>Heightt Admin</span>
          </a>

          {/* Close button for Mobile */}
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-full border-none bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer flex items-center justify-center text-sm"
            aria-label="Close sidebar"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <div
                className="text-[10px] font-bold uppercase tracking-wider px-3 mb-1.5"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {section.label}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = activeNav === item.label;
                  return (
                    <button
                      key={item.label}
                      onClick={() => {
                        onNavChange(item.label);
                        onClose();
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left border-none cursor-pointer font-sans transition-all duration-150 ${
                        isActive
                          ? "font-semibold bg-blue-50 text-blue-700 shadow-xs"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <i className={`${item.icon} w-5 text-center text-base flex-shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                            isActive ? "bg-blue-600" : "bg-slate-400"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="p-3 border-t bg-slate-50/50"
          style={{ borderColor: "var(--color-border)" }}
        >
          <button
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left border-none cursor-pointer font-sans transition-colors text-slate-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => alert("Logged out successfully")}
          >
            <i className="fas fa-right-from-bracket w-5 text-center text-base flex-shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
