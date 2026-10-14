// Admin: approve or reject a bank-transfer payment + generate license if approved
// Admin: approve or reject a bank-transfer payment + generate license if approved
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLicenseKey } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { paymentId, action } = await req.json() as {
    paymentId: string;
    action:    "approve" | "reject";
  };

  if (!paymentId || !action) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment || payment.status !== "PENDING") {
    return NextResponse.json({ error: "Payment not found or already reviewed" }, { status: 404 });
  }

  if (action === "reject") {
    await prisma.payment.update({
      where: { id: paymentId },
      data:  { status: "REJECTED", reviewedAt: new Date(), reviewedBy: session.user.id },
    });
    return NextResponse.json({ ok: true });
  }

  // ── Approve: generate license + link to payment ───────────────────
  const now       = new Date();
  const expiresAt = new Date(now);
  expiresAt.setFullYear(expiresAt.getFullYear() + payment.yearCount);

  const updatedUntil = new Date(now);
  updatedUntil.setFullYear(updatedUntil.getFullYear() + 1); // 1 year updates

  const [, license] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data:  { status: "APPROVED", reviewedAt: now, reviewedBy: session.user.id },
    }),
    prisma.license.create({
      data: {
        userId:       payment.userId,
        licenseKey:   generateLicenseKey(),
        type:         "PAID",
        status:       "ACTIVE",
        purchasedAt:  now,
        expiresAt,
        updatedUntil,
        seatCount:    payment.seatCount,
      },
    }),
  ]);

  // Link license → payment
  await prisma.payment.update({
    where: { id: paymentId },
    data:  { licenseId: license.id },
  });

  return NextResponse.json({ ok: true, licenseKey: license.licenseKey });
}
