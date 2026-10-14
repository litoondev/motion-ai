// DEV-ONLY: Creates a real session without needing OAuth or email SMTP.
// This route is disabled in production automatically.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? "litoondev1@gmail.com";

  // Find or create the user
  const user = await prisma.user.upsert({
    where:  { email },
    create: { email, name: "Dev User", role: email === process.env.ADMIN_EMAIL ? "ADMIN" : "USER" },
    update: {},
  });

  // Create a NextAuth database session
  const token   = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await prisma.session.create({
    data: { sessionToken: token, userId: user.id, expires },
  });

  // Set the session cookie and redirect to dashboard
  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("next-auth.session-token", token, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
