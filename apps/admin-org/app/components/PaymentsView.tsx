"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  useAdminPaymentHistory,
  useAdminPaymentOfferings,
  useCreatePaymentOffering,
} from "@/hooks/admin/useAdminFinance";
import {
  PaymentHistoryRecord,
  PaymentHistoryStatus,
  type CreatePaymentOfferingInput,
} from "@/lib/api/admin";
import {
  Search,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
} from "lucide-react";
import { cn, formatKoboCurrency } from "@/lib/utils";
import { useAdminContext } from "./AdminContext";
import { PageHeader } from "./OperationsUI";
import { adminApi } from "@/lib/api/admin";
import { downloadAxiosBlob } from "@/lib/download";
import { getApiErrorMessage } from "@/lib/api/error";

const ITEMS_PER_PAGE = 10;

const STATUS_COLORS: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  ISSUED: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Issued",
  },
  VOIDED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Voided",
  },
  CANCELLED: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Cancelled",
  },
  PENDING: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    dot: "bg-amber-500",
    label: "Pending",
  },
  PROCESSING: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    dot: "bg-blue-500",
    label: "Processing",
  },
  COMPLETED: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
    label: "Completed",
  },
  FAILED: {
    bg: "bg-red-50",
    text: "text-red-600",
    dot: "bg-red-500",
    label: "Failed",
  },
  EXPIRED: {
    bg: "bg-slate-100",
    text: "text-slate-500",
    dot: "bg-slate-400",
    label: "Expired",
  },
};

