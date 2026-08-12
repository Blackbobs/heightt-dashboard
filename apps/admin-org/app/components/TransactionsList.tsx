"use client";

interface Transaction {
  id: string;
  name: string;
  description: string;
  amount: string;
  type: "in" | "out";
}

const transactions: Transaction[] = [
  { id: "1", name: "Departmental Dues", description: "John D. • 2 min ago", amount: "+₦5,000", type: "in" },
  { id: "2", name: "Lab Maintenance", description: "Withdrawal • 1 hour ago", amount: "-₦200,000", type: "out" },
  { id: "3", name: "Faculty Week Fees", description: "Sarah K. • 3 hours ago", amount: "+₦3,200", type: "in" },
  { id: "4", name: "Tech Fest Tickets", description: "Mike R. • 5 hours ago", amount: "+₦12,500", type: "in" },
];

export default function TransactionsList() {
  return (
    <div
      className="bg-white border rounded-[var(--radius-card)] overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Card Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--color-border)" }}
      >
        <h3 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--color-foreground)" }}>
          <i className="fas fa-clock-rotate-left" style={{ color: "var(--color-muted-foreground)" }} />
          Recent Transactions
        </h3>
        <button
          className="text-[13px] font-medium border-none bg-transparent cursor-pointer font-sans transition-all duration-200"
          style={{ color: "var(--color-primary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
        >
          View all
        </button>
      </div>

      {/* Transactions */}
      <div className="px-5 py-2">
        {transactions.map((tx, i) => (
          <div
            key={tx.id}
            className="flex items-center gap-3 py-3"
            style={{
              borderBottom: i < transactions.length - 1 ? `1px solid var(--color-border)` : "none",
            }}
          >
            {/* Icon */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
              style={{
                background: tx.type === "in" ? "#DCFCE7" : "#FEE2E2",
                color: tx.type === "in" ? "var(--color-success)" : "var(--color-destructive)",
              }}
            >
              <i className={tx.type === "in" ? "fas fa-arrow-down" : "fas fa-arrow-up"} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: "var(--color-foreground)" }}>
                {tx.name}
              </div>
              <div className="text-xs truncate" style={{ color: "var(--color-muted-foreground)" }}>
                {tx.description}
              </div>
            </div>

            {/* Amount */}
            <div
              className="text-sm font-semibold flex-shrink-0"
              style={{
                color: tx.type === "in" ? "var(--color-success)" : "var(--color-destructive)",
              }}
            >
              {tx.amount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
