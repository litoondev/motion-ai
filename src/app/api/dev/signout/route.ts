// DEV-ONLY: Clears the session cookie and redirects to login.
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/login", req.url));
  // Clear both cookie variants (secure and non-secure)
  response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" });
  response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" });
  return response;
}
