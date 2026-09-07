import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { UserRole } from "@/types";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt?: string;
}

export class AuthService {
  static async login(email: string, pass: string): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return {
        id: "demo-admin-id",
        email,
        fullName: "Ranjith Kumar",
        role: "Admin",
        createdAt: new Date().toISOString(),
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error || !data.user) {
      console.error("Supabase login error:", error?.message);
      return null;
    }

    const user = data.user;
    let role: UserRole = "Admin";
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Ranjith Kumar";
    let avatarUrl = user.user_metadata?.avatar_url;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        role = (profile.role as UserRole) || role;
        fullName = profile.full_name || fullName;
        avatarUrl = profile.avatar_url || avatarUrl;
      }
    } catch (profileErr) {
      console.warn("Could not fetch profile, using auth metadata:", profileErr);
    }

    return {
      id: user.id,
      email: user.email || email,
      fullName,
      role,
      avatarUrl,
      createdAt: user.created_at,
    };
  }

  static async loginAsFounder(email: string = "admin@uxitech.in"): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return {
        id: "founder-admin-id",
        email,
        fullName: "Ranjith Kumar",
        role: "Admin",
        createdAt: new Date().toISOString(),
      };
    }

    const supabase = createClient();
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          fullName: profile.full_name || "Ranjith Kumar",
          role: (profile.role as UserRole) || "Admin",
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        };
      }
    } catch (err) {
      console.warn("Supabase loginAsFounder profile query failed:", err);
    }

    return {
      id: "founder-fallback-id",
      email,
      fullName: "Ranjith Kumar",
      role: "Admin",
      createdAt: new Date().toISOString(),
    };
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return {
        id: "demo-admin-id",
        email: "admin@uxitech.in",
        fullName: "Ranjith Kumar",
        role: "Admin",
        createdAt: new Date().toISOString(),
      };
    }

    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    let role: UserRole = "Admin";
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Ranjith Kumar";
    let avatarUrl = user.user_metadata?.avatar_url;

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile) {
        role = (profile.role as UserRole) || role;
        fullName = profile.full_name || fullName;
        avatarUrl = profile.avatar_url || avatarUrl;
      }
    } catch {
      // Graceful fallback
    }

    return {
      id: user.id,
      email: user.email || "",
      fullName,
      role,
      avatarUrl,
      createdAt: user.created_at,
    };
  }

  static async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
  }
}
