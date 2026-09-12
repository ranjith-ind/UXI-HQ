import "server-only";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { UserRole } from "@/types/database.types";

export interface AuthenticatedUserContext {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
  supabase: Awaited<ReturnType<typeof createServerSupabase>>;
}

/**
 * Validates the caller's session using the server-side Supabase client.
 * Loads authoritative role and user info from the database (public.profiles).
 * Never trusts user ID or role supplied by the browser.
 */
export async function getAuthenticatedUserContext(): Promise<
  { success: true; context: AuthenticatedUserContext } | { success: false; status: number; error: string }
> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        status: 401,
        error: "Unauthorized: Active session required.",
      };
    }

    // Authoritatively query public.profiles using authenticated context (governed by RLS)
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("id", user.id)
      .single();

    const role: UserRole = (profile?.role as UserRole) || (user.user_metadata?.role as UserRole) || "Developer";
    const fullName: string = profile?.full_name || user.user_metadata?.full_name || user.email || "Team Member";

    return {
      success: true,
      context: {
        userId: user.id,
        email: user.email || "",
        fullName,
        role,
        supabase,
      },
    };
  } catch (err: any) {
    console.error("Auth context error:", err?.message || err);
    return {
      success: false,
      status: 500,
      error: "Authentication service error.",
    };
  }
}

/**
 * Verifies if the authenticated user has permission to read a project's credentials.
 * - Admin or Manager: Full access
 * - Developer: Restricted to projects where assigned in public.project_members
 * - Client: No access
 */
export async function canUserReadProject(
  context: AuthenticatedUserContext,
  projectId: string
): Promise<boolean> {
  if (context.role === "Admin" || context.role === "Manager") {
    return true;
  }

  if (context.role === "Developer") {
    // Query project_members junction
    const { data: membership } = await context.supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", context.userId)
      .limit(1);

    return !!(membership && membership.length > 0);
  }

  return false;
}

/**
 * Verifies if user can write (create, update, delete) credentials.
 * Only Admin and Manager roles are authorized to modify secrets.
 */
export function canUserManageCredentials(context: AuthenticatedUserContext): boolean {
  return context.role === "Admin" || context.role === "Manager";
}
