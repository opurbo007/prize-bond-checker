import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

// Define routes that don't require auth
const publicPaths = [
  "/login",
  "/register",
  "/api/auth/login",
  "/api/auth/register",
];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  const token = req.cookies.get("auth_token")?.value;

  // Allow public routes without token
  if (publicPaths.some((p) => path.startsWith(p))) {
    // If token exists, redirect away from login/register
    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
        url.pathname = "/";
        return NextResponse.redirect(url);
      } catch {
        // Invalid token, proceed to login
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require valid token
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/profile/:path*",
    "/cards/:path*",
    "/login",
    "/register",
  ],
};
