// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// const protectedPaths = ["/dashboard"];

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("auth.token")?.value;
//   const pathname = req.nextUrl.pathname;
//   const searchParams = req.nextUrl.searchParams;

//   const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

//   if (!token && isProtected) {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   if (token && pathname === "/" && !searchParams.has("force")) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/",
//     "/dashboard/:path*",
//   ],
// };

import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth.token")?.value;
  const url = req.nextUrl;
  const path = url.pathname;

  const protectedPaths = ["/dashboard", "/suppliers"];

  const isProtected = protectedPaths.some(p => path.startsWith(p));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (token && path === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/suppliers/:path*"],
};
