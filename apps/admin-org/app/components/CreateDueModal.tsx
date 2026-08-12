"use client";

import { useState, useRef, useEffect, forwardRef } from "react";

interface CreateDueModalProps {
  isOpen: boolean;
  onClose: () => void;
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

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={inputCls + " cursor-pointer"}
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

export default function CreateDueModal({ isOpen, onClose }: CreateDueModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSubmitting(false);
    alert("✅ Due created successfully!");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-[200] flex items-center justify-center p-5 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-[var(--radius-card)] w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-2xl animate-slide-up">
        <div className="px-7 pt-6 pb-7">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[19px] font-bold" style={{ color: "var(--color-foreground)" }}>
              <i className="fas fa-coins mr-2" style={{ color: "var(--color-primary)" }} />
              Create New Due
            </h2>
            <button
              className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent"
              style={{ borderColor: "var(--color-border)", color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--color-muted)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              onClick={onClose}
              aria-label="Close"
            >
              <i className="fas fa-times" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <FormField label="Title" required>
              <Input ref={firstInputRef} type="text" placeholder="e.g. Departmental Dues 2025/26" required />
            </FormField>

            <FormField label="Description">
              <Textarea placeholder="Describe this due..." rows={3} />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-3.5">
              <FormField label="Amount" required>
                <Input type="number" placeholder="₦0.00" required />
              </FormField>
              <FormField label="Due Date" required>
                <Input type="date" required />
              </FormField>
            </div>

            <FormField label="Target Students">
              <Select defaultValue="all">
                <option value="all">All Students</option>
                <option value="100">100 Level</option>
                <option value="200">200 Level</option>
                <option value="300">300 Level</option>
                <option value="400">400 Level</option>
                <option value="postgrad">Postgraduate</option>
                <option value="specific">Specific Students</option>
              </Select>
            </FormField>

            <FormField label="Status">
              <Select defaultValue="active">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </Select>
            </FormField>

            {/* Actions */}
            <div className="flex gap-2.5 mt-2 flex-col sm:flex-row">
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
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus" />
                    Create Due
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
