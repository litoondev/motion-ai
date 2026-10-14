import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { email, type, seatCount, yearCount } = await req.json() as {
    email: string;
    type: "PAID" | "TRIAL";
    seatCount: number;
    yearCount: number | null; // null = lifetime
  };

  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // Find or create the user
  const user = await prisma.user.upsert({
    where:  { email },
    create: { email, name: email.split("@")[0] },
    update: {},
  });

  const expiresAt = yearCount
    ? new Date(Date.now() + yearCount * 365.25 * 24 * 60 * 60 * 1000)
    : null;

  const license = await prisma.license.create({
    data: {
      userId:       user.id,
      licenseKey:   generateLicenseKey(),
      type,
      status:       "ACTIVE",
      seatCount:    seatCount ?? 1,
      expiresAt,
      updatedUntil: expiresAt,
    },
  });

  return NextResponse.json({ licenseKey: license.licenseKey, userId: user.id });
}
