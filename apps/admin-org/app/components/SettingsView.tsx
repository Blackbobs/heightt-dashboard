"use client";

import { Building2, Shield, User } from "lucide-react";
import { useAdminUser } from "@/hooks/admin/useAdminAuth";
import { useAdminContext } from "./AdminContext";
import { PageHeader } from "./OperationsUI";

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return <div className="py-3 border-b border-slate-100 last:border-0"><dt className="text-xs font-medium text-slate-500">{label}</dt><dd className="mt-1 text-sm font-semibold text-slate-900">{value}</dd></div>;
}

export function SettingsView() {
  const { data: user } = useAdminUser();
  const { selectedScope } = useAdminContext();
  const name = [user?.profile?.firstName, user?.profile?.lastName].filter(Boolean).join(" ");
  const role = selectedScope?.adminType?.replaceAll("_", " ");

  return <div className="operations-page max-w-5xl">
    <PageHeader eyebrow="System" title="Settings" description="Your account and current organization context." />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3"><User className="w-4 h-4 text-blue-600" /><div><h2 className="text-sm font-semibold text-slate-900">Account</h2><p className="text-xs text-slate-500 mt-0.5">Identity details provided by your administrator</p></div></div>
        <dl className="px-5"><Detail label="Name" value={name} /><Detail label="Email" value={user?.email} /><Detail label="Username" value={user?.username} /><Detail label="Phone" value={user?.profile?.phone} /></dl>
        {!name && !user?.email && <p className="px-5 py-8 text-sm text-slate-500">Account details are not available.</p>}
      </section>
      <section className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3"><Building2 className="w-4 h-4 text-blue-600" /><div><h2 className="text-sm font-semibold text-slate-900">Organization access</h2><p className="text-xs text-slate-500 mt-0.5">The scope currently selected in this workspace</p></div></div>
        <dl className="px-5"><Detail label="Organization" value={selectedScope?.organization?.name} /><Detail label="Access level" value={role} /><Detail label="Organization ID" value={selectedScope?.organizationId} /></dl>
        {!selectedScope && <p className="px-5 py-8 text-sm text-slate-500">No organization scope is selected.</p>}
      </section>
    </div>
    <div className="mt-5 flex items-start gap-3 border border-slate-200 rounded-lg bg-white p-4"><Shield className="w-4 h-4 text-slate-500 mt-0.5" /><div><p className="text-sm font-semibold text-slate-900">Account changes</p><p className="text-xs leading-5 text-slate-500 mt-0.5">Contact your platform administrator to update account, security, or organization access details.</p></div></div>
  </div>;
}
