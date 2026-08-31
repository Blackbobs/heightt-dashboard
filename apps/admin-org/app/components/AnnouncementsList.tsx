// apps/admin-org/components/AnnouncementsList.tsx
"use client";

import { useAdminContext } from "./AdminContext";
import { useAdminAnnouncements } from "@/hooks/admin/useAdminAnnouncements";
import { Megaphone, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AnnouncementsList() {
  const { selectedScope } = useAdminContext();
  const organizationId = selectedScope?.organizationId || "";

  const { data, isLoading } = useAdminAnnouncements({
    organizationId,
    limit: 5,
    isPublished: true,
  });

  if (isLoading) {
    return (
      <div
        className="bg-white border rounded-xl p-5"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#1a5cff] animate-spin" />
        </div>
      </div>
    );
  }

  const announcements = data?.data || [];

  return (
    <div
      className="bg-white border rounded-xl overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-base font-semibold flex items-center gap-2 text-slate-900">
          <Megaphone className="w-4 h-4 text-slate-400" />
          Announcements
        </h3>
        <button className="text-sm font-medium border-none bg-transparent cursor-pointer text-[#1a5cff] hover:underline">
          View all
        </button>
      </div>

      <div className="px-5 py-2">
        {announcements.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400">
            No announcements found
          </div>
        ) : (
          announcements.map((ann: any, i: number) => (
            <div
              key={ann.id}
              className="py-3"
              style={{
                borderBottom:
                  i < announcements.length - 1
                    ? "1px solid var(--color-border)"
                    : "none",
              }}
            >
              <div className="text-sm font-semibold text-slate-900 mb-1">
                {ann.title}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400">
                  {ann.publishedAt
                    ? new Date(ann.publishedAt).toLocaleDateString()
                    : "Draft"}
                </span>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2.5 py-0.5 rounded-full",
                    ann.isPublished
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {ann.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}