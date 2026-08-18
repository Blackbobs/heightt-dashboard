// src/app/signin/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { axiosConfig } from "@/utils/axios-config";
import { Eye, EyeOff, Lock, Mail, LogIn, Shield, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, setAuth, clearUser, user } = useAuthStore();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !authLoading && user?.isAdminSession) {
      router.replace("/platform");
    }
  }, [isAuthenticated, authLoading, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await axiosConfig.post("/auth/admin/login", {
        identifier,
        password,
      });

      const { accessToken, ...userData } = response.data;

      if (accessToken) {
        axiosConfig.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;
      }

      setAuth(accessToken || null, userData);
      router.replace("/platform");
    } catch (err: any) {
      console.error("Admin login error:", err);
      const message = err?.response?.data?.message ||
        err?.message ||
        "Invalid credentials or insufficient permissions.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8faff] p-4">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#1a5cff] flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-[#0b1a33]">
              Heightt Platform Admin
            </span>
          </div>
          <p className="text-sm text-[#5b6d89] mt-2">
            Secure administration dashboard
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_20px_60px_rgba(0,20,40,0.08)] p-8">
          <h1 className="text-2xl font-bold text-[#0b1a33] mb-1.5">
            Admin Access
          </h1>
          <p className="text-sm text-[#5b6d89] mb-6">
            Sign in with your admin credentials
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-[#1f2a44] uppercase tracking-wider opacity-70 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aabbf]" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@example.com or admin_user"
                  className="w-full pl-10 pr-4 py-3 bg-[#f8faff] border-[1.5px] border-[#e2e8f0] rounded-xl text-sm font-medium text-[#0b1a33] placeholder:text-[#9aabbf] outline-none transition-all focus:border-[#1a5cff] focus:bg-white focus:ring-4 focus:ring-[#1a5cff]/10"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-xs font-semibold text-[#1f2a44] uppercase tracking-wider opacity-70 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aabbf]" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#f8faff] border-[1.5px] border-[#e2e8f0] rounded-xl text-sm font-medium text-[#0b1a33] placeholder:text-[#9aabbf] outline-none transition-all focus:border-[#1a5cff] focus:bg-white focus:ring-4 focus:ring-[#1a5cff]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9aabbf] hover:text-[#5b6d89]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className={cn(
                "w-full py-3.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]",
                isSubmitting || authLoading
                  ? "bg-[#93b4ff] cursor-not-allowed"
                  : "bg-[#1a5cff] hover:bg-[#0f4ad0] shadow-[0_8px_24px_rgba(26,92,255,0.25)] hover:shadow-[0_12px_28px_rgba(26,92,255,0.3)]",
              )}
            >
              {isSubmitting || authLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Admin Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#7a8ba3]">
            <Shield className="w-3 h-3 inline mr-1" />
            Secure platform admin access
          </div>
        </div>
      </div>
    </div>
  );
}