// Plugin-facing endpoint: validates a license key + device fingerprint
// Called from inside After Effects on every session start
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashDeviceId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { licenseKey, deviceRaw, deviceName, platform, aeVersion } = body as {
      licenseKey: string;
      deviceRaw:  string;   // raw hardware fingerprint from plugin
      deviceName?: string;
      platform?:  string;
      aeVersion?: string;
    };

    if (!licenseKey || !deviceRaw) {
      return NextResponse.json({ valid: false, error: "Missing fields" }, { status: 400 });
    }

    const deviceId = hashDeviceId(deviceRaw);

    const license = await prisma.license.findUnique({
      where:   { licenseKey },
      include: { devices: { where: { isActive: true } }, user: true },
    });

    if (!license) {
      return NextResponse.json({ valid: false, error: "Invalid license key" }, { status: 200 });
    }

    // Check license status
    if (license.status !== "ACTIVE") {
      return NextResponse.json({ valid: false, error: `License is ${license.status.toLowerCase()}` }, { status: 200 });
    }

    // Check expiry (paid licenses have expiry for updates, but still valid for use)
    // Trials hard-expire
    if (license.type === "TRIAL" && license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "Trial expired" }, { status: 200 });
    }

    const maxDevices = license.seatCount * 2;
    const existingDevice = license.devices.find((d) => d.deviceId === deviceId);

    if (existingDevice) {
      // Known device – update last seen
      await prisma.device.update({
        where: { id: existingDevice.id },
        data:  { lastSeenAt: new Date(), deviceName, platform, aeVersion },
      });
      return NextResponse.json({ valid: true, deviceLinked: true });
    }

    // New device – check capacity
    if (license.devices.length >= maxDevices) {
      return NextResponse.json({
        valid: false,
        error: `Device limit reached (${maxDevices}). Unlink a device from your dashboard first.`,
        unlinkUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      }, { status: 200 });
    }

    // Link new device
    await prisma.device.create({
      data: {
        userId:     license.userId,
        licenseId:  license.id,
        deviceId,
        deviceName: deviceName ?? null,
        platform:   platform ?? null,
        aeVersion:  aeVersion ?? null,
      },
    });

    return NextResponse.json({ valid: true, deviceLinked: true, newDevice: true });
  } catch (err) {
    console.error("[license/verify]", err);
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
