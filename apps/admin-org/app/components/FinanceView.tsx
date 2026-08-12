"use client";

import { useState } from "react";
import RequestWithdrawalModal from "./RequestWithdrawalModal";
import { usePermissions } from "../context/PermissionContext";

interface Transaction {
  id: string;
  name: string;
  desc: string;
  type: "in" | "out";
  amount: string;
  status: "completed" | "pending";
}

interface Receipt {
  id: string;
  ref: string;
  desc: string;
  amount: string;
}

interface Withdrawal {
  id: string;
  name: string;
  date: string;
  amount: string;
  status: "completed" | "pending" | "failed";
}

interface OutstandingPayment {
  id: string;
  studentName: string;
  dueTitle: string;
  amount: string;
  rawAmount: number;
  dueDate: string;
}

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "1", name: "Departmental Dues", desc: "John D. • 2 min ago", type: "in", amount: "+₦5,000", status: "completed" },
  { id: "2", name: "Lab Maintenance", desc: "Withdrawal • 1 hour ago", type: "out", amount: "-₦200,000", status: "completed" },
  { id: "3", name: "Faculty Week Fees", desc: "Sarah K. • 3 hours ago", type: "in", amount: "+₦3,200", status: "pending" },
  { id: "4", name: "Tech Fest Tickets", desc: "Mike R. • 5 hours ago", type: "in", amount: "+₦12,500", status: "completed" },
  { id: "5", name: "Equipment Purchase", desc: "Withdrawal • Yesterday", type: "out", amount: "-₦150,000", status: "completed" },
];

const INITIAL_RECEIPTS: Receipt[] = [
  { id: "1", ref: "RCP-2026-001", desc: "John D. • Departmental Dues", amount: "₦5,000" },
  { id: "2", ref: "RCP-2026-002", desc: "Sarah K. • Faculty Week", amount: "₦3,200" },
  { id: "3", ref: "RCP-2026-003", desc: "Mike R. • Tech Fest", amount: "₦12,500" },
];

const INITIAL_WITHDRAWALS: Withdrawal[] = [
  { id: "1", name: "Lab Maintenance", date: "Requested: Dec 12, 2026", amount: "-₦200,000", status: "completed" },
  { id: "2", name: "Equipment Purchase", date: "Requested: Dec 10, 2026", amount: "-₦150,000", status: "completed" },
  { id: "3", name: "Faculty Week Budget", date: "Requested: Dec 8, 2026", amount: "-₦80,000", status: "pending" },
];

const OUTSTANDING_PAYMENTS: OutstandingPayment[] = [
  { id: "1", studentName: "Michael Okonkwo", dueTitle: "Departmental Dues 2025/26", amount: "₦25,000", rawAmount: 25000, dueDate: "Due: Dec 15, 2026" },
  { id: "2", studentName: "Amara Eze", dueTitle: "Faculty Week Fees", amount: "₦5,000", rawAmount: 5000, dueDate: "Due: Nov 30, 2026" },
  { id: "3", studentName: "David Mensah", dueTitle: "Tech Fest Tickets", amount: "₦12,500", rawAmount: 12500, dueDate: "Due: Jan 25, 2027" },
  { id: "4", studentName: "Grace Nwachukwu", dueTitle: "Graduation Gown Deposit", amount: "₦35,000", rawAmount: 35000, dueDate: "Due: Mar 10, 2027" },
];

