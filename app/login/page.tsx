"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { UxiLogo } from "@/components/brand/uxi-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Mail, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const { login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);

      if (success) {
        window.location.assign("/dashboard");
      } else {
        setError("Invalid email or password. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      setError(errorMessage);
      setIsSubmitting(false);
    }
  };

  const isButtonLoading = isSubmitting || authLoading;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <UxiLogo size="lg" showText={true} />
          <h2 className="mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
            Sign in to UXI HQ
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-xs">
            Private internal operating system for UXI web development company.
          </p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Work Email
              </label>
              <Input
                type="email"
                placeholder="admin@uxitech.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
                disabled={isButtonLoading}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
                disabled={isButtonLoading}
                className="h-10"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold mt-2"
              isLoading={isButtonLoading}
              disabled={isButtonLoading}
            >
              {isButtonLoading ? "Signing in to UXI HQ..." : "Sign in to UXI HQ"}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Secured with Supabase Auth & Role-Based Access Control</span>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">
          © {new Date().getFullYear()} UXI Web Development. All rights reserved.
        </p>
      </div>
    </div>
  );
}
