// DEV-ONLY: Creates a trial user with a 7-day TRIAL license and logs them in.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/utils";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const email = req.nextUrl.searchParams.get("email") ?? "trial@motionai.dev";

  const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // +7 days

  const user = await prisma.user.upsert({
    where:  { email },
    create: {
      email,
      name:           "Trial User",
      role:           "USER",
      trialUsed:      true,
      trialStartedAt: new Date(),
      trialEndsAt,
    },
    update: {},
  });

  // Create trial license if none exists
  const existing = await prisma.license.findFirst({
    where: { userId: user.id },
  });

  if (!existing) {
    await prisma.license.create({
      data: {
        userId:     user.id,
        licenseKey: generateLicenseKey(),
        type:       "TRIAL",
        status:     "ACTIVE",
        seatCount:  1,
        expiresAt:  trialEndsAt,
      },
    });
  }

  // Create session
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
