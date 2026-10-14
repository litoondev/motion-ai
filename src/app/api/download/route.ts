// Plugin download endpoint – only for users with an active license
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.redirect(new URL("/login?callbackUrl=/api/download", process.env.NEXT_PUBLIC_APP_URL!));
  }

  const license = await prisma.license.findFirst({
    where:   { userId: session.user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (!license) {
    return NextResponse.json({ error: "No active license found" }, { status: 403 });
  }

  // Use PLUGIN_DOWNLOAD_URL env var for the real release file.
  // Falls back to the placeholder zip in /public for dev.
  const downloadUrl = process.env.PLUGIN_DOWNLOAD_URL ?? "/motion-ai-plugin.zip";

  // If it's an external URL, redirect directly; otherwise resolve against app URL
  if (downloadUrl.startsWith("http://") || downloadUrl.startsWith("https://")) {
    return NextResponse.redirect(downloadUrl);
  }
  return NextResponse.redirect(new URL(downloadUrl, process.env.NEXT_PUBLIC_APP_URL!));
}
