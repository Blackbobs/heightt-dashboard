"use client";

import { useState, useRef, useEffect, forwardRef } from "react";

interface CreateManualPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: ManualPaymentData) => void;
}

export interface ManualPaymentData {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  paymentMethod: string;
  status: "active" | "inactive";
}

const inputCls =
  "w-full px-3 py-2.5 border-2 rounded-lg text-sm font-sans outline-none transition-all duration-200 bg-white";

function focusStyle(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.borderColor = "var(--color-primary)";
  (e.target as HTMLElement).style.boxShadow =
    "0 0 0 3px oklch(62% .2 270 / 0.1)";
}
function blurStyle(e: React.FocusEvent<HTMLElement>) {
  (e.target as HTMLElement).style.borderColor = "var(--color-border)";
  (e.target as HTMLElement).style.boxShadow = "none";
}

const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => (
  <input
    {...props}
    ref={ref}
    className={inputCls}
    style={{
      borderColor: "var(--color-border)",
      color: "var(--color-foreground)",
    }}
    onFocus={focusStyle}
    onBlur={blurStyle}
  />
));

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputCls + " cursor-pointer"}
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-foreground)",
      }}
      onFocus={focusStyle}
      onBlur={blurStyle}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={inputCls + " resize-y"}
      style={{
        borderColor: "var(--color-border)",
        color: "var(--color-foreground)",
        minHeight: "64px",
      }}
      onFocus={focusStyle}
      onBlur={blurStyle}
    />
  );
}

function Field({
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

export default function CreateManualPaymentModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateManualPaymentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let focusTimeout: ReturnType<typeof setTimeout> | undefined;
    if (isOpen) {
      focusTimeout = setTimeout(() => titleRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      if (focusTimeout) clearTimeout(focusTimeout);
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const amountInKobo = Math.round(
      Number((form.elements.namedItem("amount") as HTMLInputElement).value) *
        100,
    );
    if (!Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) return;

    setIsSubmitting(true);
    const data: ManualPaymentData = {
      title: (form.elements.namedItem("title") as HTMLInputElement).value,
      description: (
        form.elements.namedItem("description") as HTMLTextAreaElement
      ).value,
      amount: amountInKobo,
      dueDate: (form.elements.namedItem("dueDate") as HTMLInputElement).value,
      paymentMethod: (
        form.elements.namedItem("paymentMethod") as HTMLSelectElement
      ).value,
      status: (form.elements.namedItem("status") as HTMLSelectElement).value as
        "active" | "inactive",
    };
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    onSubmit?.(data);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-5 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="px-7 pt-6 pb-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-[19px] font-bold"
              style={{ color: "var(--color-foreground)" }}
            >
              <i
                className="fas fa-plus-circle mr-2"
                style={{ color: "var(--color-primary)" }}
              />
              Create Manual Payment
            </h2>
            <button
              className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Title" required>
              <Input
                ref={titleRef}
                name="title"
                type="text"
                placeholder="e.g. Departmental Dinner"
                required
              />
            </Field>

            <Field label="Description">
              <Textarea
                name="description"
                placeholder="Payment description..."
                rows={2}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
              <Field label="Amount (₦)" required>
                <Input
                  name="amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required
                />
              </Field>
              <Field label="Due Date" required>
                <Input name="dueDate" type="date" required />
              </Field>
            </div>

            <Field label="Payment Method" required>
              <Select name="paymentMethod" defaultValue="CARD" required>
                <option value="CARD">Card</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="MOBILE_MONEY">Mobile Money</option>
                <option value="CASH">Cash</option>
              </Select>
            </Field>

            <Field label="Status">
              <Select name="status" defaultValue="active">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </Field>

            <div className="flex gap-2.5 mt-2 flex-col sm:flex-row">
              <button
                type="button"
                onClick={onClose}
                className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-[13px] font-semibold cursor-pointer transition-all duration-200 font-sans bg-transparent"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-muted-foreground)",
                }}
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
                    e.currentTarget.style.background =
                      "var(--color-primary-dark)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px oklch(46% .18 265 / 0.2)";
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
                    <i className="fas fa-spinner fa-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus" /> Create Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
