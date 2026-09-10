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

    // Safe Diagnostic (Phase 3): Log non-sensitive auth identity
    console.log("[UXI Auth Identity]", {
      userExists: !!user,
      userId: user?.id ?? null,
      userEmail: user?.email ?? null,
      authError: error?.message ?? null,
    });

    if (error || !user) {
      return null;
    }

    let role: UserRole = (user.user_metadata?.role as UserRole) || "Developer";
    let fullName = user.user_metadata?.full_name || user.user_metadata?.name || "Team Member";
    let avatarUrl = user.user_metadata?.avatar_url;

    try {
      // Phase 2: Inspect profile query
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      console.log("[UXI Profiles Request Diagnostic]", {
        requestedUserId: user.id,
        profileFound: !!profile,
        profileRole: profile?.role ?? null,
        profileError: profileErr?.message ?? null,
        profileCode: profileErr?.code ?? null,
      });

      if (profile) {
        role = (profile.role as UserRole) || role;
        fullName = profile.full_name || fullName;
        avatarUrl = profile.avatar_url || avatarUrl;
      }
    } catch (profileCatch) {
      console.warn("[UXI Profiles Exception]", profileCatch);
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
