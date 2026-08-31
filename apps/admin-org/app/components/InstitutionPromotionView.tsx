"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, GraduationCap, Loader2 } from "lucide-react";
import { useInstitutionPromotion, useInstitutionSessions } from "@/hooks/admin/useInstitutionPromotion";
import type { InstitutionPromotionResult } from "@/lib/api/admin";

export function InstitutionPromotionView({ institutionId }: { institutionId: string }) {
  const sessions = useInstitutionSessions(institutionId);
  const promotion = useInstitutionPromotion();
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<InstitutionPromotionResult | null>(null);
  const current = sessions.data?.find((item) => item.scope === "INSTITUTION" && item.isCurrent);
  const apiError = (promotion.error || sessions.error) as { response?: { status?: number; data?: { message?: string } } } | null;
  const status = apiError?.response?.status;
  const errorMessage = status === 403 ? "You do not have student promotion permission for this institution." : status === 404 ? "This institution no longer exists." : status === 400 ? "The session changed or is invalid. It has been refreshed; review and confirm again." : apiError ? apiError.response?.data?.message || "Institution promotion could not be completed." : "";

  const submit = async () => {
    if (!current || !confirmed || promotion.isPending) return;
    try {
      setResult(await promotion.mutateAsync({ institutionId, currentSessionId: current.id, notes }));
      setConfirmed(false);
    } catch (error) {
      const statusCode = (error as { response?: { status?: number } }).response?.status;
      if (statusCode === 400) {
        setConfirmed(false);
        await sessions.refetch();
      }
    }
  };

  if (sessions.isLoading) return <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-blue-600" /></div>;
  if (result) return <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6"><div className="flex items-center gap-2 text-emerald-700"><CheckCircle2 /><h2 className="text-lg font-bold">Promotion completed</h2></div><p className="mt-2 text-sm text-slate-700">{result.previousSession.name} advanced to {result.currentSession.name}. {result.currentSession.generated ? "A new session was created." : "The existing next session was activated."}</p><div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">{Object.entries(result.summary).map(([key, value]) => <div key={key} className="rounded-lg bg-white p-4"><strong className="block text-2xl">{value}</strong><span className="text-xs capitalize text-slate-500">{key}</span></div>)}</div></section>;
  return <section className="rounded-xl border bg-white p-6"><div className="flex items-center gap-2"><GraduationCap className="text-blue-600" /><h2 className="text-lg font-bold">Promote institution</h2></div>{current ? <><p className="mt-3 text-sm">Current session: <strong>{current.name}</strong></p><div className="mt-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" />All eligible students will advance, final-level students will graduate, and the current academic session will change atomically.</div><label className="mt-4 block text-sm font-semibold">Notes (optional)<textarea className="mt-2 w-full rounded-lg border p-3 font-normal" value={notes} onChange={(event) => setNotes(event.target.value)} /></label><label className="mt-4 flex gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />I understand this applies to the whole institution.</label><button className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50" disabled={!confirmed || promotion.isPending} onClick={submit}>{promotion.isPending ? "Promoting institution…" : "Promote institution"}</button></> : <p className="mt-3 text-sm text-slate-500">No current institution-level academic session was found.</p>}{errorMessage && <p role="alert" className="mt-3 text-sm text-red-600">{errorMessage}</p>}</section>;
}
