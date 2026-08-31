"use client";

import { useState } from "react";
import { GraduationCap, Loader2 } from "lucide-react";
import { usePlatformInstitutions } from "@/hooks/platform/usePlatformInstitutions";
import { InstitutionPromotionPanel } from "./InstitutionPromotionPanel";

export default function StudentPromotionView() {
  const [selectedInstitutionId, setSelectedInstitutionId] = useState("");
  const { data, isLoading, error } = usePlatformInstitutions({ limit: 100 });
  const institutions = data?.data || [];
  const institutionId = selectedInstitutionId || institutions[0]?.id || "";

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1a5cff]" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1 className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#1a5cff]" />
            Student Promotion
          </h1>
          <p>Advance an institution to its next academic session</p>
        </div>
      </div>

      <section className="mb-6 rounded-xl border bg-white p-5">
        <label htmlFor="promotion-institution" className="mb-1.5 block text-sm font-semibold text-slate-700">
          Institution
        </label>
        <select
          id="promotion-institution"
          className="form-select max-w-xl"
          value={institutionId}
          onChange={(event) => setSelectedInstitutionId(event.target.value)}
        >
          {institutions.length === 0 && <option value="">No institutions available</option>}
          {institutions.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </select>
        <p className="mt-2 text-xs text-slate-500">
          Select the institution whose current session and eligible students you want to advance.
        </p>
      </section>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Institutions could not be loaded. Refresh the page and try again.
        </p>
      ) : institutionId ? (
        <InstitutionPromotionPanel key={institutionId} institutionId={institutionId} />
      ) : (
        <div className="rounded-xl border bg-white p-5 text-sm text-slate-500">
          Create an institution before using student promotion.
        </div>
      )}
    </div>
  );
}
