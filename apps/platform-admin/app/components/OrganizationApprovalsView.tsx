"use client";

import { useState } from "react";
import { Check, Loader2, RefreshCw, X } from "lucide-react";
import {
  usePlatformApprovals,
  useReviewApproval,
} from "@/hooks/platform/usePlatformApprovals";
import { getApiErrorMessage } from "@/lib/api/error";
import type { ApprovalRequestDto, ApprovalStatus } from "@/lib/api/types";

const statuses: ApprovalStatus[] = ["PENDING", "APPROVED", "REJECTED"];

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export default function OrganizationApprovalsView() {
  const [status, setStatus] = useState<ApprovalStatus>("PENDING");
  const [rejecting, setRejecting] = useState<ApprovalRequestDto | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const approvals = usePlatformApprovals(status);
  const review = useReviewApproval();

  const submitReview = async (
    request: ApprovalRequestDto,
    decision: "APPROVED" | "REJECTED",
  ) => {
    setError("");
    try {
      await review.mutateAsync({
        approvalId: request.id,
        data:
          decision === "APPROVED"
            ? { status: "APPROVED" }
            : { status: "REJECTED", rejectionReason: reason.trim() },
      });
      setRejecting(null);
      setReason("");
    } catch (caught) {
      setError(getApiErrorMessage(caught, "Unable to review this request."));
    }
  };

  return (
    <div>
      <div className="page-head">
        <div className="title">
          <h1>Organization approvals</h1>
          <p>Review community organizations submitted by verified users.</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => approvals.refetch()}
          disabled={approvals.isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${approvals.isFetching ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="mb-5 flex gap-2 border-b border-slate-200">
        {statuses.map((item) => (
          <button
            key={item}
            className={`border-0 border-b-2 bg-transparent px-4 py-3 text-sm font-semibold ${
              status === item
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-500"
            }`}
            onClick={() => {
              setStatus(item);
              setError("");
            }}
          >
            {item[0] + item.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {error && (
        <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {approvals.isLoading ? (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
        </div>
      ) : approvals.isError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {getApiErrorMessage(approvals.error, "Unable to load approval requests.")}
        </div>
      ) : approvals.data?.length ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Organization</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Creator user ID</th>
                {status === "REJECTED" && <th className="px-4 py-3">Reason</th>}
                {status === "PENDING" && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {approvals.data.map((request) => (
                <tr key={request.id}>
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {request.entityName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                    {formatDate(request.createdAt)}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-slate-600">
                    {request.submittedBy}
                  </td>
                  {status === "REJECTED" && (
                    <td className="px-4 py-4 text-slate-600">
                      {request.rejectionReason || "No reason recorded"}
                    </td>
                  )}
                  {status === "PENDING" && (
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setRejecting(request);
                            setReason("");
                            setError("");
                          }}
                          disabled={review.isPending}
                        >
                          <X className="h-4 w-4" /> Reject
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => submitReview(request, "APPROVED")}
                          disabled={review.isPending}
                        >
                          <Check className="h-4 w-4" /> Approve
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
          No {status.toLowerCase()} organization requests.
        </div>
      )}

      {rejecting && (
        <div className="modal-overlay open" onClick={() => setRejecting(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Reject {rejecting.entityName}</h2>
              <button className="close-btn" onClick={() => setRejecting(null)} aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="form-label" htmlFor="rejection-reason">Rejection reason</label>
            <textarea
              id="rejection-reason"
              className="form-textarea"
              rows={4}
              minLength={3}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Explain why this organization could not be approved."
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setRejecting(null)}>Cancel</button>
              <button
                className="btn btn-danger"
                disabled={reason.trim().length < 3 || review.isPending}
                onClick={() => submitReview(rejecting, "REJECTED")}
              >
                {review.isPending ? "Rejecting..." : "Reject organization"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
