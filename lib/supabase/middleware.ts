import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./client";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith("/login");
  const isPublicRoute = isAuthRoute || pathname.startsWith("/auth") || pathname === "/favicon.ico" || pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".");

  const isProduction = process.env.NODE_ENV === "production";

  // If Supabase is not configured:
  if (!isSupabaseConfigured()) {
    if (!isPublicRoute && pathname !== "/") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "config_missing");
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = Boolean(user);

  // Protect private routes
  if (!isAuthenticated && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in user away from /login
  if (isAuthenticated && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
