"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { usePlatformAcademicSessions, usePromoteInstitution } from "@/hooks/platform/usePlatformAcademicSessions";
import type { InstitutionPromotionResult } from "@/lib/api/types";

type ApiError = { response?: { status?: number; data?: { message?: string } } };

export function InstitutionPromotionPanel({ institutionId }: { institutionId: string }) {
  const { data: sessions = [], isLoading, error, refetch } = usePlatformAcademicSessions(institutionId);
  const promotion = usePromoteInstitution();
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<InstitutionPromotionResult | null>(null);
  const current = sessions.find((session) => session.scope === "INSTITUTION" && session.isCurrent);

  const submit = async () => {
    if (!current || !confirmed || promotion.isPending) return;
    try {
      const value = await promotion.mutateAsync({ institutionId, currentSessionId: current.id, notes });
      setResult(value);
      setConfirmed(false);
    } catch (caught: unknown) {
      if ((caught as ApiError)?.response?.status === 400) {
        setConfirmed(false);
        await refetch();
      }
    }
  };

  if (!institutionId) return null;
  if (isLoading) return <div className="rounded-xl border bg-white p-5 text-sm text-slate-500"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading current institution session…</div>;
  if (result) return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5" aria-labelledby="promotion-complete">
      <div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 className="h-5 w-5" /><h2 id="promotion-complete" className="font-bold">Promotion completed</h2></div>
      <p className="mt-2 text-sm text-slate-700">{result.previousSession.name} advanced to {result.currentSession.name}. {result.currentSession.generated ? "The new session was created automatically." : "The existing session was activated."}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(result.summary).map(([label, value]) => <div key={label} className="rounded-lg bg-white p-3"><div className="text-xl font-bold text-slate-900">{value}</div><div className="text-xs capitalize text-slate-500">{label}</div></div>)}</div>
    </section>
  );

  const apiError = (promotion.error || error) as ApiError | null;
  const status = apiError?.response?.status;
  const message = status === 403 ? "You do not have permission to promote this institution." : status === 404 ? "This institution no longer exists." : status === 400 ? "The session changed or has an invalid name. The current session has been refreshed; review it and confirm again." : apiError ? (apiError?.response?.data?.message || "Institution promotion could not be completed.") : "";
  return (
    <section className="rounded-xl border border-amber-200 bg-white p-5" aria-labelledby="promotion-title">
      <div className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-amber-600" /><h2 id="promotion-title" className="font-bold text-slate-900">Promote institution</h2></div>
      {!current ? <p className="mt-3 text-sm text-slate-500">No current institution-level academic session was found.</p> : <>
        <p className="mt-3 text-sm text-slate-700">Current session: <strong>{current.name}</strong></p>
        <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>This advances every eligible student, graduates final-level students, and changes the institution’s current session. It cannot be partially applied.</p></div>
        <label className="mt-4 block text-xs font-semibold text-slate-700">Notes (optional)<textarea className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal" value={notes} onChange={(event) => setNotes(event.target.value)} disabled={promotion.isPending} /></label>
        <label className="mt-3 flex items-start gap-2 text-sm text-slate-700"><input className="mt-1" type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} disabled={promotion.isPending} />I understand this action applies to the whole institution.</label>
        <button type="button" onClick={submit} disabled={!confirmed || promotion.isPending} className="btn btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-50">{promotion.isPending && <Loader2 className="h-4 w-4 animate-spin" />}{promotion.isPending ? "Promoting institution…" : "Promote institution"}</button>
      </>}
      {message && <p role="alert" className="mt-3 text-sm text-red-600">{message}</p>}
    </section>
  );
}
