"use client";

import { useState, useRef, useEffect } from "react";
import { X, Coins, Calendar, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateDueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateDueModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateDueModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [lateFee, setLateFee] = useState("");
  const [isRequired, setIsRequired] = useState(true);
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstInputRef.current?.focus(), 120);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setName("");
      setDescription("");
      setAmount("");
      setDueDate("");
      setLateFee("");
      setIsRequired(true);
      setStatus("DRAFT");
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
    if (!name || !amount || !dueDate) return;

    const amountInKobo = Math.round(Number(amount) * 100);
    const lateFeeInKobo = lateFee ? Math.round(Number(lateFee) * 100) : 0;
    if (!Number.isSafeInteger(amountInKobo) || amountInKobo <= 0) return;
    if (!Number.isSafeInteger(lateFeeInKobo) || lateFeeInKobo < 0) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));

    onSubmit({
      name,
      description,
      amount: amountInKobo,
      dueDate: new Date(dueDate).toISOString(),
      lateFee: lateFeeInKobo,
      isRequired,
      status,
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/35 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto shadow-2xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2 text-slate-900">
            <Coins className="w-5 h-5 text-[#1a5cff]" />
            Create New Due
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border flex items-center justify-center text-sm cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-400 hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Due Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Departmental Dues 2025/26"
                className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this due..."
                rows={3}
                className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10 resize-y"
              />
            </div>

            {/* Amount & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                    min="0.01"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Late Fee & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Late Fee
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">
                    ₦
                  </span>
                  <input
                    type="number"
                    value={lateFee}
                    onChange={(e) => setLateFee(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] focus:ring-4 focus:ring-[#1a5cff]/10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 rounded-lg text-sm outline-none transition-all bg-white border-slate-200 focus:border-[#1a5cff] cursor-pointer"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
            </div>

            {/* Required Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsRequired(!isRequired)}
                className={cn(
                  "w-11 h-6 rounded-full transition-colors duration-200 relative flex items-center border-none cursor-pointer",
                  isRequired ? "bg-[#1a5cff]" : "bg-slate-300",
                )}
                role="switch"
                aria-checked={isRequired}
              >
                <span
                  className={cn(
                    "w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out",
                    isRequired ? "translate-x-[22px]" : "translate-x-[3px]",
                  )}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">
                Required for all students
              </span>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-semibold">Important</p>
                <p>
                  Dues marked as "Required" will be assigned to all students.
                  You can assign to specific students later.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 mt-6 flex-col sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="order-2 sm:order-1 px-5 py-2.5 border-2 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-transparent border-slate-200 text-slate-600 hover:border-[#1a5cff] hover:text-[#1a5cff]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "order-1 sm:order-2 flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 border-none",
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed"
                  : "bg-[#1a5cff] hover:bg-[#0f4ad0] hover:shadow-lg active:scale-[0.98]",
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4" />
                  Create Due
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
