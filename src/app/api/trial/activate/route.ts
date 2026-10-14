// Activates a 7-day trial for a newly registered user
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/utils";

export async function POST(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Prevent re-use of trial
  if (user.trialUsed) {
    return NextResponse.json({ error: "Trial already used on this account" }, { status: 409 });
  }

  const now      = new Date();
  const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [, license] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data:  { trialUsed: true, trialStartedAt: now, trialEndsAt: trialEnd },
    }),
    prisma.license.create({
      data: {
        userId:      user.id,
        licenseKey:  generateLicenseKey(),
        type:        "TRIAL",
        status:      "ACTIVE",
        purchasedAt: now,
        expiresAt:   trialEnd,
        seatCount:   1,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, licenseKey: license.licenseKey });
}
