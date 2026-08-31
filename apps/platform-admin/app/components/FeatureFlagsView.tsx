"use client";

import React, { useState } from "react";
import {
  usePlatformFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useDeleteFeatureFlag,
} from "@/hooks/platform/usePlatformFeatureFlags";
import * as Lucide from "lucide-react";

const { Loader2, Plus, Edit2, Trash2, Power, PowerOff } = Lucide as any;
import { cn } from "@/lib/utils";

export default function FeatureFlagsView() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    key: "",
    name: "",
    description: "",
    enabled: false,
    percentage: 100,
  });

  const { data: flags, isLoading, refetch } = usePlatformFeatureFlags();
  const createMutation = useCreateFeatureFlag();
  const updateMutation = useUpdateFeatureFlag();
  const deleteMutation = useDeleteFeatureFlag();

  const featureFlags = flags || [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setIsModalOpen(false);
      setFormData({
        key: "",
        name: "",
        description: "",
        enabled: false,
        percentage: 100,
      });
      refetch();
    } catch (error) {
      console.error("Failed to create feature flag:", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFlag) return;
    try {
      await updateMutation.mutateAsync({
        id: editingFlag.id,
        data: {
          name: formData.name,
          description: formData.description,
          enabled: formData.enabled,
          percentage: formData.percentage,
        },
      });
      setIsModalOpen(false);
      setEditingFlag(null);
      setFormData({
        key: "",
        name: "",
        description: "",
        enabled: false,
        percentage: 100,
      });
      refetch();
    } catch (error) {
      console.error("Failed to update feature flag:", error);
    }
  };

  const handleToggle = async (id: string, currentState: boolean) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: { enabled: !currentState },
      });
      refetch();
    } catch (error) {
      console.error("Failed to toggle feature flag:", error);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (error) {
        console.error("Failed to delete feature flag:", error);
      }
    }
  };

  const handleEdit = (flag: any) => {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description || "",
      enabled: flag.enabled,
      percentage: flag.percentage || 100,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <Lucide.Flag className="w-6 h-6 text-[#1a5cff]" />
            Feature Flags Control
          </h1>
          <p>
            Route: <code>/platform/feature-flags</code> • Enable or disable
            platform features dynamically
          </p>
        </div>
        <div className="actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingFlag(null);
              setFormData({
                key: "",
                name: "",
                description: "",
                enabled: false,
                percentage: 100,
              });
              setIsModalOpen(true);
            }}
          >
            <Lucide.Plus className="w-4 h-4" /> Create Feature Flag
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {featureFlags.length === 0 ? (
          <div className="col-span-2 card p-10 text-center text-slate-400">
            <Lucide.Flag className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">No feature flags created yet</p>
          </div>
        ) : (
          featureFlags.map((flag) => (
            <div key={flag.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm font-bold text-slate-900">
                      {flag.name}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {flag.key}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">
                    {flag.description || "No description"}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span>Percentage: {flag.percentage}%</span>
                    <span>•</span>
                    <span>
                      Updated: {new Date(flag.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <button
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all",
                      flag.enabled
                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                    onClick={() => handleToggle(flag.id, flag.enabled)}
                  >
                    {flag.enabled ? (
                      <Lucide.Power className="w-3.5 h-3.5" />
                    ) : (
                      <Lucide.PowerOff className="w-3.5 h-3.5" />
                    )}
                    {flag.enabled ? "ON" : "OFF"}
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                      onClick={() => handleEdit(flag)}
                      title="Edit"
                    >
                      <Lucide.Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                      onClick={() => handleDelete(flag.id, flag.name)}
                      title="Delete"
                    >
                      <Lucide.Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay open"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingFlag ? "Edit Feature Flag" : "Create Feature Flag"}
              </h2>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <Lucide.Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={editingFlag ? handleUpdate : handleCreate}>
              <div className="form-group">
                <label className="form-label">Key *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. NEW_DASHBOARD"
                  value={formData.key}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      key: e.target.value.toUpperCase().replace(/\s/g, "_"),
                    })
                  }
                  disabled={!!editingFlag}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. New Dashboard UI"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Feature description..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Enabled</label>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer",
                        formData.enabled
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-200 text-slate-500",
                      )}
                      onClick={() =>
                        setFormData({ ...formData, enabled: true })
                      }
                    >
                      ON
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all border-none cursor-pointer",
                        !formData.enabled
                          ? "bg-slate-600 text-white"
                          : "bg-slate-200 text-slate-500",
                      )}
                      onClick={() =>
                        setFormData({ ...formData, enabled: false })
                      }
                    >
                      OFF
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Percentage</label>
                  <input
                    type="number"
                    className="form-input"
                    min="0"
                    max="100"
                    value={formData.percentage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        percentage: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingFlag
                      ? "Update Feature Flag"
                      : "Create Feature Flag"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
