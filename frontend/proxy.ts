import { NextRequest, NextResponse } from "next/server";

type CookieUser = {
  role?: "user" | "admin";
};

function parseUser(value?: string) {
  if (!value) return null;

  try {
    return JSON.parse(decodeURIComponent(value)) as CookieUser;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The landing page is public for both guests and authenticated users.
  if (pathname === "/") {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  const user = parseUser(request.cookies.get("user_data")?.value);

  if (pathname === "/") {
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    if (user?.role === "admin") return NextResponse.redirect(new URL("/admin", request.url));
    return NextResponse.redirect(new URL("/dashboard/user", request.url));
  }

  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  if (!token && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname.startsWith("/admin") && user?.role !== "admin") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && pathname.startsWith("/dashboard") && user?.role !== "user") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/ResetPassword", "/admin/:path*", "/dashboard/:path*", "/profile/:path*"],
};
