"use client";

import { useState } from "react";
import { Building2, Shield, User, UserPlus } from "lucide-react";
import { useAdminUser } from "@/hooks/admin/useAdminAuth";
import { useAppointOrganizationAdmin } from "@/hooks/admin/useAdminOrganizations";
import {
  getApiErrorMessage,
  getErrorStatusCode,
} from "@/lib/api/error";
import { useAdminContext } from "./AdminContext";
import { PageHeader } from "./OperationsUI";

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

export function SettingsView() {
  const { data: user } = useAdminUser();
  const { selectedScope, hasPermission } = useAdminContext();
  const appointAdmin = useAppointOrganizationAdmin();
  const [userId, setUserId] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const name = [user?.profile?.firstName, user?.profile?.lastName]
    .filter(Boolean)
    .join(" ");
  const role = selectedScope?.adminType?.replaceAll("_", " ");
  const isActiveOrganization = selectedScope?.organization?.status === "ACTIVE";
  const canManageAdmins =
    selectedScope?.adminType === "ORGANIZATION_ADMIN" &&
    hasPermission("organization:manage") &&
    isActiveOrganization;

  const handleAppoint = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedScope?.organizationId || !userId.trim()) return;
    setMessage(null);
    try {
      await appointAdmin.mutateAsync({
        organizationId: selectedScope.organizationId,
        userId: userId.trim(),
      });
      setUserId("");
      setMessage({
        type: "success",
        text: "The user is now an organization administrator.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          getErrorStatusCode(error) === 409
            ? "This user is already an organization administrator."
            : getApiErrorMessage(error, "Unable to appoint this administrator."),
      });
    }
  };

  return (
    <div className="operations-page max-w-5xl">
      <PageHeader
        title="Settings"
        description="Manage your account and current organization context."
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <User className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Account</h2>
              <p className="mt-0.5 text-xs text-slate-500">Identity details provided by your administrator</p>
            </div>
          </div>
          <dl className="px-5">
            <Detail label="Name" value={name} />
            <Detail label="Email" value={user?.email} />
            <Detail label="Username" value={user?.username} />
            <Detail label="Phone" value={user?.profile?.phone} />
          </dl>
          {!name && !user?.email && <p className="px-5 py-8 text-sm text-slate-500">Account details are not available.</p>}
        </section>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
            <Building2 className="h-4 w-4 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Organization access</h2>
              <p className="mt-0.5 text-xs text-slate-500">The scope currently selected in this workspace</p>
            </div>
          </div>
          <dl className="px-5">
            <Detail label="Organization" value={selectedScope?.organization?.name} />
            <Detail label="Access level" value={role} />
            <Detail label="Organization ID" value={selectedScope?.organizationId} />
          </dl>
          {!selectedScope && <p className="px-5 py-8 text-sm text-slate-500">No organization scope is selected.</p>}
        </section>
      </div>

      {canManageAdmins && (
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-start gap-3">
            <UserPlus className="mt-0.5 h-5 w-5 text-blue-600" />
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Administrators</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">Appoint another Heightt user to manage this organization.</p>
            </div>
          </div>
          <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleAppoint}>
            <div className="flex-1">
              <label className="form-label" htmlFor="administrator-user-id">Heightt user ID</label>
              <input
                id="administrator-user-id"
                className="form-input"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Enter the user's ID"
                required
              />
            </div>
            <button className="btn btn-primary self-end" disabled={appointAdmin.isPending || !userId.trim()}>
              {appointAdmin.isPending ? "Appointing..." : "Appoint administrator"}
            </button>
          </form>
          {message && (
            <p role="status" className={`mt-3 text-sm ${message.type === "success" ? "text-emerald-700" : "text-red-700"}`}>
              {message.text}
            </p>
          )}
        </section>
      )}

      <div className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <Shield className="mt-0.5 h-4 w-4 text-slate-500" />
        <div>
          <p className="text-sm font-semibold text-slate-900">Account changes</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">Contact your platform administrator to update account, security, or organization access details.</p>
        </div>
      </div>
    </div>
  );
}
