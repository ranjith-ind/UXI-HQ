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
      return null;
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
    let role: UserRole = (user.user_metadata?.role as UserRole) || "Developer";
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Team Member";
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

  static async getCurrentUser(): Promise<AuthUser | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    let role: UserRole = (user.user_metadata?.role as UserRole) || "Developer";
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Team Member";
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
