"use client";

import { useState } from "react";

export interface Payment {
  id: string;
  title: string;
  amount: string;
  date: string;
  paymentCount: number;
  status: "active" | "inactive";
}

interface PaymentCardProps {
  payment: Payment;
  onToggle: (id: string) => void;
}

export default function PaymentCard({ payment, onToggle }: PaymentCardProps) {
  const isActive = payment.status === "active";

  return (
    <div
      className="bg-white border rounded-[var(--radius-card)] p-5 flex flex-col gap-0 transition-all duration-200 group"
      style={{ borderColor: "var(--color-border)" }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = "var(--color-primary-light)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.transform = "none";
      }}
    >
      {/* Top row: title + status */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <span className="text-[15px] font-semibold leading-snug" style={{ color: "var(--color-foreground)" }}>
          {payment.title}
        </span>
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0"
          style={
            isActive
              ? { background: "#DCFCE7", color: "#16A34A" }
              : { background: "var(--color-muted)", color: "var(--color-muted-foreground)" }
          }
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: isActive ? "#16A34A" : "var(--color-muted-foreground)" }}
          />
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Amount */}
      <div className="text-[28px] font-bold tracking-tight mb-0.5" style={{ color: "var(--color-foreground)" }}>
        {payment.amount}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-[13px] mb-3.5" style={{ color: "var(--color-muted-foreground)" }}>
        <span className="flex items-center gap-1">
          <i className="fas fa-calendar text-xs" />
          {payment.date}
        </span>
        <span className="flex items-center gap-1">
          <i className="fas fa-user text-xs" />
          {payment.paymentCount} payments
        </span>
      </div>

      {/* Payment count bar */}
      <div
        className="flex items-center gap-2 py-3.5 border-t text-sm"
        style={{ borderColor: "var(--color-border)" }}
      >
        <span className="text-[18px] font-bold" style={{ color: "var(--color-foreground)" }}>
          {payment.paymentCount}
        </span>
        <span style={{ color: "var(--color-muted-foreground)" }}>payments made</span>
      </div>

      {/* Actions */}
      <div
        className="flex items-center gap-1.5 pt-3 border-t flex-wrap"
        style={{ borderColor: "var(--color-border)" }}
      >
        {/* Edit */}
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border-none font-sans"
          style={{ background: "var(--color-muted)", color: "var(--color-primary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-muted)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onClick={() => alert(`Edit: ${payment.title}`)}
        >
          <i className="fas fa-pen" /> Edit
        </button>

        {/* Toggle active/inactive */}
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border-none font-sans"
          style={
            isActive
              ? { background: "#FEF3C7", color: "#D97706" }
              : { background: "#DCFCE7", color: "#16A34A" }
          }
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isActive ? "#D97706" : "#16A34A";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isActive ? "#FEF3C7" : "#DCFCE7";
            e.currentTarget.style.color = isActive ? "#D97706" : "#16A34A";
          }}
          onClick={() => onToggle(payment.id)}
        >
          <i className={isActive ? "fas fa-pause" : "fas fa-play"} />
          {isActive ? "Deactivate" : "Activate"}
        </button>

        {/* View */}
        <button
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all duration-200 border-none font-sans"
          style={{ background: "var(--color-muted)", color: "var(--color-muted-foreground)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "oklch(92% .01 250)";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--color-muted)";
            e.currentTarget.style.color = "var(--color-muted-foreground)";
          }}
          onClick={() => alert(`View payments for: ${payment.title}`)}
        >
          <i className="fas fa-eye" /> View
        </button>
      </div>
    </div>
  );
}
