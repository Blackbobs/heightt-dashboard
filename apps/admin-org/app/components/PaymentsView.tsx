"use client";

import { useState, useMemo } from "react";
import PaymentCard, { type Payment } from "./PaymentCard";
import CreateManualPaymentModal, { type ManualPaymentData } from "./CreateManualPaymentModal";

const INITIAL_PAYMENTS: Payment[] = [
  { id: "1", title: "Departmental Dinner", amount: "₦5,000", date: "Dec 15, 2026", paymentCount: 243, status: "active" },
  { id: "2", title: "Faculty Week Registration", amount: "₦3,200", date: "Nov 30, 2026", paymentCount: 187, status: "active" },
  { id: "3", title: "Tech Fest Tickets", amount: "₦12,500", date: "Jan 25, 2027", paymentCount: 89, status: "active" },
  { id: "4", title: "Lab Maintenance", amount: "₦3,000", date: "Oct 20, 2026", paymentCount: 56, status: "inactive" },
  { id: "5", title: "Graduation Gown Deposit", amount: "₦35,000", date: "Mar 10, 2027", paymentCount: 34, status: "active" },
  { id: "6", title: "Sports Association Fees", amount: "₦2,500", date: "Feb 14, 2027", paymentCount: 142, status: "active" },
];

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("");

  const filtered = useMemo(() => {
    let list = payments.filter((p) => {
      const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    if (sortBy === "newest") list = [...list].reverse();
    if (sortBy === "oldest") list = [...list];
    if (sortBy === "amount-high") {
      list = [...list].sort((a, b) => {
        const aVal = parseFloat(a.amount.replace(/[₦,]/g, ""));
        const bVal = parseFloat(b.amount.replace(/[₦,]/g, ""));
        return bVal - aVal;
      });
    }
    if (sortBy === "amount-low") {
      list = [...list].sort((a, b) => {
        const aVal = parseFloat(a.amount.replace(/[₦,]/g, ""));
        const bVal = parseFloat(b.amount.replace(/[₦,]/g, ""));
        return aVal - bVal;
      });
    }

    return list;
  }, [payments, search, statusFilter, sortBy]);

  const handleToggle = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p
      )
    );
  };

  const handleCreate = (data: ManualPaymentData) => {
    const newPayment: Payment = {
      id: String(Date.now()),
      title: data.title,
      amount: `₦${data.amount.toLocaleString()}`,
      date: data.dueDate
        ? new Date(data.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "—",
      paymentCount: 0,
      status: data.status,
    };
    setPayments((prev) => [newPayment, ...prev]);
  };

  const selectCls =
    "px-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white cursor-pointer";

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "var(--color-foreground)" }}>
            Manual Payments
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--color-muted-foreground)" }}>
            Create and manage manual payments for Computer Science Department
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
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
          <i className="fas fa-plus" />
          Create Manual
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 mb-6 flex-wrap items-center">
        {/* Search */}
        <div className="relative flex-1" style={{ minWidth: "200px", maxWidth: "360px" }}>
          <i
            className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-sm pointer-events-none"
            style={{ color: "var(--color-muted-foreground)" }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white"
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--color-primary)";
              e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--color-border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={selectCls}
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={selectCls}
            style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
            onFocus={(e) => { e.target.style.borderColor = "var(--color-primary)"; }}
            onBlur={(e) => { e.target.style.borderColor = "var(--color-border)"; }}
          >
            <option value="">Sort By</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="amount-low">Amount: Low to High</option>
          </select>

          {(search || statusFilter || sortBy) && (
            <button
              onClick={() => { setSearch(""); setStatusFilter(""); setSortBy(""); }}
              className="flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 bg-white font-sans"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-destructive)";
                e.currentTarget.style.color = "var(--color-destructive)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              <i className="fas fa-xmark" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <i className="fas fa-hand-holding-dollar text-5xl" style={{ color: "var(--color-border)" }} />
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-foreground)" }}>
            No payments found
          </h3>
          <p className="text-sm" style={{ color: "var(--color-muted-foreground)" }}>
            {search || statusFilter ? "Try adjusting your filters" : "Create your first manual payment"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PaymentCard key={p.id} payment={p} onToggle={handleToggle} />
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateManualPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  );
}
