"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    async function checkAuthSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setHasSession(Boolean(session));
      } catch {
        setHasSession(false);
      } finally {
        setCheckingSession(false);
      }
    }

    checkAuthSession();
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.trim(),
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.assign("/dashboard");
        }, 1500);
      }
    } catch {
      setError("An unexpected error occurred while updating your password.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-sm font-medium text-slate-500">
            Verifying recovery session...
          </p>
        </div>
      </div>
    );
  }

  if (!hasSession && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-display">
            Session Expired or Invalid
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            The password recovery link may have expired or already been used.
            Please request a new password reset link.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button className="w-full h-11 font-semibold">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-50 border border-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Set New Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Please enter your new password to regain access to your account.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold">Password Updated Successfully</h3>
            <p className="text-xs text-emerald-600">
              Redirecting you to the dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  disabled={loading}
                  className="w-full h-11 px-3.5 pr-10 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                required
                disabled={loading}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
