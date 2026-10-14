// DEV-ONLY: Creates a test user with a 1-year PAID license and logs them in.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/utils";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? "testuser@motionai.dev";

  // Find or create user
  const user = await prisma.user.upsert({
    where:  { email },
    create: { email, name: "Test User", role: "USER" },
    update: {},
  });

  // Create a 1-year paid license if they don't have one already
  const existing = await prisma.license.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });

  let license = existing;
  if (!license) {
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // +1 year
    license = await prisma.license.create({
      data: {
        userId:       user.id,
        licenseKey:   generateLicenseKey(),
        type:         "PAID",
        status:       "ACTIVE",
        seatCount:    1,
        expiresAt,
        updatedUntil: expiresAt,
      },
    });
  }

  // Create a NextAuth session and log the user in
  const token   = crypto.randomUUID();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: { sessionToken: token, userId: user.id, expires },
  });

  const response = NextResponse.redirect(new URL("/dashboard", req.url));
  response.cookies.set("next-auth.session-token", token, {
    expires,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return response;
}
