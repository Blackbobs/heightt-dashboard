"use client";

import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { useAdminLogin } from "@/hooks/admin/useAdminAuth";
import { getApiErrorMessage } from "@/lib/api/error";

export default function AdminLoginPage() {
  const login = useAdminLogin();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!identifier.trim() || !password) { setError("Enter your email or username and password."); return; }
    try { await login.mutateAsync({ identifier: identifier.trim(), password }); }
    catch (requestError) { setError(getApiErrorMessage(requestError, "We couldn’t sign you in. Check your details and try again.")); }
  }

  return <main className="min-h-screen bg-[#F8FAFC] grid lg:grid-cols-[minmax(360px,0.8fr)_minmax(560px,1.2fr)]">
    <section className="hidden lg:flex bg-[#0B1020] text-white p-12 xl:p-16 flex-col justify-between">
      <Image src="/heightt-logo.png" alt="Heightt" width={142} height={80} className="w-[142px] h-auto brightness-0 invert" priority />
      <div className="max-w-md"><p className="text-xs font-semibold uppercase tracking-[.16em] text-blue-400 mb-4">Financial operations</p><h1 className="text-4xl leading-[1.15] font-semibold tracking-tight">Manage your organization’s finances with clarity.</h1><p className="text-sm leading-6 text-slate-400 mt-5">Secure access for dues, collections, students, withdrawals, and reporting.</p></div>
      <p className="text-xs text-slate-500">Heightt organization administration</p>
    </section>
    <section className="flex items-center justify-center px-5 py-10 sm:px-10">
      <div className="w-full max-w-[430px]">
        <Image src="/heightt-logo.png" alt="Heightt" width={126} height={71} className="lg:hidden w-[126px] h-auto mb-10" priority />
        <div className="mb-8"><div className="w-10 h-10 border border-slate-200 rounded-lg bg-white flex items-center justify-center mb-5"><LockKeyhole className="w-[18px] h-[18px] text-blue-600" /></div><h2 className="text-[28px] leading-9 font-bold tracking-tight text-slate-950">Sign in to Heightt</h2><p className="text-sm text-slate-500 mt-2">Use your administrator credentials to continue.</p></div>
        <form onSubmit={handleSubmit} aria-busy={login.isPending} className="space-y-5">
          {error && <div role="alert" className="px-3.5 py-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">{error}</div>}
          <div><label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 mb-2">Email or username</label><input id="identifier" name="identifier" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} disabled={login.isPending} className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-md text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:bg-slate-50 disabled:text-slate-500" /></div>
          <div><label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-2">Password</label><div className="relative"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} disabled={login.isPending} className="w-full h-11 pl-3.5 pr-11 bg-white border border-slate-300 rounded-md text-sm text-slate-950 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 disabled:bg-slate-50" /><button type="button" onClick={() => setShowPassword(value => !value)} disabled={login.isPending} className="absolute right-0 top-0 h-11 w-11 border-0 bg-transparent text-slate-400 hover:text-slate-700 flex items-center justify-center" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
          <button type="submit" disabled={login.isPending} className="w-full h-11 rounded-md border-0 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait transition-colors">{login.isPending && <Loader2 className="w-4 h-4 animate-spin" aria-hidden />}<span>{login.isPending ? "Signing in…" : "Sign in"}</span></button>
        </form>
        <p className="text-xs text-slate-400 mt-7">Access is restricted to authorized organization administrators.</p>
      </div>
    </section>
  </main>;
}
