"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useInstitutionPromotion, useInstitutionSessions } from "@/hooks/admin/useInstitutionPromotion";
import type { InstitutionPromotionResult } from "@/lib/api/admin";
import { PageHeader, PageLoader } from "./OperationsUI";

export function InstitutionPromotionView({ institutionId }: { institutionId: string }) {
  const sessions = useInstitutionSessions(institutionId);
  const promotion = useInstitutionPromotion();
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<InstitutionPromotionResult | null>(null);
  const current = sessions.data?.find(item => item.scope === "INSTITUTION" && item.isCurrent);
  const apiError = (promotion.error || sessions.error) as { response?: { status?: number; data?: { message?: string } } } | null;
  const status = apiError?.response?.status;
  const errorMessage = status === 403 ? "You do not have student promotion permission for this institution." : status === 404 ? "This institution no longer exists." : status === 400 ? "The session changed or is invalid. Review the refreshed session and confirm again." : apiError ? apiError.response?.data?.message || "Institution promotion could not be completed." : "";

  async function submit() {
    if (!current || !confirmed || promotion.isPending) return;
    try { setResult(await promotion.mutateAsync({ institutionId, currentSessionId: current.id, notes })); setConfirmed(false); }
    catch (error) { if ((error as { response?: { status?: number } }).response?.status === 400) { setConfirmed(false); await sessions.refetch(); } }
  }

  if (sessions.isLoading && !sessions.data) return <PageLoader label="Loading academic session…" />;
  return <div className="operations-page max-w-5xl">
    <PageHeader eyebrow="Management" title="Student promotion" description="Advance eligible students and transition the institution’s academic session." />
    {result ? <section className="operations-surface">
      <div className="border-b border-emerald-200 bg-emerald-50 px-6 py-5 flex gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><div><h2 className="text-sm font-semibold text-emerald-900">Promotion completed</h2><p className="text-sm text-emerald-800 mt-1">{result.previousSession.name} advanced to {result.currentSession.name}. {result.currentSession.generated ? "A new session was created." : "The existing next session was activated."}</p></div></div>
      <div className="operations-stats grid grid-cols-2 md:grid-cols-4 m-5">{Object.entries(result.summary).map(([key,value]) => <div key={key}><div className="text-xs capitalize text-slate-500">{key}</div><div className="text-2xl font-bold text-slate-950">{value}</div></div>)}</div>
    </section> : <section className="operations-surface">
      <div className="px-6 py-5 border-b border-slate-200"><h2 className="text-sm font-semibold text-slate-900">Promotion run</h2><p className="text-xs text-slate-500 mt-1">This action changes records across the entire institution.</p></div>
      <div className="p-6">{current ? <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden"><div className="bg-white p-4"><p className="text-xs text-slate-500">Current academic session</p><p className="text-base font-semibold text-slate-950 mt-1">{current.name}</p></div><div className="bg-white p-4"><p className="text-xs text-slate-500">Scope</p><p className="text-base font-semibold text-slate-950 mt-1">Entire institution</p></div></div>
        <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-5 text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" /><p>Eligible students will advance, final-level students will graduate, and the current academic session will change atomically.</p></div>
        <label className="block text-xs font-semibold text-slate-700">Administrative notes <span className="font-normal text-slate-400">(optional)</span><textarea className="mt-2 min-h-24 w-full rounded-md border border-slate-300 p-3 text-sm font-normal outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10" value={notes} onChange={event => setNotes(event.target.value)} /></label>
        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-4 text-sm text-slate-700"><input className="mt-0.5 h-4 w-4 accent-blue-600" type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /><span><strong className="block text-slate-900">Confirm institution-wide promotion</strong><span className="text-xs text-slate-500">I understand that this updates all eligible student records.</span></span></label>
        <div className="flex justify-end border-t border-slate-200 pt-5"><button className="operations-primary flex items-center gap-2 disabled:opacity-50" disabled={!confirmed || promotion.isPending} onClick={submit}>{promotion.isPending && <Loader2 className="w-4 h-4 animate-spin" />} {promotion.isPending ? "Promoting students…" : "Run promotion"}</button></div>
      </div> : <p className="text-sm text-slate-500">No current institution-level academic session was found.</p>}{errorMessage && <p role="alert" className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{errorMessage}</p>}</div>
    </section>}
  </div>;
}
