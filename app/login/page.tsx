"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UxiLogo } from "@/components/brand/uxi-logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Users,
} from "lucide-react";
import { FOUNDING_MEMBERS } from "@/lib/supabase/mock-data";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsFounder, loading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSupabase] = useState(() => isSupabaseConfigured());

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please provide both email and password.");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Authentication failed. Check your credentials.");
      setLoading(false);
    }
  };

  const handleQuickFounderLogin = async (founderEmail: string) => {
    setLoading(true);
    setError(null);
    await loginAsFounder(founderEmail);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#F7F9FC] p-4 overflow-hidden select-none font-sans">
      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <UxiLogo size="xl" showText={false} className="mb-4" />
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] uppercase">
              UXI <span className="text-[#2451EB]">HQ</span>
            </h1>
          </div>
          <p className="text-xs text-[#5B6472] font-medium tracking-wide mt-1">
            Internal Business Operating System
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-xl border border-[#E6EAF2] bg-white p-6 sm:p-8">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E6EAF2]">
            <div>
              <h2 className="text-base font-bold text-[#0F172A] tracking-tight">
                Team Authentication
              </h2>
              <p className="text-xs text-[#5B6472] font-medium">
                Secure access for authorized UXI members
              </p>
            </div>
            <div className="p-2 rounded-lg bg-[#EFF4FE] text-[#2451EB]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-[#0F172A]"
              >
                Company Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@uxitech.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-[#8A93A3]" />}
                required
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-xs font-semibold text-[#0F172A]"
                >
                  Password
                </label>
                <span className="text-[11px] text-[#2451EB] font-semibold hover:underline cursor-pointer">
                  Need help?
                </span>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4 text-[#8A93A3]" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A93A3] hover:text-[#0F172A] transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Session */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-[#5B6472] cursor-pointer font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#E6EAF2] text-[#2451EB] focus:ring-[#2451EB]"
                />
                <span>Keep session active</span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full mt-2 font-bold group bg-[#2451EB] hover:bg-blue-700 text-white scalemorphic-button"
              isLoading={loading || authLoading}
            >
              <span>Sign in to UXI HQ</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          {/* Quick Founder Switcher */}
          <div className="mt-6 pt-5 border-t border-[#E6EAF2]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#2451EB]" />
                Founding Members Fast Access:
              </span>
              <span className="text-[10px] font-semibold text-[#2451EB] bg-[#EFF4FE] px-2 py-0.5 rounded-full border border-[#2451EB]/20">
                1-Click Login
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {FOUNDING_MEMBERS.map((founder) => (
                <button
                  key={founder.email}
                  type="button"
                  onClick={() => handleQuickFounderLogin(founder.email)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#F7F9FC] border border-[#E6EAF2] hover:border-[#2451EB] hover:bg-[#EFF4FE]/50 text-left transition-all group scalemorphic-card"
                >
                  <div className="w-6 h-6 rounded-full bg-[#2451EB] flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                    {founder.fullName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#0F172A] group-hover:text-[#2451EB] truncate">
                      {founder.fullName}
                    </p>
                    <p className="text-[10px] text-[#8A93A3] truncate font-medium">Founder</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <div className="mt-6 text-center text-xs text-[#8A93A3] flex items-center justify-center gap-2 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#2451EB]" />
          <span>UXI HQ OS v1.0 • Private & Confidential</span>
        </div>
      </div>
    </div>
  );
}
