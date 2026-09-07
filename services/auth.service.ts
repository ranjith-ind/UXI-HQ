import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { AuthUser, Profile, UserRole } from "@/types";
import { FOUNDING_MEMBERS } from "@/lib/supabase/mock-data";

const DEMO_USER_COOKIE = "uxi_demo_user";

export class AuthService {
  private static setCookie(name: string, value: string, days: number = 7) {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${date.toUTCString()};path=/;SameSite=Lax`;
  }

  private static getCookie(name: string): string | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop()!.split(";").shift() || "");
    return null;
  }

  private static deleteCookie(name: string) {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;SameSite=Lax`;
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const isProduction = process.env.NODE_ENV === "production";

    if (!isSupabaseConfigured()) {
      if (isProduction) {
        return null;
      }
      const demoUserJson = this.getCookie(DEMO_USER_COOKIE);
      if (demoUserJson) {
        try {
          return JSON.parse(demoUserJson) as AuthUser;
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const supabase = createClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        return null;
      }

      // Fetch profile
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const profile = data as unknown as Profile | null;

      return {
        id: user.id,
        email: user.email || "",
        fullName: profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "UXI Member",
        role: (profile?.role as UserRole) || "Admin",
        avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || null,
      };
    } catch (err) {
      console.error("Failed to get current user:", err);
      return null;
    }
  }

  static async loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    const isProduction = process.env.NODE_ENV === "production";

    if (!isSupabaseConfigured()) {
      if (isProduction) {
        return { success: false, error: "Production Supabase configuration is missing. Contact site administrator." };
      }
      // Find matching founder or default to Ranjith
      const trimmedEmail = email.toLowerCase().trim();
      const matchedFounder = FOUNDING_MEMBERS.find((m) => m.email.toLowerCase() === trimmedEmail);
      
      const userToLogin: AuthUser = matchedFounder || {
        id: "demo-user-" + Date.now(),
        email: email,
        fullName: email.split("@")[0].toUpperCase(),
        role: "Admin",
        avatarUrl: null,
      };

      this.setCookie(DEMO_USER_COOKIE, JSON.stringify(userToLogin), 7);
      return { success: true, user: userToLogin };
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "No user found." };
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      const profile = profileData as unknown as Profile | null;

      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email || "",
        fullName: profile?.full_name || data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "UXI Member",
        role: (profile?.role as UserRole) || "Admin",
        avatarUrl: profile?.avatar_url || null,
      };

      return { success: true, user };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in. Please try again.";
      return { success: false, error: errorMessage };
    }
  }

  static async loginAsFounder(founderEmail: string): Promise<{ success: boolean; error?: string; user?: AuthUser }> {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "1-Click Founder access is disabled in production." };
    }
    const founder = FOUNDING_MEMBERS.find((m) => m.email.toLowerCase() === founderEmail.toLowerCase()) || FOUNDING_MEMBERS[0];
    this.setCookie(DEMO_USER_COOKIE, JSON.stringify(founder), 7);
    return { success: true, user: founder };
  }

  static async logout(): Promise<void> {
    this.deleteCookie(DEMO_USER_COOKIE);
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Sign out error:", err);
      }
    }
  }
}
