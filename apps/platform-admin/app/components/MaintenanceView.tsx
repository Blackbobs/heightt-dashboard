"use client";

import React, { useState } from "react";
import {
  usePlatformMaintenance,
  useSetMaintenanceMode,
} from "@/hooks/platform/usePlatformMaintenance";
import {
  Wrench,
  Loader2,
  Power,
  PowerOff,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function MaintenanceView() {
  const { data: maintenance, isLoading, refetch } = usePlatformMaintenance();
  const setMaintenanceMutation = useSetMaintenanceMode();

  const [message, setMessage] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  const handleToggleMaintenance = async (enabled: boolean) => {
    try {
      await setMaintenanceMutation.mutateAsync({
        enabled,
        message: message || undefined,
        startsAt: startsAt || undefined,
        endsAt: endsAt || undefined,
      });
      refetch();
    } catch (error) {
      console.error("Failed to toggle maintenance mode:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  const isEnabled = maintenance?.enabled || false;

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-[#1a5cff]" />
            System Maintenance Control
          </h1>
          <p>
            Route: <code>/platform/maintenance</code> • Manage system
            availability and maintenance windows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Card */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Current Status</h2>
            <span
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold",
                isEnabled
                  ? "bg-red-50 text-red-600"
                  : "bg-emerald-50 text-emerald-600",
              )}
            >
              {isEnabled ? (
                <PowerOff className="w-4 h-4" />
              ) : (
                <Power className="w-4 h-4" />
              )}
              {isEnabled ? "Maintenance Mode" : "Operational"}
            </span>
          </div>

          {isEnabled && maintenance?.message && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mb-4">
              <p className="text-sm text-amber-800">{maintenance.message}</p>
            </div>
          )}

          <div className="space-y-3">
            {maintenance?.startsAt && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>
                  Starts: {new Date(maintenance.startsAt).toLocaleString()}
                </span>
              </div>
            )}
            {maintenance?.endsAt && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>
                  Ends: {new Date(maintenance.endsAt).toLocaleString()}
                </span>
              </div>
            )}
            <div className="text-xs text-slate-400">
              Last updated:{" "}
              {new Date(maintenance?.updatedAt || Date.now()).toLocaleString()}
            </div>
          </div>

          <div className="mt-6">
            <button
              className={cn(
                "w-full py-3 rounded-lg font-semibold text-white transition-all border-none cursor-pointer",
                isEnabled
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700",
              )}
              onClick={() => handleToggleMaintenance(!isEnabled)}
              disabled={setMaintenanceMutation.isPending}
            >
              {setMaintenanceMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : isEnabled ? (
                "Disable Maintenance Mode"
              ) : (
                "Enable Maintenance Mode"
              )}
            </button>
          </div>
        </div>

        {/* Settings Card */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">
            Maintenance Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Banner Message
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="System maintenance in progress..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isEnabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                disabled={isEnabled}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                End Time
              </label>
              <input
                type="datetime-local"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                disabled={isEnabled}
              />
            </div>

            <button
              className="w-full py-2.5 bg-slate-100 text-slate-600 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors border-none cursor-pointer"
              onClick={() => {
                setMessage(maintenance?.message || "");
                setStartsAt(maintenance?.startsAt?.split(".")[0] || "");
                setEndsAt(maintenance?.endsAt?.split(".")[0] || "");
              }}
              disabled={isEnabled}
            >
              Load Current Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
