// apps/admin-org/app/components/ReceiptsView.tsx
"use client";

import { useState, useMemo } from "react";
import {
  useAdminSearchReceiptsByEmail,
} from "@/hooks/admin/useAdminFinance";
import {
  Search,
  Download,
  Loader2,
  AlertCircle,
  Mail,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn, formatKoboCurrency, formatDate } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { downloadAxiosBlob } from "@/lib/download";
import { axiosConfig } from "@/utils/axios-config";
import { PageHeader } from "./OperationsUI";
import { usePermissions } from "../context/PermissionContext";

const ITEMS_PER_PAGE = 10;

export function ReceiptsView() {
  const { hasPermission } = usePermissions();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search.trim(), 300);

  const canViewReceipts =
    hasPermission("FINANCE_VIEW") ||
    hasPermission("FINANCE_EXPORT");

  const {
    data,
    isLoading,
    isError,
    error,
  } = useAdminSearchReceiptsByEmail({
    email: debouncedSearch || undefined,
    page: currentPage,
    limit: ITEMS_PER_PAGE,
  });

  const receipts = useMemo(() => data?.data || [], [data?.data]);
  const meta = data?.meta;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDownload = async (receiptId: string, receiptNumber: string) => {
    try {
      const response = await axiosConfig.get(
        `/v1/finance/receipts/${receiptId}/download`,
        {
          responseType: "blob",
        },
      );
      downloadAxiosBlob(
        response as any,
        `receipt-${receiptNumber}.pdf`,
      );
    } catch (err: any) {
      console.error("Failed to download receipt:", err);
      alert("Failed to download receipt. Please try again.");
    }
  };

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#1a5cff] animate-spin" />
          <span className="text-sm text-[#5b6d89] font-medium">
            Loading receipts...
          </span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
        <h3 className="text-sm font-medium text-slate-900">Failed to load receipts</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          {error?.message || "Something went wrong"}
        </p>
      </div>
    );
  }

  return (
    <div className="operations-page">
      <PageHeader
        eyebrow="Receipts"
        title="Student Receipts"
        description={
          <p className="text-sm text-slate-500">
            Search for a student&rsquo;s paid receipts by email address and download them.
          </p>
        }
      />

      {/* Search Bar */}
      <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="email"
            placeholder="Enter student email (e.g., student@university.edu)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a5cff] focus:border-transparent transition-all"
            disabled={!canViewReceipts}
          />
          {!canViewReceipts && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-red-500">
              No access
            </span>
          )}
        </div>
        {debouncedSearch && (
          <p className="mt-2 text-xs text-slate-500">
            Showing paid receipts for <strong className="text-slate-700">{debouncedSearch}</strong>
          </p>
        )}
      </div>

      {/* Results Table */}
      <div className="px-5 py-4">
        {!canViewReceipts && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-medium text-red-800">Access restricted</h3>
            </div>
            <p className="mt-1 text-xs text-red-700">
              You do not have permission to view receipts.
            </p>
          </div>
        )}
        {canViewReceipts && receipts.length === 0 && debouncedSearch && (
          <div className="py-12 text-center">
            <FileText className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-medium text-slate-900">No receipts found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No paid receipts found for <strong className="text-slate-700">{debouncedSearch}</strong>.
            </p>
          </div>
        )}
        {canViewReceipts && receipts.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b" style={{ borderColor: "var(--color-border)" }}>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Payer</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Receipt #</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Reference</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Amount</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((receipt) => (
                  <tr
                    key={receipt.id}
                    className="border-b" style={{ borderColor: "var(--color-border)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-900">{receipt.payerName}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[200px]">{receipt.payerEmail}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono text-slate-700">{receipt.receiptNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600 truncate max-w-[150px]">{receipt.reference}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm font-medium text-slate-900">{formatKoboCurrency(receipt.totalAmount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600">{formatDate(receipt.paymentDate || receipt.createdAt)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {receipt.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleDownload(receipt.id, receipt.receiptNumber)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#1a5cff] hover:bg-blue-50 transition-colors"
                        title="Download receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {canViewReceipts && meta && meta.totalPages > 1 && (
          <div className="mt-4 px-5 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "var(--color-border)" }}>
            <div className="text-xs text-slate-500">
              Showing <strong className="text-slate-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</strong>
              to{" "}
              <strong className="text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, meta.total)}</strong>
              of <strong className="text-slate-700">{meta.total}</strong> receipts
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-medium cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-white border-slate-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: Math.min(meta.totalPages, 5) }).map((_, idx) => {
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
              })}

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