export function PaymentsView() {
  const { selectedScope, hasPermission } = useAdminContext();
  const [isCreateOfferingOpen, setIsCreateOfferingOpen] = useState(false);
  const [offeringName, setOfferingName] = useState("");
  const [offeringDescription, setOfferingDescription] = useState("");
  const [offeringAmount, setOfferingAmount] = useState("");
  const [offeringError, setOfferingError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentHistoryStatus | "">(
    "",
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [payerId, setPayerId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const offeringsQuery = useAdminPaymentOfferings({
    organizationId: selectedScope?.organizationId || "",
    page: 1,
    limit: 100,
  });
  const createOfferingMutation = useCreatePaymentOffering();

  const handleCreateOffering = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const amount = Math.round(Number(offeringAmount) * 100);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      setOfferingError("Enter a valid amount.");
      return;
    }
    if (!selectedScope?.organizationId) {
      setOfferingError("Select an organization first.");
      return;
    }
    setOfferingError("");
    const input: CreatePaymentOfferingInput = {
      organizationId: selectedScope.organizationId,
      name: offeringName.trim(),
      description: offeringDescription.trim() || undefined,
      amount,
      status: "ACTIVE",
    };
    try {
      await createOfferingMutation.mutateAsync(input);
      setOfferingName("");
      setOfferingDescription("");
      setOfferingAmount("");
      setIsCreateOfferingOpen(false);
    } catch (error) {
      setOfferingError(
        getApiErrorMessage(error, "The payment could not be created."),
      );
    }
  };

  const handleExport = async () => {
    if (!selectedScope?.organizationId) return;
    setIsExporting(true);
    try {
      const response = await adminApi.exportPaymentsCsv({
        organizationId: selectedScope.organizationId,
        status: statusFilter || undefined,
        payerId: payerId.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      downloadAxiosBlob(
        response,
        `payments-${new Date().toISOString().slice(0, 10)}.csv`,
      );
    } catch (error) {
      alert(
        getApiErrorMessage(error, "The payment report could not be exported."),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isLoading } = useAdminPaymentHistory({
    page: currentPage,
    limit: ITEMS_PER_PAGE,
    status: statusFilter || undefined,
    organizationId: selectedScope?.organizationId,
  });

  const payments = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;
  const filteredPayments = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return payments.filter((payment) =>
      !query
        ? true
        : [
            payment.reference,
            payment.transaction?.reference,
            payment.receipt?.receiptNumber,
            payment.receipt?.reference,
            payment.payer?.email,
            payment.payer?.username,
            payment.payer?.profile?.firstName,
            payment.payer?.profile?.lastName,
            payment.metadata?.guestName,
            payment.metadata?.guestEmail,
            payment.metadata?.guestPhone,
            payment.metadata?.guestMatricNumber,
            payment.organization?.name,
            payment.duePayment?.assignment?.due?.name,
            payment.paymentOffering?.name,
          ].some((value) => value?.toLocaleLowerCase().includes(query)),
    );
  }, [payments, search]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    return STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  };

  const formatDate = (date?: string) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading payments...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="operations-page">
      <PageHeader
        eyebrow="Finance"
        title="Payments"
        description="Create organization payments and track student collections."
        actions={
          <div className="flex flex-wrap gap-2">
            {(hasPermission("finance:create") ||
              hasPermission("finance:due:create")) && (
              <button
                className="btn btn-primary"
                onClick={() => setIsCreateOfferingOpen(true)}
                disabled={!selectedScope?.organizationId}
              >
                Create Payment
              </button>
            )}
            {hasPermission("finance:export") && (
              <button
                className="btn btn-secondary"
                onClick={handleExport}
                disabled={isExporting || !selectedScope?.organizationId}
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {isExporting ? "Exporting…" : "Export CSV"}
              </button>
            )}
          </div>
        }
      />

      <div className="operations-surface overflow-x-auto">
        <div className="border-b px-5 py-4" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-sm font-semibold text-slate-900">Organization payments</h2>
          <p className="mt-1 text-xs text-slate-500">
            Students in this organization pay a 3% Heightt transaction fee at checkout.
          </p>
        </div>
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Payment</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Amount</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Students paid</th>
              <th className="px-5 py-3 text-[11px] font-bold uppercase text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(offeringsQuery.data?.data || []).map((offering) => (
              <tr key={offering.id}>
                <td className="px-5 py-3">
                  <div className="font-semibold text-slate-900">{offering.name}</div>
                  {offering.description && (
                    <div className="text-xs text-slate-500">{offering.description}</div>
                  )}
                </td>
                <td className="px-5 py-3 font-semibold">{formatKoboCurrency(offering.amount)}</td>
                <td className="px-5 py-3">{offering.paidStudentCount}</td>
                <td className="px-5 py-3">{offering.status}</td>
              </tr>
            ))}
            {!offeringsQuery.isLoading && !offeringsQuery.data?.data.length && (
              <tr>
                <td className="px-5 py-5 text-sm text-slate-500" colSpan={4}>
                  No organization payments created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isCreateOfferingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleCreateOffering}
            className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="text-lg font-bold text-slate-900">Create payment</h2>
            {offeringError && (
              <p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                {offeringError}
              </p>
            )}
            <label className="block text-sm font-medium text-slate-700">
              Payment name
              <input
                value={offeringName}
                onChange={(event) => setOfferingName(event.target.value)}
                required
                maxLength={120}
                className="mt-1 w-full rounded-md border p-2"
                placeholder="Department contribution"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={offeringDescription}
                onChange={(event) => setOfferingDescription(event.target.value)}
                maxLength={2000}
                rows={3}
                className="mt-1 w-full rounded-md border p-2"
                placeholder="What is this contribution for?"
              />
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Amount (NGN)
              <input
                type="number"
                value={offeringAmount}
                onChange={(event) => setOfferingAmount(event.target.value)}
                required
                min="0.01"
                step="0.01"
                className="mt-1 w-full rounded-md border p-2"
              />
            </label>
            <p className="text-xs text-slate-500">
              All active students in the selected organization can see this payment.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsCreateOfferingOpen(false)}
                disabled={createOfferingMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createOfferingMutation.isPending}
              >
                {createOfferingMutation.isPending ? "Creating…" : "Create payment"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Bar */}
      <div className="operations-toolbar">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search payments..."
            className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as PaymentHistoryStatus | "");
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <input
          type="text"
          value={payerId}
          onChange={(e) => setPayerId(e.target.value)}
          placeholder="Payer ID"
          aria-label="Payer ID"
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none bg-white border-slate-200 focus:border-[#1a5cff]"
        />
        <input
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => setStartDate(e.target.value)}
          aria-label="Start date"
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none bg-white border-slate-200 focus:border-[#1a5cff]"
        />
        <input
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => setEndDate(e.target.value)}
          aria-label="End date"
          className="px-3 py-2.5 border-2 rounded-lg text-sm outline-none bg-white border-slate-200 focus:border-[#1a5cff]"
        />

        {(search || statusFilter || payerId || startDate || endDate) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
              setPayerId("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 border-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:border-red-300 transition-all bg-white border-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* Payments Table */}
      <div
        className="operations-surface"
        style={{ borderColor: "var(--color-border)" }}
      >
        {filteredPayments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-300 mb-3">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No payments found
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm">
              {search || statusFilter
                ? "No matching payments found. Try adjusting your search query."
                : "No payment receipts available yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[800px]">
              <thead>
                <tr
                  className="bg-slate-50 border-b"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Receipt
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Payer
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: "var(--color-border)" }}
              >
                {filteredPayments.map((payment: PaymentHistoryRecord) => {
                  const statusColor = getStatusColor(payment.status);
                  const receipt = payment.receipt;
                  const due = payment.duePayment?.assignment?.due;
                  const guestName =
                    payment.metadata?.guestName ||
                    [
                      payment.payer?.guestPayer?.firstName,
                      payment.payer?.guestPayer?.lastName,
                    ]
                      .filter(Boolean)
                      .join(" ");
                  const payerName = [
                    payment.payer?.profile?.firstName,
                    payment.payer?.profile?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  const displayName =
                    guestName ||
                    payerName ||
                    payment.payer?.username ||
                    "Unknown";
                  const displayEmail =
                    payment.payer?.guestPayer?.email ||
                    payment.metadata?.guestEmail ||
                    payment.payer?.email;
                  const reference =
                    receipt?.receiptNumber ||
                    payment.reference ||
                    payment.transaction?.reference ||
                    payment.id;

                  return (
                    <tr
                      key={payment.id}
                      className="hover:bg-slate-50/80 transition-colors duration-150"
                    >
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">
                            {reference}
                          </div>
                          <div className="text-xs text-slate-400 truncate max-w-[200px]">
                            {due?.name ||
                              payment.paymentOffering?.name ||
                              payment.organization?.name ||
                              "Payment"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span className="font-bold text-sm text-slate-900">
                          {formatKoboCurrency(
                            payment.amount ??
                              payment.transaction?.amount ??
                              receipt?.totalAmount,
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div>
                          <div className="text-sm text-slate-700">
                            {displayName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {displayEmail || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <div className="text-sm text-slate-700">
                          {formatDate(
                            payment.createdAt ||
                              payment.transaction?.createdAt ||
                              receipt?.paymentDate,
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-middle">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                            statusColor.bg,
                            statusColor.text,
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              statusColor.dot,
                            )}
                          />
                          {statusColor.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="text-xs text-slate-500">
              Showing{" "}
              <strong className="text-slate-700">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </strong>{" "}
              to{" "}
              <strong className="text-slate-700">
                {Math.min(currentPage * ITEMS_PER_PAGE, meta.total)}
              </strong>{" "}
              of <strong className="text-slate-700">{meta.total}</strong>{" "}
              payments
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(meta.totalPages, 5) }).map(
                (_, idx) => {
                  const pageNum = idx + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        "w-8 h-8 rounded-lg border text-xs font-semibold cursor-pointer transition-colors",
                        isActive
                          ? "bg-[#1a5cff] text-white border-[#1a5cff]"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              <button
                disabled={currentPage === meta.totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
