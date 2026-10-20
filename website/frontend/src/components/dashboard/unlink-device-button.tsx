"use client";
import { useState } from "react";
import { Loader2, Unlink } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user";
import { errorMessage } from "@/lib/api";

export function UnlinkDeviceButton({
  deviceId,
  deviceName,
  onUnlinked,
}: {
  deviceId: number;
  deviceName: string;
  onUnlinked: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleUnlink() {
    if (!confirm(`Unlink "${deviceName}"? You will need to re-enter your license key on that machine.`)) return;
    setLoading(true);
    try {
      await userService.unlinkDevice(deviceId);
      toast.success("Device unlinked.");
      onUnlinked();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to unlink device."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleUnlink} disabled={loading}
      className="text-[var(--color-error)] hover:text-[var(--color-error)] shrink-0">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlink className="h-4 w-4" />}
      <span className="ml-1.5">Unlink</span>
    </Button>
  );
}