export default function FinanceView() {
  const { hasPermission, permissions } = usePermissions();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(INITIAL_WITHDRAWALS);
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);

  // Permissions
  const canExport = hasPermission("FINANCE_EXPORT");
  const canRequestWithdrawal = hasPermission("WITHDRAWAL_REQUEST");
  const canViewFinance = hasPermission("FINANCE_VIEW");

  const totalOutstanding = OUTSTANDING_PAYMENTS.reduce((sum, item) => sum + item.rawAmount, 0);

  const handleCreateWithdrawal = (data: { amount: number; purpose: string }) => {
    const newWd: Withdrawal = {
      id: String(Date.now()),
      name: data.purpose,
      date: `Requested: ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      amount: `-₦${data.amount.toLocaleString()}`,
      status: "pending",
    };
    setWithdrawals((prev) => [newWd, ...prev]);
  };

  const handleExportReport = () => {
    alert("📄 Exporting financial report (CSV/PDF)...");
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1
            className="text-[22px] font-bold tracking-tight"
            style={{ color: "var(--color-foreground)" }}
          >
            Finance
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Financial overview for Computer Science Department
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {canExport && (
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold border cursor-pointer transition-all duration-200 bg-white font-sans"
              style={{ borderColor: "var(--color-border)", color: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-bg)";
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#fff";
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <i className="fas fa-download" />
              Export Report
            </button>
          )}

          {canRequestWithdrawal && (
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-none cursor-pointer transition-all duration-200 font-sans"
              style={{ background: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary-dark)";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 16px oklch(46% .18 265 / 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <i className="fas fa-arrow-up" />
              Request Withdrawal
            </button>
          )}
        </div>
      </div>

      {/* Permission Banner */}
      <div className="flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-lg mb-6 text-xs text-slate-700 flex-wrap">
        <i className="fas fa-shield-halved text-primary text-base" style={{ color: "var(--color-primary)" }} />
        <span>
          Current Active Permissions:{" "}
          {permissions.filter((p) => p.startsWith("FINANCE") || p.startsWith("WITHDRAWAL")).map((p) => (
            <span key={p} className="inline-flex items-center gap-1 px-2.5 py-0.5 ml-1.5 bg-white rounded-full text-[11px] font-semibold text-primary shadow-xs">
              <i className="fas fa-check text-[10px]" /> {p}
            </span>
          ))}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 mb-6">
        {/* Total Collections */}
        <div className="bg-white border rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Collections</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
              <i className="fas fa-wallet" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₦4.5M</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <i className="fas fa-arrow-up text-[10px]" /> 8.5% this month
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white border rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Transactions</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
              <i className="fas fa-arrow-right-arrow-left" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">1,247</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <i className="fas fa-arrow-up text-[10px]" /> 12% this month
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white border rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Payments</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs">
              <i className="fas fa-credit-card" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">1,203</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <i className="fas fa-arrow-up text-[10px]" /> 9% this month
          </div>
        </div>

        {/* Outstanding */}
        <div className="bg-white border rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center text-xs">
              <i className="fas fa-clock" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₦320K</div>
          <div className="text-xs font-medium text-red-600 mt-1 flex items-center gap-1">
            <i className="fas fa-arrow-down text-[10px]" /> 3.2% this month
          </div>
        </div>

        {/* Withdrawals */}
        <div className="bg-white border rounded-[var(--radius-card)] p-4 transition-all duration-200 hover:shadow-md" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Withdrawals</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
              <i className="fas fa-arrow-up" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">₦1.8M</div>
          <div className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
            <i className="fas fa-arrow-up text-[10px]" /> 5% this month
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-5 mb-5">
        {/* Recent Transactions */}
        <div className="bg-white border rounded-[var(--radius-card)] overflow-hidden flex flex-col" style={{ borderColor: "var(--color-border)" }}>
          <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)" }}>
            <h3 className="text-sm font-semibold text-slate-900">Recent Transactions</h3>
            <button
              onClick={() => alert("View all transactions")}
              className="text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
              style={{ color: "var(--color-primary)" }}
            >
              View all →
            </button>
          </div>
          <div className="px-5 py-2 divide-y" style={{ borderColor: "var(--color-border)" }}>
            {INITIAL_TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      tx.type === "in"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    <i className={`fas ${tx.type === "in" ? "fa-arrow-down" : "fa-arrow-up"}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{tx.name}</div>
                    <div className="text-xs text-slate-400">{tx.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-bold ${
                      tx.type === "in" ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {tx.amount}
                  </div>
                  <span
                    className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      tx.status === "completed"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Receipts & Withdrawals */}
        <div className="space-y-5">
          {/* Recent Receipts */}
          <div className="bg-white border rounded-[var(--radius-card)] overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold text-slate-900">Recent Receipts</h3>
              <button
                onClick={() => alert("View all receipts")}
                className="text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: "var(--color-primary)" }}
              >
                View all →
              </button>
            </div>
            <div className="px-5 py-2 divide-y" style={{ borderColor: "var(--color-border)" }}>
              {INITIAL_RECEIPTS.map((rcp) => (
                <div
                  key={rcp.id}
                  onClick={() => alert(`View receipt details for ${rcp.ref}`)}
                  className="flex items-center justify-between py-2.5 hover:bg-slate-50 cursor-pointer -mx-5 px-5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs">
                      <i className="fas fa-receipt" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{rcp.ref}</div>
                      <div className="text-xs text-slate-400">{rcp.desc}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-900">{rcp.amount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Downloading ${rcp.ref}.pdf...`);
                      }}
                      className="w-7 h-7 rounded-md border-none bg-transparent hover:bg-blue-50 text-slate-400 hover:text-blue-600 cursor-pointer flex items-center justify-center"
                      title="Download receipt"
                    >
                      <i className="fas fa-download text-xs" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Withdrawals */}
          <div className="bg-white border rounded-[var(--radius-card)] overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)" }}>
              <h3 className="text-sm font-semibold text-slate-900">Withdrawals</h3>
              <button
                onClick={() => alert("View all withdrawals")}
                className="text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
                style={{ color: "var(--color-primary)" }}
              >
                View all →
              </button>
            </div>
            <div className="px-5 py-2 divide-y" style={{ borderColor: "var(--color-border)" }}>
              {withdrawals.map((wd) => (
                <div key={wd.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs">
                      <i className="fas fa-arrow-up" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{wd.name}</div>
                      <div className="text-xs text-slate-400">{wd.date}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-red-600">{wd.amount}</div>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        wd.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : wd.status === "pending"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {wd.status.charAt(0).toUpperCase() + wd.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Outstanding Payments Section */}
      <div className="bg-white border rounded-[var(--radius-card)] overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h3 className="text-sm font-semibold text-slate-900">Outstanding Payments</h3>
          <button
            onClick={() => alert("View all outstanding payments")}
            className="text-xs font-semibold text-primary hover:underline bg-transparent border-none cursor-pointer"
            style={{ color: "var(--color-primary)" }}
          >
            View all →
          </button>
        </div>
        <div className="px-5 py-2 divide-y" style={{ borderColor: "var(--color-border)" }}>
          {OUTSTANDING_PAYMENTS.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-xs">
                  <i className="fas fa-clock" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900">{item.studentName}</div>
                  <div className="text-xs text-slate-400">{item.dueTitle}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-red-600">{item.amount}</div>
                <div className="text-xs text-slate-400">{item.dueDate}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-5 py-3 border-t bg-slate-50/50 flex justify-end" style={{ borderColor: "var(--color-border)" }}>
          <span className="text-sm font-semibold text-slate-800">
            Total Outstanding: <span className="text-red-600 font-bold">₦{totalOutstanding.toLocaleString()}</span>
          </span>
        </div>
      </div>

      {/* Request Withdrawal Modal */}
      <RequestWithdrawalModal
        isOpen={isWithdrawalModalOpen}
        onClose={() => setIsWithdrawalModalOpen(false)}
        onSubmit={handleCreateWithdrawal}
      />
    </div>
  );
}
