"use client";

import { useMemo, useState } from "react";
import { useAdminPaymentHistory } from "@/hooks/admin/useAdminFinance";
import { PaymentHistoryRecord, PaymentHistoryStatus } from "@/lib/api/admin";
import {
  Search,
  CreditCard,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn, formatKoboCurrency } from "@/lib/utils";
import { useAdminContext } from "./AdminContext";

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
  const { selectedScope } = useAdminContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PaymentHistoryStatus | "">(
    "",
  );
  const [currentPage, setCurrentPage] = useState(1);

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
            payment.organization?.name,
            payment.duePayment?.assignment?.due?.name,
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

  const handleDownload = (id: string, ref: string) => {
    alert(`Downloading receipt ${ref}...`);
  };

  if (isLoading) {
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
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Payments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View completed, pending, and failed due payments
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
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

        {(search || statusFilter) && (
          <button
            onClick={() => {
              setSearch("");
              setStatusFilter("");
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
        className="bg-white border rounded-xl overflow-hidden"
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
                  <th className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 text-right">
                    Actions
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
                  const payerName = [
                    payment.payer?.profile?.firstName,
                    payment.payer?.profile?.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ");
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
                              payment.organization?.name ||
                              "Due payment"}
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
                            {payerName || payment.payer?.username || "Unknown"}
                          </div>
                          <div className="text-xs text-slate-400">
                            {payment.payer?.email || "No email"}
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
                      <td className="px-4 py-3.5 align-middle text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => alert(`View payment: ${reference}`)}
                            className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors"
                            title="View Receipt"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              receipt &&
                              handleDownload(receipt.id, receipt.receiptNumber)
                            }
                            disabled={!receipt}
                            className="w-8 h-8 rounded-lg border-none bg-transparent hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 cursor-pointer flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
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
