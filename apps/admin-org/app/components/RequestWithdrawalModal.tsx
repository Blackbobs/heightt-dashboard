"use client";

import { useState, useRef, useEffect, forwardRef } from "react";

interface RequestWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; purpose: string; notes?: string }) => void;
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label
        className="block text-xs font-semibold mb-1"
        style={{ color: "var(--color-foreground)" }}
      >
        {label}{" "}
        {required && (
          <span style={{ color: "var(--color-destructive)" }}>*</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white";

const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => (
    <input
      {...props}
      ref={ref}
      className={inputCls}
      style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-primary)";
        e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--color-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  )
);
Input.displayName = "Input";

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={inputCls + " resize-y min-h-[80px]"}
      style={{ borderColor: "var(--color-border)", color: "var(--color-foreground)" }}
      onFocus={(e) => {
        e.target.style.borderColor = "var(--color-primary)";
        e.target.style.boxShadow = "0 0 0 3px oklch(62% .2 270 / 0.1)";
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "var(--color-border)";
        e.target.style.boxShadow = "none";
        props.onBlur?.(e);
      }}
    />
  );
}

export default function RequestWithdrawalModal({
  isOpen,
  onClose,
  onSubmit,
}: RequestWithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setAmount("");
      setPurpose("");
      setNotes("");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^0-9.]/g, ""));
    if (isNaN(numAmount) || numAmount <= 0 || !purpose) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    onSubmit({
      amount: numAmount,
      purpose,
      notes,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-4 sm:p-5 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[500px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-7 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[19px] font-bold" style={{ color: "var(--color-foreground)" }}>
            <i className="fas fa-arrow-up text-primary mr-2" style={{ color: "var(--color-primary)" }} />
            Request Withdrawal
          </h2>
          <button
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent"
            style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-muted)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            onClick={onClose}
            aria-label="Close modal"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Balance Warning Info */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3 text-xs text-blue-800">
          <i className="fas fa-wallet text-blue-600 text-base" />
          <div>
            Available balance: <strong className="text-blue-900">₦2,700,000.00</strong>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FormField label="Withdrawal Amount (₦)" required>
            <Input
              ref={firstInputRef}
              type="number"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Purpose / Category" required>
            <Input
              type="text"
              placeholder="e.g. Equipment Purchase, Event Planning"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Additional Notes">
            <Textarea
              placeholder="Add payment destination or reference notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </FormField>

          {/* Actions */}
          <div className="flex gap-2.5 mt-5 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 font-sans bg-transparent"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.color = "var(--color-muted-foreground)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white cursor-pointer transition-all duration-200 font-sans border-none disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ background: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.background = "var(--color-primary-dark)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 4px 16px oklch(46% .18 265 / 0.2)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-primary)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isSubmitting ? (
                <>
                  <i className="fas fa-spinner fa-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-up" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
