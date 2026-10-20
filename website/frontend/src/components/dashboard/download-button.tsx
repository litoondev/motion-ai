"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/user";
import { errorMessage } from "@/lib/api";

export function DownloadButton() {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      await userService.downloadPlugin();
    } catch (err) {
      toast.error(errorMessage(err, "Download failed."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="secondary" size="md" loading={loading} onClick={handleDownload}
      leftIcon={<Download className="h-4 w-4" />}>
      Download plugin
    </Button>
  );
}
