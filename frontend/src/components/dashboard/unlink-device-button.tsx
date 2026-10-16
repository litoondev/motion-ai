"use client";
import { useState } from "react";
import { Unlink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { unlinkDevice } from "@/app/actions/devices";

export function UnlinkDeviceButton({
  deviceId,
  deviceName,
}: {
  deviceId: number;
  deviceName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUnlink() {
    if (!confirm(`Unlink "${deviceName}"? You will need to re-enter your license key on that machine.`)) return;

    setLoading(true);
    try {
      const result = await unlinkDevice(deviceId);
      if (result.success) {
        toast.success("Device unlinked.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to unlink device.");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleUnlink} disabled={loading}
      className="text-[var(--color-error)] hover:text-[var(--color-error)] shrink-0">
      {loading
        ? <Loader2 className="h-4 w-4 animate-spin" />
        : <Unlink className="h-4 w-4" />}
      <span className="ml-1.5">Unlink</span>
    </Button>
  );
}
