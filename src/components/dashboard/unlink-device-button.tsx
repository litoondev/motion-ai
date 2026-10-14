"use client";
import { useState } from "react";
import { Unlink, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function UnlinkDeviceButton({
  deviceId,
  deviceName,
}: {
  deviceId: string;
  deviceName: string;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleUnlink() {
    if (!confirm(`Unlink "${deviceName}"? You will need to re-enter your license key on that machine.`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/devices/unlink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Device unlinked.");
        router.refresh();
      } else {
        toast.error(data.error ?? "Failed to unlink device.");
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
