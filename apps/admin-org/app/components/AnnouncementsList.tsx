"use client";

interface Announcement {
  id: string;
  title: string;
  time: string;
  status: "published" | "draft";
}

const announcements: Announcement[] = [
  { id: "1", title: "Departmental Meeting", time: "Today, 2:00 PM", status: "published" },
  { id: "2", title: "Lab Maintenance Schedule", time: "Yesterday, 10:30 AM", status: "published" },
  { id: "3", title: "Faculty Week Updates", time: "2 days ago", status: "draft" },
  { id: "4", title: "New Dues Structure", time: "3 days ago", status: "published" },
];

export default function AnnouncementsList() {
  return (
    <div
      className="bg-white border rounded-[var(--radius-card)] overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
          <i className="fas fa-bullhorn" style={{ color: "var(--color-muted-foreground)" }} />
          Announcements
        </h3>
        <button
          className="text-[13px] font-medium border-none bg-transparent cursor-pointer font-sans transition-all duration-200"
          style={{ color: "var(--color-primary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
        >
          View all
        </button>
      </div>

      {/* Announcements */}
      <div className="px-5 py-2">
        {announcements.map((ann, i) => (
          <div
            key={ann.id}
            className="py-3"
            style={{
              borderBottom: i < announcements.length - 1 ? `1px solid var(--color-border)` : "none",
            }}
          >
            <div className="text-sm font-semibold mb-1" style={{ color: "var(--color-foreground)" }}>
              {ann.title}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--color-muted-foreground)" }}>
                {ann.time}
              </span>
              <span
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                style={
                  ann.status === "published"
                    ? { background: "#DCFCE7", color: "var(--color-success)" }
                    : { background: "var(--color-muted)", color: "var(--color-muted-foreground)" }
                }
              >
                {ann.status === "published" ? "Published" : "Draft"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
