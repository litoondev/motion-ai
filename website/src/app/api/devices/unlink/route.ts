// User-facing: unlink a device from a license (from dashboard)
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { deviceId } = await req.json() as { deviceId: string };

  if (!deviceId) return NextResponse.json({ error: "Missing deviceId" }, { status: 400 });

  // Verify ownership: the device must belong to the current user
  const device = await prisma.device.findUnique({ where: { id: deviceId } });

  if (!device || device.userId !== session.user.id) {
    return NextResponse.json({ error: "Device not found" }, { status: 404 });
  }

  await prisma.device.update({
    where: { id: deviceId },
    data:  { isActive: false },
  });

  return NextResponse.json({ ok: true });
}
